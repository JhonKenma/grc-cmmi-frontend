// src/pages/Dashboard/hooks/usuario/useUsuarioDashboard.ts
import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardUsuario } from '@/api/endpoints/dashboard.service';
import { ESTADO_COLORS, ESTADO_LABELS } from '../../constants/dashboardColors';

// ── Constantes propias del usuario (no están en dashboardColors) ─────────────

const IQ_COLORS: Record<string, string> = {
  pendiente: '#f59e0b', en_progreso: '#8b5cf6', completada: '#10b981',
  auditada: '#06b6d4', aprobada: '#22c55e', rechazada: '#ef4444', vencida: '#dc2626',
};

const IQ_LABELS: Record<string, string> = {
  pendiente: 'Pendiente', en_progreso: 'En Progreso', completada: 'Completada',
  auditada: 'Auditada', aprobada: 'Aprobada', rechazada: 'Rechazada', vencida: 'Vencida',
};

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit', month: 'short', year: 'numeric',
};

// ── Tipos de retorno ─────────────────────────────────────────────────────────

export interface ChartDataItem {
  name: string;
  value: number;
  fill: string;
}

export interface UsuarioDashboardReturn {
  // navegación
  goToMisTareas: () => void;
  goToMisIQ: () => void;
  // datos originales
  kpis: DashboardUsuario['kpis'];
  alertas: DashboardUsuario['alertas'];
  // totales calculados
  totalEncuestas: number;
  totalIQ: number;
  // datos transformados para gráficos
  encuestasChartData: ChartDataItem[];
  iqChartData: ChartDataItem[];
  // fechas formateadas
  proximaEncuestaFecha: string | null;
  proximaIQFecha: string | null;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useUsuarioDashboard = (data: DashboardUsuario): UsuarioDashboardReturn => {
  const navigate = useNavigate();
  const { kpis, alertas, charts } = data;
  const { asignaciones_encuesta: ae, evaluaciones_iq: iq } = kpis;

  // Navegación
  const goToMisTareas = useCallback(() => navigate('/mis-tareas'), [navigate]);
  const goToMisIQ = useCallback(() => navigate('/evaluaciones-iq/mis-asignaciones'), [navigate]);

  // Totales
  const totalEncuestas = useMemo(
    () => ae.pendientes + ae.en_progreso + ae.completadas + ae.vencidas,
    [ae]
  );

  const totalIQ = useMemo(
    () => iq.pendientes + iq.completadas + iq.vencidas,
    [iq]
  );

  // Datos para gráficos
  const encuestasChartData = useMemo<ChartDataItem[]>(
    () => charts.mis_asignaciones_por_estado.map((d) => ({
      name: ESTADO_LABELS[d.estado] ?? d.estado,
      value: d.total,
      fill: ESTADO_COLORS[d.estado] ?? '#94a3b8',
    })),
    [charts.mis_asignaciones_por_estado]
  );

  const iqChartData = useMemo<ChartDataItem[]>(
    () => charts.mis_iq_por_estado.map((d) => ({
      name: IQ_LABELS[d.estado] ?? d.estado,
      value: d.total,
      fill: IQ_COLORS[d.estado] ?? '#94a3b8',
    })),
    [charts.mis_iq_por_estado]
  );

  // Fechas formateadas — la lógica de `new Date(...).toLocaleDateString` sale del JSX
  const proximaEncuestaFecha = useMemo(
    () => ae.proxima_vencimiento
      ? new Date(ae.proxima_vencimiento.fecha_limite).toLocaleDateString('es-PE', DATE_FORMAT)
      : null,
    [ae.proxima_vencimiento]
  );

  const proximaIQFecha = useMemo(
    () => iq.proxima_vencimiento
      ? new Date(iq.proxima_vencimiento.fecha_limite).toLocaleDateString('es-PE', DATE_FORMAT)
      : null,
    [iq.proxima_vencimiento]
  );

  return {
    goToMisTareas,
    goToMisIQ,
    kpis,
    alertas,
    totalEncuestas,
    totalIQ,
    encuestasChartData,
    iqChartData,
    proximaEncuestaFecha,
    proximaIQFecha,
  };
};