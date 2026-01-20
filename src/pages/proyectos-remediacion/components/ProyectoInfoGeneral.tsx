// src/pages/proyectos-remediacion/components/ProyectoInfoGeneral.tsx

import React from 'react';
import { Card } from '@/components/common';
import { FileText, Target, CheckSquare, AlertCircle } from 'lucide-react';
import { ProyectoRemediacionDetail } from '@/types/proyecto-remediacion.types';

interface ProyectoInfoGeneralProps {
  proyecto: ProyectoRemediacionDetail;
}

export const ProyectoInfoGeneral: React.FC<ProyectoInfoGeneralProps> = ({ proyecto }) => {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <FileText size={20} className="text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Planificación del Proyecto</h3>
      </div>

      <div className="space-y-6">
        {/* Estrategia de Cierre */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-blue-600" />
            <h4 className="text-sm font-semibold text-gray-900">Estrategia de Cierre</h4>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {proyecto.estrategia_cierre_display}
          </span>
        </div>

        {/* Alcance del Proyecto */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Alcance del Proyecto</h4>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-line">
            {proyecto.alcance_proyecto}
          </p>
        </div>

        {/* Objetivos Específicos */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Objetivos Específicos</h4>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {proyecto.objetivos_especificos}
            </p>
          </div>
        </div>

        {/* Criterios de Aceptación */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare size={16} className="text-green-600" />
            <h4 className="text-sm font-semibold text-gray-900">Criterios de Aceptación</h4>
          </div>
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {proyecto.criterios_aceptacion}
            </p>
          </div>
        </div>

        {/* Supuestos */}
        {proyecto.supuestos && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Supuestos del Proyecto</h4>
            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg whitespace-pre-line">
              {proyecto.supuestos}
            </p>
          </div>
        )}

        {/* Restricciones */}
        {proyecto.restricciones && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Restricciones Identificadas</h4>
            <p className="text-sm text-gray-700 bg-orange-50 p-3 rounded-lg whitespace-pre-line">
              {proyecto.restricciones}
            </p>
          </div>
        )}

        {/* Riesgos del Proyecto */}
        {proyecto.riesgos_proyecto && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-red-600" />
              <h4 className="text-sm font-semibold text-gray-900">Riesgos del Proyecto</h4>
            </div>
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {proyecto.riesgos_proyecto}
              </p>
            </div>
          </div>
        )}

        {/* Criterios de Validación */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Criterios de Validación</h4>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {proyecto.criterios_validacion}
            </p>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">Método de Verificación:</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
              {proyecto.metodo_verificacion_display}
            </span>
          </div>
        </div>

        {/* Preguntas Abordadas */}
        {proyecto.preguntas_abordadas_info.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Preguntas Abordadas ({proyecto.preguntas_abordadas_info.length})
            </h4>
            <div className="space-y-2">
              {proyecto.preguntas_abordadas_info.map((pregunta) => (
                <div key={pregunta.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-semibold flex-shrink-0">
                      {pregunta.codigo}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{pregunta.titulo}</p>
                      <p className="text-xs text-gray-600 mt-1">{pregunta.texto}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};