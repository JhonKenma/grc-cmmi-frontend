// src/pages/EvaluacionesInteligentes/MisFrameworks/MisFrameworks.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, Package, ArrowLeft } from 'lucide-react';
import { empresaFrameworkApi } from '@/api/endpoints';
import toast from 'react-hot-toast';
import type { MisFrameworksResponse } from '@/types/empresa-framework.types';

export const MisFrameworks = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MisFrameworksResponse | null>(null);

  useEffect(() => {
    cargarFrameworks();
  }, []);

  const cargarFrameworks = async () => {
    try {
      setLoading(true);
      const response = await empresaFrameworkApi.misFrameworks();
      setData(response);
    } catch (error) {
      console.error('Error al cargar frameworks:', error);
      toast.error('Error al cargar los frameworks asignados');
    } finally {
      setLoading(false);
    }
  };

  const handleVerFramework = (codigo: string) => {
    navigate(`/evaluaciones-inteligentes/frameworks/${codigo}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/evaluaciones-inteligentes')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver al Dashboard
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mis Frameworks
            </h1>
            <p className="text-gray-600 mt-2">
              Frameworks asignados a <span className="font-semibold">{data?.empresa}</span>
            </p>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-lg px-6 py-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">
                {data?.total_frameworks || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Frameworks disponibles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <Package className="text-blue-600 mr-3 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900">
              Frameworks Asignados por el SuperAdmin
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Estos son los frameworks que tu empresa puede usar para crear evaluaciones.
              Solo puedes crear evaluaciones con estos frameworks.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Frameworks */}
      {data && data.frameworks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.frameworks.map((framework) => (
            <div
              key={framework.id}
              onClick={() => handleVerFramework(framework.codigo)}
              className="cursor-pointer transform transition-transform hover:scale-105"
            >
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {framework.codigo}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {framework.nombre}
                    </p>
                  </div>
                  <FileText className="text-primary-600 ml-3" size={24} />
                </div>

                {framework.version && (
                  <div className="mb-3">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      Versión {framework.version}
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total de preguntas</span>
                    <span className="font-semibold text-gray-900">
                      {framework.total_preguntas}
                    </span>
                  </div>
                </div>

                {framework.notas && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 italic">
                      {framework.notas}
                    </p>
                  </div>
                )}

                <div className="mt-4">
                  <button
                    className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay frameworks asignados
          </h3>
          <p className="text-gray-600 mb-6">
            Aún no se te han asignado frameworks. Contacta con el SuperAdmin para que te asigne los frameworks necesarios.
          </p>
        </div>
      )}

      {/* Acción rápida */}
      {data && data.frameworks.length > 0 && (
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            ¿Qué puedes hacer ahora?
          </h3>
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-4">
                Usa estos frameworks para crear evaluaciones personalizadas para tu empresa.
                Puedes combinar múltiples frameworks y seleccionar preguntas específicas.
              </p>
              <button
                onClick={() => navigate('/evaluaciones-inteligentes/evaluaciones/crear')}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Crear Nueva Evaluación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};