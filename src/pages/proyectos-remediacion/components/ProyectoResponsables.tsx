// src/pages/proyectos-remediacion/components/ProyectoResponsables.tsx

import React from 'react';
import { Card } from '@/components/common';
import { Users, UserCheck, Shield, Eye, CheckSquare } from 'lucide-react';
import { ProyectoRemediacionDetail } from '@/types/proyecto-remediacion.types';

interface ProyectoResponsablesProps {
  proyecto: ProyectoRemediacionDetail;
}

export const ProyectoResponsables: React.FC<ProyectoResponsablesProps> = ({ proyecto }) => {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Users size={20} className="text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Responsables (Matriz RACI)</h3>
      </div>

      <div className="space-y-4">
        {/* Dueño del Proyecto */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
              <Shield size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900">Dueño del Proyecto</p>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                  Accountable
                </span>
              </div>
              <p className="text-sm text-gray-900">{proyecto.dueno_proyecto_info.nombre_completo}</p>
              <p className="text-xs text-gray-600">{proyecto.dueno_proyecto_info.email}</p>
              {proyecto.dueno_proyecto_info.cargo && (
                <p className="text-xs text-gray-500 mt-1">{proyecto.dueno_proyecto_info.cargo}</p>
              )}
            </div>
          </div>
        </div>

        {/* Responsable de Implementación */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <UserCheck size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900">Responsable de Implementación</p>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  Responsible
                </span>
              </div>
              <p className="text-sm text-gray-900">{proyecto.responsable_implementacion_info.nombre_completo}</p>
              <p className="text-xs text-gray-600">{proyecto.responsable_implementacion_info.email}</p>
              {proyecto.responsable_implementacion_info.cargo && (
                <p className="text-xs text-gray-500 mt-1">{proyecto.responsable_implementacion_info.cargo}</p>
              )}
            </div>
          </div>
        </div>

        {/* Equipo de Implementación */}
        {proyecto.equipo_implementacion_info.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} className="text-green-600" />
              <p className="text-sm font-semibold text-gray-900">Equipo de Implementación</p>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                {proyecto.equipo_implementacion_info.length} miembro(s)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {proyecto.equipo_implementacion_info.map((miembro) => (
                <div key={miembro.id} className="p-3 bg-white rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-gray-900">{miembro.nombre_completo}</p>
                  <p className="text-xs text-gray-600">{miembro.email}</p>
                  {miembro.cargo && (
                    <p className="text-xs text-gray-500 mt-1">{miembro.cargo}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validador Interno */}
        {proyecto.validador_interno_info && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                <CheckSquare size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900">Validador/Aprobador Interno</p>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                    Consulted
                  </span>
                </div>
                <p className="text-sm text-gray-900">{proyecto.validador_interno_info.nombre_completo}</p>
                <p className="text-xs text-gray-600">{proyecto.validador_interno_info.email}</p>
                {proyecto.validador_interno_info.cargo && (
                  <p className="text-xs text-gray-500 mt-1">{proyecto.validador_interno_info.cargo}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Auditor de Verificación */}
        {proyecto.auditor_verificacion_info && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <Eye size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900">Auditor de Verificación</p>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                    Informed
                  </span>
                </div>
                <p className="text-sm text-gray-900">{proyecto.auditor_verificacion_info.nombre_completo}</p>
                <p className="text-xs text-gray-600">{proyecto.auditor_verificacion_info.email}</p>
                {proyecto.auditor_verificacion_info.cargo && (
                  <p className="text-xs text-gray-500 mt-1">{proyecto.auditor_verificacion_info.cargo}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leyenda RACI */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs font-semibold text-gray-700 mb-2">Matriz RACI:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
          <div>
            <span className="font-semibold text-purple-600">R</span> - Responsible (Ejecuta)
          </div>
          <div>
            <span className="font-semibold text-blue-600">A</span> - Accountable (Aprueba)
          </div>
          <div>
            <span className="font-semibold text-orange-600">C</span> - Consulted (Consulta)
          </div>
          <div>
            <span className="font-semibold text-indigo-600">I</span> - Informed (Informado)
          </div>
        </div>
      </div>
    </Card>
  );
};