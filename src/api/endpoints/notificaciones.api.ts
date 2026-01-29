// src/api/endpoints/notificaciones.api.ts

import axiosInstance from '../axios';
import {
  Notificacion,
  NotificacionDetalle,
  EnviarNotificacionData,
  HistorialResponse,
  EstadisticasNotificaciones,
  PeriodoHistorial,
} from '@/types/notificaciones.types';

const BASE_URL = '/notificaciones';

export const notificacionesApi = {
  // ═══════════════════════════════════════════════════════════════
  // ENDPOINTS BÁSICOS (EXISTENTES)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Listar todas mis notificaciones
   * GET /api/notificaciones/
   */
  list: async (): Promise<Notificacion[]> => {
    const response = await axiosInstance.get<Notificacion[]>(`${BASE_URL}/`);
    return response.data;
  },

  /**
   * Obtener detalle de una notificación
   * GET /api/notificaciones/{id}/
   */
  get: async (id: string): Promise<NotificacionDetalle> => {
    const response = await axiosInstance.get<{ data: NotificacionDetalle }>(
      `${BASE_URL}/${id}/`
    );
    return response.data.data;
  },

  /**
   * Obtener notificaciones no leídas
   * GET /api/notificaciones/no_leidas/?limite=20
   */
  getNoLeidas: async (limite: number = 50): Promise<{
    count: number;
    results: Notificacion[];
  }> => {
    const response = await axiosInstance.get<{
      count: number;
      results: Notificacion[];
    }>(`${BASE_URL}/no_leidas/`, {
      params: { limite },
    });
    return response.data;
  },

  /**
   * Obtener contador de no leídas
   * GET /api/notificaciones/contador/
   */
  getContador: async (): Promise<number> => {
    const response = await axiosInstance.get<{ no_leidas: number }>(
      `${BASE_URL}/contador/`
    );
    return response.data.no_leidas;
  },

  /**
   * Marcar notificación como leída
   * POST /api/notificaciones/{id}/marcar_leida/
   */
  marcarLeida: async (id: string): Promise<Notificacion> => {
    const response = await axiosInstance.post<{ data: Notificacion }>(
      `${BASE_URL}/${id}/marcar_leida/`
    );
    return response.data.data;
  },

  /**
   * Marcar todas como leídas
   * POST /api/notificaciones/marcar_todas_leidas/
   */
  marcarTodasLeidas: async (): Promise<{ marcadas: number }> => {
    const response = await axiosInstance.post<{ data: { marcadas: number } }>(
      `${BASE_URL}/marcar_todas_leidas/`
    );
    return response.data.data;
  },

  /**
   * Filtrar por tipo
   * GET /api/notificaciones/por_tipo/?tipo=asignacion_evaluacion
   */
  getPorTipo: async (tipo: string): Promise<{
    count: number;
    results: Notificacion[];
  }> => {
    const response = await axiosInstance.get<{
      count: number;
      results: Notificacion[];
    }>(`${BASE_URL}/por_tipo/`, {
      params: { tipo },
    });
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════════
  // NUEVOS ENDPOINTS ⭐
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtener historial con filtros
   * GET /api/notificaciones/historial/?periodo=nuevas&limite=50
   */
  getHistorial: async (
    periodo: PeriodoHistorial = 'nuevas',
    limite: number = 50
  ): Promise<HistorialResponse> => {
    const response = await axiosInstance.get<{ data: HistorialResponse }>(
      `${BASE_URL}/historial/`,
      {
        params: { periodo, limite },
      }
    );
    return response.data.data;
  },

  /**
   * Obtener estadísticas de notificaciones
   * GET /api/notificaciones/estadisticas/
   */
  getEstadisticas: async (): Promise<EstadisticasNotificaciones> => {
    const response = await axiosInstance.get<{
      data: EstadisticasNotificaciones;
    }>(`${BASE_URL}/estadisticas/`);
    return response.data.data;
  },

  /**
   * Enviar notificación personalizada (Admin/SuperAdmin)
   * POST /api/notificaciones/enviar-personalizada/
   */
  enviarPersonalizada: async (
    data: EnviarNotificacionData
  ): Promise<{
    usuarios_notificados: number;
    emails_enviados: number;
    destinatarios: Array<{
      id: number;
      nombre: string;
      email: string;
      rol: string;
    }>;
  }> => {
    const response = await axiosInstance.post<{
      data: {
        usuarios_notificados: number;
        emails_enviados: number;
        destinatarios: Array<{
          id: number;
          nombre: string;
          email: string;
          rol: string;
        }>;
      };
    }>(`${BASE_URL}/enviar-personalizada/`, data);
    return response.data.data;
  },
};

export default notificacionesApi;