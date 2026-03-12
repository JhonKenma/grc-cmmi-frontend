// src/pages/EvaluacionesInteligentes/ResponderEvaluacion/ResponderEvaluacionIQ.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { respuestaIQApi } from '@/api/endpoints/respuesta-iq.api';
import toast from 'react-hot-toast';
import type { PreguntasAsignacionResponse } from '@/types/respuesta-iq.types';
import { FormularioPregunta } from './FormularioPregunta';

export const ResponderEvaluacionIQ = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PreguntasAsignacionResponse | null>(null);
  const [preguntaActualIndex, setPreguntaActualIndex] = useState(0);

  useEffect(() => {
    if (id) cargarPreguntas();
  }, [id]);

  const cargarPreguntas = async () => {
    try {
      setLoading(true);
      const response = await respuestaIQApi.obtenerPreguntasAsignacion(Number(id));
      setData(response);

      // Ir a la primera pregunta sin responder (o la primera si todas respondidas)
      const primeraLibre = response.preguntas.findIndex(p => !p.respuesta);
      if (primeraLibre !== -1) setPreguntaActualIndex(primeraLibre);
    } catch (error) {
      toast.error('Error al cargar la evaluación');
      navigate('/evaluaciones-iq/mis-asignaciones');
    } finally {
      setLoading(false);
    }
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
  const todasEnviadas = asignacion.preguntas_respondidas >= asignacion.total_preguntas;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">

      {/* Header */}
      <button
        onClick={() => navigate('/evaluaciones-iq/mis-asignaciones')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm">Volver a mis asignaciones</span>
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">{asignacion.evaluacion}</h1>
      <p className="text-sm text-gray-500 mb-6 capitalize">
        Estado: <span className="font-medium">{asignacion.estado.replace('_', ' ')}</span>
      </p>

      {/* Barra de progreso */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {asignacion.preguntas_respondidas} de {asignacion.total_preguntas} preguntas enviadas
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

      {/* Banner: evaluación completada */}
      {(todasEnviadas || asignacion.estado === 'completada' || asignacion.estado === 'auditada') && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">
              {asignacion.estado === 'auditada'
                ? '✅ Evaluación auditada'
                : '🎉 Has respondido todas las preguntas'}
            </p>
            <p className="text-sm text-green-700 mt-0.5">
              {asignacion.estado === 'auditada'
                ? 'El auditor ha calificado todas las respuestas. Puedes ver el reporte GAP.'
                : 'Tu evaluación fue enviada al auditor. Puedes revisar tus respuestas abajo.'}
            </p>
          </div>
        </div>
      )}

      {/* Navegación + mini-mapa */}
      <div className="mb-5 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-medium text-gray-700">
            Pregunta {preguntaActualIndex + 1} / {preguntas.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPreguntaActualIndex(i => Math.max(0, i - 1))}
              disabled={preguntaActualIndex === 0}
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPreguntaActualIndex(i => Math.min(preguntas.length - 1, i + 1))}
              disabled={preguntaActualIndex === preguntas.length - 1}
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Siguiente →
            </button>
          </div>
        </div>

        {/* Mini-mapa de preguntas */}
        <div className="flex flex-wrap gap-1.5">
          {preguntas.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setPreguntaActualIndex(i)}
              title={p.codigo_control}
              className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors ${
                i === preguntaActualIndex
                  ? 'bg-primary-600 text-white shadow'
                  : p.respuesta
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Formulario de la pregunta actual */}
      <FormularioPregunta
        pregunta={preguntaActual}
        asignacionId={Number(id)}
        onRespuestaGuardada={cargarPreguntas}
      />

    </div>
  );
};