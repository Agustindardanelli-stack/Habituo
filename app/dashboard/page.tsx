"use client";

import Link from "next/link";
import {
  Wallet,
  Target,
  Heart,
  BookOpen,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Flame,
  Calendar,
  Sparkles,
} from "lucide-react";

// Datos de ejemplo - después vendrán de la base de datos
const stats = {
  finanzas: {
    total: 85420,
    trend: -12,
    label: "vs mes anterior",
  },
  habitos: {
    completed: 5,
    total: 7,
    streak: 12,
  },
  salud: {
    nextPeriod: 8,
    mood: "😊"
  },
  diario: {
    entries: 15,
    streak: 5,
  },
};

const recentActivity = [
  {
    type: "finanzas",
    icon: Wallet,
    title: "Supermercado Carrefour",
    subtitle: "Alimentación",
    value: "-$15,420",
    time: "Hace 2 horas",
    color: "text-finanzas",
  },
  {
    type: "habitos",
    icon: Target,
    title: "Ejercicio completado",
    subtitle: "30 min running",
    value: "✓",
    time: "Hace 4 horas",
    color: "text-habitos",
  },
  {
    type: "diario",
    icon: BookOpen,
    title: "Nueva entrada",
    subtitle: "Reflexión del día",
    value: "📝",
    time: "Ayer",
    color: "text-diario",
  },
];

const quickActions = [
  {
    name: "Agregar gasto",
    href: "/dashboard/finanzas?action=add",
    icon: Wallet,
    color: "gradient-finanzas",
  },
  {
    name: "Completar hábito",
    href: "/dashboard/habitos",
    icon: Target,
    color: "gradient-habitos",
  },
  {
    name: "Escribir en diario",
    href: "/dashboard/diario?action=new",
    icon: BookOpen,
    color: "gradient-diario",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          ¡Hola! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Acá tenés un resumen de tu día
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className={`${action.color} p-4 rounded-2xl text-white text-center hover:opacity-90 transition-opacity`}
          >
            <action.icon className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">{action.name}</span>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Finanzas Card */}
        <Link
          href="/dashboard/finanzas"
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-finanzas/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-finanzas" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              {stats.finanzas.trend < 0 ? (
                <>
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">{Math.abs(stats.finanzas.trend)}%</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  <span className="text-red-500">{stats.finanzas.trend}%</span>
                </>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Este mes</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${stats.finanzas.total.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">{stats.finanzas.label}</p>
        </Link>

        {/* Hábitos Card */}
        <Link
          href="/dashboard/habitos"
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-habitos/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-habitos" />
            </div>
            <div className="flex items-center gap-1 text-sm text-orange-500">
              <Flame className="w-4 h-4" />
              <span>{stats.habitos.streak} días</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Hoy</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.habitos.completed}/{stats.habitos.total}
          </p>
          <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-habitos rounded-full h-2 transition-all"
              style={{
                width: `${(stats.habitos.completed / stats.habitos.total) * 100}%`,
              }}
            />
          </div>
        </Link>

        {/* Salud Card */}
        <Link
          href="/dashboard/salud"
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-salud/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-salud" />
            </div>
            <span className="text-2xl">{stats.salud.mood}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Próximo período
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.salud.nextPeriod} días
          </p>
          <p className="text-xs text-gray-400 mt-1">Fase: Folicular</p>
        </Link>

        {/* Diario Card */}
        <Link
          href="/dashboard/diario"
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-diario/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-diario" />
            </div>
            <div className="flex items-center gap-1 text-sm text-diario">
              <Calendar className="w-4 h-4" />
              <span>{stats.diario.streak} días</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Este mes</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.diario.entries} entradas
          </p>
          <p className="text-xs text-gray-400 mt-1">Última: hace 1 día</p>
        </Link>
      </div>

      {/* AI Insight */}
      <div className="bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">💡 Insight del día</h3>
            <p className="text-white/90 text-sm">
              Noté que tus gastos en entretenimiento aumentaron un 25% los fines
              de semana. ¿Querés que te sugiera alternativas más económicas para
              divertirte?
            </p>
            <Link
              href="/dashboard/chat"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium hover:underline"
            >
              Hablemos más
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Actividad reciente
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}
              >
                <activity.icon className={`w-5 h-5 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {activity.subtitle}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">
                  {activity.value}
                </p>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/dashboard/activity"
            className="text-sm text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
          >
            Ver toda la actividad
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
