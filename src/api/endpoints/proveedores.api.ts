// src/api/endpoints/proveedores.api.ts

import axiosInstance from '../axios';
import {
  Proveedor,
  ProveedorCreate,
  ProveedorUpdate,
  ProveedorListResponse,
  ProveedorDetailResponse,
  ProveedorPaginatedResponse,
} from '@/types/proveedor';
import axios from 'axios';
const BASE_URL = '/proveedores';

export const proveedoresApi = {
  /**
   * Listar todos los proveedores (según rol del usuario)
   * - Superadmin: Ve todos (globales + empresas)
   * - Admin: Solo de su empresa
   */
  getAll: async (): Promise<Proveedor[]> => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/`);
      const data = response.data;
      
      // Manejar diferentes formatos de respuesta
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
      const response = await axiosInstance.get(`${BASE_URL}/activos/`);
      const data = response.data;
      
      if (data.results) return data.results;
      if (data.data) return data.data;
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
      const response = await axiosInstance.get(`${BASE_URL}/inactivos/`);
      const data = response.data;
      
      if (data.results) return data.results;
      if (data.data) return data.data;
      if (Array.isArray(data)) return data;
      
      console.warn('⚠️ Formato inesperado en getInactivos:', data);
      return [];
    } catch (error) {
      console.error('❌ Error en getInactivos:', error);
      return [];
    }
  },

  /**
   * ⭐ NUEVO: Obtener proveedores globales (sin empresa)
   * Solo accesible para SUPERADMIN
   * GET /api/proveedores/globales/
   */
  getGlobales: async (): Promise<Proveedor[]> => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/globales/`);
      const data = response.data;
      
      if (data.results) return data.results;
      if (data.data) return data.data;
      if (Array.isArray(data)) return data;
      
      console.warn('⚠️ Formato inesperado en getGlobales:', data);
      return [];
    } catch (error) {
      console.error('❌ Error en getGlobales:', error);
      
      // ⭐ CORRECCIÓN: Tipar el error correctamente
      if (axios.isAxiosError(error)) {
        // Si es 403, el usuario no es superadmin
        if (error.response?.status === 403) {
          console.warn('⚠️ Solo superadmin puede ver proveedores globales');
        }
      }
      
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
   * Actualizar proveedor
   * PATCH /api/proveedores/{id}/
   * Nota: El campo 'empresa' es readonly y no se puede cambiar
   */
  update: async (
    id: string,
    data: ProveedorUpdate
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
};