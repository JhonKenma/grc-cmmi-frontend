// src/components/respuestas/SeccionEvidencias.tsx - MODIFICAR

import React from 'react';
import { FileText, Upload, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/common';
import { Evidencia } from '@/types';

// ⭐ AGREGAR ESTA LÍNEA AL INICIO
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

interface SeccionEvidenciasProps {
  evidencias: Evidencia[];
  puedeEditar: boolean;
  respuestaId: string | null;
  onAgregarEvidencia: () => void;
  onEliminarEvidencia: (id: string) => void;
}

export const SeccionEvidencias: React.FC<SeccionEvidenciasProps> = ({
  evidencias,
  puedeEditar,
  respuestaId,
  onAgregarEvidencia,
  onEliminarEvidencia
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Evidencias <span className="text-red-500">*</span>
        <span className="text-gray-500 font-normal ml-2 text-xs">
          (máximo 3 archivos)
        </span>
      </label>

      {/* Lista de evidencias */}
      {evidencias.length > 0 && (
        <div className="space-y-2 mb-3">
          {evidencias.map((evidencia) => (
            <div
              key={evidencia.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3 flex-1">
                <FileText size={18} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {evidencia.codigo_documento} - {evidencia.titulo_documento}
                  </p>
                  <p className="text-xs text-gray-500">
                    {evidencia.tipo_documento_display} · {evidencia.nombre_archivo_original} ({evidencia.tamanio_mb} MB)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {evidencia.url_archivo && (
                  <a
                    href={`${BACKEND_URL}${evidencia.url_archivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
                {puedeEditar && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEliminarEvidencia(evidencia.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón agregar evidencia */}
      {puedeEditar && evidencias.length < 3 && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onAgregarEvidencia}
          disabled={!respuestaId}
          type="button"
        >
          <Upload size={16} className="mr-2" />
          Agregar Evidencia
        </Button>
      )}

      {!respuestaId && puedeEditar && (
        <p className="text-xs text-amber-600 mt-2">
          💡 Guarda primero la respuesta como borrador para poder agregar evidencias
        </p>
      )}
    </div>
  );
};