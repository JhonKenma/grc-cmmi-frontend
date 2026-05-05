// src/pages/asignaciones/MisEvaluaciones.tsx
import React from 'react';
import { Eye, Plus, Calendar, Filter, Target, BarChart3 } from 'lucide-react';
import { Button, LoadingScreen } from '@/components/common';
import { useMisEvaluaciones } from './hooks';

export const MisEvaluaciones: React.FC = () => {
  const {
    loading, evaluaciones, filtroEstado, setFiltroEstado,
    isSuperAdmin, user,
    getEstadoStyles,
    goToAsignarEvaluacion, goToConfigurarNiveles,
    goToAsignarDimensiones, goToProgreso, goToDetalle,
  } = useMisEvaluaciones();

  if (loading) return <LoadingScreen message="Cargando evaluaciones..." />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Evaluaciones</h1>
          <p className="text-sm text-slate-500">Monitorea y gestiona el progreso de las evaluaciones asignadas.</p>
        </div>
        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <Button variant="primary" size="md" onClick={goToAsignarEvaluacion}>
              <Plus size={18} className="mr-2" /> Asignar Evaluación
            </Button>
          )}
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none min-w-[160px]"
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
                {['Evaluación / Empresa', 'Estado', 'Progreso', 'Dimensiones', 'Acciones'].map(h => (
                  <th key={h} className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${h === 'Acciones' ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
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
                            className={`h-full rounded-full transition-all duration-500 ${ev.porcentaje_avance === 100 ? 'bg-emerald-500' : 'bg-primary-600'}`}
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
                        {(user?.rol === 'administrador' || user?.rol === 'superadmin') && (
                          <button
                            onClick={() => goToConfigurarNiveles(ev.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all"
                          >
                            <Target size={14} /> <span>Niveles</span>
                          </button>
                        )}
                        {(() => {
                          const dimensionesPendientes  = ev.total_dimensiones - ev.dimensiones_asignadas;
                          const dimensionesIncompletas = ev.dimensiones_asignadas - ev.dimensiones_completadas;
                          if (dimensionesPendientes <= 0 && dimensionesIncompletas <= 0) return null;
                          return (
                            <button
                              onClick={() => goToAsignarDimensiones(ev.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all"
                            >
                              <Plus size={14} />
                              <span>Asignar{dimensionesPendientes > 0 && ` (${dimensionesPendientes})`}</span>
                            </button>
                          );
                        })()}
                        <button
                          onClick={() => goToProgreso(ev.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all"
                        >
                          <BarChart3 size={14} /> <span>Progreso</span>
                        </button>
                        <button
                          onClick={() => goToDetalle(ev.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
                        >
                          <Eye size={14} /> <span>Detalle</span>
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