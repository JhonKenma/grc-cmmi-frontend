// src/api/endpoints/config-niveles.api.ts - VERSIÓN CORREGIDA

import axiosInstance from '../axios';
import { ApiResponse } from '@/types';

export interface ConfigNivelDeseado {
  id: string;
  evaluacion_empresa: string | null;
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
  evaluacion_empresa_id: string;
  dimension: string;
  nivel_deseado: 1 | 2 | 3 | 4 | 5;
  motivo_cambio?: string;
}

export interface ConfigNivelDeseadoUpdateData {
  nivel_deseado: 1 | 2 | 3 | 4 | 5;
  motivo_cambio?: string;
}

export interface ConfiguracionMultiple {
  dimension_id: string;
  nivel_deseado: 1 | 2 | 3 | 4 | 5;
  motivo_cambio?: string;
}

export const configNivelesApi = {
  /**
   * Listar configuraciones de niveles
   */
  list: async (): Promise<ConfigNivelDeseado[]> => {
    const response = await axiosInstance.get<ConfigNivelDeseado[]>('/encuestas/config-niveles/'); // ⭐ CAMBIO
    return response.data;
  },

  /**
   * Obtener configuración por ID
   */
  get: async (id: string): Promise<ConfigNivelDeseado> => {
    const response = await axiosInstance.get<ConfigNivelDeseado>(`/encuestas/config-niveles/${id}/`); // ⭐ CAMBIO
    return response.data;
  },

  /**
   * Obtener configuración por dimensión y evaluación
   */
  getPorDimension: async (
    evaluacionEmpresaId: string,
    dimensionId: string
  ): Promise<{
    mensaje?: string;
    nivel_deseado: number | null;
    evaluacion_empresa_id?: string;
    dimension_id?: string;
  } | ConfigNivelDeseado> => {
    const response = await axiosInstance.get(
      '/encuestas/config-niveles/por_dimension/', // ⭐ CAMBIO
      {
        params: {
          evaluacion_empresa_id: evaluacionEmpresaId,
          dimension_id: dimensionId,
        },
      }
    );
    return response.data;
  },

  /**
   * Obtener todas las configuraciones de una evaluación
   */
  getPorEvaluacion: async (evaluacionEmpresaId: string): Promise<{
    evaluacion_empresa_id: string;
    total_configuraciones: number;
    configuraciones: ConfigNivelDeseado[];
  }> => {
    const response = await axiosInstance.get(
      '/encuestas/niveles-deseados/por_evaluacion/',  // ⭐ DEBE SER ESTA URL
      {
        params: {
          evaluacion_empresa_id: evaluacionEmpresaId,
        },
      }
    );
    return response.data;
  },

  /**
   * Crear configuración de nivel deseado
   */
  create: async (data: ConfigNivelDeseadoCreateData): Promise<ApiResponse<ConfigNivelDeseado>> => {
    const response = await axiosInstance.post<ApiResponse<ConfigNivelDeseado>>(
      '/encuestas/config-niveles/', // ⭐ CAMBIO
      data
    );
    return response.data;
  },

  /**
   * Actualizar configuración
   */
  update: async (
    id: string,
    data: ConfigNivelDeseadoUpdateData
  ): Promise<ApiResponse<ConfigNivelDeseado>> => {
    const payload: any = {
      nivel_deseado: data.nivel_deseado,
    };
    
    if (data.motivo_cambio && data.motivo_cambio.trim() !== '') {
      payload.motivo_cambio = data.motivo_cambio;
    }
    
    const response = await axiosInstance.patch<ApiResponse<ConfigNivelDeseado>>(
      `/encuestas/config-niveles/${id}/`, // ⭐ CAMBIO
      payload
    );
    return response.data;
  },

  /**
   * Configurar múltiples dimensiones a la vez
   */
  configurarMultiple: async (
    evaluacionEmpresaId: string,
    configuraciones: ConfiguracionMultiple[]
  ): Promise<{
    total_procesados: number;
    exitosos: number;
    errores: number;
    resultados: any[];
    errores_detalle: any[];
  }> => {
    const response = await axiosInstance.post(
      '/encuestas/niveles-deseados/configurar_multiple/',  // ⭐ CORREGIR ESTA URL
      {
        evaluacion_empresa_id: evaluacionEmpresaId,
        configuraciones,
      }
    );
    return response.data;
  },

  /**
   * Eliminar configuración
   */
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/encuestas/niveles-deseados/${id}/`); // ⭐ CAMBIO
  },
};