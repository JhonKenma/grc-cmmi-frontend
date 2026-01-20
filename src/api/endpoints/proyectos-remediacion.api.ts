// src/api/endpoints/proyectos-remediacion.api.ts

import axiosInstance from '../axios'; // ⭐ Importar correctamente
import {
  ProyectoRemediacionList,
  ProyectoRemediacionDetail,
  CrearProyectoFormData,
  CrearDesdeGAPFormData,
  ActualizarProyectoFormData,
  ProyectosListResponse,
  ProyectosFiltros,
  EstadisticasProyectos,
  MisProyectosParams,
  ProyectosPorEstadoResponse,
  ProyectosVencidosResponse,
  ProyectosProximosVencerParams,
  ProyectosProximosVencerResponse,
} from '@/types/proyecto-remediacion.types';

const BASE_URL = '/proyectos-remediacion';

/**
 * API CLIENT PARA PROYECTOS DE REMEDIACIÓN
 * 
 * Maneja todas las interacciones con el backend para:
 * - CRUD de proyectos
 * - Creación desde GAP
 * - Consultas especiales (mis proyectos, estadísticas, etc.)
 * - Filtros y búsquedas
 */
export const proyectosRemediacionApi = {
  
  // ═══════════════════════════════════════════════════════════════
  // CRUD BÁSICO
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Listar proyectos con filtros y paginación
   */
  listar: async (filtros?: ProyectosFiltros): Promise<ProyectosListResponse> => {
    const params = new URLSearchParams();
    
    // ✅ Filtros de relaciones
    if (filtros?.calculo_nivel) params.append('calculo_nivel', filtros.calculo_nivel);
    if (filtros?.empresa) params.append('empresa', filtros.empresa);
    
    // Filtros de estado
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.prioridad) params.append('prioridad', filtros.prioridad);
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    
    // Búsqueda y ordenamiento
    if (filtros?.search) params.append('search', filtros.search);
    if (filtros?.ordering) params.append('ordering', filtros.ordering);
    
    // Paginación
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.page_size) params.append('page_size', filtros.page_size.toString());
    
    const url = params.toString() 
      ? `/proyectos-remediacion/?${params}` 
      : '/proyectos-remediacion/';
      
    const response = await axiosInstance.get<ProyectosListResponse>(url);
    return response.data;
  },

  /**
   * ✅ MÉTODO ESPECÍFICO PARA OBTENER POR GAP
   * Forma 1: Llamada interna directa
   */
  getPorGap: async (calculoNivelId: string): Promise<ProyectosListResponse> => {
    const response = await axiosInstance.get<ProyectosListResponse>(
      `/proyectos-remediacion/?calculo_nivel=${calculoNivelId}`
    );
    return response.data;
  },
  /**
   * Obtener detalle de un proyecto
   * GET /api/proyectos-remediacion/{id}/
   */
  obtener: async (id: string): Promise<ProyectoRemediacionDetail> => {
    const response = await axiosInstance.get<ProyectoRemediacionDetail>(`${BASE_URL}/${id}/`);
    return response.data;
  },
  
  /**
   * Crear nuevo proyecto manualmente
   * POST /api/proyectos-remediacion/
   */
  crear: async (data: CrearProyectoFormData): Promise<ProyectoRemediacionDetail> => {
    const response = await axiosInstance.post<ProyectoRemediacionDetail>(`${BASE_URL}/`, data);
    return response.data;
  },
  
  /**
   * Actualizar proyecto existente
   * PATCH /api/proyectos-remediacion/{id}/
   */
  actualizar: async (
    id: string, 
    data: ActualizarProyectoFormData
  ): Promise<ProyectoRemediacionDetail> => {
    const response = await axiosInstance.patch<ProyectoRemediacionDetail>(
      `${BASE_URL}/${id}/`, 
      data
    );
    return response.data;
  },
  
  /**
   * Desactivar proyecto (soft delete)
   * DELETE /api/proyectos-remediacion/{id}/
   */
  eliminar: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}/`);
  },
  
  // ═══════════════════════════════════════════════════════════════
  // ACCIONES ESPECIALES
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Crear proyecto automáticamente desde un GAP
   * POST /api/proyectos-remediacion/crear_desde_gap/
   */
  crearDesdeGAP: async (data: CrearDesdeGAPFormData): Promise<ProyectoRemediacionDetail> => {
    const response = await axiosInstance.post<ProyectoRemediacionDetail>(
      `${BASE_URL}/crear_desde_gap/`,
      data
    );
    return response.data;
  },
  
  /**
   * Obtener mis proyectos asignados
   * GET /api/proyectos-remediacion/mis_proyectos/
   */
  misProyectos: async (params?: MisProyectosParams): Promise<ProyectoRemediacionList[]> => {
    const queryParams = new URLSearchParams();
    
    if (params?.rol) queryParams.append('rol', params.rol);
    if (params?.estado) queryParams.append('estado', params.estado);
    
    const url = queryParams.toString() 
      ? `${BASE_URL}/mis_proyectos/?${queryParams}` 
      : `${BASE_URL}/mis_proyectos/`;
    
    const response = await axiosInstance.get<ProyectoRemediacionList[]>(url);
    return response.data;
  },
  
  /**
   * Obtener estadísticas generales
   * GET /api/proyectos-remediacion/estadisticas/
   */
  estadisticas: async (): Promise<EstadisticasProyectos> => {
    const response = await axiosInstance.get<EstadisticasProyectos>(`${BASE_URL}/estadisticas/`);
    return response.data;
  },
  
  /**
   * Obtener proyectos por estado
   * GET /api/proyectos-remediacion/por_estado/?estado=X
   */
  porEstado: async (estado: string): Promise<ProyectosPorEstadoResponse> => {
    const response = await axiosInstance.get<ProyectosPorEstadoResponse>(
      `${BASE_URL}/por_estado/?estado=${estado}`
    );
    return response.data;
  },
  
  /**
   * Obtener proyectos vencidos
   * GET /api/proyectos-remediacion/vencidos/
   */
  vencidos: async (): Promise<ProyectosVencidosResponse> => {
    const response = await axiosInstance.get<ProyectosVencidosResponse>(`${BASE_URL}/vencidos/`);
    return response.data;
  },
  
  /**
   * Obtener proyectos próximos a vencer
   * GET /api/proyectos-remediacion/proximos_a_vencer/?dias=7
   */
  proximosAVencer: async (
    params?: ProyectosProximosVencerParams
  ): Promise<ProyectosProximosVencerResponse> => {
    const dias = params?.dias || 7;
    const response = await axiosInstance.get<ProyectosProximosVencerResponse>(
      `${BASE_URL}/proximos_a_vencer/?dias=${dias}`
    );
    return response.data;
  },


   /**
   * ✅ NUEVO: Listar proyectos por dimensión
   */
  listarPorDimension: async (dimensionId: string): Promise<ProyectosListResponse> => {
    const response = await axiosInstance.get<ProyectosListResponse>(
      `/proyectos-remediacion/listar_por_dimension/?dimension_id=${dimensionId}`
    );
    return response.data;
  }, 
};