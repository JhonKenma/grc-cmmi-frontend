// src/api/endpoints/asignaciones.api.ts - VERSIÓN COMPLETA ACTUALIZADA

import axiosInstance from '../axios';
import { 
  Asignacion, 
  AsignacionListItem, 
  AsignacionEvaluacionData,
  AsignacionDimensionData,
  ReasignacionData,
  ApiResponse,
  DimensionListItem
} from '@/types';

// ⭐ NUEVO: Type para detalle de asignaciones
export interface DetalleAsignacion {
  dimension_id: string;
  dimension_nombre: string;
  dimension_codigo: string;
  asignado_a: string;
  usuario_id: number;
  estado: string;
  porcentaje_avance: number;
}

export const asignacionesApi = {
  /**
   * Listar asignaciones
   */
  list: async (): Promise<AsignacionListItem[]> => {
    const response = await axiosInstance.get<AsignacionListItem[]>('/asignaciones/');
    return response.data;
  },

  /**
   * Obtener detalle de asignación
   */
  get: async (id: string): Promise<Asignacion> => {
    const response = await axiosInstance.get<Asignacion>(`/asignaciones/${id}/`);
    return response.data;
  },

  /**
   * Asignar evaluación completa (SuperAdmin → Administrador)
   */
  asignarEvaluacion: async (data: AsignacionEvaluacionData): Promise<ApiResponse<Asignacion>> => {
    const response = await axiosInstance.post<ApiResponse<Asignacion>>(
      '/asignaciones/asignar_evaluacion/',
      data
    );
    return response.data;
  },

  /**
   * Asignar una o varias dimensiones (Administrador → Usuario)
   */
  asignarDimension: async (data: AsignacionDimensionData): Promise<ApiResponse<{
    asignaciones: Asignacion[];
    total_asignadas: number;
  }>> => {
    const response = await axiosInstance.post<ApiResponse<{
      asignaciones: Asignacion[];
      total_asignadas: number;
    }>>(
      '/asignaciones/asignar_dimension/',
      data
    );
    return response.data;
  },
  
  /**
   * Obtener dimensiones disponibles para asignar
   * GET /api/asignaciones/dimensiones-disponibles/?evaluacion_empresa_id=xxx
   */
  getDimensionesDisponibles: async (
    evaluacionEmpresaId: string
  ): Promise<any> => {
    console.log('🔍 Llamando a:', `/asignaciones/dimensiones_disponibles/?evaluacion_empresa_id=${evaluacionEmpresaId}`);
    
    const response = await axiosInstance.get(
      '/asignaciones/dimensiones_disponibles/',  // ⭐ CON UNDERSCORE
      { 
        params: { 
          evaluacion_empresa_id: evaluacionEmpresaId
        } 
      }
    );
    return response.data;
  },
  /**
   * Obtener mis asignaciones
   */
  getMisAsignaciones: async (params?: {
    estado?: 'pendiente' | 'en_progreso' | 'completado' | 'vencido' | 'pendiente_revision' | 'rechazado';
    tipo?: 'evaluacion_completa' | 'dimension';
  }): Promise<{ count: number; results: AsignacionListItem[] }> => {
    const response = await axiosInstance.get<{ count: number; results: AsignacionListItem[] }>(
      '/asignaciones/mis_asignaciones/',
      { params }
    );
    return response.data;
  },

  /**
   * Reasignar asignación
   */
  reasignar: async (id: string, data: ReasignacionData): Promise<ApiResponse<Asignacion>> => {
    const response = await axiosInstance.post<ApiResponse<Asignacion>>(
      `/asignaciones/${id}/reasignar/`,
      data
    );
    return response.data;
  },

  /**
   * ⭐ NUEVO: Revisar asignación (aprobar/rechazar)
   */
  revisar: async (
    id: string, 
    data: { accion: 'aprobar' | 'rechazar'; comentarios?: string }
  ): Promise<ApiResponse<Asignacion>> => {
    const response = await axiosInstance.post<ApiResponse<Asignacion>>(
      `/asignaciones/${id}/revisar/`,
      data
    );
    return response.data;
  },

  /**
   * ⭐ NUEVO: Obtener asignaciones pendientes de revisión
   */
  getPendientesRevision: async (): Promise<{ count: number; results: AsignacionListItem[] }> => {
    const response = await axiosInstance.get<{ count: number; results: AsignacionListItem[] }>(
      '/asignaciones/pendientes_revision/'
    );
    return response.data;
  },

  /**
   * Estadísticas de asignaciones
   */
  getEstadisticas: async (): Promise<{
    total_asignaciones: number;
    por_estado: {
      pendientes: number;
      en_progreso: number;
      completadas: number;
      vencidas: number;
      pendientes_revision: number;
      rechazadas: number;
    };
    por_tipo: {
      evaluaciones_completas: number;
      dimensiones_especificas: number;
    };
    porcentaje_completado: number;
  }> => {
    const response = await axiosInstance.get('/asignaciones/estadisticas/');
    return response.data;
  },
};