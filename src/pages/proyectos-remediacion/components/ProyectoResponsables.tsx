// src/pages/proyectos-remediacion/components/ProyectoResponsables.tsx

import React from 'react';
import { Card } from '@/components/common';
import { Users, UserCheck, Shield, CheckSquare } from 'lucide-react';
import { ProyectoRemediacionDetail } from '@/types/proyecto-remediacion.types';

interface ProyectoResponsablesProps {
  proyecto: ProyectoRemediacionDetail;
}

export const ProyectoResponsables: React.FC<ProyectoResponsablesProps> = ({ proyecto }) => {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Users size={20} className="text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Responsables del Proyecto</h3>
      </div>

      <div className="space-y-4">
        {/* Dueño del Proyecto */}
        <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
              <Shield size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900">Dueño del Proyecto</p>
                <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded">
                  Accountable
                </span>
              </div>
              <p className="text-base font-medium text-gray-900">
                {proyecto.dueno_proyecto_info.nombre_completo}
              </p>
              <p className="text-sm text-gray-600">
                {proyecto.dueno_proyecto_info.email}
              </p>
              {proyecto.dueno_proyecto_info.cargo && (
                <p className="text-xs text-gray-500 mt-1 inline-flex items-center gap-1">
                  <span className="font-medium">Cargo:</span>
                  {proyecto.dueno_proyecto_info.cargo}
                </p>
              )}
              <p className="text-xs text-purple-700 mt-2 font-medium">
                📋 Responsable final del éxito del proyecto
              </p>
            </div>
          </div>
        </div>

        {/* Responsable de Implementación */}
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <UserCheck size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900">Responsable de Implementación</p>
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded">
                  Responsible
                </span>
              </div>
              <p className="text-base font-medium text-gray-900">
                {proyecto.responsable_implementacion_info.nombre_completo}
              </p>
              <p className="text-sm text-gray-600">
                {proyecto.responsable_implementacion_info.email}
              </p>
              {proyecto.responsable_implementacion_info.cargo && (
                <p className="text-xs text-gray-500 mt-1 inline-flex items-center gap-1">
                  <span className="font-medium">Cargo:</span>
                  {proyecto.responsable_implementacion_info.cargo}
                </p>
              )}
              <p className="text-xs text-blue-700 mt-2 font-medium">
                ⚙️ Ejecuta y coordina las actividades del proyecto
              </p>
            </div>
          </div>
        </div>

        {/* Validador Interno (opcional) */}
        {proyecto.validador_interno_info && (
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <CheckSquare size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900">Validador Interno</p>
                  <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-medium rounded">
                    Consulted
                  </span>
                </div>
                <p className="text-base font-medium text-gray-900">
                  {proyecto.validador_interno_info.nombre_completo}
                </p>
                <p className="text-sm text-gray-600">
                  {proyecto.validador_interno_info.email}
                </p>
                {proyecto.validador_interno_info.cargo && (
                  <p className="text-xs text-gray-500 mt-1 inline-flex items-center gap-1">
                    <span className="font-medium">Cargo:</span>
                    {proyecto.validador_interno_info.cargo}
                  </p>
                )}
                <p className="text-xs text-green-700 mt-2 font-medium">
                  ✓ Valida y aprueba entregables del proyecto
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Información adicional del creador */}
      {proyecto.creado_por_info && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-gray-500" />
            <p className="text-xs font-semibold text-gray-700">Información de Creación</p>
          </div>
          <div className="text-xs text-gray-600">
            <p>
              <span className="font-medium">Creado por:</span>{' '}
              {proyecto.creado_por_info.nombre_completo}
            </p>
            <p className="mt-1">
              <span className="font-medium">Fecha:</span>{' '}
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
      )}

      {/* Leyenda RACI */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <p className="text-xs font-bold text-gray-800 mb-3">📊 Matriz RACI:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <div>
              <p className="font-semibold text-gray-900">Accountable</p>
              <p className="text-gray-600">Responsable final</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <div>
              <p className="font-semibold text-gray-900">Responsible</p>
              <p className="text-gray-600">Ejecuta tareas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-600 flex items-center justify-center text-white font-bold text-xs">
              C
            </div>
            <div>
              <p className="font-semibold text-gray-900">Consulted</p>
              <p className="text-gray-600">Consulta y valida</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};