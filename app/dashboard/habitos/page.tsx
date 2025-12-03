"use client";

import { useState } from "react";
import {
  Target,
  Plus,
  Flame,
  Check,
  TrendingUp,
  Award,
  MoreHorizontal,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import { HABIT_ICONS, HABIT_COLORS } from "@/lib/api/habits";
import { toast } from "sonner";

const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

export default function HabitosPage() {
  const { habits, stats, loading, addHabit, toggleHabit, removeHabit } = useHabits();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    icon: "🎯",
    color: "#8b5cf6",
    frequency: "daily" as const,
    reminder_time: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Ponele un nombre al hábito");
      return;
    }

    setIsSubmitting(true);
    const success = await addHabit(formData);

    if (success) {
      toast.success("¡Hábito creado!");
      setShowAddModal(false);
      setFormData({
        name: "",
        icon: "🎯",
        color: "#8b5cf6",
        frequency: "daily",
        reminder_time: "",
      });
    } else {
      toast.error("Error al crear el hábito");
    }
    setIsSubmitting(false);
  };

  const handleToggle = async (habitId: string, currentState: boolean) => {
    const success = await toggleHabit(habitId, !currentState);
    if (success) {
      toast.success(!currentState ? "¡Bien hecho! 🎉" : "Desmarcado");
    } else {
      toast.error("Error al actualizar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar este hábito?")) return;

    const success = await removeHabit(id);
    if (success) {
      toast.success("Hábito eliminado");
    } else {
      toast.error("Error al eliminar");
    }
    setMenuOpen(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-habitos" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-habitos/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-habitos" />
            </div>
            Hábitos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Construí rutinas que transforman
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-habitos hover:bg-habitos-dark text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo hábito
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-habitos/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-habitos" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hoy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.completedToday || 0}/{stats?.totalHabits || 0}
              </p>
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-2 mt-3">
            <div
              className="bg-habitos rounded-full h-2 transition-all"
              style={{
                width: `${
                  stats?.totalHabits
                    ? (stats.completedToday / stats.totalHabits) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Mejor racha</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.longestStreak || 0} días
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Esta semana</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.weekPercentage || 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total hábitos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalHabits || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Habits Grid */}
      {habits.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <Target className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tenés hábitos todavía
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Empezá a construir tus rutinas diarias
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-habitos hover:bg-habitos-dark text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Crear primer hábito
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 transition-all ${
                habit.completedToday
                  ? "ring-2 ring-habitos ring-offset-2 dark:ring-offset-gray-950"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${habit.color}20` }}
                  >
                    {habit.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {habit.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-orange-500">
                      <Flame className="w-4 h-4" />
                      <span>{habit.streak} días</span>
                    </div>
                  </div>
                </div>

                {/* Menu */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === habit.id ? null : habit.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </button>
                  {menuOpen === habit.id && (
                    <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[120px]">
                      <button
                        onClick={() => handleDelete(habit.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Week history */}
              <div className="flex justify-between mb-4">
                {weekDays.map((day, index) => (
                  <div key={day} className="text-center">
                    <span className="text-xs text-gray-400">{day}</span>
                    <div
                      className={`w-8 h-8 rounded-lg mt-1 flex items-center justify-center transition-colors ${
                        habit.weekHistory[index]
                          ? "text-white"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                      style={{
                        backgroundColor: habit.weekHistory[index]
                          ? habit.color
                          : undefined,
                      }}
                    >
                      {habit.weekHistory[index] && <Check className="w-4 h-4" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Toggle button */}
              <button
                onClick={() => handleToggle(habit.id, habit.completedToday)}
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  habit.completedToday
                    ? "text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                style={{
                  backgroundColor: habit.completedToday ? habit.color : undefined,
                }}
              >
                {habit.completedToday ? "✓ Completado" : "Marcar como hecho"}
              </button>
            </div>
          ))}

          {/* Add habit card */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-habitos dark:hover:border-habitos transition-colors flex flex-col items-center justify-center min-h-[250px] group"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center group-hover:bg-habitos/10 transition-colors">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-habitos" />
            </div>
            <span className="mt-3 font-medium text-gray-500 dark:text-gray-400 group-hover:text-habitos">
              Agregar hábito
            </span>
          </button>
        </div>
      )}

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 animate-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Nuevo hábito
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre del hábito
                </label>
                <input
                  type="text"
                  placeholder="Ej: Hacer ejercicio"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-habitos/50 focus:border-habitos outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Emoji
                </label>
                <div className="flex gap-2 flex-wrap">
                  {HABIT_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-12 h-12 rounded-xl text-2xl transition-all ${
                        formData.icon === icon
                          ? "bg-habitos/20 ring-2 ring-habitos"
                          : "bg-gray-100 dark:bg-gray-800 hover:bg-habitos/10"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {HABIT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-10 h-10 rounded-xl transition-all ${
                        formData.color === color.value
                          ? "ring-2 ring-offset-2 ring-gray-400"
                          : ""
                      }`}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frecuencia
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value as any })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-habitos/50 focus:border-habitos outline-none"
                >
                  <option value="daily">Todos los días</option>
                  <option value="weekdays">Lunes a Viernes</option>
                  <option value="weekends">Fines de semana</option>
                  <option value="weekly">Una vez por semana</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recordatorio (opcional)
                </label>
                <input
                  type="time"
                  value={formData.reminder_time}
                  onChange={(e) =>
                    setFormData({ ...formData, reminder_time: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-habitos/50 focus:border-habitos outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-habitos hover:bg-habitos-dark disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear hábito"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
