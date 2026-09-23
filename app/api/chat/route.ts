import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createServerSupabase } from "@/lib/supabase-server";
import { FREE_LIMITS, PREMIUM_LIMITS } from "@/lib/plans";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

type TxRow = { description: string; amount: number; category_name: string; transaction_type: string; date: string };
type HabitRow = { name: string; icon: string; frequency: string; is_active: boolean };
type HabitLogRow = { habit_id: string; date: string };
type JournalRow = { title: string; mood: string | null; mood_score: number | null; tags: string[]; date: string; word_count: number };
type ProfileRow = { full_name: string | null; plan: string | null; timezone: string | null; currency: string | null };

async function buildUserContext(supabase: ReturnType<typeof createServerSupabase>, userId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const today = now.toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0];

  const [profileRes, transactionsRes, habitsRes, habitLogsRes, journalRes] =
    await Promise.all([
      supabase.from("profiles").select("full_name, plan, timezone, currency").eq("id", userId).single(),
      supabase
        .from("transactions")
        .select("description, amount, category_name, transaction_type, date")
        .gte("date", monthStart)
        .order("date", { ascending: false })
        .limit(20),
      supabase.from("habits").select("name, icon, frequency, is_active").eq("is_active", true),
      supabase
        .from("habit_logs")
        .select("habit_id, date")
        .gte("date", thirtyDaysAgo),
      supabase
        .from("journal_entries")
        .select("title, mood, mood_score, tags, date, word_count")
        .order("date", { ascending: false })
        .limit(5),
    ]);

  const profile = profileRes.data as ProfileRow | null;
  const transactions = (transactionsRes.data ?? []) as TxRow[];
  const habits = (habitsRes.data ?? []) as HabitRow[];
  const habitLogs = (habitLogsRes.data ?? []) as HabitLogRow[];
  const journalEntries = (journalRes.data ?? []) as JournalRow[];

  // Finance summary
  const expenses = transactions.filter((t) => t.transaction_type === "expense");
  const income = transactions.filter((t) => t.transaction_type === "income");
  const totalExpenses = expenses.reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const byCategory = expenses.reduce((acc, t) => {
    acc[t.category_name] = (acc[t.category_name] || 0) + Math.abs(t.amount);
    return acc;
  }, {} as Record<string, number>);
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  // Habits summary
  const habitsCompletedToday = habitLogs.filter((l) => l.date === today).length;
  const totalHabits = habits.length;

  // Journal summary
  const recentMoods = journalEntries.map((e) => e.mood).filter(Boolean);
  const lastMood = recentMoods[0] ?? null;

  const lines: string[] = [
    `Nombre del usuario: ${profile?.full_name || "Usuario"}`,
    `Plan: ${profile?.plan || "free"}`,
    `Moneda: ${profile?.currency || "ARS"}`,
    "",
    "=== FINANZAS (este mes) ===",
    `Gastos totales: $${totalExpenses.toLocaleString("es-AR")}`,
    `Ingresos: $${totalIncome.toLocaleString("es-AR")}`,
    `Balance: $${(totalIncome - totalExpenses).toLocaleString("es-AR")}`,
    `Transacciones: ${transactions.length}`,
    topCategory ? `Categoría con más gasto: ${topCategory[0]} ($${topCategory[1].toLocaleString("es-AR")})` : "",
    "",
    "=== HÁBITOS ===",
    `Hábitos activos: ${totalHabits}`,
    totalHabits > 0 ? `Nombres: ${habits.map((h) => `${h.icon} ${h.name}`).join(", ")}` : "",
    `Completados hoy: ${habitsCompletedToday} de ${totalHabits}`,
    "",
    "=== DIARIO ===",
    `Últimas entradas: ${journalEntries.length}`,
    lastMood ? `Último estado de ánimo: ${lastMood}` : "Sin estados de ánimo registrados",
    journalEntries.length > 0
      ? `Tags recientes: ${[...new Set(journalEntries.flatMap((e) => e.tags || []))].slice(0, 5).join(", ")}`
      : "",
  ];

  return lines.filter(Boolean).join("\n");
}

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message || typeof message !== "string" || message.length > 2000) {
      return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
    }

    // Límite diario de mensajes (se valida y descuenta en la base de datos)
    const { data: allowed, error: usageError } = await supabase.rpc("consume_ai_message");
    if (usageError) {
      console.error("Error consumiendo cuota de IA:", usageError);
      return NextResponse.json({ error: "Error al procesar el mensaje" }, { status: 500 });
    }
    if (!allowed) {
      return NextResponse.json(
        {
          error: `Llegaste al límite diario del coach IA (${FREE_LIMITS.aiMessagesPerDay} mensajes en Free, ${PREMIUM_LIMITS.aiMessagesPerDay} en Premium). Volvé mañana o pasate a Premium.`,
          code: "AI_LIMIT_REACHED",
        },
        { status: 429 }
      );
    }

    const userContext = await buildUserContext(supabase, user.id);

    const prompt = `Sos un coach de vida IA integrado en Habituo, una app personal de bienestar para usuarios hispanohablantes (Argentina/LATAM). Tu rol es ayudar al usuario con sus finanzas personales, sus hábitos y su diario personal.

DATOS ACTUALES DEL USUARIO:
${userContext}

INSTRUCCIONES:
- Respondé siempre en español rioplatense (vos, tenés, etc.)
- Sé empático, motivador y práctico
- Usá los datos del usuario para dar consejos personalizados y específicos
- Si el usuario pregunta sobre algo sin datos (por ejemplo, no registró gastos este mes), sugerile que lo registre en la sección correspondiente
- Mantené respuestas concisas (máximo 3-4 párrafos) a menos que se pida más detalle
- No inventes datos ni hagas suposiciones no respaldadas por el contexto
- Si el usuario tiene un balance negativo en finanzas, sé cuidadoso y empático al mencionarlo
- Usá emojis con moderación para hacer la conversación más amigable

Pregunta del usuario: ${message}`;

    const MODELS = (process.env.GEMINI_MODELS ?? "gemini-2.5-flash,gemini-2.5-flash-lite")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    function isTransient(err: unknown): boolean {
      if (typeof err !== "object" || err === null) return false;
      const e = err as Record<string, unknown>;
      // SDK exposes HTTP status directly on the error object
      const httpStatus = typeof e.status === "number" ? e.status : null;
      // SDK also nests the Google API error under e.error.code
      const apiCode = typeof (e.error as Record<string, unknown>)?.code === "number"
        ? (e.error as Record<string, unknown>).code as number
        : null;
      const check = (n: number | null) => n === 503 || n === 429 || n === 500;
      return check(httpStatus) || check(apiCode);
    }

    let lastError: unknown;
    for (const model of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        return NextResponse.json({ response: response.text });
      } catch (err: unknown) {
        if (isTransient(err)) {
          lastError = err;
          continue;
        }
        throw err;
      }
    }

    console.error("All Gemini models unavailable:", lastError);
    return NextResponse.json(
      { error: "El servicio de IA está con alta demanda ahora. Intentá en unos segundos." },
      { status: 503 }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Error al procesar el mensaje" }, { status: 500 });
  }
}
