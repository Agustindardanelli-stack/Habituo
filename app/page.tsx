import Link from "next/link";
import {
  Wallet,
  Target,
  Heart,
  BookOpen,
  Bot,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: Wallet,
      title: "Finanzas",
      description: "Controla tus gastos con categorización automática por IA",
      color: "bg-finanzas",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: Target,
      title: "Hábitos",
      description: "Construye rutinas positivas y trackea tu progreso",
      color: "bg-habitos",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: Heart,
      title: "Salud",
      description: "Calendario menstrual y seguimiento de bienestar",
      color: "bg-salud",
      gradient: "from-pink-500 to-rose-600",
    },
    {
      icon: BookOpen,
      title: "Diario",
      description: "Reflexiona con análisis de sentimiento por IA",
      color: "bg-diario",
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  const benefits = [
    {
      icon: Bot,
      title: "IA Personalizada",
      description: "Un asistente que aprende de tus patrones y te da insights únicos",
    },
    {
      icon: Shield,
      title: "Privacidad Total",
      description: "Tus datos son tuyos. Encriptación de extremo a extremo",
    },
    {
      icon: Zap,
      title: "Todo en Uno",
      description: "Sin saltar entre apps. Todo tu bienestar en un lugar",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
              LifeSync AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
            >
              Comenzar gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-950 rounded-full text-brand-700 dark:text-brand-300 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Potenciado por Inteligencia Artificial
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Tu vida, organizada
            <br />
            <span className="bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              con inteligencia
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            Finanzas, hábitos, salud y más. Un asistente personal con IA que
            aprende de vos y te ayuda a alcanzar tus metas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-brand-500/25"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold text-lg transition-all"
            >
              Ver demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Todo lo que necesitás
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Módulos diseñados para simplificar tu día a día
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chat Preview */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Chateá con tu
                <br />
                <span className="bg-gradient-to-r from-brand-500 to-purple-500 bg-clip-text text-transparent">
                  asistente personal
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Preguntale cualquier cosa sobre tus datos. La IA analiza tus
                patrones y te da respuestas personalizadas.
              </p>

              <div className="space-y-4">
                {[
                  "¿Cuánto gasté este mes en comida?",
                  "¿Cómo viene mi racha de ejercicio?",
                  "Dame un resumen de mi semana",
                ].map((question, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-gray-600 dark:text-gray-400"
                  >
                    <div className="w-2 h-2 rounded-full bg-brand-500" />
                    {question}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-brand-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-xs">
                    ¿Cómo van mis finanzas este mes?
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-gray-800 text-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm max-w-sm">
                    <p className="mb-2">📊 Este mes llevas gastados <strong>$85,420</strong></p>
                    <p className="text-sm text-gray-400">
                      Estás un 12% por debajo del mes pasado. ¡Excelente! Tu
                      mayor gasto fue en Alimentación ($32,150).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-brand-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            ¿Listo para organizarte?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Empezá gratis. Sin tarjeta de crédito.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-brand-500/25"
          >
            Crear cuenta gratis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <span className="font-semibold text-gray-900 dark:text-white">
              LifeSync AI
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 LifeSync AI. Hecho con ❤️ en Argentina.
          </p>
        </div>
      </footer>
    </div>
  );
}
