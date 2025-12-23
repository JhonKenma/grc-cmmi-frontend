// src/api/endpoints/notificaciones.api.ts

import axiosInstance from '../axios';
import { Notificacion, NotificacionListItem, ApiResponse } from '@/types';

/**
 * API de Notificaciones
 */
export const notificacionesApi = {
  /**
   * Listar todas mis notificaciones
   * GET /api/notificaciones/
   */
  list: async (): Promise<NotificacionListItem[]> => {
    const response = await axiosInstance.get<NotificacionListItem[]>('/notificaciones/');
    return response.data;
  },

  /**
   * Obtener detalle de una notificación
   * GET /api/notificaciones/{id}/
   */
  get: async (id: string): Promise<Notificacion> => {
    const response = await axiosInstance.get<Notificacion>(`/notificaciones/${id}/`);
    return response.data;
  },

  /**
   * Obtener notificaciones no leídas
   * GET /api/notificaciones/no_leidas/?limite=20
   */
  getNoLeidas: async (limite: number = 50): Promise<{ count: number; results: NotificacionListItem[] }> => {
    const response = await axiosInstance.get<{ count: number; results: NotificacionListItem[] }>(
      '/notificaciones/no_leidas/',
      { params: { limite } }
    );
    return response.data;
  },

  /**
   * Obtener contador de no leídas
   * GET /api/notificaciones/contador/
   */
  getContador: async (): Promise<{ no_leidas: number }> => {
    const response = await axiosInstance.get<{ no_leidas: number }>('/notificaciones/contador/');
    return response.data;
  },

  /**
   * Marcar notificación como leída
   * POST /api/notificaciones/{id}/marcar_leida/
   */
  marcarLeida: async (id: string): Promise<ApiResponse<Notificacion>> => {
    const response = await axiosInstance.post<ApiResponse<Notificacion>>(
      `/notificaciones/${id}/marcar_leida/`
    );
    return response.data;
  },

  /**
   * Marcar todas como leídas
   * POST /api/notificaciones/marcar_todas_leidas/
   */
  marcarTodasLeidas: async (): Promise<ApiResponse<{ marcadas: number }>> => {
    const response = await axiosInstance.post<ApiResponse<{ marcadas: number }>>(
      '/notificaciones/marcar_todas_leidas/'
    );
    return response.data;
  },

  /**
   * Filtrar por tipo
   * GET /api/notificaciones/por_tipo/?tipo=asignacion_evaluacion
   */
  getPorTipo: async (tipo: string): Promise<{ count: number; results: NotificacionListItem[] }> => {
    const response = await axiosInstance.get<{ count: number; results: NotificacionListItem[] }>(
      '/notificaciones/por_tipo/',
      { params: { tipo } }
    );
    return response.data;
  },
};