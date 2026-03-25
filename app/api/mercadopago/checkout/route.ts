import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { mp } from "@/lib/mercadopago";
import { PreApproval } from "mercadopago";

export async function POST() {
  try {
    // ── Supabase (usuario logueado) ─────────────────────
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.set(name, "", options);
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // ── Verificar si ya es premium ─────────────────────
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (profile?.plan === "premium") {
      return NextResponse.json(
        { error: "Ya tenés Premium" },
        { status: 400 }
      );
    }

    // ── Crear suscripción en MercadoPago ───────────────
    const preApproval = new PreApproval(mp);

    const subscription = await preApproval.create({
      body: {
        reason: "Suscripción Plan Premium",
        payer_email: user.email!,
        back_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
        external_reference: user.id,

        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: Number(process.env.MP_PLAN_PRICE ?? 4999),
          currency_id: "ARS",
        },

        status: "pending",
      },
    });

    return NextResponse.json({
      url: subscription.init_point,
    });

  } catch (error) {
    console.error("MercadoPago error FULL:", JSON.stringify(error, null, 2));

    return NextResponse.json(
      { error: "No se pudo iniciar el pago" },
      { status: 500 }
    );
  }
}