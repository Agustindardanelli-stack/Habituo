"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getHabits,
  createHabit,
  toggleHabitCompletion,
  deleteHabit,
  getHabitStats,
  type HabitWithLogs,
  type NewHabit,
} from "@/lib/api/habits";

export function useHabits() {
  const [habits, setHabits] = useState<HabitWithLogs[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getHabitStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const habitStats = await getHabitStats();
      setHabits(habitStats.habits);
      setStats(habitStats);
    } catch (err) {
      setError("Error al cargar los datos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addHabit = async (habit: NewHabit) => {
    const newHabit = await createHabit(habit);
    if (newHabit) {
      await fetchData();
      return true;
    }
    return false;
  };

  const toggleHabit = async (habitId: string, completed: boolean) => {
    // Optimistic update
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? {
              ...h,
              completedToday: completed,
              streak: completed ? h.streak + 1 : Math.max(0, h.streak - 1),
            }
          : h
      )
    );

    const success = await toggleHabitCompletion(habitId, completed);
    if (!success) {
      // Revertir si falla
      await fetchData();
      return false;
    }

    // Actualizar stats
    setStats((prev) =>
      prev
        ? {
            ...prev,
            completedToday: completed
              ? prev.completedToday + 1
              : prev.completedToday - 1,
          }
        : null
    );

    return true;
  };

  const removeHabit = async (id: string) => {
    const success = await deleteHabit(id);
    if (success) {
      await fetchData();
      return true;
    }
    return false;
  };

  return {
    habits,
    stats,
    loading,
    error,
    addHabit,
    toggleHabit,
    removeHabit,
    refresh: fetchData,
  };
}