// src/pages/encuestas/components/NivelReferenciaItem.tsx - VERSIÓN CORREGIDA

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Star, Lightbulb, Edit2 } from 'lucide-react';
import { NivelReferencia } from '@/types';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

interface NivelReferenciaItemProps {
  nivel: NivelReferencia;
}

export const NivelReferenciaItem: React.FC<NivelReferenciaItemProps> = ({
  nivel,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { id: encuestaId } = useParams();
  const { isSuperuser } = usePermissions();

  const handleEditNivel = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/encuestas/${encuestaId}/niveles/${nivel.id}/editar`);
  };

  // Colores por nivel
  const nivelColors = {
    1: 'bg-red-50 border-red-200 text-red-700',
    2: 'bg-orange-50 border-orange-200 text-orange-700',
    3: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    4: 'bg-blue-50 border-blue-200 text-blue-700',
    5: 'bg-green-50 border-green-200 text-green-700',
  };

  const color = nivelColors[nivel.numero as keyof typeof nivelColors];

  return (
    <div className={`border rounded-lg p-3 ${color}`}>
      {/* ⭐ SOLUCIÓN: Hacer todo un div en lugar de button */}
      <div className="w-full">
        {/* Header del nivel */}
        <div className="flex items-center justify-between">
          {/* Área clickeable para expandir/contraer */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 flex items-center gap-2 text-left"
          >
            <Star size={16} className="flex-shrink-0" />
            <span className="font-medium text-sm">Nivel {nivel.numero}</span>
          </button>

          {/* ⭐ Iconos FUERA del botón de expandir */}
          <div className="flex items-center gap-2">
            {/* Botón de editar - SOLO PARA SUPERADMIN */}
            {isSuperuser && (
              <button
                onClick={handleEditNivel}
                className="p-1.5 hover:bg-white/50 rounded transition-colors"
                title="Editar nivel"
              >
                <Edit2 size={14} />
              </button>
            )}

            {/* Botón para expandir/contraer */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-white/30 rounded transition-colors"
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
        </div>

        {/* Contenido expandible */}
        {isExpanded && (
          <div className="mt-3 space-y-3 text-sm">
            {/* Descripción */}
            <div>
              <p className="font-medium mb-1">Descripción:</p>
              <p className="text-gray-700 leading-relaxed">{nivel.descripcion}</p>
            </div>

            {/* Recomendaciones */}
            {nivel.recomendaciones && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb size={14} />
                  <p className="font-medium">Recomendaciones:</p>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {nivel.recomendaciones}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};