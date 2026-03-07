// src/types/empresa-framework.types.ts

/**
 * Types para Asignación de Frameworks a Empresas
 */

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

export interface EmpresaFramework {
  id: number;
  empresa: number;
  empresa_nombre: string;
  framework: number;
  framework_codigo: string;
  framework_nombre: string;
  framework_version: string;
  framework_total_preguntas: number;
  asignado_por: number;
  asignado_por_nombre: string;
  fecha_asignacion: string;
  activo: boolean;
  notas: string;
}

export interface EmpresaFrameworkList {
  id: number;
  framework_id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  version: string;
  total_preguntas: number;
  fecha_asignacion: string;
  notas: string;
}

// ============================================================================
// DATA TRANSFER OBJECTS (DTOs)
// ============================================================================

export interface AsignarFrameworkData {
  empresa: number;
  framework: number;
  notas?: string;
}

export interface AsignarVariosFrameworksData {
  empresa: number;
  frameworks: number[];
  notas?: string;
}

// ============================================================================
// RESPONSES
// ============================================================================

export interface MisFrameworksResponse {
  empresa: string;
  total_frameworks: number;
  frameworks: EmpresaFrameworkList[];
}

export interface FrameworksPorEmpresaResponse {
  empresa_id: number;
  total: number;
  activos: number;
  frameworks: EmpresaFramework[];
}

export interface AsignarVariosResponse {
  success: boolean;
  asignados: number[];
  ya_existian: number[];
  total_asignados: number;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Filtra solo los frameworks activos
 */
export const getFrameworksActivos = (frameworks: EmpresaFramework[]): EmpresaFramework[] => {
  return frameworks.filter(fw => fw.activo);
};

/**
 * Agrupa frameworks por empresa
 */
export const agruparPorEmpresa = (asignaciones: EmpresaFramework[]): Record<string, EmpresaFramework[]> => {
  return asignaciones.reduce((acc, asignacion) => {
    const empresa = asignacion.empresa_nombre;
    if (!acc[empresa]) {
      acc[empresa] = [];
    }
    acc[empresa].push(asignacion);
    return acc;
  }, {} as Record<string, EmpresaFramework[]>);
};