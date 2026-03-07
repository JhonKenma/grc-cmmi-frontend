// src/components/evaluaciones/NivelMadurezBadge.tsx

import { getNivelMadurezColor, NIVELES_MADUREZ } from '@/types/iqevaluaciones.types';

interface NivelMadurezBadgeProps {
  nivel: 1 | 2 | 3 | 4 | 5;
  showText?: boolean;
  className?: string;
}

export const NivelMadurezBadge: React.FC<NivelMadurezBadgeProps> = ({ 
  nivel, 
  showText = false,
  className = '' 
}) => {
  const colorClass = getNivelMadurezColor(nivel);
  const texto = NIVELES_MADUREZ[nivel];

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClass} ${className}`}
    >
      {showText ? texto : `Nivel ${nivel}`}
    </span>
  );
};