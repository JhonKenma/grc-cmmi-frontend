// src/pages/Dashboard/components/admin/AdminCharts.tsx
import { DashboardAdmin } from '@/api/endpoints/dashboard.service';

const ESTADO_LABELS: Record<string, string> = {
  activa: 'Activa', en_progreso: 'En Progreso', completada: 'Completada',
  vencida: 'Vencida', pendiente: 'Pendiente', auditada: 'Auditada',
  aprobada: 'Aprobada', rechazada: 'Rechazada', completado: 'Completado',
  pendiente_auditoria: 'Pend. Auditoría', vencido: 'Vencido',
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
            <span className="font-semibold text-gray-900">{item.value}</span>
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

interface Props { charts: DashboardAdmin['charts'] }

export const AdminCharts: React.FC<Props> = ({ charts }) => {
  const progreso = charts.progreso_evaluaciones.map((d) => ({
    label: ESTADO_LABELS[d.estado] ?? d.estado,
    value: d.total,
    colorClass: d.estado === 'vencida' ? 'bg-red-500' : d.estado === 'completada' ? 'bg-green-500' : 'bg-blue-500',
  }));

  const iqEstado = charts.iq_por_estado.map((d) => ({
    label: ESTADO_LABELS[d.estado] ?? d.estado,
    value: d.total,
    colorClass: 'bg-violet-500',
  }));

  const asignaciones = charts.asignaciones_por_estado.map((d) => ({
    label: ESTADO_LABELS[d.estado] ?? d.estado,
    value: d.total,
    colorClass: d.estado === 'vencido' ? 'bg-red-500' : d.estado === 'completado' ? 'bg-green-500' : 'bg-blue-500',
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Evaluaciones por Estado</h3>
          <BarChart items={progreso} />
        </div>
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Evaluaciones IQ por Estado</h3>
          <BarChart items={iqEstado} />
        </div>
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Asignaciones por Estado</h3>
          <BarChart items={asignaciones} />
        </div>
      </div>

      {/* GAP por sección — tabla */}
      {charts.gap_por_seccion.length > 0 && (
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">GAP por Sección (última IQ auditada)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-600 font-medium">Sección</th>
                  <th className="text-center py-2 text-gray-600 font-medium">Actual</th>
                  <th className="text-center py-2 text-gray-600 font-medium">Deseado</th>
                  <th className="text-center py-2 text-gray-600 font-medium">GAP</th>
                  <th className="text-left py-2 text-gray-600 font-medium">Clasificación</th>
                </tr>
              </thead>
              <tbody>
                {charts.gap_por_seccion.map((row) => (
                  <tr key={row.seccion} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 text-gray-900 max-w-xs truncate">{row.seccion}</td>
                    <td className="py-2 text-center text-gray-700">{Number(row.nivel_actual).toFixed(1)}</td>
                    <td className="py-2 text-center text-gray-700">{Number(row.nivel_deseado).toFixed(1)}</td>
                    <td className="py-2 text-center font-semibold text-gray-900">{Number(row.gap).toFixed(1)}</td>
                    <td className="py-2">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full text-white font-medium ${GAP_COLORS[row.clasificacion_gap] ?? 'bg-gray-400'}`}>
                        {row.clasificacion_gap}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};