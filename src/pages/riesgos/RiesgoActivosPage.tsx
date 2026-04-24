import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/common';
import {
  useActivosList,
  useCreateRiesgoActivo,
  useDeleteRiesgoActivo,
  useRiesgoActivosList,
  useRiesgosList,
} from '@/hooks/useRiesgosModule';
import type { CreateRiesgoActivoPayload, Id } from '@/types';

export function RiesgoActivosPage() {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateRiesgoActivoPayload>({
    riesgo: '',
    activo_informacion: '',
    tipo_afectacion: 'operacional',
    nivel_afectacion: 'medio',
    impacto_especifico: '',
  });

  const riesgosQuery = useRiesgosList({ page_size: 200 });
  const activosQuery = useActivosList({ page_size: 200 });
  const relacionesQuery = useRiesgoActivosList();
  const createMutation = useCreateRiesgoActivo();
  const deleteMutation = useDeleteRiesgoActivo();

  const riesgosLookup = useMemo(() => {
    const map = new Map<string, string>();
    (riesgosQuery.data?.results ?? []).forEach((riesgo) => {
      map.set(String(riesgo.id), `${riesgo.codigo} - ${riesgo.titulo ?? riesgo.nombre}`);
    });
    return map;
  }, [riesgosQuery.data]);

  const activosLookup = useMemo(() => {
    const map = new Map<string, string>();
    (activosQuery.data?.results ?? []).forEach((activo) => {
      map.set(String(activo.id), `${activo.codigo} - ${activo.nombre}`);
    });
    return map;
  }, [activosQuery.data]);

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
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trazabilidad</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Relacion riesgo-activo</h1>
          </div>
        </div>
      </section>

      <Card className="rounded-xl p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Relacion riesgo-activo</h2>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
          >
            Crear relacion
          </button>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
            <Card className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-rose-50 to-white p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-rose-700">Nuevo registro</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">Crear relacion riesgo-activo</h3>
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
                  createMutation.mutate(formData, {
                    onSuccess: () => {
                      setFormData({
                        riesgo: '',
                        activo_informacion: '',
                        tipo_afectacion: 'operacional',
                        nivel_afectacion: 'medio',
                        impacto_especifico: '',
                      });
                      setShowCreateForm(false);
                    },
                  });
                }}
              >
                {/* Selección de Riesgo y Activo */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Relación Riesgo - Activo</h3>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Riesgo <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={String(formData.riesgo)}
                        onChange={(event) => setFormData((prev) => ({ ...prev, riesgo: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-rose-400 focus:bg-white"
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
                      <label className="mb-2 block text-sm font-medium text-slate-600">Activo <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={String(formData.activo_informacion)}
                        onChange={(event) => setFormData((prev) => ({ ...prev, activo_informacion: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-rose-400 focus:bg-white"
                      >
                        <option value="">Seleccionar activo...</option>
                        {(activosQuery.data?.results ?? []).map((activo) => (
                          <option key={String(activo.id)} value={String(activo.id)}>
                            {activo.codigo} - {activo.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Tipo de afectación</label>
                      <select
                        value={String(formData.tipo_afectacion ?? 'operacional')}
                        onChange={(event) => setFormData((prev) => ({ ...prev, tipo_afectacion: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-rose-400 focus:bg-white"
                      >
                        <option value="operacional">Operacional</option>
                        <option value="confidencialidad">Confidencialidad</option>
                        <option value="integridad">Integridad</option>
                        <option value="disponibilidad">Disponibilidad</option>
                        <option value="financiera">Financiera</option>
                        <option value="legal">Legal</option>
                        <option value="reputacional">Reputacional</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Nivel de Afectación</label>
                      <select
                        value={String(formData.nivel_afectacion)}
                        onChange={(event) => setFormData((prev) => ({ ...prev, nivel_afectacion: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-rose-400 focus:bg-white"
                      >
                        <option value="bajo">Bajo</option>
                        <option value="medio">Medio</option>
                        <option value="alto">Alto</option>
                        <option value="critico">Crítico</option>
                      </select>
                      <p className="mt-1 text-xs text-slate-500">Impacto del riesgo sobre el activo</p>
                    </div>
                  </div>
                </div>

                {/* Justificación */}
                <div className="border-t border-slate-200 pt-6">
                  <label className="block text-sm font-medium text-slate-600 mb-2">Justificación</label>
                  <textarea
                    value={formData.impacto_especifico ?? ''}
                    onChange={(event) => setFormData((prev) => ({ ...prev, impacto_especifico: event.target.value }))}
                    placeholder="Describe cómo el riesgo afecta a este activo..."
                    className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-rose-400 focus:bg-white"
                  />
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
                    disabled={createMutation.isPending}
                    className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:opacity-60"
                  >
                    {createMutation.isPending ? 'Guardando...' : 'Crear relación'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </Card>

      <Card className="rounded-xl p-0">
        {relacionesQuery.isLoading ? (
          <div className="p-4 text-sm text-slate-600">Cargando relaciones...</div>
        ) : (relacionesQuery.data?.results.length ?? 0) === 0 ? (
          <div className="p-5 text-sm text-slate-600">No hay relaciones registradas.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {(relacionesQuery.data?.results ?? []).map((relacion) => (
              <div key={String(relacion.id)} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {relacion.riesgo_nombre ?? riesgosLookup.get(String(relacion.riesgo)) ?? `Riesgo ${String(relacion.riesgo).slice(0, 8)}`}
                    {' -> '}
                    {relacion.activo_nombre ?? activosLookup.get(String(relacion.activo)) ?? `Activo ${String(relacion.activo).slice(0, 8)}`}
                  </p>
                  <p className="text-xs text-slate-600">Nivel: {relacion.nivel_afectacion ?? '-'}</p>
                  <p className="text-xs text-slate-500">Tipo: {relacion.tipo_afectacion ?? '-'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(relacion.id as Id)}
                    className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
