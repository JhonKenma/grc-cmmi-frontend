// src/pages/Dashboard/components/usuario/UsuarioDashboard.tsx
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Brain, CheckCircle, AlertCircle,
  Clock, ArrowRight, Loader,
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts';

import { DashboardUsuario } from '@/api/endpoints/dashboard.service';
import { KpiCard } from '../shared/KpiCard';
import { ChartCard } from '../shared/ChartCard';
import { AlertasList } from '../shared/AlertasList';

const ESTADO_COLORS: Record<string, string> = {
  pendiente: '#f59e0b', en_progreso: '#3b82f6', completado: '#10b981',
  vencido: '#ef4444', pendiente_auditoria: '#f97316', auditado: '#06b6d4',
};
const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente', en_progreso: 'En Progreso', completado: 'Completado',
  vencido: 'Vencido', pendiente_auditoria: 'En Revisión', auditado: 'Auditado',
};
const IQ_COLORS: Record<string, string> = {
  pendiente: '#f59e0b', en_progreso: '#8b5cf6', completada: '#10b981',
  auditada: '#06b6d4', aprobada: '#22c55e', rechazada: '#ef4444', vencida: '#dc2626',
};
const IQ_LABELS: Record<string, string> = {
  pendiente: 'Pendiente', en_progreso: 'En Progreso', completada: 'Completada',
  auditada: 'Auditada', aprobada: 'Aprobada', rechazada: 'Rechazada', vencida: 'Vencida',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs">
          <span style={{ color: p.payload.fill }}>●</span>{' '}
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// Barra de progreso visual
const ProgressBar: React.FC<{ completadas: number; total: number; color: string }> = ({
  completadas, total, color
}) => {
  const pct = total > 0 ? Math.round((completadas / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Progreso</span>
        <span className="font-medium text-gray-700">{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
};

interface Props { data: DashboardUsuario }

export const UsuarioDashboard: React.FC<Props> = ({ data }) => {
  const { kpis, alertas, charts } = data;
  const navigate = useNavigate();
  const { asignaciones_encuesta: ae, evaluaciones_iq: iq } = kpis;

  const totalEncuestas = ae.pendientes + ae.en_progreso + ae.completadas + ae.vencidas;
  const totalIQ = iq.pendientes + iq.completadas + iq.vencidas;

  const encuestasChartData = charts.mis_asignaciones_por_estado.map((d) => ({
    name: ESTADO_LABELS[d.estado] ?? d.estado,
    value: d.total,
    fill: ESTADO_COLORS[d.estado] ?? '#94a3b8',
  }));

  const iqChartData = charts.mis_iq_por_estado.map((d) => ({
    name: IQ_LABELS[d.estado] ?? d.estado,
    value: d.total,
    fill: IQ_COLORS[d.estado] ?? '#94a3b8',
  }));

  return (
    <div className="space-y-5">
      {/* Alertas al tope si hay vencidos */}
      {alertas.length > 0 && <AlertasList alertas={alertas} />}

      {/* Tarjetas de resumen encuestas */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Mis Encuestas</h3>
            <p className="text-xs text-gray-500 mt-0.5">{totalEncuestas} total asignadas</p>
          </div>
          <button
            onClick={() => navigate('/mis-tareas')}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todas <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Pendientes', value: ae.pendientes, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
            { label: 'En Progreso', value: ae.en_progreso, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Loader },
            { label: 'Completadas', value: ae.completadas, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle },
            { label: 'Vencidas', value: ae.vencidas, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle },
          ].map(({ label, value, color, bg, border, icon: Icon }) => (
            <button
              key={label}
              onClick={() => navigate('/mis-tareas')}
              className={`${bg} ${border} border rounded-lg p-3 text-left hover:shadow-sm transition-all`}
            >
              <Icon size={16} className={`${color} mb-1`} />
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </button>
          ))}
        </div>

        <ProgressBar
          completadas={ae.completadas}
          total={totalEncuestas}
          color="#10b981"
        />

        {/* Próximo vencimiento */}
        {ae.proxima_vencimiento && (
          <div className="mt-4 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-amber-500" />
              <div>
                <p className="text-xs font-medium text-amber-900">
                  {ae.proxima_vencimiento['dimension__nombre'] ?? 'Evaluación'}
                </p>
                <p className="text-xs text-amber-600">
                  Vence: {new Date(ae.proxima_vencimiento.fecha_limite).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/mis-tareas')}
              className="text-xs text-amber-700 font-medium hover:underline"
            >
              Ir →
            </button>
          </div>
        )}
      </div>

      {/* Tarjetas de resumen IQ */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Mis Evaluaciones IQ</h3>
            <p className="text-xs text-gray-500 mt-0.5">{totalIQ} total asignadas</p>
          </div>
          <button
            onClick={() => navigate('/evaluaciones-iq/mis-asignaciones')}
            className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
          >
            Ver todas <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Pendientes', value: iq.pendientes, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', icon: Brain },
            { label: 'Completadas', value: iq.completadas, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle },
            { label: 'Vencidas', value: iq.vencidas, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle },
          ].map(({ label, value, color, bg, border, icon: Icon }) => (
            <button
              key={label}
              onClick={() => navigate('/evaluaciones-iq/mis-asignaciones')}
              className={`${bg} ${border} border rounded-lg p-3 text-left hover:shadow-sm transition-all`}
            >
              <Icon size={16} className={`${color} mb-1`} />
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </button>
          ))}
        </div>

        <ProgressBar completadas={iq.completadas} total={totalIQ} color="#8b5cf6" />

        {iq.proxima_vencimiento && (
          <div className="mt-4 flex items-center justify-between bg-violet-50 border border-violet-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-violet-500" />
              <div>
                <p className="text-xs font-medium text-violet-900">
                  {iq.proxima_vencimiento['evaluacion__nombre']}
                </p>
                <p className="text-xs text-violet-600">
                  Vence: {new Date(iq.proxima_vencimiento.fecha_limite).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/evaluaciones-iq/mis-asignaciones')}
              className="text-xs text-violet-700 font-medium hover:underline"
            >
              Ir →
            </button>
          </div>
        )}
      </div>

      {/* Gráficos */}
      {(encuestasChartData.length > 0 || iqChartData.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {encuestasChartData.length > 0 && (
            <ChartCard
              title="Encuestas por Estado"
              action={{ label: 'Ver', onClick: () => navigate('/mis-tareas') }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={encuestasChartData} cx="50%" cy="50%" outerRadius={80} paddingAngle={2} dataKey="value">
                    {encuestasChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
          {iqChartData.length > 0 && (
            <ChartCard
              title="IQ por Estado"
              action={{ label: 'Ver', onClick: () => navigate('/evaluaciones-iq/mis-asignaciones') }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={iqChartData} cx="50%" cy="50%" outerRadius={80} paddingAngle={2} dataKey="value">
                    {iqChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}
    </div>
  );
};