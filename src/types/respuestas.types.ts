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

// --- TIPOS DE RESPUESTA (sin cambios) ---
export interface Respuesta {
  id: string;
  asignacion: string;
  pregunta: string;
  pregunta_codigo: string;
  pregunta_texto: string;
  pregunta_objetivo?: string;
  respuesta: 'SI_CUMPLE' | 'CUMPLE_PARCIAL' | 'NO_CUMPLE' | 'NO_APLICA';
  respuesta_display: string;
  justificacion: string;
  comentarios_adicionales: string;
  nivel_madurez: number;
  nivel_madurez_display?: string;
  justificacion_madurez: string;
  estado: 'borrador' | 'enviado' | 'modificado_admin';
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
  respuesta: 'SI_CUMPLE' | 'CUMPLE_PARCIAL' | 'NO_CUMPLE' | 'NO_APLICA';
  respuesta_display: string;
  justificacion: string;
  nivel_madurez: number;
  nivel_madurez_display?: string;
  justificacion_madurez: string;
  comentarios_adicionales?: string;
  estado: 'borrador' | 'enviado' | 'modificado_admin';
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
  respuesta: 'SI_CUMPLE' | 'CUMPLE_PARCIAL' | 'NO_CUMPLE' | 'NO_APLICA';
  justificacion: string;
  comentarios_adicionales?: string;
  nivel_madurez: number;
  justificacion_madurez?: string;
}

export interface RespuestaUpdate {
  respuesta: 'SI_CUMPLE' | 'CUMPLE_PARCIAL' | 'NO_CUMPLE' | 'NO_APLICA';
  justificacion: string;
  comentarios_adicionales?: string;
  nivel_madurez?: number;
  justificacion_madurez?: string;
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