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
   * ⭐ NUEVO: Listar respuestas para revisión (incluye evidencias completas)
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
   * ⭐ NUEVO: Modificar respuesta como administrador
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
   * Subir evidencia a Supabase Storage
   * POST /api/evidencias//12/01/2026
   */
  subirEvidencia: async (data: EvidenciaCreate): Promise<ApiResponse<Evidencia>> => {
    const formData = new FormData();
    
    // ⭐ ORDEN: Campos de metadatos primero, archivo al final
    formData.append('respuesta_id', data.respuesta_id);  // ⭐ Cambió de 'respuesta'
    formData.append('codigo_documento', data.codigo_documento);
    formData.append('tipo_documento_enum', data.tipo_documento_enum);
    formData.append('titulo_documento', data.titulo_documento);
    formData.append('objetivo_documento', data.objetivo_documento);
    formData.append('archivo', data.archivo);
    
    // ⭐ NO enviar fecha_ultima_actualizacion (se genera automáticamente en backend)

    // Log para debugging
    console.log('📤 [API] Subiendo evidencia a Supabase:');
    console.log('   - Respuesta ID:', data.respuesta_id);
    console.log('   - Código:', data.codigo_documento);
    console.log('   - Tipo:', data.tipo_documento_enum);
    console.log('   - Título:', data.titulo_documento);
    console.log('   - Archivo:', data.archivo.name, `(${(data.archivo.size / 1024 / 1024).toFixed(2)} MB)`);

    try {
      const response = await axiosInstance.post<ApiResponse<Evidencia>>(
        '/evidencias/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('✅ [API] Evidencia subida exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] Error al subir evidencia:', error.response?.data || error);
      throw error;
    }
  },

  /**
   * Eliminar evidencia de Supabase y BD//12/01/2026
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
   * Verificar si código de documento existe//12/01/2026
   * POST /api/evidencias/verificar_codigo/
   */
  verificarCodigoDocumento: async (codigoDocumento: string): Promise<VerificacionCodigoResponse> => {
    console.log('🔍 [API] Verificando código:', codigoDocumento);
    
    const response = await axiosInstance.post<VerificacionCodigoResponse>(
      '/evidencias/verificar_codigo/',
      { codigo_documento: codigoDocumento }
    );
    
    console.log('✅ [API] Verificación completada:', response.data);
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