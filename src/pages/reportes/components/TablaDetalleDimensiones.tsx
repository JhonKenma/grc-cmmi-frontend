// src/pages/reportes/components/TablaDetalleDimensiones.tsx

import React, { useState } from 'react';
import { Card } from '@/components/common';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TablaDetalleDimensionesProps {
  dimensiones: Array<{
    dimension: {
      id: string;
      codigo: string;
      nombre: string;
      orden: number;
    };
    nivel_deseado: number;
    nivel_actual_promedio: number;
    gap_promedio: number;
    porcentaje_cumplimiento_promedio: number;
    total_usuarios_evaluados: number;
    usuarios: Array<{
      usuario_id: number;
      usuario_nombre: string;
      nivel_actual: number;
      gap: number;
      clasificacion_gap: string;
      clasificacion_gap_display: string;
      porcentaje_cumplimiento: number;
      total_preguntas: number;
      respuestas: {
        si_cumple: number;
        cumple_parcial: number;
        no_cumple: number;
        no_aplica: number;
      };
    }>;
  }>;
}

export const TablaDetalleDimensiones: React.FC<TablaDetalleDimensionesProps> = ({
  dimensiones,
}) => {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  const toggleDimension = (dimensionId: string) => {
    setExpandedDimension(expandedDimension === dimensionId ? null : dimensionId);
  };

  const getGapBadgeColor = (gap: number) => {
    if (gap >= 2) return 'bg-red-100 text-red-800';
    if (gap >= 1) return 'bg-orange-100 text-orange-800';
    if (gap > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Detalle por Dimensión</h3>
        <p className="text-sm text-gray-600 mt-1">
          Click en una dimensión para ver el detalle de usuarios
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dimensión
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nivel Deseado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nivel Actual
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                GAP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cumplimiento
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuarios
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dimensiones.map((dim) => (
              <React.Fragment key={dim.dimension.id}>
                {/* Fila principal */}
                <tr
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => toggleDimension(dim.dimension.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <button className="mr-2 text-gray-400 hover:text-gray-600">
                        {expandedDimension === dim.dimension.id ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )}
                      </button>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {dim.dimension.nombre}
                        </div>
                        <div className="text-xs text-gray-500">{dim.dimension.codigo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      {dim.nivel_deseado.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      {dim.nivel_actual_promedio.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGapBadgeColor(
                        dim.gap_promedio
                      )}`}
                    >
                      {dim.gap_promedio.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${dim.porcentaje_cumplimiento_promedio}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 min-w-[45px]">
                        {dim.porcentaje_cumplimiento_promedio.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {dim.total_usuarios_evaluados}
                    </span>
                  </td>
                </tr>

                {/* Detalle de usuarios (expandible) */}
                {expandedDimension === dim.dimension.id && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          Usuarios asignados a esta dimensión:
                        </h4>
                        {dim.usuarios.map((usuario) => (
                          <div
                            key={usuario.usuario_id}
                            className="bg-white rounded-lg p-4 border border-gray-200"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                              <div className="md:col-span-2">
                                <p className="text-sm font-medium text-gray-900">
                                  {usuario.usuario_nombre}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {usuario.total_preguntas} preguntas
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-600 mb-1">Nivel</p>
                                <p className="text-sm font-semibold text-green-600">
                                  {usuario.nivel_actual.toFixed(1)}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-600 mb-1">GAP</p>
                                <p
                                  className={`text-sm font-semibold ${
                                    usuario.gap >= 2
                                      ? 'text-red-600'
                                      : usuario.gap >= 1
                                      ? 'text-orange-600'
                                      : 'text-green-600'
                                  }`}
                                >
                                  {usuario.gap.toFixed(1)}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-600 mb-1">Cumplimiento</p>
                                <p className="text-sm font-semibold text-blue-600">
                                  {usuario.porcentaje_cumplimiento.toFixed(0)}%
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-600 mb-1">Respuestas</p>
                                <div className="flex gap-1 justify-center text-xs">
                                  <span className="text-green-600">
                                    ✓{usuario.respuestas.si_cumple}
                                  </span>
                                  <span className="text-blue-600">
                                    ~{usuario.respuestas.cumple_parcial}
                                  </span>
                                  <span className="text-red-600">
                                    ✗{usuario.respuestas.no_cumple}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};