// src/pages/asignaciones/MisTareas.tsx
import React from 'react';
import {
  ClipboardList, Clock, CheckCircle, AlertCircle,
  Calendar, FileText, Layers, Eye, XCircle,
} from 'lucide-react';
import { Card, LoadingScreen } from '@/components/common';
import { useMisTareas, getEstadoBadgeConfig, getDiasRestantesColor } from './hooks';

export const MisTareas: React.FC = () => {
  const {
    loading, asignacionesFiltradas, filtroEstado, setFiltroEstado,
    stats, user,
    getEstadoParaAccion,
    goToResponder, goToRevisar,
  } = useMisTareas();

  if (loading) return <LoadingScreen message="Cargando tus evaluaciones..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis evaluaciones</h1>
        <p className="text-gray-600 mt-1">Gestiona tus evaluaciones y dimensiones asignadas</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {[
          { label: 'Total',        value: stats.total,               icon: ClipboardList, color: 'bg-gray-100   text-gray-600' },
          { label: 'Pendientes',   value: stats.pendientes,           icon: Clock,         color: 'bg-yellow-100 text-yellow-600' },
          { label: 'En Progreso',  value: stats.en_progreso,          icon: FileText,      color: 'bg-blue-100   text-blue-600' },
          { label: 'En Revisión',  value: stats.pendientes_revision,  icon: Eye,           color: 'bg-purple-100 text-purple-600' },
          { label: 'Respondidas',  value: stats.respondidas,          icon: CheckCircle,   color: 'bg-green-100  text-green-600' },
          { label: 'Rechazadas',   value: stats.rechazadas,           icon: XCircle,       color: 'bg-orange-100 text-orange-600' },
          { label: 'Vencidas',     value: stats.vencidas,             icon: AlertCircle,   color: 'bg-red-100    text-red-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
          {['todos', 'pendiente', 'en_progreso', 'pendiente_revision', 'rechazado', 'completado', 'vencido'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === estado
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {estado === 'todos' ? 'Todos'
                : estado === 'pendiente_revision' ? 'En Revisión'
                : estado.replace('_', ' ').charAt(0).toUpperCase() + estado.replace('_', ' ').slice(1)}
            </button>
          ))}
        </div>
      </Card>

      {/* Lista */}
      {asignacionesFiltradas.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes tareas {filtroEstado !== 'todos' && 'en este estado'}
            </h3>
            <p className="text-gray-600">
              {filtroEstado !== 'todos'
                ? 'Cambia el filtro para ver otras tareas'
                : 'Cuando te asignen evaluaciones o dimensiones, aparecerán aquí'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {asignacionesFiltradas.map((asignacion) => {
            const estadoVisual = asignacion.estado;
            const estadoAccion = getEstadoParaAccion(asignacion);
            const badge = getEstadoBadgeConfig(estadoVisual);

            return (
              <Card key={asignacion.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">{asignacion.encuesta_nombre}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.colorClass}`}>
                        {badge.icon} {badge.label}
                      </span>
                      {asignacion.requiere_revision && estadoVisual !== 'completado' && estadoVisual !== 'pendiente_revision' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          📋 Requiere Revisión
                        </span>
                      )}
                    </div>

                    {asignacion.dimension_nombre && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Layers size={16} />
                        <span>Dimensión: {asignacion.dimension_nombre}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Vence: {new Date(asignacion.fecha_limite).toLocaleDateString()}</span>
                      </div>
                      <div className={`flex items-center gap-2 font-medium ${getDiasRestantesColor(asignacion.dias_restantes)}`}>
                        <Clock size={16} />
                        <span>
                          {asignacion.dias_restantes < 0
                            ? `Vencida hace ${Math.abs(asignacion.dias_restantes)} días`
                            : `${asignacion.dias_restantes} días restantes`}
                        </span>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">Progreso</span>
                        <span className="text-xs font-medium text-primary-600">
                          {Number(asignacion.porcentaje_avance || 0).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            estadoVisual === 'completado'         ? 'bg-green-600' :
                            estadoVisual === 'pendiente_revision' ? 'bg-purple-600' :
                            estadoVisual === 'rechazado'          ? 'bg-orange-600' : 'bg-primary-600'
                          }`}
                          style={{ width: `${asignacion.porcentaje_avance}%` }}
                        />
                      </div>
                    </div>

                    {estadoVisual === 'rechazado' && (
                      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <XCircle size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-orange-900">Esta tarea fue rechazada y requiere correcciones</p>
                            <p className="text-xs text-orange-700 mt-1">Revisa los comentarios del revisor y vuelve a completarla</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {estadoVisual === 'pendiente_revision' && (
                      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Eye size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-purple-900">Tu tarea está en proceso de revisión</p>
                            <p className="text-xs text-purple-700 mt-1">El administrador revisará tu trabajo y te notificará cuando esté aprobado</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botones */}
                  <div className="flex flex-col gap-2">
                    {user?.rol !== 'administrador' && user?.rol !== 'superadmin' && (
                      <button
                        onClick={() => goToResponder(asignacion.id)}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium text-white ${
                          estadoAccion === 'completado'         ? 'bg-gray-600   hover:bg-gray-700' :
                          estadoAccion === 'pendiente_revision' ? 'bg-purple-600 hover:bg-purple-700' :
                          estadoAccion === 'rechazado'          ? 'bg-orange-600 hover:bg-orange-700' :
                                                                   'bg-primary-600 hover:bg-primary-700'
                        }`}
                      >
                        {estadoAccion === 'completado'         ? 'Ver Respuestas' :
                         estadoAccion === 'pendiente_revision' ? 'En Revisión' :
                         estadoAccion === 'rechazado'          ? 'Corregir' : 'Responder'}
                      </button>
                    )}
                    {(user?.rol === 'administrador' || user?.rol === 'superadmin') && (
                      <button
                        onClick={() => goToRevisar(asignacion.id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Eye size={16} /> <span>Revisar Respuestas</span>
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};