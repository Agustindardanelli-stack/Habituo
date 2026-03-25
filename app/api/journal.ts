import { createClient } from "@/lib/supabase";

export type JournalEntry = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood?: "amazing" | "good" | "neutral" | "bad" | "terrible";
  mood_score?: number;
  energy_level?: number;
  tags: string[];
  is_favorite: boolean;
  word_count: number;
  date: string;
  created_at: string;
  updated_at: string;
};

export type NewJournalEntry = {
  title?: string;
  content: string;
  mood?: JournalEntry["mood"];
  energy_level?: number;
  tags?: string[];
  is_favorite?: boolean;
  date?: string;
};

export type JournalPrompt = {
  id: string;
  text: string;
  category: "gratitude" | "reflection" | "goals" | "emotions" | "creativity" | "growth";
};

// Moods disponibles
export const MOODS = [
  { value: "amazing", label: "Increíble", icon: "🤩", color: "#10b981", score: 5 },
  { value: "good", label: "Bien", icon: "😊", color: "#22c55e", score: 4 },
  { value: "neutral", label: "Normal", icon: "😐", color: "#eab308", score: 3 },
  { value: "bad", label: "Mal", icon: "😔", color: "#f97316", score: 2 },
  { value: "terrible", label: "Muy mal", icon: "😢", color: "#ef4444", score: 1 },
];

// Niveles de energía
export const ENERGY_LEVELS = [
  { value: 1, label: "Muy baja", icon: "🔋", color: "#ef4444" },
  { value: 2, label: "Baja", icon: "🪫", color: "#f97316" },
  { value: 3, label: "Normal", icon: "⚡", color: "#eab308" },
  { value: 4, label: "Alta", icon: "⚡⚡", color: "#22c55e" },
  { value: 5, label: "Muy alta", icon: "🚀", color: "#10b981" },
];

// Prompts de escritura
export const JOURNAL_PROMPTS: JournalPrompt[] = [
  // Gratitud
  { id: "1", text: "¿Cuáles son 3 cosas por las que estás agradecido/a hoy?", category: "gratitude" },
  { id: "2", text: "¿Quién hizo algo amable por vos esta semana?", category: "gratitude" },
  { id: "3", text: "¿Qué pequeño momento te hizo sonreír hoy?", category: "gratitude" },
  // Reflexión
  { id: "4", text: "¿Qué aprendiste hoy que no sabías ayer?", category: "reflection" },
  { id: "5", text: "Si pudieras cambiar algo de hoy, ¿qué sería?", category: "reflection" },
  { id: "6", text: "¿Cómo te sentiste la mayor parte del día y por qué?", category: "reflection" },
  { id: "7", text: "¿Qué conversación te quedó resonando?", category: "reflection" },
  // Metas
  { id: "8", text: "¿Qué paso pequeño diste hoy hacia tus metas?", category: "goals" },
  { id: "9", text: "¿Cuál es tu prioridad número uno para mañana?", category: "goals" },
  { id: "10", text: "¿Qué hábito querés construir o eliminar?", category: "goals" },
  // Emociones
  { id: "11", text: "¿Qué emoción dominó tu día? ¿Por qué crees que fue así?", category: "emotions" },
  { id: "12", text: "¿Hubo algún momento donde te sentiste fuera de tu zona de confort?", category: "emotions" },
  { id: "13", text: "¿Qué te preocupa ahora mismo? Escribilo todo.", category: "emotions" },
  // Creatividad
  { id: "14", text: "Si hoy fuera un color, ¿cuál sería y por qué?", category: "creativity" },
  { id: "15", text: "Describí tu día como si fuera una escena de película.", category: "creativity" },
  { id: "16", text: "¿Qué harías si supieras que no podés fallar?", category: "creativity" },
  // Crecimiento
  { id: "17", text: "¿En qué área de tu vida sentís que estás creciendo?", category: "growth" },
  { id: "18", text: "¿Qué consejo le darías a tu yo de hace un año?", category: "growth" },
  { id: "19", text: "¿Qué creencia limitante estás listo/a para soltar?", category: "growth" },
  { id: "20", text: "¿Cómo sería tu versión ideal dentro de 6 meses?", category: "growth" },
];

export const PROMPT_CATEGORIES = [
  { value: "gratitude", label: "Gratitud", icon: "🙏", color: "#10b981" },
  { value: "reflection", label: "Reflexión", icon: "🪞", color: "#3b82f6" },
  { value: "goals", label: "Metas", icon: "🎯", color: "#8b5cf6" },
  { value: "emotions", label: "Emociones", icon: "💭", color: "#ec4899" },
  { value: "creativity", label: "Creatividad", icon: "🎨", color: "#f59e0b" },
  { value: "growth", label: "Crecimiento", icon: "🌱", color: "#06b6d4" },
];

// Tags sugeridos
export const SUGGESTED_TAGS = [
  "trabajo", "familia", "amigos", "salud", "ejercicio", "meditación",
  "aprendizaje", "logro", "reto", "gratitud", "ansiedad", "felicidad",
  "reflexión", "creatividad", "descanso", "viaje", "meta", "hábito"
];

// Obtener entradas del diario
export async function getJournalEntries(options?: {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  tag?: string;
  mood?: string;
  favorites?: boolean;
  search?: string;
}): Promise<JournalEntry[]> {
  const supabase = createClient();

  let query = supabase
    .from("journal_entries")
    .select("*")
    .order("date", { ascending: false });

  if (options?.startDate) {
    query = query.gte("date", options.startDate);
  }
  if (options?.endDate) {
    query = query.lte("date", options.endDate);
  }
  if (options?.tag) {
    query = query.contains("tags", [options.tag]);
  }
  if (options?.mood) {
    query = query.eq("mood", options.mood);
  }
  if (options?.favorites) {
    query = query.eq("is_favorite", true);
  }
  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching journal entries:", error);
    return [];
  }

  return data || [];
}

// Obtener una entrada específica
export async function getJournalEntry(id: string): Promise<JournalEntry | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching journal entry:", error);
    return null;
  }

  return data;
}

// Crear nueva entrada
// Crear nueva entrada
export async function createJournalEntry(entry: NewJournalEntry): Promise<JournalEntry | null> {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error("Error getting user:", userError);
    return null;
  }
  
  if (!user) {
    console.error("No user logged in");
    return null;
  }

  const wordCount = entry.content.trim().split(/\s+/).filter(Boolean).length;
  const moodScore = entry.mood ? MOODS.find(m => m.value === entry.mood)?.score : null;

  // Generar título automático si no hay
  const title = entry.title?.trim() || generateTitle(entry.content);

  const insertData = {
    user_id: user.id,
    title,
    content: entry.content,
    mood: entry.mood || null,
    mood_score: moodScore,
    energy_level: entry.energy_level || null,
    tags: entry.tags || [],
    is_favorite: entry.is_favorite || false,
    word_count: wordCount,
    date: entry.date || new Date().toISOString().split("T")[0],
  };

  console.log("Attempting to insert:", insertData);

  const { data, error } = await supabase
    .from("journal_entries")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Supabase error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error details:", error.details);
    return null;
  }

  console.log("Successfully inserted:", data);
  return data;
}

// Actualizar entrada
export async function updateJournalEntry(
  id: string,
  updates: Partial<NewJournalEntry>
): Promise<JournalEntry | null> {
  const supabase = createClient();

  const updateData: any = { ...updates, updated_at: new Date().toISOString() };

  if (updates.content) {
    updateData.word_count = updates.content.trim().split(/\s+/).filter(Boolean).length;
  }
  if (updates.mood) {
    updateData.mood_score = MOODS.find(m => m.value === updates.mood)?.score;
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating journal entry:", error);
    return null;
  }

  return data;
}

// Eliminar entrada
export async function deleteJournalEntry(id: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting journal entry:", error);
    return false;
  }

  return true;
}

// Toggle favorito
export async function toggleFavorite(id: string, isFavorite: boolean): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("journal_entries")
    .update({ is_favorite: isFavorite })
    .eq("id", id);

  if (error) {
    console.error("Error toggling favorite:", error);
    return false;
  }

  return true;
}

// Generar título automático
function generateTitle(content: string): string {
  const firstLine = content.split("\n")[0].trim();
  if (firstLine.length <= 50) return firstLine || "Sin título";
  return firstLine.substring(0, 47) + "...";
}

// Calcular racha de escritura
export function calculateWritingStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;

  const dates = [...new Set(entries.map(e => e.date))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Si no escribió hoy ni ayer, la racha es 0
  if (dates[0] !== today && dates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const current = new Date(dates[i - 1]);
    const prev = new Date(dates[i]);
    const diffDays = Math.floor((current.getTime() - prev.getTime()) / 86400000);

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Obtener estadísticas
export async function getJournalStats() {
  const entries = await getJournalEntries({ limit: 365 });

  const totalEntries = entries.length;
  const totalWords = entries.reduce((sum, e) => sum + e.word_count, 0);
  const avgWords = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;
  const streak = calculateWritingStreak(entries);

  // Entradas este mes
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const entriesThisMonth = entries.filter(
    e => new Date(e.date) >= thisMonth
  ).length;

  // Mood promedio (últimos 30 días)
  const last30Days = entries.slice(0, 30).filter(e => e.mood_score);
  const avgMood = last30Days.length > 0
    ? last30Days.reduce((sum, e) => sum + (e.mood_score || 0), 0) / last30Days.length
    : null;

  // Distribución de moods
  const moodDistribution: Record<string, number> = {};
  entries.forEach(e => {
    if (e.mood) {
      moodDistribution[e.mood] = (moodDistribution[e.mood] || 0) + 1;
    }
  });

  // Tags más usados
  const tagCount: Record<string, number> = {};
  entries.forEach(e => {
    (e.tags || []).forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  // Días con entradas (para calendario)
  const daysWithEntries = [...new Set(entries.map(e => e.date))];

  // Mejor racha
  let longestStreak = 0;
  let currentStreak = 1;
  const sortedDates = [...new Set(entries.map(e => e.date))].sort();
  
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = Math.floor(
      (new Date(sortedDates[i]).getTime() - new Date(sortedDates[i-1]).getTime()) / 86400000
    );
    if (diff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    totalEntries,
    totalWords,
    avgWords,
    streak,
    longestStreak,
    entriesThisMonth,
    avgMood,
    moodDistribution,
    topTags,
    daysWithEntries,
    entries,
  };
}

// Obtener prompt aleatorio
export function getRandomPrompt(category?: string): JournalPrompt {
  const prompts = category
    ? JOURNAL_PROMPTS.filter(p => p.category === category)
    : JOURNAL_PROMPTS;
  return prompts[Math.floor(Math.random() * prompts.length)];
}

// Análisis simple de sentimiento (keywords)
export function analyzeContent(content: string): {
  sentiment: "positive" | "neutral" | "negative";
  keywords: string[];
  suggestions: string[];
} {
  const text = content.toLowerCase();

  const positiveWords = ["feliz", "alegre", "bien", "genial", "increíble", "logré", "éxito", "amor", "gracias", "agradecido", "motivado", "emocionado", "contento", "paz", "tranquilo", "esperanza"];
  const negativeWords = ["triste", "mal", "frustrado", "enojado", "ansiedad", "miedo", "preocupado", "estresado", "cansado", "agotado", "solo", "perdido", "confundido", "dolor", "difícil"];

  const foundPositive = positiveWords.filter(w => text.includes(w));
  const foundNegative = negativeWords.filter(w => text.includes(w));

  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  if (foundPositive.length > foundNegative.length) sentiment = "positive";
  else if (foundNegative.length > foundPositive.length) sentiment = "negative";

  const suggestions: string[] = [];
  if (sentiment === "negative") {
    suggestions.push("Considerá hablar con alguien de confianza sobre cómo te sentís");
    suggestions.push("El ejercicio puede ayudar a mejorar el estado de ánimo");
    suggestions.push("Recordá que los momentos difíciles son temporales");
  } else if (sentiment === "positive") {
    suggestions.push("¡Genial! Seguí cultivando lo que te hace bien");
    suggestions.push("Compartí tu energía positiva con otros");
  }

  return {
    sentiment,
    keywords: [...foundPositive, ...foundNegative],
    suggestions,
  };
}