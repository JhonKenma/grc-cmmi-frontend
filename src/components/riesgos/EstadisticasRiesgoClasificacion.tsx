import { Card } from '@/components/common';
import { AlertTriangle, AlertCircle, AlertOctagon, CheckCircle } from 'lucide-react';

interface EstadisticasRiesgoProps {
  bajo: number;
  medio: number;
  alto: number;
  critico: number;
}

export function EstadisticasRiesgoClasificacion({ bajo, medio, alto, critico }: EstadisticasRiesgoProps) {
  const total = bajo + medio + alto + critico;
  const porcentajes = {
    bajo: total > 0 ? Math.round((bajo / total) * 100) : 0,
    medio: total > 0 ? Math.round((medio / total) * 100) : 0,
    alto: total > 0 ? Math.round((alto / total) * 100) : 0,
    critico: total > 0 ? Math.round((critico / total) * 100) : 0,
  };

  const items = [
    {
      label: 'Crítico',
      value: critico,
      porcentaje: porcentajes.critico,
      icon: AlertOctagon,
      colors: 'bg-red-100 border-red-300 text-red-900',
      barColor: 'bg-red-600',
    },
    {
      label: 'Alto',
      value: alto,
      porcentaje: porcentajes.alto,
      icon: AlertTriangle,
      colors: 'bg-orange-100 border-orange-300 text-orange-900',
      barColor: 'bg-orange-500',
    },
    {
      label: 'Medio',
      value: medio,
      porcentaje: porcentajes.medio,
      icon: AlertCircle,
      colors: 'bg-yellow-100 border-yellow-300 text-yellow-900',
      barColor: 'bg-yellow-400',
    },
    {
      label: 'Bajo',
      value: bajo,
      porcentaje: porcentajes.bajo,
      icon: CheckCircle,
      colors: 'bg-green-100 border-green-300 text-green-900',
      barColor: 'bg-green-500',
    },
  ];

  return (
    <Card className="rounded-xl p-5">
      <h3 className="mb-4 flex items-center text-base font-semibold text-slate-900">
        <span className="mr-2">📊</span> Estadísticas por Clasificación
      </h3>

      <div className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`rounded-lg border p-3 ${item.colors}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon size={18} />
                  <span className="font-semibold">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{item.value}</div>
                  <div className="text-xs opacity-75">{item.porcentaje}%</div>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div className={`h-full rounded-full ${item.barColor}`} style={{ width: `${item.porcentaje}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg bg-slate-100 p-3">
        <p className="text-center text-sm font-semibold text-slate-700">Total de Riesgos: {total}</p>
      </div>
    </Card>
  );
}
