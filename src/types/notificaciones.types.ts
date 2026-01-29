// src/types/notificaciones.types.ts

export type TipoNotificacion =
  | 'asignacion_evaluacion'
  | 'asignacion_dimension'
  | 'recordatorio_plazo'
  | 'evaluacion_completada'
  | 'evaluacion_vencida'
  | 'comentario'
  | 'aprobacion'
  | 'sistema'
  | 'proyecto_en_validacion'
  | 'gap_aprobado'
  | 'gap_rechazado'
  | 'mensaje_personalizado'
  | 'anuncio';

export type PrioridadNotificacion = 'baja' | 'normal' | 'alta' | 'urgente';

export type PeriodoHistorial = 'nuevas' | 'semana' | 'mes' | 'todas';

export interface UsuarioNotificacion {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  nombre_completo: string;
  rol: string;
}

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  tipo_display: string;
  titulo: string;
  mensaje: string;
  prioridad: PrioridadNotificacion;
  prioridad_display: string;
  leida: boolean;
  fecha_leida: string | null;
  email_enviado: boolean;
  url_accion: string;
  datos_adicionales: Record<string, any>;
  tiempo_transcurrido: string;
  fecha_creacion: string;
}

export interface NotificacionDetalle extends Notificacion {
  usuario: UsuarioNotificacion;
  asignacion_info: any;
  fecha_actualizacion: string;
  dias_desde_creacion: number;
  activo: boolean;
  puede_marcar_leida: boolean;
}

export interface EnviarNotificacionData {
  // Destinatarios (al menos uno)
  usuario_id?: number;
  empresa_id?: number;
  enviar_a_todos_admins?: boolean;
  enviar_a_todos?: boolean;
  
  // Contenido
  tipo: 'mensaje_personalizado' | 'anuncio' | 'sistema';
  titulo: string;
  mensaje: string;
  prioridad: PrioridadNotificacion;
  url_accion?: string;
  enviar_email: boolean;
}

export interface HistorialResponse {
  periodo: PeriodoHistorial;
  total: number;
  mostrando: number;
  nuevas: number;
  leidas: number;
  notificaciones: Notificacion[];
}

export interface EstadisticasNotificaciones {
  total: number;
  nuevas: number;
  leidas_semana: number;
  leidas_mes: number;
  por_tipo: Record<string, number>;
  por_prioridad: Record<string, number>;
}

// ⭐ MANTENER COMPATIBILIDAD CON CÓDIGO ANTIGUO
export interface NotificacionListItem extends Notificacion {}

// Helpers
export const getTipoColor = (tipo: TipoNotificacion): string => {
  const colores: Record<TipoNotificacion, string> = {
    asignacion_evaluacion: 'bg-blue-100 text-blue-700 border-blue-200',
    asignacion_dimension: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    recordatorio_plazo: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    evaluacion_completada: 'bg-green-100 text-green-700 border-green-200',
    evaluacion_vencida: 'bg-red-100 text-red-700 border-red-200',
    comentario: 'bg-purple-100 text-purple-700 border-purple-200',
    aprobacion: 'bg-orange-100 text-orange-700 border-orange-200',
    sistema: 'bg-gray-100 text-gray-700 border-gray-200',
    proyecto_en_validacion: 'bg-purple-100 text-purple-700 border-purple-200',
    gap_aprobado: 'bg-green-100 text-green-700 border-green-200',
    gap_rechazado: 'bg-red-100 text-red-700 border-red-200',
    mensaje_personalizado: 'bg-blue-100 text-blue-700 border-blue-200',
    anuncio: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };
  return colores[tipo] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const getPrioridadColor = (prioridad: PrioridadNotificacion): string => {
  const colores: Record<PrioridadNotificacion, string> = {
    baja: 'bg-gray-100 text-gray-600',
    normal: 'bg-blue-100 text-blue-600',
    alta: 'bg-orange-100 text-orange-600',
    urgente: 'bg-red-100 text-red-600',
  };
  return colores[prioridad];
};

export const getPrioridadIcon = (prioridad: PrioridadNotificacion): string => {
  const iconos: Record<PrioridadNotificacion, string> = {
    baja: '📌',
    normal: '📋',
    alta: '⚠️',
    urgente: '🚨',
  };
  return iconos[prioridad];
};