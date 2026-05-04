// src/pages/Dashboard/hooks/superadmin/useSuperAdminDashboard.ts
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSuperAdmin } from '@/api/endpoints/dashboard.service';
import { ESTADO_COLORS, ESTADO_LABELS } from '../../constants/dashboardColors';

// ── Constantes propias del superadmin (no existen en dashboardColors) ────────

const PLAN_COLORS: Record<string, string> = {
  demo: '#94a3b8', basico: '#3b82f6', profesional: '#8b5cf6', enterprise: '#6366f1',
};

const PLAN_LABELS: Record<string, string> = {
  demo: 'Demo', basico: 'Básico', profesional: 'Profesional', enterprise: 'Enterprise',
};

const RIESGO_COLORS: Record<string, string> = {
  alto: '#ef4444', medio: '#f59e0b', bajo: '#22c55e',
};

const ROL_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useSuperAdminDashboard = (data: DashboardSuperAdmin) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resumen');
  const { kpis, alertas, charts } = data;

  const tabs = useMemo(() => [
    { id: 'resumen',  label: 'Resumen' },
    { id: 'empresas', label: 'Empresas',     count: kpis.total_empresas },
    { id: 'evals',    label: 'Evaluaciones', count: kpis.evaluaciones_encuesta_total + kpis.evaluaciones_iq_total },
    { id: 'usuarios', label: 'Usuarios',     count: kpis.total_usuarios },
  ], [kpis]);

  const empresasPorPlanData = useMemo(() =>
    charts.empresas_por_plan.map((d) => ({
      name: PLAN_LABELS[d.plan] ?? d.plan,
      value: d.total,
      fill: PLAN_COLORS[d.plan] ?? '#94a3b8',
    })),
  [charts.empresas_por_plan]);

  const evalsPorEstadoData = useMemo(() =>
    charts.evaluaciones_por_estado.map((d) => ({
      name: ESTADO_LABELS[d.estado] ?? d.estado,
      value: d.total,
      fill: ESTADO_COLORS[d.estado] ?? '#94a3b8',
    })),
  [charts.evaluaciones_por_estado]);

  const proveedoresData = useMemo(() =>
    charts.proveedores_por_riesgo.map((d) => ({
      name: d.nivel_riesgo.charAt(0).toUpperCase() + d.nivel_riesgo.slice(1),
      value: d.total,
      fill: RIESGO_COLORS[d.nivel_riesgo] ?? '#94a3b8',
    })),
  [charts.proveedores_por_riesgo]);

  const usuariosPorRolData = useMemo(() =>
    charts.usuarios_por_rol.map((d, i) => ({
      name: d.rol.charAt(0).toUpperCase() + d.rol.slice(1),
      value: d.total,
      fill: ROL_COLORS[i % ROL_COLORS.length],
    })),
  [charts.usuarios_por_rol]);

  // Badges y colores condicionales de KPIs
  const planesVencidosBadge = kpis.planes_vencidos > 0
    ? { text: `${kpis.planes_vencidos} ya vencidos`, variant: 'danger' as const }
    : undefined;

  const encuestasVencidasBadge = kpis.evaluaciones_encuesta_vencidas > 0
    ? { text: `${kpis.evaluaciones_encuesta_vencidas} vencidas`, variant: 'danger' as const }
    : undefined;

  const iqCompletadasBadge = kpis.evaluaciones_iq_completadas > 0
    ? { text: `${kpis.evaluaciones_iq_completadas} completadas`, variant: 'success' as const }
    : undefined;

  const planesVencidosIconBg = kpis.planes_vencidos > 0 ? 'bg-red-500' : 'bg-gray-400';
  const planesPorVencerIconBg = kpis.planes_por_vencer_30d > 0 ? 'bg-amber-500' : 'bg-gray-400';
  const encuestasVencidasIconBg = kpis.evaluaciones_encuesta_vencidas > 0 ? 'bg-red-500' : 'bg-gray-400';

  return {
    // estado
    activeTab,
    setActiveTab,
    tabs,
    navigate,
    // datos originales
    kpis,
    alertas,
    charts,
    // datos transformados para gráficos
    empresasPorPlanData,
    evalsPorEstadoData,
    proveedoresData,
    usuariosPorRolData,
    // badges y colores condicionales
    planesVencidosBadge,
    encuestasVencidasBadge,
    iqCompletadasBadge,
    planesVencidosIconBg,
    planesPorVencerIconBg,
    encuestasVencidasIconBg,
  };
};