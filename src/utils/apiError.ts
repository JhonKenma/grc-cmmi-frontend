export const getApiErrorMessage = (error: unknown, fallback = 'Ocurrio un error inesperado'): string => {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return fallback;
  }

  const response = (error as { response?: { data?: unknown } }).response;
  const data = response?.data;

  if (!data) return fallback;

  if (typeof data === 'string') return data;

  if (typeof data === 'object') {
    const payload = data as {
      message?: string;
      detail?: string;
      error?: string;
      errors?: Record<string, string[] | string>;
      [key: string]: unknown;
    };

    if (payload.message) return payload.message;
    if (payload.detail) return payload.detail;
    if (payload.error) return payload.error;

    if (payload.errors && typeof payload.errors === 'object') {
      const firstEntry = Object.entries(payload.errors)[0];
      if (firstEntry) {
        const [field, value] = firstEntry;
        const firstValue = Array.isArray(value) ? value[0] : value;
        return `${field}: ${String(firstValue)}`;
      }
    }

    const firstField = Object.entries(payload).find(([, value]) => Array.isArray(value) || typeof value === 'string');
    if (firstField) {
      const [field, value] = firstField;
      const message = Array.isArray(value) ? value[0] : value;
      return `${field}: ${String(message)}`;
    }
  }

  return fallback;
};
