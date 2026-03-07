// src/pages/EvaluacionesInteligentes/Dashboard/DashboardEvaluaciones.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  FileText, 
  ClipboardCheck, 
  TrendingUp,
  Upload,
  Loader2,
  AlertCircle,
  Building2,
  Package,
  Users  // ⭐ AÑADIR
} from 'lucide-react';
import { evaluacionesInteligentesApi, empresaFrameworkApi } from '@/api/endpoints';
import { EstadoBadge } from '@/components/iqevaluaciones/EstadoBadge';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import type { EvaluacionList, Framework } from '@/types/iqevaluaciones.types';

export const DashboardEvaluaciones = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionList[]>([]);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [misFrameworks, setMisFrameworks] = useState<number>(0);
  const [estadisticas, setEstadisticas] = useState({
    total_evaluaciones: 0,
    en_proceso: 0,
    completadas: 0,
    total_frameworks: 0,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      if (isSuperAdmin) {
        // SuperAdmin ve: evaluaciones de todas las empresas y todos los frameworks
        const [evaluacionesData, frameworksData] = await Promise.all([
          evaluacionesInteligentesApi.evaluaciones.listar(),
          evaluacionesInteligentesApi.frameworks.listar(),
        ]);

        setEvaluaciones(evaluacionesData.slice(0, 5));
        setFrameworks(frameworksData);

        setEstadisticas({
          total_evaluaciones: evaluacionesData.length,
          en_proceso: evaluacionesData.filter(e => e.estado === 'en_proceso').length,
          completadas: evaluacionesData.filter(e => e.estado === 'completada').length,
          total_frameworks: frameworksData.length,
        });
      } else {
        // Admin ve: solo evaluaciones de SU empresa y frameworks asignados
        const [evaluacionesData, misFrameworksData] = await Promise.all([
          evaluacionesInteligentesApi.evaluaciones.listar(), // Ya filtrado por empresa en backend
          empresaFrameworkApi.misFrameworks(),
        ]);

        setEvaluaciones(evaluacionesData.slice(0, 5));
        setMisFrameworks(misFrameworksData.total_frameworks);

        setEstadisticas({
          total_evaluaciones: evaluacionesData.length,
          en_proceso: evaluacionesData.filter(e => e.estado === 'en_proceso').length,
          completadas: evaluacionesData.filter(e => e.estado === 'completada').length,
          total_frameworks: misFrameworksData.total_frameworks,
        });
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Evaluaciones Inteligentes
          </h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin 
              ? 'Gestión global de frameworks y evaluaciones' 
              : `Evaluaciones de ${user?.empresa || 'tu empresa'}`
            }
          </p>
        </div>

        <div className="flex gap-3">
          {/* SuperAdmin: Importar y Asignar */}
          {isSuperAdmin && (
            <>
              <button
                onClick={() => navigate('/evaluaciones-inteligentes/frameworks/importar')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload size={20} />
                Importar Excel
              </button>
              
              <button
                onClick={() => navigate('/evaluaciones-inteligentes/asignar-frameworks')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <Building2 size={20} />
                Asignar Frameworks
              </button>
            </>
          )}
          
          {/* Admin: Ver Mis Frameworks y Asignar Evaluaciones */}
          {!isSuperAdmin && (
            <>
              <button
                onClick={() => navigate('/evaluaciones-inteligentes/mis-frameworks')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Package size={20} />
                Mis Frameworks ({misFrameworks})
              </button>
              
              <button
                onClick={() => navigate('/evaluaciones-inteligentes/asignar')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <Users size={20} />
                Asignar Evaluaciones
              </button>
            </>
          )}
          
          {/* Ambos: Crear Evaluación */}
          <button
            onClick={() => navigate('/evaluaciones-inteligentes/evaluaciones/crear')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            Nueva Evaluación
          </button>
        </div>
      </div>

      {/* Info según rol */}
      {!isSuperAdmin && misFrameworks === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="text-yellow-600 mr-3 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-yellow-900">
                No tienes frameworks asignados
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Para crear evaluaciones, necesitas que el SuperAdmin te asigne frameworks primero.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {estadisticas.total_evaluaciones}
          </p>
          <p className="text-sm text-gray-600">
            {isSuperAdmin ? 'Total Evaluaciones' : 'Mis Evaluaciones'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="text-yellow-600" size={24} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {estadisticas.en_proceso}
          </p>
          <p className="text-sm text-gray-600">En Proceso</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <ClipboardCheck className="text-green-600" size={24} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {estadisticas.completadas}
          </p>
          <p className="text-sm text-gray-600">Completadas</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {estadisticas.total_frameworks}
          </p>
          <p className="text-sm text-gray-600">
            {isSuperAdmin ? 'Frameworks Totales' : 'Frameworks Asignados'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evaluaciones Recientes */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {isSuperAdmin ? 'Evaluaciones Recientes (Todas las Empresas)' : 'Mis Evaluaciones Recientes'}
              </h2>
              <button
                onClick={() => navigate('/evaluaciones-inteligentes/evaluaciones')}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Ver todas
              </button>
            </div>
          </div>

          <div className="p-6">
            {evaluaciones.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600">
                  {isSuperAdmin ? 'No hay evaluaciones en el sistema' : 'No has creado evaluaciones aún'}
                </p>
                <button
                  onClick={() => navigate('/evaluaciones-inteligentes/evaluaciones/crear')}
                  className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Crear primera evaluación
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {evaluaciones.map((evaluacion) => (
                  <div
                    key={evaluacion.id}
                    onClick={() => navigate(`/evaluaciones-inteligentes/evaluaciones/${evaluacion.id}`)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-200 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {evaluacion.nombre}
                        </h3>
                        {isSuperAdmin && evaluacion.empresa_nombre && (
                          <p className="text-xs text-gray-500 mt-1">
                            {evaluacion.empresa_nombre}
                          </p>
                        )}
                      </div>
                      <EstadoBadge estado={evaluacion.estado} />
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {evaluacion.frameworks_nombres}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {evaluacion.total_preguntas} preguntas
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        evaluacion.usar_todas_preguntas 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {evaluacion.usar_todas_preguntas ? 'Todas' : 'Seleccionadas'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Frameworks */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {isSuperAdmin ? 'Frameworks en el Sistema' : 'Mis Frameworks Asignados'}
              </h2>
              <button
                onClick={() => navigate(
                  isSuperAdmin 
                    ? '/evaluaciones-inteligentes/frameworks' 
                    : '/evaluaciones-inteligentes/mis-frameworks'
                )}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Ver {isSuperAdmin ? 'todos' : 'mis frameworks'}
              </button>
            </div>
          </div>

          <div className="p-6">
            {isSuperAdmin ? (
              // SuperAdmin: Ver frameworks del sistema
              frameworks.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600">No hay frameworks importados</p>
                  <button
                    onClick={() => navigate('/evaluaciones-inteligentes/frameworks/importar')}
                    className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Importar frameworks desde Excel
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {frameworks.slice(0, 5).map((framework) => (
                    <div
                      key={framework.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {framework.codigo}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {framework.nombre}
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
              )
            ) : (
              // Admin: Info sobre frameworks asignados
              misFrameworks === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600">
                    Sin frameworks asignados
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Contacta al SuperAdmin para que te asigne frameworks
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto text-primary-600 mb-3" size={48} />
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {misFrameworks}
                  </p>
                  <p className="text-gray-600 mb-4">
                    Frameworks disponibles
                  </p>
                  <button
                    onClick={() => navigate('/evaluaciones-inteligentes/mis-frameworks')}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Ver mis frameworks →
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isSuperAdmin ? (
            <>
              {/* SuperAdmin */}
              <button
                onClick={() => navigate('/evaluaciones-inteligentes/frameworks/importar')}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all text-left"
              >
                <Upload className="text-primary-600 mb-2" size={24} />
                <h4 className="font-medium text-gray-900 mb-1">
                  Importar Frameworks
                </h4>
                <p className="text-sm text-gray-600">
                  Cargar frameworks desde Excel
                </p>
              </button>

              <button
                onClick={() => navigate('/evaluaciones-inteligentes/asignar-frameworks')}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all text-left"
              >
                <Building2 className="text-primary-600 mb-2" size={24} />
                <h4 className="font-medium text-gray-900 mb-1">
                  Asignar a Empresas
                </h4>
                <p className="text-sm text-gray-600">
                  Gestionar frameworks por empresa
                </p>
              </button>

              <button
                onClick={() => navigate('/evaluaciones-inteligentes/frameworks')}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all text-left"
              >
                <FileText className="text-primary-600 mb-2" size={24} />
                <h4 className="font-medium text-gray-900 mb-1">
                  Ver Frameworks
                </h4>
                <p className="text-sm text-gray-600">
                  Explorar todos los frameworks
                </p>
              </button>
            </>
          ) : (
            <>
              {/* Admin */}
              <button
                onClick={() => navigate('/evaluaciones-inteligentes/mis-frameworks')}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all text-left"
              >
                <Package className="text-primary-600 mb-2" size={24} />
                <h4 className="font-medium text-gray-900 mb-1">
                  Mis Frameworks
                </h4>
                <p className="text-sm text-gray-600">
                  Ver frameworks asignados
                </p>
              </button>

              <button
                onClick={() => navigate('/evaluaciones-inteligentes/asignar')}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all text-left"
              >
                <Users className="text-purple-600 mb-2" size={24} />
                <h4 className="font-medium text-gray-900 mb-1">
                  Asignar Evaluaciones
                </h4>
                <p className="text-sm text-gray-600">
                  Asignar a usuarios
                </p>
              </button>

              <button
                onClick={() => navigate('/evaluaciones-inteligentes/evaluaciones')}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all text-left"
              >
                <ClipboardCheck className="text-primary-600 mb-2" size={24} />
                <h4 className="font-medium text-gray-900 mb-1">
                  Mis Evaluaciones
                </h4>
                <p className="text-sm text-gray-600">
                  Ver todas mis evaluaciones
                </p>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};