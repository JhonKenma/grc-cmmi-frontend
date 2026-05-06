import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { asignacionesApi, dimensionesApi } from '@/api/endpoints';
import { respuestasApi } from '@/api/endpoints/respuestas.api';
import toast from 'react-hot-toast';
import type { Asignacion, Pregunta, RespuestaListItem } from '@/types';

const buildRespuestasMap = (items: RespuestaListItem[]) => {
  const respuestasMap = new Map<string, RespuestaListItem>();

  items.forEach((respuesta) => {
    const preguntaValue = respuesta.pregunta as unknown;
    const preguntaKey = typeof preguntaValue === 'object' && preguntaValue !== null
      ? String((preguntaValue as { id?: string | number }).id)
      : String(preguntaValue);

    if (preguntaKey) {
      respuestasMap.set(preguntaKey, respuesta);
    }
  });

  return respuestasMap;
};

export const useResponderDimension = (asignacionId?: string) => {
  const navigate = useNavigate();
  const contenedorRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [asignacion, setAsignacion] = useState<Asignacion | null>(null);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [respuestas, setRespuestas] = useState<Map<string, RespuestaListItem>>(new Map());
  const [indiceActual, setIndiceActual] = useState(0);

  useEffect(() => {
    if (!asignacionId) return;

    const loadData = async () => {
      try {
        setLoading(true);

        const asignacionData = await asignacionesApi.get(asignacionId);
        setAsignacion(asignacionData);

        if (!asignacionData.dimension) {
          toast.error('La asignación no tiene una dimensión asociada');
          return;
        }

        const dimensionData = await dimensionesApi.conPreguntas(asignacionData.dimension);
        const preguntasActivas = dimensionData.preguntas.filter((pregunta) => pregunta.activo);
        setPreguntas(preguntasActivas);

        const response = await respuestasApi.list(asignacionId);
        const respuestasArray = Array.isArray(response)
          ? response
          : (response as { results?: RespuestaListItem[] }).results || [];

        const respuestasMap = buildRespuestasMap(respuestasArray);
        setRespuestas(respuestasMap);

        const primeraLibre = preguntasActivas.findIndex(
          (pregunta) => !respuestasMap.get(String(pregunta.id)) || respuestasMap.get(String(pregunta.id))?.estado === 'borrador'
        );
        setIndiceActual(primeraLibre !== -1 ? primeraLibre : 0);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [asignacionId]);

  useEffect(() => {
    contenedorRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [indiceActual]);

  const handleRespuestaChange = (preguntaId: string, respuestaData: RespuestaListItem) => {
    if (!respuestaData?.id) return;

    setRespuestas((prev) => {
      const newMap = new Map(prev);
      newMap.set(preguntaId, respuestaData);
      return newMap;
    });

    if (respuestaData.estado === 'enviado') {
      setTimeout(() => {
        const siguientePendiente = preguntas.findIndex(
          (pregunta, index) =>
            index > indiceActual &&
            (!respuestas.get(String(pregunta.id)) || respuestas.get(String(pregunta.id))?.estado === 'borrador') &&
            String(pregunta.id) !== preguntaId
        );

        if (siguientePendiente !== -1) {
          setIndiceActual(siguientePendiente);
          toast.success('¡Avanzando a la siguiente pregunta!', { duration: 1500, icon: '➡️' });
        }
      }, 800);
    }
  };

  const respuestasEnviadas = Array.from(respuestas.values()).filter(
    (respuesta): respuesta is RespuestaListItem => !!respuesta && respuesta.estado === 'enviado'
  );

  const progreso = preguntas.length > 0
    ? (respuestasEnviadas.length / preguntas.length) * 100
    : 0;

  const todasCompletadas = respuestasEnviadas.length >= preguntas.length && preguntas.length > 0;
  const preguntaActual = preguntas[indiceActual];

  const getRespuestaEstado = (pregunta: Pregunta) => {
    const respuesta = respuestas.get(String(pregunta.id));
    if (!respuesta) return 'pendiente';
    if (respuesta.estado === 'enviado' || respuesta.estado === 'auditado') return 'enviada';
    return 'borrador';
  };

  const goBack = () => navigate('/mis-tareas');

  return {
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
  } as const;
};
