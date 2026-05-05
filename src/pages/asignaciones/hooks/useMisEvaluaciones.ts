// src/pages/asignaciones/hooks/useMisEvaluaciones.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { evaluacionesApi } from '@/api/endpoints/evaluaciones.api';
import toast from 'react-hot-toast';

const ESTADO_STYLES: Record<string, string> = {
  activa:      'bg-blue-50   text-blue-700   border-blue-200',
  en_progreso: 'bg-amber-50  text-amber-700  border-amber-200',
  completada:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  vencida:     'bg-rose-50   text-rose-700   border-rose-200',
  cancelada:   'bg-slate-50  text-slate-700  border-slate-200',
};

export const useMisEvaluaciones = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, user } = useAuth();
  const [loading, setLoading]         = useState(true);
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => { loadData(); }, [filtroEstado]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await evaluacionesApi.getMisEvaluaciones(filtroEstado || undefined);
      setEvaluaciones(response.results || []);
    } catch {
      toast.error('Error al cargar evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoStyles = (estado: string): string =>
    ESTADO_STYLES[estado] ?? 'bg-gray-50 text-gray-700 border-gray-200';

  const goToAsignarEvaluacion = () => navigate('/asignaciones/asignar-evaluacion');
  const goToConfigurarNiveles = (id: string) => navigate(`/evaluaciones/${id}/configurar-niveles`);
  const goToAsignarDimensiones = (id: string) => navigate(`/evaluaciones/${id}/asignar-dimensiones`);
  const goToProgreso  = (id: string) => navigate(`/evaluaciones/${id}/progreso`);
  const goToDetalle   = (id: string) => navigate(`/evaluaciones/${id}/detalle`);

  return {
    loading, evaluaciones, filtroEstado, setFiltroEstado,
    isSuperAdmin, user,
    getEstadoStyles,
    goToAsignarEvaluacion, goToConfigurarNiveles,
    goToAsignarDimensiones, goToProgreso, goToDetalle,
  };
};