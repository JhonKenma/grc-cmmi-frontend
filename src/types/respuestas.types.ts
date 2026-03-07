// src/types/respuestas.types.ts

export interface TipoDocumento {
  id: string;
  nombre: string;
  descripcion: string;
  requiere_fecha: boolean;
  activo: boolean;
}

export interface Evidencia {
  id: string;
  respuesta: string;
  
  // Metadatos del documento
  codigo_documento: string;
  tipo_documento_enum: 'politica' | 'norma' | 'procedimiento' | 'formato_interno' | 'otro';
  tipo_documento_display: string;
  titulo_documento: string;
  objetivo_documento: string;
  fecha_ultima_actualizacion: string;
  
  // Datos del archivo
  nombre_archivo_original: string;
  archivo: string;  // ⭐ Ruta en Supabase (no URL completa)
  url_archivo: string;  // ⭐ URL firmada temporal de Supabase
  extension: string;  // ⭐ NUEVO: Extensión del archivo (.pdf, .docx, etc)
  tamanio_bytes: number;
  tamanio_mb: number;
  tipo_mime: string;  // ⭐ NUEVO: Tipo MIME (application/pdf, etc)
  
  // Auditoría
  subido_por: number;
  subido_por_nombre: string;
  fecha_creacion: string;
  activo: boolean;
}

export interface EvidenciaCreate {
  respuesta_id: string;  // ⭐ CAMBIAR de 'respuesta' a 'respuesta_id'
  codigo_documento: string;
  tipo_documento_enum: 'politica' | 'norma' | 'procedimiento' | 'formato_interno' | 'otro';
  titulo_documento: string;
  objetivo_documento: string;
  archivo: File;  // ⭐ Solo el archivo, fecha_ultima_actualizacion se genera automáticamente
}

export interface VerificacionCodigoResponse {
  existe: boolean;
  evidencias_encontradas: Array<{
    id: string;
    codigo_documento: string;
    tipo_documento: string;
    tipo_documento_display: string;
    titulo_documento: string;
    objetivo_documento: string;
    pregunta_codigo: string;
    pregunta_texto: string;
    dimension_nombre: string;
    subido_por: string;
    fecha_creacion: string;
    url_archivo: string;
    puede_reutilizar: boolean;
  }>;
  total_encontradas: number;
  mensaje: string;
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