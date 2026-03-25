'use client'
import Link from "next/link";
import {
  Wallet,
  Target,
  BookOpen,
  ArrowRight,
  LayoutDashboard,
  Shield,
  TrendingUp,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const modules = [
    {
      num: "01",
      icon: Wallet,
      title: "Finanzas",
      description:
        "Registrá ingresos y gastos, categorizalos y visualizá en qué se va tu plata mes a mes con gráficos claros.",
      tag: "Control financiero",
      accent: "#34d399",
    },
    {
      num: "02",
      icon: Target,
      title: "Hábitos",
      description:
        "Creá rutinas, activá recordatorios y seguí tu racha diaria. Pequeñas acciones que se acumulan en grandes cambios.",
      tag: "Consistencia diaria",
      accent: "#a78bfa",
    },
    {
      num: "03",
      icon: BookOpen,
      title: "Diario",
      description:
        "Un espacio tuyo para escribir, reflexionar y ver cómo evolucionás. Con prompts y seguimiento de humor.",
      tag: "Reflexión personal",
      accent: "#fb923c",
    },
    
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Progreso visible",
      description: "Gráficos y rachas que te muestran exactamente cómo vas evolucionando.",
    },
    {
      icon: Shield,
      title: "Tus datos, seguros",
      description: "Seguridad a nivel fila en base de datos. Lo que escribís solo lo ves vos.",
    },
    {
      icon: Zap,
      title: "Todo en un lugar",
      description: "Sin malabarismo entre apps. Finanzas, hábitos y diario bajo el mismo techo.",
    },
    {
      icon: CheckCircle2,
      title: "Siempre gratis",
      description: "El plan free cubre todo lo esencial. Sin letra chica, sin sorpresas.",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        .ls-serif { font-family: 'Instrument Serif', Georgia, serif; }
        .ls-sans  { font-family: 'DM Sans', system-ui, sans-serif; }
        .ls-grain::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1;
        }
        .ls-glow {
          position: absolute;
          border-radius: 9999px;
          filter: blur(120px);
          pointer-events: none;
        }
        @keyframes ls-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ls-animate { animation: ls-fade-up 0.7s ease forwards; opacity: 0; }
        .ls-delay-1 { animation-delay: 0.1s; }
        .ls-delay-2 { animation-delay: 0.22s; }
        .ls-delay-3 { animation-delay: 0.34s; }
        .ls-delay-4 { animation-delay: 0.46s; }
        .ls-module-card {
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 32px;
          background: rgba(255,255,255,0.03);
          transition: border-color 0.25s, background 0.25s, transform 0.25s;
          cursor: default;
        }
        .ls-module-card:hover {
          border-color: rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.06);
          transform: translateY(-3px);
        }
        .ls-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: #a3e635;
          color: #0a0a0f;
          border-radius: 100px;
          font-weight: 500;
          font-size: 15px;
          font-family: 'DM Sans', system-ui, sans-serif;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s;
        }
        .ls-cta-btn:hover { background: #bef264; transform: scale(1.03); }
        .ls-ghost-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border: 1px solid rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.75);
          border-radius: 100px;
          font-size: 15px;
          font-family: 'DM Sans', system-ui, sans-serif;
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s;
        }
        .ls-ghost-btn:hover { border-color: rgba(255,255,255,0.45); color: #fff; }
        .ls-divider {
          width: 1px;
          height: 60px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent);
          margin: 0 auto;
        }
        .ls-tag {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .ls-num {
          font-size: 11px;
          font-family: 'DM Sans', monospace;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.25);
        }
        .ls-stat-card {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 24px 28px;
          background: rgba(255,255,255,0.03);
        }
      `}</style>

      <div
        className="ls-sans ls-grain"
        style={{
          minHeight: "100vh",
          background: "#0a0a0f",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glows */}
        <div
          className="ls-glow"
          style={{ width: 600, height: 600, top: -200, left: -100, background: "rgba(163,230,53,0.06)" }}
        />
        <div
          className="ls-glow"
          style={{ width: 500, height: 500, top: 200, right: -150, background: "rgba(167,139,250,0.07)" }}
        />

        {/* ── NAV ──────────────────────────────────────────────── */}
        <header
          style={{
            position: "fixed",
            top: 0,
            width: "100%",
            zIndex: 50,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(10,10,15,0.85)",
            backdropFilter: "blur(16px)",
          }}
        >
          <nav
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 24px",
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              className="ls-serif"
              style={{ fontSize: 22, letterSpacing: "-0.02em", color: "#fff" }}
            >
              LifeSync
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Link
                href="/auth/login"
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.55)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
              >
                Iniciar sesión
              </Link>
              <Link href="/auth/register" className="ls-cta-btn" style={{ padding: "9px 20px", fontSize: 13 }}>
                Empezar gratis
              </Link>
            </div>
          </nav>
        </header>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "160px 24px 100px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Eyebrow */}
          <div
            className="ls-animate ls-delay-1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 32,
              padding: "6px 14px",
              border: "1px solid rgba(163,230,53,0.3)",
              borderRadius: 999,
              background: "rgba(163,230,53,0.07)",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a3e635", display: "inline-block" }} />
            <span style={{ fontSize: 12, color: "#a3e635", letterSpacing: "0.05em", fontWeight: 500 }}>
              Tu vida diaria, organizada
            </span>
          </div>

          {/* Headline */}
          <h1
            className="ls-serif ls-animate ls-delay-2"
            style={{
              fontSize: "clamp(48px, 8vw, 96px)",
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              marginBottom: 28,
              maxWidth: 800,
            }}
          >
            Claridad para
            <br />
            <span style={{ color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>cada día</span>
            <br />
            que vivís.
          </h1>

          <p
            className="ls-animate ls-delay-3"
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.5)",
              maxWidth: 480,
              lineHeight: 1.6,
              marginBottom: 40,
              fontWeight: 300,
            }}
          >
            Hábitos, finanzas y diario personal en un solo lugar. Sin apps separadas, sin
            fricción — solo vos y tu progreso.
          </p>

          <div
            className="ls-animate ls-delay-4"
            style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}
          >
            <Link href="/auth/register" className="ls-cta-btn">
              Empezar gratis
              <ArrowRight size={16} />
            </Link>
            <Link href="/dashboard" className="ls-ghost-btn">
              Ver demo
            </Link>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: 48,
              marginTop: 72,
              paddingTop: 40,
              borderTop: "1px solid rgba(255,255,255,0.07)",
              flexWrap: "wrap",
            }}
          >
            {[
              { val: "3", label: "módulos integrados" },
              { val: "100%", label: "gratis para empezar" },
              { val: "0", label: "apps extra necesarias" },
            ].map((s, i) => (
              <div key={i}>
                <div
                  className="ls-serif"
                  style={{ fontSize: 36, letterSpacing: "-0.03em", color: "#fff" }}
                >
                  {s.val}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── MÓDULOS ──────────────────────────────────────────── */}
        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "80px 24px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Section label */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
            <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.2)" }} />
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              Qué incluye
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {modules.map((m) => (
              <div key={m.num} className="ls-module-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${m.accent}18`,
                      border: `1px solid ${m.accent}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <m.icon size={20} style={{ color: m.accent }} />
                  </div>
                  <span className="ls-num">{m.num}</span>
                </div>

                <h3
                  className="ls-serif"
                  style={{
                    fontSize: 22,
                    letterSpacing: "-0.02em",
                    marginBottom: 10,
                    color: "#fff",
                  }}
                >
                  {m.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.45)",
                    lineHeight: 1.65,
                    marginBottom: 20,
                    fontWeight: 300,
                  }}
                >
                  {m.description}
                </p>
                <span
                  className="ls-tag"
                  style={{
                    background: `${m.accent}12`,
                    color: m.accent,
                    border: `1px solid ${m.accent}25`,
                  }}
                >
                  {m.tag}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── DIVIDER ─────────────────────────────────────────── */}
        <div style={{ position: "relative", zIndex: 2, padding: "20px 0" }}>
          <div className="ls-divider" />
        </div>

        {/* ── BENEFITS ────────────────────────────────────────── */}
        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "80px 24px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 60,
              alignItems: "center",
            }}
          >
            {/* Left: heading */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.2)" }} />
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  Por qué LifeSync
                </span>
              </div>
              <h2
                className="ls-serif"
                style={{
                  fontSize: "clamp(32px, 4vw, 52px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  marginBottom: 20,
                }}
              >
                Diseñado para
                <br />
                <span style={{ color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
                  simplificar,
                </span>
                <br />
                no complicar.
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.7,
                  fontWeight: 300,
                  maxWidth: 360,
                }}
              >
                Cada decisión de diseño apunta a que puedas registrar, revisar y avanzar
                en menos de 2 minutos por día.
              </p>
            </div>

            {/* Right: benefit cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {benefits.map((b, i) => (
                <div key={i} className="ls-stat-card">
                  <b.icon size={18} style={{ color: "rgba(255,255,255,0.4)", marginBottom: 12 }} />
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      marginBottom: 6,
                      color: "#fff",
                    }}
                  >
                    {b.title}
                  </h4>
                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.35)",
                      lineHeight: 1.6,
                      fontWeight: 300,
                    }}
                  >
                    {b.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ───────────────────────────────────────── */}
        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "60px 24px 120px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 28,
              padding: "72px 48px",
              textAlign: "center",
              background: "rgba(255,255,255,0.02)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle inner glow */}
            <div
              className="ls-glow"
              style={{
                width: 400,
                height: 200,
                top: -80,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(163,230,53,0.08)",
              }}
            />
            <h2
              className="ls-serif"
              style={{
                fontSize: "clamp(36px, 5vw, 64px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                marginBottom: 20,
                position: "relative",
              }}
            >
              ¿Listo para
              <br />
              <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.4)" }}>
                ordenar tu vida?
              </span>
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 40,
                fontWeight: 300,
                position: "relative",
              }}
            >
              Empezá hoy, gratis, sin compromiso.
            </p>
            <Link href="/auth/register" className="ls-cta-btn" style={{ position: "relative" }}>
              Crear cuenta gratis
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <footer
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: "28px 24px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <span className="ls-serif" style={{ fontSize: 18, color: "#fff" }}>
              LifeSync
            </span>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
              © 2025 LifeSync — Hecho con dedicación desde Argentina.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}