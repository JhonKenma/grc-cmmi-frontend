// src/pages/proyectos-remediacion/components/ProyectoTimeline.tsx

import React from 'react';
import { Card } from '@/components/common';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { ProyectoRemediacionDetail } from '@/types/proyecto-remediacion.types';

interface ProyectoTimelineProps {
  proyecto: ProyectoRemediacionDetail;
}

export const ProyectoTimeline: React.FC<ProyectoTimelineProps> = ({ proyecto }) => {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={20} className="text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Timeline del Proyecto</h3>
      </div>

      {/* Barra de progreso visual */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso Temporal</span>
          <span className="text-sm font-semibold text-blue-600">
            {proyecto.porcentaje_tiempo_transcurrido.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all ${
              proyecto.esta_vencido ? 'bg-red-600' : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(proyecto.porcentaje_tiempo_transcurrido, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">
            {new Date(proyecto.fecha_inicio).toLocaleDateString('es-ES')}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(proyecto.fecha_fin_estimada).toLocaleDateString('es-ES')}
          </span>
        </div>
      </div>

      {/* Fechas clave */}
      <div className="space-y-4">
        {/* Fecha de identificación */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Clock size={16} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">GAP Identificado</p>
            <p className="text-xs text-gray-600">
              {new Date(proyecto.fecha_identificacion_gap).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Fecha de inicio */}
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Calendar size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Inicio del Proyecto</p>
            <p className="text-xs text-gray-600">
              {new Date(proyecto.fecha_inicio).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Fecha estimada de fin */}
        <div className={`flex items-start gap-3 p-3 rounded-lg ${
          proyecto.esta_vencido ? 'bg-red-50' : 'bg-green-50'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            proyecto.esta_vencido ? 'bg-red-600' : 'bg-green-600'
          }`}>
            <Calendar size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Fecha Estimada de Fin</p>
            <p className="text-xs text-gray-600">
              {new Date(proyecto.fecha_fin_estimada).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            {proyecto.esta_vencido && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ Proyecto vencido hace {Math.abs(proyecto.dias_restantes)} días
              </p>
            )}
          </div>
        </div>

        {/* Fecha de cierre (si aplica) */}
        {proyecto.fecha_cierre_formal && (
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Cierre Formal</p>
              <p className="text-xs text-gray-600">
                {new Date(proyecto.fecha_cierre_formal).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Duración total */}
      <div className="mt-4 p-3 bg-purple-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-purple-900">Duración Estimada</span>
          <span className="text-sm font-bold text-purple-600">
            {proyecto.duracion_estimada_dias} días
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-purple-700">Días Transcurridos</span>
          <span className="text-xs font-semibold text-purple-600">
            {proyecto.dias_transcurridos} días
          </span>
        </div>
      </div>
    </Card>
  );
};