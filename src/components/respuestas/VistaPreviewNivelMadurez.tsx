// src/components/respuestas/VistaPreviewNivelMadurez.tsx

import React from 'react';
import { getNivelInfo } from './types';

interface VistaPreviewNivelMadurezProps {
  nivelMadurez: number;
}

export const VistaPreviewNivelMadurez: React.FC<VistaPreviewNivelMadurezProps> = ({
  nivelMadurez
}) => {
  const info = getNivelInfo(nivelMadurez);

  return (
    <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
      <div className="flex items-center gap-2">
        <span className={`text-2xl font-bold ${info.color}`}>
          {info.label}
        </span>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${info.color}`}>
            {info.descripcion}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className={`h-2 rounded-full transition-all ${
                nivelMadurez >= 4.5 ? 'bg-green-500' :
                nivelMadurez >= 3.5 ? 'bg-blue-500' :
                nivelMadurez >= 2.5 ? 'bg-yellow-500' :
                nivelMadurez >= 1.5 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${(nivelMadurez / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};