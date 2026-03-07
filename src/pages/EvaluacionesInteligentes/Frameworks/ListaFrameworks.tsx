// src/pages/EvaluacionesInteligentes/Frameworks/ListaFrameworks.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Loader2, AlertCircle, FileText, Search } from 'lucide-react';
import { evaluacionesInteligentesApi, empresaFrameworkApi } from '@/api/endpoints';
import { FrameworkCard } from '@/components/iqevaluaciones/FrameworkCard';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import type { Framework } from '@/types/iqevaluaciones.types';
import type { EmpresaFrameworkList } from '@/types/empresa-framework.types';

export const ListaFrameworks = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [misFrameworks, setMisFrameworks] = useState<EmpresaFrameworkList[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarFrameworks();
  }, []);

  const cargarFrameworks = async () => {
    try {
      setLoading(true);
      
      if (isSuperAdmin) {
        // SuperAdmin: ve todos los frameworks del sistema
        const data = await evaluacionesInteligentesApi.frameworks.listar();
        setFrameworks(data);
      } else {
        // Admin: solo ve los frameworks asignados a su empresa
        const response = await empresaFrameworkApi.misFrameworks();
        setMisFrameworks(response.frameworks);
      }
    } catch (error) {
      console.error('Error al cargar frameworks:', error);
      toast.error('Error al cargar los frameworks');
    } finally {
      setLoading(false);
    }
  };

  // Filtrado según el rol
  const frameworksFiltrados = isSuperAdmin
    ? frameworks.filter((f) =>
        f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : misFrameworks.filter((f) =>
        f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      );

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
            {isSuperAdmin ? 'Todos los Frameworks' : 'Mis Frameworks'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin 
              ? 'Frameworks importados en el sistema' 
              : 'Frameworks asignados a tu empresa'
            }
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => navigate('/evaluaciones-inteligentes/frameworks/importar')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Upload size={20} />
            Importar Frameworks
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-primary-100 rounded-lg">
              <FileText className="text-primary-600" size={24} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isSuperAdmin ? frameworks.length : misFrameworks.length}
          </p>
          <p className="text-sm text-gray-600">Frameworks {isSuperAdmin ? 'Totales' : 'Asignados'}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isSuperAdmin
              ? frameworks.reduce((sum, fw) => sum + fw.total_preguntas, 0).toLocaleString()
              : misFrameworks.reduce((sum, fw) => sum + fw.total_preguntas, 0).toLocaleString()
            }
          </p>
          <p className="text-sm text-gray-600">Total Preguntas</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="text-green-600" size={24} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isSuperAdmin
              ? frameworks.filter(fw => fw.activo).length
              : misFrameworks.length
            }
          </p>
          <p className="text-sm text-gray-600">Activos</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isSuperAdmin
              ? (frameworks.length > 0 
                  ? Math.round(frameworks.reduce((sum, fw) => sum + fw.total_preguntas, 0) / frameworks.length)
                  : 0)
              : (misFrameworks.length > 0
                  ? Math.round(misFrameworks.reduce((sum, fw) => sum + fw.total_preguntas, 0) / misFrameworks.length)
                  : 0)
            }
          </p>
          <p className="text-sm text-gray-600">Promedio/Framework</p>
        </div>
      </div>

      {/* Buscador */}
      {frameworksFiltrados.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
            />
          </div>
          {searchTerm && (
            <p className="text-xs text-gray-500 mt-2">
              Mostrando {frameworksFiltrados.length} de {isSuperAdmin ? frameworks.length : misFrameworks.length} frameworks
            </p>
          )}
        </div>
      )}

      {/* Lista de Frameworks */}
      {frameworksFiltrados.length === 0 && !searchTerm ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isSuperAdmin ? 'No hay frameworks importados' : 'No tienes frameworks asignados'}
          </h3>
          <p className="text-gray-600 mb-6">
            {isSuperAdmin
              ? 'Comienza importando frameworks desde un archivo Excel'
              : 'Contacta al SuperAdmin para que te asigne frameworks'
            }
          </p>
          {isSuperAdmin && (
            <button
              onClick={() => navigate('/evaluaciones-inteligentes/frameworks/importar')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Importar Frameworks
            </button>
          )}
        </div>
      ) : frameworksFiltrados.length === 0 && searchTerm ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Search className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">No se encontraron frameworks con ese nombre o código</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isSuperAdmin ? (
            // SuperAdmin: muestra FrameworkCard de todos
            frameworksFiltrados.map((framework) => {
              if ('activo' in framework && 'fecha_creacion' in framework) {
                return (
                  <FrameworkCard
                    key={framework.id}
                    framework={framework as Framework}
                    onClick={() => navigate(`/evaluaciones-inteligentes/frameworks/${framework.codigo}`)}
                  />
                );
              }
              return null;
            })
          ) : (
            // Admin: muestra cards de sus frameworks asignados
            (frameworksFiltrados as EmpresaFrameworkList[]).map((framework) => (
              <div
                key={framework.id}
                onClick={() => navigate(`/evaluaciones-inteligentes/frameworks/${framework.codigo}`)}
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

                  <div className="mt-4">
                    <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};