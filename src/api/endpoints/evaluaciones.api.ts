// src/api/endpoints/evaluaciones.api.ts - VERSIÓN CORREGIDA

import axiosInstance from '../axios';
import { ApiResponse } from '@/types';
import { AsignarEvaluacionData, EvaluacionEmpresa, ProgresoEvaluacion } from '@/types/evaluaciones.types';


export const evaluacionesApi = {
  /**
   * ⭐ NUEVO: Asignar evaluación a empresa
   */
  asignar: async (data: AsignarEvaluacionData): Promise<ApiResponse<EvaluacionEmpresa>> => {
    const response = await axiosInstance.post<ApiResponse<EvaluacionEmpresa>>(
      '/encuestas/evaluaciones-empresa/asignar/',  // ⭐ AGREGAR /encuestas/
      data
    );
    return response.data;
  },

  /**
   * Listar todas las evaluaciones (SuperAdmin)
   */
  list: async (): Promise<{ count: number; results: EvaluacionEmpresa[] }> => {
    const response = await axiosInstance.get<{ count: number; results: EvaluacionEmpresa[] }>(
      '/encuestas/evaluaciones-empresa/'  // ⭐ AGREGAR /encuestas/
    );
    return response.data;
  },

  /**
   * Listar mis evaluaciones (Admin)
   */
  getMisEvaluaciones: async (estado?: string): Promise<{ count: number; results: EvaluacionEmpresa[] }> => {
    const params = estado ? { estado } : {};
    const response = await axiosInstance.get<{ count: number; results: EvaluacionEmpresa[] }>(
      '/encuestas/evaluaciones-empresa/mis_evaluaciones/',  // ⭐ AGREGAR /encuestas/
      { params }
    );
    return response.data;
  },

  /**
   * Ver detalle de evaluación
   */
  get: async (id: string): Promise<EvaluacionEmpresa> => {
    const response = await axiosInstance.get<EvaluacionEmpresa>(
      `/encuestas/evaluaciones-empresa/${id}/`  // ⭐ AGREGAR /encuestas/
    );
    return response.data;
  },

  /**
   * Ver progreso detallado de evaluación
   */
  getProgreso: async (id: string): Promise<ProgresoEvaluacion> => {
    const response = await axiosInstance.get<ProgresoEvaluacion>(
      `/encuestas/evaluaciones-empresa/${id}/progreso/`  // ⭐ AGREGAR /encuestas/
    );
    return response.data;
  },

  /**
   * Cancelar evaluación
   */
  cancelar: async (id: string, motivo: string): Promise<ApiResponse<EvaluacionEmpresa>> => {
    const response = await axiosInstance.post<ApiResponse<EvaluacionEmpresa>>(
      `/encuestas/evaluaciones-empresa/${id}/cancelar/`,  // ⭐ AGREGAR /encuestas/
      { motivo }
    );
    return response.data;
  },

  /**
   * Estadísticas de evaluaciones
   */
  getEstadisticas: async (): Promise<{
    total_evaluaciones: number;
    por_estado: {
      activas: number;
      en_progreso: number;
      completadas: number;
      vencidas: number;
      canceladas: number;
    };
    porcentaje_completado: number;
  }> => {
    const response = await axiosInstance.get('/encuestas/evaluaciones-empresa/estadisticas/');  // ⭐ AGREGAR /encuestas/
    return response.data;
  },
};