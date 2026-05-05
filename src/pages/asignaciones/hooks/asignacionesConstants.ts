// src/pages/asignaciones/hooks/asignacionesConstants.ts

// ── Estado badges ────────────────────────────────────────────────────────────

export const ESTADO_BADGE_CLASSES: Record<string, string> = {
  pendiente:          'bg-yellow-100 text-yellow-800',
  en_progreso:        'bg-blue-100   text-blue-800',
  completado:         'bg-green-100  text-green-800',
  vencido:            'bg-red-100    text-red-800',
  pendiente_revision: 'bg-purple-100 text-purple-800',
  rechazado:          'bg-orange-100 text-orange-800',
};

export const ESTADO_LABELS: Record<string, string> = {
  pendiente:          'Pendiente',
  en_progreso:        'En Progreso',
  completado:         'Completado',
  vencido:            'Vencido',
  pendiente_revision: 'En Revisión',
  rechazado:          'Rechazado',
};

// ── Niveles de evaluación ────────────────────────────────────────────────────

export const NIVEL_COLORS: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-blue-500',
  5: 'bg-green-500',
};

export const NIVEL_NOMBRES: Record<number, string> = {
  1: 'Inicial',
  2: 'Gestionado',
  3: 'Definido',
  4: 'Cuantitativamente Gestionado',
  5: 'Optimizado',
};

export const getNivelColor = (nivel: number): string =>
  NIVEL_COLORS[nivel] ?? 'bg-gray-500';

export const getNivelNombre = (nivel: number): string =>
  NIVEL_NOMBRES[nivel] ?? '';

// ── Dias restantes ───────────────────────────────────────────────────────────

export const getDiasRestantesColor = (dias: number): string => {
  if (dias < 0)  return 'text-red-600';
  if (dias <= 3) return 'text-orange-600';
  if (dias <= 7) return 'text-yellow-600';
  return 'text-green-600';
};