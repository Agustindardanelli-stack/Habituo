import MercadoPagoConfig from "mercadopago";

export const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

// ── Planes ──────────────────────────────────────────────────────────
export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    limits: {
      habits:        3,
      transactions:  20,  // por mes
      journalEntries: 10, // por mes
    },
  },
  premium: {
    name: "Premium",
    priceARS: 4999,                              // en pesos — ajustá según tu precio
    mpPlanId: process.env.MP_PLAN_ID!,           // ID del plan de suscripción en MP
    limits: {
      habits:        Infinity,
      transactions:  Infinity,
      journalEntries: Infinity,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

// ── Chequear si el usuario pasó el límite ────────────────────────────
export function isOverLimit(
  plan: PlanType,
  resource: keyof typeof PLANS.free.limits,
  currentCount: number
): boolean {
  const limit = PLANS[plan].limits[resource];
  return currentCount >= limit;
}