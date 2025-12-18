"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getJournalStats,
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  toggleFavorite,
  type JournalEntry,
  type NewJournalEntry,
} from "@/lib/api/journal";

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getJournalStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const journalStats = await getJournalStats();
      setEntries(journalStats.entries);
      setStats(journalStats);
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

  const addEntry = async (entry: NewJournalEntry) => {
    const newEntry = await createJournalEntry(entry);
    if (newEntry) {
      await fetchData();
      return newEntry;
    }
    return null;
  };

  const editEntry = async (id: string, updates: Partial<NewJournalEntry>) => {
    const updated = await updateJournalEntry(id, updates);
    if (updated) {
      await fetchData();
      return true;
    }
    return false;
  };

  const removeEntry = async (id: string) => {
    const success = await deleteJournalEntry(id);
    if (success) {
      await fetchData();
      return true;
    }
    return false;
  };

  const toggleEntryFavorite = async (id: string, isFavorite: boolean) => {
    // Optimistic update
    setEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, is_favorite: isFavorite } : e))
    );

    const success = await toggleFavorite(id, isFavorite);
    if (!success) {
      await fetchData(); // Revert on error
      return false;
    }
    return true;
  };

  const searchEntries = async (query: string) => {
    if (!query.trim()) {
      await fetchData();
      return;
    }
    const results = await getJournalEntries({ search: query, limit: 50 });
    setEntries(results);
  };

  const filterByMood = async (mood: string | null) => {
    if (!mood) {
      await fetchData();
      return;
    }
    const results = await getJournalEntries({ mood, limit: 50 });
    setEntries(results);
  };

  const filterByTag = async (tag: string | null) => {
    if (!tag) {
      await fetchData();
      return;
    }
    const results = await getJournalEntries({ tag, limit: 50 });
    setEntries(results);
  };

  return {
    entries,
    stats,
    loading,
    error,
    addEntry,
    editEntry,
    removeEntry,
    toggleEntryFavorite,
    searchEntries,
    filterByMood,
    filterByTag,
    refresh: fetchData,
  };
}