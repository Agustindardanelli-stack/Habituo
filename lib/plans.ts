// Fuente única de verdad para los planes y sus límites.
// IMPORTANTE: los mismos valores están aplicados en la base de datos
// (supabase/migrations/001_security_and_limits.sql). Si cambiás uno, cambiá el otro.

export type PlanType = "free" | "premium";

export const FREE_LIMITS = {
  habits: 3, //          hábitos activos
  transactions: 20, //   movimientos por mes
  journalEntries: 10, // entradas de diario por mes
  aiMessagesPerDay: 10,
} as const;

export const PREMIUM_LIMITS = {
  aiMessagesPerDay: 100, // tope de costos de la API de IA
} as const;

export type LimitedResource = "habits" | "transactions" | "journalEntries";

// Precio mensual (server-side). Configurable con MP_PLAN_PRICE.
export const PREMIUM_PRICE_ARS = Number(process.env.MP_PLAN_PRICE ?? 4999);

export function isOverLimit(
  plan: PlanType | null | undefined,
  resource: LimitedResource,
  currentCount: number
): boolean {
  if (plan === "premium") return false;
  return currentCount >= FREE_LIMITS[resource];
}
