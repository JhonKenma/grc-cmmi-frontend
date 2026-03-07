// src/components/evaluaciones/EstadoBadge.tsx

import { getEstadoBadgeColor, ESTADOS_EVALUACION } from '@/types/iqevaluaciones.types';

interface EstadoBadgeProps {
  estado: keyof typeof ESTADOS_EVALUACION;
  className?: string;
}

export const EstadoBadge: React.FC<EstadoBadgeProps> = ({ estado, className = '' }) => {
  const colorClass = getEstadoBadgeColor(estado);
  const texto = ESTADOS_EVALUACION[estado];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}
    >
      {texto}
    </span>
  );
};