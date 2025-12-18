"use client";

import { useState, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Heart,
  Flame,
  TrendingUp,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Sparkles,
  Tag,
  Clock,
  MoreHorizontal,
  Trash2,
  Edit3,
  Star,
  Filter,
  Lightbulb,
  PenLine,
  Quote,
  BarChart3,
  Zap,
} from "lucide-react";
import { useJournal } from "@/hooks/useJournal";
import {
  MOODS,
  ENERGY_LEVELS,
  JOURNAL_PROMPTS,
  PROMPT_CATEGORIES,
  SUGGESTED_TAGS,
  getRandomPrompt,
  analyzeContent,
  type NewJournalEntry,
  type JournalEntry,
} from "@/lib/api/journal";
import { toast } from "sonner";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function DiarioPage() {
  const {
    entries,
    stats,
    loading,
    addEntry,
    editEntry,
    removeEntry,
    toggleEntryFavorite,
    searchEntries,
  } = useJournal();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showPromptsModal, setShowPromptsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPromptCategory, setSelectedPromptCategory] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState<NewJournalEntry>({
    title: "",
    content: "",
    mood: undefined,
    energy_level: undefined,
    tags: [],
    date: new Date().toISOString().split("T")[0],
  });

  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);

  // Calendario
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
    const dayEntries = entries.filter(e => e.date === dateStr);
    const today = new Date().toISOString().split("T")[0];

    return {
      dateStr,
      entries: dayEntries,
      hasEntry: dayEntries.length > 0,
      isToday: dateStr === today,
      mood: dayEntries[0]?.mood,
    };
  };

  const openWriteModal = (date?: string, prompt?: string) => {
    setFormData({
      title: "",
      content: prompt ? `${prompt}\n\n` : "",
      mood: undefined,
      energy_level: undefined,
      tags: [],
      date: date || new Date().toISOString().split("T")[0],
    });
    setCurrentPrompt(prompt || null);
    setEditMode(false);
    setShowPromptsModal(false);
    setShowWriteModal(true);
  };

  const openEditModal = (entry: JournalEntry) => {
    setFormData({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      energy_level: entry.energy_level,
      tags: entry.tags,
      date: entry.date,
    });
    setSelectedEntry(entry);
    setEditMode(true);
    setShowEntryModal(false);
    setShowWriteModal(true);
  };

  const openEntryModal = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setShowEntryModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast.error("Escribí algo antes de guardar");
      return;
    }

    setIsSubmitting(true);

    let success;
    if (editMode && selectedEntry) {
      success = await editEntry(selectedEntry.id, formData);
      if (success) toast.success("Entrada actualizada ✓");
    } else {
      const newEntry = await addEntry(formData);
      success = !!newEntry;
      if (success) toast.success("Entrada guardada ✓");
    }

    if (!success) {
      toast.error("Error al guardar");
    } else {
      setShowWriteModal(false);
      setEditMode(false);
      setSelectedEntry(null);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar esta entrada?")) return;

    const success = await removeEntry(id);
    if (success) {
      toast.success("Entrada eliminada");
      setShowEntryModal(false);
      setSelectedEntry(null);
    } else {
      toast.error("Error al eliminar");
    }
    setMenuOpen(null);
  };

  const handleToggleFavorite = async (entry: JournalEntry) => {
    await toggleEntryFavorite(entry.id, !entry.is_favorite);
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag],
    }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      searchEntries(value);
    } else {
      searchEntries("");
    }
  };

  const prevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  const goToToday = () => setCurrentMonth(new Date());

  const selectRandomPrompt = (category?: string) => {
    const prompt = getRandomPrompt(category || undefined);
    openWriteModal(undefined, prompt.text);
  };

  const contentAnalysis = useMemo(() => {
    if (!formData.content || formData.content.length < 20) return null;
    return analyzeContent(formData.content);
  }, [formData.content]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-diario" />
      </div>
    );
  }

  const getMoodColor = (mood?: string) => {
    return MOODS.find(m => m.value === mood)?.color || "#9ca3af";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-diario/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-diario" />
            </div>
            Diario Personal
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Escribí, reflexioná y crecé cada día
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPromptsModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-diario text-diario hover:bg-diario/10 rounded-xl font-medium transition-colors"
          >
            <Lightbulb className="w-5 h-5" />
            <span className="hidden sm:inline">Inspiración</span>
          </button>
          <button
            onClick={() => openWriteModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-diario hover:bg-amber-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-diario/25"
          >
            <PenLine className="w-5 h-5" />
            Escribir
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-diario/10 flex items-center justify-center">
              <Flame className="w-6 h-6 text-diario" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Racha actual</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.streak || 0} días
              </p>
              <p className="text-xs text-gray-400">
                Récord: {stats?.longestStreak || 0} días
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Este mes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.entriesThisMonth || 0}
              </p>
              <p className="text-xs text-gray-400">
                Total: {stats?.totalEntries || 0} entradas
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Palabras totales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalWords?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-400">
                Promedio: {stats?.avgWords || 0} por entrada
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">
              {stats?.avgMood ? MOODS.find(m => m.score === Math.round(stats.avgMood!))?.icon || "😐" : "📊"}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ánimo promedio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.avgMood
                  ? MOODS.find(m => m.score === Math.round(stats.avgMood!))?.label || "—"
                  : "—"}
              </p>
              <p className="text-xs text-gray-400">Últimos 30 días</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Write Prompt */}
      {stats?.streak === 0 && (
        <div className="bg-gradient-to-r from-diario/10 to-amber-500/10 border border-diario/20 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-diario" />
                ¡Empezá tu racha hoy!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Escribir un poco cada día puede transformar tu bienestar mental.
              </p>
            </div>
            <button
              onClick={() => selectRandomPrompt()}
              className="px-4 py-2 bg-diario hover:bg-amber-600 text-white rounded-xl font-medium transition-colors whitespace-nowrap"
            >
              Escribir con prompt aleatorio
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar & Recent Entries */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calendar */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
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
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
              {WEEKDAYS.map(day => (
                <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={index} className="aspect-square border-b border-r border-gray-100 dark:border-gray-800" />;
                }

                const { entries: dayEntries, hasEntry, isToday, mood } = getDayData(day);

                return (
                  <button
                    key={index}
                    onClick={() => hasEntry ? openEntryModal(dayEntries[0]) : openWriteModal(getDateString(day))}
                    className={`aspect-square p-1 border-b border-r border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all relative group flex flex-col items-center justify-center ${
                      isToday ? "bg-diario/5" : ""
                    }`}
                  >
                    <div className={`text-sm font-medium ${
                      isToday
                        ? "w-7 h-7 bg-diario text-white rounded-full flex items-center justify-center"
                        : hasEntry
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 dark:text-gray-600"
                    }`}>
                      {day}
                    </div>
                    {hasEntry && (
                      <div
                        className="w-2 h-2 rounded-full mt-1"
                        style={{ backgroundColor: getMoodColor(mood) }}
                      />
                    )}
                    {!hasEntry && !isToday && (
                      <Plus className="w-4 h-4 text-gray-300 dark:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-4 text-xs">
              <span className="text-gray-500">Ánimo del día:</span>
              {MOODS.map(mood => (
                <div key={mood.value} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: mood.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{mood.icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Entries */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Entradas recientes</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 w-48 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-diario/50 focus:border-diario outline-none"
                />
              </div>
            </div>

            {entries.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Tu diario está vacío
                </h4>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Empezá a escribir y descubrí el poder del journaling
                </p>
                <button
                  onClick={() => openWriteModal()}
                  className="px-4 py-2 bg-diario hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
                >
                  Escribir primera entrada
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {entries.slice(0, 5).map(entry => (
                  <div
                    key={entry.id}
                    onClick={() => openEntryModal(entry)}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: `${getMoodColor(entry.mood)}20` }}
                      >
                        {MOODS.find(m => m.value === entry.mood)?.icon || "📝"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {entry.title}
                          </h4>
                          {entry.is_favorite && (
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                          {entry.content.substring(0, 150)}...
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(entry.date).toLocaleDateString("es-AR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span>{entry.word_count} palabras</span>
                          {entry.tags?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {entry.tags.slice(0, 2).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mood Distribution */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-diario" />
              Tu estado de ánimo
            </h3>
            {stats?.moodDistribution && Object.keys(stats.moodDistribution).length > 0 ? (
              <div className="space-y-3">
                {MOODS.map(mood => {
                  const count = stats.moodDistribution[mood.value] || 0;
                  const total = Object.values(stats.moodDistribution).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                  return (
                    <div key={mood.value}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <span>{mood.icon}</span>
                          <span className="text-gray-600 dark:text-gray-400">{mood.label}</span>
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percentage}%`, backgroundColor: mood.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                Registrá tu ánimo al escribir
              </p>
            )}
          </div>

          {/* Top Tags */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-diario" />
              Temas frecuentes
            </h3>
            {stats?.topTags && stats.topTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stats.topTags.map(({ tag, count }) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-diario/10 text-diario rounded-full text-sm font-medium"
                  >
                    #{tag} <span className="text-diario/60">({count})</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                Agregá tags a tus entradas
              </p>
            )}
          </div>

          {/* Writing Tips */}
          <div className="bg-gradient-to-br from-diario/5 to-amber-500/5 border border-diario/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-diario/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Quote className="w-5 h-5 text-diario" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                  Prompt del día
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  "{getRandomPrompt().text}"
                </p>
                <button
                  onClick={() => selectRandomPrompt()}
                  className="mt-3 text-sm text-diario hover:underline font-medium"
                >
                  Escribir sobre esto →
                </button>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              ¿Por qué escribir?
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Reduce el estrés</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Escribir libera tensiones acumuladas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Claridad mental</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Organiza pensamientos y emociones</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Autoconocimiento</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Descubrí patrones en tu vida</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Write Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl my-8 animate-in overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editMode ? "Editar entrada" : "Nueva entrada"}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {new Date(formData.date + "T12:00:00").toLocaleDateString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
              <button
                onClick={() => setShowWriteModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
                {/* Prompt indicator */}
                {currentPrompt && (
                  <div className="bg-diario/10 border border-diario/20 rounded-xl p-3 flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-diario flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-diario">{currentPrompt}</p>
                  </div>
                )}

                {/* Title */}
                <div>
                  <input
                    type="text"
                    placeholder="Título (opcional)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-medium focus:ring-2 focus:ring-diario/50 focus:border-diario outline-none"
                  />
                </div>

                {/* Content */}
                <div>
                  <textarea
                    placeholder="¿Qué tenés en mente hoy?"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-diario/50 focus:border-diario outline-none"
                    autoFocus
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>{formData.content.trim().split(/\s+/).filter(Boolean).length} palabras</span>
                    {contentAnalysis && (
                      <span className={`flex items-center gap-1 ${
                        contentAnalysis.sentiment === "positive" ? "text-green-500" :
                        contentAnalysis.sentiment === "negative" ? "text-red-500" :
                        "text-gray-400"
                      }`}>
                        <Sparkles className="w-3 h-3" />
                        Tono {contentAnalysis.sentiment === "positive" ? "positivo" :
                               contentAnalysis.sentiment === "negative" ? "reflexivo" : "neutral"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mood */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ¿Cómo te sentís?
                  </label>
                  <div className="flex gap-2">
                    {MOODS.map(mood => (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          mood: formData.mood === mood.value ? undefined : mood.value as any
                        })}
                        className={`flex-1 py-3 rounded-xl text-2xl transition-all ${
                          formData.mood === mood.value
                            ? "ring-2 ring-offset-2 scale-110"
                            : "bg-gray-100 dark:bg-gray-800 hover:scale-105"
                        }`}
                        style={{ ringColor: formData.mood === mood.value ? mood.color : undefined }}
                        title={mood.label}
                      >
                        {mood.icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nivel de energía
                  </label>
                  <div className="flex gap-2">
                    {ENERGY_LEVELS.map(energy => (
                      <button
                        key={energy.value}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          energy_level: formData.energy_level === energy.value ? undefined : energy.value
                        })}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                          formData.energy_level === energy.value
                            ? "text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                        style={{
                          backgroundColor: formData.energy_level === energy.value ? energy.color : undefined
                        }}
                      >
                        <span>{energy.icon}</span>
                        <span className="hidden sm:inline">{energy.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          formData.tags?.includes(tag)
                            ? "bg-diario text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-diario/50 focus:border-diario outline-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWriteModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.content.trim()}
                  className="flex-1 px-4 py-2.5 bg-diario hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
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

      {/* Entry View Modal */}
      {showEntryModal && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl my-8 animate-in overflow-hidden">
            {/* Header */}
            <div
              className="p-5 border-b border-gray-200 dark:border-gray-800"
              style={{ backgroundColor: `${getMoodColor(selectedEntry.mood)}10` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ backgroundColor: `${getMoodColor(selectedEntry.mood)}20` }}
                  >
                    {MOODS.find(m => m.value === selectedEntry.mood)?.icon || "📝"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedEntry.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(selectedEntry.date + "T12:00:00").toLocaleDateString("es-AR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span>{selectedEntry.word_count} palabras</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleFavorite(selectedEntry)}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedEntry.is_favorite
                        ? "text-amber-400"
                        : "text-gray-400 hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Star className={`w-5 h-5 ${selectedEntry.is_favorite ? "fill-current" : ""}`} />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen ? null : selectedEntry.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </button>
                    {menuOpen === selectedEntry.id && (
                      <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[140px]">
                        <button
                          onClick={() => {
                            setMenuOpen(null);
                            openEditModal(selectedEntry);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(selectedEntry.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowEntryModal(false);
                      setSelectedEntry(null);
                      setMenuOpen(null);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 max-h-[50vh] overflow-y-auto">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedEntry.content}
                </p>
              </div>

              {/* Tags */}
              {selectedEntry.tags?.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-diario/10 text-diario rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                {selectedEntry.mood && (
                  <span className="flex items-center gap-1">
                    {MOODS.find(m => m.value === selectedEntry.mood)?.icon}
                    {MOODS.find(m => m.value === selectedEntry.mood)?.label}
                  </span>
                )}
                {selectedEntry.energy_level && (
                  <span className="flex items-center gap-1">
                    {ENERGY_LEVELS.find(e => e.value === selectedEntry.energy_level)?.icon}
                    Energía {ENERGY_LEVELS.find(e => e.value === selectedEntry.energy_level)?.label.toLowerCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => {
                  setShowEntryModal(false);
                  setSelectedEntry(null);
                }}
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompts Modal */}
      {showPromptsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg my-8 animate-in overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-diario" />Inspiración para escribir
              </h2>
              <button
                onClick={() => setShowPromptsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedPromptCategory(null)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      !selectedPromptCategory
                        ? "bg-diario text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    Todas
                  </button>
                  {PROMPT_CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedPromptCategory(
                        selectedPromptCategory === cat.value ? null : cat.value
                      )}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1 ${
                        selectedPromptCategory === cat.value
                          ? "text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      }`}
                      style={{
                        backgroundColor: selectedPromptCategory === cat.value ? cat.color : undefined
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompts List */}
              <div className="space-y-2">
                {JOURNAL_PROMPTS
                  .filter(p => !selectedPromptCategory || p.category === selectedPromptCategory)
                  .map(prompt => {
                    const category = PROMPT_CATEGORIES.find(c => c.value === prompt.category);
                    return (
                      <button
                        key={prompt.id}
                        onClick={() => openWriteModal(undefined, prompt.text)}
                        className="w-full p-4 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                            style={{ backgroundColor: `${category?.color}20`, color: category?.color }}
                          >
                            {category?.icon}
                          </span>
                          <div className="flex-1">
                            <p className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                              {prompt.text}
                            </p>
                            <span className="text-xs text-gray-400 mt-1 inline-block">
                              {category?.label}
                            </span>
                          </div>
                          <PenLine className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
              <button
                onClick={() => setShowPromptsModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => selectRandomPrompt(selectedPromptCategory || undefined)}
                className="flex-1 px-4 py-2.5 bg-diario hover:bg-amber-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Prompt aleatorio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
