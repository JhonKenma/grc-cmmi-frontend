// src/api/endpoints/encuestas.api.ts

import axiosInstance from '../axios';
import {
  Encuesta,
  EncuestaListItem,
  CargaExcelData,
  EncuestaEstadisticas,
  Dimension,
  DimensionListItem,
  Pregunta,
  ApiResponse,
} from '@/types';

/**
 * API de Encuestas
 */
export const encuestasApi = {
  /**
   * Listar encuestas
   */
  list: async (): Promise<EncuestaListItem[]> => {
    const response = await axiosInstance.get<EncuestaListItem[]>('/encuestas/encuestas/');
    return response.data;
  },

  /**
   * Obtener detalle de una encuesta
   */
  get: async (id: string): Promise<Encuesta> => {
    const response = await axiosInstance.get<Encuesta>(`/encuestas/encuestas/${id}/`);
    return response.data;
  },

  /**
   * Cargar encuesta desde Excel
   */
  cargarExcel: async (data: CargaExcelData): Promise<ApiResponse<Encuesta>> => {
    const formData = new FormData();
    formData.append('archivo', data.archivo);
    formData.append('nombre_encuesta', data.nombre_encuesta);
    if (data.version) formData.append('version', data.version);
    if (data.descripcion) formData.append('descripcion', data.descripcion);

    const response = await axiosInstance.post<ApiResponse<Encuesta>>(
      '/encuestas/encuestas/cargar_excel/',
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
   * Descargar plantilla Excel
   */
  descargarPlantilla: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/encuestas/encuestas/descargar_plantilla/', {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Duplicar encuesta
   */
  duplicar: async (id: string, nombre: string, version?: string): Promise<ApiResponse<Encuesta>> => {
    const response = await axiosInstance.post<ApiResponse<Encuesta>>(
      `/encuestas/encuestas/${id}/duplicar/`,
      { nombre, version }
    );
    return response.data;
  },

  /**
   * Obtener estadísticas de una encuesta
   */
  getEstadisticas: async (id: string): Promise<EncuestaEstadisticas> => {
    const response = await axiosInstance.get<EncuestaEstadisticas>(
      `/encuestas/encuestas/${id}/estadisticas/`
    );
    return response.data;
  },

  /**
   * Actualizar datos básicos de encuesta (nombre, versión, descripción)
   */
  update: async (id: string, data: Partial<Encuesta>): Promise<ApiResponse<Encuesta>> => {
    const response = await axiosInstance.patch<ApiResponse<Encuesta>>(
      `/encuestas/encuestas/${id}/`,
      data
    );
    return response.data;
  },

  /**
   * Activar/Desactivar encuesta
   */
  toggleEstado: async (id: string): Promise<ApiResponse<Encuesta>> => {
    const response = await axiosInstance.post<ApiResponse<Encuesta>>(
      `/encuestas/encuestas/${id}/toggle_estado/`
    );
    return response.data;
  },

  /**
   * Activar encuesta
   */
  activar: async (id: string): Promise<ApiResponse<Encuesta>> => {
    const response = await axiosInstance.post<ApiResponse<Encuesta>>(
      `/encuestas/encuestas/${id}/activar/`
    );
    return response.data;
  },

  /**
   * Desactivar encuesta
   */
  desactivar: async (id: string): Promise<ApiResponse<Encuesta>> => {
    const response = await axiosInstance.post<ApiResponse<Encuesta>>(
      `/encuestas/encuestas/${id}/desactivar/`
    );
    return response.data;
  },

  /**
   * Eliminar encuesta
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/encuestas/encuestas/${id}/`
    );
    return response.data;
  },
};

// ============================================
// ⭐ API DE DIMENSIONES
// ============================================

export const dimensionesApi = {
  /**
   * Listar dimensiones
   * GET /api/encuestas/dimensiones/?encuesta_id=xxx
   */
  list: async (encuestaId?: string): Promise<DimensionListItem[]> => {
    const params = encuestaId ? { encuesta_id: encuestaId } : undefined;
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
   * ⭐ Obtener dimensión con preguntas incluidas
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
   * Actualizar dimensión (solo SuperAdmin)
   * PATCH /api/encuestas/dimensiones/{id}/
   */
  update: async (id: string, data: Partial<Dimension>): Promise<ApiResponse<Dimension>> => {
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

// ============================================
// ⭐ API DE PREGUNTAS
// ============================================

export const preguntasApi = {
  /**
   * Listar todas las preguntas
   * GET /api/encuestas/preguntas/
   */
  list: async (params?: {
    dimension?: string;
    nivel?: number;
    activo?: boolean;
  }): Promise<Pregunta[]> => {
    const response = await axiosInstance.get<Pregunta[]>(
      '/encuestas/preguntas/',
      { params }
    );
    return response.data;
  },

  /**
   * Obtener detalle de una pregunta
   * GET /api/encuestas/preguntas/{id}/
   */
  get: async (id: string): Promise<Pregunta> => {
    const response = await axiosInstance.get<Pregunta>(
      `/encuestas/preguntas/${id}/`
    );
    return response.data;
  },

  /**
   * ⭐ Obtener preguntas por dimensión
   * GET /api/encuestas/preguntas/por_dimension/?dimension_id=xxx
   */
  porDimension: async (
    dimensionId: string,
    params?: {
      nivel?: number;
      activo?: boolean;
    }
  ): Promise<{
    dimension: {
      id: string;
      codigo: string;
      nombre: string;
      descripcion: string;
    };
    total_preguntas: number;
    preguntas: Pregunta[];
  }> => {
    const response = await axiosInstance.get(
      '/encuestas/preguntas/por_dimension/',
      {
        params: {
          dimension_id: dimensionId,
          ...params
        }
      }
    );
    return response.data;
  },

  /**
   * Obtener preguntas por nivel
   * GET /api/encuestas/preguntas/por_nivel/?nivel=1
   */
  porNivel: async (
    nivel: number,
    dimensionId?: string
  ): Promise<{
    nivel: number;
    total_preguntas: number;
    preguntas: Pregunta[];
  }> => {
    const response = await axiosInstance.get(
      '/encuestas/preguntas/por_nivel/',
      {
        params: {
          nivel,
          dimension_id: dimensionId
        }
      }
    );
    return response.data;
  },

  /**
   * Obtener estadísticas de preguntas
   * GET /api/encuestas/preguntas/estadisticas/
   */
  estadisticas: async (): Promise<{
    total_preguntas: number;
    preguntas_activas: number;
    preguntas_inactivas: number;
    por_nivel: Array<{ nivel: number; total: number }>;
    por_dimension: Array<{ 
      dimension__codigo: string; 
      dimension__nombre: string; 
      total: number 
    }>;
  }> => {
    const response = await axiosInstance.get(
      '/encuestas/preguntas/estadisticas/'
    );
    return response.data;
  },

  /**
   * Actualizar pregunta (solo SuperAdmin)
   * PATCH /api/encuestas/preguntas/{id}/
   */
  update: async (id: string, data: Partial<Pregunta>): Promise<ApiResponse<Pregunta>> => {
    const response = await axiosInstance.patch<ApiResponse<Pregunta>>(
      `/encuestas/preguntas/${id}/`,
      data
    );
    return response.data;
  },
};