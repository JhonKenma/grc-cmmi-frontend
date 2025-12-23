// src/types/notificaciones.types.ts

export interface Notificacion {
  id: string;
  tipo: 'asignacion_evaluacion' | 'asignacion_dimension' | 'recordatorio_plazo' | 'evaluacion_completada' | 'evaluacion_vencida' | 'comentario' | 'aprobacion' | 'sistema';
  tipo_display: string;
  titulo: string;
  mensaje: string;
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  prioridad_display: string;
  leida: boolean;
  fecha_leida: string | null;
  email_enviado: boolean;
  url_accion: string;
  datos_adicionales: Record<string, any>;
  tiempo_transcurrido: string;
  fecha_creacion: string;
}

export interface NotificacionListItem {
  id: string;
  tipo: string;
  tipo_display: string;
  titulo: string;
  prioridad: string;
  leida: boolean;
  url_accion: string;
  tiempo_transcurrido: string;
  fecha_creacion: string;
}
