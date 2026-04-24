import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/common';
import { usuarioService } from '@/api/usuario.service';
import {
  useTiposActivoRemediacion,
  useTiposTratamiento,
  useCreatePlanTratamiento,
  usePlanActions,
  usePlanesTratamientoList,
  useRiesgosList,
} from '@/hooks/useRiesgosModule';
import type { CreatePlanTratamientoPayload, Id } from '@/types';

const PLAN_DESCRIPCION_MAX_LENGTH = 400;

export function PlanesPage() {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [avanceDrafts, setAvanceDrafts] = useState<Record<string, number>>({});
  const [procesandoIds, setProcesandoIds] = useState<Record<string, boolean>>({});
  const [activos, setActivos] = useState<Array<{ tipo_activo: string; descripcion: string; costo_estimado: number; estado: 'pendiente' | 'en_proceso' | 'adquirido' | 'implementado' }>>([]);
  const [formData, setFormData] = useState<CreatePlanTratamientoPayload>({
    riesgo: '',
    riesgos: [],
    riesgos_asociados: [],
    nombre: '',
    descripcion_accion: '',
    avance: 0,
    fecha_inicio: '',
    fecha_fin_plan: '',
    responsable_accion: '',
    tipo_tratamiento: '',
    mejora: '',
    nueva_probabilidad: 3,
    nuevo_impacto: 3,
    dependencias: [],
  });

  const riesgosQuery = useRiesgosList({ page_size: 200 });
  const tiposTratamientoQuery = useTiposTratamiento();
  const tiposActivoRemediacionQuery = useTiposActivoRemediacion();
  const planesQuery = usePlanesTratamientoList();
  const usuariosQuery = useQuery({
    queryKey: ['usuarios-planes-form'],
    queryFn: () => usuarioService.getAll(),
  });

  const createMutation = useCreatePlanTratamiento();
  const actions = usePlanActions();

  const riesgosLookup = useMemo(() => {
    const map = new Map<string, string>();
    (riesgosQuery.data?.results ?? []).forEach((riesgo) => {
      map.set(String(riesgo.id), `${riesgo.codigo} - ${riesgo.titulo ?? riesgo.nombre}`);
    });
    return map;
  }, [riesgosQuery.data]);

  return (
    <div className="space-y-5">
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
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tratamiento</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Planes de tratamiento</h1>
          </div>
        </div>
      </section>

      <Card className="rounded-xl p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Planes de tratamiento</h2>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Crear plan
          </button>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
            <Card className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-white p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-emerald-700">Nuevo registro</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">Crear plan de tratamiento</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-slate-400 transition-colors hover:text-slate-700"
                  aria-label="Cerrar formulario"
                >
                  <X size={24} />
                </button>
              </div>

              <form
                className="space-y-6 p-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  const selectedRiesgos = formData.riesgos && formData.riesgos.length > 0
                    ? formData.riesgos
                    : [formData.riesgo];
                  const costoTotal = activos.reduce((sum, activo) => sum + (Number(activo.costo_estimado) || 0), 0);

                  createMutation.mutate({
                    ...formData,
                    riesgos: selectedRiesgos,
                    riesgos_asociados: selectedRiesgos,
                    riesgo: selectedRiesgos[0],
                    nivel_residual_esperado: Number(formData.nueva_probabilidad ?? 0) * Number(formData.nuevo_impacto ?? 0),
                    costo_total: costoTotal,
                    activos_plan: activos.map((activo) => ({
                      id: '',
                      plan: '',
                      tipo_activo: activo.tipo_activo,
                      tipo_activo_nombre: tiposActivoRemediacionQuery.data?.find((tipo) => tipo.id === activo.tipo_activo)?.nombre ?? null,
                      descripcion: activo.descripcion,
                      costo_estimado: Number(activo.costo_estimado) || 0,
                      costo_real: 0,
                      responsable_adquisicion: null,
                      fecha_requerida: null,
                      proveedor: '',
                      estado: activo.estado,
                    })),
                  }, {
                    onSuccess: () => {
                      setFormData({
                        riesgo: '',
                        riesgos: [],
                        riesgos_asociados: [],
                        nombre: '',
                        descripcion_accion: '',
                        avance: 0,
                        fecha_inicio: '',
                        fecha_fin_plan: '',
                        responsable_accion: '',
                        tipo_tratamiento: '',
                        mejora: '',
                        nueva_probabilidad: 3,
                        nuevo_impacto: 3,
                        dependencias: [],
                      });
                      setActivos([]);
                      setShowCreateForm(false);
                    },
                  });
                }}
              >
                {/* Información Básica */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Información del Plan</h3>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Riesgo Principal <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={String(formData.riesgo)}
                        onChange={(event) => setFormData((prev) => ({ ...prev, riesgo: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                      >
                        <option value="">Seleccionar riesgo...</option>
                        {(riesgosQuery.data?.results ?? []).map((riesgo) => (
                          <option key={String(riesgo.id)} value={String(riesgo.id)}>
                            {riesgo.codigo} - {riesgo.titulo ?? riesgo.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Nombre del Plan <span className="text-red-500">*</span></label>
                      <input
                        required
                        value={formData.nombre}
                        onChange={(event) => setFormData((prev) => ({ ...prev, nombre: event.target.value }))}
                        placeholder="Ej: Implementar firewall avanzado"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-600">Riesgos adicionales a mitigar (N-to-N)</label>
                      <select
                        multiple
                        value={(formData.riesgos ?? []).map((id) => String(id))}
                        onChange={(event) => {
                          const values = Array.from(event.target.selectedOptions).map((opt) => opt.value);
                          setFormData((prev) => ({ ...prev, riesgos: values }));
                        }}
                        className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                      >
                        {(riesgosQuery.data?.results ?? []).map((riesgo) => (
                          <option key={String(riesgo.id)} value={String(riesgo.id)}>
                            {riesgo.codigo} - {riesgo.titulo ?? riesgo.nombre}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-slate-500">Mantén Ctrl/Cmd para seleccionar varios riesgos en un mismo plan.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">
                        Tipo de Tratamiento <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.tipo_tratamiento ?? ''}
                        onChange={(event) => setFormData((prev) => ({ ...prev, tipo_tratamiento: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                      >
                        <option value="">Seleccionar tipo...</option>
                        {tiposTratamientoQuery.data?.map((tipo) => (
                          <option key={tipo.id} value={tipo.id} title={tipo.descripcion}>
                            {tipo.numero}. {tipo.nombre}
                          </option>
                        ))}
                      </select>
                      {formData.tipo_tratamiento && (
                        <p className="mt-1 text-xs italic text-slate-500">
                          {tiposTratamientoQuery.data?.find((tipo) => tipo.id === formData.tipo_tratamiento)?.descripcion}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">¿Qué dimensión mejora este plan?</label>
                      <div className="flex gap-2">
                        {(['probabilidad', 'impacto', 'ambos'] as const).map((opcion) => (
                          <button
                            key={opcion}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, mejora: opcion }))}
                            className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                              formData.mejora === opcion
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {opcion === 'probabilidad' ? 'Probabilidad' : opcion === 'impacto' ? 'Impacto' : 'Ambos'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {formData.mejora && (
                    <div className="mt-4 rounded-lg bg-blue-50 p-3">
                      <p className="text-xs font-semibold text-blue-700">Valores esperados después del tratamiento</p>
                      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                        {(formData.mejora === 'probabilidad' || formData.mejora === 'ambos') && (
                          <div>
                            <label className="mb-1 block text-xs text-gray-600">Nueva Probabilidad (1-5)</label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={formData.nueva_probabilidad ?? 3}
                              onChange={(event) => setFormData((prev) => ({ ...prev, nueva_probabilidad: Number(event.target.value) }))}
                              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                            />
                          </div>
                        )}
                        {(formData.mejora === 'impacto' || formData.mejora === 'ambos') && (
                          <div>
                            <label className="mb-1 block text-xs text-gray-600">Nuevo Impacto (1-5)</label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={formData.nuevo_impacto ?? 3}
                              onChange={(event) => setFormData((prev) => ({ ...prev, nuevo_impacto: Number(event.target.value) }))}
                              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                            />
                          </div>
                        )}
                      </div>
                      <div className="mt-3 rounded border border-blue-200 bg-white px-3 py-2">
                        <span className="text-xs font-semibold text-blue-700">
                          Nivel Residual Esperado: {(Number(formData.nueva_probabilidad ?? 0) * Number(formData.nuevo_impacto ?? 0)).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Descripción */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="mb-4 font-semibold text-slate-900">Responsable y Fechas</h3>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Responsable del Plan</label>
                      <select
                        value={String(formData.responsable_accion ?? '')}
                        onChange={(event) => setFormData((prev) => ({ ...prev, responsable_accion: event.target.value || undefined }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                      >
                        <option value="">Seleccionar responsable...</option>
                        {(usuariosQuery.data ?? []).map((usuario) => (
                          <option key={String(usuario.id)} value={String(usuario.id)}>
                            {usuario.nombre_completo || `${usuario.first_name} ${usuario.last_name}`.trim() || usuario.username}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Fecha de inicio</label>
                      <input
                        type="date"
                        value={formData.fecha_inicio ?? ''}
                        onChange={(event) => setFormData((prev) => ({ ...prev, fecha_inicio: event.target.value || undefined }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Fecha límite</label>
                      <input
                        type="date"
                        value={formData.fecha_fin_plan ?? ''}
                        onChange={(event) => setFormData((prev) => ({ ...prev, fecha_fin_plan: event.target.value || undefined }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-600">Descripción del Plan <span className="text-red-500">*</span></label>
                      <span className="text-xs text-slate-500">{(formData.descripcion_accion ?? '').length}/{PLAN_DESCRIPCION_MAX_LENGTH}</span>
                    </div>
                    <textarea
                      required
                      maxLength={PLAN_DESCRIPCION_MAX_LENGTH}
                      value={formData.descripcion_accion ?? ''}
                      onChange={(event) => setFormData({ ...formData, descripcion_accion: event.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                      rows={4}
                      placeholder="Describe el plan de acción, objetivos y resultados esperados"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-800">Recursos del Plan</h3>
                    <button
                      type="button"
                      onClick={() => setActivos([...activos, { tipo_activo: '', descripcion: '', costo_estimado: 0, estado: 'pendiente' }])}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      + Agregar Recurso
                    </button>
                  </div>

                  {activos.map((activo, idx) => (
                    <div key={idx} className="mb-2 grid grid-cols-12 items-start gap-2">
                      <div className="col-span-4">
                        <select
                          value={activo.tipo_activo}
                          onChange={(event) => {
                            const newActivos = [...activos];
                            newActivos[idx].tipo_activo = event.target.value;
                            setActivos(newActivos);
                          }}
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs"
                        >
                          <option value="">Tipo de activo...</option>
                          {tiposActivoRemediacionQuery.data?.map((tipo) => (
                            <option key={tipo.id} value={tipo.id}>
                              {tipo.numero}. {tipo.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Descripción"
                          value={activo.descripcion}
                          onChange={(event) => {
                            const newActivos = [...activos];
                            newActivos[idx].descripcion = event.target.value;
                            setActivos(newActivos);
                          }}
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Costo USD"
                          value={activo.costo_estimado}
                          onChange={(event) => {
                            const newActivos = [...activos];
                            newActivos[idx].costo_estimado = Number(event.target.value);
                            setActivos(newActivos);
                          }}
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center pt-1">
                        <button
                          type="button"
                          onClick={() => setActivos(activos.filter((_, i) => i !== idx))}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {activos.length > 0 && (
                    <div className="mt-2 text-right">
                      <span className="text-sm font-semibold text-gray-700">
                        Costo Total del Plan: ${activos.reduce((sum, activo) => sum + (Number(activo.costo_estimado) || 0), 0).toLocaleString('es')} USD
                      </span>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 lg:flex-row lg:items-center lg:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={
                      createMutation.isPending ||
                      !formData.nombre ||
                      !(formData.descripcion_accion?.trim()) ||
                      !formData.riesgo
                    }
                    className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed"
                    title={!formData.nombre ? 'Ingrese nombre' : !formData.descripcion_accion?.trim() ? 'Ingrese descripción' : !formData.riesgo ? 'Seleccione riesgo principal' : ''}
                  >
                    {createMutation.isPending ? 'Guardando...' : 'Crear plan'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </Card>

      <Card className="rounded-xl p-0">
        {planesQuery.isLoading ? (
          <div className="p-4 text-sm text-slate-600">Cargando planes...</div>
        ) : (planesQuery.data?.results.length ?? 0) === 0 ? (
          <div className="p-5 text-sm text-slate-600">No hay planes registrados.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {(planesQuery.data?.results ?? []).map((plan) => {
              const estaAprobado = !!plan.aprobado_por;
              const fechaInicio = plan.fecha_inicio
                ? new Date(plan.fecha_inicio).toLocaleDateString('es-ES')
                : '';
              const fechaFin = plan.fecha_fin_plan || plan.fecha_fin
                ? new Date((plan.fecha_fin_plan || plan.fecha_fin) as string).toLocaleDateString('es-ES')
                : '';
              return (
                <div key={String(plan.id)} className="space-y-4 p-5 hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-base font-bold text-slate-900">{plan.nombre}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        🎯 Riesgo: <span className="font-medium">{plan.riesgo_nombre ?? riesgosLookup.get(String(plan.riesgo)) ?? plan.riesgo}</span>
                      </p>
                      {(plan.riesgos_asociados?.length ?? 0) > 1 && (
                        <p className="text-xs text-slate-600 mt-1">
                          🔗 Riesgos asociados:{' '}
                          {plan.riesgos_asociados
                            ?.map((item) => `${item.codigo} - ${item.nombre}`)
                            .join(' • ')}
                        </p>
                      )}
                      {(plan.responsable_nombre || plan.responsable_accion_nombre) && (
                        <p className="text-xs text-slate-600 mt-1">👤 Responsable: {plan.responsable_nombre || plan.responsable_accion_nombre}</p>
                      )}
                      {(fechaInicio || fechaFin) && (
                        <p className="text-xs text-slate-600 mt-1">
                          📅 {fechaInicio ? `Del ${fechaInicio}` : ''} {fechaFin ? `al ${fechaFin}` : ''}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                        plan.estado === 'completada'
                          ? 'bg-emerald-100 text-emerald-800'
                          : plan.estado === 'en_curso'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {plan.estado ? plan.estado.replace(/_/g, ' ').toUpperCase() : 'PENDIENTE'}
                    </span>
                  </div>
                  {(plan.descripcion_accion || plan.descripcion) && (plan.descripcion_accion || plan.descripcion)?.trim() && (
                    <div className="rounded-lg border-l-4 border-l-emerald-500 border border-slate-200 bg-emerald-50 p-3">
                      <p className="text-sm font-medium text-slate-700 mb-1">📋 Descripción del Plan:</p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                        {plan.descripcion_accion || plan.descripcion}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-5 lg:items-end">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Avance (%)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={plan.avance ?? 0}
                          max={100}
                          disabled={estaAprobado || plan.estado === 'completada'}
                          value={avanceDrafts[String(plan.id)] ?? plan.avance ?? 0}
                          onChange={(event) => {
                            const nuevoValor = Number(event.target.value);
                            if (nuevoValor >= (plan.avance ?? 0)) {
                              setAvanceDrafts((prev) => ({
                                ...prev,
                                [String(plan.id)]: nuevoValor,
                              }));
                            }
                          }}
                          placeholder="0-100"
                          title={estaAprobado ? 'Plan aprobado - aguarde a completarlo' : plan.estado === 'completada' ? 'Plan completado' : 'Actualizar avance del plan (%)'}
                          aria-label="Avance del plan en porcentaje"
                          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                          type="button"
                          disabled={estaAprobado || plan.estado === 'completada' || procesandoIds[String(plan.id)]}
                          onClick={() => {
                            setProcesandoIds((prev) => ({ ...prev, [String(plan.id)]: true }));
                            actions.updateAvance.mutate(
                              {
                                id: plan.id as Id,
                                avance: avanceDrafts[String(plan.id)] ?? plan.avance ?? 0,
                              },
                              {
                                onSettled: () => {
                                  setProcesandoIds((prev) => ({ ...prev, [String(plan.id)]: false }));
                                },
                              }
                            );
                          }}
                          className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={estaAprobado || plan.estado === 'completada' ? 'Plan no editable' : 'Guardar'}
                        >
                          {procesandoIds[String(plan.id)] ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={estaAprobado || (plan.avance ?? 0) < 100 || procesandoIds[String(plan.id)] || plan.estado === 'completada'}
                      onClick={() => {
                        setProcesandoIds((prev) => ({ ...prev, [String(plan.id)]: true }));
                        actions.aprobar.mutate(plan.id as Id, {
                          onSettled: () => {
                            setProcesandoIds((prev) => ({ ...prev, [String(plan.id)]: false }));
                          },
                        });
                      }}
                      className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed h-fit"
                      title={estaAprobado ? 'Ya está aprobado' : plan.estado === 'completada' ? 'Plan completado' : (plan.avance ?? 0) < 100 ? 'Completar al 100% para aprobar' : 'Aprobar plan'}
                    >
                      {estaAprobado ? '✓ Aprobado' : procesandoIds[String(plan.id)] ? 'Aprobando...' : 'Aprobar'}
                    </button>

                    {estaAprobado && (
                      <div className="col-span-1 text-right lg:col-span-2">
                        <p className="text-xs text-emerald-700 font-medium">
                          ✓ Aprobado por {plan.aprobado_por_nombre || 'admin'}
                        </p>
                        {plan.fecha_aprobacion && (
                          <p className="text-xs text-slate-500">
                            {new Date(plan.fecha_aprobacion).toLocaleDateString('es-ES')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className="h-2 rounded-full bg-emerald-600 transition-all" style={{ width: `${Math.min(plan.avance ?? 0, 100)}%` }} />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-600">{Math.min(plan.avance ?? 0, 100)}% completado</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
