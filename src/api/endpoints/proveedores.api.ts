// src/api/endpoints/proveedores.api.ts

import axiosInstance from '../axios';
import {
  Proveedor,
  ProveedorCreate,
  ProveedorUpdate,
  ProveedorDetailResponse,
  ProveedorPaginatedResponse,
  TipoProveedor,
  TipoProveedorListResponse,
  ClasificacionProveedor,
  ClasificacionProveedorListResponse,
  NivelRiesgo,
} from '@/types/proveedor';
import axios from 'axios';

const BASE_URL = '/proveedores';
const TIPOS_URL = '/tipos-proveedor';
const CLASIFICACIONES_URL = '/clasificaciones-proveedor';

// ============================================================
// API DE CATÁLOGOS
// ============================================================

export const tiposProveedorApi = {
  /**
   * Listar todos los tipos de proveedor activos
   * GET /api/tipos-proveedor/
   */
  getAll: async (): Promise<TipoProveedor[]> => {
    try {
      const response = await axiosInstance.get<TipoProveedorListResponse>(`${TIPOS_URL}/`);
      const data = response.data;
      
      if (data.results) return data.results;
      if (Array.isArray(data)) return data;
      
      console.warn('⚠️ Formato inesperado en tipos getAll:', data);
      return [];
    } catch (error) {
      console.error('❌ Error en tipos getAll:', error);
      return [];
    }
  },

  /**
   * Obtener detalle de un tipo de proveedor
   * GET /api/tipos-proveedor/{id}/
   */
  getById: async (id: string): Promise<TipoProveedor> => {
    const response = await axiosInstance.get<TipoProveedor>(`${TIPOS_URL}/${id}/`);
    return response.data;
  },
};

export const clasificacionesProveedorApi = {
  /**
   * Listar todas las clasificaciones de proveedor activas
   * GET /api/clasificaciones-proveedor/
   */
  getAll: async (): Promise<ClasificacionProveedor[]> => {
    try {
      const response = await axiosInstance.get<ClasificacionProveedorListResponse>(
        `${CLASIFICACIONES_URL}/`
      );
      const data = response.data;
      
      if (data.results) return data.results;
      if (Array.isArray(data)) return data;
      
      console.warn('⚠️ Formato inesperado en clasificaciones getAll:', data);
      return [];
    } catch (error) {
      console.error('❌ Error en clasificaciones getAll:', error);
      return [];
    }
  },

  /**
   * Obtener detalle de una clasificación de proveedor
   * GET /api/clasificaciones-proveedor/{id}/
   */
  getById: async (id: string): Promise<ClasificacionProveedor> => {
    const response = await axiosInstance.get<ClasificacionProveedor>(
      `${CLASIFICACIONES_URL}/${id}/`
    );
    return response.data;
  },
};

// ============================================================
// API DE PROVEEDORES
// ============================================================

export const proveedoresApi = {
  /**
   * Listar todos los proveedores (según rol del usuario)
   * - Superadmin: Ve todos (globales + empresas)
   * - Admin: Solo de su empresa
   * GET /api/proveedores/
   */
  getAll: async (): Promise<Proveedor[]> => {
    try {
      const response = await axiosInstance.get<ProveedorPaginatedResponse>(`${BASE_URL}/`);
      const data = response.data;
      
      if (data.results) return data.results;
      if (Array.isArray(data)) return data;
      
      console.warn('⚠️ Formato inesperado en getAll:', data);
      return [];
    } catch (error) {
      console.error('❌ Error en getAll:', error);
      return [];
    }
  },

  /**
   * Obtener proveedores activos (filtrado por rol)
   * GET /api/proveedores/activos/
   */
  getActivos: async (): Promise<Proveedor[]> => {
    try {
      const response = await axiosInstance.get<ProveedorPaginatedResponse>(
        `${BASE_URL}/activos/`
      );
      const data = response.data;
      
      if (data.results) return data.results;
      if (Array.isArray(data)) return data;
      
      console.warn('⚠️ Formato inesperado en getActivos:', data);
      return [];
    } catch (error) {
      console.error('❌ Error en getActivos:', error);
      return [];
    }
  },

  /**
   * Obtener proveedores inactivos (filtrado por rol)
   * GET /api/proveedores/inactivos/
   */
  getInactivos: async (): Promise<Proveedor[]> => {
    try {
      const response = await axiosInstance.get<ProveedorPaginatedResponse>(
        `${BASE_URL}/inactivos/`
      );
      const data = response.data;
      
      if (data.results) return data.results;
      if (Array.isArray(data)) return data;
      
      console.warn('⚠️ Formato inesperado en getInactivos:', data);
      return [];
    } catch (error) {
      console.error('❌ Error en getInactivos:', error);
      return [];
    }
  },

  /**
   * Obtener proveedores globales (sin empresa)
   * Solo accesible para SUPERADMIN
   * GET /api/proveedores/globales/
   */
  getGlobales: async (): Promise<Proveedor[]> => {
    try {
      const response = await axiosInstance.get<ProveedorPaginatedResponse>(
        `${BASE_URL}/globales/`
      );
      const data = response.data;
      
      if (data.results) return data.results;
      if (Array.isArray(data)) return data;
      
      console.warn('⚠️ Formato inesperado en getGlobales:', data);
      return [];
    } catch (error) {
      console.error('❌ Error en getGlobales:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          console.warn('⚠️ Solo superadmin puede ver proveedores globales');
        }
      }
      
      return [];
    }
  },

  /**
   * Filtrar proveedores por tipo
   * GET /api/proveedores/por-tipo/?tipo_id={uuid}
   */
  getPorTipo: async (tipoId: string): Promise<Proveedor[]> => {
    try {
      const response = await axiosInstance.get<ProveedorPaginatedResponse>(
        `${BASE_URL}/por-tipo/`,
        { params: { tipo_id: tipoId } }
      );
      const data = response.data;
      
      if (data.results) return data.results;
      if (Array.isArray(data)) return data;
      
      console.warn('⚠️ Formato inesperado en getPorTipo:', data);
      return [];
    } catch (error) {
      console.error('❌ Error en getPorTipo:', error);
      return [];
    }
  },

  /**
   * Filtrar proveedores por clasificación
   * GET /api/proveedores/por-clasificacion/?clasificacion_id={uuid}
   */
  getPorClasificacion: async (clasificacionId: string): Promise<Proveedor[]> => {
    try {
      const response = await axiosInstance.get<ProveedorPaginatedResponse>(
        `${BASE_URL}/por-clasificacion/`,
        { params: { clasificacion_id: clasificacionId } }
      );
      const data = response.data;
      
      if (data.results) return data.results;
      if (Array.isArray(data)) return data;
      
      console.warn('⚠️ Formato inesperado en getPorClasificacion:', data);
      return [];
    } catch (error) {
      console.error('❌ Error en getPorClasificacion:', error);
      return [];
    }
  },

  /**
   * Listar proveedores estratégicos
   * GET /api/proveedores/estrategicos/
   */
  getEstrategicos: async (): Promise<Proveedor[]> => {
    try {
      const response = await axiosInstance.get<ProveedorPaginatedResponse>(
        `${BASE_URL}/estrategicos/`
      );
      const data = response.data;
      
      if (data.results) return data.results;
      if (Array.isArray(data)) return data;
      
      console.warn('⚠️ Formato inesperado en getEstrategicos:', data);
      return [];
    } catch (error) {
      console.error('❌ Error en getEstrategicos:', error);
      return [];
    }
  },

  /**
   * Filtrar proveedores por nivel de riesgo
   * GET /api/proveedores/por-nivel-riesgo/?nivel={alto|medio|bajo}
   */
  getPorNivelRiesgo: async (nivel: NivelRiesgo): Promise<Proveedor[]> => {
    try {
      const response = await axiosInstance.get<ProveedorPaginatedResponse>(
        `${BASE_URL}/por-nivel-riesgo/`,
        { params: { nivel } }
      );
      const data = response.data;
      
      if (data.results) return data.results;
      if (Array.isArray(data)) return data;
      
      console.warn('⚠️ Formato inesperado en getPorNivelRiesgo:', data);
      return [];
    } catch (error) {
      console.error('❌ Error en getPorNivelRiesgo:', error);
      return [];
    }
  },

  /**
   * Obtener detalle de un proveedor
   * GET /api/proveedores/{id}/
   */
  getById: async (id: string): Promise<Proveedor> => {
    const response = await axiosInstance.get<Proveedor>(`${BASE_URL}/${id}/`);
    return response.data;
  },

  /**
   * Crear nuevo proveedor
   * POST /api/proveedores/
   * - Superadmin: Puede enviar empresa=null (global) o empresa=id
   * - Admin: No envía empresa (se asigna automáticamente)
   */
  create: async (data: ProveedorCreate): Promise<ProveedorDetailResponse> => {
    const response = await axiosInstance.post<ProveedorDetailResponse>(
      `${BASE_URL}/`,
      data
    );
    return response.data;
  },

  /**
   * Actualizar proveedor completo
   * PUT /api/proveedores/{id}/
   * Nota: El campo 'empresa' es readonly y no se puede cambiar
   */
  update: async (
    id: string,
    data: ProveedorUpdate
  ): Promise<ProveedorDetailResponse> => {
    const response = await axiosInstance.put<ProveedorDetailResponse>(
      `${BASE_URL}/${id}/`,
      data
    );
    return response.data;
  },

  /**
   * Actualizar proveedor parcialmente
   * PATCH /api/proveedores/{id}/
   * Nota: El campo 'empresa' es readonly y no se puede cambiar
   */
  partialUpdate: async (
    id: string,
    data: Partial<ProveedorUpdate>
  ): Promise<ProveedorDetailResponse> => {
    const response = await axiosInstance.patch<ProveedorDetailResponse>(
      `${BASE_URL}/${id}/`,
      data
    );
    return response.data;
  },

  /**
   * Eliminar proveedor
   * DELETE /api/proveedores/{id}/
   */
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}/`);
  },

  /**
   * Activar proveedor
   * POST /api/proveedores/{id}/activar/
   */
  activar: async (id: string): Promise<ProveedorDetailResponse> => {
    const response = await axiosInstance.post<ProveedorDetailResponse>(
      `${BASE_URL}/${id}/activar/`
    );
    return response.data;
  },

  /**
   * Desactivar proveedor
   * POST /api/proveedores/{id}/desactivar/
   */
  desactivar: async (id: string): Promise<ProveedorDetailResponse> => {
    const response = await axiosInstance.post<ProveedorDetailResponse>(
      `${BASE_URL}/${id}/desactivar/`
    );
    return response.data;
  },

  /**
   * Suspender proveedor
   * POST /api/proveedores/{id}/suspender/
   */
  suspender: async (id: string): Promise<ProveedorDetailResponse> => {
    const response = await axiosInstance.post<ProveedorDetailResponse>(
      `${BASE_URL}/${id}/suspender/`
    );
    return response.data;
  },
};

// ============================================================
// EXPORT DEFAULT (para mantener compatibilidad)
// ============================================================

export default {
  proveedores: proveedoresApi,
  tipos: tiposProveedorApi,
  clasificaciones: clasificacionesProveedorApi,
};