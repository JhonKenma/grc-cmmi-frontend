// src/pages/reportes/components-iq/TablaBrechasIQ.tsx

import React from 'react';
import { Card } from '@/components/common';
import { ShieldCheck, Tag, Users } from 'lucide-react';
import type { BrechaIQ } from '@/types/reporte-iq.types';

interface TablaBrechasIQProps {
  brechas: BrechaIQ[];
}

const COLORES: Record<string, string> = {
  critico: 'bg-red-100 text-red-800 border-red-200',
  alto:    'bg-orange-100 text-orange-800 border-orange-200',
  medio:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  bajo:    'bg-blue-100 text-blue-800 border-blue-200',
};
const ICONOS: Record<string, string> = {
  critico: '🔴', alto: '🟠', medio: '🟡', bajo: '🔵',
};

export const TablaBrechasIQ: React.FC<TablaBrechasIQProps> = ({ brechas }) => {
  if (brechas.length === 0) {
    return (
      <Card className="p-12 text-center">
        <ShieldCheck size={48} className="mx-auto text-green-500 mb-3" />
        <p className="text-lg font-semibold text-gray-800">¡Sin brechas significativas!</p>
        <p className="text-sm text-gray-500 mt-1">
          Todos los controles cumplen o superan el nivel deseado.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Brechas Identificadas</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {brechas.length} secciones requieren atención — ordenadas por prioridad
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="text-red-600 font-semibold">
            {brechas.filter(b => b.clasificacion_gap === 'critico').length} críticas
          </span>
          <span>·</span>
          <span className="text-orange-600 font-semibold">
            {brechas.filter(b => b.clasificacion_gap === 'alto').length} altas
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                'Prioridad', 'Sección', 'Framework',
                'N. Deseado', 'N. Actual', 'GAP',
                '% Cumpl.', 'No Cumple', 'Usuarios',
              ].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {brechas.map((brecha, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                {/* Prioridad */}
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${COLORES[brecha.clasificacion_gap] || 'bg-gray-100 text-gray-700'}`}>
                    {ICONOS[brecha.clasificacion_gap]} {brecha.clasificacion_gap_display}
                  </span>
                </td>

                {/* Sección */}
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900 max-w-[180px] leading-snug">
                    {brecha.seccion}
                  </p>
                </td>

                {/* Framework */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                    <Tag size={10} />
                    {brecha.framework_nombre}
                  </span>
                </td>

                {/* Nivel Deseado */}
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-10 h-7 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">
                    {brecha.nivel_deseado.toFixed(1)}
                  </span>
                </td>

                {/* Nivel Actual */}
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-10 h-7 rounded-full bg-green-100 text-green-800 text-sm font-bold">
                    {brecha.nivel_actual.toFixed(1)}
                  </span>
                </td>

                {/* GAP */}
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center justify-center w-10 h-7 rounded-full text-sm font-bold ${
                    brecha.gap >= 3 ? 'bg-red-100 text-red-800' :
                    brecha.gap >= 2 ? 'bg-orange-100 text-orange-800' :
                    brecha.gap >= 1 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {brecha.gap.toFixed(1)}
                  </span>
                </td>

                {/* Cumplimiento */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 min-w-[90px]">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full"
                        style={{ width: `${brecha.porcentaje_cumplimiento}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 min-w-[32px]">
                      {brecha.porcentaje_cumplimiento.toFixed(0)}%
                    </span>
                  </div>
                </td>

                {/* No Cumple */}
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-semibold text-red-600">
                    {brecha.respuestas_no_cumple}
                    <span className="text-gray-400 font-normal text-xs"> / {brecha.total_preguntas}</span>
                  </span>
                </td>

                {/* Usuarios */}
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                    <Users size={13} className="text-gray-400" />
                    {brecha.total_usuarios}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};