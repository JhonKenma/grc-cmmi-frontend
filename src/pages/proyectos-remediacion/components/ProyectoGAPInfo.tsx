// src/pages/proyectos-remediacion/components/ProyectoGAPInfo.tsx

import React from 'react';
import { Card } from '@/components/common';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { ProyectoRemediacionDetail } from '@/types/proyecto-remediacion.types';

interface ProyectoGAPInfoProps {
  proyecto: ProyectoRemediacionDetail;
}

export const ProyectoGAPInfo: React.FC<ProyectoGAPInfoProps> = ({ proyecto }) => {
  const getClasificacionColor = (clasificacion: string) => {
    const colores = {
      critico: 'text-red-600 bg-red-100',
      alto: 'text-orange-600 bg-orange-100',
      medio: 'text-yellow-600 bg-yellow-100',
      bajo: 'text-blue-600 bg-blue-100',
    };
    return colores[clasificacion as keyof typeof colores] || 'text-gray-600 bg-gray-100';
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={20} className="text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">Brecha (GAP) Original</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información de la dimensión */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Dimensión Afectada</h4>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Nombre</p>
              <p className="text-sm font-medium text-gray-900">{proyecto.dimension_nombre}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Control No Conforme</p>
              <p className="text-sm text-gray-900">{proyecto.control_no_conforme}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Normativa</p>
              <p className="text-sm text-gray-900">{proyecto.normativa_display}</p>
            </div>
          </div>
        </div>

        {/* Métricas del GAP */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Métricas del GAP</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">GAP Identificado</p>
                <p className="text-2xl font-bold text-red-600">{proyecto.gap_original.toFixed(2)}</p>
              </div>
              <TrendingUp size={24} className="text-red-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600">Nivel Actual</p>
                <p className="text-lg font-bold text-blue-600">{proyecto.nivel_actual_original.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600">Nivel Deseado</p>
                <p className="text-lg font-bold text-green-600">{proyecto.nivel_deseado_original.toFixed(1)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Criticidad</p>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getClasificacionColor(proyecto.calculo_nivel_info.clasificacion_gap)}`}>
                Nivel {proyecto.nivel_criticidad_original} - {proyecto.calculo_nivel_info.clasificacion_gap_display}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Impacto del Riesgo */}
      <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <h4 className="text-sm font-semibold text-orange-900 mb-2">Impacto del Riesgo</h4>
        <p className="text-sm text-orange-800">{proyecto.impacto_riesgo}</p>
      </div>

      {/* Tipo de Brecha */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs text-gray-500">Tipo de Brecha:</span>
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
          {proyecto.tipo_brecha_display}
        </span>
      </div>
    </Card>
  );
};