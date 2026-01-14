// src/pages/asignaciones/TablaRespuestasRevision.tsx

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
  
  const [nivelMadurezEditado, setNivelMadurezEditado] = useState<number>(0);
  const [justificacionMadurezEditada, setJustificacionMadurezEditada] = useState('');
  
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  // Lógica inteligente para determinar la URL del archivo
  const getFileUrl = (url: string) => {
    if (!url) return '#';
    // Si la URL ya es completa (ej: Supabase), se usa tal cual.
    // Si es relativa (ej: /media/...), se concatena el BACKEND_URL.
    return url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
  };

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
    setNivelMadurezEditado(respuesta.nivel_madurez || 0);
    setJustificacionMadurezEditada(respuesta.justificacion_madurez || '');
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setRespuestaEditada('');
    setJustificacionEditada('');
    setNivelMadurezEditado(0);
    setJustificacionMadurezEditada('');
  };

  const guardarEdicion = (respuestaId: string) => {
    onEditarRespuesta(respuestaId, {
      respuesta: respuestaEditada,
      justificacion: justificacionEditada,
      nivel_madurez: nivelMadurezEditado,
      justificacion_madurez: justificacionMadurezEditada,
    });
    setEditando(null);
  };

  const getColorRespuesta = (respuesta: string) => {
    switch (respuesta) {
      case 'SI_CUMPLE': return 'bg-green-100 text-green-800 border-green-300';
      case 'CUMPLE_PARCIAL': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'NO_CUMPLE': return 'bg-red-100 text-red-800 border-red-300';
      case 'NO_APLICA': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getNombreRespuesta = (respuesta: string) => {
    switch (respuesta) {
      case 'SI_CUMPLE': return 'Sí Cumple';
      case 'CUMPLE_PARCIAL': return 'Cumple Parcial';
      case 'NO_CUMPLE': return 'No Cumple';
      case 'NO_APLICA': return 'No Aplica';
      default: return respuesta;
    }
  };

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
          <div key={respuesta.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Header */}
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
                  {muestraNivelMadurez && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      Madurez: {respuesta.nivel_madurez}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getColorRespuesta(respuesta.respuesta)}`}>
                    {getNombreRespuesta(respuesta.respuesta)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {modoEdicion && !estaEditando && (
                  <button
                    onClick={(e) => { e.stopPropagation(); iniciarEdicion(respuesta); }}
                    className="p-2 hover:bg-primary-100 rounded transition-colors"
                  >
                    <Edit2 size={16} className="text-primary-600" />
                  </button>
                )}
                {!estaEditando && (estaExpandida ? <ChevronUp size={20} /> : <ChevronDown size={20} />)}
              </div>
            </div>

            {/* Contenido */}
            {estaExpandida && (
              <div className="p-4 space-y-4 border-t border-gray-200">
                {estaEditando ? (
                  <div className="space-y-4">
                    {/* Campos de edición simplificados */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Respuesta</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['SI_CUMPLE', 'CUMPLE_PARCIAL', 'NO_CUMPLE', 'NO_APLICA'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setRespuestaEditada(opt)}
                            className={`p-2 rounded border text-xs font-medium ${respuestaEditada === opt ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-200'}`}
                          >
                            {getNombreRespuesta(opt)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {requiereNivelMadurez(respuestaEditada) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Madurez</label>
                        <select
                          value={nivelMadurezEditado}
                          onChange={(e) => setNivelMadurezEditado(Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                          {NIVELES_MADUREZ.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Justificación</label>
                      <textarea
                        value={justificacionEditada}
                        onChange={(e) => setJustificacionEditada(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => guardarEdicion(respuesta.id)}>Guardar</Button>
                      <Button size="sm" variant="secondary" onClick={cancelarEdicion}>Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Justificación</p>
                        <p className="text-sm text-gray-800 mt-1">{respuesta.justificacion}</p>
                      </div>
                      {respuesta.comentarios_adicionales && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase">Comentarios</p>
                          <p className="text-sm text-gray-800 mt-1">{respuesta.comentarios_adicionales}</p>
                        </div>
                      )}
                    </div>

                    {/* Sección de Evidencias Corregida */}
                    {respuesta.evidencias && respuesta.evidencias.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-3">Evidencias Adjuntas</p>
                        <div className="space-y-2">
                          {respuesta.evidencias.filter(ev => ev.activo).map((evidencia) => (
                            <div key={evidencia.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                              <div className="flex items-center gap-3">
                                <FileText size={18} className="text-primary-500" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{evidencia.titulo_documento}</p>
                                  <p className="text-xs text-gray-500">{evidencia.codigo_documento} • {evidencia.tipo_documento_display}</p>
                                </div>
                              </div>
                              {evidencia.url_archivo && (
                                <a
                                  href={getFileUrl(evidencia.url_archivo)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                                  title="Ver documento"
                                >
                                  <ExternalLink size={18} />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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