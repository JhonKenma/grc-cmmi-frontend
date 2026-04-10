// src/pages/respuestas/ResponderDimension.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { asignacionesApi } from '@/api/endpoints';
import { respuestasApi } from '@/api/endpoints/respuestas.api';
import { Asignacion, Pregunta, RespuestaListItem } from '@/types';
import { PreguntaCard } from '@/components/respuestas/PreguntaCard';
import { dimensionesApi } from '@/api/endpoints';
import toast from 'react-hot-toast';

export const ResponderDimension: React.FC = () => {
  const { asignacionId } = useParams<{ asignacionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading]       = useState(true);
  const [asignacion, setAsignacion] = useState<Asignacion | null>(null);
  const [preguntas, setPreguntas]   = useState<Pregunta[]>([]);
  const [respuestas, setRespuestas] = useState<Map<string, RespuestaListItem>>(new Map());
  const [indiceActual, setIndiceActual] = useState(0);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (asignacionId) loadData();
  }, [asignacionId]);

  // Scroll al top cada vez que cambia la pregunta
  useEffect(() => {
    contenedorRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [indiceActual]);

  const loadData = async () => {
    try {
      setLoading(true);
      const asignacionData = await asignacionesApi.get(asignacionId!);
      setAsignacion(asignacionData);

      if (!asignacionData.dimension) {
        toast.error('La asignación no tiene una dimensión asociada');
        return;
      }

      const dimensionData = await dimensionesApi.conPreguntas(asignacionData.dimension);
      const preguntasActivas = dimensionData.preguntas.filter(p => p.activo);
      setPreguntas(preguntasActivas);

      const response = await respuestasApi.list(asignacionId!);
      const respuestasArray = Array.isArray(response)
        ? response
        : (response as any).results || [];

      const respuestasMap = new Map<string, RespuestaListItem>();
      respuestasArray.forEach((r: any) => {
        const preguntaKey = typeof r.pregunta === 'object' ? r.pregunta.id : r.pregunta;
        if (preguntaKey) respuestasMap.set(preguntaKey, r);
      });
      setRespuestas(respuestasMap);

      // Ir a la primera pregunta sin responder
      const primeraLibre = preguntasActivas.findIndex(
        p => !respuestasMap.get(p.id) || respuestasMap.get(p.id)?.estado === 'borrador'
      );
      setIndiceActual(primeraLibre !== -1 ? primeraLibre : 0);

    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar la información');
    } finally {
      setLoading(false);
    }
  };

  const handleRespuestaChange = (preguntaId: string, respuestaData: RespuestaListItem) => {
    if (!respuestaData?.id) return;
    setRespuestas(prev => {
      const newMap = new Map(prev);
      newMap.set(preguntaId, respuestaData);
      return newMap;
    });

    // Si fue enviada, avanzar automáticamente a la siguiente pregunta pendiente
    if (respuestaData.estado === 'enviado') {
      setTimeout(() => {
        const siguientePendiente = preguntas.findIndex(
          (p, i) => i > indiceActual &&
            (!respuestas.get(p.id) || respuestas.get(p.id)?.estado === 'borrador') &&
            p.id !== preguntaId
        );
        if (siguientePendiente !== -1) {
          setIndiceActual(siguientePendiente);
          toast.success('¡Avanzando a la siguiente pregunta!', { duration: 1500, icon: '➡️' });
        }
      }, 800);
    }
  };

  const respuestasEnviadas = Array.from(respuestas.values())
    .filter((r): r is RespuestaListItem => !!r)
    .filter(r => r.estado === 'enviado');

  const progreso = preguntas.length > 0
    ? (respuestasEnviadas.length / preguntas.length) * 100
    : 0;

  const todasCompletadas = respuestasEnviadas.length >= preguntas.length && preguntas.length > 0;
  const preguntaActual   = preguntas[indiceActual];

  const getRespuestaEstado = (pregunta: Pregunta) => {
    const r = respuestas.get(pregunta.id);
    if (!r) return 'pendiente';
    if (r.estado === 'enviado' || r.estado === 'auditado') return 'enviada';
    return 'borrador';
  };

  if (loading) return <LoadingScreen message="Cargando preguntas..." />;

  if (!asignacion) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <p className="text-gray-600">No se encontró la asignación</p>
        <Button variant="secondary" onClick={() => navigate('/mis-tareas')} className="mt-4">
          Volver a Mis evaluaciones
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-10 px-2" ref={contenedorRef}>

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" onClick={() => navigate('/mis-tareas')}>
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">
            {asignacion.dimension_nombre || asignacion.encuesta_nombre}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Responder Evaluación</p>
        </div>
      </div>

      {/* ── Barra de progreso ── */}
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

      {/* ── Mini-mapa de preguntas ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-medium text-gray-500 mb-3">
          Pregunta {indiceActual + 1} de {preguntas.length}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {preguntas.map((p, i) => {
            const estadoP = getRespuestaEstado(p);
            return (
              <button
                key={p.id}
                onClick={() => setIndiceActual(i)}
                title={p.codigo || p.titulo}
                className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${
                  i === indiceActual
                    ? 'bg-primary-600 text-white shadow-md scale-110'
                    : estadoP === 'enviada'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : estadoP === 'borrador'
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {estadoP === 'enviada' && i !== indiceActual ? '✓' : i + 1}
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

      {/* ── Pantalla de completado ── */}
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
            <Button
              variant="secondary"
              onClick={() => setIndiceActual(0)}
            >
              Revisar respuestas
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/mis-tareas')}
            >
              Volver a mis tareas
            </Button>
          </div>
        </div>
      ) : (
        /* ── Pregunta actual ── */
        preguntaActual && (
          <PreguntaCard
            key={preguntaActual.id}
            pregunta={preguntaActual}
            numero={indiceActual + 1}
            asignacionId={asignacionId!}
            respuestaExistente={respuestas.get(preguntaActual.id)}
            onRespuestaChange={(respuestaData) =>
              handleRespuestaChange(preguntaActual.id, respuestaData)
            }
          />
        )
      )}

      {/* ── Navegación anterior / siguiente ── */}
      {!todasCompletadas && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setIndiceActual(i => Math.max(0, i - 1))}
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
            onClick={() => setIndiceActual(i => Math.min(preguntas.length - 1, i + 1))}
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