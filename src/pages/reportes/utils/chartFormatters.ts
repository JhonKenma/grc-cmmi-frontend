/**
 * Utilities for formatting data for charts
 * Consolidates data transformation logic used in GraficosIQ
 */

export const truncateText = (text: string, maxLength: number = 10): string => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const formatNumberToPrecision = (value: any, precision: number = 2): number => {
  if (typeof value !== 'number' && typeof value !== 'string') return 0;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 0;
  return parseFloat(num.toFixed(precision));
};

export const formatChartDataPoint = (
  label: string,
  value: number,
  options?: {
    truncateAt?: number;
    precision?: number;
  }
): { label: string; value: number } => {
  return {
    label: truncateText(label, options?.truncateAt),
    value: formatNumberToPrecision(value, options?.precision),
  };
};

export const formatArrayForChart<T extends Record<string, any>>(
  data: T[],
  labelKey: keyof T,
  valueKey: keyof T,
  options?: {
    truncateAt?: number;
    precision?: number;
  }
): Array<{ label: string; value: number; original: T }> {
  return data.map((item) => ({
    label: truncateText(String(item[labelKey]), options?.truncateAt),
    value: formatNumberToPrecision(item[valueKey], options?.precision),
    original: item,
  }));
};
