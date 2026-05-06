import { useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { Button, LoadingScreen } from '@/components/common';
import { PreguntaCard } from '@/components/respuestas/PreguntaCard';
import { useResponderDimension } from './hooks/useResponderDimension';

export const ResponderDimension = () => {
  const { asignacionId } = useParams<{ asignacionId: string }>();

  const {
    contenedorRef,
    loading,
    asignacion,
    preguntas,
    respuestas,
    indiceActual,
    setIndiceActual,
    respuestasEnviadas,
    progreso,
    todasCompletadas,
    preguntaActual,
    getRespuestaEstado,
    handleRespuestaChange,
    goBack,
  } = useResponderDimension(asignacionId);

  if (loading) return <LoadingScreen message="Cargando preguntas..." />;

  if (!asignacion) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <p className="text-gray-600">No se encontró la asignación</p>
        <Button variant="secondary" onClick={goBack} className="mt-4">
          Volver a Mis evaluaciones
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-10 px-2" ref={contenedorRef}>
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" onClick={goBack}>
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">
            {asignacion.dimension_nombre || asignacion.encuesta_nombre}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Responder Evaluación</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {respuestasEnviadas.length} de {preguntas.length} completadas
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

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-medium text-gray-500 mb-3">
          Pregunta {indiceActual + 1} de {preguntas.length}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {preguntas.map((pregunta, index) => {
            const estadoPregunta = getRespuestaEstado(pregunta);
            return (
              <button
                key={pregunta.id}
                onClick={() => setIndiceActual(index)}
                title={pregunta.codigo || pregunta.titulo}
                className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${
                  index === indiceActual
                    ? 'bg-primary-600 text-white shadow-md scale-110'
                    : estadoPregunta === 'enviada'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : estadoPregunta === 'borrador'
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {estadoPregunta === 'enviada' && index !== indiceActual ? '✓' : index + 1}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-100 inline-block" /> Enviada
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-yellow-100 inline-block" /> Borrador
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-100 inline-block" /> Pendiente
          </span>
        </div>
      </div>

      {todasCompletadas ? (
        <div className="bg-white rounded-xl border border-green-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ¡Evaluación completada!
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Has respondido todas las preguntas. El auditor fue notificado para revisar tus respuestas.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setIndiceActual(0)}>
              Revisar respuestas
            </Button>
            <Button variant="primary" onClick={goBack}>
              Volver a mis tareas
            </Button>
          </div>
        </div>
      ) : (
        preguntaActual && (
          <PreguntaCard
            key={preguntaActual.id}
            pregunta={preguntaActual}
            numero={indiceActual + 1}
            asignacionId={asignacionId!}
            respuestaExistente={respuestas.get(String(preguntaActual.id))}
            onRespuestaChange={(respuestaData) =>
              handleRespuestaChange(String(preguntaActual.id), respuestaData)
            }
          />
        )
      )}

      {!todasCompletadas && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setIndiceActual((index) => Math.max(0, index - 1))}
            disabled={indiceActual === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
            Anterior
          </button>

          <span className="text-xs text-gray-400">
            {indiceActual + 1} / {preguntas.length}
          </span>

          <button
            onClick={() => setIndiceActual((index) => Math.min(preguntas.length - 1, index + 1))}
            disabled={indiceActual === preguntas.length - 1}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
