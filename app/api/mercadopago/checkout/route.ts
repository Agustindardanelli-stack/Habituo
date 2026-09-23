import { NextResponse } from "next/server";
import { PreApproval } from "mercadopago";
import { mp } from "@/lib/mercadopago";
import { PREMIUM_PRICE_ARS } from "@/lib/plans";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST() {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (profile?.plan === "premium") {
      return NextResponse.json({ error: "Ya tenés Premium" }, { status: 400 });
    }

    // Suscripción mensual en MercadoPago. El plan se activa recién cuando
    // llega el webhook con status "authorized" (nunca desde el cliente).
    const subscription = await new PreApproval(mp).create({
      body: {
        reason: "Habituo Premium",
        payer_email: user.email!,
        back_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
        external_reference: user.id,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: PREMIUM_PRICE_ARS,
          currency_id: "ARS",
        },
        status: "pending",
      },
    });

    return NextResponse.json({ url: subscription.init_point });
  } catch (error) {
    console.error("MercadoPago checkout error:", error);
    return NextResponse.json({ error: "No se pudo iniciar el pago" }, { status: 500 });
  }
}
