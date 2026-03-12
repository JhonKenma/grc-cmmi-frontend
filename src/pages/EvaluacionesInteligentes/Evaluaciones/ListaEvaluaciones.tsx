// src/pages/EvaluacionesInteligentes/Evaluaciones/ListaEvaluaciones.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import axiosInstance from '@/api/axios';
import { EstadoBadge } from '@/components/iqevaluaciones/EstadoBadge';
import toast from 'react-hot-toast';
import type { EvaluacionList } from '@/types/iqevaluaciones.types';

// ─── Constantes ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const ESTADOS = [
  { value: 'todas', label: 'Todos los estados' },
  { value: 'configurando', label: 'Configurando' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'asignada', label: 'Asignada' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'completada', label: 'Completada' },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export const ListaEvaluaciones = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionList[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // valor del input antes de buscar
  const [filtroEstado, setFiltroEstado] = useState('todas');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);

  // Menú contextual
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);

  // ── Carga con filtros server-side ──────────────────────────────────────────

  const cargarEvaluaciones = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('page_size', PAGE_SIZE.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (filtroEstado !== 'todas') params.append('estado', filtroEstado);

      const { data } = await axiosInstance.get(
        `/evaluaciones/evaluaciones/?${params.toString()}`
      );

      // Soporta tanto respuesta paginada como array directo
      if (Array.isArray(data)) {
        setEvaluaciones(data);
        setTotalCount(data.length);
      } else {
        setEvaluaciones(data.results ?? []);
        setTotalCount(data.count ?? 0);
      }
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error);
      toast.error('Error al cargar las evaluaciones');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filtroEstado]);

  useEffect(() => {
    cargarEvaluaciones();
  }, [cargarEvaluaciones]);

  // Al cambiar filtros, volver a página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filtroEstado]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  // Búsqueda solo al presionar Enter o hacer click en el ícono
  const handleSearch = () => {
    setSearchTerm(searchInput.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') {
      setSearchInput('');
      setSearchTerm('');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta evaluación?')) return;
    try {
      await axiosInstance.delete(`/evaluaciones/evaluaciones/${id}/`);
      toast.success('Evaluación eliminada correctamente');
      cargarEvaluaciones();
    } catch {
      toast.error('Error al eliminar la evaluación');
    }
  };

  // ── Paginación ─────────────────────────────────────────────────────────────

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Volver */}
      <button
        onClick={() => navigate('/evaluaciones-inteligentes')}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Volver al Dashboard
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluaciones</h1>
          <p className="text-gray-600 mt-1">Gestiona las evaluaciones del sistema</p>
        </div>
        <button
          onClick={() => navigate('/evaluaciones-inteligentes/evaluaciones/crear')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Nueva Evaluación
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Búsqueda */}
          <div className="relative">
            <button
              onClick={handleSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
            >
              <Search size={20} />
            </button>
            <input
              type="text"
              placeholder="Buscar y presiona Enter..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); setSearchTerm(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Estado */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
            >
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>

          {/* Contador */}
          <div className="flex items-center justify-end text-sm text-gray-600">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Cargando...
              </span>
            ) : (
              <span>
                {totalCount === 0
                  ? 'Sin resultados'
                  : `${((currentPage - 1) * PAGE_SIZE) + 1}–${Math.min(currentPage * PAGE_SIZE, totalCount)} de ${totalCount}`}
              </span>
            )}
          </div>
        </div>

        {/* Chip de búsqueda activa */}
        {searchTerm && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">Buscando:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
              "{searchTerm}"
              <button onClick={() => { setSearchInput(''); setSearchTerm(''); }} className="ml-1 hover:text-primary-900">×</button>
            </span>
          </div>
        )}
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary-600" size={40} />
        </div>
      ) : evaluaciones.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay evaluaciones</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filtroEstado !== 'todas'
              ? 'No se encontraron evaluaciones con los filtros aplicados'
              : 'Comienza creando tu primera evaluación'}
          </p>
          {!searchTerm && filtroEstado === 'todas' && (
            <button
              onClick={() => navigate('/evaluaciones-inteligentes/evaluaciones/crear')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Crear Evaluación
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evaluación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frameworks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preguntas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {evaluaciones.map((evaluacion) => (
                <tr key={evaluacion.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{evaluacion.nombre}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{evaluacion.frameworks_nombres}</p>
                  </td>
                  <td className="px-6 py-4">
                    <EstadoBadge estado={evaluacion.estado} />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{evaluacion.total_preguntas}</p>
                    <p className="text-xs text-gray-500">{evaluacion.usar_todas_preguntas ? 'Todas' : 'Seleccionadas'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(evaluacion.fecha_creacion).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setMenuAbierto(menuAbierto === evaluacion.id ? null : evaluacion.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical size={20} className="text-gray-600" />
                      </button>

                      {menuAbierto === evaluacion.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(null)} />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                            <button
                              onClick={() => { navigate(`/evaluaciones-inteligentes/evaluaciones/${evaluacion.id}`); setMenuAbierto(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye size={16} /> Ver Detalle
                            </button>
                            {evaluacion.estado === 'configurando' && (
                              <button
                                onClick={() => { navigate(`/evaluaciones-inteligentes/evaluaciones/${evaluacion.id}/seleccionar-preguntas`); setMenuAbierto(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Edit size={16} /> Seleccionar Preguntas
                              </button>
                            )}
                            <button
                              onClick={() => { handleEliminar(evaluacion.id); setMenuAbierto(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} /> Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Paginación ── */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Página <span className="font-semibold">{currentPage}</span> de{' '}
                <span className="font-semibold">{totalPages}</span>
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map((page, idx) =>
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">…</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
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
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};