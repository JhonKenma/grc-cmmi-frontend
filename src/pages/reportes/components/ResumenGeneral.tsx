// src/pages/reportes/components/ResumenGeneral.tsx

import React from 'react';
import { Target, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { Card } from '@/components/common';

interface ResumenGeneralProps {
  resumen: {
    total_dimensiones: number;
    dimensiones_evaluadas: number;
    total_usuarios: number;
    nivel_deseado_promedio: number;
    nivel_actual_promedio: number;
    gap_promedio: number;
    porcentaje_cumplimiento_promedio: number;
  };
}

export const ResumenGeneral: React.FC<ResumenGeneralProps> = ({ resumen }) => {
  const getGapColor = (gap: number) => {
    if (gap >= 2) return 'text-red-600 bg-red-100';
    if (gap >= 1) return 'text-orange-600 bg-orange-100';
    if (gap > 0) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getGapIcon = (gap: number) => {
    if (gap >= 1) return <AlertTriangle size={20} />;
    return <TrendingUp size={20} />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Nivel Deseado */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Nivel Deseado</p>
            <p className="text-3xl font-bold text-blue-600 mb-1">
              {resumen.nivel_deseado_promedio.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">Meta establecida</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target size={24} className="text-blue-600" />
          </div>
        </div>
      </Card>

      {/* Nivel Actual */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Nivel Actual</p>
            <p className="text-3xl font-bold text-green-600 mb-1">
              {resumen.nivel_actual_promedio.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">Nivel alcanzado</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp size={24} className="text-green-600" />
          </div>
        </div>
      </Card>

      {/* GAP Promedio */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Brecha (GAP)</p>
            <p className={`text-3xl font-bold mb-1 ${getGapColor(resumen.gap_promedio).split(' ')[0]}`}>
              {resumen.gap_promedio.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">
              {resumen.gap_promedio >= 2
                ? 'Crítico - Acción urgente'
                : resumen.gap_promedio >= 1
                ? 'Medio - Requiere atención'
                : 'Bajo - En buen camino'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getGapColor(resumen.gap_promedio)}`}>
            {getGapIcon(resumen.gap_promedio)}
          </div>
        </div>
      </Card>

      {/* Usuarios */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Colaboradores</p>
            <p className="text-3xl font-bold text-purple-600 mb-1">{resumen.total_usuarios}</p>
            <p className="text-xs text-gray-500">
              {resumen.dimensiones_evaluadas} de {resumen.total_dimensiones} dimensiones
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users size={24} className="text-purple-600" />
          </div>
        </div>
      </Card>
    </div>
  );
};