// src/pages/reportes/components/TablaDetalleDimensiones.tsx

import React, { useState } from 'react';
import { Card } from '@/components/common';
import {
  ChevronDown,
  ChevronRight,
  Target,
  CheckCircle,
  Eye,
  AlertCircle,
  ClipboardList,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ModalRespuestasAuditadas } from './ModalRespuestasAuditadas';

interface TablaDetalleDimensionesProps {
  dimensiones: Array<{
    dimension: {
      id: string;
      codigo: string;
      nombre: string;
      orden: number;
    };
    nivel_deseado: number;
    nivel_actual_promedio: number;
    gap_promedio: number;
    porcentaje_cumplimiento_promedio: number;
    total_usuarios_evaluados: number;
    total_proyectos: number;
    usuarios?: Array<{
      usuario_id: number;
      usuario_nombre: string;
      nivel_actual: number;
      gap: number;
      clasificacion_gap: string;
      clasificacion_gap_display: string;
      porcentaje_cumplimiento: number;
      total_preguntas: number;
      calculo_nivel_id?: string;
      /** ID de la asignación — requerido para abrir el modal de auditoría */
      asignacion_id?: string;
      respuestas: {
        si_cumple: number;
        cumple_parcial: number;
        no_cumple: number;
        no_aplica: number;
      };
    }>;
  }>;
  onCrearProyecto?: (gapData: {
    calculoNivelId: string;
    asignacionId?: string;        // ⭐ NUEVO
    dimension_nombre: string;
    dimension_codigo: string;
    gap: number;
    clasificacion_gap: string;
    nivel_actual: number;
    nivel_deseado: number;
  }) => void;
}

// ─── Estado del modal ─────────────────────────────────────────────────────────

interface ModalState {
  open: boolean;
  asignacionId: string;
  usuarioNombre: string;
  dimensionNombre: string;
}

const MODAL_CLOSED: ModalState = {
  open: false,
  asignacionId: '',
  usuarioNombre: '',
  dimensionNombre: '',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export const TablaDetalleDimensiones: React.FC<TablaDetalleDimensionesProps> = ({
  dimensiones: dimensionesOriginales,
  onCrearProyecto,
}) => {
  const dimensiones = dimensionesOriginales;

  React.useEffect(() => {
    console.log('📊 DIMENSIONES RECIBIDAS EN TABLA:');
    dimensiones.forEach((dim) => {
      console.log(`  - ${dim.dimension.nombre}:`, {
        total_proyectos: dim.total_proyectos,
        gap_promedio: dim.gap_promedio,
        tiene_usuarios: dim.usuarios?.length || 0,
      });
    });
  }, [dimensiones]);

  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(MODAL_CLOSED);
  const navigate = useNavigate();

  const toggleDimension = (dimensionId: string) => {
    setExpandedDimension(expandedDimension === dimensionId ? null : dimensionId);
  };

  const getGapBadgeColor = (gap: number) => {
    if (gap >= 2) return 'bg-red-100 text-red-800';
    if (gap >= 1) return 'bg-orange-100 text-orange-800';
    if (gap > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const requiereProyecto = (gap: number) => gap > 0.5;

  const tienesDatosCompletos = (dim: (typeof dimensiones)[0]) =>
    Array.isArray(dim.usuarios) &&
    dim.usuarios.length > 0 &&
    dim.usuarios.some((u) => u.calculo_nivel_id);

  const obtenerUsuarioRepresentativo = (dim: (typeof dimensiones)[0]) => {
    if (!Array.isArray(dim.usuarios) || dim.usuarios.length === 0) return null;
    const validos = dim.usuarios.filter((u) => u.calculo_nivel_id);
    if (validos.length === 0) return null;
    return validos.reduce((prev, cur) => (cur.gap > prev.gap ? cur : prev));
  };

  const handleCrearProyectoDimension = (dim: (typeof dimensiones)[0]) => {
    if (!onCrearProyecto) return;
    const usuario = obtenerUsuarioRepresentativo(dim);
    if (!usuario) {
      alert(
        `No se puede crear proyecto para "${dim.dimension.nombre}".\n\nMotivo: No hay usuarios evaluados o faltan datos.`
      );
      return;
    }
    onCrearProyecto({
      calculoNivelId: usuario.calculo_nivel_id!,
      asignacionId: usuario.asignacion_id,      // ⭐ CRÍTICO: necesario para el modal de auditoría
      dimension_nombre: dim.dimension.nombre,
      dimension_codigo: dim.dimension.codigo,
      gap: usuario.gap,
      clasificacion_gap: usuario.clasificacion_gap,
      nivel_actual: usuario.nivel_actual,
      nivel_deseado: dim.nivel_deseado,
    });
  };

  const handleVerProyectosGap = (dim: (typeof dimensiones)[0]) => {
    if (!dim.dimension?.id) {
      alert('No se pueden mostrar los proyectos: Datos incompletos');
      return;
    }
    navigate(`/proyectos-remediacion/dimension/${dim.dimension.id}`);
  };

  /** Abre el modal de auditoría para un usuario específico */
  const handleVerAuditoria = (
    usuario: NonNullable<(typeof dimensiones)[0]['usuarios']>[0],
    dimensionNombre: string
  ) => {
    if (!usuario.asignacion_id) {
      alert('No se encontró el ID de asignación para este usuario.');
      return;
    }
    setModal({
      open: true,
      asignacionId: usuario.asignacion_id,
      usuarioNombre: usuario.usuario_nombre,
      dimensionNombre,
    });
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Detalle por Dimensión</h3>
          <p className="text-sm text-gray-600 mt-1">
            Click en una dimensión para ver el detalle de usuarios
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dimensión
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel Deseado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel Actual
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GAP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cumplimiento
                </th>

                {onCrearProyecto && (
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dimensiones.map((dim) => {
                const datosCompletos = tienesDatosCompletos(dim);
                const requiereRemediacion = requiereProyecto(dim.gap_promedio);

                return (
                  <React.Fragment key={dim.dimension.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      {/* ── Nombre dimensión ── */}
                      <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => toggleDimension(dim.dimension.id)}
                      >
                        <div className="flex items-center">
                          <button className="mr-2 text-gray-400 hover:text-gray-600">
                            {expandedDimension === dim.dimension.id ? (
                              <ChevronDown size={18} />
                            ) : (
                              <ChevronRight size={18} />
                            )}
                          </button>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {dim.dimension.nombre}
                            </div>
                            <div className="text-xs text-gray-500">{dim.dimension.codigo}</div>
                          </div>
                        </div>
                      </td>

                      {/* ── Nivel deseado ── */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          {dim.nivel_deseado.toFixed(1)}
                        </span>
                      </td>

                      {/* ── Nivel actual ── */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                          {dim.nivel_actual_promedio.toFixed(1)}
                        </span>
                      </td>

                      {/* ── GAP ── */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGapBadgeColor(dim.gap_promedio)}`}
                        >
                          {dim.gap_promedio.toFixed(1)}
                        </span>
                      </td>

                      {/* ── Cumplimiento ── */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all"
                              style={{ width: `${dim.porcentaje_cumplimiento_promedio}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600 min-w-[45px]">
                            {dim.porcentaje_cumplimiento_promedio.toFixed(0)}%
                          </span>
                        </div>
                      </td>

          

                      {/* ── Acciones ── */}
                      {onCrearProyecto && (
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-2">

                            {/* ✅ CAMBIO: "Sin Brecha" en lugar de "Sin GAP" */}
                            {!requiereRemediacion && (
                              <span className="text-xs text-green-600 flex items-center justify-center gap-1">
                                <CheckCircle size={14} />
                                Sin Brecha
                              </span>
                            )}

                            {requiereRemediacion && !datosCompletos && (
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs text-orange-600 flex items-center gap-1">
                                  <AlertCircle size={14} />
                                  Sin datos
                                </span>
                                <span className="text-[10px] text-gray-500">No evaluado</span>
                              </div>
                            )}

                            {requiereRemediacion && datosCompletos && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCrearProyectoDimension(dim);
                                  }}
                                  className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-white text-xs font-medium rounded-lg transition-colors shadow-sm
                                    ${
                                      dim.gap_promedio >= 2
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : dim.gap_promedio >= 1
                                        ? 'bg-orange-500 hover:bg-orange-600'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                  <Target size={14} />
                                  {dim.total_proyectos > 0 ? 'Nueva Iniciativa' : 'Remediar Brecha'}
                                </button>

                                {dim.total_proyectos > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleVerProyectosGap(dim);
                                    }}
                                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                                  >
                                    <Eye size={14} className="text-blue-600" />
                                    <span>Ver Proyectos</span>
                                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-[10px]">
                                      {dim.total_proyectos}
                                    </span>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>

                    {/* ── Detalle expandible de usuarios ── */}
                    {expandedDimension === dim.dimension.id && (
                      <tr>
                        <td colSpan={onCrearProyecto ? 7 : 6} className="px-6 py-4 bg-gray-50">
                          {datosCompletos ? (
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                Usuarios asignados a esta dimensión:
                              </h4>
                              {dim.usuarios!.map((usuario) => (
                                <div
                                  key={usuario.usuario_id}
                                  className="bg-white rounded-lg p-4 border border-gray-200"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                                    {/* Nombre */}
                                    <div className="md:col-span-2">
                                      <p className="text-sm font-medium text-gray-900">
                                        {usuario.usuario_nombre}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {usuario.total_preguntas} preguntas
                                      </p>
                                    </div>

                                    {/* Nivel */}
                                    <div className="text-center">
                                      <p className="text-xs text-gray-600 mb-1">Nivel</p>
                                      <p className="text-sm font-semibold text-green-600">
                                        {usuario.nivel_actual.toFixed(1)}
                                      </p>
                                    </div>

                                    {/* GAP */}
                                    <div className="text-center">
                                      <p className="text-xs text-gray-600 mb-1">GAP</p>
                                      <p
                                        className={`text-sm font-semibold ${
                                          usuario.gap >= 2
                                            ? 'text-red-600'
                                            : usuario.gap >= 1
                                            ? 'text-orange-600'
                                            : 'text-green-600'
                                        }`}
                                      >
                                        {usuario.gap.toFixed(1)}
                                      </p>
                                    </div>

                                    {/* Cumplimiento */}
                                    <div className="text-center">
                                      <p className="text-xs text-gray-600 mb-1">Cumplimiento</p>
                                      <p className="text-sm font-semibold text-blue-600">
                                        {usuario.porcentaje_cumplimiento.toFixed(0)}%
                                      </p>
                                    </div>

                                    {/* Respuestas + Botón Auditoría */}
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="flex gap-1 justify-center text-xs">
                                        <span className="text-green-600">
                                          ✓{usuario.respuestas.si_cumple}
                                        </span>
                                        <span className="text-blue-600">
                                          ~{usuario.respuestas.cumple_parcial}
                                        </span>
                                        <span className="text-red-600">
                                          ✗{usuario.respuestas.no_cumple}
                                        </span>
                                      </div>

                                      {/* ✅ NUEVO: Botón Ver Auditoría */}
                                      {usuario.asignacion_id && (
                                        <button
                                          onClick={() =>
                                            handleVerAuditoria(usuario, dim.dimension.nombre)
                                          }
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                                        >
                                          <ClipboardList size={13} />
                                          Ver Auditoría
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
                              <p className="text-sm text-gray-600">
                                No hay usuarios evaluados en esta dimensión
                              </p>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Modal de respuestas auditadas ── */}
      {modal.open && (
        <ModalRespuestasAuditadas
          asignacionId={modal.asignacionId}
          usuarioNombre={modal.usuarioNombre}
          dimensionNombre={modal.dimensionNombre}
          onClose={() => setModal(MODAL_CLOSED)}
        />
      )}
    </>
  );
};