import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/common';
import {
  useCreateKri,
  useDeleteKri,
  useKrisList,
  useRegistrarMedicionKri,
  useRiesgosList,
} from '@/hooks/useRiesgosModule';
import type { CreateKRIPayload, Id } from '@/types';

export function KrisPage() {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateKRIPayload>({
    riesgo: '',
    nombre: '',
    descripcion: '',
    unidad_medida: '%',
    umbral_verde: 5,
    umbral_amarillo: 10,
    umbral_rojo: 15,
    frecuencia: 'mensual',
  });

  const [mediciones, setMediciones] = useState<Record<string, string>>({});

  const riesgosQuery = useRiesgosList({ page_size: 200 });
  const krisQuery = useKrisList();
  const createMutation = useCreateKri();
  const deleteMutation = useDeleteKri();
  const registrarMutation = useRegistrarMedicionKri();

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
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Indicadores</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">KRIs y medicion</h1>
          </div>
        </div>
      </section>

      <Card className="rounded-xl p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">KRIs y medicion</h2>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800"
          >
            Crear KRI
          </button>
        </div>
        
        <div className="mt-6 rounded-lg border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-800">
          <p className="font-semibold mb-3">🎯 Definir umbrales de alerta:</p>
          <ul className="space-y-2 list-disc list-inside text-xs">
            <li><strong>Umbral Verde</strong> = Todo está dentro de lo normal (✅ Seguro)</li>
            <li><strong>Umbral Amarillo</strong> = Se acerca al límite, revisar (⚠️ Alerta)</li>
            <li><strong>Umbral Rojo</strong> = Acción inmediata requerida (🔴 Crítico)</li>
          </ul>
          <p className="mt-3 text-xs italic">Ej: Disponibilidad: Verde=99.5%, Amarillo=99%, Rojo=98%</p>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
            <Card className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-sky-50 to-white p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-sky-700">Nuevo registro</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">Crear KRI</h3>
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
                        nombre: '',
                        descripcion: '',
                        unidad_medida: '%',
                        umbral_verde: 5,
                        umbral_amarillo: 10,
                        umbral_rojo: 15,
                        frecuencia: 'mensual',
                      });
                      setShowCreateForm(false);
                    },
                  });
                }}
              >
                {/* Información Básica */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Información del KRI</h3>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Riesgo Asociado <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={String(formData.riesgo)}
                        onChange={(event) => setFormData((prev) => ({ ...prev, riesgo: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
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
                      <label className="mb-2 block text-sm font-medium text-slate-600">Nombre del KRI <span className="text-red-500">*</span></label>
                      <input
                        required
                        value={formData.nombre}
                        onChange={(event) => setFormData((prev) => ({ ...prev, nombre: event.target.value }))}
                        placeholder="Ej: Disponibilidad del sistema"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Unidad de Medida</label>
                      <input
                        value={formData.unidad_medida}
                        onChange={(event) => setFormData((prev) => ({ ...prev, unidad_medida: event.target.value }))}
                        placeholder="Ej: %, ms, #"
                        title="Unidad de medida del KRI"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                      />
                      <p className="mt-1 text-xs text-slate-500">Porcentaje, milisegundos, cantidad, etc.</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Frecuencia de Medición</label>
                      <input
                        value={formData.frecuencia}
                        onChange={(event) => setFormData((prev) => ({ ...prev, frecuencia: event.target.value }))}
                        placeholder="Ej: mensual"
                        title="Frecuencia: diaria, semanal, mensual, trimestral"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                      />
                      <p className="mt-1 text-xs text-slate-500">Cada cuánto se mide</p>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="border-t border-slate-200 pt-6">
                  <label className="block text-sm font-medium text-slate-600 mb-2">Descripción del KRI</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(event) => setFormData((prev) => ({ ...prev, descripcion: event.target.value }))}
                    placeholder="Define qué mide este indicador y por qué es importante..."
                    className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                  />
                </div>

                {/* Umbrales de Alerta */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="mb-4 font-semibold text-slate-900">Umbrales de Alerta</h3>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                      <label className="mb-2 block text-sm font-semibold text-green-700">✅ Verde (Normal)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.umbral_verde ?? 0}
                        onChange={(event) => setFormData((prev) => ({ ...prev, umbral_verde: Number(event.target.value) }))}
                        placeholder="Ej: 99.5"
                        title="Valor máximo seguro para el KRI"
                        className="w-full rounded-lg border border-green-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-green-500"
                      />
                      <p className="mt-2 text-xs text-green-700">Todo está bajo control ✅</p>
                    </div>
                    <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                      <label className="mb-2 block text-sm font-semibold text-yellow-700">⚠ Amarillo (Alerta)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.umbral_amarillo ?? 0}
                        onChange={(event) => setFormData((prev) => ({ ...prev, umbral_amarillo: Number(event.target.value) }))}
                        placeholder="Ej: 99"
                        title="Valor de precaución"
                        className="w-full rounded-lg border border-yellow-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-yellow-500"
                      />
                      <p className="mt-2 text-xs text-yellow-700">Revisar tendencia ⚠</p>
                    </div>
                    <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                      <label className="mb-2 block text-sm font-semibold text-red-700">🔴 Rojo (Crítico)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.umbral_rojo ?? 0}
                        onChange={(event) => setFormData((prev) => ({ ...prev, umbral_rojo: Number(event.target.value) }))}
                        placeholder="Ej: 98"
                        title="Valor crítico, acción inmediata"
                        className="w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-500"
                      />
                      <p className="mt-2 text-xs text-red-700">Acción inmediata 🔴</p>
                    </div>
                  </div>
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
                    className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:opacity-60"
                  >
                    {createMutation.isPending ? 'Guardando...' : 'Crear KRI'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </Card>

      <Card className="rounded-xl p-0">
        {krisQuery.isLoading ? (
          <div className="p-4 text-sm text-slate-600">Cargando KRIs...</div>
        ) : (krisQuery.data?.results.length ?? 0) === 0 ? (
          <div className="p-5 text-sm text-slate-600">No hay KRIs registrados.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {(krisQuery.data?.results ?? []).map((kri) => (
              <div key={String(kri.id)} className="p-4">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-5 lg:items-center">
                  <div className="lg:col-span-2">
                    <p className="text-base font-semibold text-slate-900">{kri.nombre}</p>
                    <p className="text-xs text-slate-500">Riesgo: {kri.riesgo_nombre ?? kri.riesgo}</p>
                  </div>

                  <div className="text-xs text-slate-600">Valor actual: {kri.valor_actual ?? '-'}</div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={mediciones[String(kri.id)] ?? ''}
                      onChange={(event) => setMediciones((prev) => ({ ...prev, [String(kri.id)]: event.target.value }))}
                      placeholder="Valor medido"
                      title="Ingresa la medición actual del indicador"
                      aria-label="Valor de medicion del KRI"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const value = Number(mediciones[String(kri.id)]);
                        if (!Number.isNaN(value)) {
                          registrarMutation.mutate({ id: kri.id as Id, payload: { valor: value } });
                        }
                      }}
                      className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 transition hover:bg-sky-100"
                    >
                      Medir
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(kri.id as Id)}
                      className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
