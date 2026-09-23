import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { PreApproval } from "mercadopago";
import { mp } from "@/lib/mercadopago";
import { createAdminSupabase } from "@/lib/supabase-server";

/**
 * Valida la firma `x-signature` que manda MercadoPago.
 * Docs: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 * Manifest: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` firmado con HMAC-SHA256.
 */
function isValidSignature(req: NextRequest, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    // En desarrollo se permite sin secret; en producción es obligatorio.
    if (process.env.NODE_ENV === "production") {
      console.error("MP_WEBHOOK_SECRET no configurado: rechazando webhook");
      return false;
    }
    console.warn("MP_WEBHOOK_SECRET no configurado: firma NO validada (solo dev)");
    return true;
  }

  const signature = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id");
  if (!signature || !requestId) return false;

  const parts = Object.fromEntries(
    signature.split(",").map((part) => {
      const [k, v] = part.split("=").map((s) => s.trim());
      return [k, v];
    })
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const type: string | undefined = body.type ?? body.topic;

    // Suscripciones: "subscription_preapproval" (webhooks) o "preapproval" (IPN legacy)
    if (type !== "subscription_preapproval" && type !== "preapproval") {
      return NextResponse.json({ received: true });
    }

    const subscriptionId: string | undefined =
      req.nextUrl.searchParams.get("data.id") ?? body.data?.id;
    if (!subscriptionId) {
      return NextResponse.json({ error: "Sin ID" }, { status: 400 });
    }

    if (!isValidSignature(req, String(subscriptionId))) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    // Nunca confiamos en el body: consultamos el estado real a la API de MP
    const subscription = await new PreApproval(mp).get({ id: String(subscriptionId) });

    const userId = subscription.external_reference;
    if (!userId) {
      console.error("Suscripción sin external_reference:", subscriptionId);
      return NextResponse.json({ error: "Sin user ID" }, { status: 400 });
    }

    const supabaseAdmin = createAdminSupabase();

    switch (subscription.status) {
      case "authorized": {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            plan: "premium",
            mp_subscription_id: subscription.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        if (error) throw error;
        console.log(`Usuario ${userId} → premium`);
        break;
      }

      case "cancelled":
      case "paused": {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            plan: "free",
            mp_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          // Solo bajar el plan si es la misma suscripción que tenemos guardada
          .eq("mp_subscription_id", subscription.id);
        if (error) throw error;
        console.log(`Usuario ${userId} → free (${subscription.status})`);
        break;
      }

      default:
        console.log(`Estado ignorado: ${subscription.status}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook MP error:", error);
    // 500 → MP reintenta la notificación
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
