import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { useConfiguracionRevision, useUpdateConfiguracionRevision } from '@/hooks/useMaestros';

export function ConfiguracionRevisionPage() {
  const navigate = useNavigate();
  const configQuery = useConfiguracionRevision();
  const updateMutation = useUpdateConfiguracionRevision();
  const [form, setForm] = useState({
    dias_critico: 90,
    dias_alto: 90,
    dias_medio: 180,
    dias_bajo: 360,
    dias_insignificante: 360,
  });

  useEffect(() => {
    if (configQuery.data) setForm(configQuery.data);
  }, [configQuery.data]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
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
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Configuración</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Configurar Revisión de Riesgos</h1>
            <p className="text-sm text-slate-500 mt-2">Define cada cuántos días se debe revisar cada nivel de riesgo.</p>
          </div>
        </div>
      </section>

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {[
          { key: 'dias_critico', label: 'CRÍTICO (Muy Alto)', color: 'text-red-600' },
          { key: 'dias_alto', label: 'ALTO', color: 'text-orange-600' },
          { key: 'dias_medio', label: 'MEDIO', color: 'text-yellow-600' },
          { key: 'dias_bajo', label: 'BAJO', color: 'text-green-600' },
          { key: 'dias_insignificante', label: 'INSIGNIFICANTE', color: 'text-gray-500' },
        ].map(({ key, label, color }) => (
          <div key={key} className="flex items-center justify-between px-6 py-4">
            <span className={`text-sm font-medium ${color}`}>
              Quiero revisar riesgos <strong>{label}</strong> cada
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={form[key as keyof typeof form]}
                onChange={(event) => setForm({ ...form, [key]: Number(event.target.value) })}
                className="w-24 rounded border border-gray-300 px-3 py-1.5 text-center text-sm"
              />
              <span className="text-sm text-gray-500">días.</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => updateMutation.mutate(form)}
        disabled={updateMutation.isPending}
        className="w-full rounded-lg bg-gray-800 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {updateMutation.isPending ? 'Guardando...' : 'Actualizar'}
      </button>
    </div>
  );
}
