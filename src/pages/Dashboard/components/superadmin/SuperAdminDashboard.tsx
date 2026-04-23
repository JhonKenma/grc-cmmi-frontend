// src/pages/Dashboard/components/superadmin/SuperAdminDashboard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, Truck, FileText, Brain,
  Clock, AlertCircle, CheckCircle, TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend,
} from 'recharts';

import { DashboardSuperAdmin } from '@/api/endpoints/dashboard.service';
import { KpiCard } from '../shared/KpiCard';
import { ChartCard } from '../shared/ChartCard';
import { SectionTabs } from '../shared/SectionTabs';
import { AlertasList } from '../shared/AlertasList';

const PLAN_COLORS: Record<string, string> = {
  demo: '#94a3b8', basico: '#3b82f6', profesional: '#8b5cf6', enterprise: '#6366f1',
};
const RIESGO_COLORS: Record<string, string> = {
  alto: '#ef4444', medio: '#f59e0b', bajo: '#22c55e',
};
const ROL_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];
const PLAN_LABELS: Record<string, string> = {
  demo: 'Demo', basico: 'Básico', profesional: 'Profesional', enterprise: 'Enterprise',
};
const ESTADO_LABELS: Record<string, string> = {
  activa: 'Activa', en_progreso: 'En Progreso', completada: 'Completada',
  vencida: 'Vencida', pendiente: 'Pendiente', auditada: 'Auditada', aprobada: 'Aprobada',
};
const ESTADO_COLORS: Record<string, string> = {
  activa: '#3b82f6', en_progreso: '#8b5cf6', completada: '#10b981',
  vencida: '#ef4444', pendiente: '#f59e0b', auditada: '#06b6d4', aprobada: '#22c55e',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs text-gray-600">
          <span style={{ color: p.fill || p.color }}>●</span>{' '}
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

interface Props { data: DashboardSuperAdmin }

export const SuperAdminDashboard: React.FC<Props> = ({ data }) => {
  const { kpis, alertas, charts } = data;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resumen');

  const tabs = [
    { id: 'resumen',    label: 'Resumen' },
    { id: 'empresas',   label: 'Empresas',   count: kpis.total_empresas },
    { id: 'evals',      label: 'Evaluaciones', count: kpis.evaluaciones_encuesta_total + kpis.evaluaciones_iq_total },
    { id: 'usuarios',   label: 'Usuarios',   count: kpis.total_usuarios },
  ];

  const empresasPorPlanData = charts.empresas_por_plan.map((d) => ({
    name: PLAN_LABELS[d.plan] ?? d.plan,
    value: d.total,
    fill: PLAN_COLORS[d.plan] ?? '#94a3b8',
  }));

  const evalsPorEstadoData = charts.evaluaciones_por_estado.map((d) => ({
    name: ESTADO_LABELS[d.estado] ?? d.estado,
    value: d.total,
    fill: ESTADO_COLORS[d.estado] ?? '#94a3b8',
  }));

  const proveedoresData = charts.proveedores_por_riesgo.map((d) => ({
    name: d.nivel_riesgo.charAt(0).toUpperCase() + d.nivel_riesgo.slice(1),
    value: d.total,
    fill: RIESGO_COLORS[d.nivel_riesgo] ?? '#94a3b8',
  }));

  const usuariosPorRolData = charts.usuarios_por_rol.map((d, i) => ({
    name: d.rol.charAt(0).toUpperCase() + d.rol.slice(1),
    value: d.total,
    fill: ROL_COLORS[i % ROL_COLORS.length],
  }));

  return (
    <div className="space-y-5">
      <SectionTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* ── RESUMEN ── */}
      {activeTab === 'resumen' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Empresas Activas" value={kpis.total_empresas} icon={Building2} iconBg="bg-purple-500" href="/empresas" />
            <KpiCard label="Total Usuarios" value={kpis.total_usuarios} icon={Users} iconBg="bg-blue-500" href="/usuarios" />
            <KpiCard
              label="Planes por Vencer"
              value={kpis.planes_por_vencer_30d}
              icon={Clock}
              iconBg={kpis.planes_por_vencer_30d > 0 ? 'bg-amber-500' : 'bg-gray-400'}
              badge={kpis.planes_vencidos > 0 ? { text: `${kpis.planes_vencidos} ya vencidos`, variant: 'danger' } : undefined}
              href="/empresas"
            />
            <KpiCard label="Proveedores" value={kpis.total_proveedores} icon={Truck} iconBg="bg-teal-500" href="/proveedores" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Evals. Encuesta"
              value={kpis.evaluaciones_encuesta_total}
              icon={FileText}
              iconBg="bg-indigo-500"
              badge={kpis.evaluaciones_encuesta_vencidas > 0 ? { text: `${kpis.evaluaciones_encuesta_vencidas} vencidas`, variant: 'danger' } : undefined}
              href="/encuestas"
            />
            <KpiCard
              label="Evaluaciones IQ"
              value={kpis.evaluaciones_iq_total}
              icon={Brain}
              iconBg="bg-violet-500"
              badge={kpis.evaluaciones_iq_completadas > 0 ? { text: `${kpis.evaluaciones_iq_completadas} completadas`, variant: 'success' } : undefined}
              href="/evaluaciones-inteligentes"
            />
            <KpiCard label="Planes Vencidos" value={kpis.planes_vencidos} icon={AlertCircle} iconBg={kpis.planes_vencidos > 0 ? 'bg-red-500' : 'bg-gray-400'} href="/empresas" />
            <KpiCard label="IQ Completadas" value={kpis.evaluaciones_iq_completadas} icon={CheckCircle} iconBg="bg-emerald-500" href="/evaluaciones-inteligentes" />
          </div>

          {alertas.length > 0 && <AlertasList alertas={alertas} />}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Empresas por Plan" subtitle="Distribución de planes contratados" action={{ label: 'Ver empresas', onClick: () => navigate('/empresas') }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={empresasPorPlanData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                    {empresasPorPlanData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Usuarios por Rol" subtitle="Distribución en todo el sistema" action={{ label: 'Ver usuarios', onClick: () => navigate('/usuarios') }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usuariosPorRolData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Usuarios" radius={[4, 4, 0, 0]}>
                    {usuariosPorRolData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {/* ── EMPRESAS ── */}
      {activeTab === 'empresas' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard label="Total Empresas" value={kpis.total_empresas} icon={Building2} iconBg="bg-purple-500" href="/empresas" />
            <KpiCard label="Planes Vencidos" value={kpis.planes_vencidos} icon={AlertCircle} iconBg={kpis.planes_vencidos > 0 ? 'bg-red-500' : 'bg-gray-400'} href="/empresas" />
            <KpiCard label="Por Vencer (30d)" value={kpis.planes_por_vencer_30d} icon={Clock} iconBg="bg-amber-500" href="/empresas" />
          </div>
          <ChartCard title="Empresas por Plan" subtitle="Qué planes tienen contratados las empresas" height="h-72" action={{ label: 'Gestionar', onClick: () => navigate('/empresas') }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={empresasPorPlanData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Empresas" radius={[6, 6, 0, 0]}>
                  {empresasPorPlanData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ── EVALUACIONES ── */}
      {activeTab === 'evals' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Encuestas Total" value={kpis.evaluaciones_encuesta_total} icon={FileText} iconBg="bg-indigo-500" href="/encuestas" />
            <KpiCard label="Encuestas Vencidas" value={kpis.evaluaciones_encuesta_vencidas} icon={AlertCircle} iconBg={kpis.evaluaciones_encuesta_vencidas > 0 ? 'bg-red-500' : 'bg-gray-400'} href="/encuestas" />
            <KpiCard label="IQ Total" value={kpis.evaluaciones_iq_total} icon={Brain} iconBg="bg-violet-500" href="/evaluaciones-inteligentes" />
            <KpiCard label="IQ Completadas" value={kpis.evaluaciones_iq_completadas} icon={CheckCircle} iconBg="bg-emerald-500" href="/evaluaciones-inteligentes" />
          </div>
          <ChartCard title="Evaluaciones por Estado" subtitle="Encuestas + IQ combinadas" height="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evalsPorEstadoData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Total" radius={[4, 4, 0, 0]}>
                  {evalsPorEstadoData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ── USUARIOS ── */}
      {activeTab === 'usuarios' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <KpiCard label="Total Usuarios" value={kpis.total_usuarios} icon={Users} iconBg="bg-blue-500" href="/usuarios" />
            <KpiCard label="Proveedores" value={kpis.total_proveedores} icon={Truck} iconBg="bg-teal-500" href="/proveedores" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Usuarios por Rol" height="h-72" action={{ label: 'Gestionar', onClick: () => navigate('/usuarios') }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={usuariosPorRolData} cx="50%" cy="50%" outerRadius={90} paddingAngle={2} dataKey="value">
                    {usuariosPorRolData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Proveedores por Riesgo" height="h-72" action={{ label: 'Ver', onClick: () => navigate('/proveedores') }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={proveedoresData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                    {proveedoresData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
};