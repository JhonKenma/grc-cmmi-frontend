// src/pages/proyectos-remediacion/MisProyectos.tsx
import React, { useState, useEffect } from 'react';
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
  Filter,
  Search,
  FileText
} from 'lucide-react';
import { proyectosRemediacionApi } from '@/api/endpoints/proyectos-remediacion.api';
import { ProyectoRemediacionList } from '@/types/proyecto-remediacion.types';
import toast from 'react-hot-toast';
import { getEstadoColor } from '@/types/proyecto-remediacion.types';
import axiosInstance from '@/api/axios';

type FiltroEstado = 'todos' | 'planificado' | 'en_ejecucion' | 'en_validacion' | 'cerrado' | 'suspendido' | 'cancelado';

interface Evaluacion {
  id: string;
  nombre: string;
}

export const MisProyectos: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [proyectos, setProyectos] = useState<ProyectoRemediacionList[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<string>('todas');
  
  useEffect(() => {
    loadEvaluaciones();
    loadMisProyectos();
  }, []);
  
  const loadEvaluaciones = async () => {
    try {
      const response = await axiosInstance.get('/encuestas/encuestas/');
      const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
      setEvaluaciones(data);
    } catch (err) {
      console.error('❌ Error al cargar evaluaciones:', err);
    }
  };

  const loadMisProyectos = async () => {
    try {
      setLoading(true);
      const data = await proyectosRemediacionApi.getMisProyectos();
      setProyectos(data);
    } catch (err) {
      toast.error('Error al cargar tus proyectos');
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE CORRECCIÓN DE PROGRESO ---
  const getProgresoReal = (p: ProyectoRemediacionList) => {
    // 1. Si está cerrado o en validación, el progreso de ejecución es 100%
    if (p.estado === 'cerrado' || p.estado === 'en_validacion') return 100;
    
    // 2. Si el backend envía 0 pero ya hay avance, podrías usar una lógica de fallback
    // Aquí usamos el porcentaje del backend si existe, sino 0
    const valorBackend = p.porcentaje_tiempo_transcurrido || 0;
    
    return Math.min(Math.max(valorBackend, 0), 100);
  };
  
  const proyectosFiltrados = proyectos.filter((p) => {
    if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false;
    if (evaluacionSeleccionada !== 'todas' && (p as any).evaluacion_id !== evaluacionSeleccionada) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return p.nombre_proyecto.toLowerCase().includes(s) || p.codigo_proyecto.toLowerCase().includes(s) || p.dimension_nombre.toLowerCase().includes(s);
    }
    return true;
  });
  
  const stats = (() => {
    const enEjecucion = proyectosFiltrados.filter(p => p.estado === 'en_ejecucion').length;
    const completados = proyectosFiltrados.filter(p => p.estado === 'cerrado').length;
    const vencidos = proyectosFiltrados.filter(p => p.esta_vencido).length;
    return { total: proyectosFiltrados.length, enEjecucion, completados, vencidos };
  })();

  const getStatusLabel = (estado: string) => {
    const labels: Record<string, string> = {
      'planificado': 'Planificado', 'en_ejecucion': 'En Ejecución', 'en_validacion': 'En Validación',
      'cerrado': 'Cerrado', 'suspendido': 'Suspendido', 'cancelado': 'Cancelado',
    };
    return labels[estado] || estado;
  };

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
        <Card className="p-4 border-none shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FolderKanban size={20} /></div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-none shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><TrendingUp size={20} /></div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-medium">Activos</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.enEjecucion}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-none shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg text-green-600"><BadgeCheck size={20} /></div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-medium">Finalizados</p>
              <p className="text-2xl font-bold text-green-600">{stats.completados}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-none shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg text-red-600"><AlertCircle size={20} /></div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-medium">Vencidos</p>
              <p className="text-2xl font-bold text-red-600">{stats.vencidos}</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* FILTROS - ⭐ ACTUALIZADO CON FILTRO POR EVALUACIÓN */}
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
          
          {/* ⭐ NUEVO: Filtro por Evaluación */}
          <div className="flex-1 relative">
            <select
              value={evaluacionSeleccionada} 
              onChange={(e) => setEvaluacionSeleccionada(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white cursor-pointer"
            >
              <option value="todas">Todas las evaluaciones</option>
              {evaluaciones.map((evaluacion) => (
                <option key={evaluacion.id} value={evaluacion.id}>
                  {evaluacion.nombre}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          
          {/* Filtro por Estado */}
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
          proyectosFiltrados.map((p) => {
            const progreso = getProgresoReal(p);
            return (
              <Card 
                key={p.id} 
                onClick={() => navigate(`/proyectos-remediacion/${p.id}`)}
                className="group p-3.5 border-none shadow-sm hover:shadow-md transition-all cursor-pointer bg-white"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    p.estado === 'cerrado' ? 'bg-green-50 text-green-600' :
                    p.estado === 'en_ejecucion' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                    <FolderKanban size={22} />
                  </div>

                  <div className="flex-1 grid grid-cols-12 items-center gap-4">
                    {/* Título */}
                    <div className="col-span-4 min-w-0">
                      <h3 className="font-bold text-[15px] text-gray-900 truncate group-hover:text-blue-600 transition-colors mb-0.5">
                        {p.nombre_proyecto}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{p.codigo_proyecto}</span>
                        <span className={`font-semibold px-2 py-0.5 rounded-full border uppercase tracking-tighter ${getEstadoColor(p.estado)}`}>
                          {getStatusLabel(p.estado)}
                        </span>
                      </div>
                    </div>

                    {/* Datos */}
                    <div className="col-span-5 flex items-center justify-between px-6 border-x border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Fecha Fin</span>
                        <span className="text-[12px] text-gray-700 font-medium">
                          {new Date(p.fecha_fin_estimada).toLocaleDateString('es-PE')}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Responsable</span>
                        <span className="text-[12px] text-gray-700 font-medium truncate max-w-[120px]">{p.responsable_nombre || 'No asignado'}</span>
                      </div>
                    </div>

                    {/* Avance Corregido */}
                    <div className="col-span-3 flex items-center gap-4 pl-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Avance Real</span>
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
          })
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