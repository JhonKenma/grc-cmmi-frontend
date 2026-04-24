import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { ApiRequestError, riesgosApi } from '@/api/endpoints/riesgos.api';
import type {
  ActivoInformacionFilter,
  CategoriaRiesgoFilter,
  CreateActivoInformacionPayload,
  CreateCategoriaRiesgoPayload,
  CreateEvaluacionCuantitativaPayload,
  CreateKRIPayload,
  CreatePlanTratamientoPayload,
  CreateRegistroMonitoreoPayload,
  CreateRiesgoActivoPayload,
  CreateRiesgoPayload,
  EvaluacionCuantitativaFilter,
  Id,
  KRIFilter,
  PlanTratamientoFilter,
  RegistrarMedicionKRIPayload,
  RegistroMonitoreoFilter,
  RiesgoActivoFilter,
  RiesgoFilter,
  UpdateActivoInformacionPayload,
  UpdateCategoriaRiesgoPayload,
  UpdateEvaluacionCuantitativaPayload,
  UpdateKRIPayload,
  UpdatePlanTratamientoPayload,
  UpdateRegistroMonitoreoPayload,
  UpdateRiesgoActivoPayload,
  UpdateRiesgoPayload,
} from '@/types';

const asMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
};

export const riesgosKeys = {
  all: ['riesgos-module'] as const,
  dashboard: () => [...riesgosKeys.all, 'dashboard'] as const,
  heatmap: () => [...riesgosKeys.all, 'heatmap'] as const,

  categorias: ['riesgos-module', 'categorias'] as const,
  categoriasList: (filters?: CategoriaRiesgoFilter) => [...riesgosKeys.categorias, 'list', filters] as const,
  categoriaDetail: (id: Id) => [...riesgosKeys.categorias, 'detail', id] as const,

  riesgos: ['riesgos-module', 'riesgos'] as const,
  riesgosList: (filters?: RiesgoFilter) => [...riesgosKeys.riesgos, 'list', filters] as const,
  riesgoDetail: (id: Id) => [...riesgosKeys.riesgos, 'detail', id] as const,

  planes: ['riesgos-module', 'planes-tratamiento'] as const,
  planesList: (filters?: PlanTratamientoFilter) => [...riesgosKeys.planes, 'list', filters] as const,
  planDetail: (id: Id) => [...riesgosKeys.planes, 'detail', id] as const,

  kris: ['riesgos-module', 'kris'] as const,
  krisList: (filters?: KRIFilter) => [...riesgosKeys.kris, 'list', filters] as const,
  kriDetail: (id: Id) => [...riesgosKeys.kris, 'detail', id] as const,

  monitoreo: ['riesgos-module', 'registro-monitoreo'] as const,
  monitoreoList: (filters?: RegistroMonitoreoFilter) => [...riesgosKeys.monitoreo, 'list', filters] as const,
  monitoreoDetail: (id: Id) => [...riesgosKeys.monitoreo, 'detail', id] as const,

  activos: ['riesgos-module', 'activos'] as const,
  activosList: (filters?: ActivoInformacionFilter) => [...riesgosKeys.activos, 'list', filters] as const,
  activoDetail: (id: Id) => [...riesgosKeys.activos, 'detail', id] as const,

  riesgoActivos: ['riesgos-module', 'riesgo-activos'] as const,
  riesgoActivosList: (filters?: RiesgoActivoFilter) => [...riesgosKeys.riesgoActivos, 'list', filters] as const,
  riesgoActivoDetail: (id: Id) => [...riesgosKeys.riesgoActivos, 'detail', id] as const,

  evaluacionesCuantitativas: ['riesgos-module', 'evaluaciones-cuantitativas'] as const,
  evaluacionesCuantitativasList: (filters?: EvaluacionCuantitativaFilter) =>
    [...riesgosKeys.evaluacionesCuantitativas, 'list', filters] as const,
  evaluacionCuantitativaDetail: (id: Id) => [...riesgosKeys.evaluacionesCuantitativas, 'detail', id] as const,
};

const useMutationToast = <TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
  options: {
    successMessage: string;
    errorMessage: string;
    invalidateKeys: ReadonlyArray<readonly unknown[]>;
  }
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      options.invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      toast.success(options.successMessage);
    },
    onError: (error) => {
      toast.error(asMessage(error, options.errorMessage));
    },
  });
};

// Dashboard
export const useRiesgosDashboard = (filters?: RiesgoFilter) =>
  useQuery({
    queryKey: [...riesgosKeys.dashboard(), filters],
    queryFn: () => riesgosApi.getDashboard(filters),
    placeholderData: keepPreviousData,
  });

export const useRiesgosHeatmap = (filters?: RiesgoFilter) =>
  useQuery({
    queryKey: [...riesgosKeys.heatmap(), filters],
    queryFn: () => riesgosApi.getMapaCalor(filters),
    placeholderData: keepPreviousData,
  });

// Categorias
export const useCategoriasRiesgoList = (filters?: CategoriaRiesgoFilter) =>
  useQuery({
    queryKey: riesgosKeys.categoriasList(filters),
    queryFn: () => riesgosApi.listCategorias(filters),
  });

export const useCategoriaRiesgoDetail = (id: Id) =>
  useQuery({
    queryKey: riesgosKeys.categoriaDetail(id),
    queryFn: () => riesgosApi.getCategoria(id),
    enabled: Boolean(id),
  });

export const useCreateCategoriaRiesgo = () =>
  useMutationToast((payload: CreateCategoriaRiesgoPayload) => riesgosApi.createCategoria(payload), {
    successMessage: 'Categoria creada correctamente',
    errorMessage: 'No se pudo crear la categoria',
    invalidateKeys: [riesgosKeys.categorias],
  });

export const useUpdateCategoriaRiesgo = () =>
  useMutationToast(({ id, payload }: { id: Id; payload: UpdateCategoriaRiesgoPayload }) => riesgosApi.updateCategoria(id, payload), {
    successMessage: 'Categoria actualizada',
    errorMessage: 'No se pudo actualizar la categoria',
    invalidateKeys: [riesgosKeys.categorias],
  });

export const useDeleteCategoriaRiesgo = () =>
  useMutationToast((id: Id) => riesgosApi.deleteCategoria(id), {
    successMessage: 'Categoria eliminada',
    errorMessage: 'No se pudo eliminar la categoria',
    invalidateKeys: [riesgosKeys.categorias],
  });

// Riesgos
export const useRiesgosList = (filters?: RiesgoFilter) =>
  useQuery({
    queryKey: riesgosKeys.riesgosList(filters),
    queryFn: () => riesgosApi.listRiesgos(filters),
  });

export const useRiesgoDetail = (id: Id) =>
  useQuery({
    queryKey: riesgosKeys.riesgoDetail(id),
    queryFn: () => riesgosApi.getRiesgo(id),
    enabled: Boolean(id),
  });

export const useCreateRiesgo = () =>
  useMutationToast((payload: CreateRiesgoPayload) => riesgosApi.createRiesgo(payload), {
    successMessage: 'Riesgo creado correctamente',
    errorMessage: 'No se pudo crear el riesgo',
    invalidateKeys: [riesgosKeys.riesgos, riesgosKeys.dashboard(), riesgosKeys.heatmap()],
  });

export const useUpdateRiesgo = () =>
  useMutationToast(({ id, payload }: { id: Id; payload: UpdateRiesgoPayload }) => riesgosApi.updateRiesgo(id, payload), {
    successMessage: 'Riesgo actualizado',
    errorMessage: 'No se pudo actualizar el riesgo',
    invalidateKeys: [riesgosKeys.riesgos, riesgosKeys.dashboard(), riesgosKeys.heatmap()],
  });

export const useDeleteRiesgo = () =>
  useMutationToast((id: Id) => riesgosApi.deleteRiesgo(id), {
    successMessage: 'Riesgo eliminado',
    errorMessage: 'No se pudo eliminar el riesgo',
    invalidateKeys: [riesgosKeys.riesgos, riesgosKeys.dashboard(), riesgosKeys.heatmap()],
  });

export const useRiesgoFlowActions = () => {
  const queryClient = useQueryClient();

  const onFlowSuccess = (message: string) => {
    queryClient.invalidateQueries({ queryKey: riesgosKeys.riesgos });
    queryClient.invalidateQueries({ queryKey: riesgosKeys.dashboard() });
    queryClient.invalidateQueries({ queryKey: riesgosKeys.heatmap() });
    toast.success(message);
  };

  const enviarRevision = useMutation({
    mutationFn: (id: Id) => riesgosApi.enviarRevisionRiesgo(id),
    onSuccess: () => onFlowSuccess('Riesgo enviado a revision'),
    onError: (error) => toast.error(asMessage(error, 'No se pudo enviar a revision')),
  });

  const aprobar = useMutation({
    mutationFn: (id: Id) => riesgosApi.aprobarRiesgo(id),
    onSuccess: () => onFlowSuccess('Riesgo aprobado'),
    onError: (error) => toast.error(asMessage(error, 'No se pudo aprobar el riesgo')),
  });

  const rechazar = useMutation({
    mutationFn: (id: Id) => riesgosApi.rechazarRiesgo(id),
    onSuccess: () => onFlowSuccess('Riesgo rechazado'),
    onError: (error) => toast.error(asMessage(error, 'No se pudo rechazar el riesgo')),
  });

  const cerrar = useMutation({
    mutationFn: (id: Id) => riesgosApi.cerrarRiesgo(id),
    onSuccess: () => onFlowSuccess('Riesgo cerrado'),
    onError: (error) => toast.error(asMessage(error, 'No se pudo cerrar el riesgo')),
  });

  return {
    enviarRevision,
    aprobar,
    rechazar,
    cerrar,
  };
};

// Planes
export const usePlanesTratamientoList = (filters?: PlanTratamientoFilter) =>
  useQuery({ queryKey: riesgosKeys.planesList(filters), queryFn: () => riesgosApi.listPlanesTratamiento(filters) });

export const useCreatePlanTratamiento = () =>
  useMutationToast((payload: CreatePlanTratamientoPayload) => riesgosApi.createPlanTratamiento(payload), {
    successMessage: 'Plan creado',
    errorMessage: 'No se pudo crear el plan',
    invalidateKeys: [riesgosKeys.planes],
  });

export const useUpdatePlanTratamiento = () =>
  useMutationToast(({ id, payload }: { id: Id; payload: UpdatePlanTratamientoPayload }) => riesgosApi.updatePlanTratamiento(id, payload), {
    successMessage: 'Plan actualizado',
    errorMessage: 'No se pudo actualizar el plan',
    invalidateKeys: [riesgosKeys.planes],
  });

export const useDeletePlanTratamiento = () =>
  useMutationToast((id: Id) => riesgosApi.deletePlanTratamiento(id), {
    successMessage: 'Plan eliminado',
    errorMessage: 'No se pudo eliminar el plan',
    invalidateKeys: [riesgosKeys.planes],
  });

export const usePlanActions = () => {
  const queryClient = useQueryClient();

  const updateAvance = useMutation({
    mutationFn: ({ id, avance }: { id: Id; avance: number }) => riesgosApi.actualizarAvancePlan(id, avance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: riesgosKeys.planes });
      toast.success('Avance actualizado');
    },
    onError: (error) => toast.error(asMessage(error, 'No se pudo actualizar el avance')),
  });

  const aprobar = useMutation({
    mutationFn: (id: Id) => riesgosApi.aprobarPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: riesgosKeys.planes });
      toast.success('Plan aprobado');
    },
    onError: (error) => toast.error(asMessage(error, 'No se pudo aprobar el plan')),
  });

  return { updateAvance, aprobar };
};

// KRIs
export const useKrisList = (filters?: KRIFilter) =>
  useQuery({ queryKey: riesgosKeys.krisList(filters), queryFn: () => riesgosApi.listKris(filters) });

export const useCreateKri = () =>
  useMutationToast((payload: CreateKRIPayload) => riesgosApi.createKri(payload), {
    successMessage: 'KRI creado',
    errorMessage: 'No se pudo crear el KRI',
    invalidateKeys: [riesgosKeys.kris],
  });

export const useUpdateKri = () =>
  useMutationToast(({ id, payload }: { id: Id; payload: UpdateKRIPayload }) => riesgosApi.updateKri(id, payload), {
    successMessage: 'KRI actualizado',
    errorMessage: 'No se pudo actualizar el KRI',
    invalidateKeys: [riesgosKeys.kris],
  });

export const useDeleteKri = () =>
  useMutationToast((id: Id) => riesgosApi.deleteKri(id), {
    successMessage: 'KRI eliminado',
    errorMessage: 'No se pudo eliminar el KRI',
    invalidateKeys: [riesgosKeys.kris],
  });

export const useRegistrarMedicionKri = () =>
  useMutationToast(({ id, payload }: { id: Id; payload: RegistrarMedicionKRIPayload }) => riesgosApi.registrarMedicionKri(id, payload), {
    successMessage: 'Medicion registrada',
    errorMessage: 'No se pudo registrar la medicion',
    invalidateKeys: [riesgosKeys.kris],
  });

// Monitoreo
export const useRegistroMonitoreoList = (filters?: RegistroMonitoreoFilter) =>
  useQuery({ queryKey: riesgosKeys.monitoreoList(filters), queryFn: () => riesgosApi.listRegistroMonitoreo(filters) });

export const useCreateRegistroMonitoreo = () =>
  useMutationToast((payload: CreateRegistroMonitoreoPayload) => riesgosApi.createRegistroMonitoreo(payload), {
    successMessage: 'Registro de monitoreo creado',
    errorMessage: 'No se pudo crear el registro de monitoreo',
    invalidateKeys: [riesgosKeys.monitoreo, riesgosKeys.riesgos, riesgosKeys.dashboard(), riesgosKeys.heatmap()],
  });

export const useUpdateRegistroMonitoreo = () =>
  useMutationToast(({ id, payload }: { id: Id; payload: UpdateRegistroMonitoreoPayload }) => riesgosApi.updateRegistroMonitoreo(id, payload), {
    successMessage: 'Registro de monitoreo actualizado',
    errorMessage: 'No se pudo actualizar el monitoreo',
    invalidateKeys: [riesgosKeys.monitoreo, riesgosKeys.riesgos, riesgosKeys.dashboard(), riesgosKeys.heatmap()],
  });

export const useDeleteRegistroMonitoreo = () =>
  useMutationToast((id: Id) => riesgosApi.deleteRegistroMonitoreo(id), {
    successMessage: 'Registro de monitoreo eliminado',
    errorMessage: 'No se pudo eliminar el monitoreo',
    invalidateKeys: [riesgosKeys.monitoreo],
  });

// Activos
export const useActivosList = (filters?: ActivoInformacionFilter) =>
  useQuery({ queryKey: riesgosKeys.activosList(filters), queryFn: () => riesgosApi.listActivos(filters) });

export const useCreateActivo = () =>
  useMutationToast((payload: CreateActivoInformacionPayload) => riesgosApi.createActivo(payload), {
    successMessage: 'Activo creado',
    errorMessage: 'No se pudo crear el activo',
    invalidateKeys: [riesgosKeys.activos],
  });

export const useUpdateActivo = () =>
  useMutationToast(({ id, payload }: { id: Id; payload: UpdateActivoInformacionPayload }) => riesgosApi.updateActivo(id, payload), {
    successMessage: 'Activo actualizado',
    errorMessage: 'No se pudo actualizar el activo',
    invalidateKeys: [riesgosKeys.activos],
  });

export const useDeleteActivo = () =>
  useMutationToast((id: Id) => riesgosApi.deleteActivo(id), {
    successMessage: 'Activo eliminado',
    errorMessage: 'No se pudo eliminar el activo',
    invalidateKeys: [riesgosKeys.activos],
  });

// Riesgo-activo
export const useRiesgoActivosList = (filters?: RiesgoActivoFilter) =>
  useQuery({ queryKey: riesgosKeys.riesgoActivosList(filters), queryFn: () => riesgosApi.listRiesgoActivos(filters) });

export const useCreateRiesgoActivo = () =>
  useMutationToast((payload: CreateRiesgoActivoPayload) => riesgosApi.createRiesgoActivo(payload), {
    successMessage: 'Relacion riesgo-activo creada',
    errorMessage: 'No se pudo crear la relacion riesgo-activo',
    invalidateKeys: [riesgosKeys.riesgoActivos],
  });

export const useUpdateRiesgoActivo = () =>
  useMutationToast(({ id, payload }: { id: Id; payload: UpdateRiesgoActivoPayload }) => riesgosApi.updateRiesgoActivo(id, payload), {
    successMessage: 'Relacion riesgo-activo actualizada',
    errorMessage: 'No se pudo actualizar la relacion riesgo-activo',
    invalidateKeys: [riesgosKeys.riesgoActivos],
  });

export const useDeleteRiesgoActivo = () =>
  useMutationToast((id: Id) => riesgosApi.deleteRiesgoActivo(id), {
    successMessage: 'Relacion riesgo-activo eliminada',
    errorMessage: 'No se pudo eliminar la relacion riesgo-activo',
    invalidateKeys: [riesgosKeys.riesgoActivos],
  });

// Evaluaciones cuantitativas
export const useEvaluacionesCuantitativasList = (filters?: EvaluacionCuantitativaFilter) =>
  useQuery({
    queryKey: riesgosKeys.evaluacionesCuantitativasList(filters),
    queryFn: () => riesgosApi.listEvaluacionesCuantitativas(filters),
  });

export const useCreateEvaluacionCuantitativa = () =>
  useMutationToast((payload: CreateEvaluacionCuantitativaPayload) => riesgosApi.createEvaluacionCuantitativa(payload), {
    successMessage: 'Evaluacion cuantitativa creada',
    errorMessage: 'No se pudo crear la evaluacion cuantitativa',
    invalidateKeys: [riesgosKeys.evaluacionesCuantitativas],
  });

export const useUpdateEvaluacionCuantitativa = () =>
  useMutationToast(({ id, payload }: { id: Id; payload: UpdateEvaluacionCuantitativaPayload }) =>
    riesgosApi.updateEvaluacionCuantitativa(id, payload), {
    successMessage: 'Evaluacion cuantitativa actualizada',
    errorMessage: 'No se pudo actualizar la evaluacion cuantitativa',
    invalidateKeys: [riesgosKeys.evaluacionesCuantitativas],
  });

export const useDeleteEvaluacionCuantitativa = () =>
  useMutationToast((id: Id) => riesgosApi.deleteEvaluacionCuantitativa(id), {
    successMessage: 'Evaluacion cuantitativa eliminada',
    errorMessage: 'No se pudo eliminar la evaluacion cuantitativa',
    invalidateKeys: [riesgosKeys.evaluacionesCuantitativas],
  });

// Reporte simple (Entrega 1)
export const useRiesgoReporteSimple = () =>
  useQuery({
    queryKey: [...riesgosKeys.all, 'reporte-simple'],
    queryFn: () => riesgosApi.getReporteSimple(),
  });

export const useExportRiesgoReporteSimple = () =>
  useMutation({
    mutationFn: () => riesgosApi.exportReporteSimple(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'reporte_riesgos_simple.csv';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
      toast.success('Reporte exportado correctamente');
    },
    onError: (error) => {
      toast.error(asMessage(error, 'No se pudo exportar el reporte'));
    },
  });

export * from './useMaestros';
