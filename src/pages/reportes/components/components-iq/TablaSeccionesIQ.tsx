// src/pages/reportes/components-iq/TablaSeccionesIQ.tsx

import React, { useState } from 'react';
import { Card } from '@/components/common';
import {
  ChevronDown, ChevronRight, CheckCircle, AlertCircle,
  Tag, Users,
} from 'lucide-react';
import type { SeccionGAPData, UsuarioEnSeccionIQ } from '@/types/reporte-iq.types';

interface TablaSeccionesIQProps {
  secciones: SeccionGAPData[];
}

const GAP_BADGE: Record<string, string> = {
  critico:  'bg-red-100 text-red-800 border-red-200',
  alto:     'bg-orange-100 text-orange-800 border-orange-200',
  medio:    'bg-yellow-100 text-yellow-800 border-yellow-200',
  bajo:     'bg-blue-100 text-blue-800 border-blue-200',
  cumplido: 'bg-green-100 text-green-800 border-green-200',
  superado: 'bg-purple-100 text-purple-800 border-purple-200',
};

const FW_COLORS = [
  'bg-indigo-100 text-indigo-800',
  'bg-teal-100 text-teal-800',
  'bg-pink-100 text-pink-800',
  'bg-amber-100 text-amber-800',
  'bg-cyan-100 text-cyan-800',
];

export const TablaSeccionesIQ: React.FC<TablaSeccionesIQProps> = ({ secciones }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Color por framework_id
  const fwColorMap: Record<number, string> = {};
  let colorIdx = 0;
  secciones.forEach(s => {
    if (!(s.seccion.framework_id in fwColorMap)) {
      fwColorMap[s.seccion.framework_id] = FW_COLORS[colorIdx % FW_COLORS.length];
      colorIdx++;
    }
  });

  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Detalle por Sección</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Haz clic en una sección para ver el detalle por usuario
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Sección / Framework', 'Nivel Deseado', 'Nivel Actual', 'GAP', 'Cumplimiento', 'Usuarios'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {secciones.map(sec => {
              const isExpanded = expanded === sec.seccion.id;
              const fwColor    = fwColorMap[sec.seccion.framework_id] || FW_COLORS[0];

              return (
                <React.Fragment key={sec.seccion.id}>
                  {/* Fila principal */}
                  <tr
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggle(sec.seccion.id)}
                  >
                    {/* Sección + Framework */}
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        <button className="text-gray-400 mt-0.5 shrink-0">
                          {isExpanded
                            ? <ChevronDown size={17} />
                            : <ChevronRight size={17} />
                          }
                        </button>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 leading-snug">
                            {sec.seccion.nombre}
                          </p>
                          <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${fwColor}`}>
                            <Tag size={10} />
                            {sec.seccion.framework_nombre}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Nivel Deseado */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">
                        {sec.nivel_deseado.toFixed(1)}
                      </span>
                    </td>

                    {/* Nivel Actual */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-8 rounded-full bg-green-100 text-green-800 text-sm font-bold">
                        {sec.nivel_actual_promedio.toFixed(1)}
                      </span>
                    </td>

                    {/* GAP */}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${GAP_BADGE[sec.clasificacion_gap] || 'bg-gray-100 text-gray-700'}`}>
                        {sec.gap_promedio.toFixed(1)} · {sec.clasificacion_gap_display}
                      </span>
                    </td>

                    {/* Cumplimiento */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all"
                            style={{ width: `${sec.porcentaje_cumplimiento_promedio}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 min-w-[40px]">
                          {sec.porcentaje_cumplimiento_promedio.toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    {/* Usuarios */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <Users size={14} className="text-gray-400" />
                        {sec.total_usuarios_evaluados}
                      </span>
                    </td>
                  </tr>

                  {/* Detalle expandible */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                        {sec.usuarios.length === 0 ? (
                          <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                            <AlertCircle size={16} />
                            No hay usuarios evaluados en esta sección
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                              Resultados por usuario
                            </p>
                            {sec.usuarios.map((u: UsuarioEnSeccionIQ) => (
                              <div
                                key={u.usuario_id}
                                className="bg-white rounded-lg p-4 border border-gray-200 grid grid-cols-2 md:grid-cols-5 gap-4 items-center"
                              >
                                {/* Nombre */}
                                <div className="md:col-span-2">
                                  <p className="text-sm font-semibold text-gray-900">{u.usuario_nombre}</p>
                                  <p className="text-xs text-gray-400">{u.total_preguntas} preguntas</p>
                                </div>

                                {/* Nivel */}
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 mb-0.5">Nivel Actual</p>
                                  <p className="text-sm font-bold text-green-600">{u.nivel_actual.toFixed(1)}</p>
                                </div>

                                {/* GAP */}
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 mb-0.5">GAP</p>
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${GAP_BADGE[u.clasificacion_gap] || 'bg-gray-100 text-gray-700'}`}>
                                    {u.gap.toFixed(1)}
                                  </span>
                                </div>

                                {/* Respuestas */}
                                <div className="flex items-center justify-end gap-2 text-xs">
                                  <span className="text-green-600 font-medium">✓{u.respuestas.si_cumple}</span>
                                  <span className="text-blue-600 font-medium">~{u.respuestas.cumple_parcial}</span>
                                  <span className="text-red-600 font-medium">✗{u.respuestas.no_cumple}</span>
                                  {u.respuestas.no_aplica > 0 && (
                                    <span className="text-gray-400">N/A:{u.respuestas.no_aplica}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};