// src/components/respuestas/PreguntaCard.tsx

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, MinusCircle, AlertCircle, FileText, Upload, Trash2, Save, Send, ExternalLink } from 'lucide-react';
import { Button, Card } from '@/components/common';
import { respuestasApi } from '@/api/endpoints';
import { Pregunta, RespuestaListItem, Evidencia } from '@/types';
import { ModalEvidencia } from './ModalEvidencia';
import toast from 'react-hot-toast';

interface PreguntaCardProps {
  pregunta: Pregunta;
  numero: number;
  asignacionId: string;
  respuestaExistente?: RespuestaListItem;
  onRespuestaChange: (respuesta: RespuestaListItem) => void;
}

export const PreguntaCard: React.FC<PreguntaCardProps> = ({
  pregunta,
  numero,
  asignacionId,
  respuestaExistente,
  onRespuestaChange
}) => {
  const [respuesta, setRespuesta] = useState<'SI_CUMPLE' | 'CUMPLE_PARCIAL' | 'NO_CUMPLE' | 'NO_APLICA' | ''>('');
  const [justificacion, setJustificacion] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [respuestaId, setRespuestaId] = useState<string | null>(null);
  const [estado, setEstado] = useState<'borrador' | 'enviado' | 'modificado_admin'>('borrador');
  const [saving, setSaving] = useState(false);
  const [mostrarModalEvidencia, setMostrarModalEvidencia] = useState(false);

  // Cargar datos existentes
  useEffect(() => {
    if (respuestaExistente) {
      setRespuesta(respuestaExistente.respuesta);
      setJustificacion(respuestaExistente.justificacion);
      setRespuestaId(respuestaExistente.id);
      setEstado(respuestaExistente.estado);
      
      loadEvidencias(respuestaExistente.id);
    }
  }, [respuestaExistente]);

  const loadEvidencias = async (respuestaId: string) => {
    try {
      const respuestaDetalle = await respuestasApi.get(respuestaId);
      if (respuestaDetalle.evidencias) {
        setEvidencias(respuestaDetalle.evidencias);
      }
    } catch (error) {
      console.error('Error al cargar evidencias:', error);
    }
  };

  const handleGuardarBorrador = async () => {
    if (!respuesta || justificacion.trim().length < 10) {
      toast.error('Completa la respuesta y justificación (mín 10 caracteres)');
      return;
    }

    if (respuesta === 'SI_CUMPLE' && justificacion.trim().length < 10) {
      toast.error('Para "Sí Cumple", la justificación debe tener al menos 10 caracteres');
      return;
    }

    try {
      setSaving(true);

      if (respuestaId) {
        const response = await respuestasApi.update(respuestaId, {
          respuesta,
          justificacion,
          comentarios_adicionales: comentarios
        });
        
        toast.success('Respuesta guardada como borrador');
        
        // ⭐ FIX: Convertir la respuesta completa a RespuestaListItem
        const respuestaListItem: RespuestaListItem = {
          id: response.data?.id || '',
          asignacion: response.data?.asignacion || '',
          pregunta: response.data?.pregunta || '',
          pregunta_codigo: response.data?.pregunta_codigo || '',
          pregunta_texto: response.data?.pregunta_texto || '',
          respuesta: response.data?.respuesta || 'NO_APLICA',
          respuesta_display: response.data?.respuesta_display || '',
          justificacion: response.data?.justificacion || '',
          estado: response.data?.estado || 'borrador',
          estado_display: response.data?.estado_display || '',
          respondido_por: Number(response.data?.respondido_por) || 0,
          respondido_por_nombre: response.data?.respondido_por_nombre || '',
          respondido_at: response.data?.respondido_at || '',
          total_evidencias: response.data?.evidencias?.length || 0,
          version: response.data?.version || 0,
        };
        
        onRespuestaChange(respuestaListItem);
        
      } else {
        const response = await respuestasApi.create({
          asignacion: asignacionId,
          pregunta: pregunta.id,
          respuesta,
          justificacion,
          comentarios_adicionales: comentarios
        });
        
        setRespuestaId(response.data?.id ?? null);
        toast.success('Respuesta creada como borrador');
        
        // ⭐ FIX: Convertir la respuesta completa a RespuestaListItem
        const respuestaListItem: RespuestaListItem = {
          id: response.data?.id || '',
          asignacion: response.data?.asignacion || '',
          pregunta: response.data?.pregunta || '',
          pregunta_codigo: response.data?.pregunta_codigo || '',
          pregunta_texto: response.data?.pregunta_texto || '',
          respuesta: response.data?.respuesta || 'NO_APLICA',
          respuesta_display: response.data?.respuesta_display || '',
          justificacion: response.data?.justificacion || '',
          estado: response.data?.estado || 'borrador',
          estado_display: response.data?.estado_display || '',
          respondido_por: Number(response.data?.respondido_por) || 0,
          respondido_por_nombre: response.data?.respondido_por_nombre || '',
          respondido_at: response.data?.respondido_at || '',
          total_evidencias: response.data?.evidencias?.length || 0,
          version: response.data?.version || 0,
        };
        
        onRespuestaChange(respuestaListItem);
      }
    } catch (error: any) {
      console.error('Error al guardar:', error);
      const errorMsg = error.response?.data?.message || 'Error al guardar la respuesta';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleEnviar = async () => {
    if (!respuestaId) {
      toast.error('Primero debes guardar la respuesta como borrador');
      return;
    }

    if (respuesta === 'SI_CUMPLE' && evidencias.length === 0) {
      toast.error('Las respuestas "Sí Cumple" requieren al menos una evidencia');
      return;
    }

    try {
      setSaving(true);
      await respuestasApi.enviar(respuestaId);
      setEstado('enviado');
      toast.success('✅ Respuesta enviada exitosamente');
      
      // ⭐ FIX: Obtener y convertir respuesta actualizada
      const respuestaActualizada = await respuestasApi.get(respuestaId);
      
      const respuestaListItem: RespuestaListItem = {
        id: respuestaActualizada?.id || '',
        asignacion: respuestaActualizada?.asignacion || '',
        pregunta: respuestaActualizada?.pregunta || '',
        pregunta_codigo: respuestaActualizada?.pregunta_codigo || '',
        pregunta_texto: respuestaActualizada?.pregunta_texto || '',
        respuesta: respuestaActualizada?.respuesta || 'NO_APLICA',
        respuesta_display: respuestaActualizada?.respuesta_display || '',
        justificacion: respuestaActualizada?.justificacion || '',
        estado: respuestaActualizada?.estado || 'enviado',
        estado_display: respuestaActualizada?.estado_display || '',
        respondido_por: Number(respuestaActualizada?.respondido_por) || 0,
        respondido_por_nombre: respuestaActualizada?.respondido_por_nombre || '',
        respondido_at: respuestaActualizada?.respondido_at || '',
        total_evidencias: respuestaActualizada?.evidencias?.length || 0,
        version: respuestaActualizada?.version || 0,
      };
      
      onRespuestaChange(respuestaListItem);
      
    } catch (error: any) {
      console.error('Error al enviar:', error);
      const errorMsg = error.response?.data?.message || 'Error al enviar la respuesta';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarEvidencia = async (evidenciaId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta evidencia?')) {
      return;
    }

    try {
      await respuestasApi.eliminarEvidencia(evidenciaId);
      setEvidencias(prev => prev.filter(e => e.id !== evidenciaId));
      toast.success('Evidencia eliminada');
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar la evidencia');
    }
  };

  const handleEvidenciaSubida = () => {
    if (respuestaId) {
      loadEvidencias(respuestaId);
    }
  };

  const puedeEditar = estado === 'borrador';

  return (
    <>
      <Card className={estado === 'enviado' ? 'border-green-300 bg-green-50' : ''}>
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-primary-100 text-primary-700 rounded text-xs font-semibold">
                  {numero}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {pregunta.codigo}
                </span>
                {estado === 'enviado' && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                    <CheckCircle size={12} />
                    Enviada
                  </span>
                )}
              </div>
              
              <h3 className="text-base font-semibold text-gray-900">
                {pregunta.titulo}
              </h3>
              
              {pregunta.texto && (
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                  {pregunta.texto}
                </p>
              )}
            </div>
          </div>

          {/* ⭐ NUEVO: 4 Columnas Responsive */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nivel de Cumplimiento <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Sí Cumple */}
              <button
                onClick={() => puedeEditar && setRespuesta('SI_CUMPLE')}
                disabled={!puedeEditar}
                type="button"
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  respuesta === 'SI_CUMPLE'
                    ? 'border-green-500 bg-green-50 shadow-sm'
                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                } ${!puedeEditar ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <CheckCircle
                  size={24}
                  className={respuesta === 'SI_CUMPLE' ? 'text-green-600' : 'text-gray-400'}
                />
                <div className="text-center">
                  <span className={`text-sm font-semibold block ${
                    respuesta === 'SI_CUMPLE' ? 'text-green-900' : 'text-gray-700'
                  }`}>
                    Sí Cumple
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Cumplimiento completo
                  </p>
                </div>
              </button>

              {/* Cumple Parcialmente */}
              <button
                onClick={() => puedeEditar && setRespuesta('CUMPLE_PARCIAL')}
                disabled={!puedeEditar}
                type="button"
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  respuesta === 'CUMPLE_PARCIAL'
                    ? 'border-yellow-500 bg-yellow-50 shadow-sm'
                    : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
                } ${!puedeEditar ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <AlertCircle
                  size={24}
                  className={respuesta === 'CUMPLE_PARCIAL' ? 'text-yellow-600' : 'text-gray-400'}
                />
                <div className="text-center">
                  <span className={`text-sm font-semibold block ${
                    respuesta === 'CUMPLE_PARCIAL' ? 'text-yellow-900' : 'text-gray-700'
                  }`}>
                    Cumple Parcial
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Cumplimiento parcial
                  </p>
                </div>
              </button>

              {/* No Cumple */}
              <button
                onClick={() => puedeEditar && setRespuesta('NO_CUMPLE')}
                disabled={!puedeEditar}
                type="button"
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  respuesta === 'NO_CUMPLE'
                    ? 'border-red-500 bg-red-50 shadow-sm'
                    : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                } ${!puedeEditar ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <XCircle
                  size={24}
                  className={respuesta === 'NO_CUMPLE' ? 'text-red-600' : 'text-gray-400'}
                />
                <div className="text-center">
                  <span className={`text-sm font-semibold block ${
                    respuesta === 'NO_CUMPLE' ? 'text-red-900' : 'text-gray-700'
                  }`}>
                    No Cumple
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Sin cumplimiento
                  </p>
                </div>
              </button>

              {/* No Aplica */}
              <button
                onClick={() => puedeEditar && setRespuesta('NO_APLICA')}
                disabled={!puedeEditar}
                type="button"
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  respuesta === 'NO_APLICA'
                    ? 'border-gray-400 bg-gray-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${!puedeEditar ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <MinusCircle
                  size={24}
                  className={respuesta === 'NO_APLICA' ? 'text-gray-600' : 'text-gray-400'}
                />
                <div className="text-center">
                  <span className={`text-sm font-semibold block ${
                    respuesta === 'NO_APLICA' ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    No Aplica
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Criterio no aplicable
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Justificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Justificación <span className="text-red-500">*</span>
              <span className="text-gray-500 font-normal ml-2 text-xs">
                (mínimo 10 caracteres)
              </span>
              {respuesta === 'SI_CUMPLE' && (
                <span className="text-amber-600 font-medium ml-2 text-xs">
                  • Obligatorio para "Sí Cumple"
                </span>
              )}
            </label>
            <textarea
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              disabled={!puedeEditar}
              rows={4}
              placeholder="Proporcione una justificación detallada de su respuesta..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              {justificacion.length} caracteres
            </p>
          </div>

          {/* Evidencias (solo si es "Sí Cumple") */}
          {respuesta === 'SI_CUMPLE' && (
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
                            href={evidencia.url_archivo}
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
                            onClick={() => handleEliminarEvidencia(evidencia.id)}
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
                  onClick={() => setMostrarModalEvidencia(true)}
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
          )}

          {/* Comentarios Adicionales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentarios Adicionales <span className="text-gray-500 font-normal text-xs">(Opcional)</span>
            </label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              disabled={!puedeEditar}
              rows={3}
              placeholder="Observaciones o notas adicionales..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Botones de Acción */}
          {puedeEditar && (
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleGuardarBorrador}
                disabled={saving || !respuesta || justificacion.trim().length < 10}
                type="button"
              >
                <Save size={16} className="mr-2" />
                {saving ? 'Guardando...' : 'Guardar Borrador'}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleEnviar}
                disabled={
                  saving ||
                  !respuestaId ||
                  (respuesta === 'SI_CUMPLE' && evidencias.length === 0)
                }
                type="button"
              >
                <Send size={16} className="mr-2" />
                {saving ? 'Enviando...' : 'Enviar Respuesta'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Evidencia */}
      {mostrarModalEvidencia && respuestaId && (
        <ModalEvidencia
          respuestaId={respuestaId}
          onClose={() => setMostrarModalEvidencia(false)}
          onSuccess={handleEvidenciaSubida}
        />
      )}
    </>
  );
};