// src/components/respuestas/PreguntaCard.tsx

import React, { useState, useEffect } from 'react';
import {
  CheckCircle, Save, Send, FileText, AlertCircle, Ban, XCircle,
} from 'lucide-react';
import { Button, Card } from '@/components/common';
import { respuestasApi } from '@/api/endpoints/respuestas.api';
import { Pregunta, RespuestaListItem, Evidencia } from '@/types';
import { ModalEvidencia } from './ModalEvidencia';
import { SeccionEvidencias } from './SeccionEvidencias';
import toast from 'react-hot-toast';

interface PreguntaCardProps {
  pregunta: Pregunta;
  numero: number;
  asignacionId: string;
  respuestaExistente?: RespuestaListItem;
  onRespuestaChange: (respuesta: RespuestaListItem) => void;
}

// ── Opciones que puede elegir el usuario ────────────────────────────────────
// SI        → cumple, sube evidencias, auditor califica
// NO        → no cumple, nivel 0, sin evidencias
// NO_APLICA → excluida del cálculo GAP completamente
type ModoUsuario = 'SI' | 'NO' | 'NO_APLICA' | '';

export const PreguntaCard: React.FC<PreguntaCardProps> = ({
  pregunta,
  numero,
  asignacionId,
  respuestaExistente,
  onRespuestaChange,
}) => {
  const getApiErrorMessage = (error: any, fallback: string) => {
    const data = error?.response?.data;
    if (!data) return fallback;

    if (data.errors && typeof data.errors === 'object') {
      if (typeof data.errors.detalle === 'string' && data.errors.detalle.trim()) {
        return data.errors.detalle;
      }

      if (Array.isArray(data.errors.respuesta) && data.errors.respuesta.length > 0) {
        return String(data.errors.respuesta[0]);
      }

      if (typeof data.errors.respuesta === 'string' && data.errors.respuesta.trim()) {
        return data.errors.respuesta;
      }

      const firstKey = Object.keys(data.errors)[0];
      const firstValue = data.errors[firstKey];
      if (Array.isArray(firstValue) && firstValue.length > 0) {
        return String(firstValue[0]);
      }
      if (typeof firstValue === 'string') {
        return firstValue;
      }
    }

    if (typeof data.detail === 'string' && data.detail.trim()) {
      return data.detail;
    }

    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }

    return fallback;
  };

  const [modoSeleccionado, setModoSeleccionado] = useState<ModoUsuario>('');
  const [justificacion, setJustificacion]       = useState('');
  const [comentarios, setComentarios]           = useState('');
  const [evidencias, setEvidencias]             = useState<Evidencia[]>([]);
  const [respuestaId, setRespuestaId]           = useState<string | null>(null);
  const [estado, setEstado]                     = useState<RespuestaListItem['estado']>('borrador');
  const [saving, setSaving]                     = useState(false);
  const [mostrarModalEvidencia, setMostrarModalEvidencia] = useState(false);

  const puedeEditar = estado === 'borrador';
  const yaEnviada   = estado !== 'borrador';

  // ── Cargar datos existentes ───────────────────────────────────────────────
  useEffect(() => {
    if (respuestaExistente) {
      setRespuestaId(respuestaExistente.id);
      setEstado(respuestaExistente.estado);
      setJustificacion(respuestaExistente.justificacion || '');
      setComentarios(respuestaExistente.comentarios_adicionales || '');

      // Determinar modo según respuesta guardada
      if (respuestaExistente.respuesta === 'NO_APLICA') {
        setModoSeleccionado('NO_APLICA');
      } else if (respuestaExistente.respuesta === 'NO_CUMPLE') {
        setModoSeleccionado('NO');
      } else if (respuestaExistente.respuesta === null) {
        setModoSeleccionado('SI');
      }

      if (respuestaExistente.id) {
        loadEvidencias(respuestaExistente.id);
      }
    }
  }, [respuestaExistente]);

  const loadEvidencias = async (id: string) => {
    try {
      const detalle = await respuestasApi.get(id);
      const data = (detalle as any).data || detalle;
      if (data?.evidencias) setEvidencias(data.evidencias);
    } catch (error) {
      console.error('Error al cargar evidencias:', error);
    }
  };

  // ── Cambiar modo ──────────────────────────────────────────────────────────
  const handleCambiarModo = (modo: ModoUsuario) => {
    setModoSeleccionado(modo);
    if (modo === 'NO' || modo === 'NO_APLICA') {
      setEvidencias([]);
    }
  };

  // ── Guardar borrador ──────────────────────────────────────────────────────
  const handleGuardarBorrador = async () => {
    if (!modoSeleccionado) {
      toast.error('Selecciona una opción primero');
      return;
    }
    if (justificacion.trim().length < 10) {
      toast.error('La justificación debe tener al menos 10 caracteres');
      return;
    }

    try {
      setSaving(true);

      // Mapear modo → valor para el backend
      // SI        → null  (auditor calificará con evidencias)
      // NO        → 'NO_CUMPLE' (pre-marcado, nivel 0)
      // NO_APLICA → 'NO_APLICA'
      const respuestaValor =
        modoSeleccionado === 'NO_APLICA' ? ('NO_APLICA' as const)
        : modoSeleccionado === 'NO'      ? ('NO_CUMPLE' as const)
        : null;

      const payload = {
        respuesta: respuestaValor,
        justificacion,
        comentarios_adicionales: comentarios,
      };

      if (respuestaId) {
        await respuestasApi.update(respuestaId, payload);
        const actualizada = await respuestasApi.get(respuestaId);
        sincronizarEstado(actualizada);
        onRespuestaChange(mapToListItem(actualizada));
        toast.success('Borrador guardado');
      } else {
        const res = await respuestasApi.create({
          asignacion: asignacionId,
          pregunta: pregunta.id,
          ...payload,
        });

        let creada = (res as any).data || res;
        if (creada && 'data' in creada) creada = creada.data;
        if (!creada?.id) throw new Error('El servidor no devolvió una respuesta válida');

        setRespuestaId(creada.id);
        const completa = await respuestasApi.get(creada.id);
        sincronizarEstado(completa);
        onRespuestaChange(mapToListItem(completa));
        toast.success('Respuesta creada como borrador');
      }
    } catch (error: any) {
      console.error('Error al guardar:', error);
      toast.error(getApiErrorMessage(error, 'Error al guardar la respuesta'));
    } finally {
      setSaving(false);
    }
  };

  // ── Enviar respuesta ──────────────────────────────────────────────────────
  const handleEnviar = async () => {
    if (!respuestaId) {
      toast.error('Primero guarda la respuesta como borrador');
      return;
    }
    if (modoSeleccionado === 'SI' && evidencias.filter(e => e.activo).length === 0) {
      toast.error('Debes subir al menos una evidencia antes de enviar');
      return;
    }

    try {
      setSaving(true);
      const res = await respuestasApi.enviar(respuestaId);
      const data = (res as any).data || res;
      const asignacionCompleta = data?.asignacion_completa || false;

      setEstado('enviado');

      if (asignacionCompleta) {
        toast.success('¡Evaluación completada! Se notificó al auditor para revisión.', { duration: 5000 });
      } else {
        toast.success('Respuesta enviada exitosamente');
      }

      const actualizada = await respuestasApi.get(respuestaId);
      onRespuestaChange(mapToListItem(actualizada));
    } catch (error: any) {
      console.error('Error al enviar:', error);
      toast.error(getApiErrorMessage(error, 'Error al enviar la respuesta'));
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarEvidencia = async (evidenciaId: string) => {
    if (!confirm('¿Eliminar esta evidencia?')) return;
    try {
      await respuestasApi.eliminarEvidencia(evidenciaId);
      setEvidencias(prev => prev.filter(e => e.id !== evidenciaId));
      toast.success('Evidencia eliminada');
    } catch {
      toast.error('Error al eliminar la evidencia');
    }
  };

  const sincronizarEstado = (data: any) => {
    setJustificacion(data.justificacion || '');
    setComentarios(data.comentarios_adicionales || '');
    setEstado(data.estado || 'borrador');
    if (data.evidencias) setEvidencias(data.evidencias);

    // ⭐ Sincronizar modo según respuesta guardada en BD
    if (data.respuesta === 'NO_APLICA') {
      setModoSeleccionado('NO_APLICA');
    } else if (data.respuesta === 'NO_CUMPLE') {
      setModoSeleccionado('NO');
    } else if (data.respuesta === null || data.respuesta === undefined) {
      setModoSeleccionado('SI');
    }
  };

  const mapToListItem = (data: any): RespuestaListItem => ({
    id: data?.id || '',
    asignacion: data?.asignacion || '',
    pregunta: data?.pregunta || '',
    pregunta_codigo: data?.pregunta_codigo || '',
    pregunta_texto: data?.pregunta_texto || '',
    respuesta: data?.respuesta ?? null,
    justificacion: data?.justificacion || '',
    comentarios_adicionales: data?.comentarios_adicionales || '',
    calificacion_auditor: data?.calificacion_auditor || null,
    calificacion_display: data?.calificacion_display || '',
    nivel_madurez: Number(data?.nivel_madurez) || 0,
    estado: data?.estado || 'borrador',
    estado_display: data?.estado_display || '',
    respondido_por: Number(data?.respondido_por) || 0,
    respondido_por_nombre: data?.respondido_por_nombre || '',
    respondido_at: data?.respondido_at || '',
    total_evidencias: data?.evidencias?.length ?? data?.total_evidencias ?? 0,
    version: data?.version || 0,
  });

  // ── Helpers de UI ─────────────────────────────────────────────────────────
  const getEstadoBadge = () => {
    switch (estado) {
      case 'enviado':
      case 'pendiente_auditoria':
        return (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle size={11} /> Enviada — Esperando auditor
          </span>
        );
      case 'auditado':
        return (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle size={11} /> Auditada
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
            Borrador
          </span>
        );
    }
  };

  const getModoLecturaInfo = () => {
    const r = respuestaExistente?.respuesta;
    if (r === 'NO_APLICA')  return { icon: <Ban size={15} className="text-gray-500" />,       texto: 'Marcada como No Aplica',        color: 'bg-gray-100 border-gray-200 text-gray-700' };
    if (r === 'NO_CUMPLE')  return { icon: <XCircle size={15} className="text-red-500" />,    texto: 'Respondida como No',   color: 'bg-red-50 border-red-200 text-red-700' };
    return                         { icon: <FileText size={15} className="text-primary-500" />, texto: 'Enviada con evidencias', color: 'bg-blue-50 border-blue-200 text-blue-700' };
  };

  const cardBorder =
    estado === 'auditado' ? 'border-green-300 bg-green-50/40'
    : yaEnviada           ? 'border-blue-200 bg-blue-50/30'
    : '';

  return (
    <>
      <Card className={cardBorder}>
        <div className="space-y-5">

          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-1 bg-primary-100 text-primary-700 rounded text-xs font-semibold">
                  {numero}
                </span>
                <span className="text-xs text-gray-500 font-medium">{pregunta.codigo}</span>
                {getEstadoBadge()}
              </div>
              <h3 className="text-base font-semibold text-gray-900">{pregunta.titulo}</h3>
              {pregunta.texto && (
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{pregunta.texto}</p>
              )}
            </div>
          </div>

          {/* ── Selector de modo (solo en borrador) ── */}
          {puedeEditar && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                ¿Tu organización cumple con esto?
                <span className="text-red-500 ml-1">*</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                {/* Sí */}
                <button
                  type="button"
                  onClick={() => handleCambiarModo('SI')}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    modoSeleccionado === 'SI'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${modoSeleccionado === 'SI' ? 'bg-primary-100' : 'bg-gray-100'}`}>
                    <FileText size={18} className={modoSeleccionado === 'SI' ? 'text-primary-600' : 'text-gray-500'} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${modoSeleccionado === 'SI' ? 'text-primary-700' : 'text-gray-800'}`}>Sí</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      Adjunta documentos de respaldo para su revisión.
                    </p>
                  </div>
                  {modoSeleccionado === 'SI' && <CheckCircle size={16} className="text-primary-500 shrink-0 mt-0.5" />}
                </button>

                {/* No */}
                <button
                  type="button"
                  onClick={() => handleCambiarModo('NO')}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    modoSeleccionado === 'NO'
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${modoSeleccionado === 'NO' ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <XCircle size={18} className={modoSeleccionado === 'NO' ? 'text-red-500' : 'text-gray-400'} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${modoSeleccionado === 'NO' ? 'text-red-700' : 'text-gray-800'}`}>No</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      Reconoce el no cumplimiento del mencionado control.
                    </p>
                  </div>
                  {modoSeleccionado === 'NO' && <CheckCircle size={16} className="text-red-400 shrink-0 mt-0.5" />}
                </button>

                {/* No Aplica */}
                <button
                  type="button"
                  onClick={() => handleCambiarModo('NO_APLICA')}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    modoSeleccionado === 'NO_APLICA'
                      ? 'border-gray-500 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${modoSeleccionado === 'NO_APLICA' ? 'bg-gray-200' : 'bg-gray-100'}`}>
                    <Ban size={18} className={modoSeleccionado === 'NO_APLICA' ? 'text-gray-600' : 'text-gray-400'} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${modoSeleccionado === 'NO_APLICA' ? 'text-gray-700' : 'text-gray-800'}`}>No Aplica</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      Este criterio no aplica a tu organización.
                    </p>
                  </div>
                  {modoSeleccionado === 'NO_APLICA' && <CheckCircle size={16} className="text-gray-500 shrink-0 mt-0.5" />}
                </button>

              </div>
            </div>
          )}

          {/* ── Vista solo lectura ── */}
          {yaEnviada && (() => {
            const { icon, texto, color } = getModoLecturaInfo();
            return (
              <div className={`flex items-center gap-2 p-3 rounded-lg border ${color}`}>
                {icon}
                <span className="text-sm font-medium">{texto}</span>
              </div>
            );
          })()}

          {/* ── Justificación ── */}
          {(modoSeleccionado || yaEnviada) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justificación <span className="text-red-500">*</span>
                {modoSeleccionado === 'NO_APLICA' && <span className="text-gray-500 font-normal ml-2 text-xs">— Explica por qué no aplica</span>}
                {modoSeleccionado === 'NO'        && <span className="text-gray-500 font-normal ml-2 text-xs">— Explica por qué no cumple</span>}
                <span className="text-gray-400 font-normal ml-2 text-xs">(mín. 10 caracteres)</span>
              </label>
              <textarea
                value={justificacion}
                onChange={e => setJustificacion(e.target.value)}
                disabled={!puedeEditar}
                rows={4}
                placeholder={
                  modoSeleccionado === 'NO_APLICA' ? 'Explica por qué esta pregunta no aplica a tu organización...'
                  : modoSeleccionado === 'NO'      ? 'Explica por qué tu organización no cumple con este requisito...'
                  : 'Describe brevemente el contexto de las evidencias adjuntas...'
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              />
              <p className={`text-xs mt-1 ${justificacion.length < 10 ? 'text-red-400' : 'text-gray-400'}`}>
                {justificacion.length} caracteres
              </p>
            </div>
          )}

          {/* ── Evidencias (solo si eligió SI) ── */}
          {(modoSeleccionado === 'SI' || (yaEnviada && respuestaExistente?.respuesta === null)) && (
            <SeccionEvidencias
              evidencias={evidencias}
              puedeEditar={puedeEditar}
              respuestaId={respuestaId}
              onAgregarEvidencia={() => setMostrarModalEvidencia(true)}
              onEliminarEvidencia={handleEliminarEvidencia}
            />
          )}

          {/* ── Aviso sin evidencias ── */}
          {modoSeleccionado === 'SI' && puedeEditar && evidencias.filter(e => e.activo).length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle size={16} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700">
                Debes subir al menos una evidencia antes de poder enviar esta respuesta.
              </p>
            </div>
          )}

          {/* ── Comentarios adicionales ── */}
          {(modoSeleccionado || yaEnviada) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios Adicionales <span className="text-gray-500 font-normal ml-2 text-xs">(Opcional)</span>
              </label>
              <textarea
                value={comentarios}
                onChange={e => setComentarios(e.target.value)}
                disabled={!puedeEditar}
                rows={2}
                placeholder="Observaciones o notas adicionales..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              />
            </div>
          )}

          {/* ── Calificación del auditor ── */}
          {estado === 'auditado' && respuestaExistente?.calificacion_auditor && (
            <div className="p-4 rounded-xl border border-green-200 bg-green-50 space-y-2">
              <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Calificación del Auditor</p>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  respuestaExistente.calificacion_auditor === 'SI_CUMPLE'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : respuestaExistente.calificacion_auditor === 'CUMPLE_PARCIAL'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }`}>
                  {respuestaExistente.calificacion_display || respuestaExistente.calificacion_auditor}
                </span>
                {respuestaExistente.nivel_madurez > 0 && (
                  <span className="text-xs text-gray-600">
                    Nivel de madurez: <strong>{respuestaExistente.nivel_madurez}</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Botones ── */}
          {puedeEditar && modoSeleccionado && (
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleGuardarBorrador}
                disabled={saving || justificacion.trim().length < 10}
                type="button"
              >
                <Save size={15} className="mr-1.5" />
                {saving ? 'Guardando...' : 'Guardar Borrador'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleEnviar}
                disabled={
                  saving ||
                  !respuestaId ||
                  (modoSeleccionado === 'SI' && evidencias.filter(e => e.activo).length === 0)
                }
                type="button"
              >
                <Send size={15} className="mr-1.5" />
                {saving ? 'Enviando...' : 'Enviar Respuesta'}
              </Button>
            </div>
          )}

        </div>
      </Card>

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