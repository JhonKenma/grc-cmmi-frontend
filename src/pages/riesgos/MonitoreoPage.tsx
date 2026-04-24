import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/common';
import {
  useCreateRegistroMonitoreo,
  useRegistroMonitoreoList,
  useRiesgosList,
} from '@/hooks/useRiesgosModule';
import type { CreateRegistroMonitoreoPayload } from '@/types';

export function MonitoreoPage() {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateRegistroMonitoreoPayload>({
    riesgo: '',
    fecha: new Date().toISOString().slice(0, 10),
    estado: 'sin_cambios',
    comentario: '',
    alerta: false,
  });

  const riesgosQuery = useRiesgosList({ page_size: 200 });
  const monitoreoQuery = useRegistroMonitoreoList();
  const createMutation = useCreateRegistroMonitoreo();

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
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Seguimiento</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Registro de monitoreo</h1>
          </div>
        </div>
      </section>

      <Card className="rounded-xl p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Registro de monitoreo</h2>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-800"
          >
            Registrar monitoreo
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-pink-200 bg-pink-50 p-4 text-sm text-pink-800">
          <p className="font-semibold mb-3">📊 Estados de monitoreo:</p>
          <ul className="space-y-2 list-disc list-inside text-xs">
            <li><strong>Sin cambios</strong> = Mismo nivel que el mes anterior ✔️</li>
            <li><strong>Mejora</strong> = Riesgo disminuyó o plan está en progreso 📈</li>
            <li><strong>Deterioro</strong> = Riesgo aumentó, requiere acción inmediata ⚠️</li>
            <li><strong>Materializado</strong> = El riesgo ya ocurrió 🔴</li>
          </ul>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
            <Card className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-white p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-violet-700">Nuevo registro</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">Registrar monitoreo</h3>
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
                      setFormData((prev) => ({ ...prev, comentario: '', alerta: false }));
                      setShowCreateForm(false);
                    },
                  });
                }}
              >
                {/* Información Básica */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Información del Monitoreo</h3>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Riesgo <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={String(formData.riesgo)}
                        onChange={(event) => setFormData((prev) => ({ ...prev, riesgo: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-violet-400 focus:bg-white"
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
                      <label className="mb-2 block text-sm font-medium text-slate-600">Fecha de Monitoreo</label>
                      <input
                        type="date"
                        value={formData.fecha}
                        onChange={(event) => setFormData((prev) => ({ ...prev, fecha: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-violet-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Estado del Riesgo</label>
                      <select
                        value={formData.estado}
                        onChange={(event) => setFormData((prev) => ({ ...prev, estado: event.target.value }))}
                        title="Cómo cambió el riesgo desde el monitoreo anterior"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-violet-400 focus:bg-white"
                      >
                        <option value="sin_cambios">Sin cambios ✔</option>
                        <option value="mejora">Mejora 📈</option>
                        <option value="deterioro">Deterioro ⚠</option>
                        <option value="materializado">Materializado 🔴</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-100 transition" title="Marcar si requiere atención urgente">
                        <input
                          type="checkbox"
                          checked={Boolean(formData.alerta)}
                          onChange={(event) => setFormData((prev) => ({ ...prev, alerta: event.target.checked }))}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span>Genera alerta 🚨</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Comentarios */}
                <div className="border-t border-slate-200 pt-6">
                  <label className="block text-sm font-medium text-slate-600 mb-2">Comentarios y Observaciones</label>
                  <textarea
                    value={formData.comentario}
                    onChange={(event) => setFormData((prev) => ({ ...prev, comentario: event.target.value }))}
                    placeholder="Describe el estado actual del riesgo, avance del plan, cambios significativos, próxima revisión, etc."
                    className="w-full min-h-[120px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-violet-400 focus:bg-white"
                  />
                  <p className="mt-2 text-xs text-slate-500">Ej: Plan avanzó 40%, se completó fase 1. Indicadores verdes. Próxima revisión en mayo 2026.</p>
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
                    className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:opacity-60"
                  >
                    {createMutation.isPending ? 'Guardando...' : 'Registrar monitoreo'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </Card>

      <Card className="rounded-xl p-0">
        {monitoreoQuery.isLoading ? (
          <div className="p-4 text-sm text-slate-600">Cargando monitoreo...</div>
        ) : (monitoreoQuery.data?.results.length ?? 0) === 0 ? (
          <div className="p-5 text-sm text-slate-600">No hay registros de monitoreo.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Riesgo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Comentario</th>
                  <th className="px-4 py-3">Alerta</th>
                </tr>
              </thead>
              <tbody>
                {(monitoreoQuery.data?.results ?? []).map((item) => (
                  <tr key={String(item.id)} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-700">{item.fecha}</td>
                    <td className="px-4 py-3 text-slate-900">{item.riesgo_nombre ?? riesgosLookup.get(String(item.riesgo)) ?? item.riesgo}</td>
                    <td className="px-4 py-3 text-slate-700">{item.estado ?? '-'}</td>
                    <td className="max-w-[420px] px-4 py-3 text-slate-700">{item.comentario ?? '-'}</td>
                    <td className="px-4 py-3">{item.alerta ? 'Si' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
