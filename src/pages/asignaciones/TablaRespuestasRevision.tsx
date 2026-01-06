// src/components/asignaciones/TablaRespuestasRevision.tsx

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Save, X, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/common';
import { Respuesta, Evidencia } from '@/types';

interface TablaRespuestasRevisionProps {
  respuestas: Respuesta[];
  modoEdicion: boolean;
  onEditarRespuesta: (
    respuestaId: string, 
    datos: { 
      respuesta: string; 
      justificacion: string;
      nivel_madurez: number;
      justificacion_madurez: string;
    }
  ) => void;
}

export const TablaRespuestasRevision: React.FC<TablaRespuestasRevisionProps> = ({
  respuestas,
  modoEdicion,
  onEditarRespuesta,
}) => {
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());
  const [editando, setEditando] = useState<string | null>(null);
  const [respuestaEditada, setRespuestaEditada] = useState('');
  const [justificacionEditada, setJustificacionEditada] = useState('');
  
  // ⭐ NUEVOS ESTADOS PARA NIVEL DE MADUREZ
  const [nivelMadurezEditado, setNivelMadurezEditado] = useState<number>(0);
  const [justificacionMadurezEditada, setJustificacionMadurezEditada] = useState('');

  // ⭐ NIVELES DE MADUREZ - SOLO NÚMEROS
  const NIVELES_MADUREZ = [
    { value: 0, label: '0' },
    { value: 0.5, label: '0.5' },
    { value: 1.0, label: '1' },
    { value: 1.5, label: '1.5' },
    { value: 2.0, label: '2' },
    { value: 2.5, label: '2.5' },
    { value: 3.0, label: '3' },
    { value: 3.5, label: '3.5' },
    { value: 4.0, label: '4' },
    { value: 4.5, label: '4.5' },
    { value: 5.0, label: '5' },
  ];

  const toggleExpandir = (id: string) => {
    const nuevas = new Set(expandidas);
    if (nuevas.has(id)) {
      nuevas.delete(id);
    } else {
      nuevas.add(id);
    }
    setExpandidas(nuevas);
  };

  const iniciarEdicion = (respuesta: Respuesta) => {
    setEditando(respuesta.id);
    setRespuestaEditada(respuesta.respuesta);
    setJustificacionEditada(respuesta.justificacion);
    // ⭐ CARGAR NIVEL DE MADUREZ
    setNivelMadurezEditado(respuesta.nivel_madurez || 0);
    setJustificacionMadurezEditada(respuesta.justificacion_madurez || '');
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setRespuestaEditada('');
    setJustificacionEditada('');
    // ⭐ RESETEAR NIVEL DE MADUREZ
    setNivelMadurezEditado(0);
    setJustificacionMadurezEditada('');
  };

  const guardarEdicion = (respuestaId: string) => {
    onEditarRespuesta(respuestaId, {
      respuesta: respuestaEditada,
      justificacion: justificacionEditada,
      // ⭐ INCLUIR NIVEL DE MADUREZ
      nivel_madurez: nivelMadurezEditado,
      justificacion_madurez: justificacionMadurezEditada,
    });
    setEditando(null);
  };

  const getColorRespuesta = (respuesta: string) => {
    switch (respuesta) {
      case 'SI_CUMPLE':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CUMPLE_PARCIAL':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'NO_CUMPLE':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'NO_APLICA':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getNombreRespuesta = (respuesta: string) => {
    switch (respuesta) {
      case 'SI_CUMPLE':
        return 'Sí Cumple';
      case 'CUMPLE_PARCIAL':
        return 'Cumple Parcial';
      case 'NO_CUMPLE':
        return 'No Cumple';
      case 'NO_APLICA':
        return 'No Aplica';
      default:
        return respuesta;
    }
  };

  // ⭐ DETERMINAR SI REQUIERE NIVEL DE MADUREZ
  const requiereNivelMadurez = (respuesta: string) => {
    return respuesta === 'SI_CUMPLE' || respuesta === 'CUMPLE_PARCIAL';
  };

  return (
    <div className="space-y-3">
      {respuestas.map((respuesta, index) => {
        const estaExpandida = expandidas.has(respuesta.id);
        const estaEditando = editando === respuesta.id;
        const muestraNivelMadurez = respuesta.nivel_madurez > 0;

        return (
          <div
            key={respuesta.id}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white"
          >
            {/* Header de la pregunta */}
            <div
              className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => !estaEditando && toggleExpandir(respuesta.id)}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-semibold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {respuesta.pregunta_codigo} - {respuesta.pregunta_texto}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* ⭐ BADGE DE NIVEL DE MADUREZ */}
                  {muestraNivelMadurez && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      Madurez: {respuesta.nivel_madurez}
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getColorRespuesta(
                      respuesta.respuesta
                    )}`}
                  >
                    {getNombreRespuesta(respuesta.respuesta)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {modoEdicion && !estaEditando && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      iniciarEdicion(respuesta);
                    }}
                    className="p-2 hover:bg-primary-100 rounded transition-colors"
                    title="Editar respuesta"
                  >
                    <Edit2 size={16} className="text-primary-600" />
                  </button>
                )}
                {!estaEditando && (
                  estaExpandida ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )
                )}
              </div>
            </div>

            {/* Contenido expandido */}
            {estaExpandida && (
              <div className="p-4 space-y-4 border-t border-gray-200">
                {estaEditando ? (
                  // MODO EDICIÓN
                  <div className="space-y-4">
                    {/* Selector de respuesta */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Respuesta <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: 'SI_CUMPLE', label: 'Sí Cumple', color: 'green' },
                          { value: 'CUMPLE_PARCIAL', label: 'Cumple Parcial', color: 'yellow' },
                          { value: 'NO_CUMPLE', label: 'No Cumple', color: 'red' },
                          { value: 'NO_APLICA', label: 'No Aplica', color: 'gray' },
                        ].map((opcion) => (
                          <button
                            key={opcion.value}
                            type="button"
                            onClick={() => {
                              setRespuestaEditada(opcion.value);
                              // ⭐ AUTO-RESET: Nivel a 0 si NO_CUMPLE o NO_APLICA
                              if (opcion.value === 'NO_CUMPLE' || opcion.value === 'NO_APLICA') {
                                setNivelMadurezEditado(0);
                                setJustificacionMadurezEditada('');
                              }
                            }}
                            className={`p-2 rounded border-2 text-sm font-medium transition-all ${
                              respuestaEditada === opcion.value
                                ? `border-${opcion.color}-500 bg-${opcion.color}-50 text-${opcion.color}-900`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {opcion.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ⭐ NUEVO: SELECTOR DE NIVEL DE MADUREZ */}
                    {requiereNivelMadurez(respuestaEditada) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Nivel de Madurez <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={nivelMadurezEditado}
                          onChange={(e) => setNivelMadurezEditado(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-3"
                        >
                          {NIVELES_MADUREZ.map((nivel) => (
                            <option key={nivel.value} value={nivel.value}>
                              {nivel.label}
                            </option>
                          ))}
                        </select>

                        {nivelMadurezEditado > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Justificación del Nivel de Madurez <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={justificacionMadurezEditada}
                              onChange={(e) => setJustificacionMadurezEditada(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="Justifica el nivel de madurez..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {justificacionMadurezEditada.length} / 10 caracteres mínimos
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Editor de justificación */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Justificación <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={justificacionEditada}
                        onChange={(e) => setJustificacionEditada(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Justificación..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {justificacionEditada.length} caracteres
                      </p>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => guardarEdicion(respuesta.id)}
                        disabled={
                          justificacionEditada.trim().length < 10 ||
                          (requiereNivelMadurez(respuestaEditada) && 
                            (nivelMadurezEditado === 0 || justificacionMadurezEditada.trim().length < 10))
                        }
                      >
                        <Save size={14} className="mr-1" />
                        Guardar Cambios
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={cancelarEdicion}
                      >
                        <X size={14} className="mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // MODO VISUALIZACIÓN
                  <>
                    {/* ⭐ NUEVO: MOSTRAR NIVEL DE MADUREZ */}
                    {muestraNivelMadurez && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-gray-900">
                            Nivel de Madurez: <span className="text-blue-700">{respuesta.nivel_madurez}</span>
                          </p>
                          <span className="text-xs text-blue-600 font-medium">
                            {NIVELES_MADUREZ.find(n => n.value === respuesta.nivel_madurez)?.label}
                          </span>
                        </div>
                        {respuesta.justificacion_madurez && (
                          <>
                            <p className="text-xs font-medium text-gray-700 mb-1">Justificación del nivel:</p>
                            <p className="text-sm text-gray-800">{respuesta.justificacion_madurez}</p>
                          </>
                        )}
                      </div>
                    )}

                    {/* Justificación */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Justificación:</p>
                      <p className="text-sm text-gray-800">{respuesta.justificacion}</p>
                    </div>

                    {/* Comentarios adicionales */}
                    {respuesta.comentarios_adicionales && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          Comentarios adicionales:
                        </p>
                        <p className="text-sm text-gray-800">
                          {respuesta.comentarios_adicionales}
                        </p>
                      </div>
                    )}

                    {/* Evidencias */}
                    {respuesta.evidencias && respuesta.evidencias.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Evidencias ({respuesta.evidencias.length}):
                        </p>
                        <div className="space-y-2">
                          {respuesta.evidencias
                            .filter(evidencia => evidencia.activo)
                            .map((evidencia) => (
                              <div
                                key={evidencia.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <FileText size={20} className="text-primary-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                      {evidencia.titulo_documento}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-gray-500">
                                        {evidencia.codigo_documento}
                                      </span>
                                      <span className="text-xs text-gray-400">•</span>
                                      <span className="text-xs text-gray-500">
                                        {evidencia.tipo_documento_display}
                                      </span>
                                      <span className="text-xs text-gray-400">•</span>
                                      <span className="text-xs text-gray-500">
                                        {evidencia.tamanio_mb} MB
                                      </span>
                                    </div>
                                    {evidencia.objetivo_documento && (
                                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                        {evidencia.objetivo_documento}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Botón para ver/descargar */}
                                {evidencia.url_archivo && (
                                  <a
                                    href={`http://localhost:8000${evidencia.url_archivo}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-3 p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors flex-shrink-0"
                                    title="Ver evidencia"
                                  >
                                    <ExternalLink size={18} />
                                  </a>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Info de auditoría */}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Respondido por: {respuesta.respondido_por_nombre} el{' '}
                        {new Date(respuesta.respondido_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};