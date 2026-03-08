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
  VerificacionCodigoResponse,
  AuditorCalificacion,
  AuditorCerrarRevision,
} from '@/types';

export const respuestasApi = {
  // ---------------------------------------------------------------------
  // ENDPOINTS DEL USUARIO
  // ---------------------------------------------------------------------

  list: async (asignacionId: string): Promise<RespuestaListItem[]> => {
    const response = await axiosInstance.get<RespuestaListItem[]>('/respuestas/', {
      params: { asignacion: asignacionId },
    });
    return response.data;
  },

  listParaRevision: async (asignacionId: string): Promise<{ count: number; results: Respuesta[] }> => {
    const response = await axiosInstance.get<{ count: number; results: Respuesta[] }>(
      '/respuestas/revision/',
      { params: { asignacion: asignacionId } }
    );
    return response.data;
  },

  get: async (id: string): Promise<Respuesta> => {
    const response = await axiosInstance.get<Respuesta>(`/respuestas/${id}/`);
    return response.data;
  },

  create: async (data: RespuestaCreate): Promise<ApiResponse<Respuesta>> => {
    const response = await axiosInstance.post<ApiResponse<Respuesta>>('/respuestas/', data);
    return response.data;
  },

  update: async (id: string, data: RespuestaUpdate): Promise<ApiResponse<Respuesta>> => {
    const response = await axiosInstance.patch<ApiResponse<Respuesta>>(`/respuestas/${id}/`, data);
    return response.data;
  },

  enviar: async (id: string): Promise<ApiResponse<{
    respuesta: Respuesta;
    asignacion: unknown;
    asignacion_completa: boolean;
  }>> => {
    const response = await axiosInstance.post<ApiResponse<{
      respuesta: Respuesta;
      asignacion: unknown;
      asignacion_completa: boolean;
    }>>(`/respuestas/${id}/enviar/`);
    return response.data;
  },

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

  // ---------------------------------------------------------------------
  // ENDPOINTS DEL AUDITOR
  // ---------------------------------------------------------------------

  auditor: {
    misRevisiones: async (evaluacionEmpresaId?: string) => {
      const response = await axiosInstance.get('/auditor/mis_revisiones/', {
        params: evaluacionEmpresaId ? { evaluacion_empresa_id: evaluacionEmpresaId } : {},
      });
      return response.data;
    },

    calificar: async (
      respuestaId: string,
      data: AuditorCalificacion
    ): Promise<ApiResponse<Respuesta>> => {
      const response = await axiosInstance.post<ApiResponse<Respuesta>>(
        `/auditor/calificar/${respuestaId}/`,
        data
      );
      return response.data;
    },

    cerrarRevision: async (
      asignacionId: string,
      data?: AuditorCerrarRevision
    ): Promise<ApiResponse<{
      asignacion_id: string;
      estado: string;
      gap_info: {
        nivel_deseado: number;
        nivel_actual: number;
        gap: number;
        clasificacion: string;
        porcentaje_cumplimiento: number;
      } | null;
      pendientes_auto_nc: number;
    }>> => {
      const response = await axiosInstance.post(
        `/auditor/cerrar_revision/${asignacionId}/`,
        data || {}
      );
      return response.data;
    },

    historial: async (params?: {
      fecha_desde?: string;
      fecha_hasta?: string;
      evaluacion_empresa_id?: string;
    }) => {
      const response = await axiosInstance.get('/auditor/historial/', { params });
      return response.data;
    },

    notificaciones: async (params?: {
      solo_no_leidas?: boolean;
      fecha_desde?: string;
    }) => {
      const response = await axiosInstance.get('/auditor/notificaciones/', { params });
      return response.data;
    },
  },

  // ---------------------------------------------------------------------
  // ENDPOINTS DE EVIDENCIAS
  // ---------------------------------------------------------------------

  subirEvidencia: async (data: EvidenciaCreate): Promise<ApiResponse<Evidencia>> => {
    const formData = new FormData();
    formData.append('respuesta_id', data.respuesta_id);

    if (data.documento_id) {
      formData.append('documento_id', data.documento_id);
    } else {
      if (data.archivo) formData.append('archivo', data.archivo);
      if (data.codigo_documento) formData.append('codigo_documento', data.codigo_documento);
      if (data.titulo_documento) formData.append('titulo_documento', data.titulo_documento);
      if (data.objetivo_documento) formData.append('objetivo_documento', data.objetivo_documento);
      if (data.tipo_documento_enum) formData.append('tipo_documento_enum', data.tipo_documento_enum);
    }

    const response = await axiosInstance.post<ApiResponse<Evidencia>>('/evidencias/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  eliminarEvidencia: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/evidencias/${id}/`);
  },

  verificarCodigoDocumento: async (codigo: string): Promise<VerificacionCodigoResponse> => {
    const response = await axiosInstance.post<VerificacionCodigoResponse>(
      '/evidencias/verificar_codigo/',
      { codigo_documento: codigo }
    );
    return response.data;
  },

  listarEvidencias: async (respuestaId: string): Promise<ApiResponse<Evidencia[]>> => {
    const response = await axiosInstance.get<ApiResponse<Evidencia[]>>('/evidencias/', {
      params: { respuesta: respuestaId },
    });
    return response.data;
  },

  getHistorial: async (respuestaId: string): Promise<HistorialRespuesta[]> => {
    const response = await axiosInstance.get<HistorialRespuesta[]>(
      `/respuestas/${respuestaId}/historial/`
    );
    return response.data;
  },
};
