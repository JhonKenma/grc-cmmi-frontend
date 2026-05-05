// src/pages/asignaciones/hooks/useTablaRespuestasRevision.ts
import { useState } from 'react';
import { Respuesta, CalificacionAuditor } from '@/types';
import { respuestasApi } from '@/api/endpoints/respuestas.api';
import toast from 'react-hot-toast';

// ── Constantes ───────────────────────────────────────────────────────────────

export const NIVELES_MADUREZ = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const getFileUrl = (url: string): string =>
  url ? (url.startsWith('http') ? url : `${BACKEND_URL}${url}`) : '#';

export const getColorCalificacion = (cal: CalificacionAuditor | null | undefined): string => {
  switch (cal) {
    case 'SI_CUMPLE':      return 'bg-green-100  text-green-800  border-green-300';
    case 'CUMPLE_PARCIAL': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'NO_CUMPLE':      return 'bg-red-100    text-red-800    border-red-300';
    default:               return 'bg-gray-100   text-gray-500   border-gray-200';
  }
};

export const getLabelCalificacion = (cal: CalificacionAuditor | null | undefined): string => {
  switch (cal) {
    case 'SI_CUMPLE':      return 'Sí Cumple';
    case 'CUMPLE_PARCIAL': return 'Cumple Parcial';
    case 'NO_CUMPLE':      return 'No Cumple';
    default:               return 'Sin calificar';
  }
};

// ── Tipo de estado por respuesta ─────────────────────────────────────────────

type CalState = {
  calificacion_auditor:    CalificacionAuditor | '';
  nivel_madurez:           number;
  comentarios_auditor:     string;
  recomendaciones_auditor: string;
  saving:                  boolean;
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useTablaRespuestasRevision = (
  respuestas: Respuesta[],
  onRevisionActualizada?: () => void
) => {
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());
  const [calificaciones, setCalificaciones] = useState<Record<string, CalState>>({});
  const [modalConfirmacion, setModalConfirmacion] = useState<{
    abierto: boolean;
    respuesta: Respuesta | null;
  }>({ abierto: false, respuesta: null });

  const getCalState = (r: Respuesta): CalState =>
    calificaciones[r.id] ?? {
      calificacion_auditor:    r.calificacion_auditor ??
        (r.respuesta === 'NO_CUMPLE' ? 'NO_CUMPLE' : ''),
      nivel_madurez:           r.nivel_madurez ?? 0,
      comentarios_auditor:     r.comentarios_auditor ?? '',
      recomendaciones_auditor: r.recomendaciones_auditor ?? '',
      saving: false,
    };

  const updateCal = (id: string, patch: Partial<CalState>) => {
    setCalificaciones(prev => ({
      ...prev,
      [id]: { ...getCalState({ id } as Respuesta), ...patch },
    }));
  };

  const toggleExpandir = (id: string) => {
    setExpandidas(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handleSolicitarConfirmacion = (respuesta: Respuesta) => {
    const cal = getCalState(respuesta);
    if (!cal.calificacion_auditor) {
      toast.error('Selecciona una calificación primero');
      return;
    }
    if (cal.calificacion_auditor !== 'NO_CUMPLE' && cal.nivel_madurez === 0) {
      toast.error('Indica un nivel de madurez mayor a 0');
      return;
    }
    setModalConfirmacion({ abierto: true, respuesta });
  };

  const handleConfirmarYGuardar = async () => {
    const respuesta = modalConfirmacion.respuesta;
    if (!respuesta) return;

    setModalConfirmacion({ abierto: false, respuesta: null });
    const cal = getCalState(respuesta);
    updateCal(respuesta.id, { saving: true });

    try {
      await respuestasApi.auditor.calificar(respuesta.id, {
        calificacion_auditor:    cal.calificacion_auditor as CalificacionAuditor,
        nivel_madurez:           cal.nivel_madurez,
        comentarios_auditor:     cal.comentarios_auditor,
        recomendaciones_auditor: cal.recomendaciones_auditor,
      });
      toast.success('Calificación guardada. Ya no podrá ser modificada.');
      onRevisionActualizada?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar calificación');
    } finally {
      updateCal(respuesta.id, { saving: false });
    }
  };

  const handleCerrarModal = () =>
    setModalConfirmacion({ abierto: false, respuesta: null });

  return {
    expandidas, calificaciones,
    modalConfirmacion,
    getCalState, updateCal, toggleExpandir,
    handleSolicitarConfirmacion, handleConfirmarYGuardar, handleCerrarModal,
  };
};