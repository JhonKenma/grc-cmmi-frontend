// src/pages/EvaluacionesInteligentes/ResponderEvaluacion/ResponderEvaluacionIQ.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { respuestaIQApi } from '@/api/endpoints/respuesta-iq.api';
import { asignacionIQApi } from '@/api/endpoints/asignacion-iq.api';
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
    console.log('=== CARGANDO PREGUNTAS ===');
    try {
      setLoading(true);
      const response = await respuestaIQApi.obtenerPreguntasAsignacion(Number(id));
      console.log('Respuesta del servidor:', response);
      console.log('Total preguntas:', response.preguntas.length);
      console.log('Preguntas respondidas:', response.asignacion.preguntas_respondidas);
      console.log('Progreso:', response.asignacion.porcentaje_completado);
      
      setData(response);
      
      const primeraNoRespondida = response.preguntas.findIndex(p => !p.respuesta);
      console.log('Primera pregunta no respondida:', primeraNoRespondida);
      if (primeraNoRespondida !== -1) setPreguntaActualIndex(primeraNoRespondida);
      
      console.log('=== PREGUNTAS CARGADAS ===');
    } catch (error) {
      console.error('Error al cargar preguntas:', error);
      toast.error('Error al cargar la evaluación');
      navigate('/evaluaciones-iq/mis-asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleRespuestaGuardada = async () => {
    console.log('handleRespuestaGuardada llamado');
    await cargarPreguntas();
    console.log('handleRespuestaGuardada completado');
  };

  const handleCompletarEvaluacion = async () => {
    if (!data) return;
    
    const sinResponder = data.preguntas.filter(p => !p.respuesta).length;
    if (sinResponder > 0) {
      const confirmar = window.confirm(
        `Aún tienes ${sinResponder} preguntas sin responder. ¿Continuar?`
      );
      if (!confirmar) return;
    }
    
    try {
      await asignacionIQApi.completar(Number(id));
      toast.success('🎉 Evaluación completada');
      navigate('/evaluaciones-iq/mis-asignaciones');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al completar');
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

  const preguntaActual = data.preguntas[preguntaActualIndex];
  const progreso = (data.asignacion.preguntas_respondidas / data.asignacion.total_preguntas) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button
        onClick={() => navigate('/evaluaciones-iq/mis-asignaciones')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft size={20} className="mr-2" />
        Volver
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        {data.asignacion.evaluacion}
      </h1>
      
      {/* Progreso */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {data.asignacion.preguntas_respondidas} / {data.asignacion.total_preguntas} preguntas
          </span>
          <span className="text-sm font-bold text-primary-600">{progreso.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary-600 h-3 rounded-full"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Navegación */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <p className="font-medium">
            Pregunta {preguntaActualIndex + 1} / {data.preguntas.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPreguntaActualIndex(i => Math.max(0, i - 1))}
              disabled={preguntaActualIndex === 0}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPreguntaActualIndex(i => Math.min(data.preguntas.length - 1, i + 1))}
              disabled={preguntaActualIndex === data.preguntas.length - 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Siguiente →
            </button>
          </div>
        </div>

        {/* Mini-mapa */}
        <div className="flex flex-wrap gap-1">
          {data.preguntas.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setPreguntaActualIndex(i)}
              className={`w-10 h-10 rounded-lg text-sm font-medium ${
                i === preguntaActualIndex
                  ? 'bg-primary-600 text-white'
                  : p.respuesta
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Formulario */}
      <FormularioPregunta
        pregunta={preguntaActual}
        asignacionId={Number(id)}
        onRespuestaGuardada={handleRespuestaGuardada}
      />

      {/* Completar */}
      {data.asignacion.estado === 'en_progreso' && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold mb-2">¿Terminaste?</h3>
              <p className="text-gray-600">
                {data.asignacion.preguntas_respondidas} / {data.asignacion.total_preguntas} respondidas
              </p>
            </div>
            <button
              onClick={handleCompletarEvaluacion}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircle size={20} />
              Completar Evaluación
            </button>
          </div>
        </div>
      )}
    </div>
  );
};