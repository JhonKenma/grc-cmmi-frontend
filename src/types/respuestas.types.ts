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
  codigo_documento: string; 
  tipo_documento_enum: 'politica' | 'norma' | 'procedimiento' | 'formato_interno' | 'otro';
  tipo_documento_display: string;
  titulo_documento: string;
  objetivo_documento: string;
  fecha_ultima_actualizacion: string;
  nombre_archivo_original: string;
  archivo: string;
  tamanio_bytes: number;
  tamanio_mb: number;
  url_archivo: string;
  subido_por: number;
  subido_por_nombre: string;
  fecha_creacion: string;
  activo: boolean;
}

export interface EvidenciaCreate {
  respuesta: string;
  codigo_documento: string;
  tipo_documento_enum: 'politica' | 'norma' | 'procedimiento' | 'formato_interno' | 'otro';
  titulo_documento: string;
  objetivo_documento: string;
  fecha_ultima_actualizacion: string;
  archivo: File;
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