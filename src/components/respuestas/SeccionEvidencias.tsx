// src/components/respuestas/SeccionEvidencias.tsx

import React from 'react';
import { FileText, Upload, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/common';
import { Evidencia } from '@/types';

// Definimos el BACKEND_URL tomando la variable de entorno o localhost por defecto
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
  
  // Función auxiliar para construir la URL correcta
  const getFileUrl = (url: string) => {
    if (!url) return '#';
    // Si la URL ya es completa (ej: Supabase, S3), la usamos tal cual
    if (url.startsWith('http')) {
      return url;
    }
    // Si es una ruta relativa (ej: /media/...), le concatenamos el backend
    return `${BACKEND_URL}${url}`;
  };

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
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="bg-white p-2 rounded border border-gray-100 shadow-sm flex-shrink-0">
                   <FileText size={20} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {evidencia.codigo_documento} - {evidencia.titulo_documento}
                  </p>
                  <p className="text-xs text-gray-500">
                    {evidencia.tipo_documento_display} · {evidencia.nombre_archivo_original} ({evidencia.tamanio_mb} MB)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {evidencia.url_archivo && (
                  <a
                    href={getFileUrl(evidencia.url_archivo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors border border-transparent hover:border-primary-200"
                    title="Ver archivo"
                  >
                    <ExternalLink size={18} />
                  </a>
                )}
                
                {puedeEditar && (
                  <button
                    type="button"
                    onClick={() => onEliminarEvidencia(evidencia.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Eliminar evidencia"
                  >
                    <Trash2 size={18} />
                  </button>
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
          className="w-full sm:w-auto"
        >
          <Upload size={16} className="mr-2" />
          Agregar Evidencia
        </Button>
      )}

      {!respuestaId && puedeEditar && (
        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
          <span>💡</span> Guarda primero la respuesta como borrador para poder agregar evidencias
        </p>
      )}
    </div>
  );
};