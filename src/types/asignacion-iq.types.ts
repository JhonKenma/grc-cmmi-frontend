// src/types/asignacion-iq.types.ts

export interface AsignacionEvaluacionIQ {
  id: number;
  evaluacion: number;
  evaluacion_nombre: string;
  usuario_asignado: number;
  usuario_nombre: string;
  usuario_email: string;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'revisada' | 'aprobada' | 'rechazada' | 'vencida';
  estado_display: string;
  fecha_asignacion: string;
  fecha_inicio: string;
  fecha_limite: string;
  total_preguntas: number;
  preguntas_respondidas: number;
  porcentaje_completado: number;
  esta_vencida: boolean;
  dias_restantes: number;
  activo: boolean;
}

export interface AsignacionEvaluacionDetail extends AsignacionEvaluacionIQ {
  evaluacion_detail: {
    id: number;
    nombre: string;
    descripcion: string;
    frameworks: string[];
    nivel_deseado: number;
    nivel_deseado_display: string;
    usar_todas_preguntas: boolean;
  };
  usuario_detail: {
    id: number;
    nombre: string;
    email: string;
    cargo: string | null;
  };
  fecha_inicio_real: string | null;
  fecha_completado: string | null;
  fecha_revision: string | null;
  asignado_por: number;
  asignado_por_nombre: string;
  revisado_por: number | null;
  revisado_por_nombre: string | null;
  notas_asignacion: string;
  notas_revision: string;
  notificar_usuario: boolean;
  recordatorio_enviado: boolean;
  tiempo_usado: number | null;
}

export interface CrearAsignacionData {
  evaluacion: number;
  usuarios: number[];
  fecha_inicio: string;
  fecha_limite: string;
  notas_asignacion?: string;
  requiere_revision?: boolean;  // ⭐ NUEVO
  notificar_usuario?: boolean;
}

export interface MisAsignacionesResponse {
  asignaciones: AsignacionEvaluacionIQ[];
  estadisticas: {
    total: number;
    pendientes: number;
    en_progreso: number;
    completadas: number;
    vencidas: number;
  };
}

export interface EstadisticasAsignaciones {
  total: number;
  por_estado: {
    pendientes: number;
    en_progreso: number;
    completadas: number;
    aprobadas: number;
    rechazadas: number;
    vencidas: number;
  };
  vencidas_sin_completar: number;
  promedio_completado: number;
}

// Helpers
export const getEstadoBadgeColor = (estado: AsignacionEvaluacionIQ['estado']) => {
  const colors = {
    pendiente: 'bg-gray-100 text-gray-800',
    en_progreso: 'bg-blue-100 text-blue-800',
    completada: 'bg-green-100 text-green-800',
    revisada: 'bg-purple-100 text-purple-800',
    aprobada: 'bg-emerald-100 text-emerald-800',
    rechazada: 'bg-red-100 text-red-800',
    vencida: 'bg-orange-100 text-orange-800',
  };
  return colors[estado] || 'bg-gray-100 text-gray-800';
};

export const getPrioridadColor = (dias_restantes: number) => {
  if (dias_restantes <= 0) return 'text-red-600';
  if (dias_restantes <= 3) return 'text-orange-600';
  if (dias_restantes <= 7) return 'text-yellow-600';
  return 'text-green-600';
};