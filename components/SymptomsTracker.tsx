"use client";

import React from "react";

const symptomsList = [
  "Dolor",
  "Baja energía",
  "Alta energía",
  "Antojos",
  "Cambios de humor",
  "Hinchazón",
  "Acné",
];

export default function SymptomsTracker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (sym: string[]) => void;
}) {
  function toggle(symptom: string) {
    if (selected.includes(symptom)) {
      onChange(selected.filter((s) => s !== symptom));
    } else {
      onChange([...selected, symptom]);
    }
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Síntomas de hoy</h3>
      <div className="flex flex-wrap gap-2">
        {symptomsList.map((sym) => (
          <button
            key={sym}
            onClick={() => toggle(sym)}
            className={`px-3 py-2 rounded-lg border text-sm
              ${
                selected.includes(sym)
                  ? "bg-pink-200 border-pink-500"
                  : "bg-white"
              }`}
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  );
}
