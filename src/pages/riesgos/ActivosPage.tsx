import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/common';
import {
  useActivosList,
  useCreateActivo,
  useDeleteActivo,
} from '@/hooks/useRiesgosModule';
import type { CreateActivoInformacionPayload, Id } from '@/types';

const ACTIVO_DESCRIPCION_MAX_LENGTH = 400;

export function ActivosPage() {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateActivoInformacionPayload>({
    codigo: '',
    nombre: '',
    tipo_activo: 'datos',
    descripcion: '',
    valor_economico: 0,
    criticidad: 'media',
    propietario: '',
  });

  const activosQuery = useActivosList();
  const createMutation = useCreateActivo();
  const deleteMutation = useDeleteActivo();

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
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inventario</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Activos de informacion</h1>
          </div>
        </div>
      </section>

      <Card className="rounded-xl p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Activos de informacion</h2>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
          >
            Crear activo
          </button>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
            <Card className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-white p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-cyan-700">Nuevo registro</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">Crear activo de informacion</h3>
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
                        codigo: '',
                        nombre: '',
                        tipo_activo: 'datos',
                        descripcion: '',
                        valor_economico: 0,
                        criticidad: 'media',
                        propietario: '',
                      });
                      setShowCreateForm(false);
                    },
                  });
                }}
              >
                {/* Información Básica */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Información del Activo</h3>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Código <span className="text-red-500">*</span></label>
                      <input
                        required
                        value={formData.codigo}
                        onChange={(event) => setFormData((prev) => ({ ...prev, codigo: event.target.value }))}
                        placeholder="Ej: ACT-001"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Nombre <span className="text-red-500">*</span></label>
                      <input
                        required
                        value={formData.nombre}
                        onChange={(event) => setFormData((prev) => ({ ...prev, nombre: event.target.value }))}
                        placeholder="Nombre del activo"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Tipo de activo</label>
                      <select
                        value={String(formData.tipo_activo ?? 'datos')}
                        onChange={(event) => setFormData((prev) => ({ ...prev, tipo_activo: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      >
                        <option value="datos">Datos</option>
                        <option value="software">Software</option>
                        <option value="hardware">Hardware</option>
                        <option value="servicio">Servicio</option>
                        <option value="proceso">Proceso</option>
                        <option value="persona">Persona</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Propietario</label>
                      <input
                        value={formData.propietario}
                        onChange={(event) => setFormData((prev) => ({ ...prev, propietario: event.target.value }))}
                        placeholder="Persona responsable"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Criticidad</label>
                      <select
                        value={formData.criticidad}
                        onChange={(event) => setFormData((prev) => ({ ...prev, criticidad: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Descripción y Valor */}
                <div className="border-t border-slate-200 pt-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-slate-600">Descripción</label>
                        <span className="text-xs text-slate-500">{formData.descripcion.length}/{ACTIVO_DESCRIPCION_MAX_LENGTH}</span>
                      </div>
                      <textarea
                        maxLength={ACTIVO_DESCRIPCION_MAX_LENGTH}
                        value={formData.descripcion}
                        onChange={(event) => setFormData((prev) => ({ ...prev, descripcion: event.target.value }))}
                        placeholder="Describe el activo de información..."
                        className="mt-2 min-h-[100px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      />
                      <p className="mt-1 text-xs text-slate-500">Máximo 400 caracteres</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Valor Económico (USD)</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={(formData.valor_economico ?? 0) === 0 ? '' : formData.valor_economico}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            valor_economico: event.target.value === '' ? 0 : Number(event.target.value),
                          }))
                        }
                        placeholder="Ej: 50000"
                        title="Valor monetario estimado del activo"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                      />
                      <p className="mt-1 text-xs text-slate-500">Valor estimado en dólares</p>
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
                    className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-60"
                  >
                    {createMutation.isPending ? 'Guardando...' : 'Crear activo'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </Card>

      <Card className="rounded-xl p-0">
        {activosQuery.isLoading ? (
          <div className="p-4 text-sm text-slate-600">Cargando activos...</div>
        ) : (activosQuery.data?.results.length ?? 0) === 0 ? (
          <div className="p-5 text-sm text-slate-600">No hay activos registrados.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {(activosQuery.data?.results ?? []).map((activo) => (
              <div key={String(activo.id)} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">{activo.codigo} - {activo.nombre}</p>
                  <p className="text-xs text-slate-600">{activo.criticidad} | Valor: {activo.valor_economico ?? 0}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(activo.id as Id)}
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
