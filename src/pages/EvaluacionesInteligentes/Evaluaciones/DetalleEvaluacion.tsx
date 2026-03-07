// src/pages/EvaluacionesInteligentes/Evaluaciones/DetalleEvaluacion.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader2, 
  Calendar,
  User,
  FileText,
  Settings,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { evaluacionesInteligentesApi } from '@/api/endpoints';
import { EstadoBadge } from '@/components/iqevaluaciones/EstadoBadge';
import { PreguntaCard } from '@/components/iqevaluaciones/PreguntaCard';
import toast from 'react-hot-toast';
import type { EvaluacionDetail, PreguntasSeleccionadasResponse } from '@/types/iqevaluaciones.types';

export const DetalleEvaluacion = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [evaluacion, setEvaluacion] = useState<EvaluacionDetail | null>(null);
  const [preguntasData, setPreguntasData] = useState<PreguntasSeleccionadasResponse | null>(null);
  const [vistaActual, setVistaActual] = useState<'info' | 'preguntas'>('info');

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [evaluacionData, preguntasResponse] = await Promise.all([
        evaluacionesInteligentesApi.evaluaciones.obtener(Number(id)),
        evaluacionesInteligentesApi.evaluaciones.preguntasSeleccionadas(Number(id)),
      ]);

      setEvaluacion(evaluacionData);
      setPreguntasData(preguntasResponse);
    } catch (error) {
      console.error('Error al cargar evaluación:', error);
      toast.error('Error al cargar la evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirm('¿Está seguro de eliminar esta evaluación?')) return;

    try {
      await evaluacionesInteligentesApi.evaluaciones.eliminar(Number(id));
      toast.success('Evaluación eliminada correctamente');
      navigate('/evaluaciones-inteligentes/evaluaciones');
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar la evaluación');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/evaluaciones-inteligentes/evaluaciones')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {evaluacion.nombre}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {evaluacion.estado === 'configurando' && (
            <button
              onClick={() => navigate(`/evaluaciones-inteligentes/evaluaciones/${id}/seleccionar-preguntas`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit size={20} />
              Seleccionar Preguntas
            </button>
          )}
          
          <button
            onClick={handleEliminar}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
          >
            <Trash2 size={20} />
            Eliminar
          </button>
        </div>
      </div>

      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setVistaActual('info')}
            className={`pb-3 border-b-2 font-medium transition-colors ${
              vistaActual === 'info'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings size={20} />
              Información
            </div>
          </button>

          <button
            onClick={() => setVistaActual('preguntas')}
            className={`pb-3 border-b-2 font-medium transition-colors ${
              vistaActual === 'preguntas'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={20} />
              Preguntas ({preguntasData?.total || 0})
            </div>
          </button>
        </nav>
      </div>

      {/* Contenido */}
      {vistaActual === 'info' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información General */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información General
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Estado
                  </label>
                  <div className="mt-1">
                    <EstadoBadge estado={evaluacion.estado} />
                  </div>
                </div>

                {evaluacion.descripcion && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Descripción
                    </label>
                    <p className="mt-1 text-gray-900">
                      {evaluacion.descripcion}
                    </p>
                  </div>
                )}


                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Creado por
                  </label>
                  <div className="mt-1 flex items-center gap-2 text-gray-900">
                    <User size={16} />
                    {evaluacion.creado_por_nombre}
                  </div>
                </div>
              </div>
            </div>

            {/* Frameworks */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Frameworks
              </h2>

              <div className="space-y-3">
                {evaluacion.frameworks_detail.map((framework) => (
                  <div
                    key={framework.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {framework.nombre}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {framework.codigo} • v{framework.version}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {framework.total_preguntas}
                      </p>
                      <p className="text-xs text-gray-600">preguntas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuración */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Configuración
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Modo de preguntas
                  </span>
                  <span className="text-sm text-gray-900">
                    {evaluacion.usar_todas_preguntas ? 'Todas las preguntas' : 'Selección manual'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Respuestas compartidas
                  </span>
                  <span className="text-sm text-gray-900">
                    {evaluacion.usar_respuestas_compartidas ? 'Activado' : 'Desactivado'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Lateral */}
          <div className="space-y-6">
            {/* Información de Preguntas */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Preguntas
              </h3>

              <div className="text-center py-4">
                <p className="text-4xl font-bold text-gray-900">
                  {evaluacion.total_preguntas}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Total de preguntas
                </p>
              </div>
            </div>

            {/* Estado de Asignación */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Estado de Asignación
              </h3>

              <div className="space-y-3">
                {evaluacion.puede_asignar ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-900">
                      ✓ Lista para asignar
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      La evaluación puede ser asignada
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900">
                      ⚠ Requiere configuración
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Selecciona al menos 1 pregunta
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Vista de Preguntas */
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Preguntas de la Evaluación
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {preguntasData?.usar_todas_preguntas 
                    ? 'Incluye todas las preguntas de los frameworks seleccionados'
                    : 'Preguntas seleccionadas manualmente'}
                </p>
              </div>

              {!evaluacion.usar_todas_preguntas && evaluacion.estado === 'configurando' && (
                <button
                  onClick={() => navigate(`/evaluaciones-inteligentes/evaluaciones/${id}/seleccionar-preguntas`)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Edit size={20} />
                  Editar Selección
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {preguntasData && preguntasData.preguntas.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {preguntasData.preguntas.slice(0, 10).map((item: any) => {
                  const pregunta = preguntasData.usar_todas_preguntas 
                    ? item 
                    : item.pregunta_detalle;
                  
                  return (
                    <PreguntaCard
                      key={pregunta.id}
                      pregunta={pregunta}
                      showFramework
                    />
                  );
                })}

                {preguntasData.preguntas.length > 10 && (
                  <div className="text-center py-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Mostrando 10 de {preguntasData.total} preguntas
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600">No hay preguntas seleccionadas</p>
                {!evaluacion.usar_todas_preguntas && (
                  <button
                    onClick={() => navigate(`/evaluaciones-inteligentes/evaluaciones/${id}/seleccionar-preguntas`)}
                    className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Seleccionar preguntas
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};