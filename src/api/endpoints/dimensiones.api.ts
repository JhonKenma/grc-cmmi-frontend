import axiosInstance from '../axios';
import {
  Dimension,
  DimensionListItem,
  Pregunta,
  ApiResponse
} from '@/types';

/**
 * API de Dimensiones
 * Base real en backend: /api/encuestas/dimensiones/
 */
export const dimensionesApi = {
  /**
   * Listar dimensiones
   * GET /api/encuestas/dimensiones/?encuesta_id=xxx
   */
  list: async (encuestaId?: string): Promise<DimensionListItem[]> => {
    const params = encuestaId ? { encuesta_id: encuestaId } : {};
    const response = await axiosInstance.get<DimensionListItem[]>(
      '/encuestas/dimensiones/',
      { params }
    );
    return response.data;
  },

  /**
   * Obtener detalle de una dimensión
   * GET /api/encuestas/dimensiones/{id}/
   */
  get: async (id: string): Promise<Dimension> => {
    const response = await axiosInstance.get<Dimension>(
      `/encuestas/dimensiones/${id}/`
    );
    return response.data;
  },

  /**
   * ⭐ Obtener dimensión con preguntas
   * GET /api/encuestas/dimensiones/{id}/con_preguntas/
   */
  conPreguntas: async (id: string): Promise<{
    id: string;
    codigo: string;
    nombre: string;
    descripcion: string;
    encuesta: string;
    encuesta_nombre: string;
    orden: number;
    total_preguntas: number;
    preguntas: Pregunta[];
    activo: boolean;
  }> => {
    const response = await axiosInstance.get(
      `/encuestas/dimensiones/${id}/con_preguntas/`
    );
    return response.data;
  },

  /**
   * Actualizar dimensión
   * PATCH /api/encuestas/dimensiones/{id}/
   */
  update: async (
    id: string,
    data: Partial<Dimension>
  ): Promise<ApiResponse<Dimension>> => {
    const response = await axiosInstance.patch<ApiResponse<Dimension>>(
      `/encuestas/dimensiones/${id}/`,
      data
    );
    return response.data;
  },

  /**
   * Activar/Desactivar dimensión
   * POST /api/encuestas/dimensiones/{id}/toggle_estado/
   */
  toggleEstado: async (id: string): Promise<ApiResponse<Dimension>> => {
    const response = await axiosInstance.post<ApiResponse<Dimension>>(
      `/encuestas/dimensiones/${id}/toggle_estado/`
    );
    return response.data;
  },
};
