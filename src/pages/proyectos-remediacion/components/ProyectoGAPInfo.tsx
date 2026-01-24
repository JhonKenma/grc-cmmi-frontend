// src/pages/proyectos-remediacion/components/ProyectoGAPInfo.tsx

import React from 'react';
import { Card } from '@/components/common';
import { AlertTriangle, TrendingUp, Target } from 'lucide-react';
import { ProyectoRemediacionDetail } from '@/types/proyecto-remediacion.types';

interface ProyectoGAPInfoProps {
  proyecto: ProyectoRemediacionDetail;
}

export const ProyectoGAPInfo: React.FC<ProyectoGAPInfoProps> = ({ proyecto }) => {
  const getClasificacionColor = (clasificacion: string) => {
    const colores: Record<string, string> = {
      critico: 'text-red-600 bg-red-100 border-red-300',
      alto: 'text-orange-600 bg-orange-100 border-orange-300',
      medio: 'text-yellow-600 bg-yellow-100 border-yellow-300',
      bajo: 'text-blue-600 bg-blue-100 border-blue-300',
    };
    return colores[clasificacion.toLowerCase()] || 'text-gray-600 bg-gray-100 border-gray-300';
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={20} className="text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">Información del GAP Original</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información de la dimensión */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Dimensión Afectada</h4>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Nombre de la Dimensión</p>
              <p className="text-sm font-medium text-gray-900">
                {proyecto.dimension_nombre || 'No especificado'}
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Código de Dimensión</p>
              <p className="text-sm font-semibold text-blue-900">
                {proyecto.calculo_nivel_info?.dimension_codigo || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Métricas del GAP */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Métricas del GAP</h4>
          <div className="space-y-3">
            {/* GAP Identificado */}
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-2 border-red-200">
              <div>
                <p className="text-xs text-gray-600 mb-1">GAP Identificado</p>
                <p className="text-3xl font-bold text-red-600">
                  {proyecto.gap_original?.toFixed(2) ?? 'N/A'}
                </p>
              </div>
              <TrendingUp size={32} className="text-red-500" />
            </div>

            {/* Niveles */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Nivel Actual</p>
                <p className="text-2xl font-bold text-blue-600">
                  {proyecto.calculo_nivel_info?.nivel_actual?.toFixed(1) ?? 'N/A'}
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-gray-600 mb-1">Nivel Deseado</p>
                <p className="text-2xl font-bold text-green-600">
                  {proyecto.calculo_nivel_info?.nivel_deseado?.toFixed(1) ?? 'N/A'}
                </p>
              </div>
            </div>

            {/* Clasificación */}
            {proyecto.calculo_nivel_info?.clasificacion_gap && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">Clasificación del GAP</p>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${
                  getClasificacionColor(proyecto.calculo_nivel_info.clasificacion_gap)
                }`}>
                  {proyecto.calculo_nivel_info.clasificacion_gap_display || 
                   proyecto.calculo_nivel_info.clasificacion_gap}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Porcentaje de Cumplimiento */}
      {proyecto.calculo_nivel_info?.porcentaje_cumplimiento !== undefined && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-blue-600" />
              <h4 className="text-sm font-semibold text-gray-900">
                Porcentaje de Cumplimiento
              </h4>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {proyecto.calculo_nivel_info.porcentaje_cumplimiento.toFixed(1)}%
            </span>
          </div>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all"
              style={{ width: `${proyecto.calculo_nivel_info.porcentaje_cumplimiento}%` }}
            />
          </div>
        </div>
      )}

      {/* Fecha de Cálculo */}
      {proyecto.calculo_nivel_info?.calculado_at && (
        <div className="mt-4 text-xs text-gray-500">
          GAP calculado el: {new Date(proyecto.calculo_nivel_info.calculado_at).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )}
    </Card>
  );
};