// src/pages/proyectos-remediacion/MisProyectos.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, LoadingScreen } from '@/components/common';
import { 
  ChevronRight, 
  ChevronDown,
  BadgeCheck, 
  FolderKanban,
  AlertCircle,
  TrendingUp,
  Search
} from 'lucide-react';
import { proyectosRemediacionApi } from '@/api/endpoints/proyectos-remediacion.api';
import { ProyectoRemediacionList } from '@/types/proyecto-remediacion.types';
import toast from 'react-hot-toast';
import { getEstadoColor } from '@/types/proyecto-remediacion.types';
import axiosInstance from '@/api/axios';

// ----------------------------------------------------------------------
// SUB-COMPONENTE MEMOIZADO (Evita re-render innecesario de la lista)
// ----------------------------------------------------------------------
const ProjectCard = React.memo(({ 
  proyecto, 
  onClick, 
  progreso 
}: { 
  proyecto: ProyectoRemediacionList; 
  onClick: () => void;
  progreso: number;
}) => {
  const statusLabel = useMemo(() => {
    const labels: Record<string, string> = {
      'planificado': 'Planificado', 'en_ejecucion': 'En Ejecución', 'en_validacion': 'En Validación',
      'cerrado': 'Cerrado', 'suspendido': 'Suspendido', 'cancelado': 'Cancelado',
    };
    return labels[proyecto.estado] || proyecto.estado;
  }, [proyecto.estado]);

  return (
    <Card 
      onClick={onClick}
      className="group p-3.5 border-none shadow-sm hover:shadow-md transition-all cursor-pointer bg-white"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl shrink-0 ${
          proyecto.estado === 'cerrado' ? 'bg-green-50 text-green-600' :
          proyecto.estado === 'en_ejecucion' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'
        }`}>
          <FolderKanban size={22} />
        </div>

        <div className="flex-1 grid grid-cols-12 items-center gap-4">
          {/* Título */}
          <div className="col-span-4 min-w-0">
            <h3 className="font-bold text-[15px] text-gray-900 truncate group-hover:text-blue-600 transition-colors mb-0.5">
              {proyecto.nombre_proyecto}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                {proyecto.codigo_proyecto}
              </span>
              <span className={`font-semibold px-2 py-0.5 rounded-full border uppercase tracking-tighter ${getEstadoColor(proyecto.estado)}`}>
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Datos */}
          <div className="col-span-5 flex items-center justify-between px-6 border-x border-gray-50">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Fecha Fin</span>
              <span className="text-[12px] text-gray-700 font-medium">
                {new Date(proyecto.fecha_fin_estimada).toLocaleDateString('es-PE')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Responsable</span>
              <span className="text-[12px] text-gray-700 font-medium truncate max-w-[120px]">
                {proyecto.responsable_nombre || 'No asignado'}
              </span>
            </div>
          </div>

          {/* Avance */}
          <div className="col-span-3 flex items-center gap-4 pl-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Avance</span>
                <span className={`text-xs font-bold ${progreso === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                  {Math.round(progreso)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${progreso === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                  style={{ width: `${progreso}%` }} 
                />
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>
      </div>
    </Card>
  );
});

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------

type FiltroEstado = 'todos' | 'planificado' | 'en_ejecucion' | 'en_validacion' | 'cerrado' | 'suspendido' | 'cancelado';

interface Evaluacion {
  id: string;
  nombre: string;
}

export const MisProyectos: React.FC = () => {
  // const { user } = useAuth(); // Si no lo usas, coméntalo para limpiar
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [proyectos, setProyectos] = useState<ProyectoRemediacionList[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  
  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<string>('todas');
  
  // 1. CARGA DE DATOS EN PARALELO
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Promise.all inicia ambas peticiones simultáneamente
        const [resEvaluaciones, resProyectos] = await Promise.all([
          axiosInstance.get('/encuestas/encuestas/'),
          proyectosRemediacionApi.getMisProyectos()
        ]);

        // Procesar Evaluaciones
        const evalData = Array.isArray(resEvaluaciones.data) 
          ? resEvaluaciones.data 
          : resEvaluaciones.data?.results || [];
        setEvaluaciones(evalData);

        // Procesar Proyectos
        setProyectos(resProyectos);

      } catch (err) {
        console.error('Error cargando datos:', err);
        toast.error('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función helper (stable con useCallback)
  const getProgresoReal = useCallback((p: ProyectoRemediacionList) => {
    // Proyectos cerrados o en validación = 100%
    if (p.estado === 'cerrado' || p.estado === 'en_validacion') return 100;
    
    // Si tiene ítems, usar el avance de ítems
    if (p.modo_presupuesto === 'por_items' && p.total_items > 0) {
      return p.porcentaje_avance_items || 0; // ✅ Usar avance de ítems
    }
    
    // Si es modo global, podrías usar tiempo o presupuesto
    // Por ahora usemos el tiempo transcurrido como fallback
    return Math.min(p.porcentaje_tiempo_transcurrido || 0, 100);
  }, []);
  
  // 2. FILTRADO MEMOIZADO (Solo se recalcula si cambian las dependencias)
  const proyectosFiltrados = useMemo(() => {
    return proyectos.filter((p) => {
      if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false;
      if (evaluacionSeleccionada !== 'todas' && (p as any).evaluacion_id !== evaluacionSeleccionada) return false;
      
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        return (
          p.nombre_proyecto.toLowerCase().includes(s) || 
          p.codigo_proyecto.toLowerCase().includes(s) || 
          (p.dimension_nombre && p.dimension_nombre.toLowerCase().includes(s))
        );
      }
      return true;
    });
  }, [proyectos, filtroEstado, evaluacionSeleccionada, searchTerm]);
  
  // 3. ESTADÍSTICAS MEMOIZADAS
  const stats = useMemo(() => {
    let enEjecucion = 0;
    let completados = 0;
    let vencidos = 0;

    // Un solo bucle para calcular todo (más eficiente que 3 filter)
    proyectosFiltrados.forEach(p => {
      if (p.estado === 'en_ejecucion') enEjecucion++;
      if (p.estado === 'cerrado') completados++;
      if (p.esta_vencido) vencidos++;
    });

    return { total: proyectosFiltrados.length, enEjecucion, completados, vencidos };
  }, [proyectosFiltrados]);

  if (loading) return <LoadingScreen message="Cargando tus proyectos..." />;
  
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Proyectos</h1>
        <p className="text-gray-600 mt-1">
          Panel de seguimiento de brechas y remediación
        </p>
      </div>
      
      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard icon={<FolderKanban size={20} />} color="blue" label="Total" value={stats.total} />
        <StatsCard icon={<TrendingUp size={20} />} color="yellow" label="Activos" value={stats.enEjecucion} />
        <StatsCard icon={<BadgeCheck size={20} />} color="green" label="Finalizados" value={stats.completados} />
        <StatsCard icon={<AlertCircle size={20} />} color="red" label="Vencidos" value={stats.vencidos} />
      </div>
      
      {/* FILTROS */}
      <Card className="p-4 border-none shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Buscador */}
          <div className="flex-[2] relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" 
              placeholder="Buscar proyecto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          
          {/* Filtro Evaluación */}
          <div className="flex-1 relative">
            <select
              value={evaluacionSeleccionada} 
              onChange={(e) => setEvaluacionSeleccionada(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white cursor-pointer"
            >
              <option value="todas">Todas las evaluaciones</option>
              {evaluaciones.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.nombre}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          
          {/* Filtro Estado */}
          <div className="flex-1 relative">
            <select
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
              className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white cursor-pointer"
            >
              <option value="todos">Todos los estados</option>
              <option value="planificado">Planificado</option>
              <option value="en_ejecucion">En Ejecución</option>
              <option value="en_validacion">En Validación</option>
              <option value="cerrado">Cerrado</option>
              <option value="suspendido">Suspendido</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </Card>
      
      {/* LISTA SLIM */}
      <div className="space-y-3">
        {proyectosFiltrados.length > 0 ? (
          proyectosFiltrados.map((p) => (
            <ProjectCard 
              key={p.id} 
              proyecto={p} 
              onClick={() => navigate(`/proyectos-remediacion/${p.id}`)}
              progreso={getProgresoReal(p)}
            />
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
            <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No se encontraron proyectos activos</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente simple para las stats (para mantener el código limpio)
const StatsCard = ({ icon, color, label, value }: any) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600'
  };
  
  const textClasses: Record<string, string> = {
    blue: 'text-gray-900', // El valor general suele ser gris oscuro
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    red: 'text-red-600'
  };

  return (
    <Card className="p-4 border-none shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 ${colorClasses[color]} rounded-lg`}>{icon}</div>
        <div>
          <p className="text-[11px] text-gray-500 uppercase font-medium">{label}</p>
          <p className={`text-2xl font-bold ${textClasses[color] || 'text-gray-900'}`}>{value}</p>
        </div>
      </div>
    </Card>
  );
};