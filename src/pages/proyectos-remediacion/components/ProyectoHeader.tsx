// src/pages/proyectos-remediacion/components/ProyectoHeader.tsx

import React from 'react';
import { ArrowLeft, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common';
import { useNavigate } from 'react-router-dom';
import { ProyectoRemediacionDetail } from '@/types/proyecto-remediacion.types';

interface ProyectoHeaderProps {
  proyecto: ProyectoRemediacionDetail;
}

export const ProyectoHeader: React.FC<ProyectoHeaderProps> = ({ proyecto }) => {
  const navigate = useNavigate();

  const getEstadoColor = (estado: string) => {
    const colores = {
      planificado: 'bg-blue-100 text-blue-800 border-blue-300',
      en_ejecucion: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      en_validacion: 'bg-purple-100 text-purple-800 border-purple-300',
      cerrado: 'bg-green-100 text-green-800 border-green-300',
      suspendido: 'bg-orange-100 text-orange-800 border-orange-300',
      cancelado: 'bg-red-100 text-red-800 border-red-300',
    };
    return colores[estado as keyof typeof colores] || 'bg-gray-100 text-gray-800';
  };

  const getPrioridadColor = (prioridad: string) => {
    const colores = {
      critica: 'text-red-600',
      alta: 'text-orange-600',
      media: 'text-yellow-600',
      baja: 'text-green-600',
    };
    return colores[prioridad as keyof typeof colores] || 'text-gray-600';
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Navegación */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-mono text-gray-500">{proyecto.codigo_proyecto}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(proyecto.estado)}`}>
                {proyecto.estado_display}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{proyecto.nombre_proyecto}</h1>
            <p className="text-gray-600 mt-1">{proyecto.descripcion}</p>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-12 bg-red-600 rounded-full" />
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Prioridad</p>
              <p className={`text-sm font-bold ${getPrioridadColor(proyecto.prioridad)}`}>
                {proyecto.prioridad_display}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-12 bg-blue-600 rounded-full" />
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Categoría</p>
              <p className="text-sm font-bold text-gray-900">{proyecto.categoria_display}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-12 bg-green-600 rounded-full" />
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Progreso Tiempo</p>
              <p className="text-sm font-bold text-green-600">
                {proyecto.porcentaje_tiempo_transcurrido.toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-12 bg-purple-600 rounded-full" />
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Días Restantes</p>
              <p className={`text-sm font-bold ${proyecto.esta_vencido ? 'text-red-600' : 'text-purple-600'}`}>
                {proyecto.esta_vencido ? 'Vencido' : `${proyecto.dias_restantes}d`}
              </p>
            </div>
          </div>
        </div>

        {/* Alerta de vencido */}
        {proyecto.esta_vencido && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-900">Proyecto Vencido</p>
              <p className="text-xs text-red-700">
                La fecha estimada de fin era {new Date(proyecto.fecha_fin_estimada).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};