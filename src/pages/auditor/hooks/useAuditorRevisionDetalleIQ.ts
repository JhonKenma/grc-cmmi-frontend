// src/pages/auditor/hooks/useAuditorRevisionDetalleIQ.ts
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auditorIQApi, type AsignacionIQAuditor, type RespuestaIQAuditor } from '@/api/endpoints/auditor-iq.api';
import toast from 'react-hot-toast';
import { getColorGap } from './useAuditorRevisionDetalle';

export { getColorGap };

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ResultadoCierreIQ {
  gap_info: {
    nivel_deseado: number;
    nivel_actual: number;
    gap: number;
    clasificacion: string;
    porcentaje_cumplimiento: number;
    total_secciones: number;
    brechas_criticas: number;
    brechas_altas: number;
  } | null;
  pendientes_auto_nc: number;
}

// ── Helper ───────────────────────────────────────────────────────────────────

export const formatFechaIQ = (f: string | null | undefined): string => {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useAuditorRevisionDetalleIQ = () => {
  const { asignacionId } = useParams<{ asignacionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading]                     = useState(true);
  const [asignacion, setAsignacion]               = useState<AsignacionIQAuditor | null>(null);
  const [respuestas, setRespuestas]               = useState<RespuestaIQAuditor[]>([]);
  const [cerrando, setCerrando]                   = useState(false);
  const [mostrarModalCierre, setMostrarModalCierre] = useState(false);
  const [notasCierre, setNotasCierre]             = useState('');
  const [resultadoCierre, setResultadoCierre]     = useState<ResultadoCierreIQ | null>(null);

  useEffect(() => {
    if (asignacionId) cargarDatos();
  }, [asignacionId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [revisionesData, respuestasData] = await Promise.all([
        auditorIQApi.misRevisiones().then(data =>
          (data.results || []).find(a => String(a.id) === asignacionId) || null
        ),
        auditorIQApi.respuestasAsignacion(Number(asignacionId)).then(d =>
          Array.isArray(d) ? d : (d as any)?.results || []
        ),
      ]);
      setAsignacion(revisionesData);
      setRespuestas(respuestasData);
    } catch {
      toast.error('Error al cargar la revisión IQ');
      navigate('/auditor/revisiones-iq');
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
      const res       = await auditorIQApi.cerrarRevision(Number(asignacionId), { notas_auditoria: notasCierre });
      const innerData = (res as any).data || res;
      setResultadoCierre({
        gap_info:           innerData?.gap_info || null,
        pendientes_auto_nc: innerData?.pendientes_auto_nc || 0,
      });
      setMostrarModalCierre(false);
      toast.success('Revisión cerrada. GAP calculado exitosamente.', { duration: 5000 });
      await cargarDatos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cerrar la revisión IQ');
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

  const yaAuditada = asignacion?.estado === 'auditada' || asignacion?.estado === 'aprobada';

  const goToLista = () => navigate('/auditor/revisiones-iq');

  return {
    asignacionId, asignacion, respuestas, loading,
    cerrando, mostrarModalCierre, setMostrarModalCierre,
    notasCierre, setNotasCierre,
    resultadoCierre,
    totalCalificadas, progresoRevision, sinCalificarCount, yaAuditada,
    cargarDatos, handleCerrarRevision, goToLista,
  };
};