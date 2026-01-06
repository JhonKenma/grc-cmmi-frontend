// src/components/respuestas/PreguntaCard.tsx - VERSIÓN SIMPLIFICADA

import React, { useState, useEffect } from 'react';
import { CheckCircle, Save, Send } from 'lucide-react';
import { Button, Card } from '@/components/common';
import { respuestasApi } from '@/api/endpoints';
import { Pregunta, RespuestaListItem, Evidencia } from '@/types';
import { ModalEvidencia } from './ModalEvidencia';
import { SelectorCumplimiento } from './SelectorCumplimiento';
import { SelectorNivelMadurez } from './SelectorNivelMadurez';
import { SeccionEvidencias } from './SeccionEvidencias';
import { RespuestaTipo } from './types';
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
  const [respuesta, setRespuesta] = useState<RespuestaTipo>('');
  const [justificacion, setJustificacion] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [nivelMadurez, setNivelMadurez] = useState<number>(0);
  const [justificacionMadurez, setJustificacionMadurez] = useState('');
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
      setNivelMadurez(respuestaExistente.nivel_madurez || 0);
      setJustificacionMadurez(respuestaExistente.justificacion_madurez || '');
      loadEvidencias(respuestaExistente.id);
    }
  }, [respuestaExistente]);

  // Lógica
  const puedeSubirEvidencias = respuesta === 'SI_CUMPLE' || respuesta === 'CUMPLE_PARCIAL';
  const requiereNivelMadurez = respuesta === 'SI_CUMPLE' || respuesta === 'CUMPLE_PARCIAL';
  const esNoImplementado = respuesta === 'NO_CUMPLE' || respuesta === 'NO_APLICA';
  const puedeEditar = estado === 'borrador';

  // Auto-reset nivel de madurez
  useEffect(() => {
    if (esNoImplementado) {
      setNivelMadurez(0);
      setJustificacionMadurez('');
    }
  }, [respuesta, esNoImplementado]);

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
    // Validaciones
    if (!respuesta || justificacion.trim().length < 10) {
      toast.error('Completa la respuesta y justificación (mín 10 caracteres)');
      return;
    }

    if (requiereNivelMadurez) {
      if (nivelMadurez === 0) {
        toast.error('Debes indicar un nivel de madurez mayor a 0');
        return;
      }
      if (justificacionMadurez.trim().length < 10) {
        toast.error('Debes justificar el nivel de madurez (mín 10 caracteres)');
        return;
      }
    }

    try {
      setSaving(true);
      const data = {
        respuesta,
        justificacion,
        comentarios_adicionales: comentarios,
        nivel_madurez: nivelMadurez,
        justificacion_madurez: justificacionMadurez.trim(),
      };

      if (respuestaId) {
        const response = await respuestasApi.update(respuestaId, data);
        toast.success('Respuesta guardada como borrador');
        onRespuestaChange(mapToListItem(response.data));
      } else {
        const response = await respuestasApi.create({
          asignacion: asignacionId,
          pregunta: pregunta.id,
          ...data,
        });
        setRespuestaId(response.data?.id ?? null);
        toast.success('Respuesta creada como borrador');
        onRespuestaChange(mapToListItem(response.data));
      }
    } catch (error: any) {
      console.error('Error al guardar:', error);
      toast.error(error.response?.data?.message || 'Error al guardar la respuesta');
    } finally {
      setSaving(false);
    }
  };

  const handleEnviar = async () => {
    if (!respuestaId) {
      toast.error('Primero debes guardar la respuesta como borrador');
      return;
    }

    if (puedeSubirEvidencias && evidencias.length === 0) {
      toast.error(`Las respuestas "Sí Cumple" o "Cumple Parcial" requieren al menos una evidencia`);
      return;
    }

    if (requiereNivelMadurez && nivelMadurez === 0) {
      toast.error('Debes indicar un nivel de madurez mayor a 0 antes de enviar');
      return;
    }

    try {
      setSaving(true);
      await respuestasApi.enviar(respuestaId);
      setEstado('enviado');
      toast.success('✅ Respuesta enviada exitosamente');
      
      const respuestaActualizada = await respuestasApi.get(respuestaId);
      onRespuestaChange(mapToListItem(respuestaActualizada));
    } catch (error: any) {
      console.error('Error al enviar:', error);
      toast.error(error.response?.data?.message || 'Error al enviar la respuesta');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarEvidencia = async (evidenciaId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta evidencia?')) return;

    try {
      await respuestasApi.eliminarEvidencia(evidenciaId);
      setEvidencias(prev => prev.filter(e => e.id !== evidenciaId));
      toast.success('Evidencia eliminada');
    } catch (error) {
      toast.error('Error al eliminar la evidencia');
    }
  };

  const mapToListItem = (data: any): RespuestaListItem => ({
    id: data?.id || '',
    asignacion: data?.asignacion || '',
    pregunta: data?.pregunta || '',
    pregunta_codigo: data?.pregunta_codigo || '',
    pregunta_texto: data?.pregunta_texto || '',
    respuesta: data?.respuesta || 'NO_APLICA',
    respuesta_display: data?.respuesta_display || '',
    justificacion: data?.justificacion || '',
    nivel_madurez: data?.nivel_madurez || 0,
    nivel_madurez_display: data?.nivel_madurez_display || '',
    justificacion_madurez: data?.justificacion_madurez || '',
    estado: data?.estado || 'borrador',
    estado_display: data?.estado_display || '',
    respondido_por: Number(data?.respondido_por) || 0,
    respondido_por_nombre: data?.respondido_por_nombre || '',
    respondido_at: data?.respondido_at || '',
    total_evidencias: data?.evidencias?.length || 0,
    version: data?.version || 0,
  });

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

          {/* Selector de cumplimiento */}
          <SelectorCumplimiento
            valor={respuesta}
            onChange={setRespuesta}
            disabled={!puedeEditar}
          />

          {/* Selector de nivel de madurez */}
          {requiereNivelMadurez && (
            <SelectorNivelMadurez
              nivelMadurez={nivelMadurez}
              onNivelChange={setNivelMadurez}
              justificacion={justificacionMadurez}
              onJustificacionChange={setJustificacionMadurez}
              modoLectura={!puedeEditar}
            />
          )}

          {/* Justificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Justificación <span className="text-red-500">*</span>
              <span className="text-gray-500 font-normal ml-2 text-xs">
                (mínimo 10 caracteres)
              </span>
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

          {/* Evidencias */}
          {puedeSubirEvidencias && (
            <SeccionEvidencias
              evidencias={evidencias}
              puedeEditar={puedeEditar}
              respuestaId={respuestaId}
              onAgregarEvidencia={() => setMostrarModalEvidencia(true)}
              onEliminarEvidencia={handleEliminarEvidencia}
            />
          )}

          {/* Comentarios */}
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

          {/* Botones */}
          {puedeEditar && (
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleGuardarBorrador}
                disabled={
                  saving || 
                  !respuesta || 
                  justificacion.trim().length < 10 ||
                  (requiereNivelMadurez && (nivelMadurez === 0 || justificacionMadurez.trim().length < 10))
                }
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
                  (puedeSubirEvidencias && evidencias.length === 0) ||
                  (requiereNivelMadurez && nivelMadurez === 0)
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

      {/* Modal */}
      {mostrarModalEvidencia && respuestaId && (
        <ModalEvidencia
          respuestaId={respuestaId}
          onClose={() => setMostrarModalEvidencia(false)}
          onSuccess={() => loadEvidencias(respuestaId)}
        />
      )}
    </>
  );
};