// src/pages/auditor/hooks/useAuditorRevisionDetalle.ts
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { respuestasApi } from '@/api/endpoints/respuestas.api';
import { Respuesta } from '@/types';
import toast from 'react-hot-toast';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface AsignacionDetalle {
  id: string;
  dimension_nombre: string;
  encuesta_nombre: string;
  usuario_asignado_nombre: string;
  empresa_nombre: string;
  fecha_completado: string;
  fecha_limite: string;
  total_preguntas: number;
  preguntas_respondidas: number;
  estado: string;
  evaluacion_empresa?: string;
}

export interface ResultadoCierre {
  gap_info: {
    nivel_deseado: number;
    nivel_actual: number;
    gap: number;
    clasificacion: string;
    porcentaje_cumplimiento: number;
  } | null;
  pendientes_auto_nc: number;
}

// ── Helpers puros ─────────────────────────────────────────────────────────────

export const formatFecha = (fecha: string): string => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
};

export const getColorGap = (clasificacion: string): string => {
  switch (clasificacion?.toLowerCase()) {
    case 'critico':  return 'text-red-600    bg-red-50    border-red-200';
    case 'alto':     return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'medio':    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'bajo':     return 'text-blue-600   bg-blue-50   border-blue-200';
    case 'cumplido': return 'text-green-600  bg-green-50  border-green-200';
    case 'superado': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    default:         return 'text-gray-600   bg-gray-50   border-gray-200';
  }
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useAuditorRevisionDetalle = () => {
  const { asignacionId } = useParams<{ asignacionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading]                   = useState(true);
  const [asignacion, setAsignacion]             = useState<AsignacionDetalle | null>(null);
  const [respuestas, setRespuestas]             = useState<Respuesta[]>([]);
  const [cerrando, setCerrando]                 = useState(false);
  const [mostrarModalCierre, setMostrarModalCierre] = useState(false);
  const [comentarioCierre, setComentarioCierre] = useState('');
  const [resultadoCierre, setResultadoCierre]   = useState<ResultadoCierre | null>(null);

  useEffect(() => {
    if (asignacionId) loadData();
  }, [asignacionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [revisionData, respuestasData] = await Promise.all([
        respuestasApi.auditor.misRevisiones().then((data: any) => {
          const list = Array.isArray(data) ? data : data?.results || [];
          return list.find((a: any) => a.id === asignacionId) || null;
        }),
        respuestasApi.listParaRevision(asignacionId!).then((data) =>
          Array.isArray(data) ? data : (data as any)?.results || []
        ),
      ]);
      setAsignacion(revisionData);
      setRespuestas(respuestasData);
    } catch {
      toast.error('Error al cargar la revisión');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarRevision = async () => {
    if (!asignacionId) return;

    const sinCalificar = respuestas.filter(
      r => r.respuesta !== 'NO_APLICA' && !r.calificacion_auditor
    );

    if (sinCalificar.length > 0 && !mostrarModalCierre) {
      setMostrarModalCierre(true);
      return;
    }

    try {
      setCerrando(true);
      const res  = await respuestasApi.auditor.cerrarRevision(asignacionId, {
        comentario_cierre: comentarioCierre,
      });
      const data = (res as any).data || res;
      setResultadoCierre({
        gap_info:           data?.gap_info || null,
        pendientes_auto_nc: data?.pendientes_auto_nc || 0,
      });
      setMostrarModalCierre(false);
      toast.success('Revisión cerrada. GAP calculado exitosamente.', { duration: 5000 });
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cerrar la revisión');
    } finally {
      setCerrando(false);
    }
  };

  // Métricas derivadas
  const totalCalificadas = useMemo(
    () => respuestas.filter(r => r.calificacion_auditor || r.respuesta === 'NO_APLICA').length,
    [respuestas]
  );

  const progresoRevision = useMemo(
    () => respuestas.length > 0 ? (totalCalificadas / respuestas.length) * 100 : 0,
    [totalCalificadas, respuestas.length]
  );

  const sinCalificarCount = useMemo(
    () => respuestas.filter(r => r.respuesta !== 'NO_APLICA' && !r.calificacion_auditor).length,
    [respuestas]
  );

  const yaRevisada = asignacion?.estado === 'auditado';

  const goToLista = () => navigate('/auditor/revisiones');

  return {
    asignacionId, asignacion, respuestas, loading,
    cerrando, mostrarModalCierre, setMostrarModalCierre,
    comentarioCierre, setComentarioCierre,
    resultadoCierre,
    totalCalificadas, progresoRevision, sinCalificarCount, yaRevisada,
    loadData, handleCerrarRevision, goToLista,
  };
};