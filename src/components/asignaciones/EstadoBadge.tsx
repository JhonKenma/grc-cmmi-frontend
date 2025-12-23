// src/components/asignaciones/EstadoBadge.tsx

import React from 'react';

interface EstadoBadgeProps {
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'vencido' | 'pendiente_revision' | 'rechazado';
  className?: string;
}

export const EstadoBadge: React.FC<EstadoBadgeProps> = ({ estado, className = '' }) => {
  const configs = {
    pendiente: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: '⏳',
      label: 'Pendiente',
    },
    en_progreso: {
      color: 'bg-blue-100 text-blue-800',
      icon: '🔄',
      label: 'En Progreso',
    },
    completado: {
      color: 'bg-green-100 text-green-800',
      icon: '✅',
      label: 'Completado',
    },
    vencido: {
      color: 'bg-red-100 text-red-800',
      icon: '❌',
      label: 'Vencido',
    },
    pendiente_revision: {
      color: 'bg-purple-100 text-purple-800',
      icon: '👁️',
      label: 'Pendiente Revisión',
    },
    rechazado: {
      color: 'bg-orange-100 text-orange-800',
      icon: '🔴',
      label: 'Rechazado',
    },
  };

  const config = configs[estado];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${config.color} ${className}`}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};