// src/pages/reportes/components/ModalDetalleDimensiones.tsx

import React from 'react';
import { X } from 'lucide-react';
import { Card } from '@/components/common';

interface Dimension {
  dimension: {
    id: string;
    codigo: string;
    nombre: string;
  };
  nivel_deseado: number;
  nivel_actual_promedio: number;
  gap_promedio: number;
  clasificacion_gap?: string;
  porcentaje_cumplimiento_promedio: number;
}

interface ModalDetalleDimensionesProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  dimensiones: Dimension[];
  tipo: 'nivel' | 'clasificacion';
}

export const ModalDetalleDimensiones: React.FC<ModalDetalleDimensionesProps> = ({
  isOpen,
  onClose,
  title,
  dimensiones,
  tipo,
}) => {
  if (!isOpen) return null;

  const getGapColor = (gap: number) => {
    if (gap >= 2) return 'bg-red-100 text-red-800';
    if (gap >= 1) return 'bg-orange-100 text-orange-800';
    if (gap > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getClasificacionColor = (clasificacion?: string) => {
    switch (clasificacion) {
      case 'critico':
        return 'bg-red-100 text-red-800';
      case 'alto':
        return 'bg-orange-100 text-orange-800';
      case 'medio':
        return 'bg-yellow-100 text-yellow-800';
      case 'bajo':
        return 'bg-blue-100 text-blue-800';
      case 'cumplido':
        return 'bg-green-100 text-green-800';
      case 'superado':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {dimensiones.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No hay dimensiones en esta categoría
              </div>
            ) : (
              dimensiones.map((dim) => (
                <div
                  key={dim.dimension.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-500">
                          {dim.dimension.codigo}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tipo === 'clasificacion'
                              ? getClasificacionColor(dim.clasificacion_gap)
                              : getGapColor(dim.gap_promedio)
                          }`}
                        >
                          {tipo === 'clasificacion'
                            ? dim.clasificacion_gap?.toUpperCase()
                            : `GAP: ${dim.gap_promedio.toFixed(1)}`}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900">{dim.dimension.nombre}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Nivel Deseado</p>
                      <p className="font-semibold text-blue-600">
                        {dim.nivel_deseado.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Nivel Actual</p>
                      <p className="font-semibold text-green-600">
                        {dim.nivel_actual_promedio.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Brecha (GAP)</p>
                      <p
                        className={`font-semibold ${
                          dim.gap_promedio >= 2
                            ? 'text-red-600'
                            : dim.gap_promedio >= 1
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}
                      >
                        {dim.gap_promedio.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Cumplimiento</p>
                      <p className="font-semibold text-purple-600">
                        {dim.porcentaje_cumplimiento_promedio.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Total de dimensiones: <span className="font-semibold">{dimensiones.length}</span>
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};