// src/api/endpoints/respuesta-iq.api.ts

import api from '../axios';
import type {
  RespuestaEvaluacionIQ,
  CrearRespuestaData,
  PreguntasAsignacionResponse,
} from '@/types/respuesta-iq.types';

export const respuestaIQApi = {
  /**
   * Obtener preguntas de una asignación con sus respuestas
   */
  obtenerPreguntasAsignacion: async (asignacionId: number): Promise<PreguntasAsignacionResponse> => {
    const { data } = await api.get(`/respuestas-iq/preguntas-asignacion/${asignacionId}/`);
    return data;
  },

  /**
   * Listar respuestas (con filtros opcionales)
   */
  listar: async (params?: { asignacion?: number }): Promise<RespuestaEvaluacionIQ[]> => {
    const { data } = await api.get('/respuestas-iq/', { params });
    return data;
  },

  /**
   * Obtener una respuesta específica
   */
  obtener: async (id: number): Promise<RespuestaEvaluacionIQ> => {
    const { data } = await api.get(`/respuestas-iq/${id}/`);
    return data;
  },

  /**
   * Crear una respuesta
   */
  crear: async (respuestaData: CrearRespuestaData): Promise<RespuestaEvaluacionIQ> => {
    const { data } = await api.post('/respuestas-iq/', respuestaData);
    return data;
  },

  /**
   * Actualizar una respuesta
   */
  actualizar: async (id: number, respuestaData: Partial<CrearRespuestaData>): Promise<RespuestaEvaluacionIQ> => {
    const { data } = await api.patch(`/respuestas-iq/${id}/`, respuestaData);
    return data;
  },

  /**
   * Eliminar una respuesta
   */
  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/respuestas-iq/${id}/`);
  },

  /**
   * Subir evidencia para una respuesta
   */
  subirEvidencia: async (
    respuestaId: number,
    formData: FormData
  ): Promise<any> => {
    // La respuesta_iq ya está incluida en el FormData
    const { data } = await api.post(`/evidencias/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Eliminar evidencia
   */
  eliminarEvidencia: async (evidenciaId: string): Promise<void> => {
    await api.delete(`/evidencias/${evidenciaId}/`);
  },
};