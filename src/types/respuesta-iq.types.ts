// src/types/respuesta-iq.types.ts

export interface RespuestaEvaluacionIQ {
  id: number;
  asignacion: number;
  pregunta: number;
  pregunta_detalle: PreguntaDetalle;
  respuesta: 'SI_CUMPLE' | 'CUMPLE_PARCIAL' | 'NO_CUMPLE' | 'NO_APLICA';
  respuesta_display: string;
  justificacion: string;
  nivel_madurez: number;
  justificacion_madurez: string;
  comentarios_adicionales: string;
  es_respuesta_original: boolean;
  propagada_desde: number | null;
  origen_respuesta: OrigenRespuesta;
  evidencias: Evidencia[];
  puntaje: number | null;
  respondido_por: number;
  fecha_respuesta: string;
  fecha_actualizacion: string;
}

export interface PreguntaDetalle {
  correlativo: number;
  codigo_control: string;
  nombre_control: string;
  pregunta: string;
  objetivo_evaluacion: string;
  nivel_madurez: number;
  framework: string;
}

export interface OrigenRespuesta {
  tipo: 'original' | 'importada' | 'propagada' | 'desconocido';
  descripcion: string;
  puede_editar: boolean;
  fecha_original?: string;
  pregunta_origen?: string;
}

export interface Evidencia {
  id: string;
  codigo_documento: string;
  tipo_documento_enum: string;
  titulo_documento: string;
  objetivo_documento: string;
  nombre_archivo_original: string;
  archivo: string;
  url_archivo: string;
  tamanio_mb: number;
  fecha_creacion: string;
}

export interface PreguntaConRespuesta {
  id: number;
  correlativo: number;
  framework: number;
  framework_nombre: string;
  codigo_control: string;
  nombre_control: string;
  seccion_general: string;
  objetivo_evaluacion: string;
  pregunta: string;
  nivel_madurez: number;
  evidencias_requeridas: EvidenciaRequerida[];
  respuesta: RespuestaEvaluacionIQ | null;
}

export interface EvidenciaRequerida {
  orden: number;
  descripcion: string;
}

export interface CrearRespuestaData {
  asignacion: number;
  pregunta: number;
  respuesta: 'SI_CUMPLE' | 'CUMPLE_PARCIAL' | 'NO_CUMPLE' | 'NO_APLICA';
  justificacion: string;
  nivel_madurez: number;
  justificacion_madurez?: string;
  comentarios_adicionales?: string;
}

export interface PreguntasAsignacionResponse {
  asignacion: {
    id: number;
    evaluacion: string;
    estado: string;
    total_preguntas: number;
    preguntas_respondidas: number;
    porcentaje_completado: number;
  };
  preguntas: PreguntaConRespuesta[];
}

// Helpers
export const RESPUESTA_OPCIONES = [
  { value: 'SI_CUMPLE', label: 'Sí Cumple', color: 'green', puntos: 1.0 },
  { value: 'CUMPLE_PARCIAL', label: 'Cumple Parcialmente', color: 'yellow', puntos: 0.5 },
  { value: 'NO_CUMPLE', label: 'No Cumple', color: 'red', puntos: 0.0 },
  { value: 'NO_APLICA', label: 'No Aplica', color: 'gray', puntos: null },
] as const;

export const NIVELES_MADUREZ = [
  { value: 0, label: 'Nivel 0 - No implementado' },
  { value: 0.5, label: 'Nivel 0.5' },
  { value: 1.0, label: 'Nivel 1 - Inicial' },
  { value: 1.5, label: 'Nivel 1.5' },
  { value: 2.0, label: 'Nivel 2 - Gestionado' },
  { value: 2.5, label: 'Nivel 2.5' },
  { value: 3.0, label: 'Nivel 3 - Definido' },
  { value: 3.5, label: 'Nivel 3.5' },
  { value: 4.0, label: 'Nivel 4 - Cuantitativamente Gestionado' },
  { value: 4.5, label: 'Nivel 4.5' },
  { value: 5.0, label: 'Nivel 5 - Optimizado' },
] as const;

export function getRespuestaColor(respuesta: string): string {
  const opcion = RESPUESTA_OPCIONES.find(o => o.value === respuesta);
  return opcion?.color || 'gray';
}

export function getRespuestaLabel(respuesta: string): string {
  const opcion = RESPUESTA_OPCIONES.find(o => o.value === respuesta);
  return opcion?.label || respuesta;
}

export function getNivelMadurezLabel(nivel: number): string {
  const nivelObj = NIVELES_MADUREZ.find(n => n.value === nivel);
  return nivelObj?.label || `Nivel ${nivel}`;
}