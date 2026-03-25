import { createClient } from "@/lib/supabase";

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  frequency: "daily" | "weekdays" | "weekends" | "weekly" | "custom";
  custom_days?: number[];
  reminder_time?: string;
  reminder_enabled: boolean;
  target_count: number;
  is_active: boolean;
  created_at: string;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  count: number;
  notes?: string;
  completed_at: string;
};

export type HabitWithLogs = Habit & {
  logs: HabitLog[];
  streak: number;
  completedToday: boolean;
  weekHistory: boolean[];
};

export type NewHabit = {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  frequency?: "daily" | "weekdays" | "weekends" | "weekly" | "custom";
  reminder_time?: string;
  reminder_enabled?: boolean;
};

// Iconos y colores disponibles
export const HABIT_ICONS = ["🏃", "📚", "🧘", "💧", "😴", "💪", "🎯", "✍️", "🥗", "🚭", "📵", "🌅"];
export const HABIT_COLORS = [
  { name: "Verde", value: "#10b981" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Violeta", value: "#8b5cf6" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Naranja", value: "#f97316" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Amarillo", value: "#eab308" },
  { name: "Rojo", value: "#ef4444" },
];

// Calcular racha
function calculateStreak(logs: HabitLog[]): number {
  if (logs.length === 0) return 0;

  const sortedDates = [...new Set(logs.map((l) => l.date))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Si no completó hoy ni ayer, la racha es 0
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i - 1]);
    const prev = new Date(sortedDates[i]);
    const diffDays = Math.floor((current.getTime() - prev.getTime()) / 86400000);

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Obtener historial de la semana
function getWeekHistory(logs: HabitLog[]): boolean[] {
  const history: boolean[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    history.push(logs.some((l) => l.date === dateStr));
  }

  return history;
}

// Obtener todos los hábitos con sus logs
export async function getHabits(): Promise<HabitWithLogs[]> {
  const supabase = createClient();

  // Obtener hábitos
  const { data: habits, error: habitsError } = await supabase
    .from("habits")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (habitsError || !habits) {
    console.error("Error fetching habits:", habitsError);
    return [];
  }

  // Obtener logs de los últimos 30 días
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const { data: logs, error: logsError } = await supabase
    .from("habit_logs")
    .select("*")
    .gte("date", thirtyDaysAgo);

  if (logsError) {
    console.error("Error fetching habit logs:", logsError);
  }

  const today = new Date().toISOString().split("T")[0];

  // Combinar hábitos con sus logs
  return habits.map((habit) => {
    const habitLogs = (logs || []).filter((l) => l.habit_id === habit.id);
    return {
      ...habit,
      logs: habitLogs,
      streak: calculateStreak(habitLogs),
      completedToday: habitLogs.some((l) => l.date === today),
      weekHistory: getWeekHistory(habitLogs),
    };
  });
}

// Crear nuevo hábito
export async function createHabit(habit: NewHabit): Promise<Habit | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("habits")
    .insert({
      user_id: user.id,
      name: habit.name,
      description: habit.description,
      icon: habit.icon || "🎯",
      color: habit.color || "#8b5cf6",
      frequency: habit.frequency || "daily",
      reminder_time: habit.reminder_time,
      reminder_enabled: habit.reminder_enabled || false,
      target_count: 1,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating habit:", error);
    return null;
  }

  return data;
}

// Marcar hábito como completado/no completado
export async function toggleHabitCompletion(habitId: string, completed: boolean): Promise<boolean> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const today = new Date().toISOString().split("T")[0];

  if (completed) {
    // Agregar log
    const { error } = await supabase.from("habit_logs").insert({
      habit_id: habitId,
      user_id: user.id,
      date: today,
      count: 1,
    });

    if (error) {
      // Si ya existe, no es error
      if (error.code !== "23505") {
        console.error("Error completing habit:", error);
        return false;
      }
    }
  } else {
    // Eliminar log de hoy
    const { error } = await supabase
      .from("habit_logs")
      .delete()
      .eq("habit_id", habitId)
      .eq("date", today);

    if (error) {
      console.error("Error uncompleting habit:", error);
      return false;
    }
  }

  return true;
}

// Eliminar hábito
export async function deleteHabit(id: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("habits")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    console.error("Error deleting habit:", error);
    return false;
  }

  return true;
}

// Obtener estadísticas
export async function getHabitStats() {
  const habits = await getHabits();

  const completedToday = habits.filter((h) => h.completedToday).length;
  const totalHabits = habits.length;
  const longestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0;

  // Calcular porcentaje de la semana
  const weekTotal = habits.reduce((acc, h) => acc + h.weekHistory.filter(Boolean).length, 0);
  const weekPossible = habits.length * 7;
  const weekPercentage = weekPossible > 0 ? Math.round((weekTotal / weekPossible) * 100) : 0;

  return {
    completedToday,
    totalHabits,
    longestStreak,
    weekPercentage,
    habits,
  };
}