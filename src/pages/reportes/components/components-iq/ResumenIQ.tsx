// src/pages/reportes/components-iq/ResumenIQ.tsx

import React from 'react';
import { Target, TrendingUp, AlertTriangle, Users, Layers, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/common';
import type { ResumenIQ as ResumenIQType, InfoEvaluacionIQ } from '@/types/reporte-iq.types';

interface ResumenIQProps {
  resumen:    ResumenIQType;
  evaluacion: InfoEvaluacionIQ;
}

export const ResumenIQ: React.FC<ResumenIQProps> = ({ resumen, evaluacion }) => {
  const getGapColor = (gap: number) => {
    if (gap >= 3) return 'text-red-600 bg-red-100';
    if (gap >= 2) return 'text-orange-600 bg-orange-100';
    if (gap >= 1) return 'text-yellow-600 bg-yellow-100';
    if (gap > 0)  return 'text-blue-600 bg-blue-100';
    return 'text-green-600 bg-green-100';
  };

  const getGapLabel = (gap: number) => {
    if (gap >= 3) return 'Crítico — acción inmediata';
    if (gap >= 2) return 'Alto — requiere atención';
    if (gap >= 1) return 'Medio — en seguimiento';
    if (gap > 0)  return 'Bajo — en buen camino';
    return 'Sin brecha';
  };

  return (
    <div className="space-y-4">
      {/* Frameworks usados */}
      <div className="flex flex-wrap gap-2">
        {evaluacion.frameworks.map(fw => (
          <span
            key={fw.id}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full border border-indigo-200"
          >
            <Layers size={12} />
            {fw.nombre}
          </span>
        ))}
      </div>

      {/* Tarjetas métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Nivel Deseado */}
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Nivel Deseado</p>
              <p className="text-3xl font-bold text-blue-600 mb-1">
                {resumen.nivel_deseado_promedio.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">{evaluacion.nivel_deseado_display}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
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
              <p className="text-xs text-gray-500">Promedio de secciones</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        {/* GAP */}
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Brecha (GAP)</p>
              <p className={`text-3xl font-bold mb-1 ${getGapColor(resumen.gap_promedio).split(' ')[0]}`}>
                {resumen.gap_promedio.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">{getGapLabel(resumen.gap_promedio)}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${getGapColor(resumen.gap_promedio)}`}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </Card>

        {/* Usuarios */}
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Evaluados</p>
              <p className="text-3xl font-bold text-purple-600 mb-1">{resumen.total_usuarios}</p>
              <p className="text-xs text-gray-500">
                {resumen.total_secciones} secciones · {resumen.total_frameworks} frameworks
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Barra de cumplimiento */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <ShieldCheck size={20} className="text-primary-600 shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-700">Cumplimiento general</span>
              <span className="text-sm font-bold text-primary-600">
                {resumen.porcentaje_cumplimiento_promedio.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary-600 h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${resumen.porcentaje_cumplimiento_promedio}%` }}
              />
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500">Brechas</p>
            <p className="text-sm font-bold text-red-600">{resumen.secciones_con_brecha}</p>
            <p className="text-xs text-gray-400">de {resumen.total_secciones}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};