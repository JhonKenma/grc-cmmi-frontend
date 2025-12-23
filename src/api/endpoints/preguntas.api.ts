// src/api/endpoints/preguntas.api.ts

import axiosInstance from '../axios';
import { Pregunta, PreguntaListItem, ApiResponse } from '@/types';

/**
 * API de Preguntas
 */
export const preguntasApi = {
  /**
   * Listar preguntas
   * GET /api/preguntas/?dimension_id=xxx
   */
  list: async (dimensionId?: string): Promise<PreguntaListItem[]> => {
    const params = dimensionId ? { dimension_id: dimensionId } : {};
    const response = await axiosInstance.get<PreguntaListItem[]>(
      '/encuestas/preguntas/',
      { params }
    );
    return response.data;
  },

  /**
   * Obtener detalle de una pregunta
   * GET /api/preguntas/{id}/
   */
  get: async (id: string): Promise<Pregunta> => {
    const response = await axiosInstance.get<Pregunta>(
      `/encuestas/preguntas/${id}/`
    );
    return response.data;
  },

  /**
   * Actualizar pregunta (PATCH)
   * PATCH /api/preguntas/{id}/
   */
  update: async (
    id: string,
    data: Partial<Pregunta>
  ): Promise<ApiResponse<Pregunta>> => {
    const response = await axiosInstance.patch<ApiResponse<Pregunta>>(
      `/encuestas/preguntas/${id}/`,
      data
    );
    return response.data;
  },

  /**
   * Activar/Desactivar pregunta
   * POST /api/preguntas/{id}/toggle_estado/
   */
  toggleEstado: async (id: string): Promise<ApiResponse<Pregunta>> => {
    const response = await axiosInstance.post<ApiResponse<Pregunta>>(
      `/encuestas/preguntas/${id}/toggle_estado/`
    );
    return response.data;
  },
};