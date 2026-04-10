// src/pages/EvaluacionesInteligentes/Asignaciones/GestionarAsignacionesDetalle.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Eye, AlertCircle,
  CheckCircle, Clock, Users, Ban
} from 'lucide-react';
import { asignacionIQApi } from '@/api/endpoints';
import toast from 'react-hot-toast';
import type { AsignacionEvaluacionIQ } from '@/types/asignacion-iq.types';
import { getEstadoBadgeColor, getPrioridadColor } from '@/types/asignacion-iq.types';

export const GestionarAsignacionesDetalle = () => {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading]           = useState(true);
  const [asignaciones, setAsignaciones] = useState<AsignacionEvaluacionIQ[]>([]);
  const [evaluacionNombre, setEvaluacionNombre] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    if (evaluacionId) cargarDatos();
  }, [evaluacionId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const res = await asignacionIQApi.porEvaluacion(Number(evaluacionId));
      setAsignaciones(res.asignaciones || []);
      if (res.asignaciones?.[0]) {
        setEvaluacionNombre(res.asignaciones[0].evaluacion_nombre);
      }
    } catch (error) {
      toast.error('Error al cargar asignaciones');
      navigate('/evaluaciones-inteligentes/gestionar-asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const asignacionesFiltradas = filtroEstado
    ? asignaciones.filter(a => a.estado === filtroEstado)
    : asignaciones;

  // Stats rápidas
  const stats = {
    total:       asignaciones.length,
    pendientes:  asignaciones.filter(a => a.estado === 'pendiente').length,
    en_progreso: asignaciones.filter(a => a.estado === 'en_progreso').length,
    completadas: asignaciones.filter(a => a.estado === 'completada').length,
    vencidas:    asignaciones.filter(a => a.esta_vencida).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/evaluaciones-inteligentes/gestionar-asignaciones')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{evaluacionNombre}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Asignaciones de esta evaluación
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total',       value: stats.total,       color: 'text-gray-900',   bg: 'bg-gray-100'   },
          { label: 'Pendientes',  value: stats.pendientes,  color: 'text-gray-700',   bg: 'bg-gray-50'    },
          { label: 'En Progreso', value: stats.en_progreso, color: 'text-blue-700',   bg: 'bg-blue-50'    },
          { label: 'Completadas', value: stats.completadas, color: 'text-green-700',  bg: 'bg-green-50'   },
          { label: 'Vencidas',    value: stats.vencidas,    color: 'text-red-700',    bg: 'bg-red-50'     },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-gray-200 p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filtros ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Filtrar:</span>
          {[
            { valor: '',            label: `Todas (${stats.total})`              },
            { valor: 'pendiente',   label: `Pendientes (${stats.pendientes})`    },
            { valor: 'en_progreso', label: `En Progreso (${stats.en_progreso})`  },
            { valor: 'completada',  label: `Completadas (${stats.completadas})`  },
          ].map(f => (
            <button
              key={f.valor}
              onClick={() => setFiltroEstado(f.valor)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filtroEstado === f.valor
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabla de asignaciones ── */}
      {asignacionesFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500 text-sm">No hay asignaciones con ese filtro</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Progreso</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha Límite</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {asignacionesFiltradas.map((asignacion) => (
                <tr key={asignacion.id} className="hover:bg-gray-50 transition-colors">

                  {/* Usuario */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{asignacion.usuario_nombre}</p>
                    <p className="text-xs text-gray-500">{asignacion.usuario_email}</p>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoBadgeColor(asignacion.estado)}`}>
                      {asignacion.estado_display}
                    </span>
                    {asignacion.esta_vencida && (
                      <p className="text-xs text-red-600 font-semibold mt-1">⚠ Vencida</p>
                    )}
                  </td>

                  {/* Progreso */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            Number(asignacion.porcentaje_completado) === 100
                              ? 'bg-green-500'
                              : 'bg-primary-600'
                          }`}
                          style={{ width: `${asignacion.porcentaje_completado}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {Number(asignacion.porcentaje_completado).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {asignacion.preguntas_respondidas}/{asignacion.total_preguntas} preguntas
                    </p>
                  </td>

                  {/* Fecha límite */}
                  <td className={`px-6 py-4 ${getPrioridadColor(asignacion.dias_restantes)}`}>
                    <p className="text-sm font-medium">
                      {new Date(asignacion.fecha_limite).toLocaleDateString('es-PE')}
                    </p>
                    <p className="text-xs mt-0.5">
                      {asignacion.esta_vencida ? (
                        <span className="text-red-600 font-semibold">¡Vencida!</span>
                      ) : (
                        `${asignacion.dias_restantes} días restantes`
                      )}
                    </p>
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/evaluaciones-iq/asignacion/${asignacion.id}/admin`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors"
                    >
                      <Eye size={14} />
                      Ver Detalle
                    </button>
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