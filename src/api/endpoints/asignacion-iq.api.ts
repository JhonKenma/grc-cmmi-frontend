// src/api/endpoints/asignacion-iq.api.ts

import api from '../axios';
import type {
  AsignacionEvaluacionIQ,
  AsignacionEvaluacionDetail,
  CrearAsignacionData,
  MisAsignacionesResponse,
  EstadisticasAsignaciones,
} from '@/types/asignacion-iq.types';

export const asignacionIQApi = {
  // ============================================================================
  // CRUD BÁSICO
  // ============================================================================
  
  /**
   * Listar todas las asignaciones (Admin o SuperAdmin)
   */
  async listar(): Promise<AsignacionEvaluacionIQ[]> {
    const response = await api.get('/asignaciones-iq/');
    return response.data;
  },
  
  /**
   * Obtener detalle de una asignación
   */
  async obtener(id: number): Promise<AsignacionEvaluacionDetail> {
    const response = await api.get(`/asignaciones-iq/${id}/`);
    return response.data;
  },
  
  /**
   * Crear asignación (Admin o SuperAdmin)
   */
  async crear(data: CrearAsignacionData): Promise<{ asignaciones: AsignacionEvaluacionIQ[] }> {
    const response = await api.post('/asignaciones-iq/', data);
    return response.data;
  },
  
  /**
   * Actualizar asignación
   */
  async actualizar(id: number, data: Partial<CrearAsignacionData>): Promise<AsignacionEvaluacionDetail> {
    const response = await api.patch(`/asignaciones-iq/${id}/`, data);
    return response.data;
  },
  
  /**
   * Eliminar asignación (soft delete)
   */
  async eliminar(id: number): Promise<void> {
    await api.delete(`/asignaciones-iq/${id}/`);
  },
  
  // ============================================================================
  // ACCIONES ESPECIALES
  // ============================================================================
  
  /**
   * Obtener MIS asignaciones (cualquier usuario)
   */
  async misAsignaciones(estado?: string): Promise<MisAsignacionesResponse> {
    const params = estado ? { estado } : {};
    const response = await api.get('/asignaciones-iq/mis-asignaciones/', { params });
    return response.data;
  },
  
  /**
   * Iniciar asignación (Usuario)
   */
  async iniciar(id: number): Promise<{ success: boolean; asignacion: AsignacionEvaluacionDetail }> {
    const response = await api.post(`/asignaciones-iq/${id}/iniciar/`);
    return response.data;
  },
  
  /**
   * Completar asignación (Usuario)
   */
  async completar(id: number): Promise<{ success: boolean; asignacion: AsignacionEvaluacionDetail }> {
    const response = await api.post(`/asignaciones-iq/${id}/completar/`);
    return response.data;
  },
  
  /**
   * Aprobar asignación (Admin)
   */
  async aprobar(id: number, notas_revision?: string): Promise<{ success: boolean; asignacion: AsignacionEvaluacionDetail }> {
    const response = await api.post(`/asignaciones-iq/${id}/aprobar/`, {
      notas_revision: notas_revision || '',
    });
    return response.data;
  },
  
  /**
   * Rechazar asignación (Admin)
   */
  async rechazar(id: number, notas_revision: string): Promise<{ success: boolean; asignacion: AsignacionEvaluacionDetail }> {
    const response = await api.post(`/asignaciones-iq/${id}/rechazar/`, {
      notas_revision,
    });
    return response.data;
  },
  
  /**
   * Obtener progreso detallado
   */
  async obtenerProgreso(id: number): Promise<{
    asignacion_id: number;
    total_preguntas: number;
    preguntas_respondidas: number;
    porcentaje_completado: number;
    estado: string;
  }> {
    const response = await api.get(`/asignaciones-iq/${id}/progreso/`);
    return response.data;
  },
  
  // ============================================================================
  // FILTROS Y ESTADÍSTICAS
  // ============================================================================
  
  /**
   * Estadísticas generales (Admin o SuperAdmin)
   */
  async estadisticas(): Promise<EstadisticasAsignaciones> {
    const response = await api.get('/asignaciones-iq/estadisticas/');
    return response.data;
  },
  
  /**
   * Asignaciones por evaluación (Admin o SuperAdmin)
   */
  async porEvaluacion(evaluacionId: number): Promise<{
    evaluacion_id: number;
    total: number;
    asignaciones: AsignacionEvaluacionIQ[];
  }> {
    const response = await api.get(`/asignaciones-iq/por-evaluacion/${evaluacionId}/`);
    return response.data;
  },
  
  /**
   * Asignaciones por usuario (Admin o SuperAdmin)
   */
  async porUsuario(usuarioId: number): Promise<{
    usuario_id: number;
    total: number;
    asignaciones: AsignacionEvaluacionIQ[];
  }> {
    const response = await api.get(`/asignaciones-iq/por-usuario/${usuarioId}/`);
    return response.data;
  },
};