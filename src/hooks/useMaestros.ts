import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  activosPlanApi,
  causasRiesgoApi,
  configuracionRevisionApi,
  controlesApi,
  frecuenciasControlApi,
  naturalezasConsecuenciaApi,
  tiposActivoRemediacionApi,
  tiposControlApi,
  tiposRiesgoApi,
  tiposTratamientoApi,
  unidadesPerdidaApi,
} from '@/api/endpoints/riesgos.api';
import type { ActivoPlan, ConfiguracionRevision, CreateControlPayload, RiesgoControl } from '@/types';

export const useTiposRiesgo = () =>
  useQuery({ queryKey: ['tipos-riesgo'], queryFn: tiposRiesgoApi.list, staleTime: Infinity });

export const useCausasRiesgo = () =>
  useQuery({ queryKey: ['causas-riesgo'], queryFn: causasRiesgoApi.list, staleTime: Infinity });

export const useNaturalezasConsecuencia = () =>
  useQuery({ queryKey: ['naturalezas-consecuencia'], queryFn: naturalezasConsecuenciaApi.list, staleTime: Infinity });

export const useTiposTratamiento = () =>
  useQuery({ queryKey: ['tipos-tratamiento'], queryFn: tiposTratamientoApi.list, staleTime: Infinity });

export const useTiposControl = () =>
  useQuery({ queryKey: ['tipos-control'], queryFn: tiposControlApi.list, staleTime: Infinity });

export const useFrecuenciasControl = () =>
  useQuery({ queryKey: ['frecuencias-control'], queryFn: frecuenciasControlApi.list, staleTime: Infinity });

export const useUnidadesPerdida = () =>
  useQuery({ queryKey: ['unidades-perdida'], queryFn: unidadesPerdidaApi.list, staleTime: Infinity });

export const useTiposActivoRemediacion = () =>
  useQuery({ queryKey: ['tipos-activo-remediacion'], queryFn: tiposActivoRemediacionApi.list, staleTime: Infinity });

export const useConfiguracionRevision = () =>
  useQuery<ConfiguracionRevision>({ queryKey: ['configuracion-revision'], queryFn: configuracionRevisionApi.get });

export const useUpdateConfiguracionRevision = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: configuracionRevisionApi.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['configuracion-revision'] });
      toast.success('Configuración actualizada');
    },
  });
};

export const useControlesList = (filters?: { tipo?: string }) =>
  useQuery({ queryKey: ['controles', filters], queryFn: () => controlesApi.list(filters) });

export const useCreateControl = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: controlesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['controles'] });
      toast.success('Control creado');
    },
  });
};

export const useUpdateControl = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateControlPayload>) => controlesApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['controles'] });
      toast.success('Control actualizado');
    },
  });
};

export const useDeleteControl = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: controlesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['controles'] });
      toast.success('Control eliminado');
    },
  });
};

export const useVincularControl = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ controlId, payload }: { controlId: string; payload: { riesgo_id: string; efectividad_diseno?: number; efectividad_operativa?: number; notas?: string } }) =>
      controlesApi.vincularRiesgo(controlId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['riesgo-controles', variables.payload.riesgo_id] });
      toast.success('Control vinculado al riesgo');
    },
  });
};

export const useDesvincularControl = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ controlId, riesgoId }: { controlId: string; riesgoId: string }) =>
      controlesApi.desvincularRiesgo(controlId, riesgoId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['riesgo-controles', variables.riesgoId] });
      toast.success('Control desvinculado');
    },
  });
};

export const useControlesDeRiesgo = (riesgoId: string | undefined) =>
  useQuery<RiesgoControl[]>({
    queryKey: ['riesgo-controles', riesgoId],
    queryFn: () => controlesApi.getControlesRiesgo(riesgoId!),
    enabled: !!riesgoId,
  });

export const useActivosPlan = (planId: string | undefined) =>
  useQuery<ActivoPlan[]>({
    queryKey: ['activos-plan', planId],
    queryFn: () => activosPlanApi.list(planId!),
    enabled: !!planId,
  });

export const useCreateActivoPlan = (planId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<ActivoPlan, 'id' | 'plan'>) => activosPlanApi.create(planId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activos-plan', planId] });
      qc.invalidateQueries({ queryKey: ['planes-list'] });
      toast.success('Activo agregado al plan');
    },
  });
};
