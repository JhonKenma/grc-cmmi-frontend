// src/pages/proyectos-remediacion/ProyectosPorDimension.tsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, LoadingScreen } from '@/components/common';
import { 
  ArrowLeft, 
  ChevronRight, 
  Calendar, 
  BadgeCheck, 
  LayoutList,
  AlertCircle,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
} from 'lucide-react';
import axiosInstance from '@/api/axios';
import { proyectosRemediacionApi } from '@/api/endpoints/proyectos-remediacion.api';
import { 
  ProyectoRemediacionList,
  formatCurrency,
  getEstadoColor,
} from '@/types/proyecto-remediacion.types';

interface CalculoNivel {
  id: string;
  dimension: {
    id: string;
    nombre: string;
    codigo: string;
  };
  gap: number;
}

export const ProyectosPorDimension: React.FC = () => {
  const { dimensionId } = useParams<{ dimensionId: string }>();
  const navigate = useNavigate();

  // ⭐ PASO 1: Obtener los calculos_nivel de esta dimensión
  const { data: calculosData, isLoading: loadingCalculos } = useQuery({
    queryKey: ['calculos-dimension', dimensionId],
    queryFn: async () => {
      if (!dimensionId) throw new Error('dimensionId es requerido');
      
      // Obtener todos los cálculos de esta dimensión
      const response = await axiosInstance.get(
        `/calculos-nivel/?dimension=${dimensionId}`
      );
      
      return response.data;
    },
    enabled: !!dimensionId,
  });

  // Extraer IDs de cálculos
  const calculoIds = React.useMemo(() => {
    const results = Array.isArray(calculosData) 
      ? calculosData 
      : calculosData?.results || [];
    
    return results.map((calc: CalculoNivel) => calc.id);
  }, [calculosData]);

  // ⭐ PASO 2: Obtener proyectos de TODOS los cálculos de esta dimensión
  const { data, isLoading: loadingProyectos, isError } = useQuery({
    queryKey: ['proyectos-dimension', calculoIds],
    queryFn: async () => {
      if (calculoIds.length === 0) {
        return { results: [], count: 0 };
      }

      // ✅ FIX: Agregar tipo explícito a id
      const promesas = calculoIds.map((id: string) => 
        proyectosRemediacionApi.getPorGap(id)
      );
      
      const resultados = await Promise.all(promesas);
      
      // Combinar todos los proyectos
      const todosProyectos = resultados.flatMap(r => r.results || []);
      
      return {
        results: todosProyectos,
        count: todosProyectos.length,
      };
    },
    enabled: calculoIds.length > 0,
  });

  const isLoading = loadingCalculos || loadingProyectos;

  if (isLoading) {
    return <LoadingScreen message="Cargando proyectos de la dimensión..." />;
  }

  if (isError || !dimensionId) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Error al cargar proyectos
          </h3>
          <p className="text-gray-600 mb-4">
            No se pudieron recuperar los proyectos de esta dimensión.
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Regresar
          </button>
        </div>
      </div>
    );
  }

  const proyectos = data?.results || [];
  
  // Obtener info de la dimensión del primer cálculo
  const calculosResults = Array.isArray(calculosData) 
    ? calculosData 
    : calculosData?.results || [];
  
  const dimensionInfo = calculosResults[0]?.dimension;
  const gapPromedio = calculosResults.length > 0
    ? calculosResults.reduce((sum: number, c: CalculoNivel) => sum + c.gap, 0) / calculosResults.length
    : 0;

  const getStatusLabel = (estado: string) => {
    const labels: Record<string, string> = {
      'planificado': 'Planificado',
      'en_ejecucion': 'En Ejecución',
      'en_validacion': 'En Validación',
      'cerrado': 'Cerrado',
      'suspendido': 'Suspendido',
      'cancelado': 'Cancelado',
    };
    return labels[estado] || estado;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* NAVEGACIÓN */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors font-medium group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Regresar al Reporte
        </button>

        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                <LayoutList size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Proyectos de Remediación
                </h1>
                {dimensionInfo ? (
                  <>
                    <p className="text-gray-500">
                      {dimensionInfo.nombre}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {dimensionInfo.codigo}
                      </span>
                      <span className="text-xs font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                        GAP Promedio: {gapPromedio.toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">Proyectos de esta dimensión</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Total Proyectos
              </span>
              <p className="text-3xl font-bold text-blue-600">
                {proyectos.length}
              </p>
            </div>
          </div>
        </div>

        {/* RESUMEN RÁPIDO */}
        {proyectos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Planificados</p>
                  <p className="text-xl font-bold text-gray-900">
                    {proyectos.filter((p) => p.estado === 'planificado').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">En Ejecución</p>
                  <p className="text-xl font-bold text-gray-900">
                    {proyectos.filter((p) => p.estado === 'en_ejecucion').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BadgeCheck size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Cerrados</p>
                  <p className="text-xl font-bold text-gray-900">
                    {proyectos.filter((p) => p.estado === 'cerrado').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <DollarSign size={20} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Presupuesto Total</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      proyectos.reduce((sum, p) => sum + (p.presupuesto_total_planificado || 0), 0),
                      proyectos[0]?.moneda || 'USD'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LISTA DE PROYECTOS */}
        <div className="space-y-4">
          {proyectos.length > 0 ? (
            proyectos.map((proyecto: ProyectoRemediacionList) => (
              <Card 
                key={proyecto.id} 
                className="p-0 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all"
              >
                <div 
                  className="p-6 flex items-center justify-between cursor-pointer group"
                  onClick={() => navigate(`/proyectos-remediacion/${proyecto.id}`)}
                >
                  <div className="flex items-start gap-5 flex-1">
                    <div className={`p-3 rounded-xl border-2 ${getEstadoColor(proyecto.estado)}`}>
                      <BadgeCheck size={28} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                        {proyecto.nombre_proyecto}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Código */}
                        <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2.5 py-1 rounded border border-gray-300">
                          {proyecto.codigo_proyecto}
                        </span>

                        {/* Estado */}
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getEstadoColor(proyecto.estado)}`}>
                          {getStatusLabel(proyecto.estado)}
                        </span>

                        {/* Modo de Presupuesto */}
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                          proyecto.modo_presupuesto === 'por_items'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {proyecto.modo_presupuesto_display}
                        </span>

                        {/* Fecha */}
                        <span className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar size={16} className="text-gray-400" /> 
                          {new Date(proyecto.fecha_inicio).toLocaleDateString('es-PE')}
                        </span>

                        {/* Presupuesto */}
                        {proyecto.presupuesto_total_planificado > 0 && (
                          <span className="flex items-center gap-1.5 text-sm text-gray-600">
                            <DollarSign size={16} className="text-gray-400" />
                            {formatCurrency(proyecto.presupuesto_total_planificado, proyecto.moneda)}
                          </span>
                        )}

                        {/* Dueño */}
                        {proyecto.dueno_proyecto_nombre && (
                          <span className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Users size={14} className="text-gray-400" />
                            {proyecto.dueno_proyecto_nombre}
                          </span>
                        )}

                        {/* Avance de Ítems */}
                        {proyecto.modo_presupuesto === 'por_items' && proyecto.total_items > 0 && (
                          <span className="flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                            <TrendingUp size={12} />
                            {proyecto.items_completados}/{proyecto.total_items} ítems ({proyecto.porcentaje_avance_items}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <ChevronRight 
                    size={22} 
                    className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" 
                    strokeWidth={2.5} 
                  />
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
              <div className="max-w-md mx-auto">
                <div className="bg-gray-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <LayoutList size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay proyectos registrados
                </h3>
                <p className="text-gray-500 mb-6">
                  Aún no se han creado proyectos para esta dimensión.
                </p>
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  ← Volver al Reporte
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};