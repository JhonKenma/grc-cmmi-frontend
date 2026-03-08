// src/types/respuestas.types.ts

// --- GENERICOS ---
export interface ApiResponse<T> {
  message: string;
  data: T;
  status?: string | boolean;
}

// --- TIPOS AUXILIARES ---
export interface TipoDocumento {
  id: string;
  nombre: string;
  descripcion: string;
  requiere_fecha: boolean;
  activo: boolean;
  abreviatura?: string;
}

export interface EvidenciaEncontrada {
  id: string;
  codigo_documento: string;
  tipo_documento_display: string;
  titulo_documento: string;
  pregunta_codigo: string;
  dimension_nombre?: string;
  subido_por: string | number;
  fecha_creacion: string;
  url_archivo?: string;
}

// --- TIPOS PRINCIPALES DE EVIDENCIA ---
export interface Evidencia {
  id: string;
  respuesta: string;
  codigo_documento: string;
  tipo_documento_enum?: 'politica' | 'norma' | 'procedimiento' | 'formato_interno' | 'otro';
  tipo_documento_display?: string;
  titulo_documento: string;
  objetivo_documento: string;
  fecha_ultima_actualizacion: string;
  documento_maestro?: string;          // ← este campo es solo de respuesta
  nombre_archivo_original?: string;
  archivo?: string;
  url_archivo?: string;
  extension?: string;
  tamanio_bytes?: number;
  tamanio_mb?: number;
  tipo_mime?: string;
  subido_por: number;
  subido_por_nombre: string;
  fecha_creacion: string;
  activo: boolean;
}

// Payload para subir/crear evidencia (¡CORREGIDO!)
export interface EvidenciaCreate {
  respuesta_id: string;
  documento_id?: string | null;        // ← ahora se llama documento_id
  codigo_documento?: string;
  tipo_documento_enum?: 'politica' | 'norma' | 'procedimiento' | 'formato_interno' | 'otro';
  titulo_documento?: string;
  objetivo_documento?: string;
  archivo?: File | null;
}

// Respuesta del endpoint de verificación de código
export interface VerificacionCodigoResponse {
  existe: boolean;
  mensaje: string;
  documento_maestro?: {
    id: string;
    titulo: string;
    estado: string;
    version: string;
  };
  evidencias_encontradas?: EvidenciaEncontrada[];
}

/** Lo único que puede marcar el usuario */
export type RespuestaUsuario = 'NO_APLICA';

/** Calificaciones exclusivas del auditor */
export type CalificacionAuditor = 'SI_CUMPLE' | 'CUMPLE_PARCIAL' | 'NO_CUMPLE';

/** Todos los valores posibles en el campo respuesta */
export type RespuestaValor = RespuestaUsuario | CalificacionAuditor;

/** Estados del ciclo de vida de una respuesta */
export type RespuestaEstado =
  | 'borrador'
  | 'enviado'
  | 'pendiente_auditoria'
  | 'auditado'
  | 'modificado_admin';
export interface Respuesta {
  id: string;
  asignacion: string;
  pregunta: string;
  pregunta_codigo: string;
  pregunta_texto: string;
  pregunta_objetivo?: string;

  // Respuesta del USUARIO: null = subió evidencias | 'NO_APLICA' = no aplica
  respuesta: RespuestaValor | null;

  justificacion: string;
  comentarios_adicionales: string;

  // Campos del AUDITOR (solo los rellena el auditor)
  calificacion_auditor: CalificacionAuditor | null;
  calificacion_display: string;
  comentarios_auditor: string;
  recomendaciones_auditor: string;
  fecha_auditoria: string | null;
  auditado_por: number | null;
  auditado_por_nombre: string;

  // Nivel de madurez (lo asigna el auditor)
  nivel_madurez: number;

  estado: RespuestaEstado;
  estado_display: string;
  respondido_por: number;
  respondido_por_nombre: string;
  respondido_at: string;
  modificado_por?: number;
  modificado_por_nombre?: string;
  modificado_at?: string;
  version: number;
  evidencias?: Evidencia[];
}

export interface RespuestaListItem {
  id: string;
  asignacion: string;
  pregunta: string;
  pregunta_codigo: string;
  pregunta_texto: string;

  // null cuando el usuario subió evidencias sin marcar NO_APLICA
  respuesta: RespuestaValor | null;

  justificacion: string;
  comentarios_adicionales?: string;

  // Calificación del auditor
  calificacion_auditor: CalificacionAuditor | null;
  calificacion_display: string;
  nivel_madurez: number;

  estado: RespuestaEstado;
  estado_display: string;
  respondido_por: number;
  respondido_por_nombre: string;
  respondido_at: string;
  total_evidencias: number;
  version: number;
}


export interface RespuestaCreate {
  asignacion: string;
  pregunta: string;
  // null        → sube evidencias, el auditor calificará (opción "Sí")
  // 'NO_CUMPLE' → usuario respondió "No", sin evidencias
  // 'NO_APLICA' → no aplica, requiere justificación
  respuesta: 'NO_APLICA' | 'NO_CUMPLE' | null;
  justificacion: string;
  comentarios_adicionales?: string;
}

export interface RespuestaUpdate {
  respuesta: 'NO_APLICA' | 'NO_CUMPLE' | null;
  justificacion: string;
  comentarios_adicionales?: string;
}

/** Lo que envía el AUDITOR al calificar una respuesta */
export interface AuditorCalificacion {
  calificacion_auditor: CalificacionAuditor;
  comentarios_auditor?: string;
  recomendaciones_auditor?: string;
  nivel_madurez: number;
}

/** Body para cerrar revisión de una asignación */
export interface AuditorCerrarRevision {
  comentario_cierre?: string;
}

// --- HISTORIAL ---
export interface HistorialRespuesta {
  id: string;
  respuesta: string;
  tipo_cambio: string;
  tipo_cambio_display: string;
  usuario: number;
  usuario_nombre: string;
  valor_anterior_respuesta?: string;
  valor_anterior_justificacion?: string;
  valor_anterior_comentarios?: string;
  valor_nuevo_respuesta?: string;
  valor_nuevo_justificacion?: string;
  valor_nuevo_comentarios?: string;
  motivo: string;
  timestamp: string;
}