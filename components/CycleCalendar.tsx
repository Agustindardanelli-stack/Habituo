"use client";

import React from "react";

interface Props {
  cycle: any;
  fertileDays: string[];
}

export default function CycleCalendar({ cycle, fertileDays }: Props) {
  const today = new Date();

  function isSameDay(a: Date, b: Date) {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }

  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i - 15);
    return date;
  });

  return (
    <div className="grid grid-cols-7 gap-2 mt-4">
      {days.map((day, i) => {
        const iso = day.toISOString();
        const fertile = fertileDays.includes(iso);
        const bleeding =
          cycle?.days?.some((d: any) => d.date === iso && d.bleeding);

        return (
          <div
            key={i}
            className={`h-12 flex items-center justify-center rounded-lg border text-sm
            ${fertile ? "bg-green-100" : ""}
            ${bleeding ? "bg-pink-200" : ""}
            ${isSameDay(day, today) ? "border-blue-600" : "border-gray-300"}
          `}
          >
            {day.getDate()}
          </div>
        );
      })}
    </div>
  );
}
