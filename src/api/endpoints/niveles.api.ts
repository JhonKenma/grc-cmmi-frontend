// src/api/endpoints/niveles.api.ts

import axiosInstance from '../axios';
import { NivelReferencia, ApiResponse } from '@/types';

/**
 * API de Niveles de Referencia
 */
export const nivelesApi = {
  /**
   * Listar niveles de referencia
   * GET /api/niveles-referencia/?pregunta_id=xxx
   */
  list: async (preguntaId?: string): Promise<NivelReferencia[]> => {
    const params = preguntaId ? { pregunta_id: preguntaId } : {};
    const response = await axiosInstance.get<NivelReferencia[]>(
      '/encuestas/niveles-referencia/',
      { params }
    );
    return response.data;
  },

  /**
   * Obtener detalle de un nivel
   * GET /api/niveles-referencia/{id}/
   */
  get: async (id: string): Promise<NivelReferencia> => {
    const response = await axiosInstance.get<NivelReferencia>(
      `/encuestas/niveles-referencia/${id}/`
    );
    return response.data;
  },

  /**
   * Actualizar nivel de referencia (PATCH)
   * PATCH /api/niveles-referencia/{id}/
   */
  update: async (
    id: string,
    data: Partial<NivelReferencia>
  ): Promise<ApiResponse<NivelReferencia>> => {
    const response = await axiosInstance.patch<ApiResponse<NivelReferencia>>(
      `/encuestas/niveles-referencia/${id}/`,
      data
    );
    return response.data;
  },

  /**
   * Activar/Desactivar nivel
   * POST /api/niveles-referencia/{id}/toggle_estado/
   */
  toggleEstado: async (id: string): Promise<ApiResponse<NivelReferencia>> => {
    const response = await axiosInstance.post<ApiResponse<NivelReferencia>>(
      `/encuestas/niveles-referencia/${id}/toggle_estado/`
    );
    return response.data;
  },
};