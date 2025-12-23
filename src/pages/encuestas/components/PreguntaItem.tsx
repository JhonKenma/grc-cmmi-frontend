// src/pages/encuestas/components/PreguntaItem.tsx - VERSIÓN CORREGIDA

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle, Weight, Edit2 } from 'lucide-react';
import { Card } from '@/components/common';
import { NivelReferenciaItem } from './NivelReferenciaItem';
import { Pregunta } from '@/types';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

interface PreguntaItemProps {
  pregunta: Pregunta;
  numero: number;
}

export const PreguntaItem: React.FC<PreguntaItemProps> = ({
  pregunta,
  numero,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { id: encuestaId } = useParams();
  const { isSuperuser } = usePermissions();

  const handleEditPregunta = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/encuestas/${encuestaId}/preguntas/${pregunta.id}/editar`);
  };

  // ⭐ Validar que niveles_referencia existe
  const niveles = pregunta.niveles_referencia || [];

  return (
    <Card className="hover:shadow-md transition-shadow">
      {/* ⭐ SOLUCIÓN: Hacer todo un div en lugar de button */}
      <div className="w-full">
        {/* Header de la pregunta */}
        <div className="flex items-start justify-between gap-4">
          {/* Área clickeable para expandir/contraer */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 flex items-start gap-3 text-left"
          >
            {/* Número */}
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm">
              {numero}
            </div>

            {/* Contenido */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-500">
                  {pregunta.codigo}
                </span>
                {pregunta.obligatoria && (
                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                    Obligatoria
                  </span>
                )}
              </div>
              <h4 className="font-medium text-gray-900 mb-1">
                {pregunta.titulo}
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {pregunta.texto}
              </p>

              {/* Peso */}
              <div className="flex items-center gap-2 mt-2">
                <Weight size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">
                  Peso: {pregunta.peso}
                </span>
              </div>
            </div>
          </button>

          {/* ⭐ Iconos FUERA del botón de expandir */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Botón de editar - SOLO PARA SUPERADMIN */}
            {isSuperuser && (
              <button
                onClick={handleEditPregunta}
                className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
                title="Editar pregunta"
              >
                <Edit2 size={18} className="text-primary-600" />
              </button>
            )}

            {/* Botón para expandir/contraer */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronDown size={20} className="text-gray-400" />
              ) : (
                <ChevronRight size={20} className="text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Niveles (expandible) */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle size={16} className="text-primary-600" />
              <h5 className="font-medium text-gray-900">
                Niveles de Madurez (1-5)
              </h5>
            </div>

            {/* ⭐ Validar que existan niveles */}
            {niveles.length > 0 ? (
              <div className="space-y-2">
                {niveles
                  .sort((a, b) => a.numero - b.numero)
                  .map((nivel) => (
                    <NivelReferenciaItem key={nivel.id} nivel={nivel} />
                  ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Esta pregunta no tiene niveles de referencia configurados
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};