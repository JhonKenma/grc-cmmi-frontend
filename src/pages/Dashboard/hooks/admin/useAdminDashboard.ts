// src/pages/Dashboard/hooks/admin/useAdminDashboard.ts
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardAdmin } from '@/api/endpoints/dashboard.service';
import {
  ESTADO_COLORS,
  GAP_COLORS,
  ESTADO_LABELS,
} from '../../constants/dashboardColors'; // ← sube un nivel más por estar en /hooks/admin/

export const useAdminDashboard = (data: DashboardAdmin) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resumen');
  const { kpis, alertas, charts } = data;

  const tabs = useMemo(() => [
    { id: 'resumen', label: 'Resumen' },
    {
      id: 'evaluaciones',
      label: 'Evaluaciones',
      count: kpis.evaluaciones_encuesta.activas + kpis.evaluaciones_iq.pendientes,
    },
    {
      id: 'gap',
      label: 'Análisis GAP',
      count: charts.gap_por_seccion.length,
    },
    {
      id: 'asignaciones',
      label: 'Asignaciones',
      count: kpis.asignaciones.pendientes,
    },
  ], [kpis, charts.gap_por_seccion.length]);

  const evalEncuestaData = useMemo(() =>
    charts.progreso_evaluaciones.map((d) => ({
      name: ESTADO_LABELS[d.estado] ?? d.estado,
      value: d.total,
      fill: ESTADO_COLORS[d.estado] ?? '#94a3b8',
    })),
  [charts.progreso_evaluaciones]);

  const evalIQData = useMemo(() =>
    charts.iq_por_estado.map((d) => ({
      name: ESTADO_LABELS[d.estado] ?? d.estado,
      value: d.total,
      fill: ESTADO_COLORS[d.estado] ?? '#94a3b8',
    })),
  [charts.iq_por_estado]);

  const asignacionesData = useMemo(() =>
    charts.asignaciones_por_estado.map((d) => ({
      name: ESTADO_LABELS[d.estado] ?? d.estado,
      value: d.total,
      fill: ESTADO_COLORS[d.estado] ?? '#94a3b8',
    })),
  [charts.asignaciones_por_estado]);

  const radarData = useMemo(() =>
    charts.gap_por_seccion.slice(0, 8).map((d) => ({
      seccion: d.seccion.length > 20 ? d.seccion.slice(0, 20) + '…' : d.seccion,
      actual: Number(d.nivel_actual),
      deseado: Number(d.nivel_deseado),
    })),
  [charts.gap_por_seccion]);

  const proveedoresData = useMemo(() =>
    charts.proveedores_por_riesgo.map((d) => ({
      name: d.nivel_riesgo.charAt(0).toUpperCase() + d.nivel_riesgo.slice(1),
      value: d.total,
    })),
  [charts.proveedores_por_riesgo]);

  const gapBarData = useMemo(() =>
    charts.gap_por_seccion.slice(0, 8).map((d) => ({
      name: d.seccion.length > 18 ? d.seccion.slice(0, 18) + '…' : d.seccion,
      gap: Number(d.gap),
      fill: GAP_COLORS[d.clasificacion_gap] ?? '#94a3b8',
    })),
  [charts.gap_por_seccion]);

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
    evalEncuestaData,
    evalIQData,
    asignacionesData,
    radarData,
    proveedoresData,
    gapBarData,
  };
};