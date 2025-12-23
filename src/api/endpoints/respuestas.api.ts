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
   * Subir evidencia
   * POST /api/evidencias/
   */
  subirEvidencia: async (data: EvidenciaCreate): Promise<ApiResponse<Evidencia>> => {
    const formData = new FormData();
    formData.append('respuesta', data.respuesta);
    formData.append('tipo_documento_enum', data.tipo_documento_enum);
    formData.append('titulo_documento', data.titulo_documento);
    formData.append('objetivo_documento', data.objetivo_documento);
    formData.append('fecha_ultima_actualizacion', data.fecha_ultima_actualizacion);
    formData.append('archivo', data.archivo);

    const response = await axiosInstance.post<ApiResponse<Evidencia>>(
      '/evidencias/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Eliminar evidencia
   * DELETE /api/evidencias/{id}/
   */
  eliminarEvidencia: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/evidencias/${id}/`);
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
   * ⭐ NUEVO: Verificar si un código de documento ya existe
   * POST /api/evidencias/verificar_codigo/
   */
  verificarCodigoDocumento: async (codigoDocumento: string): Promise<VerificacionCodigoResponse> => {
    const response = await axiosInstance.post<VerificacionCodigoResponse>(
      '/evidencias/verificar_codigo/',
      { codigo_documento: codigoDocumento }
    );
    return response.data;
  },
  
};