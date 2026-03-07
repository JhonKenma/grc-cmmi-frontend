// src/components/evaluaciones/PreguntaCard.tsx

import { NivelMadurezBadge } from './NivelMadurezBadge';
import type { PreguntaEvaluacionList } from '@/types/iqevaluaciones.types';

interface PreguntaCardProps {
  pregunta: PreguntaEvaluacionList;
  onClick?: () => void;
  selected?: boolean;
  showCheckbox?: boolean;
  onSelect?: (selected: boolean) => void;
  showFramework?: boolean;
}

export const PreguntaCard: React.FC<PreguntaCardProps> = ({
  pregunta,
  onClick,
  selected = false,
  showCheckbox = false,
  onSelect,
  showFramework = true,
}) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect?.(e.target.checked);
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border transition-all
        ${onClick ? 'cursor-pointer' : ''}
        ${selected 
          ? 'border-primary-500 bg-primary-50' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      {showCheckbox && (
        <div className="absolute top-4 right-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={handleCheckboxChange}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">
            #{pregunta.correlativo}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {showFramework && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                {pregunta.framework_codigo}
              </span>
              <span className="text-xs text-gray-500">
                {pregunta.codigo_control}
              </span>
            </div>
          )}

          {pregunta.seccion_general && (
            <p className="text-xs text-gray-500 mb-1">
              {pregunta.seccion_general}
            </p>
          )}

          <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
            {pregunta.nombre_control}
          </h4>

          <p className="text-sm text-gray-700 mb-3 line-clamp-3">
            {pregunta.pregunta}
          </p>

          <div className="flex items-center gap-2">
            <NivelMadurezBadge nivel={pregunta.nivel_madurez as 1 | 2 | 3 | 4 | 5} />
          </div>
        </div>
      </div>
    </div>
  );
};