"use client";

import { useState, useMemo } from "react";
import {
  Heart,
  Calendar,
  Droplets,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Plus,
  Info,
  Dumbbell,
  Moon,
  Sun,
  Zap,
  TrendingUp,
  Activity,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Flame,
  Baby,
} from "lucide-react";
import { useCycle } from "@/hooks/useCycle";
import {
  SYMPTOMS,
  MOODS,
  FLOW_INTENSITIES,
  PHASE_INFO,
  getDayPrediction,
  type NewCycleLog,
  type DayPrediction,
} from "@/lib/api/cycle";
import { toast } from "sonner";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function SaludPage() {
  const { logs, prediction, stats, loading, saveLog, getLogForDate } = useCycle();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDayInfo, setSelectedDayInfo] = useState<DayPrediction | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<NewCycleLog>({
    date: new Date().toISOString().split("T")[0],
    flow_intensity: undefined,
    is_period_start: false,
    symptoms: [],
    mood: undefined,
    energy_level: 3,
    notes: "",
  });

  // Calcular días del mes
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return days;
  }, [currentMonth]);

  const getDateString = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-${String(day).padStart(2, "0")}`;
  };

  const getDayData = (day: number) => {
    const dateStr = getDateString(day);
    const log = getLogForDate(dateStr);
    const dayPrediction = getDayPrediction(dateStr, prediction, logs);
    const today = new Date().toISOString().split("T")[0];
    const isPast = dateStr < today;

    return {
      dateStr,
      log,
      prediction: dayPrediction,
      isToday: dateStr === today,
      isPast,
    };
  };

  const handleDayClick = (day: number) => {
    const { dateStr, prediction: dayPrediction } = getDayData(day);
    setSelectedDate(dateStr);
    setSelectedDayInfo(dayPrediction);
    setShowDayModal(true);
  };

  const openLogModal = (dateStr?: string) => {
    const date = dateStr || new Date().toISOString().split("T")[0];
    const existingLog = getLogForDate(date);

    setFormData({
      date,
      flow_intensity: existingLog?.flow_intensity,
      is_period_start: existingLog?.is_period_start || false,
      symptoms: existingLog?.symptoms || [],
      mood: existingLog?.mood,
      energy_level: existingLog?.energy_level || 3,
      notes: existingLog?.notes || "",
    });
    setShowDayModal(false);
    setShowLogModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await saveLog(formData);
    if (success) {
      toast.success("Registro guardado ✓");
      setShowLogModal(false);
    } else {
      toast.error("Error al guardar");
    }
    setIsSubmitting(false);
  };

  const toggleSymptom = (symptomId: string) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms?.includes(symptomId)
        ? prev.symptoms.filter((s) => s !== symptomId)
        : [...(prev.symptoms || []), symptomId],
    }));
  };

  const prevMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  const nextMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  const goToToday = () => setCurrentMonth(new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-salud" />
      </div>
    );
  }

  const phase = prediction?.currentPhase ? PHASE_INFO[prediction.currentPhase] : null;
  const todayPrediction = getDayPrediction(new Date().toISOString().split("T")[0], prediction, logs);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-salud/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-salud" />
            </div>
            Ciclo y Salud
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Seguimiento inteligente de tu ciclo menstrual
          </p>
        </div>
        <button
          onClick={() => openLogModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-salud hover:bg-pink-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-salud/25"
        >
          <Plus className="w-5 h-5" />
          Registrar hoy
        </button>
      </div>

      {/* Current Phase Banner */}
      {phase && (
        <div className={`${phase.lightBg} ${phase.borderColor} border rounded-2xl p-5`}>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${phase.bgColor} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                {phase.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-xl font-bold ${phase.textColor}`}>
                    Fase {phase.name}
                  </h2>
                  <span className="text-2xl">{phase.emoji}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Día {prediction?.cycleDay} de {prediction?.cycleLength} • {prediction?.daysUntilPeriod} días para tu período
                </p>
              </div>
            </div>
            <div className="md:ml-auto flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                phase.energy === "high" 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : phase.energy === "medium"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                <Zap className="w-4 h-4" />
                Energía {phase.energy === "high" ? "alta" : phase.energy === "medium" ? "media" : "baja"}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                phase.training.intensity === "intense"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  : phase.training.intensity === "moderate"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              }`}>
                <Dumbbell className="w-4 h-4" />
                {phase.training.recommendation}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            {phase.description}
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Droplets className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Próximo período</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {prediction ? (
                  prediction.daysUntilPeriod === 0 ? "Hoy" :
                  prediction.daysUntilPeriod === 1 ? "Mañana" :
                  `En ${prediction.daysUntilPeriod} días`
                ) : "—"}
              </p>
              {prediction && (
                <p className="text-xs text-gray-400">
                  {prediction.nextPeriodStart.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ovulación</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {prediction ? (
                  (() => {
                    const daysToOvulation = Math.ceil(
                      (prediction.ovulationDate.getTime() - new Date().getTime()) / 86400000
                    );
                    if (daysToOvulation < 0) return "Pasó";
                    if (daysToOvulation === 0) return "Hoy";
                    if (daysToOvulation === 1) return "Mañana";
                    return `En ${daysToOvulation} días`;
                  })()
                ) : "—"}
              </p>
              {prediction && (
                <p className="text-xs text-gray-400">
                  {prediction.ovulationDate.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ciclo promedio</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats?.cycleLength || 28} días
              </p>
              <p className="text-xs text-gray-400">
                Período: ~{stats?.periodLength || 5} días
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Registros</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats?.totalLogs || 0}
              </p>
              <p className="text-xs text-gray-400">Últimos 6 meses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {currentMonth.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
              </h2>
              <button
                onClick={goToToday}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
              >
                Hoy
              </button>
            </div>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={index} className="aspect-square border-b border-r border-gray-100 dark:border-gray-800" />;
              }

              const { log, prediction: dayPred, isToday, isPast } = getDayData(day);
              const phaseInfo = PHASE_INFO[dayPred.phase];

              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square p-1 border-b border-r border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all relative group ${
                    isToday ? "bg-brand-50 dark:bg-brand-900/20" : ""
                  }`}
                >
                  {/* Date number */}
                  <div className={`text-sm font-medium mb-0.5 ${
                    isToday 
                      ? "w-7 h-7 bg-brand-500 text-white rounded-full flex items-center justify-center mx-auto"
                      : isPast 
                      ? "text-gray-400 dark:text-gray-600" 
                      : "text-gray-700 dark:text-gray-300"
                  }`}>
                    {day}
                  </div>

                  {/* Indicators */}
                  <div className="flex flex-col items-center gap-0.5">
                    {/* Period/Flow indicator */}
                    {(log?.flow_intensity || dayPred.isPeriodPredicted) && (
                      <div
                        className={`w-full h-1.5 rounded-full ${
                          log?.flow_intensity
                            ? "bg-red-500"
                            : "bg-red-200 dark:bg-red-800"
                        }`}
                      />
                    )}

                    {/* Ovulation */}
                    {dayPred.isOvulation && !log?.flow_intensity && (
                      <div className="w-full h-1.5 rounded-full bg-purple-500" />
                    )}

                    {/* Fertile window */}
                    {dayPred.isFertile && !dayPred.isOvulation && !log?.flow_intensity && !dayPred.isPeriodPredicted && (
                      <div className="w-full h-1.5 rounded-full bg-purple-200 dark:bg-purple-800" />
                    )}

                    {/* Mood emoji */}
                    {log?.mood && (
                      <span className="text-xs">
                        {MOODS.find((m) => m.value === log.mood)?.icon}
                      </span>
                    )}
                  </div>

                  {/* Training indicator - shown on hover */}
                  {!isPast && (
                    <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        dayPred.trainingIntensity === "intense"
                          ? "bg-green-500"
                          : dayPred.trainingIntensity === "moderate"
                          ? "bg-yellow-500"
                          : dayPred.trainingIntensity === "light"
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}>
                        <Dumbbell className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1.5 rounded-full bg-red-500" />
                <span className="text-gray-600 dark:text-gray-400">Período</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1.5 rounded-full bg-red-200 dark:bg-red-800" />
                <span className="text-gray-600 dark:text-gray-400">Período predicho</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1.5 rounded-full bg-purple-500" />
                <span className="text-gray-600 dark:text-gray-400">Ovulación</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1.5 rounded-full bg-purple-200 dark:bg-purple-800" />
                <span className="text-gray-600 dark:text-gray-400">Ventana fértil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Training */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                todayPrediction.trainingIntensity === "intense"
                  ? "bg-green-100 dark:bg-green-900/30"
                  : todayPrediction.trainingIntensity === "moderate"
                  ? "bg-blue-100 dark:bg-blue-900/30"
                  : todayPrediction.trainingIntensity === "light"
                  ? "bg-orange-100 dark:bg-orange-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              }`}>
                <Dumbbell className={`w-5 h-5 ${
                  todayPrediction.trainingIntensity === "intense"
                    ? "text-green-600"
                    : todayPrediction.trainingIntensity === "moderate"
                    ? "text-blue-600"
                    : todayPrediction.trainingIntensity === "light"
                    ? "text-orange-600"
                    : "text-red-600"
                }`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Entrenamiento hoy</h3>
                <p className={`text-sm font-medium ${
                  todayPrediction.trainingIntensity === "intense"
                    ? "text-green-600"
                    : todayPrediction.trainingIntensity === "moderate"
                    ? "text-blue-600"
                    : todayPrediction.trainingIntensity === "light"
                    ? "text-orange-600"
                    : "text-red-600"
                }`}>
                  {todayPrediction.trainingIntensity === "intense" && "Intensidad alta ✓"}
                  {todayPrediction.trainingIntensity === "moderate" && "Intensidad moderada"}
                  {todayPrediction.trainingIntensity === "light" && "Ejercicio suave"}
                  {todayPrediction.trainingIntensity === "rest" && "Descanso recomendado"}
                </p>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {phase?.training.activities.slice(0, 4).map((activity, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{activity}</span>
                  </div>
                ))}
                {phase?.training.avoid.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-3" />
                    {phase.training.avoid.slice(0, 2).map((activity, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-gray-500 dark:text-gray-400">{activity}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Fertility Info */}
          {todayPrediction.isFertile && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Baby className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                    Ventana fértil
                  </h4>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    {todayPrediction.fertilityLevel === "peak"
                      ? "Hoy es tu día más fértil del ciclo."
                      : todayPrediction.fertilityLevel === "high"
                      ? "Alta probabilidad de fertilidad."
                      : "Estás en tu ventana fértil."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Top Symptoms */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Tus síntomas frecuentes
            </h3>
            {stats?.topSymptoms && stats.topSymptoms.length > 0 ? (
              <div className="space-y-2">
                {stats.topSymptoms.map((symptom) => symptom && (
                  <div key={symptom.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{symptom.icon}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{symptom.label}</span>
                    </div>
                    <span className="text-xs text-gray-400">{symptom.count}x</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                Registrá síntomas para ver patrones
              </p>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-salud/5 to-purple-500/5 border border-salud/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-salud/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Flame className="w-4 h-4 text-salud" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  Tip para hoy
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {phase?.training.tips[0]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day Info Modal */}
      {showDayModal && selectedDayInfo && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg my-8 animate-in overflow-hidden">
            {/* Header */}
            <div className={`p-5 ${PHASE_INFO[selectedDayInfo.phase].lightBg}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${PHASE_INFO[selectedDayInfo.phase].bgColor} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                    {PHASE_INFO[selectedDayInfo.phase].icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-AR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </h2>
                    <p className={`text-sm font-medium ${PHASE_INFO[selectedDayInfo.phase].textColor}`}>
                      Fase {PHASE_INFO[selectedDayInfo.phase].name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDayModal(false)}
                  className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5">
              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                {selectedDayInfo.isPeriod && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm">
                    <Droplets className="w-4 h-4" /> Período
                  </span>
                )}
                {selectedDayInfo.isPeriodPredicted && !selectedDayInfo.isPeriod && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-sm border border-red-200 dark:border-red-800">
                    <Droplets className="w-4 h-4" /> Período predicho
                  </span>
                )}
                {selectedDayInfo.isOvulation && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
                    <Sparkles className="w-4 h-4" /> Ovulación
                  </span>
                )}
                {selectedDayInfo.isFertile && !selectedDayInfo.isOvulation && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-sm border border-purple-200 dark:border-purple-800">
                    <Baby className="w-4 h-4" /> Ventana fértil ({selectedDayInfo.fertilityLevel})
                  </span>
                )}
              </div>

              {/* Training section */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedDayInfo.trainingIntensity === "intense"
                      ? "bg-green-500"
                      : selectedDayInfo.trainingIntensity === "moderate"
                      ? "bg-blue-500"
                      : selectedDayInfo.trainingIntensity === "light"
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}>
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {selectedDayInfo.canTrain ? "Podés entrenar" : "Descanso recomendado"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Intensidad: {
                        selectedDayInfo.trainingIntensity === "intense" ? "Alta" :
                        selectedDayInfo.trainingIntensity === "moderate" ? "Moderada" :
                        selectedDayInfo.trainingIntensity === "light" ? "Suave" : "Reposo"
                      }
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase">Actividades recomendadas:</p>
                  <div className="flex flex-wrap gap-1">
                    {PHASE_INFO[selectedDayInfo.phase].training.activities.map((activity, i) => (
                      <span key={i} className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>

                {PHASE_INFO[selectedDayInfo.phase].training.avoid.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Evitar:</p>
                    <div className="flex flex-wrap gap-1">
                      {PHASE_INFO[selectedDayInfo.phase].training.avoid.map((activity, i) => (
                        <span key={i} className="px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Expected symptoms */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Síntomas posibles en esta fase:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOMS.filter(s => s.phase.includes(selectedDayInfo.phase)).map((symptom) => (
                    <span key={symptom.id} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                      {symptom.icon} {symptom.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-br from-salud/10 to-purple-500/10 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                  💡 Tips para esta fase
                </h4>
                <ul className="space-y-1">
                  {PHASE_INFO[selectedDayInfo.phase].training.tips.slice(0, 3).map((tip, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-salud">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
              <button
                onClick={() => setShowDayModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Cerrar
              </button>
              <button
                onClick={() => openLogModal(selectedDate)}
                className="flex-1 px-4 py-2.5 bg-salud hover:bg-pink-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Registrar día
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6 my-8 animate-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Registrar día
              </h2>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-salud/50 focus:border-salud outline-none"
                />
              </div>

              {/* Flujo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Flujo menstrual
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {FLOW_INTENSITIES.map((flow) => (
                    <button
                      key={flow.value}
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        flow_intensity: formData.flow_intensity === flow.value ? undefined : flow.value as any,
                      })}
                      className={`py-3 px-2 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                        formData.flow_intensity === flow.value
                          ? "ring-2 ring-salud text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                      style={{
                        backgroundColor: formData.flow_intensity === flow.value ? flow.color : undefined,
                      }}
                    >
                      <span>{flow.icon}</span>
                      <span>{flow.label}</span>
                    </button>
                  ))}
                </div>
                {formData.flow_intensity && (
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_period_start}
                      onChange={(e) => setFormData({ ...formData, is_period_start: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-salud focus:ring-salud"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Primer día del período
                    </span>
                  </label>
                )}
              </div>

              {/* Estado de ánimo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado de ánimo
                </label>
                <div className="flex gap-2">
                  {MOODS.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        mood: formData.mood === mood.value ? undefined : mood.value as any,
                      })}
                      className={`flex-1 py-3 rounded-xl text-2xl transition-all ${
                        formData.mood === mood.value
                          ? "ring-2 ring-offset-2 scale-110"
                          : "bg-gray-100 dark:bg-gray-800 hover:scale-105"
                      }`}
                      style={{ ringColor: formData.mood === mood.value ? mood.color : undefined }}
                    >
                      {mood.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Síntomas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Síntomas
                </label>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOMS.map((symptom) => (
                    <button
                      key={symptom.id}
                      type="button"
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5 ${
                        formData.symptoms?.includes(symptom.id)
                          ? "bg-salud text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span>{symptom.icon}</span>
                      <span>{symptom.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="¿Cómo te sentís hoy?"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-salud/50 focus:border-salud outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-salud hover:bg-pink-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
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