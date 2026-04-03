// src/api/empresa.service.ts
import api from './axios';
import { Empresa, PlanEmpresa } from '@/types';

export const empresaService = {
  // Listar empresas (según permisos del usuario)
  async getAll(): Promise<Empresa[]> {
    const response = await api.get('/empresas/');
    
    // ✅ Detectar si viene paginado (tiene "results") o no
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data.results && Array.isArray(response.data.results)) {
      return response.data.results;
    }

    // Si no coincide ninguna estructura conocida
    console.warn('Formato inesperado en la respuesta del backend:', response.data);
    return [];
  },

  // Obtener una empresa
  async getById(id: number): Promise<Empresa> {
    const response = await api.get<Empresa>(`/empresas/${id}/`);
    return response.data;
  },

  // Obtener mi empresa
  async getMyEmpresa(): Promise<Empresa> {
    const response = await api.get<Empresa>('/empresas/mi_empresa/');
    return response.data;
  },

  // Crear empresa (solo superadmin)
  async create(data: Partial<Empresa>): Promise<Empresa> {
    const response = await api.post('/empresas/', data);
    // El backend usa ResponseMixin: { success, message, data: {...} }
    return response.data.data || response.data;
  },

  // Actualizar empresa
  async update(id: number, data: Partial<Empresa>): Promise<Empresa> {
    const response = await api.patch<Empresa>(`/empresas/${id}/`, data);
    return response.data;
  },
  
  // ✅ NUEVO: Eliminar empresa
  async delete(id: number): Promise<void> {
    await api.delete(`/empresas/${id}/`);
  },

  // Cambiar estado de empresa
  async toggleStatus(id: number): Promise<{ activo: boolean }> {
    const response = await api.post(`/empresas/${id}/cambiar_estado/`);
    return response.data;
  },

  async asignarPlan(id: number, data: {
    tipo: string;
    max_usuarios: number;
    max_administradores: number;
    max_auditores: number;
    fecha_expiracion?: string | null;  // ← "YYYY-MM-DD" o null
    sin_expiracion?: boolean;
  }): Promise<PlanEmpresa> {
    const response = await api.post(`/empresas/${id}/asignar_plan/`, data);
    return response.data.data || response.data;
  },

};
