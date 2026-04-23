// src/pages/Dashboard/components/admin/AdminDashboard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, Brain, ClipboardList,
  Truck, TrendingUp, AlertCircle, Clock,
  CheckCircle, BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

import { DashboardAdmin } from '@/api/endpoints/dashboard.service';
import { KpiCard } from '../shared/KpiCard';
import { ChartCard } from '../shared/ChartCard';
import { SectionTabs } from '../shared/SectionTabs';
import { AlertasList } from '../shared/AlertasList';
import { EmptyState } from '../shared/EmptyState';

// ── Colores ──────────────────────────────────────────────────────────────────
const ESTADO_COLORS: Record<string, string> = {
  activa: '#3b82f6', en_progreso: '#8b5cf6', completada: '#10b981',
  vencida: '#ef4444', pendiente: '#f59e0b', auditada: '#06b6d4',
  aprobada: '#22c55e', rechazada: '#f43f5e', completado: '#10b981',
  pendiente_auditoria: '#f97316', vencido: '#ef4444',
};

const GAP_COLORS: Record<string, string> = {
  critico: '#dc2626', alto: '#f97316', medio: '#f59e0b',
  bajo: '#84cc16', cumplido: '#22c55e', superado: '#10b981',
};

const ESTADO_LABELS: Record<string, string> = {
  activa: 'Activa', en_progreso: 'En Progreso', completada: 'Completada',
  vencida: 'Vencida', pendiente: 'Pendiente', auditada: 'Auditada',
  aprobada: 'Aprobada', rechazada: 'Rechazada', completado: 'Completado',
  pendiente_auditoria: 'Pend. Auditoría', vencido: 'Vencido',
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs text-gray-600">
          <span style={{ color: p.fill || p.stroke }}>●</span>{' '}
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
interface Props { data: DashboardAdmin }

export const AdminDashboard: React.FC<Props> = ({ data }) => {
  const { kpis, alertas, charts } = data;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resumen');

  const tabs = [
    { id: 'resumen',     label: 'Resumen' },
    { id: 'evaluaciones', label: 'Evaluaciones', count: kpis.evaluaciones_encuesta.activas + kpis.evaluaciones_iq.pendientes },
    { id: 'gap',         label: 'Análisis GAP', count: charts.gap_por_seccion.length },
    { id: 'asignaciones', label: 'Asignaciones', count: kpis.asignaciones.pendientes },
  ];

  // Datos para gráficos
  const evalEncuestaData = charts.progreso_evaluaciones.map((d) => ({
    name: ESTADO_LABELS[d.estado] ?? d.estado,
    value: d.total,
    fill: ESTADO_COLORS[d.estado] ?? '#94a3b8',
  }));

  const evalIQData = charts.iq_por_estado.map((d) => ({
    name: ESTADO_LABELS[d.estado] ?? d.estado,
    value: d.total,
    fill: ESTADO_COLORS[d.estado] ?? '#94a3b8',
  }));

  const asignacionesData = charts.asignaciones_por_estado.map((d) => ({
    name: ESTADO_LABELS[d.estado] ?? d.estado,
    value: d.total,
    fill: ESTADO_COLORS[d.estado] ?? '#94a3b8',
  }));

  const radarData = charts.gap_por_seccion.slice(0, 8).map((d) => ({
    seccion: d.seccion.length > 20 ? d.seccion.slice(0, 20) + '…' : d.seccion,
    actual: Number(d.nivel_actual),
    deseado: Number(d.nivel_deseado),
  }));

  const proveedoresData = charts.proveedores_por_riesgo.map((d) => ({
    name: d.nivel_riesgo.charAt(0).toUpperCase() + d.nivel_riesgo.slice(1),
    value: d.total,
  }));
  const PIE_COLORS = ['#ef4444', '#f59e0b', '#22c55e'];

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <SectionTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* ── TAB: RESUMEN ────────────────────────────────────────────── */}
      {activeTab === 'resumen' && (
        <div className="space-y-5">
          {/* Plan banner */}
          {kpis.plan && (
            <div className={`
              rounded-xl border px-5 py-3 flex items-center justify-between
              ${kpis.plan.esta_activo
                ? 'bg-blue-50 border-blue-200'
                : 'bg-red-50 border-red-200'}
            `}>
              <div>
                <span className="text-sm font-semibold text-gray-800">
                  Plan {kpis.plan.tipo.charAt(0).toUpperCase() + kpis.plan.tipo.slice(1)}
                </span>
                <span className={`ml-3 text-xs font-medium ${kpis.plan.esta_activo ? 'text-blue-700' : 'text-red-700'}`}>
                  {kpis.plan.esta_activo
                    ? kpis.plan.dias_restantes !== null
                      ? `${kpis.plan.dias_restantes} días restantes`
                      : 'Sin vencimiento'
                    : 'Plan vencido'}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                Máx. {kpis.plan.max_usuarios} usuarios · {kpis.usuarios_activos} activos
              </span>
            </div>
          )}

          {/* KPIs grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Usuarios Activos"
              value={kpis.usuarios_activos}
              icon={Users}
              iconBg="bg-blue-500"
              href="/usuarios"
            />
            <KpiCard
              label="Evaluaciones Activas"
              value={kpis.evaluaciones_encuesta.activas}
              icon={FileText}
              iconBg="bg-purple-500"
              badge={kpis.evaluaciones_encuesta.vencidas > 0
                ? { text: `${kpis.evaluaciones_encuesta.vencidas} vencidas`, variant: 'danger' }
                : undefined}
              href="/asignaciones/mis-evaluaciones"
            />
            <KpiCard
              label="IQ Pendientes"
              value={kpis.evaluaciones_iq.pendientes}
              icon={Brain}
              iconBg="bg-violet-500"
              badge={kpis.evaluaciones_iq.en_auditoria > 0
                ? { text: `${kpis.evaluaciones_iq.en_auditoria} en auditoría`, variant: 'warning' }
                : undefined}
              href="/evaluaciones-inteligentes/gestionar-asignaciones"
            />
            <KpiCard
              label="GAP Promedio"
              value={kpis.gap_promedio !== null ? kpis.gap_promedio.toFixed(1) : '—'}
              icon={TrendingUp}
              iconBg={kpis.gap_promedio && kpis.gap_promedio >= 2 ? 'bg-red-500' : 'bg-emerald-500'}
              href="/reportes/evaluacion-iq"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Tareas Pendientes"
              value={kpis.asignaciones.pendientes}
              icon={Clock}
              iconBg="bg-amber-500"
              href="/asignaciones/mis-evaluaciones"
            />
            <KpiCard
              label="En Progreso"
              value={kpis.asignaciones.en_progreso}
              icon={ClipboardList}
              iconBg="bg-indigo-500"
              href="/asignaciones/mis-evaluaciones"
            />
            <KpiCard
              label="Pend. Auditoría"
              value={kpis.asignaciones.pendiente_auditoria}
              icon={CheckCircle}
              iconBg="bg-cyan-500"
              badge={kpis.asignaciones.pendiente_auditoria > 0
                ? { text: 'Requiere acción', variant: 'warning' }
                : undefined}
              href="/asignaciones/mis-evaluaciones"
            />
            <KpiCard
              label="Proveedores"
              value={kpis.proveedores.total}
              icon={Truck}
              iconBg="bg-teal-500"
              badge={kpis.proveedores.riesgo_alto > 0
                ? { text: `${kpis.proveedores.riesgo_alto} riesgo alto`, variant: 'danger' }
                : undefined}
              href="/proveedores"
            />
          </div>

          {/* Alertas */}
          {alertas.length > 0 && <AlertasList alertas={alertas} />}

          {/* Gráficos resumen 2 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard
              title="Distribución de Evaluaciones"
              subtitle="Encuestas por estado"
              action={{ label: 'Ver todas', onClick: () => navigate('/asignaciones/mis-evaluaciones') }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={evalEncuestaData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Total" radius={[4, 4, 0, 0]}>
                    {evalEncuestaData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Proveedores por Riesgo"
              subtitle="Distribución de criticidad"
              action={{ label: 'Ver proveedores', onClick: () => navigate('/proveedores') }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={proveedoresData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {proveedoresData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {/* ── TAB: EVALUACIONES ───────────────────────────────────────── */}
      {activeTab === 'evaluaciones' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <KpiCard label="Completadas" value={kpis.evaluaciones_encuesta.completadas} icon={CheckCircle} iconBg="bg-green-500" href="/asignaciones/mis-evaluaciones" />
            <KpiCard label="IQ Auditadas" value={kpis.evaluaciones_iq.auditadas} icon={Brain} iconBg="bg-violet-500" href="/reportes/evaluacion-iq" />
            <KpiCard 
            label="Vencidas" 
            value={kpis.evaluaciones_encuesta.vencidas + kpis.evaluaciones_iq.pendientes} 
            icon={AlertCircle} 
            iconBg="bg-red-500" 
            href="/asignaciones/mis-evaluaciones" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Evaluaciones IQ por Estado" subtitle="Estado actual de todas las IQ">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={evalIQData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={60} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Total" radius={[0, 4, 4, 0]}>
                    {evalIQData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Encuestas por Estado">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={evalEncuestaData} cx="50%" cy="50%" outerRadius={90} paddingAngle={2} dataKey="value">
                    {evalEncuestaData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {/* ── TAB: GAP ─────────────────────────────────────────────────── */}
      {activeTab === 'gap' && (
        <div className="space-y-5">
          {charts.gap_por_seccion.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="Sin datos de GAP aún"
              description="Los datos aparecen después de que el auditor cierre la primera evaluación IQ."
              action={{ label: 'Ver evaluaciones IQ', onClick: () => navigate('/reportes/evaluacion-iq') }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ChartCard
                  title="Radar de Cumplimiento"
                  subtitle="Nivel actual vs deseado por sección"
                  height="h-72"
                  action={{ label: 'Reporte completo', onClick: () => navigate('/reportes/evaluacion-iq') }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="seccion" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} tickCount={6} />
                      <Radar name="Actual" dataKey="actual" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} />
                      <Radar name="Deseado" dataKey="deseado" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeDasharray="4 4" />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="GAP por Sección" subtitle="Brecha entre nivel actual y deseado" height="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={charts.gap_por_seccion.slice(0, 8).map(d => ({
                        name: d.seccion.length > 18 ? d.seccion.slice(0, 18) + '…' : d.seccion,
                        gap: Number(d.gap),
                        fill: GAP_COLORS[d.clasificacion_gap] ?? '#94a3b8',
                      }))}
                      margin={{ top: 4, right: 8, bottom: 4, left: -20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="gap" name="GAP" radius={[4, 4, 0, 0]}>
                        {charts.gap_por_seccion.slice(0, 8).map((entry, i) => (
                          <Cell key={i} fill={GAP_COLORS[entry.clasificacion_gap] ?? '#94a3b8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Tabla detalle GAP */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Detalle por Sección</h3>
                  <button onClick={() => navigate('/reportes/evaluacion-iq')} className="text-xs text-blue-600 hover:underline">
                    Ver reporte completo →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Sección</th>
                        <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Actual</th>
                        <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Deseado</th>
                        <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">GAP</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {charts.gap_por_seccion.map((row) => (
                        <tr key={row.seccion} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-800 max-w-xs">
                            <span className="truncate block" title={row.seccion}>{row.seccion}</span>
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-gray-700">{Number(row.nivel_actual).toFixed(1)}</td>
                          <td className="px-4 py-3 text-center font-mono text-gray-700">{Number(row.nivel_deseado).toFixed(1)}</td>
                          <td className="px-4 py-3 text-center font-bold font-mono" style={{ color: GAP_COLORS[row.clasificacion_gap] ?? '#64748b' }}>
                            {Number(row.gap).toFixed(1)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-block text-xs px-2.5 py-0.5 rounded-full font-medium text-white"
                              style={{ background: GAP_COLORS[row.clasificacion_gap] ?? '#94a3b8' }}
                            >
                              {row.clasificacion_gap}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: ASIGNACIONES ───────────────────────────────────────── */}
      {activeTab === 'asignaciones' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Pendientes" value={kpis.asignaciones.pendientes} icon={Clock} iconBg="bg-amber-500" href="/asignaciones/mis-evaluaciones" />
            <KpiCard label="En Progreso" value={kpis.asignaciones.en_progreso} icon={ClipboardList} iconBg="bg-blue-500" href="/asignaciones/mis-evaluaciones" />
            <KpiCard label="Pend. Auditoría" value={kpis.asignaciones.pendiente_auditoria} icon={CheckCircle} iconBg="bg-orange-500" href="/asignaciones/mis-evaluaciones" />
            <KpiCard label="Vencidas" value={kpis.asignaciones.vencidas} icon={AlertCircle} iconBg="bg-red-500" href="/asignaciones/mis-evaluaciones" />
          </div>

          <ChartCard title="Estado de Asignaciones" subtitle="Distribución actual de todas las asignaciones" height="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={asignacionesData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Total" radius={[4, 4, 0, 0]}>
                  {asignacionesData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
};