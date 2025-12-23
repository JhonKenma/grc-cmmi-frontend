// src/hooks/useNotification.ts

import { useContext } from 'react';
import { NotificationContext } from '@/context/NotificationContext';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

/**
 * Hook para usar notificaciones toast
 * 
 * @example
 * const { success, error } = useNotification();
 * success('Usuario creado correctamente');
 * error('Error al guardar');
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
  }

  return context;
};