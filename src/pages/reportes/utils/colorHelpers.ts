/**
 * Consolidates all gap color logic used across reportes
 * Replaces duplicate color mapping in multiple files
 */
export const GAP_COLOR_MAP = {
  critico: '#ef4444',   // red
  alto: '#f59e0b',      // orange
  medio: '#fbbf24',     // yellow
  bajo: '#3b82f6',      // blue
  cumplido: '#10b981',  // green
  superado: '#8b5cf6',  // purple
} as const;

export const CLASSIFICATION_BADGE_COLORS = {
  critico: 'bg-red-100 text-red-800 border-red-200',
  alto: 'bg-orange-100 text-orange-800 border-orange-200',
  medio: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  bajo: 'bg-blue-100 text-blue-800 border-blue-200',
  cumplido: 'bg-green-100 text-green-800 border-green-200',
  superado: 'bg-purple-100 text-purple-800 border-purple-200',
} as const;

export const NIVEL_BADGE_COLORS = {
  high: 'bg-blue-100 text-blue-700 border-blue-200',    // >= 4
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200', // >= 3
  low: 'bg-orange-100 text-orange-700 border-orange-200',    // >= 2
  critical: 'bg-gray-100 text-gray-700 border-gray-200',     // < 2
} as const;

export const getGapColor = (gap: number): string => {
  if (gap >= 2) return GAP_COLOR_MAP.critico;
  if (gap >= 1) return GAP_COLOR_MAP.alto;
  if (gap > 0) return GAP_COLOR_MAP.medio;
  return GAP_COLOR_MAP.cumplido;
};

export const getGapBadgeColor = (gap: number): string => {
  if (gap >= 2) return CLASSIFICATION_BADGE_COLORS.critico;
  if (gap >= 1) return CLASSIFICATION_BADGE_COLORS.alto;
  return CLASSIFICATION_BADGE_COLORS.cumplido;
};

export const getGapLabel = (gap: number): string => {
  if (gap >= 3) return 'Crítico';
  if (gap >= 2) return 'Alto';
  if (gap >= 1) return 'Medio';
  if (gap > 0) return 'Bajo';
  return 'Sin brecha';
};

export const getClasificacionColor = (clasificacion: string): string => {
  return CLASSIFICATION_BADGE_COLORS[clasificacion as keyof typeof CLASSIFICATION_BADGE_COLORS] || CLASSIFICATION_BADGE_COLORS.bajo;
};

export const getNivelBadgeColor = (nivel: number): string => {
  if (nivel >= 4) return NIVEL_BADGE_COLORS.high;
  if (nivel >= 3) return NIVEL_BADGE_COLORS.medium;
  if (nivel >= 2) return NIVEL_BADGE_COLORS.low;
  return NIVEL_BADGE_COLORS.critical;
};
