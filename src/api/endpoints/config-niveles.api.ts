// src/api/endpoints/config-niveles.api.ts - VERSIÓN CORREGIDA

import axiosInstance from '../axios';
import { ApiResponse } from '@/types';

export interface ConfigNivelDeseado {
  id: string;
  dimension: string;
  dimension_info: {
    id: string;
    codigo: string;
    nombre: string;
    orden: number;
    total_preguntas: number;
    activo: boolean;
  };
  empresa: number;
  empresa_info: {
    id: number;
    nombre: string;
  };
  nivel_deseado: 1 | 2 | 3 | 4 | 5;
  configurado_por: number | null;
  configurado_por_nombre: string | null;
  motivo_cambio: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ConfigNivelDeseadoCreateData {
  dimension: string;
  empresa: number;
  nivel_deseado: 1 | 2 | 3 | 4 | 5;
  motivo_cambio?: string;
}

// ⭐ NUEVO: Type específico para actualización
export interface ConfigNivelDeseadoUpdateData {
  nivel_deseado: 1 | 2 | 3 | 4 | 5;
  motivo_cambio?: string;
}

/**
 * API de Configuración de Niveles Deseados
 */
export const configNivelesApi = {
  /**
   * Listar configuraciones de niveles
   * GET /api/encuestas/config-niveles/
   */
  list: async (): Promise<ConfigNivelDeseado[]> => {
    const response = await axiosInstance.get<ConfigNivelDeseado[]>('/encuestas/config-niveles/');
    return response.data;
  },

  /**
   * Obtener configuración por ID
   * GET /api/encuestas/config-niveles/{id}/
   */
  get: async (id: string): Promise<ConfigNivelDeseado> => {
    const response = await axiosInstance.get<ConfigNivelDeseado>(`/encuestas/config-niveles/${id}/`);
    return response.data;
  },

  /**
   * Obtener configuración por dimensión y empresa
   * GET /api/encuestas/config-niveles/por_dimension/?dimension_id=xxx&empresa_id=yyy
   */
  getPorDimension: async (dimensionId: string, empresaId: number): Promise<{
    mensaje?: string;
    nivel_deseado: number | null;
  } | ConfigNivelDeseado> => {
    const response = await axiosInstance.get(
      '/encuestas/config-niveles/por_dimension/',
      {
        params: {
          dimension_id: dimensionId,
          empresa_id: empresaId,
        },
      }
    );
    return response.data;
  },

  /**
   * Crear configuración de nivel deseado
   * POST /api/encuestas/config-niveles/
   */
  create: async (data: ConfigNivelDeseadoCreateData): Promise<ApiResponse<ConfigNivelDeseado>> => {
    const response = await axiosInstance.post<ApiResponse<ConfigNivelDeseado>>(
      '/encuestas/config-niveles/',
      data
    );
    return response.data;
  },

  /**
   * Actualizar configuración
   * PATCH /api/encuestas/config-niveles/{id}/
   * 
   * ⭐ IMPORTANTE: Solo permite actualizar nivel_deseado y motivo_cambio
   */
update: async (
  id: string,
  data: ConfigNivelDeseadoUpdateData  // ⭐ DEBE SER ESTE TYPE
): Promise<ApiResponse<ConfigNivelDeseado>> => {
  // ⭐ Construir payload limpio
  const payload: any = {
    nivel_deseado: data.nivel_deseado,
  };
  
  // Solo agregar motivo_cambio si tiene valor
  if (data.motivo_cambio && data.motivo_cambio.trim() !== '') {
    payload.motivo_cambio = data.motivo_cambio;
  }
  
  const response = await axiosInstance.patch<ApiResponse<ConfigNivelDeseado>>(
    `/encuestas/config-niveles/${id}/`,
    payload  // ⭐ DEBE ENVIAR SOLO payload
  );
  return response.data;
},

  /**
   * Eliminar configuración
   * DELETE /api/encuestas/config-niveles/{id}/
   */
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/encuestas/config-niveles/${id}/`);
  },
};