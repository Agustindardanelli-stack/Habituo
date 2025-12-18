export default function CycleStats({ cycle }: { cycle: any }) {
  return (
    <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border">
      <h3 className="font-semibold mb-3">Resumen del ciclo</h3>

      <div className="flex flex-col gap-2 text-sm">
        <div>
          <strong>Último periodo:</strong> {cycle.lastPeriodStart}
        </div>
        <div>
          <strong>Duración del ciclo:</strong> {cycle.averageCycleLength} días
        </div>
        <div>
          <strong>Duración del periodo:</strong>{" "}
          {cycle.averagePeriodLength} días
        </div>
      </div>
    </div>
  );
}
