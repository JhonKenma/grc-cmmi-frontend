// src/utils/helpers.ts

import { STORAGE_KEYS } from './constants';

/**
 * Guardar en localStorage
 */
export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
};

/**
 * Obtener de localStorage
 */
export const getLocalStorage = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error al leer de localStorage:', error);
    return null;
  }
};

/**
 * Eliminar de localStorage
 */
export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error al eliminar de localStorage:', error);
  }
};

/**
 * Limpiar localStorage completo
 */
export const clearLocalStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error al limpiar localStorage:', error);
  }
};

/**
 * Guardar tokens
 */
export const saveTokens = (access: string, refresh: string): void => {
  setLocalStorage(STORAGE_KEYS.ACCESS_TOKEN, access);
  setLocalStorage(STORAGE_KEYS.REFRESH_TOKEN, refresh);
};

/**
 * Obtener access token
 */
export const getAccessToken = (): string | null => {
  return getLocalStorage<string>(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Obtener refresh token
 */
export const getRefreshToken = (): string | null => {
  return getLocalStorage<string>(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Eliminar tokens
 */
export const clearTokens = (): void => {
  removeLocalStorage(STORAGE_KEYS.ACCESS_TOKEN);
  removeLocalStorage(STORAGE_KEYS.REFRESH_TOKEN);
  removeLocalStorage(STORAGE_KEYS.USER_DATA);
};

/**
 * Verificar si hay sesión activa
 */
export const hasActiveSession = (): boolean => {
  return !!getAccessToken();
};

/**
 * Combinar clases CSS (útil con Tailwind)
 * Similar a la librería clsx
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Delay/Sleep
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Descargar archivo
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Formatear fecha en formato legible
 */
export const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return '-';
  }
};

/**
 * Formatear fecha y hora
 */
export const formatDateTime = (date: string | Date, locale = 'es-PE'): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return '-';
  }
};

/**
 * Formatear nombre completo
 */
export const formatFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim() || '-';
};

/**
 * Capitalizar primera letra
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formatear RUC con guiones
 */
export const formatRUC = (ruc: string): string => {
  if (!ruc) return '-';
  return ruc.replace(/(\d{2})(\d{9})/, '$1-$2');
};

/**
 * Formatear teléfono
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '-';
  return phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
};

/**
 * Truncar texto largo
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Obtener iniciales de nombre
 */
export const getInitials = (name: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Formatear bytes a tamaño legible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Validar email
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return regex.test(email);
};

/**
 * Generar color aleatorio para avatar
 */
export const getRandomColor = (): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
