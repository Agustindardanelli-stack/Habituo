import { createClient } from "@/lib/supabase";

export type CycleLog = {
  id: string;
  user_id: string;
  date: string;
  flow_intensity?: "light" | "medium" | "heavy" | "spotting";
  is_period_start: boolean;
  symptoms: string[];
  mood?: "great" | "good" | "okay" | "bad" | "terrible";
  energy_level?: number;
  notes?: string;
  created_at: string;
};

export type CyclePrediction = {
  nextPeriodStart: Date;
  nextPeriodEnd: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  ovulationDate: Date;
  currentPhase: "menstrual" | "follicular" | "ovulation" | "luteal";
  daysUntilPeriod: number;
  cycleDay: number;
  cycleLength: number;
  periodLength: number;
};

export type DayPrediction = {
  date: string;
  phase: "menstrual" | "follicular" | "ovulation" | "luteal";
  isPeriod: boolean;
  isPeriodPredicted: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  fertilityLevel: "none" | "low" | "medium" | "high" | "peak";
  canTrain: boolean;
  trainingIntensity: "rest" | "light" | "moderate" | "intense";
  trainingTips: string[];
  symptoms: string[];
  recommendations: string[];
  energy: "low" | "medium" | "high";
};

export type NewCycleLog = {
  date: string;
  flow_intensity?: "light" | "medium" | "heavy" | "spotting";
  is_period_start?: boolean;
  symptoms?: string[];
  mood?: "great" | "good" | "okay" | "bad" | "terrible";
  energy_level?: number;
  notes?: string;
};

// Síntomas disponibles
export const SYMPTOMS = [
  { id: "cramps", label: "Cólicos", icon: "😣", phase: ["menstrual", "luteal"] },
  { id: "headache", label: "Dolor de cabeza", icon: "🤕", phase: ["menstrual", "luteal"] },
  { id: "bloating", label: "Hinchazón", icon: "🎈", phase: ["luteal", "menstrual"] },
  { id: "fatigue", label: "Fatiga", icon: "😴", phase: ["menstrual", "luteal"] },
  { id: "acne", label: "Acné", icon: "😖", phase: ["luteal"] },
  { id: "backpain", label: "Dolor de espalda", icon: "🔙", phase: ["menstrual"] },
  { id: "breast_tenderness", label: "Sensibilidad mamaria", icon: "💔", phase: ["luteal", "ovulation"] },
  { id: "mood_swings", label: "Cambios de humor", icon: "🎭", phase: ["luteal", "menstrual"] },
  { id: "cravings", label: "Antojos", icon: "🍫", phase: ["luteal"] },
  { id: "nausea", label: "Náuseas", icon: "🤢", phase: ["menstrual"] },
  { id: "insomnia", label: "Insomnio", icon: "🌙", phase: ["luteal"] },
  { id: "anxiety", label: "Ansiedad", icon: "😰", phase: ["luteal"] },
];

// Moods disponibles
export const MOODS = [
  { value: "great", label: "Genial", icon: "😄", color: "#10b981" },
  { value: "good", label: "Bien", icon: "🙂", color: "#22c55e" },
  { value: "okay", label: "Normal", icon: "😐", color: "#eab308" },
  { value: "bad", label: "Mal", icon: "😔", color: "#f97316" },
  { value: "terrible", label: "Muy mal", icon: "😢", color: "#ef4444" },
];

// Intensidades de flujo
export const FLOW_INTENSITIES = [
  { value: "spotting", label: "Manchado", color: "#fecaca", icon: "💧" },
  { value: "light", label: "Ligero", color: "#f87171", icon: "💧💧" },
  { value: "medium", label: "Medio", color: "#dc2626", icon: "💧💧💧" },
  { value: "heavy", label: "Abundante", color: "#991b1b", icon: "💧💧💧💧" },
];

// Información de fases con entrenamiento
export const PHASE_INFO = {
  menstrual: {
    name: "Menstrual",
    shortName: "Período",
    color: "#ef4444",
    bgColor: "bg-red-500",
    lightBg: "bg-red-50 dark:bg-red-950/30",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    icon: "🩸",
    emoji: "🌑",
    days: "1-5",
    energy: "low" as const,
    description: "Tu cuerpo está menstruando. Es normal sentir fatiga, cólicos y cambios de humor.",
    training: {
      canTrain: true,
      intensity: "light" as const,
      recommendation: "Ejercicio suave recomendado",
      activities: ["Yoga restaurativo", "Caminatas suaves", "Estiramientos", "Natación ligera"],
      avoid: ["HIIT", "Levantamiento pesado", "Ejercicios abdominales intensos"],
      tips: [
        "Escuchá a tu cuerpo, si necesitás descansar, descansá",
        "El movimiento suave puede aliviar los cólicos",
        "Mantenete hidratada",
        "Evitá inversiones en yoga si tenés flujo abundante",
      ],
    },
    selfCare: ["Descanso extra", "Alimentos ricos en hierro", "Compresas calientes", "Hidratación"],
    hormones: "Estrógeno y progesterona están en su punto más bajo",
  },
  follicular: {
    name: "Folicular",
    shortName: "Folicular",
    color: "#ec4899",
    bgColor: "bg-pink-500",
    lightBg: "bg-pink-50 dark:bg-pink-950/30",
    textColor: "text-pink-600 dark:text-pink-400",
    borderColor: "border-pink-200 dark:border-pink-800",
    icon: "🌸",
    emoji: "🌒",
    days: "6-13",
    energy: "high" as const,
    description: "El estrógeno comienza a subir. Tu energía y motivación aumentan progresivamente.",
    training: {
      canTrain: true,
      intensity: "intense" as const,
      recommendation: "¡Momento ideal para entrenar fuerte!",
      activities: ["HIIT", "Entrenamiento de fuerza", "Cardio intenso", "Clases grupales", "Deportes de equipo"],
      avoid: [],
      tips: [
        "Aprovechá el pico de energía para entrenamientos intensos",
        "Buen momento para probar ejercicios nuevos",
        "Tu cuerpo recupera más rápido en esta fase",
        "Ideal para establecer récords personales",
      ],
    },
    selfCare: ["Socializar", "Proyectos creativos", "Aprendizaje nuevo", "Actividades al aire libre"],
    hormones: "El estrógeno sube gradualmente, preparando la ovulación",
  },
  ovulation: {
    name: "Ovulación",
    shortName: "Ovulación",
    color: "#8b5cf6",
    bgColor: "bg-purple-500",
    lightBg: "bg-purple-50 dark:bg-purple-950/30",
    textColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    icon: "✨",
    emoji: "🌕",
    days: "14-16",
    energy: "high" as const,
    description: "Pico de estrógeno y liberación del óvulo. Máxima energía, confianza y sociabilidad.",
    training: {
      canTrain: true,
      intensity: "intense" as const,
      recommendation: "Máximo rendimiento físico",
      activities: ["Competencias", "Entrenamiento de alta intensidad", "Ejercicios de potencia", "Cardio vigoroso"],
      avoid: [],
      tips: [
        "Tu cuerpo está en su máximo potencial",
        "Cuidado extra con las articulaciones (laxitud por estrógeno)",
        "Excelente momento para socializar post-entreno",
        "Aprovechá la motivación natural",
      ],
    },
    selfCare: ["Actividades sociales", "Comunicación importante", "Proyectos colaborativos"],
    hormones: "Pico de estrógeno, liberación de LH y FSH",
  },
  luteal: {
    name: "Lútea",
    shortName: "Premenstrual",
    color: "#f59e0b",
    bgColor: "bg-amber-500",
    lightBg: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
    icon: "🌙",
    emoji: "🌘",
    days: "17-28",
    energy: "medium" as const,
    description: "La progesterona sube. Puede haber síntomas premenstruales hacia el final.",
    training: {
      canTrain: true,
      intensity: "moderate" as const,
      recommendation: "Reduce intensidad gradualmente",
      activities: ["Entrenamiento de fuerza moderado", "Pilates", "Yoga", "Caminatas", "Natación"],
      avoid: ["Entrenamientos muy largos", "Restricción calórica extrema"],
      tips: [
        "Tu cuerpo necesita más calorías en esta fase",
        "Enfocate en ejercicios que te hagan sentir bien",
        "El ejercicio puede ayudar con síntomas PMS",
        "Priorizá el sueño y la recuperación",
      ],
    },
    selfCare: ["Journaling", "Baños relajantes", "Alimentos reconfortantes saludables", "Tiempo a solas"],
    hormones: "Progesterona alta, luego baja si no hay embarazo",
  },
};

// Obtener logs del ciclo
export async function getCycleLogs(days: number = 180): Promise<CycleLog[]> {
  const supabase = createClient();

  const startDate = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("cycle_logs")
    .select("*")
    .gte("date", startDate)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching cycle logs:", error);
    return [];
  }

  return data || [];
}

// Crear o actualizar log del ciclo
export async function saveCycleLog(log: NewCycleLog): Promise<CycleLog | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Verificar si ya existe un log para esa fecha
  const { data: existing } = await supabase
    .from("cycle_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", log.date)
    .single();

  const logData = {
    flow_intensity: log.flow_intensity,
    is_period_start: log.is_period_start || false,
    symptoms: log.symptoms || [],
    mood: log.mood,
    energy_level: log.energy_level,
    notes: log.notes,
  };

  if (existing) {
    const { data, error } = await supabase
      .from("cycle_logs")
      .update(logData)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating cycle log:", error);
      return null;
    }
    return data;
  } else {
    const { data, error } = await supabase
      .from("cycle_logs")
      .insert({
        user_id: user.id,
        date: log.date,
        ...logData,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating cycle log:", error);
      return null;
    }
    return data;
  }
}

// Eliminar log del ciclo
export async function deleteCycleLog(date: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("cycle_logs")
    .delete()
    .eq("date", date);

  if (error) {
    console.error("Error deleting cycle log:", error);
    return false;
  }

  return true;
}

// Calcular predicciones del ciclo
export function calculatePredictions(logs: CycleLog[]): CyclePrediction | null {
  // Encontrar inicios de período (días con flujo)
  const periodDays = logs
    .filter((l) => l.flow_intensity)
    .map((l) => ({ date: new Date(l.date), isStart: l.is_period_start }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (periodDays.length < 1) {
    return null;
  }

  // Encontrar inicios de ciclo
  const cycleStarts: Date[] = [];
  let lastPeriodGroup: Date | null = null;

  for (const day of periodDays) {
    if (!lastPeriodGroup || (lastPeriodGroup.getTime() - day.date.getTime()) > 10 * 86400000) {
      cycleStarts.push(day.date);
      lastPeriodGroup = day.date;
    } else if (day.date > lastPeriodGroup) {
      lastPeriodGroup = day.date;
    }
  }

  // Calcular duración promedio del ciclo
  let avgCycleLength = 28;
  if (cycleStarts.length >= 2) {
    const cycleLengths: number[] = [];
    for (let i = 0; i < cycleStarts.length - 1 && i < 6; i++) {
      const diff = Math.round(
        (cycleStarts[i].getTime() - cycleStarts[i + 1].getTime()) / 86400000
      );
      if (diff >= 21 && diff <= 35) {
        cycleLengths.push(diff);
      }
    }
    if (cycleLengths.length > 0) {
      avgCycleLength = Math.round(
        cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
      );
    }
  }

  // Calcular duración promedio del período
  let avgPeriodLength = 5;
  // Simplificado: asumimos 5 días

  const lastPeriodStart = cycleStarts[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Día actual del ciclo
  let cycleDay = Math.floor(
    (today.getTime() - lastPeriodStart.getTime()) / 86400000
  ) + 1;

  // Próximo período
  let nextPeriodStart = new Date(lastPeriodStart);
  nextPeriodStart.setDate(nextPeriodStart.getDate() + avgCycleLength);

  // Si ya pasó, calcular el siguiente
  while (nextPeriodStart < today) {
    nextPeriodStart.setDate(nextPeriodStart.getDate() + avgCycleLength);
    cycleDay = cycleDay % avgCycleLength || avgCycleLength;
  }

  const nextPeriodEnd = new Date(nextPeriodStart);
  nextPeriodEnd.setDate(nextPeriodEnd.getDate() + avgPeriodLength - 1);

  // Ovulación (aprox. 14 días antes del próximo período)
  const ovulationDate = new Date(nextPeriodStart);
  ovulationDate.setDate(ovulationDate.getDate() - 14);

  // Ventana fértil (5 días antes de ovulación + día de ovulación + 1 día después)
  const fertileWindowStart = new Date(ovulationDate);
  fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);
  const fertileWindowEnd = new Date(ovulationDate);
  fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 1);

  // Días hasta el próximo período
  const daysUntilPeriod = Math.max(
    0,
    Math.ceil((nextPeriodStart.getTime() - today.getTime()) / 86400000)
  );

  // Fase actual basada en el día del ciclo
  const adjustedCycleDay = ((cycleDay - 1) % avgCycleLength) + 1;
  let currentPhase: CyclePrediction["currentPhase"];

  if (adjustedCycleDay <= avgPeriodLength) {
    currentPhase = "menstrual";
  } else if (adjustedCycleDay <= avgCycleLength - 16) {
    currentPhase = "follicular";
  } else if (adjustedCycleDay <= avgCycleLength - 12) {
    currentPhase = "ovulation";
  } else {
    currentPhase = "luteal";
  }

  return {
    nextPeriodStart,
    nextPeriodEnd,
    fertileWindowStart,
    fertileWindowEnd,
    ovulationDate,
    currentPhase,
    daysUntilPeriod,
    cycleDay: adjustedCycleDay,
    cycleLength: avgCycleLength,
    periodLength: avgPeriodLength,
  };
}

// Obtener predicción para un día específico
export function getDayPrediction(
  dateStr: string,
  prediction: CyclePrediction | null,
  logs: CycleLog[]
): DayPrediction {
  const date = new Date(dateStr);
  const log = logs.find((l) => l.date === dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Valores por defecto
  let phase: DayPrediction["phase"] = "follicular";
  let isPeriod = false;
  let isPeriodPredicted = false;
  let isFertile = false;
  let isOvulation = false;
  let fertilityLevel: DayPrediction["fertilityLevel"] = "none";

  if (prediction) {
    const cycleLength = prediction.cycleLength;
    const periodLength = prediction.periodLength;

    // Calcular día del ciclo para esta fecha
    const daysSinceLastPeriod = Math.floor(
      (date.getTime() - prediction.nextPeriodStart.getTime()) / 86400000
    ) + cycleLength;
    const dayInCycle = ((daysSinceLastPeriod % cycleLength) + cycleLength) % cycleLength + 1;

    // Determinar fase
    if (dayInCycle <= periodLength) {
      phase = "menstrual";
      isPeriodPredicted = date >= today;
    } else if (dayInCycle <= cycleLength - 16) {
      phase = "follicular";
    } else if (dayInCycle <= cycleLength - 12) {
      phase = "ovulation";
      isOvulation = dayInCycle === cycleLength - 14;
    } else {
      phase = "luteal";
    }

    // Verificar si está en período predicho
    if (date >= prediction.nextPeriodStart && date <= prediction.nextPeriodEnd) {
      isPeriodPredicted = true;
    }

    // Verificar fertilidad
    if (date >= prediction.fertileWindowStart && date <= prediction.fertileWindowEnd) {
      isFertile = true;
      const daysToOvulation = Math.abs(
        Math.floor((date.getTime() - prediction.ovulationDate.getTime()) / 86400000)
      );
      if (daysToOvulation === 0) {
        fertilityLevel = "peak";
        isOvulation = true;
      } else if (daysToOvulation <= 1) {
        fertilityLevel = "high";
      } else if (daysToOvulation <= 3) {
        fertilityLevel = "medium";
      } else {
        fertilityLevel = "low";
      }
    }
  }

  // Si hay log con flujo, es período real
  if (log?.flow_intensity) {
    isPeriod = true;
    phase = "menstrual";
  }

  // Información de entrenamiento según fase
  const phaseInfo = PHASE_INFO[phase];
  const training = phaseInfo.training;

  // Síntomas esperados para esta fase
  const expectedSymptoms = SYMPTOMS
    .filter((s) => s.phase.includes(phase))
    .map((s) => s.id);

  // Recomendaciones personalizadas
  const recommendations: string[] = [];
  if (phase === "menstrual") {
    recommendations.push("Priorizá el descanso y la hidratación");
    recommendations.push("Consumí alimentos ricos en hierro");
  } else if (phase === "follicular") {
    recommendations.push("¡Gran momento para nuevos desafíos!");
    recommendations.push("Tu energía está en aumento");
  } else if (phase === "ovulation") {
    recommendations.push("Aprovechá tu pico de energía");
    recommendations.push("Cuidado extra con las articulaciones");
  } else {
    recommendations.push("Reducí la intensidad gradualmente");
    recommendations.push("El autocuidado es clave en esta fase");
  }

  return {
    date: dateStr,
    phase,
    isPeriod,
    isPeriodPredicted,
    isFertile,
    isOvulation,
    fertilityLevel,
    canTrain: training.canTrain,
    trainingIntensity: training.intensity,
    trainingTips: training.tips,
    symptoms: expectedSymptoms,
    recommendations,
    energy: phaseInfo.energy,
  };
}

// Obtener estadísticas completas
export async function getCycleStats() {
  const logs = await getCycleLogs(180);
  const prediction = calculatePredictions(logs);

  // Síntomas más comunes
  const symptomCount: Record<string, number> = {};
  logs.forEach((log) => {
    (log.symptoms || []).forEach((s) => {
      symptomCount[s] = (symptomCount[s] || 0) + 1;
    });
  });
  const topSymptoms = Object.entries(symptomCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ ...SYMPTOMS.find((s) => s.id === id), count }));

  // Mood promedio
  const moodScores = { great: 5, good: 4, okay: 3, bad: 2, terrible: 1 };
  const moodLogs = logs.filter((l) => l.mood);
  const avgMoodScore = moodLogs.length > 0
    ? moodLogs.reduce((acc, l) => acc + (moodScores[l.mood!] || 3), 0) / moodLogs.length
    : null;

  // Duración promedio del período
  const periodDays = logs.filter((l) => l.flow_intensity).length;

  return {
    prediction,
    logs,
    periodDaysCount: periodDays,
    topSymptoms,
    avgMoodScore,
    totalLogs: logs.length,
    cycleLength: prediction?.cycleLength || 28,
    periodLength: prediction?.periodLength || 5,
  };
}