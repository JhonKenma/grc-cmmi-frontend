// src/api/endpoints/empresa-framework.api.ts

import axiosInstance from '@/api/axios';
import type {
  EmpresaFramework,
  EmpresaFrameworkList,
  AsignarFrameworkData,
  AsignarVariosFrameworksData,
  MisFrameworksResponse,
  FrameworksPorEmpresaResponse,
  AsignarVariosResponse,
} from '@/types/empresa-framework.types';

/**
 * API para gestión de Frameworks asignados a Empresas
 */

const BASE_URL = '/evaluaciones/empresa-frameworks';

export const empresaFrameworkApi = {
  
  // ============================================================================
  // ENDPOINTS PARA SUPERADMIN
  // ============================================================================

  /**
   * Lista todas las asignaciones de frameworks a empresas
   * Solo SuperAdmin
   * GET /empresa-frameworks/
   */
  listar: async (): Promise<EmpresaFramework[]> => {
    const response = await axiosInstance.get<EmpresaFramework[]>(BASE_URL + '/');
    return response.data;
  },

  /**
   * Obtiene detalle de una asignación específica
   * Solo SuperAdmin
   * GET /empresa-frameworks/{id}/
   */
  obtener: async (id: number): Promise<EmpresaFramework> => {
    const response = await axiosInstance.get<EmpresaFramework>(`${BASE_URL}/${id}/`);
    return response.data;
  },

  /**
   * Asigna un framework a una empresa
   * Solo SuperAdmin
   * POST /empresa-frameworks/
   */
  asignar: async (data: AsignarFrameworkData): Promise<EmpresaFramework> => {
    const response = await axiosInstance.post<EmpresaFramework>(BASE_URL + '/', data);
    return response.data;
  },

  /**
   * Asigna múltiples frameworks a una empresa en una sola llamada
   * Solo SuperAdmin
   * POST /empresa-frameworks/asignar-varios/
   */
  asignarVarios: async (data: AsignarVariosFrameworksData): Promise<AsignarVariosResponse> => {
    const response = await axiosInstance.post<AsignarVariosResponse>(
      `${BASE_URL}/asignar-varios/`,
      data
    );
    return response.data;
  },

  /**
   * Lista los frameworks asignados a una empresa específica
   * Solo SuperAdmin
   * GET /empresa-frameworks/por-empresa/{empresaId}/
   */
  porEmpresa: async (empresaId: number): Promise<FrameworksPorEmpresaResponse> => {
    const response = await axiosInstance.get<FrameworksPorEmpresaResponse>(
      `${BASE_URL}/por-empresa/${empresaId}/`
    );
    return response.data;
  },

  /**
   * Actualiza una asignación (notas, activo)
   * Solo SuperAdmin
   * PATCH /empresa-frameworks/{id}/
   */
  actualizar: async (id: number, data: Partial<AsignarFrameworkData>): Promise<EmpresaFramework> => {
    const response = await axiosInstance.patch<EmpresaFramework>(`${BASE_URL}/${id}/`, data);
    return response.data;
  },

  /**
   * Desactiva una asignación (soft delete)
   * Solo SuperAdmin
   * PATCH /empresa-frameworks/{id}/
   */
  desactivar: async (id: number): Promise<EmpresaFramework> => {
    const response = await axiosInstance.patch<EmpresaFramework>(`${BASE_URL}/${id}/`, {
      activo: false
    });
    return response.data;
  },

  /**
   * Elimina una asignación (hard delete)
   * Solo SuperAdmin
   * DELETE /empresa-frameworks/{id}/
   */
  eliminar: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}/`);
  },

  // ============================================================================
  // ENDPOINTS PARA ADMIN DE EMPRESA
  // ============================================================================

  /**
   * Lista los frameworks disponibles para el admin actual
   * Admin de Empresa
   * GET /empresa-frameworks/mis-frameworks/
   */
  misFrameworks: async (): Promise<MisFrameworksResponse> => {
    const response = await axiosInstance.get<MisFrameworksResponse>(
      `${BASE_URL}/mis-frameworks/`
    );
    return response.data;
  },
};