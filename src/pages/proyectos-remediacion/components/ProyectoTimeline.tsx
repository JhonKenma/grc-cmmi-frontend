// src/pages/proyectos-remediacion/components/ProyectoTimeline.tsx

import React from 'react';
import { Card } from '@/components/common';
import { Calendar, Clock, CheckCircle, TrendingUp, Hourglass } from 'lucide-react';
import { ProyectoRemediacionDetail } from '@/types/proyecto-remediacion.types';

interface ProyectoTimelineProps {
  proyecto: ProyectoRemediacionDetail;
}

export const ProyectoTimeline: React.FC<ProyectoTimelineProps> = ({ proyecto }) => {
  // Aseguramos valores numéricos mínimos para evitar divisiones por cero o visuales de 0%
  const diasTranscurridos = proyecto.dias_transcurridos ?? 0;
  const diasRestantes = proyecto.dias_restantes ?? 0;
  const duracionEstimada = proyecto.duracion_estimada_dias ?? 1; // Mínimo 1 para evitar NaN
  
  // Si el proyecto ya inició, mostramos al menos 1% para indicar actividad
  let porcentajeTranscurrido = proyecto.porcentaje_tiempo_transcurrido ?? 0;
  if (porcentajeTranscurrido === 0 && diasTranscurridos >= 0 && !proyecto.fecha_fin_real) {
    porcentajeTranscurrido = 1; 
  }

  const esEstadoValidacion = proyecto.estado === 'en_validacion';

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Timeline del Proyecto</h3>
        </div>
        {esEstadoValidacion && (
          <span className="flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">
            <Hourglass size={12} />
            En Revisión
          </span>
        )}
      </div>

      {/* Barra de progreso visual */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso Temporal</span>
          <span className={`text-sm font-semibold ${proyecto.esta_vencido ? 'text-red-600' : 'text-blue-600'}`}>
            {porcentajeTranscurrido.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ${
              proyecto.fecha_fin_real ? 'bg-green-500' : 
              proyecto.esta_vencido ? 'bg-red-600' : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(porcentajeTranscurrido, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500 font-medium">
            Inicio: {new Date(proyecto.fecha_inicio).toLocaleDateString('es-PE')}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            Fin: {new Date(proyecto.fecha_fin_estimada).toLocaleDateString('es-PE')}
          </span>
        </div>
      </div>

      {/* Fechas clave */}
      <div className="space-y-4">
        {/* Proyecto Creado */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
            <Clock size={16} className="text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Registro en Sistema</p>
            <p className="text-xs text-gray-600">
              {new Date(proyecto.fecha_creacion).toLocaleString('es-PE', {
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Hito de Validación (Aparece dinámicamente) */}
        {esEstadoValidacion && (
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Hourglass size={16} className="text-white animate-spin-slow" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">Esperando Aprobación</p>
              <p className="text-xs text-amber-700">
                La solicitud de cierre fue enviada. El tiempo transcurrido se detendrá al aprobarse.
              </p>
            </div>
          </div>
        )}

        {/* Fecha estimada de fin / Vencimiento */}
        <div className={`flex items-start gap-3 p-3 rounded-lg border ${
          proyecto.esta_vencido ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
            proyecto.esta_vencido ? 'bg-red-600' : 'bg-blue-600'
          }`}>
            <TrendingUp size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Límite de Ejecución</p>
            <p className="text-xs text-gray-600">
              {new Date(proyecto.fecha_fin_estimada).toLocaleDateString('es-PE', {
                day: '2-digit', month: 'long', year: 'numeric'
              })}
            </p>
            {proyecto.esta_vencido ? (
              <p className="text-xs text-red-600 font-bold mt-1 uppercase tracking-tight">
                ⚠️ Retraso de {Math.abs(diasRestantes)} días
              </p>
            ) : (
              <p className="text-xs text-blue-700 font-medium mt-1">
                ⏰ Quedan {diasRestantes} días de plazo
              </p>
            )}
          </div>
        </div>

        {/* Fecha de cierre real */}
        {proyecto.fecha_fin_real && (
          <div className="flex items-start gap-3 p-3 bg-green-600 rounded-lg shadow-md transform scale-[1.02] transition-transform">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <div className="flex-1 text-white">
              <p className="text-sm font-bold">Cierre Confirmado</p>
              <p className="text-xs opacity-90">
                {new Date(proyecto.fecha_fin_real).toLocaleDateString('es-PE', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas inferiores */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="text-center p-2 bg-gray-50 rounded-md border border-gray-100">
          <p className="text-[10px] uppercase font-bold text-gray-500">Total</p>
          <p className="text-sm font-bold text-gray-800">{duracionEstimada}d</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-md border border-gray-100">
          <p className="text-[10px] uppercase font-bold text-gray-500">Uso</p>
          <p className="text-sm font-bold text-blue-600">{diasTranscurridos}d</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-md border border-gray-100">
          <p className="text-[10px] uppercase font-bold text-gray-500">Resto</p>
          <p className={`text-sm font-bold ${proyecto.esta_vencido ? 'text-red-600' : 'text-green-600'}`}>
            {proyecto.esta_vencido ? 0 : diasRestantes}d
          </p>
        </div>
      </div>
    </Card>
  );
};