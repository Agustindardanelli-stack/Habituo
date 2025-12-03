"use client";

import { useState } from "react";
import {
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Search,
  ChevronDown,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { CATEGORIES, type NewTransaction } from "@/lib/api/transactions";
import { toast } from "sonner";

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Alimentación: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Transporte: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Entretenimiento: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Salud: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    Servicios: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    Hogar: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    Ropa: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    Educación: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    Otros: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  };
  return colors[category] || colors.Otros;
};

const getCategoryBarColor = (category: string) => {
  const colors: Record<string, string> = {
    Alimentación: "bg-emerald-500",
    Transporte: "bg-blue-500",
    Entretenimiento: "bg-purple-500",
    Salud: "bg-pink-500",
    Servicios: "bg-yellow-500",
    Hogar: "bg-orange-500",
    Ropa: "bg-indigo-500",
    Educación: "bg-cyan-500",
    Otros: "bg-gray-500",
  };
  return colors[category] || colors.Otros;
};

export default function FinanzasPage() {
  const { transactions, stats, loading, addTransaction, removeTransaction } = useTransactions();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<NewTransaction>({
    description: "",
    amount: 0,
    category_name: "",
    date: new Date().toISOString().split("T")[0],
  });

  const filteredTransactions = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      toast.error("Completá todos los campos");
      return;
    }

    setIsSubmitting(true);
    const success = await addTransaction({
      ...formData,
      amount: Math.abs(formData.amount), // Siempre positivo, el tipo define si es gasto
    });

    if (success) {
      toast.success("Gasto agregado correctamente");
      setShowAddModal(false);
      setFormData({
        description: "",
        amount: 0,
        category_name: "",
        date: new Date().toISOString().split("T")[0],
      });
    } else {
      toast.error("Error al agregar el gasto");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar este gasto?")) return;
    
    const success = await removeTransaction(id);
    if (success) {
      toast.success("Gasto eliminado");
    } else {
      toast.error("Error al eliminar");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-finanzas/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-finanzas" />
            </div>
            Finanzas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona tus gastos con IA
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-finanzas hover:bg-finanzas-dark text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Agregar gasto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total gastado</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            ${stats?.totalExpenses.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-400 mt-2">Este mes</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Transacciones</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {stats?.transactionCount || 0}
          </p>
          <p className="text-sm text-gray-400 mt-2">Este mes</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Promedio</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            ${Math.round(stats?.averageExpense || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-400 mt-2">Por gasto</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Categorías</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {stats?.categoryStats.length || 0}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Mayor: {stats?.categoryStats[0]?.name || "-"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Transactions List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar transacciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-finanzas/50 focus:border-finanzas outline-none"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <Wallet className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "No se encontraron transacciones" : "No hay gastos registrados"}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-finanzas hover:underline font-medium"
              >
                Agregar tu primer gasto
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(
                          transaction.category_name
                        )}`}
                      >
                        {transaction.category_name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(transaction.date).toLocaleDateString("es-AR")}
                      </span>
                      {transaction.category_confidence && (
                        <span className="text-xs text-gray-400">
                          🤖 {Math.round(transaction.category_confidence * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${Math.abs(transaction.amount).toLocaleString()}
                    </p>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-6">
            Por categoría
          </h3>

          {stats?.categoryStats.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              Sin datos todavía
            </p>
          ) : (
            <div className="space-y-4">
              {stats?.categoryStats.map((cat, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {cat.icon} {cat.name}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${cat.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getCategoryBarColor(cat.name)} rounded-full transition-all duration-500`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Total</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ${stats?.totalExpenses.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 animate-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Agregar gasto
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  placeholder="Ej: Supermercado Carrefour"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-finanzas/50 focus:border-finanzas outline-none"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  🤖 La IA categorizará automáticamente si no elegís categoría
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monto ($)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.amount || ""}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-finanzas/50 focus:border-finanzas outline-none"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoría (opcional)
                </label>
                <select
                  value={formData.category_name}
                  onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-finanzas/50 focus:border-finanzas outline-none"
                >
                  <option value="">🤖 Auto-detectar</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-finanzas/50 focus:border-finanzas outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-finanzas hover:bg-finanzas-dark disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
