// src/pages/auditor/AuditorRevisiones.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck, Calendar, User, ChevronRight, ChevronLeft,
  RefreshCw, CheckCircle2, Clock, Search, Filter, Building2,
  BookOpen, Layers, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { Card, Button, LoadingScreen } from '@/components/common';
import { respuestasApi } from '@/api/endpoints/respuestas.api';
import toast from 'react-hot-toast';

interface AsignacionAuditor {
  id: string;
  estado: string;
  dimension_info: { nombre: string; codigo: string; total_preguntas: number; };
  encuesta_info: { nombre: string; version: string; };
  usuario_asignado_info: { nombre_completo: string; email: string; cargo: string; };
  empresa_info: { nombre: string; sector_display: string; };
  asignado_por_nombre: string;
  fecha_completado: string;
  fecha_limite: string;
  total_preguntas: number;
  preguntas_respondidas: number;
}

type FiltroFecha  = 'todas' | 'hoy' | 'semana' | 'mes';
type FiltroEstado = 'todos' | 'pendiente' | 'revisado';

const POR_PAGINA = 8;

export const AuditorRevisiones: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading]           = useState(true);
  const [asignaciones, setAsignaciones] = useState<AsignacionAuditor[]>([]);
  const [busqueda, setBusqueda]         = useState('');
  const [filtroFecha, setFiltroFecha]   = useState<FiltroFecha>('todas');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [pagina, setPagina]             = useState(1);

  useEffect(() => { loadRevisiones(); }, []);

  // Reset a página 1 cuando cambian los filtros
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

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const asignacionesFiltradas = useMemo(() => {
    return asignaciones.filter(a => {
      // Búsqueda
      const t = busqueda.toLowerCase();
      const matchBusqueda =
        !busqueda ||
        a.dimension_info?.nombre?.toLowerCase().includes(t) ||
        a.usuario_asignado_info?.nombre_completo?.toLowerCase().includes(t) ||
        a.usuario_asignado_info?.cargo?.toLowerCase().includes(t) ||
        a.encuesta_info?.nombre?.toLowerCase().includes(t) ||
        a.empresa_info?.nombre?.toLowerCase().includes(t);

      // Estado
      const matchEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'pendiente' && (a.estado === 'completado' || a.estado === 'pendiente_auditoria')) ||
        (filtroEstado === 'revisado' && a.estado === 'auditado');

      // Fecha
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

  // ── Paginación ────────────────────────────────────────────────────────────
  const totalPaginas  = Math.max(1, Math.ceil(asignacionesFiltradas.length / POR_PAGINA));
  const paginaActual  = Math.min(pagina, totalPaginas);
  const inicio        = (paginaActual - 1) * POR_PAGINA;
  const paginados     = asignacionesFiltradas.slice(inicio, inicio + POR_PAGINA);

  // Generar números de página visibles (máx 5)
  const paginasVisibles = useMemo(() => {
    const rango: number[] = [];
    const delta = 2;
    const left  = Math.max(2, paginaActual - delta);
    const right = Math.min(totalPaginas - 1, paginaActual + delta);
    rango.push(1);
    if (left > 2) rango.push(-1); // ellipsis
    for (let i = left; i <= right; i++) rango.push(i);
    if (right < totalPaginas - 1) rango.push(-2); // ellipsis
    if (totalPaginas > 1) rango.push(totalPaginas);
    return rango;
  }, [paginaActual, totalPaginas]);

  // ── Estadísticas ──────────────────────────────────────────────────────────
  const pendientes = asignaciones.filter(
    a => a.estado === 'completado' || a.estado === 'pendiente_auditoria'
  ).length;
  const revisadas = asignaciones.filter(a => a.estado === 'auditado').length;

  const formatFecha = (f: string) => {
    if (!f) return '—';
    return new Date(f).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  if (loading) return <LoadingScreen message="Cargando revisiones..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck size={26} className="text-primary-600" />
            Revisiones de Auditoría
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Evaluaciones completadas de tu empresa listas para auditar
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadRevisiones}>
          <RefreshCw size={15} className="mr-1.5" />
          Actualizar
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          className={`text-center py-4 cursor-pointer transition-all ${
            filtroEstado === 'todos' ? 'ring-2 ring-primary-400' : 'hover:border-primary-200'
          }`}
          onClick={() => setFiltroEstado('todos')}
        >
          <p className="text-3xl font-bold text-primary-600">{asignaciones.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total asignaciones</p>
        </Card>
        <Card
          className={`text-center py-4 cursor-pointer transition-all ${
            filtroEstado === 'pendiente' ? 'ring-2 ring-amber-400' : 'hover:border-amber-200'
          }`}
          onClick={() => setFiltroEstado('pendiente')}
        >
          <p className="text-3xl font-bold text-amber-500">{pendientes}</p>
          <p className="text-xs text-gray-500 mt-1">Pendientes de revisar</p>
        </Card>
        <Card
          className={`text-center py-4 cursor-pointer transition-all ${
            filtroEstado === 'revisado' ? 'ring-2 ring-green-400' : 'hover:border-green-200'
          }`}
          onClick={() => setFiltroEstado('revisado')}
        >
          <p className="text-3xl font-bold text-green-600">{revisadas}</p>
          <p className="text-xs text-gray-500 mt-1">Ya revisadas</p>
        </Card>
      </div>

      {/* ── Filtros ── */}
      <Card>
        <div className="flex flex-col gap-3">

          {/* Búsqueda */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por dimensión, usuario, cargo, empresa o encuesta..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Filtro estado */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Estado:</span>
              {([
                { val: 'todos',     label: 'Todos' },
                { val: 'pendiente', label: 'Pendientes' },
                { val: 'revisado',  label: 'Revisadas' },
              ] as { val: FiltroEstado; label: string }[]).map(op => (
                <button
                  key={op.val}
                  onClick={() => setFiltroEstado(op.val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filtroEstado === op.val
                      ? op.val === 'pendiente'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : op.val === 'revisado'
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>

            {/* Separador */}
            <div className="w-px bg-gray-200 self-stretch" />

            {/* Filtro fecha */}
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-gray-400" />
              <span className="text-xs text-gray-500 font-medium">Completada:</span>
              {([
                { val: 'todas',  label: 'Todas' },
                { val: 'hoy',    label: 'Hoy' },
                { val: 'semana', label: 'Esta semana' },
                { val: 'mes',    label: 'Este mes' },
              ] as { val: FiltroFecha; label: string }[]).map(op => (
                <button
                  key={op.val}
                  onClick={() => setFiltroFecha(op.val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filtroFecha === op.val
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resumen de resultados */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Mostrando <strong>{asignacionesFiltradas.length}</strong> de{' '}
              <strong>{asignaciones.length}</strong> asignaciones
              {(busqueda || filtroEstado !== 'todos' || filtroFecha !== 'todas') && (
                <button
                  onClick={() => { setBusqueda(''); setFiltroEstado('todos'); setFiltroFecha('todas'); }}
                  className="ml-2 text-primary-600 hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </span>
            <span>
              Página {paginaActual} de {totalPaginas}
            </span>
          </div>
        </div>
      </Card>

      {/* ── Lista paginada ── */}
      {paginados.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ClipboardCheck size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No hay revisiones que coincidan</p>
            <p className="text-gray-400 text-sm mt-1">Prueba cambiando los filtros</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginados.map(asig => {
            const yaRevisada = asig.estado === 'auditado';
            return (
              <Card
                key={asig.id}
                className={`cursor-pointer hover:shadow-md transition-all ${
                  yaRevisada ? 'border-green-200 bg-green-50/30' : 'hover:border-primary-200'
                }`}
                onClick={() => navigate(`/auditor/revisiones/${asig.id}`)}
              >
                <div className="flex items-start gap-4">

                  {/* Icono */}
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    yaRevisada ? 'bg-green-100' : 'bg-amber-50'
                  }`}>
                    {yaRevisada
                      ? <CheckCircle2 size={22} className="text-green-600" />
                      : <Clock size={22} className="text-amber-500" />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">

                    {/* Dimensión + badge */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-bold text-gray-900">
                        {asig.dimension_info?.nombre}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${
                        yaRevisada
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {yaRevisada ? '✓ Revisada' : 'Pendiente'}
                      </span>
                    </div>

                    {/* Encuesta */}
                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
                      <BookOpen size={12} className="shrink-0" />
                      {asig.encuesta_info?.nombre}
                      <span className="text-gray-300">·</span>
                      v{asig.encuesta_info?.version}
                    </p>

                    {/* Grid datos */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
                      <div className="flex items-start gap-1.5">
                        <User size={13} className="text-gray-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {asig.usuario_asignado_info?.nombre_completo}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {asig.usuario_asignado_info?.cargo || asig.usuario_asignado_info?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Building2 size={13} className="text-gray-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {asig.empresa_info?.nombre}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {asig.empresa_info?.sector_display}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Calendar size={13} className="text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800">
                            {formatFecha(asig.fecha_completado)}
                          </p>
                          <p className="text-xs text-gray-400">Completada</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Layers size={13} className="text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800">
                            {asig.preguntas_respondidas} / {asig.total_preguntas} preguntas
                          </p>
                          <p className="text-xs text-gray-400">
                            Por {asig.asignado_por_nombre}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ChevronRight size={18} className="text-gray-400 shrink-0 mt-1" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Paginación ── */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-1.5">

          {/* Primera página */}
          <button
            onClick={() => setPagina(1)}
            disabled={paginaActual === 1}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Primera página"
          >
            <ChevronsLeft size={16} />
          </button>

          {/* Anterior */}
          <button
            onClick={() => setPagina(p => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Anterior"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Números */}
          {paginasVisibles.map((p, i) =>
            p < 0 ? (
              <span key={`e${i}`} className="px-1 text-gray-400 text-sm">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPagina(p)}
                className={`min-w-[34px] h-[34px] rounded-lg border text-sm font-medium transition-all ${
                  p === paginaActual
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            )
          )}

          {/* Siguiente */}
          <button
            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Siguiente"
          >
            <ChevronRight size={16} />
          </button>

          {/* Última página */}
          <button
            onClick={() => setPagina(totalPaginas)}
            disabled={paginaActual === totalPaginas}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Última página"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};