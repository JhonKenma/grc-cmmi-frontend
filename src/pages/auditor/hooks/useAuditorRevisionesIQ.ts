// src/pages/auditor/hooks/useAuditorRevisionesIQ.ts
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auditorIQApi, type AsignacionIQAuditor } from '@/api/endpoints/auditor-iq.api';
import toast from 'react-hot-toast';

// ── Tipos ────────────────────────────────────────────────────────────────────

export type FiltroFechaIQ  = 'todas' | 'hoy' | 'semana' | 'mes';
export type FiltroEstadoIQ = 'todos' | 'pendiente' | 'auditada';

// ── Constantes ───────────────────────────────────────────────────────────────

export const POR_PAGINA_IQ = 8;

// ── Helper ───────────────────────────────────────────────────────────────────

export const formatFechaIQList = (f: string | null): string => {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useAuditorRevisionesIQ = () => {
  const navigate = useNavigate();

  const [loading, setLoading]           = useState(true);
  const [asignaciones, setAsignaciones] = useState<AsignacionIQAuditor[]>([]);
  const [busqueda, setBusqueda]         = useState('');
  const [filtroFecha, setFiltroFecha]   = useState<FiltroFechaIQ>('todas');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoIQ>('todos');
  const [pagina, setPagina]             = useState(1);

  useEffect(() => { cargar(); }, []);
  useEffect(() => { setPagina(1); }, [busqueda, filtroFecha, filtroEstado]);

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await auditorIQApi.misRevisiones();
      setAsignaciones(data.results || []);
    } catch {
      toast.error('Error al cargar las revisiones IQ');
    } finally {
      setLoading(false);
    }
  };

  // Filtrado
  const filtradas = useMemo(() => {
    return asignaciones.filter(a => {
      const t = busqueda.toLowerCase();
      const matchBusqueda =
        !busqueda ||
        a.evaluacion_nombre?.toLowerCase().includes(t) ||
        a.usuario_nombre?.toLowerCase().includes(t) ||
        a.usuario_email?.toLowerCase().includes(t);

      const matchEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'pendiente' && a.estado === 'completada') ||
        (filtroEstado === 'auditada'  && ['auditada', 'aprobada'].includes(a.estado));

      let matchFecha = true;
      if (filtroFecha !== 'todas' && a.fecha_completado) {
        const fecha = new Date(a.fecha_completado);
        const ahora = new Date();
        if (filtroFecha === 'hoy') {
          matchFecha = fecha.toDateString() === ahora.toDateString();
        } else if (filtroFecha === 'semana') {
          const h = new Date(ahora); h.setDate(ahora.getDate() - 7);
          matchFecha = fecha >= h;
        } else if (filtroFecha === 'mes') {
          const h = new Date(ahora); h.setDate(ahora.getDate() - 30);
          matchFecha = fecha >= h;
        }
      }

      return matchBusqueda && matchEstado && matchFecha;
    });
  }, [asignaciones, busqueda, filtroEstado, filtroFecha]);

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA_IQ));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio       = (paginaActual - 1) * POR_PAGINA_IQ;
  const paginados    = filtradas.slice(inicio, inicio + POR_PAGINA_IQ);

  const paginasVisibles = useMemo(() => {
    const rango: number[] = [];
    const delta = 2;
    const left  = Math.max(2, paginaActual - delta);
    const right = Math.min(totalPaginas - 1, paginaActual + delta);
    rango.push(1);
    if (left > 2) rango.push(-1);
    for (let i = left; i <= right; i++) rango.push(i);
    if (right < totalPaginas - 1) rango.push(-2);
    if (totalPaginas > 1) rango.push(totalPaginas);
    return rango;
  }, [paginaActual, totalPaginas]);

  // Stats
  const pendientes = asignaciones.filter(a => a.estado === 'completada').length;
  const auditadas  = asignaciones.filter(a => ['auditada', 'aprobada'].includes(a.estado)).length;

  const hayFiltrosActivos = busqueda || filtroEstado !== 'todos' || filtroFecha !== 'todas';

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('todos');
    setFiltroFecha('todas');
  };

  const goToDetalle = (id: string | number) => navigate(`/auditor/revisiones-iq/${id}`);

  return {
    loading, asignaciones, paginados, filtradas,
    busqueda, setBusqueda,
    filtroFecha, setFiltroFecha,
    filtroEstado, setFiltroEstado,
    pagina, setPagina, paginaActual, totalPaginas, paginasVisibles,
    pendientes, auditadas,
    hayFiltrosActivos, limpiarFiltros,
    cargar, goToDetalle,
  };
};