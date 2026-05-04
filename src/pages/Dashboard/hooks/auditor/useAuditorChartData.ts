// src/pages/Dashboard/hooks/useAuditorChartData.ts
import { useMemo } from 'react';
import { DashboardAuditor } from '@/api/endpoints/dashboard.service';

// ── Constantes de mapeo ──────────────────────────────────────────────────────

const GAP_COLORS: Record<string, string> = {
  critico: '#dc2626',
  alto: '#f97316',
  medio: '#f59e0b',
  bajo: '#84cc16',
  cumplido: '#22c55e',
  superado: '#10b981',
};

const ESTADO_COLORS: Record<string, string> = {
  pendiente: '#f59e0b',
  en_progreso: '#3b82f6',
  completada: '#8b5cf6',
  auditada: '#06b6d4',
  aprobada: '#22c55e',
  rechazada: '#ef4444',
  vencida: '#dc2626',
};

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En Progreso',
  completada: 'Completada',
  auditada: 'Auditada',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  vencida: 'Vencida',
};

// ── Tipos de retorno ─────────────────────────────────────────────────────────

export interface ChartDataItem {
  name: string;
  value: number;
  fill: string;
}

export interface CargaDataItem {
  semana: string;
  total: number;
}

export interface AuditorChartData {
  iqEstadoData: ChartDataItem[];
  gapData: ChartDataItem[];
  cargaData: CargaDataItem[];
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Transforma los datos crudos del API al formato requerido
 * por los componentes de gráficos (Recharts) del dashboard auditor.
 */
export const useAuditorChartData = (
  charts: DashboardAuditor['charts']
): AuditorChartData => {
  const iqEstadoData = useMemo<ChartDataItem[]>(
    () =>
      charts.iq_por_estado.map((d) => ({
        name: ESTADO_LABELS[d.estado] ?? d.estado,
        value: d.total,
        fill: ESTADO_COLORS[d.estado] ?? '#94a3b8',
      })),
    [charts.iq_por_estado]
  );

  const gapData = useMemo<ChartDataItem[]>(
    () =>
      charts.gap_clasificacion.map((d) => ({
        name:
          d.clasificacion.charAt(0).toUpperCase() + d.clasificacion.slice(1),
        value: d.total,
        fill: GAP_COLORS[d.clasificacion] ?? '#94a3b8',
      })),
    [charts.gap_clasificacion]
  );

  const cargaData = useMemo<CargaDataItem[]>(
    () =>
      charts.carga_semanal.map((d) => ({
        semana: d.semana.slice(5), // "YYYY-MM-DD" → "MM-DD"
        total: d.total,
      })),
    [charts.carga_semanal]
  );

  return { iqEstadoData, gapData, cargaData };
};