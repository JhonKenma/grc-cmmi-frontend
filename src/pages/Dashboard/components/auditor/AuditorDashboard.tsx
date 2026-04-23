// src/pages/Dashboard/components/auditor/AuditorDashboard.tsx
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Clock, CheckCircle, AlertCircle,
  ClipboardList, TrendingUp, ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, PieChart, Pie, Legend,
} from 'recharts';

import { DashboardAuditor } from '@/api/endpoints/dashboard.service';
import { KpiCard } from '../shared/KpiCard';
import { ChartCard } from '../shared/ChartCard';
import { AlertasList } from '../shared/AlertasList';

const GAP_COLORS: Record<string, string> = {
  critico: '#dc2626', alto: '#f97316', medio: '#f59e0b',
  bajo: '#84cc16', cumplido: '#22c55e', superado: '#10b981',
};

const ESTADO_COLORS: Record<string, string> = {
  pendiente: '#f59e0b', en_progreso: '#3b82f6', completada: '#8b5cf6',
  auditada: '#06b6d4', aprobada: '#22c55e', rechazada: '#ef4444', vencida: '#dc2626',
};

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente', en_progreso: 'En Progreso', completada: 'Completada',
  auditada: 'Auditada', aprobada: 'Aprobada', rechazada: 'Rechazada', vencida: 'Vencida',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs">
          <span style={{ color: p.fill }}>●</span>{' '}
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

interface Props { data: DashboardAuditor }

export const AuditorDashboard: React.FC<Props> = ({ data }) => {
  const { kpis, alertas, charts } = data;
  const navigate = useNavigate();

  const iqEstadoData = charts.iq_por_estado.map((d) => ({
    name: ESTADO_LABELS[d.estado] ?? d.estado,
    value: d.total,
    fill: ESTADO_COLORS[d.estado] ?? '#94a3b8',
  }));

  const gapData = charts.gap_clasificacion.map((d) => ({
    name: d.clasificacion.charAt(0).toUpperCase() + d.clasificacion.slice(1),
    value: d.total,
    fill: GAP_COLORS[d.clasificacion] ?? '#94a3b8',
  }));

  const cargaData = charts.carga_semanal.map((d) => ({
    semana: d.semana.slice(5), // MM-DD
    total: d.total,
  }));

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          label="IQ Pendientes de Auditar"
          value={kpis.iq_pendientes_auditoria}
          icon={Clock}
          iconBg={kpis.iq_pendientes_auditoria > 0 ? 'bg-amber-500' : 'bg-gray-400'}
          badge={kpis.iq_pendientes_auditoria > 0 ? { text: 'Requiere acción', variant: 'warning' } : undefined}
          href="/auditor/revisiones-iq"
        />
        <KpiCard
          label="En Mi Revisión"
          value={kpis.iq_en_revision_mia}
          icon={ShieldCheck}
          iconBg="bg-blue-500"
          href="/auditor/revisiones-iq"
        />
        <KpiCard
          label="Auditadas Este Mes"
          value={kpis.iq_auditadas_este_mes}
          icon={CheckCircle}
          iconBg="bg-green-500"
          href="/auditor/revisiones-iq"
        />
        <KpiCard
          label="Encuestas Pendientes"
          value={kpis.asignaciones_encuesta_pendientes}
          icon={ClipboardList}
          iconBg="bg-purple-500"
          badge={kpis.asignaciones_encuesta_pendientes > 0 ? { text: 'En espera', variant: 'warning' } : undefined}
          href="/auditor/revisiones"
        />
        <KpiCard
          label="IQ Vencidas"
          value={kpis.iq_vencidas}
          icon={AlertCircle}
          iconBg={kpis.iq_vencidas > 0 ? 'bg-red-500' : 'bg-gray-400'}
          href="/auditor/revisiones-iq"
        />
        <KpiCard
          label="GAP Promedio (mis auditorías)"
          value={kpis.gap_promedio_mis_auditorias !== null ? kpis.gap_promedio_mis_auditorias.toFixed(1) : '—'}
          icon={TrendingUp}
          iconBg="bg-teal-500"
        />
      </div>

      {/* Alertas */}
      {alertas.length > 0 && <AlertasList alertas={alertas} />}

      {/* Acceso rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/auditor/revisiones-iq')}
          className="flex items-center justify-between bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl px-5 py-4 transition-colors group"
        >
          <div className="text-left">
            <p className="text-sm font-semibold text-violet-900">Revisar Evaluaciones IQ</p>
            <p className="text-xs text-violet-600 mt-0.5">{kpis.iq_pendientes_auditoria} pendientes de auditar</p>
          </div>
          <ArrowRight size={18} className="text-violet-400 group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={() => navigate('/auditor/revisiones')}
          className="flex items-center justify-between bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl px-5 py-4 transition-colors group"
        >
          <div className="text-left">
            <p className="text-sm font-semibold text-purple-900">Revisar Encuestas</p>
            <p className="text-xs text-purple-600 mt-0.5">{kpis.asignaciones_encuesta_pendientes} en espera</p>
          </div>
          <ArrowRight size={18} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Estado de Evaluaciones IQ"
          subtitle="En toda la empresa"
          action={{ label: 'Ver todas', onClick: () => navigate('/auditor/revisiones-iq') }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={iqEstadoData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                {iqEstadoData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Distribución de Brechas (GAP)"
          subtitle="Clasificación de las brechas encontradas"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gapData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Total" radius={[4, 4, 0, 0]}>
                {gapData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Carga semanal */}
      {cargaData.length > 0 && (
        <ChartCard
          title="Mi Carga Semanal"
          subtitle="Evaluaciones IQ auditadas por semana"
          height="h-48"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cargaData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="semana" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" name="Auditadas" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
};