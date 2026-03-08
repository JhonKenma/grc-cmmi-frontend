// src/api/endpoints/respuestas.api.ts

import axiosInstance from '../axios';
import {
  Respuesta,
  RespuestaListItem,
  RespuestaCreate,
  RespuestaUpdate,
  Evidencia,
  EvidenciaCreate,
  HistorialRespuesta,
  ApiResponse,
  VerificacionCodigoResponse
} from '@/types';

export const respuestasApi = {
  /**
   * Listar respuestas de una asignación
   * GET /api/respuestas/?asignacion={id}
   */
  list: async (asignacionId: string): Promise<RespuestaListItem[]> => {
    const response = await axiosInstance.get<RespuestaListItem[]>(
      '/respuestas/',
      { params: { asignacion: asignacionId } }
    );
    return response.data;
  },

  /**
   * Listar respuestas para revisión (incluye evidencias completas)
   * GET /api/respuestas/revision/?asignacion={id}
   */
  listParaRevision: async (asignacionId: string): Promise<{ count: number; results: Respuesta[] }> => {
    const response = await axiosInstance.get<{ count: number; results: Respuesta[] }>(
      '/respuestas/revision/',
      { params: { asignacion: asignacionId } }
    );
    return response.data;
  },

  /**
   * Obtener detalle de una respuesta
   * GET /api/respuestas/{id}/
   */
  get: async (id: string): Promise<Respuesta> => {
    const response = await axiosInstance.get<Respuesta>(`/respuestas/${id}/`);
    return response.data;
  },

  /**
   * Crear nueva respuesta
   * POST /api/respuestas/
   */
  create: async (data: RespuestaCreate): Promise<ApiResponse<Respuesta>> => {
    const response = await axiosInstance.post<ApiResponse<Respuesta>>(
      '/respuestas/',
      data
    );
    return response.data;
  },

  /**
   * Actualizar respuesta (solo en borrador)
   * PATCH /api/respuestas/{id}/
   */
  update: async (id: string, data: RespuestaUpdate): Promise<ApiResponse<Respuesta>> => {
    const response = await axiosInstance.patch<ApiResponse<Respuesta>>(
      `/respuestas/${id}/`,
      data
    );
    return response.data;
  },

  /**
   * Enviar respuesta (cambiar de borrador a enviado)
   * POST /api/respuestas/{id}/enviar/
   */
  enviar: async (id: string): Promise<ApiResponse<Respuesta>> => {
    const response = await axiosInstance.post<ApiResponse<Respuesta>>(
      `/respuestas/${id}/enviar/`
    );
    return response.data;
  },

  /**
   * Modificar respuesta como administrador
   * POST /api/respuestas/{id}/modificar_admin/
   */
  modificarAdmin: async (
    id: string,
    data: {
      respuesta?: string;
      justificacion?: string;
      comentarios_adicionales?: string;
      motivo_modificacion?: string;
    }
  ): Promise<ApiResponse<Respuesta>> => {
    const response = await axiosInstance.post<ApiResponse<Respuesta>>(
      `/respuestas/${id}/modificar_admin/`,
      data
    );
    return response.data;
  },

  /**
   * Subir evidencia o Vincular Documento Maestro (Lógica unificada)
   * POST /api/evidencias/
   */
  subirEvidencia: async (data: EvidenciaCreate): Promise<ApiResponse<Evidencia>> => {
    const formData = new FormData();
    
    formData.append('respuesta_id', data.respuesta_id);

    // ✅ Ahora usamos documento_id (según la interfaz corregida)
    if (data.documento_id) {
      formData.append('documento_id', data.documento_id);
    } else {
      if (data.archivo) formData.append('archivo', data.archivo);
      if (data.codigo_documento) formData.append('codigo_documento', data.codigo_documento);
      if (data.titulo_documento) formData.append('titulo_documento', data.titulo_documento);
      if (data.objetivo_documento) formData.append('objetivo_documento', data.objetivo_documento);
      if (data.tipo_documento_enum) formData.append('tipo_documento_enum', data.tipo_documento_enum);
    }

    const response = await axiosInstance.post<ApiResponse<Evidencia>>(
      '/evidencias/',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  /**
   * Eliminar evidencia de Supabase y BD
   * DELETE /api/evidencias/{id}/
   */
  eliminarEvidencia: async (id: string): Promise<void> => {
    console.log('🗑️ [API] Eliminando evidencia:', id);
    try {
        await axiosInstance.delete(`/evidencias/${id}/`);
        console.log('✅ [API] Evidencia eliminada exitosamente');
    } catch (error: any) {
        console.error('❌ [API] Error al eliminar evidencia:', error.response?.data || error);
        throw error;
    }
  },

  /**
   * Verificar si código de documento existe
   * POST /api/evidencias/verificar_codigo/
   */
  verificarCodigoDocumento: async (codigo: string): Promise<VerificacionCodigoResponse> => {
    console.log('🔍 [API] Verificando código:', codigo);
    
    const response = await axiosInstance.post<VerificacionCodigoResponse>(
      '/evidencias/verificar_codigo/',
      { codigo_documento: codigo }
    );
    
    console.log('✅ [API] Verificación completada:', response.data);
    return response.data;
  },

  /**
   * Obtener historial de una respuesta
   * GET /api/respuestas/{id}/historial/
   */
  getHistorial: async (respuestaId: string): Promise<HistorialRespuesta[]> => {
    const response = await axiosInstance.get<HistorialRespuesta[]>(
      `/respuestas/${respuestaId}/historial/`
    );
    return response.data;
  },

  /**
   * Listar evidencias de una respuesta
   * GET /api/evidencias/?respuesta={id}
   */
  listarEvidencias: async (respuestaId: string): Promise<ApiResponse<Evidencia[]>> => {
    const response = await axiosInstance.get<ApiResponse<Evidencia[]>>(
      '/evidencias/',
      { params: { respuesta: respuestaId } }
    );
    return response.data;
  },
};