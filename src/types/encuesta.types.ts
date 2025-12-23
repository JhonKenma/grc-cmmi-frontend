// src/types/encuesta.types.ts

export interface Encuesta {
  id: string;
  nombre: string;
  descripcion: string;
  version: string;
  es_plantilla: boolean;
  total_dimensiones: number;
  total_preguntas: number;
  activo: boolean;
  dimensiones: Dimension[];
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface EncuestaListItem {
  id: string;
  nombre: string;
  version: string;
  descripcion?: string;
  activo: boolean;
  total_dimensiones: number;
  total_preguntas: number;
  fecha_creacion?: string;
}

// ============================================
// DIMENSIONES
// ============================================

export interface Dimension {
  id: string;
  encuesta: string;
  encuesta_nombre: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  orden: number;
  nivel_deseado?: number;
  total_preguntas: number;
  activo: boolean;
  preguntas?: Pregunta[];
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface DimensionListItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  encuesta?: string;
  encuesta_nombre?: string;
  orden: number;
  total_preguntas: number;
  activo: boolean;
}

// ============================================
// PREGUNTAS
// ============================================

export interface Pregunta {
  id: string;
  codigo: string;
  titulo: string;          // ✅ Título corto
  texto: string;           // ✅ Texto completo de la pregunta
  dimension: string;
  dimension_nombre: string;
  dimension_codigo: string;
  peso: number;
  obligatoria: boolean;
  orden: number;
  activo: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface PreguntaListItem {
  id: string;
  codigo: string;
  texto: string;
  dimension: string;
  dimension_nombre: string;
  dimension_codigo: string;
  nivel: 1 | 2 | 3 | 4 | 5;
  nivel_display: string;
  orden: number;
  activo: boolean;
}

// ============================================
// NIVELES DE REFERENCIA (Si los usas)
// ============================================

export interface NivelReferencia {
  id: string;
  numero: number;
  descripcion: string;
  recomendaciones: string;
  activo: boolean;
  fecha_creacion: string;
}

// ============================================
// CARGA DE EXCEL
// ============================================

export interface CargaExcelData {
  archivo: File;
  nombre_encuesta: string;
  version?: string;
  descripcion?: string;
}

// ============================================
// ESTADÍSTICAS
// ============================================

export interface EncuestaEstadisticas {
  total_dimensiones: number;
  total_preguntas: number;
  asignaciones: {
    total: number;
    pendientes: number;
    en_progreso: number;
    completadas: number;
    vencidas: number;
  };
}