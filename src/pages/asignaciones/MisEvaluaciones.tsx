// src/pages/asignaciones/MisEvaluaciones.tsx - BOTONES REORDENADOS

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus, Calendar, Filter, Target, BarChart3 } from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import { evaluacionesApi } from '@/api/endpoints/evaluaciones.api';
import toast from 'react-hot-toast';

interface EvaluacionEmpresa {
  id: string;
  empresa: number;
  empresa_info: {
    id: number;
    nombre: string;
    ruc: string;
  };
  encuesta: string;
  encuesta_info: {
    id: string;
    nombre: string;
    version: string;
    total_dimensiones: number;
  };
  administrador: number;
  administrador_info: {
    id: number;
    nombre_completo: string;
    email: string;
    cargo: string;
  } | null;
  asignado_por: number;
  asignado_por_nombre: string;
  fecha_asignacion: string;
  fecha_limite: string;
  fecha_completado: string | null;
  estado: 'activa' | 'en_progreso' | 'completada' | 'vencida' | 'cancelada';
  estado_display: string;
  dias_restantes: number;
  esta_vencida: boolean;
  observaciones: string;
  total_dimensiones: number;
  dimensiones_asignadas: number;
  dimensiones_completadas: number;
  porcentaje_avance: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export const MisEvaluaciones: React.FC = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionEmpresa[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [filtroEstado]);

    const loadData = async () => {
    try {
        setLoading(true);
        const response = await evaluacionesApi.getMisEvaluaciones(filtroEstado || undefined);
        
        console.log('📦 Response completo:', response);
        console.log('📋 Evaluaciones:', response.results);
        console.log('🔢 Total:', response.results?.length || 0);
        
        setEvaluaciones(response.results || []);
    } catch (error: any) {
        console.error('❌ Error completo:', error);
        console.error('❌ Response:', error.response?.data);
        toast.error('Error al cargar evaluaciones');
    } finally {
        setLoading(false);
    }
    };

  const getEstadoStyles = (estado: string) => {
    const styles = {
      activa: 'bg-blue-50 text-blue-700 border-blue-200',
      en_progreso: 'bg-amber-50 text-amber-700 border-amber-200',
      completada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      vencida: 'bg-rose-50 text-rose-700 border-rose-200',
      cancelada: 'bg-slate-50 text-slate-700 border-slate-200',
    };
    return styles[estado as keyof typeof styles] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (loading) return <LoadingScreen message="Cargando evaluaciones..." />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Evaluaciones</h1>
          <p className="text-sm text-slate-500">Monitorea y gestiona el progreso de las encuestas asignadas.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Botón para SuperAdmin */}
          {isSuperAdmin && (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/asignaciones/asignar-evaluacion')}
            >
              <Plus size={18} className="mr-2" />
              Asignar Evaluación
            </Button>
          )}

          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all appearance-none min-w-[160px]"
            >
              <option value="">Todos los estados</option>
              <option value="activa">Activa</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completada">Completada</option>
              <option value="vencida">Vencida</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Evaluación / Empresa</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Progreso</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dimensiones</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evaluaciones.length > 0 ? (
                evaluaciones.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 truncate max-w-[250px]">
                          {ev.encuesta_info?.nombre || 'Sin nombre'}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <span className="font-medium text-slate-400">Ver. {ev.encuesta_info?.version}</span>
                          • {ev.empresa_info?.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoStyles(ev.estado)}`}>
                        {ev.estado_display}
                      </span>
                      {ev.esta_vencida && (
                        <div className="text-[10px] text-rose-600 font-bold mt-1 italic flex items-center gap-1">
                          <Calendar size={10} /> VENCIDA
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-[120px]">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-700">{Math.round(ev.porcentaje_avance)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              ev.porcentaje_avance === 100 ? 'bg-emerald-500' : 'bg-primary-600'
                            }`}
                            style={{ width: `${ev.porcentaje_avance}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">{ev.dimensiones_completadas}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span>{ev.total_dimensiones}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Dim. Asignadas: {ev.dimensiones_asignadas}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {/* 1. Configurar Niveles (solo admin) */}
                        {(user?.rol === 'administrador' || user?.rol === 'superadmin') && (
                          <button
                            onClick={() => navigate(`/evaluaciones/${ev.id}/configurar-niveles`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 border border-amber-200 rounded-lg transition-all"
                            title="Configurar niveles deseados"
                          >
                            <Target size={14} />
                            <span>Niveles</span>
                          </button>
                        )}

                        {/* 2. Asignar Dimensiones (condicional) */}
                        {ev.dimensiones_asignadas < ev.total_dimensiones && (
                          <button
                            onClick={() => navigate(`/evaluaciones/${ev.id}/asignar-dimensiones`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 border border-emerald-200 rounded-lg transition-all"
                            title="Asignar dimensiones pendientes"
                          >
                            <Plus size={14} />
                            <span>Asignar</span>
                          </button>
                        )}

                        {/* 3. Ver Progreso */}
                        <button
                          onClick={() => navigate(`/evaluaciones/${ev.id}/progreso`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 border border-blue-200 rounded-lg transition-all"
                          title="Ver progreso de evaluación"
                        >
                          <BarChart3 size={14} />
                          <span>Progreso</span>
                        </button>

                        {/* 4. Ver Detalle */}
                        <button
                          onClick={() => navigate(`/evaluaciones/${ev.id}/detalle`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-lg transition-all"
                          title="Ver información detallada"
                        >
                          <Eye size={14} />
                          <span>Detalle</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron evaluaciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};