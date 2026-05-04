// src/pages/Dashboard/constants/dashboardColors.ts

export const ESTADO_COLORS: Record<string, string> = {
  activa: '#3b82f6',
  en_progreso: '#8b5cf6',
  completada: '#10b981',
  vencida: '#ef4444',
  pendiente: '#f59e0b',
  auditada: '#06b6d4',
  aprobada: '#22c55e',
  rechazada: '#f43f5e',
  completado: '#10b981',
  pendiente_auditoria: '#f97316',
  vencido: '#ef4444',
};

export const GAP_COLORS: Record<string, string> = {
  critico: '#dc2626',
  alto: '#f97316',
  medio: '#f59e0b',
  bajo: '#84cc16',
  cumplido: '#22c55e',
  superado: '#10b981',
};

export const GAP_COLORS_BG: Record<string, string> = {
  critico: 'bg-red-600',
  alto: 'bg-red-400',
  medio: 'bg-orange-400',
  bajo: 'bg-yellow-400',
  cumplido: 'bg-green-500',
  superado: 'bg-emerald-600',
};

export const ESTADO_LABELS: Record<string, string> = {
  activa: 'Activa',
  en_progreso: 'En Progreso',
  completada: 'Completada',
  vencida: 'Vencida',
  pendiente: 'Pendiente',
  auditada: 'Auditada',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  completado: 'Completado',
  pendiente_auditoria: 'Pend. Auditoría',
  vencido: 'Vencido',
};

export const PIE_COLORS = ['#ef4444', '#f59e0b', '#22c55e'];