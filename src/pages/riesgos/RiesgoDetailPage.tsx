import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Send, ShieldX, XCircle, X } from 'lucide-react';

import { Card } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import {
  useControlesDeRiesgo,
  useControlesList,
  useEvaluacionesCuantitativasList,
  usePlanesTratamientoList,
  useRiesgoDetail,
  useRiesgoFlowActions,
  useUpdateRiesgo,
  useVincularControl,
} from '@/hooks/useRiesgosModule';
import type { Id } from '@/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const formatEstadoLabel = (estado: string): string =>
  estado
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export function RiesgoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const riesgoQuery = useRiesgoDetail(id ?? '');
  const flowActions = useRiesgoFlowActions();
  const updateMutation = useUpdateRiesgo();
  const controlesRiesgoQuery = useControlesDeRiesgo(id);
  const controlesBibliotecaQuery = useControlesList();
  const planesQuery = usePlanesTratamientoList({ riesgo: id });
  const evaluacionesQuery = useEvaluacionesCuantitativasList({ riesgo: id });
  const vincularControlMutation = useVincularControl();
  const [tabActivo, setTabActivo] = useState<'informacion' | 'controles' | 'planes' | 'cuantitativo'>('informacion');
  const [showVincularControl, setShowVincularControl] = useState(false);
  const [controlSeleccionado, setControlSeleccionado] = useState('');

  const [editData, setEditData] = useState({
    titulo: '',
    descripcion: '',
    probabilidad: 1,
    impacto: 1,
    categoria_coso: 'Operacional',
    causa_raiz: '',
    consecuencia: '',
    fecha_identificacion: '',
    fecha_revision: '',
    controles_asociados: '',
    estado_tratamiento: 'Pendiente',
  });

  const canExecuteActions = useMemo(() => Boolean(id), [id]);

  if (!id) {
    return <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">ID de riesgo invalido.</div>;
  }

  if (riesgoQuery.isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4">Cargando detalle de riesgo...</div>;
  }

  if (riesgoQuery.isError || !riesgoQuery.data) {
    return <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">No se pudo cargar el riesgo.</div>;
  }

  const riesgo = riesgoQuery.data;

  const riesgoRaw = riesgo as unknown as Record<string, unknown>;
  const categoriaDetail = isRecord(riesgoRaw.categoria_detail) ? riesgoRaw.categoria_detail : null;

  const categoriaNombre =
    riesgo.categoria_nombre ??
    (categoriaDetail && typeof categoriaDetail.nombre === 'string' ? categoriaDetail.nombre : '-');

  const procesoNombre =
    (typeof riesgoRaw.proceso_nombre === 'string' && riesgoRaw.proceso_nombre) ||
    (typeof riesgo.proceso === 'string' && !riesgo.proceso.includes('-') ? riesgo.proceso : '') ||
    '-';

  const estadoRiesgo = String(riesgo.estado);
  const canEdit = !['cerrado', 'mitigado', 'aceptado', 'en_revision'].includes(estadoRiesgo);
  const esAdmin = ['administrador', 'superadmin'].includes(String(user?.rol ?? ''));

  useEffect(() => {
    const fechaIdentificacion =
      typeof riesgo.fecha_identificacion === 'string' && riesgo.fecha_identificacion
        ? riesgo.fecha_identificacion.slice(0, 10)
        : '';
    const fechaRevision =
      (typeof riesgo.fecha_revision === 'string' && riesgo.fecha_revision) ||
      (typeof riesgo.proxima_revision_fecha === 'string' && riesgo.proxima_revision_fecha) ||
      '';

    setEditData({
      titulo: riesgo.titulo ?? riesgo.nombre ?? '',
      descripcion: riesgo.descripcion ?? '',
      probabilidad: Number(riesgo.probabilidad ?? 1),
      impacto: Number(riesgo.impacto ?? 1),
      categoria_coso: riesgo.categoria_coso ?? 'Operacional',
      causa_raiz: riesgo.causa_raiz ?? '',
      consecuencia: riesgo.consecuencia ?? '',
      fecha_identificacion: fechaIdentificacion,
      fecha_revision: fechaRevision,
      controles_asociados: riesgo.controles_asociados ?? '',
      estado_tratamiento: riesgo.estado_tratamiento ?? 'Pendiente',
    });
  }, [
    riesgo.categoria_coso,
    riesgo.causa_raiz,
    riesgo.consecuencia,
    riesgo.controles_asociados,
    riesgo.descripcion,
    riesgo.estado_tratamiento,
    riesgo.fecha_identificacion,
    riesgo.fecha_revision,
    riesgo.impacto,
    riesgo.nombre,
    riesgo.probabilidad,
    riesgo.proxima_revision_fecha,
    riesgo.titulo,
  ]);

  const puedeEnviarRevision = estadoRiesgo === 'borrador';
  const puedeAprobar = esAdmin && estadoRiesgo === 'en_revision';
  const puedeRechazar = esAdmin && estadoRiesgo === 'en_revision';
  const puedeCerrar = esAdmin && ['aprobado', 'en_tratamiento', 'mitigado', 'aceptado'].includes(estadoRiesgo);

  return (
    <div className="space-y-6">
      <section className="mb-6 flex flex-col gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Regresar
        </button>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{riesgo.codigo}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{riesgo.titulo ?? riesgo.nombre}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{formatEstadoLabel(String(riesgo.estado))}</span>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        {[
          { key: 'informacion', label: 'Información' },
          { key: 'controles', label: 'Controles' },
          { key: 'planes', label: 'Planes' },
          { key: 'cuantitativo', label: 'Cuantitativo' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setTabActivo(tab.key as typeof tabActivo)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tabActivo === tab.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="rounded-xl p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">Seccion: Contexto del riesgo</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{riesgo.descripcion || 'Sin descripcion registrada.'}</p>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Categoria</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{categoriaNombre}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Proceso</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{procesoNombre}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Probabilidad</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{riesgo.probabilidad}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Impacto</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{riesgo.impacto}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Causa raiz</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{riesgo.causa_raiz || '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Consecuencia</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{riesgo.consecuencia || '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Categoria COSO</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{riesgo.categoria_coso || '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Estado tratamiento</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{riesgo.estado_tratamiento || '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Fecha identificación</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{riesgo.fecha_identificacion || '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Fecha revisión</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{riesgo.fecha_revision || '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Controles asociados</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{riesgo.controles_asociados || '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Edicion rapida</p>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <input
                  value={editData.titulo}
                  onChange={(event) => setEditData((prev) => ({ ...prev, titulo: event.target.value }))}
                  disabled={!canEdit}
                  className="rounded border border-slate-200 px-2 py-1.5 text-sm disabled:bg-slate-50"
                  placeholder="Titulo"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editData.probabilidad}
                    onChange={(event) => setEditData((prev) => ({ ...prev, probabilidad: Number(event.target.value) }))}
                    disabled={!canEdit}
                    placeholder="Prob. (1-5)"
                    title="Probabilidad del riesgo, escala 1 a 5"
                    className="rounded border border-slate-200 px-2 py-1.5 text-sm disabled:bg-slate-50"
                  />
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editData.impacto}
                    onChange={(event) => setEditData((prev) => ({ ...prev, impacto: Number(event.target.value) }))}
                    disabled={!canEdit}
                    placeholder="Impacto (1-5)"
                    title="Impacto del riesgo, escala 1 a 5"
                    className="rounded border border-slate-200 px-2 py-1.5 text-sm disabled:bg-slate-50"
                  />
                </div>
                <textarea
                  value={editData.descripcion}
                  onChange={(event) => setEditData((prev) => ({ ...prev, descripcion: event.target.value }))}
                  disabled={!canEdit}
                  className="rounded border border-slate-200 px-2 py-1.5 text-sm md:col-span-2 disabled:bg-slate-50"
                  placeholder="Descripcion"
                />
                <select
                  value={editData.categoria_coso}
                  onChange={(event) => setEditData((prev) => ({ ...prev, categoria_coso: event.target.value }))}
                  disabled={!canEdit}
                  className="rounded border border-slate-200 px-2 py-1.5 text-sm disabled:bg-slate-50"
                >
                  <option value="Operacional">Operacional</option>
                  <option value="Financiero">Financiero</option>
                  <option value="Cumplimiento">Cumplimiento</option>
                </select>
                <select
                  value={editData.estado_tratamiento}
                  onChange={(event) => setEditData((prev) => ({ ...prev, estado_tratamiento: event.target.value }))}
                  disabled={!canEdit}
                  className="rounded border border-slate-200 px-2 py-1.5 text-sm disabled:bg-slate-50"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Mitigado">Mitigado</option>
                  <option value="Aceptado">Aceptado</option>
                </select>
                <textarea
                  value={editData.causa_raiz}
                  onChange={(event) => setEditData((prev) => ({ ...prev, causa_raiz: event.target.value }))}
                  disabled={!canEdit}
                  className="rounded border border-slate-200 px-2 py-1.5 text-sm md:col-span-2 disabled:bg-slate-50"
                  placeholder="Causa raíz"
                />
                <textarea
                  value={editData.consecuencia}
                  onChange={(event) => setEditData((prev) => ({ ...prev, consecuencia: event.target.value }))}
                  disabled={!canEdit}
                  className="rounded border border-slate-200 px-2 py-1.5 text-sm md:col-span-2 disabled:bg-slate-50"
                  placeholder="Consecuencia"
                />
                <input
                  type="date"
                  value={editData.fecha_identificacion}
                  onChange={(event) => setEditData((prev) => ({ ...prev, fecha_identificacion: event.target.value }))}
                  disabled={!canEdit}
                  className="rounded border border-slate-200 px-2 py-1.5 text-sm disabled:bg-slate-50"
                />
                <input
                  type="date"
                  value={editData.fecha_revision}
                  onChange={(event) => setEditData((prev) => ({ ...prev, fecha_revision: event.target.value }))}
                  disabled={!canEdit}
                  className="rounded border border-slate-200 px-2 py-1.5 text-sm disabled:bg-slate-50"
                />
                <input
                  value={editData.controles_asociados}
                  onChange={(event) => setEditData((prev) => ({ ...prev, controles_asociados: event.target.value }))}
                  disabled={!canEdit}
                  className="rounded border border-slate-200 px-2 py-1.5 text-sm md:col-span-2 disabled:bg-slate-50"
                  placeholder="Controles asociados (C001,C002)"
                />
              </div>
              <button
                type="button"
                disabled={!canEdit || updateMutation.isPending}
                onClick={() =>
                  updateMutation.mutate({
                    id,
                    payload: {
                      titulo: editData.titulo,
                      descripcion: editData.descripcion,
                      probabilidad: editData.probabilidad,
                      impacto: editData.impacto,
                      categoria_coso: editData.categoria_coso,
                      causa_raiz: editData.causa_raiz,
                      consecuencia: editData.consecuencia,
                      fecha_identificacion: editData.fecha_identificacion,
                      fecha_revision: editData.fecha_revision,
                      controles_asociados: editData.controles_asociados,
                      estado_tratamiento: editData.estado_tratamiento,
                    },
                  })
                }
                className="mt-3 rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </Card>

        <Card className="rounded-xl p-5">
          <h2 className="text-base font-semibold text-slate-900">Seccion: Flujo</h2>
          <p className="mt-2 text-sm text-slate-600">Control de estados: revision, aprobacion, rechazo y cierre.</p>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              disabled={!canExecuteActions || !puedeEnviarRevision || flowActions.enviarRevision.isPending}
              onClick={() => flowActions.enviarRevision.mutate(id)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
            >
              <Send size={14} /> Enviar a revision
            </button>
            <button
              type="button"
              disabled={!canExecuteActions || !puedeAprobar || flowActions.aprobar.isPending}
              onClick={() => flowActions.aprobar.mutate(id)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              <Check size={14} /> Aprobar
            </button>
            <button
              type="button"
              disabled={!canExecuteActions || !puedeRechazar || flowActions.rechazar.isPending}
              onClick={() => flowActions.rechazar.mutate(id)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              <XCircle size={14} /> Rechazar
            </button>
            <button
              type="button"
              disabled={!canExecuteActions || !puedeCerrar || flowActions.cerrar.isPending}
              onClick={() => flowActions.cerrar.mutate(id)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100 disabled:opacity-60"
            >
              <ShieldX size={14} /> Cerrar
            </button>
          </div>
        </Card>
      </section>

      {tabActivo === 'controles' && (
        <Card className="rounded-xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Controles vinculados</h2>
              <p className="text-xs text-slate-500">Relación entre el riesgo y la biblioteca de controles.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowVincularControl(true)}
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Vincular Control
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {(controlesRiesgoQuery.data ?? []).map((item) => {
              const efectividadPromedio = ((item.efectividad_diseno + item.efectividad_operativa) / 2) / 5;
              const residual = Number((Number(riesgo.nivel_inherente ?? (riesgo.probabilidad * riesgo.impacto)) * (1 - efectividadPromedio)).toFixed(2));

              return (
                <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{item.control_detail.nombre}</p>
                      <p className="text-xs text-slate-500">{item.control_detail.descripcion}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">F4: R_Residual = R_Inherente × (1 - EC)</span>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs text-slate-500">Efectividad Diseño</p>
                      <div className="h-2.5 rounded-full bg-slate-200">
                        <div className="h-2.5 rounded-full bg-cyan-600" style={{ width: `${(item.efectividad_diseno / 5) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-slate-500">Efectividad Operativa</p>
                      <div className="h-2.5 rounded-full bg-slate-200">
                        <div className="h-2.5 rounded-full bg-emerald-600" style={{ width: `${(item.efectividad_operativa / 5) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">Residual estimado: {residual}</p>
                </div>
              );
            })}

            {(controlesRiesgoQuery.data ?? []).length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                No hay controles vinculados a este riesgo.
              </div>
            )}
          </div>
        </Card>
      )}

      {tabActivo === 'planes' && (
        <Card className="rounded-xl p-5">
          <h2 className="text-base font-semibold text-slate-900">Planes asociados</h2>
          <div className="mt-4 space-y-3">
            {(planesQuery.data?.results ?? []).map((plan) => (
              <div key={String(plan.id)} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{plan.nombre}</p>
                    <p className="text-xs text-slate-500">{plan.tipo_tratamiento_nombre ?? plan.tipo_tratamiento ?? 'Tratamiento'}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    Posición actual → post-tratamiento: {riskPositionLabel(riesgo.probabilidad, riesgo.impacto)} → {riskPositionLabel(plan.nueva_probabilidad ?? riesgo.probabilidad, plan.nuevo_impacto ?? riesgo.impacto)}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600 md:grid-cols-3">
                  <div>Nueva P: {plan.nueva_probabilidad ?? '-'}</div>
                  <div>Nuevo I: {plan.nuevo_impacto ?? '-'}</div>
                  <div>Residual esperado: {plan.nivel_residual_esperado ?? '-'}</div>
                </div>
              </div>
            ))}
            {(planesQuery.data?.results ?? []).length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                No hay planes asociados a este riesgo.
              </div>
            )}
          </div>
        </Card>
      )}

      {tabActivo === 'cuantitativo' && (
        <Card className="rounded-xl p-5">
          <h2 className="text-base font-semibold text-slate-900">Vista cuantitativa</h2>
          {riesgo.evaluacion_cuantitativa_activa ? (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">F1 - ALE</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{evaluacionesQuery.data?.results?.[0]?.ale ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">F2 - SLE</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{riesgo.sle_calculado ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">F3 - NRC</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{riesgo.nrc_calculado ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">F4 - Residual</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{riesgo.riesgo_residual_calculado ?? '—'}</p>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              Este riesgo no tiene evaluación cuantitativa activa.
            </div>
          )}
        </Card>
      )}

      {showVincularControl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Vincular Control</h3>
                <p className="text-sm text-slate-500">Selecciona un control de la biblioteca.</p>
              </div>
              <button type="button" onClick={() => setShowVincularControl(false)} className="text-slate-400 hover:text-slate-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <select
                value={controlSeleccionado}
                onChange={(event) => setControlSeleccionado(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
              >
                <option value="">Seleccionar control...</option>
                {(controlesBibliotecaQuery.data ?? []).map((control) => (
                  <option key={control.id} value={control.id}>
                    {control.codigo} - {control.nombre}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowVincularControl(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!controlSeleccionado || vincularControlMutation.isPending}
                  onClick={() =>
                    vincularControlMutation.mutate(
                      {
                        controlId: controlSeleccionado,
                        payload: { riesgo_id: id ?? '' },
                      },
                      {
                        onSuccess: () => setShowVincularControl(false),
                      },
                    )
                  }
                  className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-60"
                >
                  Vincular
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

const riskPositionLabel = (probabilidad: number, impacto: number): string => {
  const nivel = probabilidad * impacto;
  if (nivel <= 5) return 'Bajo';
  if (nivel <= 10) return 'Medio';
  if (nivel <= 15) return 'Alto';
  return 'Crítico';
};
