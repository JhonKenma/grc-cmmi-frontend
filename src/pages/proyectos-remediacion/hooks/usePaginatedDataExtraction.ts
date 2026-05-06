import { useMemo } from 'react';

/**
 * Hook genérico para extraer datos de forma segura de respuestas paginadas.
 * Evita errores de undefined cuando se accede a propiedades en arrays vacíos.
 * Útil para múltiples APIs que retornan estructura { results: T[] }
 */
export const usePaginatedDataExtraction = <T,>(
  data: any,
  resultKey: string = 'results'
): T[] => {
  return useMemo(() => {
    if (!data) return [];
    if (typeof data !== 'object') return [];

    const results = data[resultKey];
    if (Array.isArray(results)) return results;
    if (!results) return [];

    return Array.isArray(results) ? results : [];
  }, [data, resultKey]);
};

/**
 * Hook para extraer un campo específico de datos paginados
 * Útil para extraer IDs u otros campos de un array de objetos
 */
export const usePaginatedFieldExtraction = <T, K extends keyof T>(
  data: any,
  field: K,
  resultKey: string = 'results'
): T[K][] => {
  return useMemo(() => {
    if (!data) return [];
    if (typeof data !== 'object') return [];

    const results = data[resultKey];
    if (!Array.isArray(results)) return [];

    return results
      .filter((item: any) => item && field in item)
      .map((item: any) => item[field]);
  }, [data, field, resultKey]);
};
