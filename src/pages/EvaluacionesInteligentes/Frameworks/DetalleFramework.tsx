// src/pages/EvaluacionesInteligentes/Frameworks/DetalleFramework.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader2,
  FileText,
  Link as LinkIcon,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { evaluacionesInteligentesApi } from '@/api/endpoints';
import { PreguntaCard } from '@/components/iqevaluaciones/PreguntaCard';
import { NivelMadurezBadge } from '@/components/iqevaluaciones/NivelMadurezBadge';
import toast from 'react-hot-toast';
import type { 
  Framework, 
  PreguntaEvaluacionDetail,
  PreguntaEvaluacionList,
  PaginatedResponse 
} from '@/types/iqevaluaciones.types';

export const DetalleFramework = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [loadingPreguntas, setLoadingPreguntas] = useState(false);
  const [framework, setFramework] = useState<Framework | null>(null);
  const [preguntasData, setPreguntasData] = useState<PaginatedResponse<PreguntaEvaluacionList> | null>(null);
  const [preguntaSeleccionada, setPreguntaSeleccionada] = useState<PreguntaEvaluacionDetail | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [todasLasPreguntasParaEstadisticas, setTodasLasPreguntasParaEstadisticas] = useState<PreguntaEvaluacionList[]>([]);
  
  const [filtros, setFiltros] = useState({
    nivel_madurez: '',
    seccion: '',
    search: '',
  });

  // Resetear página cuando cambian filtros
  const handleFiltroChange = (nuevosFiltros: typeof filtros) => {
    setFiltros(nuevosFiltros);
    setPaginaActual(1); // Volver a página 1
  };

  useEffect(() => {
    if (codigo) {
      cargarDatos();
    }
  }, [codigo]);

  useEffect(() => {
    if (codigo) {
      cargarPreguntas();
    }
  }, [filtros, paginaActual, codigo]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Obtener lista de frameworks para encontrar el actual
      const frameworks = await evaluacionesInteligentesApi.frameworks.listar();
      const frameworkActual = frameworks.find(fw => fw.codigo === codigo);
      
      if (!frameworkActual) {
        toast.error('Framework no encontrado');
        navigate('/evaluaciones-inteligentes/frameworks');
        return;
      }

      setFramework(frameworkActual);
      
      // Cargar TODAS las preguntas solo para estadísticas (sin mostrarlas)
      await cargarPreguntasParaEstadisticas();
      
      // Cargar primera página de preguntas para mostrar
      await cargarPreguntas();
      
    } catch (error) {
      console.error('Error al cargar framework:', error);
      toast.error('Error al cargar el framework');
    } finally {
      setLoading(false);
    }
  };

  const cargarPreguntasParaEstadisticas = async () => {
    if (!codigo) return;

    try {
      let todasLasPreguntas: PreguntaEvaluacionList[] = [];
      let page = 1;
      let hasMore = true;

      // Cargar todas las páginas para estadísticas
      while (hasMore) {
        const params: any = { 
          framework: codigo,
          page: page,
        };

        const response = await evaluacionesInteligentesApi.preguntas.listar(params);
        todasLasPreguntas = [...todasLasPreguntas, ...response.results];
        
        hasMore = response.next !== null;
        page++;
        
        if (page > 100) break;
      }

      setTodasLasPreguntasParaEstadisticas(todasLasPreguntas);

    } catch (error) {
      console.error('Error al cargar preguntas para estadísticas:', error);
    }
  };

  const cargarPreguntas = async () => {
    if (!codigo) return;

    try {
      setLoadingPreguntas(true);
      
      const params: any = { 
        framework: codigo,
        page: paginaActual,
      };
      
      // Aplicar filtros si existen
      if (filtros.nivel_madurez) params.nivel_madurez = Number(filtros.nivel_madurez);
      if (filtros.seccion) params.seccion = filtros.seccion;
      if (filtros.search) params.search = filtros.search;

      const response = await evaluacionesInteligentesApi.preguntas.listar(params);
      setPreguntasData(response);

    } catch (error) {
      console.error('Error al cargar preguntas:', error);
      toast.error('Error al cargar las preguntas');
    } finally {
      setLoadingPreguntas(false);
    }
  };

  const handleVerDetallePregunta = async (preguntaId: number) => {
    try {
      const pregunta = await evaluacionesInteligentesApi.preguntas.obtener(preguntaId);
      setPreguntaSeleccionada(pregunta);
    } catch (error) {
      console.error('Error al cargar pregunta:', error);
      toast.error('Error al cargar el detalle de la pregunta');
    }
  };

  // Calcular estadísticas de niveles con TODAS las preguntas
  const estadisticasNiveles = todasLasPreguntasParaEstadisticas.reduce((acc, p) => {
    acc[p.nivel_madurez] = (acc[p.nivel_madurez] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  if (!framework) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Framework no encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/evaluaciones-inteligentes/frameworks')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {framework.nombre}
          </h1>
          <p className="text-gray-600 mt-1">
            {framework.codigo} • Versión {framework.version}
          </p>
        </div>
      </div>

      {/* Información del Framework */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Información General
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Código
            </label>
            <p className="mt-1 text-gray-900 font-medium">
              {framework.codigo}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Versión
            </label>
            <p className="mt-1 text-gray-900 font-medium">
              {framework.version}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Total de Preguntas
            </label>
            <p className="mt-1 text-gray-900 font-medium">
              {framework.total_preguntas}
            </p>
          </div>

          {framework.descripcion && (
            <div className="md:col-span-3">
              <label className="text-sm font-medium text-gray-600">
                Descripción
              </label>
              <p className="mt-1 text-gray-700">
                {framework.descripcion}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-600">
              Fecha de Creación
            </label>
            <div className="mt-1 flex items-center gap-2 text-gray-900">
              <Calendar size={16} />
              {new Date(framework.fecha_creacion).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Estado
            </label>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                framework.activo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {framework.activo ? 'Activo' : 'Inactivo'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas por Nivel de Madurez */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Distribución por Nivel de Madurez
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((nivel) => (
            <div key={nivel} className="text-center p-4 bg-gray-50 rounded-lg">
              <NivelMadurezBadge nivel={nivel as 1 | 2 | 3 | 4 | 5} />
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {estadisticasNiveles[nivel] || 0}
              </p>
              <p className="text-xs text-gray-600">preguntas</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros y Preguntas */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Preguntas del Framework ({preguntasData?.count || 0})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar preguntas..."
                value={filtros.search}
                onChange={(e) => handleFiltroChange({ ...filtros, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filtro Nivel */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filtros.nivel_madurez}
                onChange={(e) => handleFiltroChange({ ...filtros, nivel_madurez: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="">Todos los niveles</option>
                <option value="1">Nivel 1</option>
                <option value="2">Nivel 2</option>
                <option value="3">Nivel 3</option>
                <option value="4">Nivel 4</option>
                <option value="5">Nivel 5</option>
              </select>
            </div>

            {/* Filtro Sección */}
            <input
              type="text"
              placeholder="Filtrar por sección..."
              value={filtros.seccion}
              onChange={(e) => setFiltros({ ...filtros, seccion: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="p-6">
          {loadingPreguntas ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary-600 mr-3" size={24} />
              <span className="text-gray-600">Cargando preguntas...</span>
            </div>
          ) : preguntasData && preguntasData.results.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 mb-6">
                {preguntasData.results.map((pregunta) => (
                  <PreguntaCard
                    key={pregunta.id}
                    pregunta={pregunta}
                    onClick={() => handleVerDetallePregunta(pregunta.id)}
                    showFramework={false}
                  />
                ))}
              </div>

              {/* Paginación */}
              {preguntasData.count > 20 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Mostrando {((paginaActual - 1) * 20) + 1} - {Math.min(paginaActual * 20, preguntasData.count)} de {preguntasData.count} preguntas
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setPaginaActual(paginaActual - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={!preguntasData.previous}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(preguntasData.count / 20) }, (_, i) => i + 1)
                        .filter(page => {
                          // Mostrar páginas cercanas a la actual
                          return page === 1 || 
                                 page === Math.ceil(preguntasData.count / 20) || 
                                 (page >= paginaActual - 2 && page <= paginaActual + 2);
                        })
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => {
                                setPaginaActual(page);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`w-10 h-10 rounded-lg transition-colors ${
                                paginaActual === page
                                  ? 'bg-primary-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        ))}
                    </div>

                    <button
                      onClick={() => {
                        setPaginaActual(paginaActual + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={!preguntasData.next}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600">
                No hay preguntas con los filtros aplicados
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detalle Pregunta */}
      {preguntaSeleccionada && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setPreguntaSeleccionada(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              {/* Header Modal */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                      #{preguntaSeleccionada.correlativo}
                    </span>
                    <span className="text-xs text-gray-500">
                      {preguntaSeleccionada.codigo_control}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {preguntaSeleccionada.nombre_control}
                  </h3>
                </div>
                <button
                  onClick={() => setPreguntaSeleccionada(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Información */}
              <div className="space-y-6">
                {preguntaSeleccionada.seccion_general && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Sección General
                    </label>
                    <p className="mt-1 text-gray-900">
                      {preguntaSeleccionada.seccion_general}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Nivel de Madurez
                  </label>
                  <div className="mt-1">
                    <NivelMadurezBadge 
                      nivel={preguntaSeleccionada.nivel_madurez as 1 | 2 | 3 | 4 | 5} 
                      showText 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Pregunta de Evaluación
                  </label>
                  <p className="mt-1 text-gray-900">
                    {preguntaSeleccionada.pregunta}
                  </p>
                </div>

                {preguntaSeleccionada.objetivo_evaluacion && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Objetivo de Evaluación
                    </label>
                    <p className="mt-1 text-gray-700">
                      {preguntaSeleccionada.objetivo_evaluacion}
                    </p>
                  </div>
                )}

                {/* Evidencias Requeridas */}
                {preguntaSeleccionada.evidencias_requeridas.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-3 block">
                      Evidencias Requeridas ({preguntaSeleccionada.evidencias_requeridas.length})
                    </label>
                    <div className="space-y-2">
                      {preguntaSeleccionada.evidencias_requeridas.map((evidencia) => (
                        <div
                          key={evidencia.id}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <p className="text-sm text-gray-900">
                            {evidencia.descripcion}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Relaciones con otros Frameworks */}
                {preguntaSeleccionada.relaciones_frameworks.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-3 block">
                      Relaciones con otros Frameworks ({preguntaSeleccionada.relaciones_frameworks.length})
                    </label>
                    <div className="space-y-2">
                      {preguntaSeleccionada.relaciones_frameworks.map((relacion) => (
                        <div
                          key={relacion.id}
                          className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-2"
                        >
                          <LinkIcon size={16} className="text-blue-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">
                              {relacion.framework_destino_nombre}
                            </p>
                            <p className="text-xs text-blue-700">
                              {relacion.referencia_textual}
                            </p>
                          </div>
                          {relacion.porcentaje_cobertura < 100 && (
                            <span className="text-xs text-blue-600">
                              {relacion.porcentaje_cobertura}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {preguntaSeleccionada.tags && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Etiquetas
                    </label>
                    <p className="mt-1 text-sm text-gray-700">
                      {preguntaSeleccionada.tags}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};