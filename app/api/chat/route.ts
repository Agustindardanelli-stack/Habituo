import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

type TxRow = { description: string; amount: number; category_name: string; transaction_type: string; date: string };
type HabitRow = { name: string; icon: string; frequency: string; is_active: boolean };
type HabitLogRow = { habit_id: string; date: string };
type JournalRow = { title: string; mood: string | null; mood_score: number | null; tags: string[]; date: string; word_count: number };
type CycleRow = { date: string; flow_intensity: string | null; mood: string | null; symptoms: string[]; energy_level: number | null };
type ProfileRow = { full_name: string | null; plan: string | null; timezone: string | null; currency: string | null };

async function buildUserContext(supabase: ReturnType<typeof createServerClient>, userId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const today = now.toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0];

  const [profileRes, transactionsRes, habitsRes, habitLogsRes, journalRes, cycleRes] =
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
      supabase
        .from("cycle_logs")
        .select("date, flow_intensity, mood, symptoms, energy_level")
        .gte("date", thirtyDaysAgo)
        .order("date", { ascending: false })
        .limit(10),
    ]);

  const profile = profileRes.data as ProfileRow | null;
  const transactions = (transactionsRes.data ?? []) as TxRow[];
  const habits = (habitsRes.data ?? []) as HabitRow[];
  const habitLogs = (habitLogsRes.data ?? []) as HabitLogRow[];
  const journalEntries = (journalRes.data ?? []) as JournalRow[];
  const cycleLogs = (cycleRes.data ?? []) as CycleRow[];

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

  // Cycle summary
  const lastCycleLog = cycleLogs[0] ?? null;
  const periodLogs = cycleLogs.filter((l) => l.flow_intensity);

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
    "",
    "=== CICLO / SALUD ===",
    periodLogs.length > 0
      ? `Días con período registrado (últimos 30 días): ${periodLogs.length}`
      : "Sin registros de período recientes",
    lastCycleLog
      ? `Último registro: ${lastCycleLog.date}, estado de ánimo: ${lastCycleLog.mood || "no registrado"}, energía: ${lastCycleLog.energy_level || "no registrada"}`
      : "Sin registros de ciclo recientes",
  ];

  return lines.filter(Boolean).join("\n");
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set(name, value, options as any);
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set(name, "", options as any);
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message || typeof message !== "string" || message.length > 2000) {
      return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
    }

    const userContext = await buildUserContext(supabase, user.id);

    const prompt = `Sos un coach de vida IA integrado en LifeSync, una app personal de bienestar para usuarios hispanohablantes (Argentina/LATAM). Tu rol es ayudar al usuario con sus finanzas personales, hábitos, ciclo menstrual y bienestar emocional.

DATOS ACTUALES DEL USUARIO:
${userContext}

INSTRUCCIONES:
- Respondé siempre en español rioplatense (vos, tenés, etc.)
- Sé empático, motivador y práctico
- Usá los datos del usuario para dar consejos personalizados y específicos
- Si el usuario pregunta sobre algo sin datos (por ejemplo, no tiene ciclo registrado), sugerile que lo registre en la sección correspondiente
- Mantené respuestas concisas (máximo 3-4 párrafos) a menos que se pida más detalle
- No inventes datos ni hagas suposiciones no respaldadas por el contexto
- Si el usuario tiene un balance negativo en finanzas, sé cuidadoso y empático al mencionarlo
- Usá emojis con moderación para hacer la conversación más amigable

Pregunta del usuario: ${message}`;

    const MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];

    let lastError: unknown;
    for (const model of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        return NextResponse.json({ response: response.text });
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;
        if (status === 503 || status === 429) {
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
