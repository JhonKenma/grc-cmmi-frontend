// src/pages/asignaciones/hooks/useMisTareas.ts
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { asignacionesApi } from '@/api/endpoints/asignaciones.api';
import { AsignacionListItem } from '@/types';
import { ESTADO_BADGE_CLASSES, ESTADO_LABELS, getDiasRestantesColor } from './asignacionesConstants';
import toast from 'react-hot-toast';

export { getDiasRestantesColor };

// ── Helpers de badge ─────────────────────────────────────────────────────────

const ESTADO_ICONS: Record<string, string> = {
  pendiente:          '⏳',
  en_progreso:        '🔄',
  completado:         '✅',
  vencido:            '❌',
  pendiente_revision: '👁️',
  rechazado:          '🔴',
};

export const getEstadoBadgeConfig = (estado: string) => ({
  label:      ESTADO_LABELS[estado]     ?? estado,
  icon:       ESTADO_ICONS[estado]      ?? '',
  colorClass: ESTADO_BADGE_CLASSES[estado] ?? ESTADO_BADGE_CLASSES.pendiente,
});

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useMisTareas = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading]           = useState(true);
  const [asignaciones, setAsignaciones] = useState<AsignacionListItem[]>([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => { loadAsignaciones(); }, []);

  const loadAsignaciones = async () => {
    try {
      setLoading(true);
      const data = await asignacionesApi.getMisAsignaciones();
      setAsignaciones(data.results);
    } catch {
      toast.error('Error al cargar tus asignaciones');
    } finally {
      setLoading(false);
    }
  };

  // Estado para acciones: evita mostrar "Responder" si ya llegó al 100%
  const getEstadoParaAccion = (asignacion: AsignacionListItem): string => {
    const avance = Number(asignacion.porcentaje_avance || 0);
    const finales = ['completado', 'pendiente_revision', 'rechazado', 'vencido'];
    if (finales.includes(asignacion.estado)) return asignacion.estado;
    if (avance >= 100) return 'completado';
    return asignacion.estado;
  };

  const asignacionesFiltradas = useMemo(
    () =>
      filtroEstado === 'todos'
        ? asignaciones
        : asignaciones.filter(a => a.estado === filtroEstado),
    [asignaciones, filtroEstado]
  );

  const stats = useMemo(() => ({
    total:               asignaciones.length,
    pendientes:          asignaciones.filter(a => a.estado === 'pendiente').length,
    en_progreso:         asignaciones.filter(a => a.estado === 'en_progreso').length,
    completadas:         asignaciones.filter(a => a.estado === 'completado').length,
    respondidas:         asignaciones.filter(a => {
      const avance = Number(a.porcentaje_avance || 0);
      return a.estado === 'completado' || a.estado === 'pendiente_revision' || avance >= 100;
    }).length,
    vencidas:            asignaciones.filter(a => a.estado === 'vencido').length,
    pendientes_revision: asignaciones.filter(a => a.estado === 'pendiente_revision').length,
    rechazadas:          asignaciones.filter(a => a.estado === 'rechazado').length,
  }), [asignaciones]);

  const goToResponder = (id: string) => navigate(`/respuestas/${id}`);
  const goToRevisar   = (id: string) => navigate(`/asignaciones/${id}/revisar`);

  return {
    loading, asignacionesFiltradas, filtroEstado, setFiltroEstado,
    stats, user,
    getEstadoParaAccion,
    goToResponder, goToRevisar,
  };
};