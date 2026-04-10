// src/pages/EvaluacionesInteligentes/ResponderEvaluacion/ResponderEvaluacionIQ.tsx

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { respuestaIQApi } from '@/api/endpoints/respuesta-iq.api';
import toast from 'react-hot-toast';
import type { PreguntasAsignacionResponse } from '@/types/respuesta-iq.types';
import { FormularioPregunta } from './FormularioPregunta';

export const ResponderEvaluacionIQ = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading]                     = useState(true);
  const [data, setData]                           = useState<PreguntasAsignacionResponse | null>(null);
  const [preguntaActualIndex, setPreguntaActualIndex] = useState(0);
  const [avanzandoAuto, setAvanzandoAuto]         = useState(false);
  const prevRespondidas                           = useRef(0);

  useEffect(() => {
    if (id) cargarPreguntas();
  }, [id]);

  // Scroll al top cuando cambia la pregunta
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [preguntaActualIndex]);

  const cargarPreguntas = async () => {
    try {
      setLoading(true);
      const response = await respuestaIQApi.obtenerPreguntasAsignacion(Number(id));
      setData(response);

      const primeraLibre = response.preguntas.findIndex(p => !p.respuesta);
      if (primeraLibre !== -1) setPreguntaActualIndex(primeraLibre);
      prevRespondidas.current = response.asignacion.preguntas_respondidas;
    } catch (error) {
      toast.error('Error al cargar la evaluación');
      navigate('/evaluaciones-iq/mis-asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleRespuestaGuardada = async () => {
    await cargarPreguntas();

    // Detectar si se respondió una nueva pregunta y avanzar
    setData(prev => {
      if (!prev) return prev;
      const nuevasRespondidas = prev.preguntas.filter(p => p.respuesta).length;

      if (nuevasRespondidas > prevRespondidas.current) {
        prevRespondidas.current = nuevasRespondidas;
        setAvanzandoAuto(true);

        setTimeout(() => {
          setAvanzandoAuto(false);
          // Buscar siguiente sin responder
          const siguiente = prev.preguntas.findIndex(
            (p, i) => i > preguntaActualIndex && !p.respuesta
          );
          if (siguiente !== -1) {
            setPreguntaActualIndex(siguiente);
            toast.success('Avanzando a la siguiente pregunta', {
              duration: 1500,
              icon: '➡️',
            });
          }
        }, 1000);
      }

      return prev;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (!data) return null;

  const { asignacion, preguntas } = data;
  const preguntaActual = preguntas[preguntaActualIndex];

  const progreso = asignacion.total_preguntas > 0
    ? (asignacion.preguntas_respondidas / asignacion.total_preguntas) * 100
    : 0;

  const todasEnviadas =
    asignacion.preguntas_respondidas >= asignacion.total_preguntas &&
    asignacion.total_preguntas > 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">

      {/* ── Header ── */}
      <button
        onClick={() => navigate('/evaluaciones-iq/mis-asignaciones')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm">Volver a mis asignaciones</span>
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-1">{asignacion.evaluacion}</h1>
      <p className="text-sm text-gray-500 mb-5 capitalize">
        Estado: <span className="font-medium">{asignacion.estado.replace('_', ' ')}</span>
      </p>

      {/* ── Barra de progreso ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {asignacion.preguntas_respondidas} de {asignacion.total_preguntas} enviadas
          </span>
          <span className="text-sm font-bold text-primary-600">
            {progreso.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* ── Mini-mapa ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <p className="text-xs font-medium text-gray-500 mb-3">
          Pregunta {preguntaActualIndex + 1} de {preguntas.length}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {preguntas.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setPreguntaActualIndex(i)}
              title={p.codigo_control}
              className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${
                i === preguntaActualIndex
                  ? 'bg-primary-600 text-white shadow-md scale-110'
                  : p.respuesta
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {p.respuesta && i !== preguntaActualIndex ? '✓' : i + 1}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-100 inline-block" /> Respondida
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-100 inline-block" /> Pendiente
          </span>
        </div>
      </div>

      {/* ── Banner completado ── */}
      {(todasEnviadas || asignacion.estado === 'completada' || asignacion.estado === 'auditada') && (
        <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy size={28} className="text-green-600" />
          </div>
          <p className="font-bold text-green-800 text-lg mb-1">
            {asignacion.estado === 'auditada'
              ? '✅ Evaluación auditada'
              : '🎉 ¡Has respondido todo!'}
          </p>
          <p className="text-sm text-green-700 mb-4">
            {asignacion.estado === 'auditada'
              ? 'El auditor calificó todas las respuestas. Puedes ver el reporte GAP.'
              : 'Tu evaluación fue enviada al auditor. Puedes revisar tus respuestas.'}
          </p>  
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setPreguntaActualIndex(0)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Revisar respuestas
            </button>
            <button
              onClick={() => navigate('/evaluaciones-iq/mis-asignaciones')}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Volver a asignaciones
            </button>
          </div>
        </div>
      )}

      {/* ── Pregunta actual ── */}
      {preguntaActual && (
        <div className="relative">
          {/* Overlay de avance automático */}
          {avanzandoAuto && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle size={40} className="text-green-500 animate-bounce" />
                <p className="text-sm font-medium text-gray-700">Respuesta enviada</p>
              </div>
            </div>
          )}
          <FormularioPregunta
            pregunta={preguntaActual}
            asignacionId={Number(id)}
            onRespuestaGuardada={handleRespuestaGuardada}
          />
        </div>
      )}

      {/* ── Navegación ── */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
        <button
          onClick={() => setPreguntaActualIndex(i => Math.max(0, i - 1))}
          disabled={preguntaActualIndex === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
          Anterior
        </button>

        <span className="text-xs text-gray-400">
          {preguntaActualIndex + 1} / {preguntas.length}
        </span>

        <button
          onClick={() => setPreguntaActualIndex(i => Math.min(preguntas.length - 1, i + 1))}
          disabled={preguntaActualIndex === preguntas.length - 1}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
          <ChevronRight size={18} />
        </button>
      </div>

    </div>
  );
};