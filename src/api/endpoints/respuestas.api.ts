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
  // ─────────────────────────────────────────────────────────────────────────
  // ENDPOINTS DEL USUARIO
  // ─────────────────────────────────────────────────────────────────────────

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
   * Crear nueva respuesta (USUARIO)
   * Solo puede enviar respuesta=null (sube evidencias) o 'NO_APLICA'
   * POST /api/respuestas/
   */
  create: async (data: RespuestaCreate): Promise<ApiResponse<Respuesta>> => {
    const response = await axiosInstance.post<ApiResponse<Respuesta>>('/respuestas/', data);
    return response.data;
  },

  /**
   * Actualizar respuesta en borrador (USUARIO)
   * Solo puede actualizar respuesta=null|'NO_APLICA', justificacion, comentarios
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
   * Enviar respuesta (borrador → enviado)
   * Al enviar la última respuesta de la asignación → notifica al Auditor
   * POST /api/respuestas/{id}/enviar/
   */
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

  // ─────────────────────────────────────────────────────────────────────────
  // ENDPOINTS DEL AUDITOR
  // ─────────────────────────────────────────────────────────────────────────

  auditor: {
    /**
     * Asignaciones pendientes de auditar de la empresa del auditor
     * GET /api/auditor/mis_revisiones/?evaluacion_empresa_id={id}
     */
    misRevisiones: async (evaluacionEmpresaId?: string) => {
      const response = await axiosInstance.get('/auditor/mis_revisiones/', {
        params: evaluacionEmpresaId ? { evaluacion_empresa_id: evaluacionEmpresaId } : {},
      });
      return response.data;
    },

    /**
     * Calificar una respuesta individual
     * POST /api/auditor/calificar/{respuesta_id}/
     */
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

    /**
     * Cerrar revisión de una asignación completa
     * - Sin calificar → NO_CUMPLE automático
     * - GAP se calcula automáticamente
     * POST /api/auditor/cerrar_revision/{asignacion_id}/
     */
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

    /**
     * Historial de asignaciones ya auditadas
     * GET /api/auditor/historial/?fecha_desde=&fecha_hasta=&evaluacion_empresa_id=
     */
    historial: async (params?: {
      fecha_desde?: string;
      fecha_hasta?: string;
      evaluacion_empresa_id?: string;
    }) => {
      const response = await axiosInstance.get('/auditor/historial/', { params });
      return response.data;
    },

    /**
     * Notificaciones del auditor (evaluaciones cerradas/terminadas)
     * GET /api/auditor/notificaciones/?solo_no_leidas=true&fecha_desde=
     */
    notificaciones: async (params?: {
      solo_no_leidas?: boolean;
      fecha_desde?: string;
    }) => {
      const response = await axiosInstance.get('/auditor/notificaciones/', { params });
      return response.data;
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ENDPOINTS DE EVIDENCIAS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Subir evidencia a Supabase Storage
   * POST /api/evidencias/
   */
  subirEvidencia: async (data: EvidenciaCreate): Promise<ApiResponse<Evidencia>> => {
    const formData = new FormData();
    formData.append('respuesta_id', data.respuesta_id);
    formData.append('codigo_documento', data.codigo_documento);
    formData.append('tipo_documento_enum', data.tipo_documento_enum);
    formData.append('titulo_documento', data.titulo_documento);
    formData.append('objetivo_documento', data.objetivo_documento);
    formData.append('archivo', data.archivo);

    console.log('📤 [API] Subiendo evidencia:', data.codigo_documento, data.archivo.name);

    const response = await axiosInstance.post<ApiResponse<Evidencia>>(
      '/evidencias/',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Eliminar evidencia de Supabase y BD
   * DELETE /api/evidencias/{id}/
   */
  eliminarEvidencia: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/evidencias/${id}/`);
  },

  /**
   * Verificar si código de documento ya existe
   * POST /api/evidencias/verificar_codigo/
   */
  verificarCodigoDocumento: async (codigoDocumento: string): Promise<VerificacionCodigoResponse> => {
    const response = await axiosInstance.post<VerificacionCodigoResponse>(
      '/evidencias/verificar_codigo/',
      { codigo_documento: codigoDocumento }
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

  /**
   * Historial de cambios de una respuesta
   * GET /api/respuestas/{id}/historial/
   */
  getHistorial: async (respuestaId: string): Promise<HistorialRespuesta[]> => {
    const response = await axiosInstance.get<HistorialRespuesta[]>(
      `/respuestas/${respuestaId}/historial/`
    );
    return response.data;
  },
};