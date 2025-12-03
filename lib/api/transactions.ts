import { createClient } from "@/lib/supabase";

export type Transaction = {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category_name: string;
  category_confidence?: number;
  transaction_type: "expense" | "income";
  date: string;
  notes?: string;
  created_at: string;
};

export type NewTransaction = {
  description: string;
  amount: number;
  category_name?: string;
  transaction_type?: "expense" | "income";
  date?: string;
  notes?: string;
};

// Categorías disponibles
export const CATEGORIES = [
  { name: "Alimentación", icon: "🍽️", color: "#10b981" },
  { name: "Transporte", icon: "🚗", color: "#3b82f6" },
  { name: "Servicios", icon: "⚡", color: "#eab308" },
  { name: "Entretenimiento", icon: "🎬", color: "#8b5cf6" },
  { name: "Salud", icon: "🏥", color: "#ec4899" },
  { name: "Ropa", icon: "👔", color: "#6366f1" },
  { name: "Hogar", icon: "🏠", color: "#f97316" },
  { name: "Educación", icon: "📚", color: "#06b6d4" },
  { name: "Otros", icon: "📦", color: "#6b7280" },
];

// Categorización simple con palabras clave
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Alimentación: ["super", "mercado", "carrefour", "coto", "dia", "restaurant", "comida", "almuerzo", "cena", "cafe", "pizza", "burger", "pollo", "carne", "verdura", "fruta", "panaderia", "kiosko"],
  Transporte: ["uber", "cabify", "taxi", "nafta", "combustible", "ypf", "shell", "axion", "sube", "subte", "colectivo", "tren", "estacionamiento", "peaje"],
  Servicios: ["luz", "gas", "agua", "internet", "telefono", "celular", "movistar", "claro", "personal", "edenor", "edesur", "metrogas", "aysa"],
  Entretenimiento: ["netflix", "spotify", "disney", "hbo", "amazon", "cine", "teatro", "juego", "steam", "playstation", "xbox", "concierto", "recital"],
  Salud: ["farmacia", "farmacity", "medico", "doctor", "hospital", "clinica", "medicamento", "remedio", "obra social", "prepaga"],
  Ropa: ["zara", "h&m", "nike", "adidas", "ropa", "zapatilla", "camisa", "pantalon", "remera", "campera"],
  Hogar: ["mueble", "ikea", "sodimac", "easy", "limpieza", "electrodomestico", "decoracion"],
  Educación: ["curso", "libro", "udemy", "coursera", "universidad", "colegio", "escuela", "capacitacion"],
};

// Función para categorizar automáticamente
export function categorizeTransaction(description: string): { category: string; confidence: number } {
  const descLower = description.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (descLower.includes(keyword)) {
        return { category, confidence: 0.85 };
      }
    }
  }
  
  return { category: "Otros", confidence: 0.5 };
}

// Obtener todas las transacciones del usuario
export async function getTransactions(filters?: {
  startDate?: string;
  endDate?: string;
  category?: string;
  limit?: number;
}): Promise<Transaction[]> {
  const supabase = createClient();
  
  let query = supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (filters?.startDate) {
    query = query.gte("date", filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte("date", filters.endDate);
  }
  if (filters?.category) {
    query = query.eq("category_name", filters.category);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return data || [];
}

// Crear nueva transacción
export async function createTransaction(transaction: NewTransaction): Promise<Transaction | null> {
  const supabase = createClient();
  
  // Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Categorizar si no tiene categoría
  let categoryName = transaction.category_name;
  let categoryConfidence = 1;
  
  if (!categoryName) {
    const result = categorizeTransaction(transaction.description);
    categoryName = result.category;
    categoryConfidence = result.confidence;
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      description: transaction.description,
      amount: transaction.amount,
      category_name: categoryName,
      category_confidence: categoryConfidence,
      transaction_type: transaction.transaction_type || "expense",
      date: transaction.date || new Date().toISOString().split("T")[0],
      notes: transaction.notes,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating transaction:", error);
    return null;
  }

  return data;
}

// Actualizar transacción
export async function updateTransaction(id: string, updates: Partial<NewTransaction>): Promise<Transaction | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating transaction:", error);
    return null;
  }

  return data;
}

// Eliminar transacción
export async function deleteTransaction(id: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting transaction:", error);
    return false;
  }

  return true;
}

// Obtener estadísticas
export async function getTransactionStats(period: "week" | "month" | "year" = "month") {
  const supabase = createClient();
  
  const now = new Date();
  let startDate: string;
  
  switch (period) {
    case "week":
      startDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split("T")[0];
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
      break;
  }

  const transactions = await getTransactions({ startDate });
  
  const totalExpenses = transactions
    .filter(t => t.transaction_type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalIncome = transactions
    .filter(t => t.transaction_type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  // Agrupar por categoría
  const byCategory = transactions
    .filter(t => t.transaction_type === "expense")
    .reduce((acc, t) => {
      const cat = t.category_name || "Otros";
      acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const categoryStats = Object.entries(byCategory)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      ...CATEGORIES.find(c => c.name === name),
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalExpenses,
    totalIncome,
    balance: totalIncome - totalExpenses,
    transactionCount: transactions.length,
    categoryStats,
    averageExpense: transactions.length > 0 ? totalExpenses / transactions.filter(t => t.transaction_type === "expense").length : 0,
  };
}