// src/pages/EvaluacionesInteligentes/ResponderEvaluacion/FormularioPregunta.tsx

import { useState, useEffect, useRef } from 'react';
import {
  AlertCircle, CheckCircle, Upload, FileText,
  Send, Lock, Info, Clock, Link as LinkIcon, Trash2, ExternalLink,
} from 'lucide-react';
import { respuestaIQApi } from '@/api/endpoints/respuesta-iq.api';
import { ModalEvidenciaIQ } from '@/components/EvaluacionesInteligentes/ModalEvidenciaIQ';
import { Button } from '@/components/common';
import toast from 'react-hot-toast';
import type {
  PreguntaConRespuesta,
  CrearRespuestaIQData,
  RespuestaUsuario,
  Evidencia,
} from '@/types/respuesta-iq.types';
import {
  OPCIONES_RESPUESTA_USUARIO,
  requiereEvidencias,
  estaEnviada,
} from '@/types/respuesta-iq.types';

interface Props {
  pregunta: PreguntaConRespuesta;
  asignacionId: number;
  onRespuestaGuardada: () => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const FormularioPregunta = ({ pregunta, asignacionId, onRespuestaGuardada }: Props) => {
  const respuestaExistente = pregunta.respuesta;
  const yaEnviada = respuestaExistente ? estaEnviada(respuestaExistente.estado) : false;

  // ── Estado del formulario ───────────────────────────────────────────────────
  const [respuesta, setRespuesta] = useState<RespuestaUsuario>(
    respuestaExistente?.respuesta ?? null
  );
  const [justificacion, setJustificacion] = useState(
    respuestaExistente?.justificacion ?? ''
  );
  const [comentarios, setComentarios] = useState(
    respuestaExistente?.comentarios_adicionales ?? ''
  );
  const [modalEvidenciaAbierto, setModalEvidenciaAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [respuestaId, setRespuestaId] = useState<number | null>(
    respuestaExistente?.id ?? null
  );
  const [evidencias, setEvidencias] = useState<Evidencia[]>(
    respuestaExistente?.evidencias ?? []
  );
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sincronizar cuando cambia la pregunta ───────────────────────────────────
  useEffect(() => {
    setRespuesta(respuestaExistente?.respuesta ?? null);
    setJustificacion(respuestaExistente?.justificacion ?? '');
    setComentarios(respuestaExistente?.comentarios_adicionales ?? '');
    setRespuestaId(respuestaExistente?.id ?? null);
    setEvidencias(respuestaExistente?.evidencias ?? []);
    setUltimoGuardado(null);
  }, [pregunta.id, respuestaExistente?.id, respuestaExistente?.evidencias]);

  // ── Auto-guardado borrador ──────────────────────────────────────────────────
  useEffect(() => {
    if (yaEnviada) return;
    if (justificacion.length < 10) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => guardarBorrador(true), 1500);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [respuesta, justificacion, comentarios]);

  // ── Guardar borrador ────────────────────────────────────────────────────────
  const guardarBorrador = async (silencioso = false) => {
    if (justificacion.length < 10) {
      if (!silencioso) toast.error('La justificación debe tener al menos 10 caracteres');
      return;
    }
    const payload: CrearRespuestaIQData = {
      asignacion: asignacionId,
      pregunta: pregunta.id,
      respuesta,
      justificacion,
      comentarios_adicionales: comentarios,
    };
    try {
      setGuardando(true);
      if (respuestaId) {
        await respuestaIQApi.actualizar(respuestaId, payload);
      } else {
        const nueva = await respuestaIQApi.crear(payload);
        setRespuestaId(nueva.id);
      }
      setUltimoGuardado(new Date());
      if (!silencioso) toast.success('Borrador guardado');
    } catch (error: any) {
      if (!silencioso) {
        const msg =
          error.response?.data?.pregunta?.[0] ||
          error.response?.data?.detail ||
          'Error al guardar';
        toast.error(msg);
      }
    } finally {
      setGuardando(false);
    }
  };

  // ── Evidencias ─────────────────────────────────────────────────────────────
  const totalEvidencias = evidencias.length;

  const handleAbrirModal = async () => {
    if (totalEvidencias >= 3) {
      toast.error('Máximo 3 evidencias por pregunta');
      return;
    }
    // Si no hay borrador guardado aún, guardar primero para obtener respuestaId
    if (!respuestaId) {
      if (justificacion.length < 10) {
        toast.error('Escribe al menos 10 caracteres en la justificación antes de agregar evidencias');
        return;
      }
      await guardarBorrador(true);
      // respuestaId se seteó dentro de guardarBorrador vía setRespuestaId
    }
    setModalEvidenciaAbierto(true);
  };

  const getFileUrl = (url?: string | null) => {
    if (!url) return '#';
    return url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
  };

  const handleEliminarEvidencia = async (evidencia: Evidencia) => {
    if (!confirm('¿Eliminar esta evidencia?')) return;
    try {
      await respuestaIQApi.eliminarEvidencia(evidencia.id);
      setEvidencias(prev => prev.filter(item => item.id !== evidencia.id));
      toast.success('Evidencia eliminada');
      await onRespuestaGuardada();
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'No fue posible eliminar la evidencia'
      );
    }
  };

  const renderEvidencias = (puedeEditar: boolean) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Evidencias <span className="text-red-500">*</span>
          <span className="text-gray-500 font-normal ml-2 text-xs">(máximo 3 archivos)</span>
        </label>

        {evidencias.length > 0 && (
          <div className="space-y-2 mb-3">
            {evidencias.map((evidencia) => (
              <div
                key={evidencia.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="bg-white p-2 rounded border border-gray-100 shadow-sm flex-shrink-0">
                    {evidencia.es_documento_oficial ? (
                      <LinkIcon size={20} className="text-blue-600" />
                    ) : (
                      <FileText size={20} className="text-primary-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {(evidencia.es_documento_oficial
                          ? evidencia.codigo_documento_maestro
                          : evidencia.codigo_documento) || 'Sin código'}{' '}
                        - {(evidencia.es_documento_oficial
                          ? evidencia.nombre_documento_maestro
                          : evidencia.titulo_documento) || evidencia.titulo_documento}
                      </p>
                      {evidencia.es_documento_oficial && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase flex-shrink-0">
                          Oficial
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {evidencia.tipo_documento_enum}
                      {evidencia.nombre_archivo_original ? ` · ${evidencia.nombre_archivo_original}` : ''}
                      {typeof evidencia.tamanio_mb === 'number' ? ` (${evidencia.tamanio_mb.toFixed(2)} MB)` : ''}
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
                      onClick={() => handleEliminarEvidencia(evidencia)}
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

        {puedeEditar && evidencias.length < 3 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAbrirModal}
            disabled={guardando || enviando || !respuestaId}
            type="button"
            className="w-full sm:w-auto"
          >
            <Upload size={16} className="mr-2" />
            Agregar Evidencia
          </Button>
        )}

        {!respuestaId && puedeEditar && (
          <p className="text-xs text-amber-600 mt-2">
            Guarda primero la respuesta como borrador para poder agregar evidencias.
          </p>
        )}

        {evidencias.length === 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Aún no has agregado evidencias.
          </p>
        )}
      </div>
    );
  };

  // ── Enviar (borrador → enviado) ─────────────────────────────────────────────
  const handleEnviar = async () => {
    if (justificacion.length < 10) {
      toast.error('La justificación debe tener al menos 10 caracteres');
      return;
    }
    const tieneEvidencias = evidencias.length > 0;
    if (respuesta === null && !tieneEvidencias) {
      toast.error('Debes subir al menos una evidencia para responder "Sí"');
      return;
    }

    try {
      setEnviando(true);

      // 1. Guardar/crear borrador
      toast.loading('Guardando...', { id: 'envio' });
      const payload: CrearRespuestaIQData = {
        asignacion: asignacionId,
        pregunta: pregunta.id,
        respuesta,
        justificacion,
        comentarios_adicionales: comentarios,
      };
      let idActual = respuestaId;
      if (idActual) {
        await respuestaIQApi.actualizar(idActual, payload);
      } else {
        const nueva = await respuestaIQApi.crear(payload);
        idActual = nueva.id;
        setRespuestaId(nueva.id);
      }

      // 2. Enviar → el backend actualiza el progreso de la asignación
      toast.loading('Enviando al auditor...', { id: 'envio' });
      const resultado = await respuestaIQApi.enviar(idActual!);

      if (resultado.asignacion_completa) {
        toast.success(
          '🎉 ¡Completaste todas las preguntas! El auditor fue notificado.',
          { id: 'envio', duration: 5000 }
        );
      } else {
        toast.success('✅ Respuesta enviada correctamente', { id: 'envio' });
      }

      await onRespuestaGuardada();
    } catch (error: any) {
      const msg =
        error.response?.data?.evidencias?.[0] ||
        error.response?.data?.estado?.[0] ||
        error.response?.data?.detail ||
        error.response?.data?.error ||
        'Error al enviar';
      toast.error(msg, { id: 'envio' });
    } finally {
      setEnviando(false);
    }
  };

  const necesitaEvidencias = requiereEvidencias(respuesta);

  // ─────────────────────────────────────────────────────────────────────────────
  // VISTA READ-ONLY: respuesta enviada o auditada
  // ─────────────────────────────────────────────────────────────────────────────
  if (yaEnviada) {
    const r = respuestaExistente!;
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">

        {/* Badge de estado */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
          r.estado === 'auditado'
            ? 'bg-green-50 border border-green-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          {r.estado === 'auditado'
            ? <CheckCircle size={20} className="text-green-600" />
            : <Clock size={20} className="text-blue-600" />
          }
          <div>
            <p className={`font-medium text-sm ${
              r.estado === 'auditado' ? 'text-green-800' : 'text-blue-800'
            }`}>
              {r.estado === 'auditado'
                ? 'Auditada'
                : 'Enviada — pendiente de auditoría'}
            </p>
            {r.estado === 'auditado' && r.auditado_por_nombre && (
              <p className="text-xs text-green-600">Auditada por {r.auditado_por_nombre}</p>
            )}
          </div>
          <Lock size={16} className="ml-auto text-gray-400" />
        </div>

        {/* Pregunta */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {pregunta.codigo_control}: {pregunta.nombre_control}
          </h3>
          <p className="text-gray-700 mb-1">{pregunta.pregunta}</p>
          <p className="text-sm text-gray-500">
            <strong>Objetivo:</strong> {pregunta.objetivo_evaluacion}
          </p>
        </div>

        {/* Respuesta + justificación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Tu respuesta</p>
            <p className="font-medium text-gray-900">
              {r.respuesta === null ? 'Sí' : r.respuesta === 'NO_CUMPLE' ? 'No' : 'No Aplica'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Justificación</p>
            <p className="text-sm text-gray-700">{r.justificacion}</p>
          </div>
        </div>

        {/* Evidencias */}
        {evidencias.length > 0 && renderEvidencias(false)}

        {/* Calificación del auditor */}
        {r.estado === 'auditado' && r.calificacion_auditor && (
          <div className={`rounded-lg p-4 border ${
            r.calificacion_auditor === 'SI_CUMPLE'
              ? 'bg-green-50 border-green-200'
              : r.calificacion_auditor === 'CUMPLE_PARCIAL'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <p className="text-xs font-semibold uppercase text-gray-500 mb-3">
              Calificación del Auditor
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Calificación</p>
                <p className="font-semibold">{r.calificacion_display}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Nivel de Madurez</p>
                <p className="font-semibold">{r.nivel_madurez}</p>
              </div>
              {r.comentarios_auditor && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Comentarios</p>
                  <p className="text-sm text-gray-700">{r.comentarios_auditor}</p>
                </div>
              )}
              {r.recomendaciones_auditor && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Recomendaciones</p>
                  <p className="text-sm text-gray-700">{r.recomendaciones_auditor}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VISTA EDITABLE: borrador o nueva respuesta
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">

      {/* Indicador de borrador */}
      <div className="flex items-center gap-2 text-xs text-gray-400 h-4">
        {guardando && <span className="animate-pulse">● Guardando borrador...</span>}
        {!guardando && ultimoGuardado && (
          <>
            <CheckCircle size={12} className="text-green-500" />
            Borrador guardado a las {ultimoGuardado.toLocaleTimeString()}
          </>
        )}
      </div>

      {/* Pregunta */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {pregunta.codigo_control}: {pregunta.nombre_control}
        </h3>
        <p className="text-gray-700 mb-1">{pregunta.pregunta}</p>
        <p className="text-sm text-gray-500">
          <strong>Objetivo:</strong> {pregunta.objetivo_evaluacion}
        </p>
      </div>

      {/* Evidencias sugeridas */}
      {pregunta.evidencias_requeridas.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">
                Evidencias sugeridas:
              </p>
              <ul className="text-sm text-blue-700 space-y-0.5">
                {pregunta.evidencias_requeridas.map(ev => (
                  <li key={ev.orden}>• {ev.descripcion}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Opciones de respuesta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ¿Cumples con este control? *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {OPCIONES_RESPUESTA_USUARIO.map(opcion => {
            const seleccionada = respuesta === opcion.value;
            return (
              <button
                key={String(opcion.value)}
                type="button"
                onClick={() => setRespuesta(opcion.value)}
                className={`px-4 py-4 rounded-lg border-2 transition-all text-left ${
                  seleccionada
                    ? opcion.value === null
                      ? 'border-green-500 bg-green-50'
                      : opcion.value === 'NO_CUMPLE'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-500 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <p className={`font-semibold text-sm ${
                  seleccionada
                    ? opcion.value === null
                      ? 'text-green-800'
                      : opcion.value === 'NO_CUMPLE'
                      ? 'text-red-800'
                      : 'text-gray-800'
                    : 'text-gray-700'
                }`}>
                  {opcion.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{opcion.descripcion}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aviso evidencias obligatorias */}
      {necesitaEvidencias && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Al responder <strong>"Sí"</strong> debes adjuntar al menos una evidencia antes de
            enviar. Puedes guardar el borrador primero y luego agregar los archivos.
          </p>
        </div>
      )}

      {/* Justificación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Justificación *{' '}
          <span className="text-gray-400 font-normal">(mínimo 10 caracteres)</span>
        </label>
        <textarea
          value={justificacion}
          onChange={e => setJustificacion(e.target.value)}
          rows={4}
          placeholder="Explica cómo cumples este control, o por qué no aplica..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
        />
        <p className={`text-xs mt-1 ${justificacion.length < 10 ? 'text-red-400' : 'text-gray-400'}`}>
          {justificacion.length} caracteres{justificacion.length < 10 ? ' (mínimo 10)' : ''}
        </p>
      </div>

      {/* Evidencias — solo si responde "Sí" */}
      {necesitaEvidencias && (
        renderEvidencias(true)
      )}

      {/* Comentarios adicionales */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comentarios adicionales{' '}
          <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          value={comentarios}
          onChange={e => setComentarios(e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => guardarBorrador(false)}
          disabled={guardando || enviando || justificacion.length < 10}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-sm"
        >
          {guardando ? 'Guardando...' : 'Guardar borrador'}
        </button>
        <button
          type="button"
          onClick={handleEnviar}
          disabled={enviando || justificacion.length < 10}
          className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
        >
          {enviando
            ? <span className="animate-pulse">Enviando...</span>
            : <><Send size={18} /> Enviar al auditor</>
          }
        </button>
      </div>

      {/* Modal de evidencias */}
      {modalEvidenciaAbierto && respuestaId && (
        <ModalEvidenciaIQ
          respuestaIQId={respuestaId}
          onClose={() => setModalEvidenciaAbierto(false)}
          onSuccess={() => {
            setModalEvidenciaAbierto(false);
            onRespuestaGuardada();
          }}
        />
      )}
    </div>
  );
};