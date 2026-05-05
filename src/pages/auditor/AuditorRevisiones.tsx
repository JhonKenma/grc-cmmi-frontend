// src/pages/auditor/AuditorRevisiones.tsx
import React from 'react';
import {
  ClipboardCheck, Calendar, User, ChevronRight, ChevronLeft,
  RefreshCw, CheckCircle2, Clock, Search, Filter, Building2,
  BookOpen, Layers, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { Card, Button, LoadingScreen } from '@/components/common';
import { useAuditorRevisiones, formatFechaRevision } from './hooks';
import type { FiltroEstado, FiltroFecha } from './hooks';

export const AuditorRevisiones: React.FC = () => {
  const {
    loading, asignaciones, paginados, asignacionesFiltradas,
    busqueda, setBusqueda,
    filtroFecha, setFiltroFecha,
    filtroEstado, setFiltroEstado,
    pagina, setPagina, paginaActual, totalPaginas, paginasVisibles,
    pendientes, revisadas,
    hayFiltrosActivos, limpiarFiltros,
    loadRevisiones, goToDetalle,
  } = useAuditorRevisiones();

  if (loading) return <LoadingScreen message="Cargando revisiones..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
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
          <RefreshCw size={15} className="mr-1.5" /> Actualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          className={`text-center py-4 cursor-pointer transition-all ${filtroEstado === 'todos' ? 'ring-2 ring-primary-400' : 'hover:border-primary-200'}`}
          onClick={() => setFiltroEstado('todos')}
        >
          <p className="text-3xl font-bold text-primary-600">{asignaciones.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total asignaciones</p>
        </Card>
        <Card
          className={`text-center py-4 cursor-pointer transition-all ${filtroEstado === 'pendiente' ? 'ring-2 ring-amber-400' : 'hover:border-amber-200'}`}
          onClick={() => setFiltroEstado('pendiente')}
        >
          <p className="text-3xl font-bold text-amber-500">{pendientes}</p>
          <p className="text-xs text-gray-500 mt-1">Pendientes de revisar</p>
        </Card>
        <Card
          className={`text-center py-4 cursor-pointer transition-all ${filtroEstado === 'revisado' ? 'ring-2 ring-green-400' : 'hover:border-green-200'}`}
          onClick={() => setFiltroEstado('revisado')}
        >
          <p className="text-3xl font-bold text-green-600">{revisadas}</p>
          <p className="text-xs text-gray-500 mt-1">Ya revisadas</p>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-col gap-3">
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
                      ? op.val === 'pendiente' ? 'bg-amber-500 text-white border-amber-500'
                        : op.val === 'revisado' ? 'bg-green-600 text-white border-green-600'
                        : 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>

            <div className="w-px bg-gray-200 self-stretch" />

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

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Mostrando <strong>{asignacionesFiltradas.length}</strong> de{' '}
              <strong>{asignaciones.length}</strong> asignaciones
              {hayFiltrosActivos && (
                <button onClick={limpiarFiltros} className="ml-2 text-primary-600 hover:underline">
                  Limpiar filtros
                </button>
              )}
            </span>
            <span>Página {paginaActual} de {totalPaginas}</span>
          </div>
        </div>
      </Card>

      {/* Lista paginada */}
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
                onClick={() => goToDetalle(asig.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${yaRevisada ? 'bg-green-100' : 'bg-amber-50'}`}>
                    {yaRevisada
                      ? <CheckCircle2 size={22} className="text-green-600" />
                      : <Clock size={22} className="text-amber-500" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-bold text-gray-900">{asig.dimension_info?.nombre}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${
                        yaRevisada
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {yaRevisada ? '✓ Revisada' : 'Pendiente'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
                      <BookOpen size={12} className="shrink-0" />
                      {asig.encuesta_info?.nombre}
                      <span className="text-gray-300">·</span>
                      v{asig.encuesta_info?.version}
                    </p>

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
                          <p className="text-xs font-semibold text-gray-800 truncate">{asig.empresa_info?.nombre}</p>
                          <p className="text-xs text-gray-400 truncate">{asig.empresa_info?.sector_display}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Calendar size={13} className="text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{formatFechaRevision(asig.fecha_completado)}</p>
                          <p className="text-xs text-gray-400">Completada</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Layers size={13} className="text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800">
                            {asig.preguntas_respondidas} / {asig.total_preguntas} preguntas
                          </p>
                          <p className="text-xs text-gray-400">Por {asig.asignado_por_nombre}</p>
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

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button onClick={() => setPagina(1)} disabled={paginaActual === 1}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronsLeft size={16} />
          </button>
          <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={paginaActual === 1}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={16} />
          </button>
          {paginasVisibles.map((p, i) =>
            p < 0 ? (
              <span key={`e${i}`} className="px-1 text-gray-400 text-sm">…</span>
            ) : (
              <button key={p} onClick={() => setPagina(p)}
                className={`min-w-[34px] h-[34px] rounded-lg border text-sm font-medium transition-all ${
                  p === paginaActual
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {p}
              </button>
            )
          )}
          <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setPagina(totalPaginas)} disabled={paginaActual === totalPaginas}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronsRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};