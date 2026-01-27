// src/api/endpoints/proyectos-remediacion.api.ts

import axiosInstance from '../axios';
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
  ProyectosVencidosResponse,
  ProyectosProximosVencerParams,
  ProyectosProximosVencerResponse,
  // ⭐ NUEVO: Importar types de ítems
  ItemProyecto,
  ItemProyectoDetail,
  CrearItemFormData,
  ActualizarItemFormData,
  ListarItemsResponse,
  ItemActionResponse,
  ItemsFiltros,
  SolicitarAprobacionData,
  AprobacionGAPDetail,
  ResponderAprobacionData,
  AprobacionGAP,
} from '@/types/proyecto-remediacion.types';

const BASE_URL = '/proyectos-remediacion';

/**
 * API CLIENT PARA PROYECTOS DE REMEDIACIÓN
 * 
 * Actualizado con soporte completo para:
 * - CRUD de proyectos con modo de presupuesto dual
 * - Gestión de ítems de proyecto ⭐
 * - Dependencias entre ítems
 * - Creación desde GAP
 * - Consultas especiales y estadísticas
 */
export const proyectosRemediacionApi = {
  
  // ═══════════════════════════════════════════════════════════════
  // CRUD BÁSICO DE PROYECTOS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Listar proyectos con filtros y paginación
   * GET /api/proyectos-remediacion/
   */
  listar: async (filtros?: ProyectosFiltros): Promise<ProyectosListResponse> => {
    const params = new URLSearchParams();
    
    // Filtros de relaciones
    if (filtros?.calculo_nivel) params.append('calculo_nivel', filtros.calculo_nivel);
    if (filtros?.empresa) params.append('empresa', filtros.empresa);
    
    // Filtros de estado
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.prioridad) params.append('prioridad', filtros.prioridad);
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    
    // ⭐ NUEVO: Filtro por modo de presupuesto
    if (filtros?.modo_presupuesto) params.append('modo_presupuesto', filtros.modo_presupuesto);
    
    // Búsqueda y ordenamiento
    if (filtros?.search) params.append('search', filtros.search);
    if (filtros?.ordering) params.append('ordering', filtros.ordering);
    
    // Paginación
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.page_size) params.append('page_size', filtros.page_size.toString());
    
    const url = params.toString() 
      ? `${BASE_URL}/?${params}` 
      : `${BASE_URL}/`;
      
    const response = await axiosInstance.get<ProyectosListResponse>(url);
    return response.data;
  },

  /**
   * Obtener proyectos de un GAP específico
   * GET /api/proyectos-remediacion/?calculo_nivel={id}
   */
  getPorGap: async (calculoNivelId: string): Promise<ProyectosListResponse> => {
    const response = await axiosInstance.get<ProyectosListResponse>(
      `${BASE_URL}/?calculo_nivel=${calculoNivelId}`
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
  // GESTIÓN DE ÍTEMS (NUEVO) ⭐
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Listar ítems de un proyecto
   * GET /api/proyectos-remediacion/{id}/items/
   */
  listarItems: async (
    proyectoId: string, 
    filtros?: ItemsFiltros
  ): Promise<ListarItemsResponse> => {
    const params = new URLSearchParams();
    
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.requiere_proveedor !== undefined) {
      params.append('requiere_proveedor', filtros.requiere_proveedor.toString());
    }
    
    const url = params.toString()
      ? `${BASE_URL}/${proyectoId}/items/?${params}`
      : `${BASE_URL}/${proyectoId}/items/`;
    
    const response = await axiosInstance.get<ListarItemsResponse>(url);
    return response.data;
  },
  
  /**
   * Agregar un ítem al proyecto
   * POST /api/proyectos-remediacion/{id}/agregar-item/
   */
  agregarItem: async (
    proyectoId: string, 
    data: CrearItemFormData
  ): Promise<ItemActionResponse> => {
    const response = await axiosInstance.post<ItemActionResponse>(
      `${BASE_URL}/${proyectoId}/agregar-item/`,
      data
    );
    return response.data;
  },
  
/**
   * Actualizar un ítem directamente
   * PATCH /api/items-proyecto/{id}/
   */
  actualizarItem: async (
    itemId: string | number, // Usamos el ID del ítem directamente
    data: {
      estado?: string;
      porcentaje_avance?: number;
      presupuesto_ejecutado?: number;
      observaciones?: string;
    }
  ): Promise<any> => {
    // Apuntamos al nuevo endpoint de ítems
    const response = await axiosInstance.patch(
      `/items-proyecto/${itemId}/`, 
      data
    );
    return response.data;
  },
  
  /**
   * Eliminar un ítem del proyecto
   * DELETE /api/proyectos-remediacion/{id}/eliminar-item/?item_id={itemId}
   */
  eliminarItem: async (proyectoId: string, itemId: string): Promise<void> => {
    await axiosInstance.delete(
      `${BASE_URL}/${proyectoId}/eliminar-item/?item_id=${itemId}`
    );
  },
  
  /**
   * Reordenar ítems del proyecto
   * POST /api/proyectos-remediacion/{id}/reordenar-items/
   */
  reordenarItems: async (proyectoId: string, orden: string[]): Promise<void> => {
    await axiosInstance.post(
      `${BASE_URL}/${proyectoId}/reordenar-items/`,
      { orden }
    );
  },
  
  // ═══════════════════════════════════════════════════════════════
  // ACCIONES ESPECIALES DE PROYECTOS
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
  getMisProyectos: async (params?: MisProyectosParams): Promise<ProyectoRemediacionList[]> => {
    const queryParams = new URLSearchParams();
    
    if (params?.estado) queryParams.append('estado', params.estado);
    
    const url = queryParams.toString() 
      ? `${BASE_URL}/mis_proyectos/?${queryParams}` 
      : `${BASE_URL}/mis_proyectos/`;
    
    const response = await axiosInstance.get(url);
    
    // ⭐ NORMALIZAR RESPUESTA
    // El backend puede retornar array directamente o paginado
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // Si está paginado
    if (response.data?.results) {
      return response.data.results;
    }
    
    // Fallback
    return [];
  },
    
  // Mantener el método existente para compatibilidad
  misProyectos: async (params?: MisProyectosParams): Promise<ProyectoRemediacionList[]> => {
    const queryParams = new URLSearchParams();
    
    if (params?.estado) queryParams.append('estado', params.estado);
    
    const url = queryParams.toString() 
      ? `${BASE_URL}/mis_proyectos/?${queryParams}` 
      : `${BASE_URL}/mis_proyectos/`;
    
    const response = await axiosInstance.get<ProyectoRemediacionList[]>(url);
    return response.data;
  },

    /**
   * Listar proyectos por dimensión y evaluación
   * GET /api/proyectos-remediacion/por_dimension_y_evaluacion/?dimension_id=X&evaluacion_id=Y
   */
  porDimensionYEvaluacion: async (dimensionId: string, evaluacionId: string) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/por_dimension_y_evaluacion/`,
      {
        params: {
          dimension_id: dimensionId,
          evaluacion_id: evaluacionId,
        }
      }
    );
    return response.data;
  },
  
  /**
   * Obtener estadísticas generales de proyectos
   * GET /api/proyectos-remediacion/estadisticas/
   */
  estadisticas: async (): Promise<EstadisticasProyectos> => {
    const response = await axiosInstance.get<EstadisticasProyectos>(`${BASE_URL}/estadisticas/`);
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
   * Listar proyectos por dimensión
   * GET /api/proyectos-remediacion/listar_por_dimension/?dimension_id={id}
   */
  listarPorDimension: async (dimensionId: string): Promise<ProyectosListResponse> => {
    const response = await axiosInstance.get<ProyectosListResponse>(
      `${BASE_URL}/listar_por_dimension/?dimension_id=${dimensionId}`
    );
    return response.data;
  },

  /**
   * Solicitar aprobación para cerrar GAP*****************************************************************
   * POST /api/proyectos-remediacion/{id}/solicitar_aprobacion/
   */
  solicitarAprobacion: async (
    proyectoId: string,
    data: SolicitarAprobacionData
  ): Promise<AprobacionGAPDetail> => {
    const response = await axiosInstance.post(
      `${BASE_URL}/${proyectoId}/solicitar_aprobacion/`,
      data
    );
    return response.data.data;
  },

  /**
   * Aprobar cierre de GAP
   * POST /api/proyectos-remediacion/{id}/aprobar_cierre_gap/
   */
  aprobarCierreGAP: async (
    proyectoId: string,
    data: ResponderAprobacionData
  ): Promise<AprobacionGAPDetail> => {
    const response = await axiosInstance.post(
      `${BASE_URL}/${proyectoId}/aprobar_cierre_gap/`,
      data
    );
    return response.data.data;
  },

  /**
   * Rechazar cierre de GAP
   * POST /api/proyectos-remediacion/{id}/rechazar_cierre_gap/
   */
  rechazarCierreGAP: async (
    proyectoId: string,
    data: ResponderAprobacionData
  ): Promise<AprobacionGAPDetail> => {
    const response = await axiosInstance.post(
      `${BASE_URL}/${proyectoId}/rechazar_cierre_gap/`,
      data
    );
    return response.data.data;
  },

  /**
   * Obtener aprobaciones pendientes del usuario actual
   * GET /api/proyectos-remediacion/aprobaciones_pendientes/
   */
  getAprobacionesPendientes: async (): Promise<{
    count: number;
    aprobaciones: AprobacionGAP[];
  }> => {
    const response = await axiosInstance.get(
      `${BASE_URL}/aprobaciones_pendientes/`
    );
    return response.data;
  },  


  /**
   * Marcar ítem como completado
   * POST /api/proyectos-remediacion/{id}/completar_item/
   */
  completarItem: async (
    proyectoId: string,
    itemId: string,
    observaciones?: string
  ): Promise<ItemProyecto> => {
    const response = await axiosInstance.post(
      `${BASE_URL}/${proyectoId}/completar_item/`,
      {
        item_id: itemId,
        observaciones,
      }
    );
    return response.data.data;
  },

};

// ═══════════════════════════════════════════════════════════════
// HELPERS Y UTILIDADES ⭐
// ═══════════════════════════════════════════════════════════════

/**
 * Validar si un proyecto está en modo por_items
 */
export const esModoItems = (proyecto: ProyectoRemediacionDetail | ProyectoRemediacionList): boolean => {
  return proyecto.modo_presupuesto === 'por_items';
};

/**
 * Calcular total de presupuesto de ítems
 */
export const calcularTotalPresupuestoItems = (items: ItemProyecto[]): {
  planificado: number;
  ejecutado: number;
  diferencia: number;
} => {
  const planificado = items.reduce((sum, item) => sum + item.presupuesto_planificado, 0);
  const ejecutado = items.reduce((sum, item) => sum + item.presupuesto_ejecutado, 0);
  
  return {
    planificado,
    ejecutado,
    diferencia: ejecutado - planificado,
  };
};

/**
 * Obtener ítems bloqueados
 */
export const getItemsBloqueados = (items: ItemProyecto[]): ItemProyecto[] => {
  return items.filter(item => item.estado === 'bloqueado');
};

/**
 * Calcular porcentaje de avance general
 */
export const calcularAvanceGeneral = (items: ItemProyecto[]): number => {
  if (items.length === 0) return 0;
  
  const completados = items.filter(item => item.estado === 'completado').length;
  return Math.round((completados / items.length) * 100);
};

/**
 * Query keys para React Query
 */
export const queryKeys = {
  all: ['proyectos-remediacion'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filtros?: ProyectosFiltros) => [...queryKeys.lists(), filtros] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
  items: (proyectoId: string) => [...queryKeys.detail(proyectoId), 'items'] as const,
  misProyectos: (params?: MisProyectosParams) => [...queryKeys.all, 'mis-proyectos', params] as const,
  estadisticas: () => [...queryKeys.all, 'estadisticas'] as const,
};



export default proyectosRemediacionApi;