"use client";

import Link from "next/link";
import {
  Wallet,
  Target,
  BookOpen,
  TrendingDown,
  Flame,
  Calendar,
} from "lucide-react";
import ChatAI from "@/components/ChatAI";
import { useTransactions } from "@/hooks/useTransactions";
import { useHabits } from "@/hooks/useHabits";
import { useJournal } from "@/hooks/useJournal";
import { useProfile } from "@/hooks/useProfile";

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

function StatSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

export default function DashboardPage() {
  const { stats: finanzasStats, transactions, loading: finanzasLoading } = useTransactions();
  const { stats: habitStats, habits, loading: habitLoading } = useHabits();
  const { stats: journalStats, entries, loading: journalLoading } = useJournal();
  const { profile } = useProfile();

  const isLoading = finanzasLoading || habitLoading || journalLoading;

  const firstName = profile?.full_name?.split(" ")[0] || null;

  // Actividad reciente dinámica
  const recentActivity = [
    ...transactions.slice(0, 2).map((t) => ({
      type: "finanzas",
      icon: Wallet,
      title: t.description,
      subtitle: t.category_name,
      value: `-$${Math.abs(t.amount).toLocaleString("es-AR")}`,
      time: new Date(t.date + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
      color: "text-finanzas",
      href: "/dashboard/finanzas",
    })),
    ...habits
      .filter((h) => h.completedToday)
      .slice(0, 1)
      .map((h) => ({
        type: "habitos",
        icon: Target,
        title: `${h.icon} ${h.name} completado`,
        subtitle: `Racha: ${h.streak} días`,
        value: "✓",
        time: "Hoy",
        color: "text-habitos",
        href: "/dashboard/habitos",
      })),
    ...entries.slice(0, 1).map((e) => ({
      type: "diario",
      icon: BookOpen,
      title: e.title || "Nueva entrada",
      subtitle: e.mood ? `Estado: ${e.mood}` : "Reflexión del día",
      value: "📝",
      time: new Date(e.date + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
      color: "text-diario",
      href: "/dashboard/diario",
    })),
  ].slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {firstName ? `¡Hola, ${firstName}! 👋` : "¡Hola! 👋"}
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
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Finanzas */}
          <Link
            href="/dashboard/finanzas"
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-finanzas/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-finanzas" />
              </div>
              {finanzasStats && finanzasStats.transactionCount > 0 && (
                <div className="flex items-center gap-1 text-sm text-green-500">
                  <TrendingDown className="w-4 h-4" />
                  <span>{finanzasStats.transactionCount} mov.</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Este mes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${(finanzasStats?.totalExpenses ?? 0).toLocaleString("es-AR")}
            </p>
            <p className="text-xs text-gray-400 mt-1">Gastos totales</p>
          </Link>

          {/* Hábitos */}
          <Link
            href="/dashboard/habitos"
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-habitos/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-habitos" />
              </div>
              {(habitStats?.longestStreak ?? 0) > 0 && (
                <div className="flex items-center gap-1 text-sm text-orange-500">
                  <Flame className="w-4 h-4" />
                  <span>{habitStats!.longestStreak} días</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Hoy</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {habitStats?.completedToday ?? 0}/{habitStats?.totalHabits ?? 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">Hábitos completados</p>
          </Link>

          {/* Diario */}
          <Link
            href="/dashboard/diario"
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-diario/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-diario" />
              </div>
              {(journalStats?.streak ?? 0) > 0 && (
                <div className="flex items-center gap-1 text-sm text-diario">
                  <Calendar className="w-4 h-4" />
                  <span>{journalStats!.streak} días</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Este mes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {journalStats?.entriesThisMonth ?? 0} entradas
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {journalStats?.totalWords
                ? `${journalStats.totalWords.toLocaleString("es-AR")} palabras`
                : "Empezá a escribir"}
            </p>
          </Link>
        </div>
      )}

      {/* Chat IA */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            🤖 Tu coach IA
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Preguntame sobre tus finanzas, hábitos o tu diario
          </p>
        </div>
        <ChatAI />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Actividad reciente
          </h2>
        </div>
        {isLoading ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No hay actividad reciente aún.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Registrá gastos, completá hábitos o escribí en el diario.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {recentActivity.map((activity, index) => (
              <Link
                key={index}
                href={activity.href}
                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500">{activity.subtitle}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {activity.value}
                  </p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
