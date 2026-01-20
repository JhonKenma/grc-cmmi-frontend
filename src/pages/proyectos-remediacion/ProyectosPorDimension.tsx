// src/pages/proyectos-remediacion/ProyectosPorDimension.tsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { Card, LoadingScreen } from '@/components/common';
import { 
  ArrowLeft, 
  ChevronRight, 
  Calendar, 
  BadgeCheck, 
  LayoutList,
  AlertCircle,
  Users
} from 'lucide-react';

interface Proyecto {
  id: string;
  codigo_proyecto: string;
  nombre_proyecto: string;
  estado: string;
  fecha_inicio: string;
  dueno_proyecto?: {
    nombre_completo: string;
    email: string;
  };
  calculo_nivel?: {
    gap: number;
    dimension: {
      nombre: string;
      codigo: string;
    };
  };
}

interface ProyectosResponse {
  success: boolean;
  data: {
    results: Proyecto[];
    count: number;
  };
}

export const ProyectosPorDimension: React.FC = () => {
  const { dimensionId } = useParams<{ dimensionId: string }>();
  const navigate = useNavigate();

  // Query para obtener proyectos
  const { data, isLoading, isError } = useQuery<ProyectosResponse>({
    queryKey: ['proyectos-dimension', dimensionId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/proyectos-remediacion/listar_por_dimension/?dimension_id=${dimensionId}`
      );
      return response.data;
    },
    enabled: !!dimensionId,
  });

  if (isLoading) {
    return <LoadingScreen message="Cargando proyectos..." />;
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

  const proyectos = data?.data?.results || [];
  const dimensionInfo = proyectos[0]?.calculo_nivel?.dimension;

  const getStatusColor = (estado: string) => {
    const colors: Record<string, string> = {
      'planificado': 'bg-purple-100 text-purple-700 border-purple-200',
      'en_ejecucion': 'bg-blue-100 text-blue-700 border-blue-200',
      'en_validacion': 'bg-orange-100 text-orange-700 border-orange-200',
      'completado': 'bg-green-100 text-green-700 border-green-200',
      'cancelado': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[estado] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusLabel = (estado: string) => {
    const labels: Record<string, string> = {
      'planificado': 'Planificado',
      'en_ejecucion': 'En Ejecución',
      'en_validacion': 'En Validación',
      'completado': 'Completado',
      'cancelado': 'Cancelado',
    };
    return labels[estado] || estado;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        
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
                <p className="text-gray-500">
                  {dimensionInfo?.nombre || 'Dimensión'}
                </p>
                {dimensionInfo?.codigo && (
                  <span className="inline-block mt-1 text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {dimensionInfo.codigo}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Total
              </span>
              <p className="text-3xl font-bold text-blue-600">
                {proyectos.length}
              </p>
            </div>
          </div>
        </div>

        {/* LISTA DE PROYECTOS */}
        <div className="space-y-4">
          {proyectos.length > 0 ? (
            proyectos.map((proyecto) => (
          // ✅ DESPUÉS (div clickeable dentro de Card)
          <Card 
            key={proyecto.id} 
            className="p-0 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all"
          >
            <div 
              className="p-6 flex items-center justify-between cursor-pointer group"
              onClick={() => navigate(`/proyectos-remediacion/${proyecto.id}`)}
            >
              <div className="flex items-start gap-5 flex-1">
                <div className={`p-3 rounded-xl border-2 ${getStatusColor(proyecto.estado)}`}>
                  <BadgeCheck size={28} />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {proyecto.nombre_proyecto}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Calendar size={16} className="text-gray-400" /> 
                      {new Date(proyecto.fecha_inicio).toLocaleDateString('es-PE')}
                    </span>
                    
                    <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2.5 py-1 rounded border border-gray-300">
                      {proyecto.codigo_proyecto}
                    </span>

                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusColor(proyecto.estado)}`}>
                      {getStatusLabel(proyecto.estado)}
                    </span>

                    {proyecto.dueno_proyecto && (
                      <span className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Users size={14} className="text-gray-400" />
                        {proyecto.dueno_proyecto.nombre_completo}
                      </span>
                    )}

                    {proyecto.calculo_nivel?.gap !== undefined && (
                      <span className="text-xs font-semibold bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-200">
                        GAP: {proyecto.calculo_nivel.gap.toFixed(1)}
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