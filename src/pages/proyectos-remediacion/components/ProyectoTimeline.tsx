// src/pages/proyectos-remediacion/components/ProyectoTimeline.tsx

import React from 'react';
import { Card } from '@/components/common';
import { Calendar, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { ProyectoRemediacionDetail } from '@/types/proyecto-remediacion.types';

interface ProyectoTimelineProps {
  proyecto: ProyectoRemediacionDetail;
}

export const ProyectoTimeline: React.FC<ProyectoTimelineProps> = ({ proyecto }) => {
  // Calcular porcentaje de tiempo transcurrido de forma segura
  const porcentajeTranscurrido = proyecto.porcentaje_tiempo_transcurrido ?? 0;
  const diasTranscurridos = proyecto.dias_transcurridos ?? 0;
  const diasRestantes = proyecto.dias_restantes ?? 0;
  const duracionEstimada = proyecto.duracion_estimada_dias ?? 0;
  
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
            {porcentajeTranscurrido.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all ${
              proyecto.esta_vencido ? 'bg-red-600' : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(porcentajeTranscurrido, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">
            Inicio: {new Date(proyecto.fecha_inicio).toLocaleDateString('es-PE')}
          </span>
          <span className="text-xs text-gray-500">
            Fin estimado: {new Date(proyecto.fecha_fin_estimada).toLocaleDateString('es-PE')}
          </span>
        </div>
      </div>

      {/* Fechas clave */}
      <div className="space-y-4">
        {/* Fecha de creación del proyecto */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Clock size={16} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Proyecto Creado</p>
            <p className="text-xs text-gray-600">
              {new Date(proyecto.fecha_creacion).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Fecha de inicio */}
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Calendar size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Inicio del Proyecto</p>
            <p className="text-xs text-gray-600">
              {new Date(proyecto.fecha_inicio).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              📅 Hace {diasTranscurridos} días
            </p>
          </div>
        </div>

        {/* Fecha estimada de fin */}
        <div className={`flex items-start gap-3 p-3 rounded-lg border-2 ${
          proyecto.esta_vencido 
            ? 'bg-red-50 border-red-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            proyecto.esta_vencido ? 'bg-red-600' : 'bg-green-600'
          }`}>
            <TrendingUp size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Fecha Estimada de Fin</p>
            <p className="text-xs text-gray-600">
              {new Date(proyecto.fecha_fin_estimada).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            {proyecto.esta_vencido ? (
              <p className="text-xs text-red-600 font-semibold mt-1">
                ⚠️ Proyecto vencido hace {Math.abs(diasRestantes)} días
              </p>
            ) : (
              <p className="text-xs text-green-700 font-medium mt-1">
                ⏰ Faltan {diasRestantes} días
              </p>
            )}
          </div>
        </div>

        {/* Fecha de cierre real (si aplica) */}
        {proyecto.fecha_fin_real && (
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-2 border-green-300">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Cierre Real del Proyecto</p>
              <p className="text-xs text-gray-600">
                {new Date(proyecto.fecha_fin_real).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <p className="text-xs text-green-700 font-medium mt-1">
                ✅ Proyecto completado
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas de duración */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-xs text-purple-700 mb-1">Duración Estimada</p>
          <p className="text-lg font-bold text-purple-600">
            {duracionEstimada} días
          </p>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 mb-1">Días Transcurridos</p>
          <p className="text-lg font-bold text-blue-600">
            {diasTranscurridos} días
          </p>
        </div>

        <div className={`p-3 rounded-lg border ${
          proyecto.esta_vencido 
            ? 'bg-red-50 border-red-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <p className={`text-xs mb-1 ${
            proyecto.esta_vencido ? 'text-red-700' : 'text-green-700'
          }`}>
            {proyecto.esta_vencido ? 'Días de Retraso' : 'Días Restantes'}
          </p>
          <p className={`text-lg font-bold ${
            proyecto.esta_vencido ? 'text-red-600' : 'text-green-600'
          }`}>
            {proyecto.esta_vencido ? Math.abs(diasRestantes) : diasRestantes} días
          </p>
        </div>
      </div>

      {/* Última actualización */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Última actualización: {new Date(proyecto.fecha_actualizacion).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </Card>
  );
};