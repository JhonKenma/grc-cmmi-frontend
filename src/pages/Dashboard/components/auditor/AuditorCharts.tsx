// src/pages/Dashboard/components/auditor/AuditorCharts.tsx
import { DashboardAuditor } from '@/api/endpoints/dashboard.service';

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente', en_progreso: 'En Progreso', completada: 'Completada',
  auditada: 'Auditada', aprobada: 'Aprobada', rechazada: 'Rechazada', vencida: 'Vencida',
};

const GAP_COLORS: Record<string, string> = {
  critico: 'bg-red-600', alto: 'bg-red-400', medio: 'bg-orange-400',
  bajo: 'bg-yellow-400', cumplido: 'bg-green-500', superado: 'bg-emerald-600',
};

const BarChart: React.FC<{ items: { label: string; value: number; colorClass: string }[] }> = ({ items }) => {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">{item.label}</span>
            <span className="font-semibold">{item.value}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`${item.colorClass} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

interface Props { charts: DashboardAuditor['charts'] }

export const AuditorCharts: React.FC<Props> = ({ charts }) => {
  const iqEstado = charts.iq_por_estado.map((d) => ({
    label: ESTADO_LABELS[d.estado] ?? d.estado,
    value: d.total,
    colorClass: 'bg-blue-500',
  }));

  const gapClasificacion = charts.gap_clasificacion.map((d) => ({
    label: d.clasificacion.charAt(0).toUpperCase() + d.clasificacion.slice(1),
    value: d.total,
    colorClass: GAP_COLORS[d.clasificacion] ?? 'bg-gray-400',
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="text-base font-semibold text-gray-900 mb-4">IQ por Estado</h3>
        <BarChart items={iqEstado} />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Distribución de GAP</h3>
        <BarChart items={gapClasificacion} />
      </div>
      {charts.carga_semanal.length > 0 && (
        <div className="card md:col-span-2">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Carga Semanal (mis auditorías)</h3>
          <BarChart
            items={charts.carga_semanal.map((d) => ({
              label: d.semana,
              value: d.total,
              colorClass: 'bg-teal-500',
            }))}
          />
        </div>
      )}
    </div>
  );
};