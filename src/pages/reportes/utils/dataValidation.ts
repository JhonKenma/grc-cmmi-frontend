/**
 * Data validation and extraction utilities for reportes
 * Reusable logic from TablaDetalleDimensiones and other components
 */

export interface UsuarioEvaluado {
  usuario_id?: string;
  id?: string;
  usuario_nombre?: string;
  nombre_completo?: string;
  nivel_actual?: number;
  gap?: number;
  [key: string]: any;
}

export interface DimensionData {
  dimension?: {
    id: string;
    codigo: string;
    nombre: string;
  };
  usuarios?: UsuarioEvaluado[];
  total_usuarios_evaluados?: number;
  [key: string]: any;
}

/**
 * Verifies if all required dimension data is complete for a project creation
 * Checks: dimension exists, has usuarios, users have all required fields
 */
export const tienesDatosCompletos = (dimension: DimensionData): boolean => {
  if (!dimension || !dimension.dimension) return false;
  if (!dimension.usuarios || dimension.usuarios.length === 0) return false;

  return dimension.usuarios.every(
    (usuario) =>
      usuario.usuario_id &&
      usuario.usuario_nombre &&
      usuario.nivel_actual !== undefined &&
      usuario.gap !== undefined
  );
};

/**
 * Extracts the most representative user from a dimension
 * Useful for displaying key user in summaries or forms
 * Returns the user with highest nivel_actual
 */
export const obtenerUsuarioRepresentativo = (
  dimension: DimensionData
): UsuarioEvaluado | null => {
  if (!dimension?.usuarios || dimension.usuarios.length === 0) {
    return null;
  }

  return dimension.usuarios.reduce((maxUser, currentUser) => {
    const currentNivel = currentUser.nivel_actual ?? -Infinity;
    const maxNivel = maxUser.nivel_actual ?? -Infinity;
    return currentNivel > maxNivel ? currentUser : maxUser;
  });
};

/**
 * Gets user initials for avatar display
 * Handles various name formats
 */
export const getInitials = (name: string | undefined): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

/**
 * Calculates percentage from actual vs desired levels
 * Used for progress bars and metrics
 */
export const calcularCumplimiento = (
  nivelActual: number,
  nivelDeseado: number
): number => {
  if (nivelDeseado === 0) return 0;
  const porcentaje = (nivelActual / nivelDeseado) * 100;
  return Math.min(100, Math.max(0, porcentaje));
};

/**
 * Extracts dimension IDs from paginated results
 * Safe extraction for complex nested structures
 */
export const extractDimensionIds = (dimensiones: DimensionData[]): string[] => {
  if (!Array.isArray(dimensiones)) return [];
  return dimensiones
    .filter((dim) => dim?.dimension?.id)
    .map((dim) => dim.dimension!.id);
};
