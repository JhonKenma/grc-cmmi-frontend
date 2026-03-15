// src/types/respuesta-iq.types.ts

// ─────────────────────────────────────────────────────────────────────────────
// RESPUESTA DEL USUARIO
// null        → "Sí" (subirá evidencias, auditor califica)
// 'NO_CUMPLE' → reconoce que no cumple
// 'NO_APLICA' → criterio no aplica
// ─────────────────────────────────────────────────────────────────────────────

export type RespuestaUsuario = null | 'NO_CUMPLE' | 'NO_APLICA';

export type CalificacionAuditor = 'SI_CUMPLE' | 'CUMPLE_PARCIAL' | 'NO_CUMPLE';

export type EstadoRespuesta = 'borrador' | 'enviado' | 'auditado';

// ── Opciones que ve el USUARIO ────────────────────────────────────────────────

export interface OpcionRespuesta {
  value: RespuestaUsuario;
  label: string;
  descripcion: string;
  requiereEvidencias: boolean;
}

export const OPCIONES_RESPUESTA_USUARIO: OpcionRespuesta[] = [
  {
    value: null,
    label: 'Sí',
    descripcion: 'Cumple — debes subir evidencias',
    requiereEvidencias: true,
  },
  {
    value: 'NO_CUMPLE',
    label: 'No',
    descripcion: 'No cumple con el control',
    requiereEvidencias: false,
  },
  {
    value: 'NO_APLICA',
    label: 'No Aplica',
    descripcion: 'El criterio no aplica en este contexto',
    requiereEvidencias: false,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export const requiereEvidencias = (respuesta: RespuestaUsuario): boolean =>
  respuesta === null;

export const estaEnviada = (estado: EstadoRespuesta): boolean =>
  estado === 'enviado' || estado === 'auditado';

// ─────────────────────────────────────────────────────────────────────────────
// EVIDENCIA
// ─────────────────────────────────────────────────────────────────────────────

export interface Evidencia {
  id: string;
  respuesta_iq: number;
  codigo_documento: string;
  tipo_documento_enum: string;
  titulo_documento: string;
  objetivo_documento: string;
  nombre_archivo_original: string;
  archivo: string;
  url_archivo: string;
  tamanio_mb: number;
  fecha_creacion: string;
  // Campos de vinculación con documento maestro
  documento_maestro_id: string | null;
  es_documento_oficial: boolean;
  nombre_documento_maestro: string | null;
  codigo_documento_maestro: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPUESTA IQ — lo que devuelve el backend
// ─────────────────────────────────────────────────────────────────────────────

export interface RespuestaIQ {
  id: number;
  asignacion: number;
  pregunta: number;

  // Respuesta del usuario
  respuesta: RespuestaUsuario;
  justificacion: string;
  comentarios_adicionales: string;

  // Calificación del auditor (read-only para el usuario)
  calificacion_auditor: CalificacionAuditor | null;
  calificacion_display: string | null;
  comentarios_auditor: string;
  recomendaciones_auditor: string;
  fecha_auditoria: string | null;
  auditado_por: number | null;
  auditado_por_nombre: string | null;
  nivel_madurez: number;

  // Estado del flujo
  estado: EstadoRespuesta;
  estado_display: string;

  // Propagación
  es_respuesta_original: boolean;
  propagada_desde: number | null;

  // Auditoría de registro
  respondido_por: number;
  respondido_por_nombre: string;
  respondido_at: string;
  modificado_por: number | null;
  modificado_at: string | null;
  version: number;

  // Relaciones
  evidencias: Evidencia[];
  total_evidencias: number;
  puntaje: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYLOAD CREAR / ACTUALIZAR (usuario)
// ─────────────────────────────────────────────────────────────────────────────

export interface CrearRespuestaIQData {
  asignacion: number;
  pregunta: number;
  respuesta: RespuestaUsuario;
  justificacion: string;
  comentarios_adicionales?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PREGUNTA CON RESPUESTA (para el formulario)
// ─────────────────────────────────────────────────────────────────────────────

export interface EvidenciaRequerida {
  orden: number;
  descripcion: string;
}

export interface PreguntaConRespuesta {
  id: number;
  correlativo: string;
  framework: number;
  framework_nombre: string;
  codigo_control: string;
  nombre_control: string;
  seccion_general: string;
  objetivo_evaluacion: string;
  pregunta: string;
  nivel_madurez: number;
  nivel_madurez_display: string;
  evidencias_requeridas: EvidenciaRequerida[];
  respuesta: RespuestaIQ | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPUESTA DEL ENDPOINT preguntas-asignacion
// ─────────────────────────────────────────────────────────────────────────────

export interface AsignacionIQResumen {
  id: number;
  evaluacion: string;
  estado: string;
  total_preguntas: number;
  preguntas_respondidas: number;
  porcentaje_completado: number;
}

export interface PreguntasAsignacionResponse {
  asignacion: AsignacionIQResumen;
  preguntas: PreguntaConRespuesta[];
}