import { Card } from '@/components/common';

export function HeatmapLeyenda() {
  const leyenda = [
    {
      nivel: 'CRÍTICO / EXTREMO',
      rango: '15 - 25 (Prob 5 × Impacto 3-5 o Prob 4-5 × Impacto 4-5)',
      color: 'bg-red-500',
      descripcion: 'Riesgo que requiere atención inmediata',
    },
    {
      nivel: 'ALTO',
      rango: '10 - 14 (Prob 3-5 × Impacto 3-4, etc.)',
      color: 'bg-orange-500',
      descripcion: 'Riesgo significativo que debe mitigarse',
    },
    {
      nivel: 'MODERADO',
      rango: '5 - 9 (Prob 1-4 × Impacto 1-3, etc.)',
      color: 'bg-yellow-500',
      descripcion: 'Riesgo que requiere monitoreo',
    },
    {
      nivel: 'BAJO',
      rango: '1 - 4 (Prob 1-2 × Impacto 1-2)',
      color: 'bg-green-500',
      descripcion: 'Riesgo aceptable bajo control',
    },
  ];

  return (
    <Card className="rounded-xl p-5">
      <h3 className="mb-4 flex items-center text-base font-semibold text-slate-900">
        <span className="mr-2">📖</span> Leyenda de Clasificación
      </h3>

      <div className="space-y-3">
        {leyenda.map((item) => (
          <div key={item.nivel} className="rounded-lg border border-slate-200 p-3 transition hover:bg-slate-50">
            <div className="flex items-start gap-3">
              <div className={`mt-1 h-6 w-6 flex-shrink-0 rounded ${item.color}`} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{item.nivel}</p>
                <p className="text-xs text-slate-600">Rango: {item.rango}</p>
                <p className="mt-1 text-xs text-slate-700">{item.descripcion}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-cyan-200 bg-cyan-50 p-3">
        <p className="text-xs text-cyan-800">
          <strong>💡 Nota:</strong> La clasificación se calcula como{' '}
          <span className="font-mono font-bold">Probabilidad × Impacto</span>. Cada celda muestra la cantidad de
          riesgos para esa combinación.
        </p>
      </div>
    </Card>
  );
}
