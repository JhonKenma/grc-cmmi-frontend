import React, { useEffect, useState } from 'react';
import { Info, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useMutation, useQuery } from '@tanstack/react-query';

import { configuracionFormulasApi } from '@/api/endpoints/riesgos.api';
import type { ConfiguracionFormulas } from '@/types';

export const ConfiguracionFormulasPage: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<ConfiguracionFormulas>({
    id: '',
    peso_impacto_financiero: 0.4,
    peso_impacto_operacional: 0.35,
    peso_impacto_reputacional: 0.25,
    apetito_riesgo_nrc: 8,
    ale_umbral_alto: 100000,
    ale_umbral_medio: 20000,
    sle_umbral_alto: 500000,
    sle_umbral_medio: 100000,
  });

  const configQuery = useQuery({
    queryKey: ['riesgos-configuracion-formulas'],
    queryFn: configuracionFormulasApi.getActiva,
  });

  useEffect(() => {
    if (!configQuery.data) return;
    setConfig(configQuery.data);
  }, [configQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (payload: ConfiguracionFormulas) =>
      configuracionFormulasApi.update(payload.id, {
        peso_impacto_financiero: payload.peso_impacto_financiero,
        peso_impacto_operacional: payload.peso_impacto_operacional,
        peso_impacto_reputacional: payload.peso_impacto_reputacional,
        apetito_riesgo_nrc: payload.apetito_riesgo_nrc,
        ale_umbral_alto: payload.ale_umbral_alto,
        ale_umbral_medio: payload.ale_umbral_medio,
        sle_umbral_alto: payload.sle_umbral_alto,
        sle_umbral_medio: payload.sle_umbral_medio,
      }),
    onSuccess: (saved) => {
      setConfig(saved);
      toast.success('Configuración guardada correctamente');
    },
    onError: () => {
      toast.error('Error al guardar la configuración');
    },
  });

  const sumaPonderaciones = 
    Number(config.peso_impacto_financiero) +
    Number(config.peso_impacto_operacional) +
    Number(config.peso_impacto_reputacional);

  const esValido = Math.abs(sumaPonderaciones - 1.0) < 0.01;

  const handleGuardar = async () => {
    if (!esValido) {
      toast.error('Las ponderaciones deben sumar exactamente 1.00');
      return;
    }
    if (!config.id) {
      toast.error('No se pudo identificar la configuración activa.');
      return;
    }

    await saveMutation.mutateAsync(config);
  };

  if (configQuery.isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4">Cargando configuración...</div>;
  }

  if (configQuery.isError) {
    return <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">No se pudo cargar la configuración de fórmulas.</div>;
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
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
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Configuración de Fórmulas</h1>
            <p className="text-slate-500 mt-2 text-sm">Ajusta los parámetros de las fórmulas cuantitativas del módulo ERM.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGuardar}
              disabled={saveMutation.isPending || !esValido}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Save size={18} />
              {saveMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </section>

      {/* F3: NRC Ponderado */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <span className="text-blue-700 font-bold text-sm">F3</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">NRC — Nivel de Riesgo Ponderado</h2>
            <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block mt-1">
              NRC = P × (IF×wF + IO×wO + IR×wR)
            </code>
            <p className="text-sm text-gray-600 mt-2">Marco: COSO ERM 2017 / ISO 31000 — Escala 1 a 25</p>
          </div>
        </div>

        <h3 className="font-medium text-gray-700 mb-3">Ponderaciones (deben sumar 1.00)</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { key: 'peso_impacto_financiero', label: 'wF — Peso Financiero', color: 'red' },
            { key: 'peso_impacto_operacional', label: 'wO — Peso Operacional', color: 'orange' },
            { key: 'peso_impacto_reputacional', label: 'wR — Peso Reputacional', color: 'purple' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={config[key as keyof ConfiguracionFormulas]}
                onChange={(e) => setConfig(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
        
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          esValido ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <span className="text-sm font-medium">
            Suma actual: <strong>{sumaPonderaciones.toFixed(2)}</strong>
            {esValido ? ' ✓ Correcto' : ' ✗ Debe ser 1.00'}
          </span>
        </div>
      </div>

      {/* F4: Apetito de Riesgo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <span className="text-orange-700 font-bold text-sm">F4</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Apetito de Riesgo — Riesgo Residual</h2>
            <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block mt-1">
              R_Residual = R_Inherente × (1 − Efectividad_Control)
            </code>
            <p className="text-sm text-gray-600 mt-2">Marco: COSO ERM 2017 / NIST RMF / ISO 27001</p>
          </div>
        </div>
        
        <div className="max-w-xs">
          <label className="text-sm font-medium text-gray-700">
            Apetito Máximo Aceptable (NRC 1-25)
          </label>
          <div className="flex items-center gap-3 mt-2">
            <input
              type="number"
              min="1"
              max="25"
              step="0.5"
              value={config.apetito_riesgo_nrc}
              onChange={(e) => setConfig(prev => ({ ...prev, apetito_riesgo_nrc: parseFloat(e.target.value) || 5 }))}
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              Riesgos con NRC &gt; {config.apetito_riesgo_nrc} requieren tratamiento urgente
            </span>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>1 (Bajo)</span><span>25 (Crítico)</span>
            </div>
            <div className="relative h-4 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-yellow-400 to-red-600" />
              <div
                className="absolute top-0 w-1 h-full bg-black"
                style={{ left: `${((config.apetito_riesgo_nrc - 1) / 24) * 100}%` }}
              />
            </div>
            <div className="text-xs text-center mt-1 text-gray-600">
              Umbral: NRC = {config.apetito_riesgo_nrc}
            </div>
          </div>
        </div>
      </div>

      {/* F1: ALE Umbrales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <span className="text-green-700 font-bold text-sm">F1</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">ALE — Annual Loss Expectancy</h2>
            <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block mt-1">
              ALE = ARO × SLE
            </code>
            <p className="text-sm text-gray-600 mt-2">Marco: NIST SP 800-30</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Umbral ALTO (USD)</label>
            <p className="text-xs text-gray-500 mb-2">ALE ≥ este valor = ALTO</p>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={config.ale_umbral_alto}
                onChange={(e) => setConfig(prev => ({ ...prev, ale_umbral_alto: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-7 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Umbral MEDIO (USD)</label>
            <p className="text-xs text-gray-500 mb-2">ALE ≥ este valor = MEDIO (por debajo = BAJO)</p>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={config.ale_umbral_medio}
                onChange={(e) => setConfig(prev => ({ ...prev, ale_umbral_medio: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-7 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* F2: SLE Umbrales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <span className="text-purple-700 font-bold text-sm">F2</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">SLE — Single Loss Expectancy</h2>
            <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block mt-1">
              SLE = AV × EF
            </code>
            <p className="text-sm text-gray-600 mt-2">Marco: NIST SP 800-30 / ISO 27005</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Umbral ALTO (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={config.sle_umbral_alto}
                onChange={(e) => setConfig(prev => ({ ...prev, sle_umbral_alto: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-7 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Umbral MEDIO (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={config.sle_umbral_medio}
                onChange={(e) => setConfig(prev => ({ ...prev, sle_umbral_medio: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-7 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <strong>Los registros base son precargados por el sistema.</strong> Tu empresa puede personalizar estos valores según su apetito de riesgo y políticas internas.
        </div>
      </div>
    </div>
  );
};
