import { NextResponse } from "next/server";
import { PreApproval } from "mercadopago";
import { mp } from "@/lib/mercadopago";
import { createAdminSupabase, createServerSupabase } from "@/lib/supabase-server";

export async function DELETE() {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const supabaseAdmin = createAdminSupabase();

    // Si tiene una suscripción activa, cancelarla antes de borrar la cuenta
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("mp_subscription_id")
      .eq("id", user.id)
      .single();

    if (profile?.mp_subscription_id) {
      try {
        await new PreApproval(mp).update({
          id: profile.mp_subscription_id,
          body: { status: "cancelled" },
        });
      } catch (err) {
        console.error("No se pudo cancelar la suscripción en MP:", err);
        return NextResponse.json(
          { error: "No se pudo cancelar tu suscripción. Intentá de nuevo." },
          { status: 502 }
        );
      }
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (error) {
      console.error("Error eliminando usuario:", error);
      return NextResponse.json({ error: "No se pudo eliminar la cuenta" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
