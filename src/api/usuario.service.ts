// src/api/usuario.service.ts - VERSIÓN ACTUALIZADA

import api from './axios';
import { Usuario } from '@/types';

export const usuarioService = {
  // ⭐ AGREGAR ESTE MÉTODO
  // Listar usuarios con filtros opcionales
  async list(params?: {
    rol?: string;
    empresa?: number;
    activo?: boolean;
  }): Promise<Usuario[]> {
    const response = await api.get('/auth/usuarios/', { params });
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data.results && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    
    console.warn('Formato inesperado en la respuesta del backend:', response.data);
    return [];
  },

  // Listar usuarios (según permisos) - MANTENER PARA COMPATIBILIDAD
  async getAll(): Promise<Usuario[]> {
    const response = await api.get('/auth/usuarios/');
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data.results && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    
    console.warn('Formato inesperado en la respuesta del backend:', response.data);
    return [];
  },

  // Obtener un usuario por ID
  async getById(id: number): Promise<Usuario> {
    const response = await api.get<Usuario>(`/auth/usuarios/${id}/`);
    return response.data;
  },

  // Crear usuario
  async create(data: Partial<Usuario> & { password: string }): Promise<Usuario> {
    const response = await api.post<Usuario>('/auth/usuarios/', data);
    return response.data;
  },

  // Actualizar usuario
  async update(id: number, data: Partial<Usuario>): Promise<Usuario> {
    const response = await api.patch<Usuario>(`/auth/usuarios/${id}/`, data);
    return response.data;
  },

  // Eliminar usuario
  async delete(id: number): Promise<void> {
    await api.delete(`/auth/usuarios/${id}/`);
  },

  // Cambiar estado (activar/desactivar)
  async toggleStatus(id: number): Promise<{ activo: boolean }> {
    const response = await api.post(`/auth/usuarios/${id}/cambiar_estado/`);
    return response.data;
  },

  // Obtener estadísticas
  async getEstadisticas(): Promise<any> {
    const response = await api.get('/auth/usuarios/estadisticas/');
    return response.data;
  },

  // Filtrar por rol
  async getByRol(rol: string): Promise<Usuario[]> {
    const response = await api.get(`/auth/usuarios/por_rol/?rol=${rol}`);
    
    // ⭐ AGREGAR MANEJO DE RESPUESTA
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data.results && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    
    return [];
  },
};