import { useEffect, useMemo, useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card } from '@/components/common';
import {
  useControlesList,
  useCreateControl,
  useDeleteControl,
  useFrecuenciasControl,
  useTiposControl,
  useUpdateControl,
  useVincularControl,
} from '@/hooks/useMaestros';
import { useRiesgosList } from '@/hooks/useRiesgosModule';
import type { Control, CreateControlPayload, Id } from '@/types';

const getModoLabel = (modo: Control['modo']): string => {
  if (modo === 'semi_auto') return 'Semi-Auto';
  if (modo === 'automatico') return 'Automático';
  return 'Manual';
};

const initialForm = (): CreateControlPayload => ({
  nombre: '',
  descripcion: '',
  tipo: '',
  modo: 'manual',
  frecuencia: '',
  efectividad_diseno: 3,
  efectividad_operativa: 3,
  evidencia_requerida: '',
  estado: 'activo',
});

export function ControlesPage() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  const [tipoFilter, setTipoFilter] = useState('');
  const [linkControl, setLinkControl] = useState<Control | null>(null);
  const [riesgoId, setRiesgoId] = useState('');
  const [formData, setFormData] = useState<CreateControlPayload>(initialForm);

  const controlesQuery = useControlesList(tipoFilter ? { tipo: tipoFilter } : undefined);
  const tiposControlQuery = useTiposControl();
  const frecuenciasQuery = useFrecuenciasControl();
  const riesgosQuery = useRiesgosList({ page_size: 200 });
  const createMutation = useCreateControl();
  const updateMutation = useUpdateControl(selectedControl?.id ?? '');
  const deleteMutation = useDeleteControl();
  const vincularMutation = useVincularControl();

  const controles = useMemo(() => controlesQuery.data ?? [], [controlesQuery.data]);
  const riesgos = useMemo(() => riesgosQuery.data?.results ?? [], [riesgosQuery.data]);

  useEffect(() => {
    if (selectedControl) {
      setFormData({
        nombre: selectedControl.nombre,
        descripcion: selectedControl.descripcion ?? '',
        tipo: selectedControl.tipo ?? '',
        modo: selectedControl.modo,
        frecuencia: selectedControl.frecuencia ?? '',
        efectividad_diseno: selectedControl.efectividad_diseno,
        efectividad_operativa: selectedControl.efectividad_operativa,
        evidencia_requerida: selectedControl.evidencia_requerida ?? '',
        estado: selectedControl.estado,
      });
    }
  }, [selectedControl]);

  const openCreate = () => {
    setSelectedControl(null);
    setFormData(initialForm());
    setShowCreate(true);
  };

  const submitControl = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedControl) {
      updateMutation.mutate(formData, {
        onSuccess: () => {
          setShowCreate(false);
          setSelectedControl(null);
          setFormData(initialForm());
        },
      });
      return;
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        setShowCreate(false);
        setFormData(initialForm());
      },
    });
  };

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
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Biblioteca</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Biblioteca de Controles</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={openCreate}
              className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
            >
              + Nuevo Control
            </button>
          </div>
        </div>
      </section>

      <Card className="rounded-xl p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <select
            value={tipoFilter}
            onChange={(event) => setTipoFilter(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
          >
            <option value="">Todos los tipos</option>
            {tiposControlQuery.data?.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="rounded-xl p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Modo</th>
                <th className="px-4 py-3">Frecuencia</th>
                <th className="px-4 py-3">Efectividad Diseño</th>
                <th className="px-4 py-3">Efectividad Operativa</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {controles.map((control) => (
                <tr key={control.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{control.codigo}</td>
                  <td className="px-4 py-3 text-slate-900">{control.nombre}</td>
                  <td className="px-4 py-3 text-slate-700">{control.tipo_nombre ?? control.tipo ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-700">{getModoLabel(control.modo)}</td>
                  <td className="px-4 py-3 text-slate-700">{control.frecuencia_nombre ?? control.frecuencia ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="h-2.5 w-32 rounded-full bg-slate-200">
                      <div
                        className="h-2.5 rounded-full bg-cyan-600"
                        style={{ width: `${Math.min((control.efectividad_diseno / 5) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="mt-1 block text-xs text-slate-500">{control.efectividad_diseno}/5</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-2.5 w-32 rounded-full bg-slate-200">
                      <div
                        className="h-2.5 rounded-full bg-emerald-600"
                        style={{ width: `${Math.min((control.efectividad_operativa / 5) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="mt-1 block text-xs text-slate-500">{control.efectividad_operativa}/5</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${control.estado === 'activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                      {control.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedControl(control);
                          setShowCreate(true);
                        }}
                        className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLinkControl(control);
                          setRiesgoId('');
                          setShowLink(true);
                        }}
                        className="rounded border border-cyan-300 px-2 py-1 text-xs text-cyan-700 hover:bg-cyan-50"
                      >
                        Vincular
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(String(control.id))}
                        className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <Card className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-white p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-cyan-700">Control</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">{selectedControl ? 'Editar control' : 'Nuevo control'}</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCreate(false);
                  setSelectedControl(null);
                  setFormData(initialForm());
                }}
                className="text-slate-400 transition-colors hover:text-slate-700"
                aria-label="Cerrar formulario"
              >
                <X size={24} />
              </button>
            </div>

            <form className="space-y-5 p-5" onSubmit={submitControl}>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">Nombre</label>
                  <input
                    required
                    value={formData.nombre}
                    onChange={(event) => setFormData((prev) => ({ ...prev, nombre: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">Tipo</label>
                  <select
                    value={formData.tipo ?? ''}
                    onChange={(event) => setFormData((prev) => ({ ...prev, tipo: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                  >
                    <option value="">Seleccionar tipo...</option>
                    {tiposControlQuery.data?.map((tipo) => (
                      <option key={tipo.id} value={tipo.id} title={tipo.descripcion}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">Modo</label>
                  <select
                    value={formData.modo}
                    onChange={(event) => setFormData((prev) => ({ ...prev, modo: event.target.value as CreateControlPayload['modo'] }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                  >
                    <option value="manual">Manual</option>
                    <option value="semi_auto">Semi-Auto</option>
                    <option value="automatico">Automático</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">Frecuencia</label>
                  <select
                    value={formData.frecuencia ?? ''}
                    onChange={(event) => setFormData((prev) => ({ ...prev, frecuencia: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                  >
                    <option value="">Seleccionar frecuencia...</option>
                    {frecuenciasQuery.data?.map((frecuencia) => (
                      <option key={frecuencia.id} value={frecuencia.id} title={frecuencia.descripcion}>
                        {frecuencia.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">Efectividad Diseño</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.efectividad_diseno}
                    onChange={(event) => setFormData((prev) => ({ ...prev, efectividad_diseno: Number(event.target.value) }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">Efectividad Operativa</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.efectividad_operativa}
                    onChange={(event) => setFormData((prev) => ({ ...prev, efectividad_operativa: Number(event.target.value) }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">Estado</label>
                  <select
                    value={formData.estado ?? 'activo'}
                    onChange={(event) => setFormData((prev) => ({ ...prev, estado: event.target.value as CreateControlPayload['estado'] }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Descripción</label>
                <textarea
                  value={formData.descripcion ?? ''}
                  onChange={(event) => setFormData((prev) => ({ ...prev, descripcion: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                  rows={4}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Evidencia requerida</label>
                <textarea
                  value={formData.evidencia_requerida ?? ''}
                  onChange={(event) => setFormData((prev) => ({ ...prev, evidencia_requerida: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setSelectedControl(null);
                    setFormData(initialForm());
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-60"
                >
                  {selectedControl ? 'Guardar cambios' : 'Crear control'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showLink && linkControl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-cyan-700">Vinculación</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">Vincular control a riesgo</h3>
                <p className="mt-1 text-sm text-slate-500">{linkControl.nombre}</p>
              </div>
              <button type="button" onClick={() => setShowLink(false)} className="text-slate-400 transition-colors hover:text-slate-700" aria-label="Cerrar vínculo">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Riesgo</label>
                <select
                  value={riesgoId}
                  onChange={(event) => setRiesgoId(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                >
                  <option value="">Seleccionar riesgo...</option>
                  {riesgos.map((riesgo) => (
                    <option key={String(riesgo.id)} value={String(riesgo.id)}>
                      {riesgo.codigo} - {riesgo.titulo ?? riesgo.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button type="button" onClick={() => setShowLink(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!riesgoId || vincularMutation.isPending}
                  onClick={() =>
                    vincularMutation.mutate(
                      {
                        controlId: linkControl.id,
                        payload: { riesgo_id: riesgoId },
                      },
                      {
                        onSuccess: () => {
                          setShowLink(false);
                          setLinkControl(null);
                          setRiesgoId('');
                        },
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
