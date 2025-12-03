"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  getTransactionStats,
  type Transaction,
  type NewTransaction,
} from "@/lib/api/transactions";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getTransactionStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [txns, txnStats] = await Promise.all([
        getTransactions({ limit: 50 }),
        getTransactionStats("month"),
      ]);
      
      setTransactions(txns);
      setStats(txnStats);
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

  const addTransaction = async (transaction: NewTransaction) => {
    const newTxn = await createTransaction(transaction);
    if (newTxn) {
      await fetchData(); // Recargar datos
      return true;
    }
    return false;
  };

  const removeTransaction = async (id: string) => {
    const success = await deleteTransaction(id);
    if (success) {
      await fetchData(); // Recargar datos
      return true;
    }
    return false;
  };

  return {
    transactions,
    stats,
    loading,
    error,
    addTransaction,
    removeTransaction,
    refresh: fetchData,
  };
}