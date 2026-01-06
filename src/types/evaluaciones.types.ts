// src/types/evaluaciones.types.ts - CREAR NUEVO

export interface AsignarEvaluacionData {
  encuesta_id: string;
  empresa_id: number;
  administrador_id: number;
  fecha_limite: string;
  observaciones?: string;
}

export interface EvaluacionEmpresa {
  id: string;
  empresa: number;
  empresa_info: {
    id: number;
    nombre: string;
    ruc: string;
  };
  encuesta: string;
  encuesta_info: {
    id: string;
    nombre: string;
    version: string;
    total_dimensiones: number;
  };
  administrador: number;
  administrador_info: {
    id: number;
    nombre_completo: string;
    email: string;
    cargo: string;
  } | null;
  asignado_por: number;
  asignado_por_nombre: string;
  fecha_asignacion: string;
  fecha_limite: string;
  fecha_completado: string | null;
  estado: 'activa' | 'en_progreso' | 'completada' | 'vencida' | 'cancelada';
  estado_display: string;
  dias_restantes: number;
  esta_vencida: boolean;
  observaciones: string;
  total_dimensiones: number;
  dimensiones_asignadas: number;
  dimensiones_completadas: number;
  porcentaje_avance: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ProgresoEvaluacion {
  evaluacion: {
    id: string;
    encuesta: string;
    empresa: string;
    estado: string;
    porcentaje_avance: number;
    total_dimensiones: number;
    dimensiones_asignadas: number;
    dimensiones_completadas: number;
  };
  dimensiones: {
    dimension: {
      id: string;
      codigo: string;
      nombre: string;
    };
    asignaciones: {
      id: string;
      usuario: string;
      estado: string;
      porcentaje_avance: number;
      fecha_limite: string;
    }[];
    total_asignaciones: number;
    completadas: number;
    en_progreso: number;
    pendientes: number;
  }[];
}