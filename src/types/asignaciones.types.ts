// src/types/asignaciones.types.ts - VERSIÓN COMPLETA

export interface Asignacion {
  id: string;
  encuesta: string;
  encuesta_nombre: string;
  // ⭐ NUEVO: Objeto anidado con info completa de encuesta
  encuesta_info?: {
    id: string;
    nombre: string;
    codigo: string;
    descripcion?: string;
  };
  
  dimension: string | null;
  dimension_nombre: string | null;
  dimension_codigo: string | null;
  // ⭐ NUEVO: Objeto anidado con info completa de dimensión
  dimension_info?: {
    id: string;
    nombre: string;
    codigo: string;
    descripcion?: string;
  };
  
  usuario_asignado: number;
  usuario_asignado_nombre: string;
  usuario_asignado_email: string;
  // ⭐ NUEVO: Objeto anidado con info completa de usuario
  usuario_asignado_info?: {
    id: number;
    nombre_completo: string;
    email: string;
    rol?: string;
  };
  
  empresa: number;
  empresa_nombre: string;
  // ⭐ NUEVO: Objeto anidado con info completa de empresa
  empresa_info?: {
    id: number;
    nombre: string;
    ruc?: string;
  };
  
  asignado_por: number | null;
  asignado_por_nombre: string | null;
  fecha_asignacion: string;
  fecha_limite: string;
  fecha_completado: string | null;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'vencido' | 'pendiente_revision' | 'rechazado';
  estado_display?: string; // ⭐ AGREGADO
  total_preguntas: number;
  preguntas_respondidas: number;
  porcentaje_avance: number;
  observaciones: string;
  dias_restantes: number;
  esta_vencido: boolean;
  activo: boolean;
  
  // ⭐ CAMPOS DE REVISIÓN
  requiere_revision: boolean;
  fecha_envio_revision: string | null;
  revisado_por: number | null;
  revisado_por_nombre: string | null;
  fecha_revision: string | null;
  comentarios_revision: string;
  
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface AsignacionListItem {
  id: string;
  evaluacion_empresa_id: string | null;  // ⭐ AGREGAR - Puede ser null en asignaciones antiguas
  evaluacion_nombre: string;              // ⭐ AGREGAR
  encuesta_nombre: string;
  dimension_id: string | null;
  dimension_nombre: string | null;
  dimension_codigo: string | null;
  usuario_asignado_nombre: string;
  usuario_asignado_email?: string;
  fecha_limite: string;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'vencido' | 'pendiente_revision' | 'rechazado';
  estado_display?: string;
  porcentaje_avance: number;
  dias_restantes: number;
  requiere_revision?: boolean;  // ⭐ IMPORTANTE
  fecha_creacion?: string;
}
export interface AsignacionEvaluacionData {
  encuesta_id: string;
  administrador_id: number;
  fecha_limite: string;
  observaciones?: string;
}

export interface AsignacionDimensionData {
  evaluacion_empresa_id: string;  // ⭐ REQUERIDO
  dimension_ids: string[];        // ⭐ Siempre array (no singular)
  usuario_id: number;
  fecha_limite: string;
  observaciones?: string;
  requiere_revision?: boolean;
}

export interface ReasignacionData {
  nuevo_usuario_id: number;
  nueva_fecha_limite?: string;
  motivo?: string;
}