// src/pages/proyectos-remediacion/components/ProyectoGAPInfo.tsx

import React from 'react';
import { Card } from '@/components/common';
import { AlertTriangle, TrendingUp, Target, Shield, ArrowRight } from 'lucide-react';
import { ProyectoRemediacionDetail } from '@/types/proyecto-remediacion.types';

interface ProyectoGAPInfoProps {
  proyecto: ProyectoRemediacionDetail;
}

export const ProyectoGAPInfo: React.FC<ProyectoGAPInfoProps> = ({ proyecto }) => {
  const getClasificacionColor = (clasificacion: string) => {
    const colores: Record<string, string> = {
      critico: 'text-red-700 bg-red-100 border-red-200 ring-red-500/20',
      alto: 'text-orange-700 bg-orange-100 border-orange-200 ring-orange-500/20',
      medio: 'text-yellow-700 bg-yellow-100 border-yellow-200 ring-yellow-500/20',
      bajo: 'text-blue-700 bg-blue-100 border-blue-200 ring-blue-500/20',
    };
    return colores[clasificacion.toLowerCase()] || 'text-gray-600 bg-gray-100 border-gray-200';
  };

  const nivelInfo = proyecto.calculo_nivel_info;

  return (
    <Card className="overflow-hidden border-l-4 border-l-orange-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-50 rounded-lg">
            <AlertTriangle size={20} className="text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Diagnóstico del GAP Original</h3>
            <p className="text-xs text-gray-500 italic">Estado inicial detectado en el autodiagnóstico</p>
          </div>
        </div>
        {nivelInfo?.clasificacion_gap && (
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm ring-4 ${
            getClasificacionColor(nivelInfo.clasificacion_gap)
          }`}>
            Prioridad: {nivelInfo.clasificacion_gap_display || nivelInfo.clasificacion_gap}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información de Contexto */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm hover:bg-white transition-colors">
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              <Shield size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Dimensión Evaluada</span>
            </div>
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {proyecto.dimension_nombre || 'No especificado'}
            </p>
            <p className="mt-1 text-xs font-mono text-blue-600 font-semibold bg-blue-50 inline-block px-2 py-0.5 rounded">
              COD: {nivelInfo?.dimension_codigo || 'N/A'}
            </p>
          </div>

          <div className="p-4 bg-red-50 rounded-xl border border-red-100 relative overflow-hidden group">
            <TrendingUp size={48} className="absolute -right-2 -bottom-2 text-red-200/50 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider">GAP a Cerrar</span>
            <p className="text-3xl font-black text-red-600 mt-1">
              {proyecto.gap_original?.toFixed(2) ?? '0.00'}
            </p>
          </div>
        </div>

        {/* Comparativa de Niveles */}
        <div className="lg:col-span-2 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-4 relative">
            {/* Flecha conectora visual (solo en desktop) */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 border shadow-sm">
              <ArrowRight size={20} className="text-gray-400" />
            </div>

            <div className="p-5 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Nivel Inicial</span>
              <p className="text-4xl font-black text-gray-400 italic">
                {nivelInfo?.nivel_actual?.toFixed(1) ?? '0.0'}
              </p>
            </div>

            <div className="p-5 bg-green-50 border-2 border-green-200 rounded-2xl text-center shadow-sm">
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest block mb-1">Nivel Objetivo</span>
              <p className="text-4xl font-black text-green-600">
                {nivelInfo?.nivel_deseado?.toFixed(1) ?? '0.0'}
              </p>
            </div>
          </div>

          {/* Cumplimiento */}
          {nivelInfo?.porcentaje_cumplimiento !== undefined && (
            <div className="mt-6">
              <div className="flex items-end justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-blue-600" />
                  <span className="text-xs font-bold text-gray-700 uppercase">Cumplimiento Actual</span>
                </div>
                <span className="text-xl font-black text-blue-600">
                  {nivelInfo.porcentaje_cumplimiento.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 p-1 shadow-inner">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-green-500 transition-all duration-1000 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  style={{ width: `${Math.max(nivelInfo.porcentaje_cumplimiento, 5)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
        {nivelInfo?.calculado_at && (
          <p className="text-[10px] text-gray-400 font-medium">
            Sincronizado con autodiagnóstico del: {new Date(nivelInfo.calculado_at).toLocaleDateString('es-PE', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        )}
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
      </div>
    </Card>
  );
};