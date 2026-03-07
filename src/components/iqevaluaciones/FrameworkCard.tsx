// src/components/evaluaciones/FrameworkCard.tsx

import { FileText, Calendar } from 'lucide-react';
import type { Framework } from '@/types/iqevaluaciones.types';

interface FrameworkCardProps {
  framework: Framework;
  onClick?: () => void;
  selected?: boolean;
  showCheckbox?: boolean;
  onSelect?: (selected: boolean) => void;
}

export const FrameworkCard: React.FC<FrameworkCardProps> = ({
  framework,
  onClick,
  selected = false,
  showCheckbox = false,
  onSelect,
}) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect?.(e.target.checked);
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border-2 transition-all cursor-pointer
        ${selected 
          ? 'border-primary-500 bg-primary-50' 
          : 'border-gray-200 bg-white hover:border-primary-200 hover:shadow-md'
        }
      `}
    >
      {showCheckbox && (
        <div className="absolute top-4 right-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={handleCheckboxChange}
            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="p-3 bg-primary-100 rounded-lg">
          <FileText className="text-primary-600" size={24} />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {framework.nombre}
          </h3>
          
          <p className="text-sm text-gray-600 mb-2">
            Código: <span className="font-medium">{framework.codigo}</span>
          </p>

          {framework.version && (
            <p className="text-xs text-gray-500 mb-2">
              Versión {framework.version}
            </p>
          )}

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <FileText size={16} />
              <span className="font-medium">{framework.total_preguntas}</span>
              <span className="text-xs">preguntas</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={14} />
              {new Date(framework.fecha_creacion).toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>
      </div>

      {framework.descripcion && (
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
          {framework.descripcion}
        </p>
      )}
    </div>
  );
};