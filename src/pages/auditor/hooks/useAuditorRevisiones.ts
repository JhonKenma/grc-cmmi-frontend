// src/pages/auditor/hooks/useAuditorRevisiones.ts
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { respuestasApi } from '@/api/endpoints/respuestas.api';
import toast from 'react-hot-toast';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface AsignacionAuditor {
  id: string;
  estado: string;
  dimension_info:        { nombre: string; codigo: string; total_preguntas: number };
  encuesta_info:         { nombre: string; version: string };
  usuario_asignado_info: { nombre_completo: string; email: string; cargo: string };
  empresa_info:          { nombre: string; sector_display: string };
  asignado_por_nombre:   string;
  fecha_completado:      string;
  fecha_limite:          string;
  total_preguntas:       number;
  preguntas_respondidas: number;
}

export type FiltroFecha  = 'todas' | 'hoy' | 'semana' | 'mes';
export type FiltroEstado = 'todos' | 'pendiente' | 'revisado';

// ── Constantes ───────────────────────────────────────────────────────────────

export const POR_PAGINA = 8;

// ── Helper ───────────────────────────────────────────────────────────────────

export const formatFechaRevision = (f: string): string => {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useAuditorRevisiones = () => {
  const navigate = useNavigate();

  const [loading, setLoading]           = useState(true);
  const [asignaciones, setAsignaciones] = useState<AsignacionAuditor[]>([]);
  const [busqueda, setBusqueda]         = useState('');
  const [filtroFecha, setFiltroFecha]   = useState<FiltroFecha>('todas');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [pagina, setPagina]             = useState(1);

  useEffect(() => { loadRevisiones(); }, []);
  useEffect(() => { setPagina(1); }, [busqueda, filtroFecha, filtroEstado]);

  const loadRevisiones = async () => {
    try {
      setLoading(true);
      const data    = await respuestasApi.auditor.misRevisiones();
      const results = Array.isArray(data) ? data : (data as any)?.results || [];
      setAsignaciones(results);
    } catch {
      toast.error('Error al cargar las revisiones');
    } finally {
      setLoading(false);
    }
  };

  // Filtrado
  const asignacionesFiltradas = useMemo(() => {
    return asignaciones.filter(a => {
      const t = busqueda.toLowerCase();
      const matchBusqueda =
        !busqueda ||
        a.dimension_info?.nombre?.toLowerCase().includes(t) ||
        a.usuario_asignado_info?.nombre_completo?.toLowerCase().includes(t) ||
        a.usuario_asignado_info?.cargo?.toLowerCase().includes(t) ||
        a.encuesta_info?.nombre?.toLowerCase().includes(t) ||
        a.empresa_info?.nombre?.toLowerCase().includes(t);

      const matchEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'pendiente' && (a.estado === 'completado' || a.estado === 'pendiente_auditoria')) ||
        (filtroEstado === 'revisado'  && a.estado === 'auditado');

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
  const totalPaginas = Math.max(1, Math.ceil(asignacionesFiltradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio       = (paginaActual - 1) * POR_PAGINA;
  const paginados    = asignacionesFiltradas.slice(inicio, inicio + POR_PAGINA);

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
  const pendientes = asignaciones.filter(
    a => a.estado === 'completado' || a.estado === 'pendiente_auditoria'
  ).length;
  const revisadas = asignaciones.filter(a => a.estado === 'auditado').length;

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('todos');
    setFiltroFecha('todas');
  };

  const hayFiltrosActivos = busqueda || filtroEstado !== 'todos' || filtroFecha !== 'todas';

  const goToDetalle = (id: string) => navigate(`/auditor/revisiones/${id}`);

  return {
    loading, asignaciones, paginados, asignacionesFiltradas,
    busqueda, setBusqueda,
    filtroFecha, setFiltroFecha,
    filtroEstado, setFiltroEstado,
    pagina, setPagina, paginaActual, totalPaginas, paginasVisibles,
    pendientes, revisadas,
    hayFiltrosActivos, limpiarFiltros,
    loadRevisiones, goToDetalle,
  };
};