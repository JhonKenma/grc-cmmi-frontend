// src/pages/EvaluacionesInteligentes/Evaluaciones/SeleccionarPreguntas.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  Loader2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { evaluacionesInteligentesApi } from '@/api/endpoints';
import { PreguntaCard } from '@/components/iqevaluaciones/PreguntaCard';
import toast from 'react-hot-toast';
import type {
  EvaluacionDetail,
  PreguntaEvaluacionList,
  Framework,
} from '@/types/iqevaluaciones.types';

// ─── Constantes ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 400;

// ─── Componente ───────────────────────────────────────────────────────────────

export const SeleccionarPreguntas = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── Estado general ─────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [loadingPreguntas, setLoadingPreguntas] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [evaluacion, setEvaluacion] = useState<EvaluacionDetail | null>(null);

  // ── Framework activo ───────────────────────────────────────────────────────
  const [frameworkActual, setFrameworkActual] = useState<Framework | null>(null);

  // ── Preguntas ──────────────────────────────────────────────────────────────
  const [preguntas, setPreguntas] = useState<PreguntaEvaluacionList[]>([]);
  const [totalPreguntas, setTotalPreguntas] = useState(0);
  const [preguntasSeleccionadas, setPreguntasSeleccionadas] = useState<Set<number>>(new Set());

  // ── Filtros ────────────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');   // valor del input
  const [searchTerm, setSearchTerm] = useState('');     // valor debounceado
  const [nivelMadurez, setNivelMadurez] = useState<string>('');
  const [seccion, setSeccion] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Ref para debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Inicialización ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (id) cargarEvaluacion();
  }, [id]);

  const cargarEvaluacion = async () => {
    try {
      setLoading(true);
      const data = await evaluacionesInteligentesApi.evaluaciones.obtener(Number(id));
      setEvaluacion(data);

      // Cargar preguntas ya seleccionadas
      const preguntasData = await evaluacionesInteligentesApi.evaluaciones.preguntasSeleccionadas(Number(id));
      if (!preguntasData.usar_todas_preguntas && preguntasData.preguntas) {
        const ids = new Set<number>(
          preguntasData.preguntas.map((p: any) =>
            p.pregunta_detalle ? p.pregunta_detalle.id : p.id
          )
        );
        setPreguntasSeleccionadas(ids);
      }

      // Seleccionar primer framework
      if (data.frameworks_detail.length > 0) {
        setFrameworkActual(data.frameworks_detail[0]);
      }
    } catch {
      toast.error('Error al cargar la evaluación');
    } finally {
      setLoading(false);
    }
  };

  // ── Carga de preguntas (server-side) ───────────────────────────────────────

  const cargarPreguntas = useCallback(async () => {
    if (!frameworkActual) return;

    try {
      setLoadingPreguntas(true);

      const data = await evaluacionesInteligentesApi.preguntas.listar({
        framework: frameworkActual.codigo,
        nivel_madurez: nivelMadurez ? Number(nivelMadurez) : undefined,
        seccion: seccion || undefined,
        search: searchTerm || undefined,
        page: currentPage,
      });

      setPreguntas(data.results);
      setTotalPreguntas(data.count);
    } catch {
      toast.error('Error al cargar las preguntas');
    } finally {
      setLoadingPreguntas(false);
    }
  }, [frameworkActual, nivelMadurez, seccion, searchTerm, currentPage]);

  useEffect(() => {
    cargarPreguntas();
  }, [cargarPreguntas]);

  // Al cambiar filtros (menos página), resetear a página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [frameworkActual, nivelMadurez, seccion, searchTerm]);

  // ── Debounce del buscador ──────────────────────────────────────────────────

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(value.trim());
    }, DEBOUNCE_MS);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  // ── Selección de preguntas ─────────────────────────────────────────────────

  const handleTogglePregunta = (preguntaId: number) => {
    setPreguntasSeleccionadas((prev) => {
      const next = new Set(prev);
      next.has(preguntaId) ? next.delete(preguntaId) : next.add(preguntaId);
      return next;
    });
  };

  // Seleccionar/deseleccionar solo la página actual
  const handleSeleccionarPagina = () => {
    const ids = new Set(preguntas.map((p) => p.id));
    setPreguntasSeleccionadas((prev) => new Set([...prev, ...ids]));
  };

  const handleDeseleccionarPagina = () => {
    const ids = new Set(preguntas.map((p) => p.id));
    setPreguntasSeleccionadas((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  // ── Guardar ────────────────────────────────────────────────────────────────

  const handleGuardar = async () => {
    if (preguntasSeleccionadas.size === 0) {
      toast.error('Debe seleccionar al menos 1 pregunta');
      return;
    }
    try {
      setSubmitting(true);
      await evaluacionesInteligentesApi.evaluaciones.agregarPreguntas(Number(id), {
        preguntas_ids: Array.from(preguntasSeleccionadas),
      });
      toast.success('Preguntas guardadas correctamente');
      navigate(`/evaluaciones-inteligentes/evaluaciones/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar las preguntas');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Paginación ─────────────────────────────────────────────────────────────

  const totalPages = Math.ceil(totalPreguntas / PAGE_SIZE);

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const seleccionadasEnPaginaActual = preguntas.filter((p) =>
    preguntasSeleccionadas.has(p.id)
  ).length;

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  if (!evaluacion) {
    return <div className="text-center py-12"><p className="text-gray-600">Evaluación no encontrada</p></div>;
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/evaluaciones-inteligentes/evaluaciones/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seleccionar Preguntas</h1>
            <p className="text-gray-600 mt-1">{evaluacion.nombre}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{preguntasSeleccionadas.size}</p>
            <p className="text-sm text-gray-600">preguntas seleccionadas</p>
          </div>
          <button
            onClick={handleGuardar}
            disabled={submitting || preguntasSeleccionadas.size === 0}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="animate-spin" size={20} />}
            <Check size={20} />
            Guardar Selección
          </button>
        </div>
      </div>

      {/* ── Tabs de Frameworks ── */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          {evaluacion.frameworks_detail.map((framework) => (
            <button
              key={framework.id}
              onClick={() => setFrameworkActual(framework)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                frameworkActual?.id === framework.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">{framework.codigo}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Panel de filtros ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-6">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center justify-between w-full lg:hidden mb-4"
            >
              <h3 className="font-semibold text-gray-900">Filtros</h3>
              <ChevronDown size={20} className={`transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`} />
            </button>

            <h3 className="font-semibold text-gray-900 mb-4 hidden lg:block">Filtros</h3>

            <div className={`space-y-4 ${!mostrarFiltros ? 'hidden lg:block' : ''}`}>

              {/* Búsqueda con debounce */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Buscar pregunta..."
                    className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                  {searchInput && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <p className="text-xs text-primary-600 mt-1">Buscando: "{searchTerm}"</p>
                )}
              </div>

              {/* Nivel de Madurez */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Nivel de Madurez</label>
                <select
                  value={nivelMadurez}
                  onChange={(e) => setNivelMadurez(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Todos</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>Nivel {n}</option>
                  ))}
                </select>
              </div>

              {/* Sección */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sección</label>
                <input
                  type="text"
                  value={seccion}
                  onChange={(e) => setSeccion(e.target.value)}
                  placeholder="Ej: Políticas"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Acciones de selección */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <p className="text-xs text-gray-500 mb-2">Acciones sobre esta página</p>
                <button
                  onClick={handleSeleccionarPagina}
                  className="w-full px-3 py-2 text-sm bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100"
                >
                  Seleccionar página
                </button>
                <button
                  onClick={handleDeseleccionarPagina}
                  className="w-full px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  Deseleccionar página
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Lista de preguntas ── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200">

            {/* Cabecera con contador */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{frameworkActual?.nombre}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  {loadingPreguntas ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <span>
                        {seleccionadasEnPaginaActual}/{preguntas.length} en esta página
                      </span>
                      <span className="text-gray-400">·</span>
                      <span className="font-medium text-gray-800">
                        {totalPreguntas} totales
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4">
              {loadingPreguntas ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <Loader2 size={28} className="animate-spin mr-2" />
                  <span className="text-sm">Cargando preguntas...</span>
                </div>
              ) : preguntas.length === 0 ? (
                <div className="text-center py-12">
                  <Filter className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600">No hay preguntas con los filtros aplicados</p>
                  {(searchTerm || nivelMadurez || seccion) && (
                    <button
                      onClick={() => { handleClearSearch(); setNivelMadurez(''); setSeccion(''); }}
                      className="mt-3 text-sm text-primary-600 hover:underline"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {preguntas.map((pregunta) => (
                    <PreguntaCard
                      key={pregunta.id}
                      pregunta={pregunta}
                      selected={preguntasSeleccionadas.has(pregunta.id)}
                      showCheckbox
                      onSelect={() => handleTogglePregunta(pregunta.id)}
                      showFramework={false}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Paginación ── */}
            {!loadingPreguntas && totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Pág. <span className="font-semibold">{currentPage}</span> de{' '}
                  <span className="font-semibold">{totalPages}</span>
                  {' '}·{' '}
                  {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, totalPreguntas)} de {totalPreguntas}
                </p>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {getPageNumbers().map((page, idx) =>
                    page === '...' ? (
                      <span key={`e-${idx}`} className="px-1 text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};