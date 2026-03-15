import type { TipoDocumento } from '@/types/documentos.types';

export type TipoDocumentoEnum =
  | 'politica'
  | 'norma'
  | 'procedimiento'
  | 'formato_interno'
  | 'otro';

export const deriveTipoDocumentoEnum = (
  tipoId: string,
  tiposDoc: TipoDocumento[]
): TipoDocumentoEnum => {
  const tipoSeleccionado = tiposDoc.find(tipo => tipo.id === tipoId);
  const tokens = [
    tipoSeleccionado?.nombre,
    tipoSeleccionado?.abreviatura,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (tokens.includes('politica') || tokens.includes('pol')) {
    return 'politica';
  }
  if (tokens.includes('norma') || tokens.includes('norm')) {
    return 'norma';
  }
  if (
    tokens.includes('procedimiento') ||
    tokens.includes('manual') ||
    tokens.includes('instructivo') ||
    tokens.includes('proced') ||
    tokens.includes('proc')
  ) {
    return 'procedimiento';
  }
  if (
    tokens.includes('formato') ||
    tokens.includes('registro') ||
    tokens.includes('formato_interno') ||
    tokens.includes('reg')
  ) {
    return 'formato_interno';
  }

  return 'otro';
};

export const extractApiErrorMessage = (
  error: unknown,
  fallback = 'Error al procesar la evidencia'
): string => {
  const responseData = (error as any)?.response?.data;
  if (!responseData) return fallback;

  if (typeof responseData.message === 'string' && responseData.message.trim()) {
    return responseData.message;
  }
  if (typeof responseData.detail === 'string' && responseData.detail.trim()) {
    return responseData.detail;
  }
  if (typeof responseData.error === 'string' && responseData.error.trim()) {
    return responseData.error;
  }

  const priorityFields = [
    'tipo_documento_enum',
    'documento_id',
    'archivo',
    'respuesta_id',
    'respuesta_iq_id',
    'non_field_errors',
  ];

  for (const field of priorityFields) {
    const value = responseData[field];
    if (Array.isArray(value) && value.length > 0) {
      return String(value[0]);
    }
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  const firstArrayField = Object.values(responseData).find(
    value => Array.isArray(value) && value.length > 0
  ) as unknown[] | undefined;
  if (firstArrayField?.length) {
    return String(firstArrayField[0]);
  }

  return fallback;
};