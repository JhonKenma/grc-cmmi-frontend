import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/common';
import {
  useCategoriasRiesgoList,
  useCreateCategoriaRiesgo,
  useDeleteCategoriaRiesgo,
  useUpdateCategoriaRiesgo,
} from '@/hooks/useRiesgosModule';
import type { CreateCategoriaRiesgoPayload, Id } from '@/types';

export function CategoriasRiesgoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateCategoriaRiesgoPayload>({
    nombre: '',
    descripcion: '',
    activo: true,
  });

  const categoriasQuery = useCategoriasRiesgoList();
  const createMutation = useCreateCategoriaRiesgo();
  const updateMutation = useUpdateCategoriaRiesgo();
  const deleteMutation = useDeleteCategoriaRiesgo();

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
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Catalogo</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Categorias de riesgo</h1>
          </div>
        </div>
      </section>

      <Card className="rounded-xl p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Categorias de riesgo</h2>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800"
          >
            Crear categoria
          </button>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
            <Card className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-white p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-amber-700">Nuevo registro</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">Crear categoria</h3>
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
                  createMutation.mutate({
                    ...formData,
                    empresa: user?.empresa ?? undefined,
                  }, {
                    onSuccess: () => {
                      setFormData({ nombre: '', descripcion: '', activo: true });
                      setShowCreateForm(false);
                    },
                  });
                }}
              >
                {/* Información Básica */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Información de la Categoría</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-amber-700">Nombre de la Categoría <span className="text-red-500">*</span></label>
                      <input
                        required
                        value={formData.nombre}
                        onChange={(event) => setFormData((prev) => ({ ...prev, nombre: event.target.value }))}
                        placeholder="Ej: Riesgos Operacionales"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-amber-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Descripción</label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(event) => setFormData((prev) => ({ ...prev, descripcion: event.target.value }))}
                        placeholder="Define qué riesgos se clasifican en esta categoría..."
                        className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-amber-400 focus:bg-white"
                      />
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
                    className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:opacity-60"
                  >
                    {createMutation.isPending ? 'Guardando...' : 'Crear categoría'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </Card>

      <Card className="rounded-xl p-0">
        {categoriasQuery.isLoading ? (
          <div className="p-4 text-sm text-slate-600">Cargando categorias...</div>
        ) : (categoriasQuery.data?.results.length ?? 0) === 0 ? (
          <div className="p-5 text-sm text-slate-600">No hay categorias registradas.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {(categoriasQuery.data?.results ?? []).map((categoria) => (
              <div key={String(categoria.id)} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">{categoria.nombre}</p>
                  <p className="text-xs text-slate-600">{categoria.descripcion || 'Sin descripcion'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateMutation.mutate({ id: categoria.id as Id, payload: { activo: !categoria.activo } })}
                    className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                  >
                    {categoria.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(categoria.id as Id)}
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
