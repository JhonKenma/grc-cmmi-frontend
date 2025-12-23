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
   * ⭐ ACTUALIZADO: Obtener dimensiones disponibles para asignar a nivel EMPRESA
   * GET /api/asignaciones/dimensiones_disponibles/?encuesta_id=xxx&empresa_id=1
   * 
   * Retorna solo las dimensiones que NO han sido asignadas a NINGÚN usuario de la empresa
   */
  getDimensionesDisponibles: async (
    encuestaId: string, 
    empresaId: number  // ⭐ CAMBIO: Ahora es empresa_id, no usuario_id
  ): Promise<{
    total_dimensiones: number;
    dimensiones_asignadas: number;
    dimensiones_disponibles: number;
    dimensiones: DimensionListItem[];
    detalle_asignaciones?: DetalleAsignacion[];  // ⭐ NUEVO: Info de quién tiene cada dimensión
  }> => {
    const response = await axiosInstance.get(
      '/asignaciones/dimensiones_disponibles/',
      { 
        params: { 
          encuesta_id: encuestaId, 
          empresa_id: empresaId  // ⭐ CAMBIO: empresa_id en lugar de usuario_id
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