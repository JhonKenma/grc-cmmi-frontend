// src/pages/proyectos-remediacion/ProyectosPorGAP.tsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProyectos } from '@/hooks/useProyectosRemediacion';
import { Card, LoadingScreen } from '@/components/common';
import { 
  ArrowLeft, 
  ChevronRight, 
  Calendar, 
  BadgeCheck, 
  LayoutList,
  AlertCircle 
} from 'lucide-react';

// ═══ INTERFACES PARA TYPESCRIPT ═══
interface ProyectoItem {
  id: string;
  nombre_proyecto: string;
  codigo_proyecto: string;
  fecha_inicio: string;
  estado: string;
}

export const ProyectosPorGAP: React.FC = () => {
  const { gapId } = useParams<{ gapId: string }>();
  const navigate = useNavigate();

  // 🕵️ DEBUG: Este log debe salir sí o sí
  React.useEffect(() => {
    console.log("🔍 COMPONENTE MONTADO. ID del GAP recibido:", gapId);
  }, [gapId]);

  const { data, isLoading, isError, error } = useProyectos({ calculo_nivel: gapId });

  // 🕵️ DEBUG: Ver qué llega de la API
  React.useEffect(() => {
    if (data) console.log("📦 DATA DE LA API:", data);
    if (isError) console.error("❌ ERROR DE LA API:", error);
  }, [data, isError, error]);
  // 1. 🟢 HOOKS DE ESTADO Y QUERY (Siempre al inicio)
  //const { data, isLoading, isError, error } = useProyectos({ calculo_nivel: gapId });

  // 2. 🟢 EXTRACCIÓN DEFENSIVA DE DATOS (Antes de los retornos condicionales)
  // Esto evita el error ".map is not a function" al manejar objetos paginados o listas simples
  const listaProyectos: ProyectoItem[] = React.useMemo(() => {
    if (!data) return [];
    
    // Si la data es directamente un Array
    if (Array.isArray(data)) return data;
    
    // Si la data viene paginada (común en Django/DRF)
    if ((data as any).results && Array.isArray((data as any).results)) {
      return (data as any).results;
    }
    
    return [];
  }, [data]);

  // 3. 🟡 MANEJO DE ESTADOS DE CARGA Y ERROR
  if (isLoading) {
    return <LoadingScreen message="Obteniendo proyectos asociados..." />;
  }

  if (isError) {
    console.error("Error en ProyectosPorGAP:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error al cargar proyectos</h3>
          <p className="text-gray-600 mb-6">
            No se pudieron recuperar las iniciativas de remediación para esta brecha.
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-lg shadow-blue-200"
          >
            ← Regresar al Reporte
          </button>
        </div>
      </div>
    );
  }

  // 4. 🔵 FUNCIONES AUXILIARES DE UI
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'en_ejecucion': 'bg-blue-100 text-blue-600 border-blue-200',
      'completado': 'bg-green-100 text-green-600 border-green-200',
      'planificado': 'bg-purple-100 text-purple-600 border-purple-200',
      'en_validacion': 'bg-orange-100 text-orange-600 border-orange-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'en_ejecucion': 'En Ejecución',
      'completado': 'Completado',
      'planificado': 'Planificado',
      'en_validacion': 'En Validación',
    };
    return labels[status] || status.replace('_', ' ');
  };

  // 5. ⚪ RENDERIZADO PRINCIPAL
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* BOTÓN REGRESAR */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors font-medium group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Regresar al Reporte de Brechas
        </button>

        {/* ENCABEZADO */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-600/20">
                <LayoutList size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Proyectos de Remediación
              </h1>
            </div>
            <p className="text-gray-500">
              Listado de iniciativas creadas para cerrar esta brecha específica.
            </p>
          </div>
          
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm inline-flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Iniciativas
            </span>
            <span className="text-2xl font-black text-blue-600">{listaProyectos.length}</span>
          </div>
        </div>

        {/* LISTADO DE PROYECTOS */}
        <div className="grid gap-4">
          {listaProyectos.length > 0 ? (
            listaProyectos.map((proyecto) => (
              <Card 
                key={proyecto.id} 
                className="p-0 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all border-gray-200"
              >
                <div 
                  className="p-5 cursor-pointer flex items-center justify-between group"
                  onClick={() => navigate(`/proyectos-remediacion/${proyecto.id}`)}
                >
                  <div className="flex items-center gap-5">
                    {/* Icono de Estado */}
                    <div className={`p-3 rounded-xl border-2 border-transparent transition-colors ${getStatusColor(proyecto.estado)}`}>
                      <BadgeCheck size={28} />
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        {proyecto.nombre_proyecto}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Calendar size={16} className="text-gray-400" /> 
                          {new Date(proyecto.fecha_inicio).toLocaleDateString('es-ES', {
                            day: '2-digit', month: 'long', year: 'numeric'
                          })}
                        </span>
                        <span className="text-xs font-mono bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200">
                          {proyecto.codigo_proyecto}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColor(proyecto.estado)}`}>
                          {getStatusLabel(proyecto.estado)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1">
                    <span className="text-sm font-medium hidden sm:inline">Ver detalle</span>
                    <ChevronRight size={20} strokeWidth={3} />
                  </div>
                </div>
              </Card>
            ))
          ) : (
            /* EMPTY STATE mejorado */
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutList size={40} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No hay proyectos registrados</h3>
              <p className="text-gray-500 max-w-xs mx-auto mb-6">
                Aún no se han creado iniciativas para cerrar esta brecha específica.
              </p>
              <button 
                onClick={() => navigate(-1)}
                className="text-sm font-bold text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-4"
              >
                Volver al reporte para crear uno
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};