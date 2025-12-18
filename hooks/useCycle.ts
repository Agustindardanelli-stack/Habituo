"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCycleStats,
  saveCycleLog,
  deleteCycleLog,
  type CycleLog,
  type CyclePrediction,
  type NewCycleLog,
} from "@/lib/api/cycle";

export function useCycle() {
  const [logs, setLogs] = useState<CycleLog[]>([]);
  const [prediction, setPrediction] = useState<CyclePrediction | null>(null);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getCycleStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cycleStats = await getCycleStats();
      setLogs(cycleStats.logs);
      setPrediction(cycleStats.prediction);
      setStats(cycleStats);
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

  const saveLog = async (log: NewCycleLog) => {
    const saved = await saveCycleLog(log);
    if (saved) {
      await fetchData();
      return true;
    }
    return false;
  };

  const deleteLog = async (date: string) => {
    const success = await deleteCycleLog(date);
    if (success) {
      await fetchData();
      return true;
    }
    return false;
  };

  const getLogForDate = (date: string): CycleLog | undefined => {
    return logs.find((l) => l.date === date);
  };

  return {
    logs,
    prediction,
    stats,
    loading,
    error,
    saveLog,
    deleteLog,
    getLogForDate,
    refresh: fetchData,
  };
}