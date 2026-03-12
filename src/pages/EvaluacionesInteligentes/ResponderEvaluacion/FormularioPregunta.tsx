// src/pages/EvaluacionesInteligentes/ResponderEvaluacion/FormularioPregunta.tsx

import { useState, useEffect, useRef } from 'react';
import {
  AlertCircle, CheckCircle, Upload, X, FileText,
  Send, Lock, Info, Clock,
} from 'lucide-react';
import { respuestaIQApi } from '@/api/endpoints/respuesta-iq.api';
import toast from 'react-hot-toast';
import type {
  PreguntaConRespuesta,
  CrearRespuestaIQData,
  RespuestaUsuario,
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
  const [archivosNuevos, setArchivosNuevos] = useState<File[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [respuestaId, setRespuestaId] = useState<number | null>(
    respuestaExistente?.id ?? null
  );
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sincronizar cuando cambia la pregunta ───────────────────────────────────
  useEffect(() => {
    setRespuesta(respuestaExistente?.respuesta ?? null);
    setJustificacion(respuestaExistente?.justificacion ?? '');
    setComentarios(respuestaExistente?.comentarios_adicionales ?? '');
    setRespuestaId(respuestaExistente?.id ?? null);
    setArchivosNuevos([]);
    setUltimoGuardado(null);
  }, [pregunta.id]);

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

  // ── Archivos ────────────────────────────────────────────────────────────────
  const totalEvidencias =
    (respuestaExistente?.evidencias?.length ?? 0) + archivosNuevos.length;

  const handleSeleccionarArchivos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (totalEvidencias + files.length > 3) {
      toast.error('Máximo 3 evidencias en total');
      return;
    }
    const grandes = files.filter(f => f.size > 10 * 1024 * 1024);
    if (grandes.length) {
      toast.error('Algunos archivos superan 10MB');
      return;
    }
    setArchivosNuevos(prev => [...prev, ...files]);
    e.target.value = '';
  };

  // ── Enviar (borrador → enviado) ─────────────────────────────────────────────
  const handleEnviar = async () => {
    if (justificacion.length < 10) {
      toast.error('La justificación debe tener al menos 10 caracteres');
      return;
    }
    const tieneEvidencias = totalEvidencias > 0;
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

      // 2. Subir archivos nuevos
      if (archivosNuevos.length > 0 && idActual) {
        toast.loading(`Subiendo ${archivosNuevos.length} evidencia(s)...`, { id: 'envio' });
        for (const archivo of archivosNuevos) {
          await respuestaIQApi.subirEvidencia(idActual, archivo);
        }
        setArchivosNuevos([]);
      }

      // 3. Enviar → el backend actualiza el progreso de la asignación
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
        {r.evidencias && r.evidencias.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Evidencias ({r.evidencias.length})
            </p>
            <div className="space-y-2">
              {r.evidencias.map(ev => (
                <a
                  key={ev.id}
                  href={ev.url_archivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FileText size={18} className="text-primary-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ev.titulo_documento}</p>
                    <p className="text-xs text-gray-400">{ev.tamanio_mb?.toFixed(2)} MB</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

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

      {/* Uploader de evidencias — solo si responde "Sí" */}
      {necesitaEvidencias && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Evidencias *{' '}
            <span className="text-gray-400 font-normal">({totalEvidencias}/3)</span>
          </label>

          {/* Evidencias ya en backend */}
          {(respuestaExistente?.evidencias?.length ?? 0) > 0 && (
            <div className="mb-3 space-y-1">
              <p className="text-xs text-gray-500">Ya subidas:</p>
              {respuestaExistente!.evidencias.map(ev => (
                <div
                  key={ev.id}
                  className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg"
                >
                  <FileText size={15} className="text-green-600" />
                  <p className="text-sm flex-1 truncate">{ev.titulo_documento}</p>
                  <CheckCircle size={13} className="text-green-500" />
                </div>
              ))}
            </div>
          )}

          {/* Archivos pendientes de subir */}
          {archivosNuevos.length > 0 && (
            <div className="mb-3 space-y-1">
              <p className="text-xs text-gray-500">Se subirán al enviar:</p>
              {archivosNuevos.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <FileText size={15} className="text-primary-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setArchivosNuevos(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Drop zone */}
          {totalEvidencias < 3 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                onChange={handleSeleccionarArchivos}
                multiple
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <Upload className="mx-auto mb-2 text-gray-400" size={28} />
                <p className="text-sm text-gray-600">Click para seleccionar archivos</p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, Word, Excel, PowerPoint, Imágenes — máx. 10MB c/u
                </p>
              </label>
            </div>
          )}
        </div>
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
    </div>
  );
};