// src/pages/EvaluacionesInteligentes/Evaluaciones/ListaEvaluaciones.tsx

import { useState, useEffect } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { evaluacionesInteligentesApi } from '@/api/endpoints';
import { EstadoBadge } from '@/components/iqevaluaciones/EstadoBadge';
import toast from 'react-hot-toast';
import type { EvaluacionList } from '@/types/iqevaluaciones.types';

export const ListaEvaluaciones = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionList[]>([]);
  const [filteredEvaluaciones, setFilteredEvaluaciones] = useState<EvaluacionList[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);

  useEffect(() => {
    cargarEvaluaciones();
  }, []);

  useEffect(() => {
    filtrarEvaluaciones();
  }, [searchTerm, filtroEstado, evaluaciones]);

  const cargarEvaluaciones = async () => {
    try {
      setLoading(true);
      const data = await evaluacionesInteligentesApi.evaluaciones.listar();
      setEvaluaciones(data);
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error);
      toast.error('Error al cargar las evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const filtrarEvaluaciones = () => {
    let resultado = evaluaciones;

    if (searchTerm) {
      resultado = resultado.filter((ev) =>
        ev.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.frameworks_nombres.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filtroEstado !== 'todas') {
      resultado = resultado.filter((ev) => ev.estado === filtroEstado);
    }

    setFilteredEvaluaciones(resultado);
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta evaluación?')) return;

    try {
      await evaluacionesInteligentesApi.evaluaciones.eliminar(id);
      toast.success('Evaluación eliminada correctamente');
      cargarEvaluaciones();
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

  return (
    <div className="space-y-6">

      {/* ⭐ Volver al Dashboard */}
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
          <h1 className="text-2xl font-bold text-gray-900">
            Evaluaciones
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona las evaluaciones del sistema
          </p>
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar evaluaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
            >
              <option value="todas">Todos los estados</option>
              <option value="configurando">Configurando</option>
              <option value="borrador">Borrador</option>
              <option value="asignada">Asignada</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completada">Completada</option>
            </select>
          </div>

          <div className="flex items-center justify-end text-sm text-gray-600">
            Mostrando {filteredEvaluaciones.length} de {evaluaciones.length} evaluaciones
          </div>
        </div>
      </div>

      {/* Lista de Evaluaciones */}
      {filteredEvaluaciones.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay evaluaciones
          </h3>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frameworks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preguntas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvaluaciones.map((evaluacion) => (
                <tr key={evaluacion.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {evaluacion.nombre}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {evaluacion.frameworks_nombres}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <EstadoBadge estado={evaluacion.estado} />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {evaluacion.total_preguntas}
                    </p>
                    <p className="text-xs text-gray-500">
                      {evaluacion.usar_todas_preguntas ? 'Todas' : 'Seleccionadas'}
                    </p>
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
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setMenuAbierto(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                            <button
                              onClick={() => {
                                navigate(`/evaluaciones-inteligentes/evaluaciones/${evaluacion.id}`);
                                setMenuAbierto(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye size={16} />
                              Ver Detalle
                            </button>
                            {evaluacion.estado === 'configurando' && (
                              <button
                                onClick={() => {
                                  navigate(`/evaluaciones-inteligentes/evaluaciones/${evaluacion.id}/seleccionar-preguntas`);
                                  setMenuAbierto(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Edit size={16} />
                                Seleccionar Preguntas
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handleEliminar(evaluacion.id);
                                setMenuAbierto(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                              Eliminar
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
        </div>
      )}
    </div>
  );
};