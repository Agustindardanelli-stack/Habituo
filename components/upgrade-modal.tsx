"use client";

import { usePlan } from "@/hooks/usePlan";
import { Crown, Zap, X, Check } from "lucide-react";

interface UpgradeModalProps {
  isOpen:  boolean;
  onClose: () => void;
  reason?: "habits" | "transactions" | "journalEntries";
}

const REASON_COPY = {
  habits:         { title: "Llegaste al límite de hábitos",   description: "El plan Free incluye hasta 3 hábitos activos. Pasate a Premium para crear los que quieras.", icon: "🎯" },
  transactions:   { title: "Límite de transacciones del mes", description: "El plan Free incluye 20 transacciones por mes. Premium te da registros ilimitados.",         icon: "💰" },
  journalEntries: { title: "Límite de entradas del mes",      description: "El plan Free incluye 10 entradas de diario por mes. Premium es ilimitado.",                   icon: "📓" },
};

const FEATURES = [
  "Hábitos ilimitados",
  "Transacciones ilimitadas",
  "Entradas de diario ilimitadas",
  "Exportar datos en CSV",
  "Soporte prioritario",
];

export function UpgradeModal({ isOpen, onClose, reason = "habits" }: UpgradeModalProps) {
  const { startUpgrade, loading } = usePlan();
  const copy = REASON_COPY[reason];
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)" }}
    >
      <div style={{ width:"100%", maxWidth:420, background:"var(--color-background-primary)", borderRadius:20, border:"0.5px solid var(--color-border-secondary)", overflow:"hidden" }}>

        <div style={{ padding:"28px 28px 24px", borderBottom:"0.5px solid var(--color-border-tertiary)", position:"relative" }}>
          <button onClick={onClose} style={{ position:"absolute", top:16, right:16, width:28, height:28, borderRadius:8, border:"0.5px solid var(--color-border-secondary)", background:"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--color-text-secondary)" }}>
            <X size={14} />
          </button>
          <div style={{ width:52, height:52, borderRadius:14, background:"#FEF9C3", border:"0.5px solid #FDE047", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:14 }}>
            {copy.icon}
          </div>
          <h2 style={{ fontSize:17, fontWeight:500, color:"var(--color-text-primary)", marginBottom:6 }}>{copy.title}</h2>
          <p style={{ fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.55 }}>{copy.description}</p>
        </div>

        <div style={{ padding:"20px 28px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
            <Crown size={13} style={{ color:"#D97706" }} />
            <span style={{ fontSize:11, fontWeight:500, color:"#92400E", textTransform:"uppercase", letterSpacing:"0.06em" }}>Plan Premium incluye</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {FEATURES.map((f) => (
              <div key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"var(--color-text-primary)" }}>
                <div style={{ width:18, height:18, borderRadius:999, background:"#DCFCE7", border:"0.5px solid #86EFAC", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Check size={10} style={{ color:"#16A34A" }} />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding:"16px 28px 24px", display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"center", gap:4, marginBottom:4 }}>
            <span style={{ fontSize:28, fontWeight:600, color:"var(--color-text-primary)" }}>$4.999</span>
            <span style={{ fontSize:13, color:"var(--color-text-secondary)" }}>ARS / mes</span>
          </div>
          <button
            onClick={startUpgrade}
            disabled={loading}
            style={{ width:"100%", padding:"13px", borderRadius:12, border:"none", background: loading ? "#D1D5DB" : "#009EE3", color:"#fff", fontSize:14, fontWeight:500, cursor: loading ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, transition:"background 0.2s" }}
          >
            {loading
              ? <div style={{ width:14, height:14, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"spin 0.7s linear infinite" }} />
              : <Zap size={14} />
            }
            {loading ? "Redirigiendo a MercadoPago…" : "Pagar con MercadoPago"}
          </button>
          <button onClick={onClose} style={{ width:"100%", padding:"11px", borderRadius:12, border:"0.5px solid var(--color-border-secondary)", background:"transparent", color:"var(--color-text-secondary)", fontSize:13, cursor:"pointer" }}>
            Seguir con el plan Free
          </button>
          <p style={{ fontSize:11, color:"var(--color-text-tertiary)", textAlign:"center", marginTop:2 }}>
            Podés cancelar cuando quieras desde Configuración.
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}