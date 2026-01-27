// src/pages/proyectos-remediacion/components/ProyectoInfoGeneral.tsx

import React from 'react';
import { Card } from '@/components/common';
import { 
  FileText, 
  Target, 
  CheckSquare, 
  AlertCircle, 
  ShieldCheck, 
  Info,
  Layers,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { ProyectoRemediacionDetail } from '@/types/proyecto-remediacion.types';

interface ProyectoInfoGeneralProps {
  proyecto: ProyectoRemediacionDetail;
}

export const ProyectoInfoGeneral: React.FC<ProyectoInfoGeneralProps> = ({ proyecto }) => {
  return (
    <div className="space-y-6">
      <Card>
        {/* Header con Estrategia */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Planificación Estratégica</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Estrategia:</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-xs font-bold uppercase">
              {proyecto.resultado_final_display}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* COLUMNA IZQUIERDA: Definición y Alcance */}
          <div className="space-y-6">
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Layers size={16} className="text-gray-500" />
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Alcance del Proyecto</h4>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed whitespace-pre-line">
                {proyecto.alcance_proyecto || 'No especificado'}
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-blue-600" />
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Objetivos Específicos</h4>
              </div>
              <div className="bg-white border-l-4 border-blue-500 p-4 shadow-sm rounded-r-xl">
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {proyecto.objetivos_especificos}
                </p>
              </div>
            </section>

          </div>

          {/* COLUMNA DERECHA: Validación y Aceptación */}
          <div className="space-y-6">
            <section>
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare size={16} className="text-green-600" />
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Criterios de Aceptación</h4>
              </div>
              <div className="bg-green-50/50 border border-green-200 p-4 rounded-xl">
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {proyecto.criterios_aceptacion}
                </p>
              </div>
            </section>

            <section className="bg-purple-50 p-5 rounded-xl border border-purple-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={18} className="text-purple-600" />
                <h4 className="text-sm font-bold text-purple-900 uppercase tracking-wider">Protocolo de Validación</h4>
              </div>
              <p className="text-sm text-purple-800 mb-4 leading-relaxed whitespace-pre-line">
                {proyecto.criterios_aceptacion}
              </p>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-200">
                <span className="text-xs font-bold text-purple-600 uppercase">Criterios de Validación:</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                  Definido
                </span>
              </div>
            </section>
          </div>
        </div>

        {/* SECCIÓN INFERIOR: Riesgos y Restricciones */}
        {(proyecto.riesgos_proyecto || proyecto.restricciones) && (
          <div className="mt-8 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            {proyecto.riesgos_proyecto && (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle className="text-red-500 mt-0.5" size={18} />
                <div>
                  <h5 className="text-xs font-bold text-red-800 uppercase tracking-tight">Riesgos del Proyecto</h5>
                  <p className="text-sm text-red-700 mt-1 whitespace-pre-line">{proyecto.riesgos_proyecto}</p>
                </div>
              </div>
            )}
            {proyecto.restricciones && (
              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                <Info className="text-orange-500 mt-0.5" size={18} />
                <div>
                  <h5 className="text-xs font-bold text-orange-800 uppercase tracking-tight">Restricciones Identificadas</h5>
                  <p className="text-sm text-orange-700 mt-1 whitespace-pre-line">{proyecto.restricciones}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Preguntas del GAP abordadas */}
      {proyecto.preguntas_abordadas_info.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <HelpCircle size={18} className="text-gray-400" />
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Preguntas del GAP Vinculadas ({proyecto.preguntas_abordadas_info.length})
            </h4>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {proyecto.preguntas_abordadas_info.map((pregunta) => (
              <div key={pregunta.id} className="flex gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-50 text-blue-600 rounded-lg border border-gray-100 font-mono text-xs font-bold">
                    {pregunta.codigo}
                  </div>
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-bold text-gray-900">{pregunta.titulo}</h5>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{pregunta.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};