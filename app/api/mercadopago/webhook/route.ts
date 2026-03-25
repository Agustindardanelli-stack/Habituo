import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PreApproval } from "mercadopago";
import { mp } from "@/lib/mercadopago";

// Cliente admin — bypasea RLS, solo en servidor
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // MP manda notificaciones de tipo "preapproval" para suscripciones
    if (body.type !== "preapproval") {
      return NextResponse.json({ received: true });
    }

    const subscriptionId = body.data?.id;
    if (!subscriptionId) {
      return NextResponse.json({ error: "Sin ID" }, { status: 400 });
    }

    // ── Obtener detalle completo de la suscripción ───────────────────
    const preApproval = new PreApproval(mp);
    const subscription = await preApproval.get({ id: subscriptionId });

    const userId = subscription.external_reference;
    if (!userId) {
      console.error("No hay external_reference en la suscripción:", subscriptionId);
      return NextResponse.json({ error: "Sin user ID" }, { status: 400 });
    }

    // ── Actualizar plan según el estado ─────────────────────────────
    switch (subscription.status) {

      // Suscripción activa → premium
      case "authorized": {
        await supabaseAdmin
          .from("profiles")
          .update({
            plan:                  "premium",
            mp_subscription_id:    subscription.id,
            updated_at:            new Date().toISOString(),
          })
          .eq("id", userId);

        console.log(`✓ Usuario ${userId} → premium`);
        break;
      }

      // Cancelada o pausada → free
      case "cancelled":
      case "paused": {
        await supabaseAdmin
          .from("profiles")
          .update({
            plan:               "free",
            mp_subscription_id: null,
            updated_at:         new Date().toISOString(),
          })
          .eq("id", userId);

        console.log(`✓ Usuario ${userId} → free (${subscription.status})`);
        break;
      }

      default:
        console.log(`Estado ignorado: ${subscription.status}`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook MP error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}