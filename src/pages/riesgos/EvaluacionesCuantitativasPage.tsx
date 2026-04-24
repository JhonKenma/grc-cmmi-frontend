import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/common';
import {
  useCreateEvaluacionCuantitativa,
  useDeleteEvaluacionCuantitativa,
  useEvaluacionesCuantitativasList,
  useRiesgosList,
} from '@/hooks/useRiesgosModule';
import type { CreateEvaluacionCuantitativaPayload, Id } from '@/types';

function computeAle(sle: number, aro: number): number {
  return Number((sle * aro).toFixed(2));
}

export function EvaluacionesCuantitativasPage() {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateEvaluacionCuantitativaPayload>({
    riesgo: '',
    fecha: new Date().toISOString().slice(0, 10),
    sle: 0,
    aro: 0,
    ale: 0,
    metodo_evaluacion: 'ale',
    observaciones: '',
  });

  const riesgosQuery = useRiesgosList({ page_size: 200 });
  const evaluacionesQuery = useEvaluacionesCuantitativasList();
  const createMutation = useCreateEvaluacionCuantitativa();
  const deleteMutation = useDeleteEvaluacionCuantitativa();

  const riesgosLookup = useMemo(() => {
    const map = new Map<string, string>();
    (riesgosQuery.data?.results ?? []).forEach((riesgo) => {
      map.set(String(riesgo.id), `${riesgo.codigo} - ${riesgo.titulo ?? riesgo.nombre}`);
    });
    return map;
  }, [riesgosQuery.data]);

  const alePreview = useMemo(() => computeAle(Number(formData.sle ?? 0), Number(formData.aro ?? 0)), [formData.sle, formData.aro]);

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
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cuantitativo</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Evaluaciones cuantitativas</h1>
          </div>
        </div>
      </section>

      <Card className="rounded-xl p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Evaluaciones cuantitativas</h2>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800"
          >
            Nueva evaluacion
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold mb-3">💡 Cómo calcular:</p>
          <ul className="space-y-2 list-disc list-inside text-xs">
            <li><strong>SLE</strong> = Pérdida monetaria si el riesgo ocurre UNA vez (ej: $50,000)</li>
            <li><strong>ARO</strong> = Veces que esperamos que ocurra al año (ej: 0.5 = cada 2 años)</li>
            <li><strong>ALE</strong> = SLE × ARO = Pérdida anual esperada (calculado automáticamente)</li>
          </ul>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
            <Card className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-indigo-700">Nuevo registro</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">Crear evaluacion cuantitativa</h3>
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
                  createMutation.mutate(
                    {
                      ...formData,
                      sle: Number(formData.sle ?? 0),
                      aro: Number(formData.aro ?? 0),
                      ale: alePreview,
                    },
                    {
                      onSuccess: () => {
                        setFormData({
                          riesgo: '',
                          fecha: new Date().toISOString().slice(0, 10),
                          sle: 0,
                          aro: 0,
                          ale: 0,
                          metodo_evaluacion: 'ale',
                          observaciones: '',
                        });
                        setShowCreateForm(false);
                      },
                    },
                  );
                }}
              >
                {/* Información Básica */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Información de la Evaluación</h3>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Riesgo <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={String(formData.riesgo)}
                        onChange={(event) => setFormData((prev) => ({ ...prev, riesgo: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
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
                      <label className="mb-2 block text-sm font-medium text-slate-600">Fecha de Evaluación</label>
                      <input
                        type="date"
                        value={formData.fecha}
                        onChange={(event) => setFormData((prev) => ({ ...prev, fecha: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Cálculo ALE */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="mb-4 font-semibold text-slate-900">Cálculo de Pérdida Anual Esperada</h3>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <label className="mb-2 block text-sm font-semibold text-blue-700">SLE (Single Loss Expectancy)</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={(formData.sle ?? 0) === 0 ? '' : formData.sle}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            sle: event.target.value === '' ? 0 : Number(event.target.value),
                          }))
                        }
                        placeholder="Ej: 50000"
                        title="Pérdida monetaria si el riesgo ocurre una sola vez"
                        className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                      />
                      <p className="mt-2 text-xs text-blue-700">Pérdida por evento</p>
                    </div>

                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                      <label className="mb-2 block text-sm font-semibold text-purple-700">ARO (Annual Rate of Occurrence)</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={(formData.aro ?? 0) === 0 ? '' : formData.aro}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            aro: event.target.value === '' ? 0 : Number(event.target.value),
                          }))
                        }
                        placeholder="Ej: 0.5"
                        title="Veces que esperamos que ocurra al año"
                        className="w-full rounded-lg border border-purple-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-purple-500"
                      />
                      <p className="mt-2 text-xs text-purple-700">Veces por año</p>
                    </div>

                    <div className="rounded-lg border-2 border-indigo-300 bg-indigo-50 p-4">
                      <label className="mb-2 block text-sm font-semibold text-indigo-700">ALE (Annual Loss Expectancy)</label>
                      <input
                        value={String(alePreview.toFixed(2))}
                        readOnly
                        title="Pérdida anual esperada = SLE × ARO"
                        className="w-full rounded-lg border border-indigo-400 bg-white px-3 py-2 text-sm font-bold text-indigo-900 outline-none"
                      />
                      <p className="mt-2 text-xs text-indigo-700">SLE × ARO</p>
                    </div>
                  </div>
                </div>

                {/* Método y Observaciones */}
                <div className="border-t border-slate-200 pt-6">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Método de Evaluación</label>
                      <select
                        value={String(formData.metodo_evaluacion ?? 'ale')}
                        onChange={(event) =>
                          setFormData((prev) => ({ ...prev, metodo_evaluacion: event.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
                      >
                        <option value="ale">ALE</option>
                        <option value="monte_carlo">Monte Carlo</option>
                        <option value="var">VaR</option>
                      </select>
                      <p className="mt-1 text-xs text-slate-500">Método de cálculo utilizado</p>
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                <div className="border-t border-slate-200 pt-6">
                  <label className="block text-sm font-medium text-slate-600 mb-2">Observaciones</label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(event) => setFormData((prev) => ({ ...prev, observaciones: event.target.value }))}
                    placeholder="Añade notas sobre la evaluación, supuestos utilizados o limitaciones..."
                    className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
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
                    className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800 disabled:opacity-60"
                  >
                    {createMutation.isPending ? 'Guardando...' : 'Crear evaluación'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </Card>

      <Card className="rounded-xl p-0">
        {evaluacionesQuery.isLoading ? (
          <div className="p-4 text-sm text-slate-600">Cargando evaluaciones...</div>
        ) : (evaluacionesQuery.data?.results.length ?? 0) === 0 ? (
          <div className="p-5 text-sm text-slate-600">No hay evaluaciones cuantitativas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Riesgo</th>
                  <th className="px-4 py-3">SLE</th>
                  <th className="px-4 py-3">ARO</th>
                  <th className="px-4 py-3">ALE</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(evaluacionesQuery.data?.results ?? []).map((item) => (
                  <tr key={String(item.id)} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-700">{item.fecha}</td>
                    <td className="px-4 py-3 text-slate-900">{item.riesgo_nombre ?? riesgosLookup.get(String(item.riesgo)) ?? item.riesgo}</td>
                    <td className="px-4 py-3 text-slate-700">{item.sle}</td>
                    <td className="px-4 py-3 text-slate-700">{item.aro}</td>
                    <td className="px-4 py-3 font-semibold text-indigo-700">{item.ale}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(item.id as Id)}
                        className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                      >
                        Eliminar
                      </button>
                    </td>
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
