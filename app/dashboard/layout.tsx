"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Wallet,
  Target,
  Heart,
  BookOpen,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  User,
  Loader2,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase";
import { UpgradeModal } from "../../components/upgrade-modal"; // 🔥 IMPORT

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-brand-500",
    bgColor: "bg-brand-500/10",
  },
  {
    name: "Finanzas",
    href: "/dashboard/finanzas",
    icon: Wallet,
    color: "text-finanzas",
    bgColor: "bg-finanzas/10",
  },
  {
    name: "Hábitos",
    href: "/dashboard/habitos",
    icon: Target,
    color: "text-habitos",
    bgColor: "bg-habitos/10",
  },
  {
    name: "Salud",
    href: "/dashboard/salud",
    icon: Heart,
    color: "text-salud",
    bgColor: "bg-salud/10",
  },
  {
    name: "Diario",
    href: "/dashboard/diario",
    icon: BookOpen,
    color: "text-diario",
    bgColor: "bg-diario/10",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false); // 🔥 MODAL STATE

  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">LifeSync</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl",
                    isActive
                      ? `${item.bgColor} ${item.color}`
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="px-4 py-4 border-t space-y-2">
            {/* 🔥 BOTÓN PREMIUM */}
            <button
              onClick={() => setUpgradeOpen(true)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium w-full"
            >
              <Crown className="w-5 h-5" />
              Mejorar a Premium
            </button>

            <Link
              href="/dashboard/configuracion"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              <Settings className="w-5 h-5" />
              Configuración
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>

          {/* User */}
          <div className="px-4 py-4 border-t">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <p className="text-sm font-medium">
                      {user?.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-72">
        <header className="h-16 flex items-center px-4 border-b">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="p-6">{children}</main>
      </div>

      {/* 🔥 MODAL */}
      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
      />
    </div>
  );
}