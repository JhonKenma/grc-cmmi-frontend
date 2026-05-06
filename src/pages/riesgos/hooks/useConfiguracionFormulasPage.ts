import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { configuracionFormulasApi } from '@/api/endpoints/riesgos.api';
import type { ConfiguracionFormulas } from '@/types';

const createDefaultConfig = (): ConfiguracionFormulas => ({
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

export const useConfiguracionFormulasPage = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<ConfiguracionFormulas>(createDefaultConfig());

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

  return {
    navigate,
    config,
    setConfig,
    configQuery,
    saveMutation,
    sumaPonderaciones,
    esValido,
    handleGuardar,
  } as const;
};
