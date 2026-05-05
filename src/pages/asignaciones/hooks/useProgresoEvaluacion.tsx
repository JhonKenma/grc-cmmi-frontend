// src/pages/asignaciones/hooks/useProgresoEvaluacion.tsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Eye, CheckCircle, Clock, AlertCircle,
  ShieldCheck, ClipboardCheck,
} from 'lucide-react';
import { evaluacionesApi, asignacionesApi } from '@/api/endpoints';
import { Asignacion } from '@/types';
import toast from 'react-hot-toast';

// ── Helpers de estado (JSX → archivo .tsx) ───────────────────────────────────

export const getEstadoBadge = (estado: string): { class: string; icon: React.ReactNode } => {
  const badges: Record<string, { class: string; icon: React.ReactNode }> = {
    pendiente:           { class: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Clock size={13} /> },
    en_progreso:         { class: 'bg-blue-100   text-blue-800   border-blue-200',   icon: <AlertCircle size={13} /> },
    completado:          { class: 'bg-green-100  text-green-800  border-green-200',  icon: <CheckCircle size={13} /> },
    pendiente_auditoria: { class: 'bg-purple-100 text-purple-800 border-purple-200', icon: <ClipboardCheck size={13} /> },
    auditado:            { class: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <ShieldCheck size={13} /> },
    pendiente_revision:  { class: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: <Eye size={13} /> },
    rechazado:           { class: 'bg-orange-100 text-orange-800 border-orange-200', icon: <AlertCircle size={13} /> },
    vencido:             { class: 'bg-red-100    text-red-800    border-red-200',    icon: <AlertCircle size={13} /> },
  };
  return badges[estado] ?? badges.pendiente;
};

export const getEstadoLabel = (estado: string): string => ({
  pendiente:           'Pendiente',
  en_progreso:         'En Progreso',
  completado:          'Completado',
  pendiente_auditoria: 'Pend. Auditoría',
  auditado:            'Auditado',
  pendiente_revision:  'Pend. Revisión',
  rechazado:           'Rechazado',
  vencido:             'Vencido',
}[estado] ?? estado);

export const getBarColor = (estado: string): string => ({
  completado:          'bg-green-500',
  pendiente_auditoria: 'bg-purple-500',
  auditado:            'bg-emerald-500',
  pendiente_revision:  'bg-indigo-500',
  rechazado:           'bg-orange-500',
  vencido:             'bg-red-500',
}[estado] ?? 'bg-blue-500');

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useProgresoEvaluacion = () => {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading]                             = useState(true);
  const [evaluacion, setEvaluacion]                       = useState<any>(null);
  const [asignaciones, setAsignaciones]                   = useState<any[]>([]);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState<Asignacion | null>(null);
  const [modalOpen, setModalOpen]                         = useState(false);

  useEffect(() => { if (evaluacionId) loadData(); }, [evaluacionId]);

  const loadData = async () => {
    if (!evaluacionId) return;
    try {
      setLoading(true);
      const evaluacionData = await evaluacionesApi.get(evaluacionId);
      setEvaluacion(evaluacionData);

      const response = await asignacionesApi.list();
      const todas = Array.isArray(response) ? response : (response as any).results || [];
      setAsignaciones(todas.filter((a: any) => a.evaluacion_empresa_id === evaluacionId));
    } catch {
      toast.error('Error al cargar datos');
      navigate('/asignaciones/mis-evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleRevisar = async (asignacionId: string) => {
    try {
      const asignacion = await asignacionesApi.get(asignacionId);
      setAsignacionSeleccionada(asignacion);
      setModalOpen(true);
    } catch {
      toast.error('Error al cargar detalle de asignación');
    }
  };

  const handleSuccess = async () => {
    await loadData();
    toast.success('Asignación revisada exitosamente');
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setAsignacionSeleccionada(null);
  };

  const stats = useMemo(() => ({
    total:               asignaciones.length,
    pendientes:          asignaciones.filter(a => a.estado === 'pendiente').length,
    en_progreso:         asignaciones.filter(a => a.estado === 'en_progreso').length,
    completadas:         asignaciones.filter(a => a.estado === 'completado').length,
    pendiente_auditoria: asignaciones.filter(a => a.estado === 'pendiente_auditoria').length,
    auditadas:           asignaciones.filter(a => a.estado === 'auditado').length,
    pendientes_revision: asignaciones.filter(a => a.estado === 'pendiente_revision').length,
    rechazadas:          asignaciones.filter(a => a.estado === 'rechazado').length,
  }), [asignaciones]);

  const goToLista              = () => navigate('/asignaciones/mis-evaluaciones');
  const goToAsignarDimensiones = () => navigate(`/evaluaciones/${evaluacionId}/asignar-dimensiones`);

  return {
    evaluacionId, evaluacion, loading,
    asignaciones, stats,
    asignacionSeleccionada, modalOpen,
    handleRevisar, handleSuccess, handleCloseModal,
    goToLista, goToAsignarDimensiones,
  };
};