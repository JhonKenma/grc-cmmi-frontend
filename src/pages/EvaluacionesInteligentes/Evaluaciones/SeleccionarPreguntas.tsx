// src/pages/EvaluacionesInteligentes/Evaluaciones/SeleccionarPreguntas.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search,
  Filter,
  Loader2,
  Check,
  X,
  ChevronDown
} from 'lucide-react';
import { evaluacionesInteligentesApi } from '@/api/endpoints';
import { PreguntaCard } from '@/components/iqevaluaciones/PreguntaCard';
import { NivelMadurezBadge } from '@/components/iqevaluaciones/NivelMadurezBadge';
import toast from 'react-hot-toast';
import type { 
  EvaluacionDetail, 
  PreguntaEvaluacionList,
  Framework,
  FiltrosPregunta 
} from '@/types/iqevaluaciones.types';

export const SeleccionarPreguntas = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluacion, setEvaluacion] = useState<EvaluacionDetail | null>(null);
  
  const [frameworkActual, setFrameworkActual] = useState<Framework | null>(null);
  const [preguntas, setPreguntas] = useState<PreguntaEvaluacionList[]>([]);
  const [preguntasSeleccionadas, setPreguntasSeleccionadas] = useState<Set<number>>(new Set());
  
  const [filtros, setFiltros] = useState<FiltrosPregunta>({
    framework: undefined,
    nivel_madurez: undefined,
    seccion: '',
    search: '',
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    if (id) {
      cargarEvaluacion();
    }
  }, [id]);

  useEffect(() => {
    if (filtros.framework) {
      cargarPreguntas();
    }
  }, [filtros]);

  const cargarEvaluacion = async () => {
    try {
      setLoading(true);
      const data = await evaluacionesInteligentesApi.evaluaciones.obtener(Number(id));
      setEvaluacion(data);

      // Cargar preguntas ya seleccionadas
      const preguntasData = await evaluacionesInteligentesApi.evaluaciones.preguntasSeleccionadas(Number(id));
      
      if (!preguntasData.usar_todas_preguntas && preguntasData.preguntas) {
        const ids = new Set(
          preguntasData.preguntas.map((p: any) => 
            p.pregunta_detalle ? p.pregunta_detalle.id : p.id
          )
        );
        setPreguntasSeleccionadas(ids);
      }

      // Seleccionar primer framework
      if (data.frameworks_detail.length > 0) {
        const primerFramework = data.frameworks_detail[0];
        setFrameworkActual(primerFramework);
        setFiltros({ ...filtros, framework: primerFramework.codigo });
      }
    } catch (error) {
      console.error('Error al cargar evaluación:', error);
      toast.error('Error al cargar la evaluación');
    } finally {
      setLoading(false);
    }
  };

  const cargarPreguntas = async () => {
    if (!filtros.framework) return;

    try {
      const data = await evaluacionesInteligentesApi.preguntas.listar(filtros);
      setPreguntas(data.results);
    } catch (error) {
      console.error('Error al cargar preguntas:', error);
      toast.error('Error al cargar las preguntas');
    }
  };

  const handleTogglePregunta = (preguntaId: number) => {
    setPreguntasSeleccionadas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(preguntaId)) {
        newSet.delete(preguntaId);
      } else {
        newSet.add(preguntaId);
      }
      return newSet;
    });
  };

  const handleSeleccionarTodas = () => {
    const todasIds = new Set(preguntas.map((p) => p.id));
    setPreguntasSeleccionadas((prev) => new Set([...prev, ...todasIds]));
  };

  const handleDeseleccionarTodas = () => {
    const preguntasActualesIds = new Set(preguntas.map((p) => p.id));
    setPreguntasSeleccionadas((prev) => {
      const newSet = new Set(prev);
      preguntasActualesIds.forEach((id) => newSet.delete(id));
      return newSet;
    });
  };

  const handleGuardar = async () => {
    if (preguntasSeleccionadas.size === 0) {
      toast.error('Debe seleccionar al menos 1 pregunta');
      return;
    }

    try {
      setSubmitting(true);

      await evaluacionesInteligentesApi.evaluaciones.agregarPreguntas(
        Number(id),
        { preguntas_ids: Array.from(preguntasSeleccionadas) }
      );

      toast.success('Preguntas guardadas correctamente');
      navigate(`/evaluaciones-inteligentes/evaluaciones/${id}`);
    } catch (error: any) {
      console.error('Error al guardar preguntas:', error);
      toast.error(error.response?.data?.error || 'Error al guardar las preguntas');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  if (!evaluacion) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Evaluación no encontrada</p>
      </div>
    );
  }

  const preguntasDelFrameworkActual = preguntas.filter(
    (p) => p.framework_codigo === frameworkActual?.codigo
  );
  const seleccionadasDelFrameworkActual = preguntasDelFrameworkActual.filter(
    (p) => preguntasSeleccionadas.has(p.id)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/evaluaciones-inteligentes/evaluaciones/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Seleccionar Preguntas
            </h1>
            <p className="text-gray-600 mt-1">
              {evaluacion.nombre}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {preguntasSeleccionadas.size}
            </p>
            <p className="text-sm text-gray-600">
              preguntas seleccionadas
            </p>
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

      {/* Pestañas de Frameworks */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          {evaluacion.frameworks_detail.map((framework) => {
            const preguntasDelFramework = Array.from(preguntasSeleccionadas).filter((id) => {
              const pregunta = preguntas.find((p) => p.id === id);
              return pregunta?.framework === framework.id;
            }).length;

            return (
              <button
                key={framework.id}
                onClick={() => {
                  setFrameworkActual(framework);
                  setFiltros({ ...filtros, framework: framework.codigo });
                }}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  frameworkActual?.id === framework.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{framework.codigo}</span>
                  {preguntasDelFramework > 0 && (
                    <span className="px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                      {preguntasDelFramework}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filtros */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-6">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center justify-between w-full lg:hidden mb-4"
            >
              <h3 className="font-semibold text-gray-900">Filtros</h3>
              <ChevronDown
                size={20}
                className={`transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`}
              />
            </button>

            <h3 className="font-semibold text-gray-900 mb-4 hidden lg:block">
              Filtros
            </h3>

            <div className={`space-y-4 ${!mostrarFiltros ? 'hidden lg:block' : ''}`}>
              {/* Búsqueda */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={filtros.search}
                    onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                    placeholder="Buscar..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Nivel de Madurez */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Nivel de Madurez
                </label>
                <select
                  value={filtros.nivel_madurez || ''}
                  onChange={(e) => setFiltros({ 
                    ...filtros, 
                    nivel_madurez: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Todos</option>
                  <option value="1">Nivel 1</option>
                  <option value="2">Nivel 2</option>
                  <option value="3">Nivel 3</option>
                  <option value="4">Nivel 4</option>
                  <option value="5">Nivel 5</option>
                </select>
              </div>

              {/* Sección */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Sección
                </label>
                <input
                  type="text"
                  value={filtros.seccion}
                  onChange={(e) => setFiltros({ ...filtros, seccion: e.target.value })}
                  placeholder="Ej: Políticas"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Acciones */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <button
                  onClick={handleSeleccionarTodas}
                  className="w-full px-3 py-2 text-sm bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100"
                >
                  Seleccionar todas
                </button>
                <button
                  onClick={handleDeseleccionarTodas}
                  className="w-full px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  Deseleccionar todas
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Preguntas */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {frameworkActual?.nombre}
                </h3>
                <p className="text-sm text-gray-600">
                  {seleccionadasDelFrameworkActual} / {preguntasDelFrameworkActual.length} seleccionadas
                </p>
              </div>
            </div>

            <div className="p-4">
              {preguntasDelFrameworkActual.length === 0 ? (
                <div className="text-center py-12">
                  <Filter className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600">
                    No hay preguntas con los filtros aplicados
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {preguntasDelFrameworkActual.map((pregunta) => (
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
          </div>
        </div>
      </div>
    </div>
  );
};