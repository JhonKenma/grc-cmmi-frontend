// src/types/evaluaciones.types.ts

// ============================================================================
// FRAMEWORKS
// ============================================================================

export interface Framework {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  version: string;
  activo: boolean;
  fecha_creacion: string;
  total_preguntas: number;
}

export interface FrameworkEstadisticas {
  framework: {
    id: number;
    codigo: string;
    nombre: string;
    version: string;
    activo: boolean;
  };
  preguntas: number;
  evidencias: number;
  relaciones_con_otros_frameworks: number;
}

// ============================================================================
// PREGUNTAS
// ============================================================================

export interface EvidenciaRequerida {
  id: number;
  pregunta: number;
  descripcion: string;
  orden: number;
}

export interface RelacionFramework {
  id: number;
  framework_destino: number;
  framework_destino_codigo: string;
  framework_destino_nombre: string;
  referencia_textual: string;
  codigo_control_referenciado: string;
  porcentaje_cobertura: number;
}

export interface PreguntaEvaluacionList {
  id: number;
  correlativo: number;
  framework: number;
  framework_codigo: string;
  framework_nombre: string;
  framework_base_nombre: string;
  codigo_control: string;
  seccion_general: string;
  nombre_control: string;
  pregunta: string;
  nivel_madurez: number;
  nivel_madurez_display: string;
  activo: boolean;
}

export interface PreguntaEvaluacionDetail extends PreguntaEvaluacionList {
  tags: string;
  frameworks_referenciales: string;
  objetivo_evaluacion: string;
  fecha_creacion: string;
  evidencias_requeridas: EvidenciaRequerida[];
  relaciones_frameworks: RelacionFramework[];
}

// ============================================================================
// EVALUACIONES
// ============================================================================

export interface EvaluacionList {
  id: number;
  empresa: number;            
  empresa_nombre: string;
  nombre: string;
  frameworks_nombres: string;
  estado: 'disponible' | 'configurando' | 'asignada' | 'en_proceso' | 'completada' | 'aprobada' | 'rechazada';
  nivel_deseado: number;
  nivel_deseado_display: string; 
  creado_por_nombre: string;
  usar_todas_preguntas: boolean;
  total_preguntas: number;
  puede_asignar: boolean;
  fecha_creacion: string;
}

export interface EvaluacionDetail {
  id: number;
  empresa: number;
  empresa_nombre: string; 
  frameworks: number[];
  frameworks_detail: Framework[];
  nombre: string;
  descripcion: string;
  estado: 'disponible' | 'configurando' | 'asignada' | 'en_proceso' | 'completada' | 'aprobada' | 'rechazada';
  nivel_deseado: number;
  nivel_deseado_display: string;
  creado_por: number;
  creado_por_nombre: string;
  usar_todas_preguntas: boolean;
  usar_respuestas_compartidas: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  total_preguntas: number;
  puede_asignar: boolean;
}

export interface EvaluacionPregunta {
  id: number;
  evaluacion: number;
  pregunta: number;
  pregunta_detalle: PreguntaEvaluacionList;
  orden: number;
  fecha_agregada: string;
}

export interface PreguntasSeleccionadasResponse {
  usar_todas_preguntas: boolean;
  total: number;
  preguntas: EvaluacionPregunta[] | PreguntaEvaluacionList[];
}

// ============================================================================
// FORMULARIOS Y FILTROS
// ============================================================================

export interface CrearEvaluacionData {
  frameworks: number[];
  nombre: string;
  descripcion?: string;
  nivel_deseado: number; 
  usar_todas_preguntas: boolean;
  usar_respuestas_compartidas?: boolean;
}

export interface AgregarPreguntasData {
  preguntas_ids: number[];
}

export interface ReordenarPreguntasData {
  orden: number[];
}

export interface SugerirPreguntasIAData {
  framework_codigo?: string;
  instruction?: string;
  seccion?: string;
  nivel_madurez?: number;
  max_preguntas?: number;
}

export interface SugerenciaPreguntaIA {
  question_id: number;
  score: number;
  reason: string;
}

export interface SugerirPreguntasIAResponse {
  success: boolean;
  evaluacion_id: number;
  framework: string;
  total_candidatas: number;
  total_sugeridas: number;
  selected_question_ids: number[];
  recommendations: SugerenciaPreguntaIA[];
  preguntas_sugeridas: PreguntaEvaluacionList[];
  model?: string;
  message?: string;
}

export interface FiltrosPregunta {
  framework?: string;
  nivel_madurez?: number;
  seccion?: string;
  page?: number;
  search?: string;
}

// ============================================================================
// RESPUESTAS API
// ============================================================================

export interface ImportarFrameworkResponse {
  success: boolean;
  message: string;
  frameworks_importados: {
    codigo: string;
    nombre: string;
    version: string;
    creado: boolean;
    preguntas: number;
    evidencias: number;
    relaciones: number;
  }[];
  estadisticas: {
    total_frameworks: number;
    total_preguntas: number;
    total_evidencias: number;
    total_relaciones: number;
    hojas_procesadas: string[];
    hojas_omitidas: string[];
  };
  importado_por: {
    id: number;
    email: string;
    nombre: string;
  };
}

export interface AgregarPreguntasResponse {
  success: boolean;
  preguntas_agregadas: number;
  preguntas_duplicadas: number;
  total_preguntas_evaluacion: number;
  estado: string;
}

export interface QuitarPreguntasResponse {
  success: boolean;
  preguntas_eliminadas: number;
  total_preguntas_evaluacion: number;
}

export interface EstadisticasGeneralesResponse {
  total_frameworks: number;
  frameworks: FrameworkEstadisticas[];
}

// ============================================================================
// PAGINACIÓN
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================================
// ESTADOS
// ============================================================================

export const ESTADOS_EVALUACION = {
  disponible: 'Disponible',
  configurando: 'Configurando',
  asignada: 'Asignada',
  en_proceso: 'En Proceso',
  completada: 'Completada',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
} as const;

export const NIVELES_MADUREZ = {
  1: 'Nivel 1 - Inicial',
  2: 'Nivel 2 - Gestionado',
  3: 'Nivel 3 - Definido',
  4: 'Nivel 4 - Gestionado Cuantitativamente',
  5: 'Nivel 5 - Optimizado',
} as const;

// ============================================================================
// BADGES Y COLORES
// ============================================================================

export const getEstadoBadgeColor = (estado: string): string => {
  const colores: Record<string, string> = {
    disponible: 'bg-gray-100 text-gray-800 border-gray-200',
    configurando: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    asignada: 'bg-blue-100 text-blue-800 border-blue-200',
    en_proceso: 'bg-purple-100 text-purple-800 border-purple-200',
    completada: 'bg-green-100 text-green-800 border-green-200',
    aprobada: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rechazada: 'bg-red-100 text-red-800 border-red-200',
  };
  return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getNivelMadurezColor = (nivel: number): string => {
  const colores: Record<number, string> = {
    1: 'bg-red-100 text-red-800',
    2: 'bg-orange-100 text-orange-800',
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-blue-100 text-blue-800',
    5: 'bg-green-100 text-green-800',
  };
  return colores[nivel] || 'bg-gray-100 text-gray-800';
};

export const getNivelDeseadoBadgeColor = (nivel: number): string => {
  const colores: Record<number, string> = {
    1: 'bg-red-100 text-red-800',
    2: 'bg-orange-100 text-orange-800',
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-blue-100 text-blue-800',
    5: 'bg-green-100 text-green-800',
  };
  return colores[nivel] || 'bg-gray-100 text-gray-800';
};