// src/hooks/useProyectosRemediacion.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { proyectosRemediacionApi } from '@/api/endpoints/proyectos-remediacion.api';
import {
  ProyectoRemediacionList,
  ProyectoRemediacionDetail,
  CrearProyectoFormData,
  CrearDesdeGAPFormData,
  ActualizarProyectoFormData,
  ProyectosListResponse,
  ProyectosFiltros,
  EstadisticasProyectos,
  MisProyectosParams,
  ProyectosPorEstadoResponse,
  ProyectosVencidosResponse,
  ProyectosProximosVencerParams,
  ProyectosProximosVencerResponse,
} from '@/types/proyecto-remediacion.types';

// ═══════════════════════════════════════════════════════════════
// QUERY KEYS (Para cache de React Query)
// ═══════════════════════════════════════════════════════════════

export const proyectosKeys = {
  all: ['proyectos-remediacion'] as const,
  lists: () => [...proyectosKeys.all, 'list'] as const,
  list: (filtros?: ProyectosFiltros) => [...proyectosKeys.lists(), filtros] as const,
  details: () => [...proyectosKeys.all, 'detail'] as const,
  detail: (id: string) => [...proyectosKeys.details(), id] as const,
  misProyectos: (params?: MisProyectosParams) => [...proyectosKeys.all, 'mis-proyectos', params] as const,
  estadisticas: () => [...proyectosKeys.all, 'estadisticas'] as const,
  porEstado: (estado: string) => [...proyectosKeys.all, 'por-estado', estado] as const,
  vencidos: () => [...proyectosKeys.all, 'vencidos'] as const,
  proximosVencer: (dias?: number) => [...proyectosKeys.all, 'proximos-vencer', dias] as const,
};

// ═══════════════════════════════════════════════════════════════
// HOOKS DE CONSULTA (useQuery)
// ═══════════════════════════════════════════════════════════════

/**
 * Hook para listar proyectos con filtros
 */
export const useProyectos = (
  filtros?: ProyectosFiltros,
  options?: Omit<UseQueryOptions<ProyectosListResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: proyectosKeys.list(filtros),
    queryFn: () => proyectosRemediacionApi.listar(filtros),
    staleTime: 1000 * 60 * 5, // 5 minutos
    ...options,
  });
};

/**
 * Hook para obtener detalle de un proyecto
 */
export const useProyecto = (
  id: string,
  options?: Omit<UseQueryOptions<ProyectoRemediacionDetail>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: proyectosKeys.detail(id),
    queryFn: () => proyectosRemediacionApi.obtener(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

/**
 * Hook para obtener mis proyectos asignados
 */
export const useMisProyectos = (
  params?: MisProyectosParams,
  options?: Omit<UseQueryOptions<ProyectoRemediacionList[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: proyectosKeys.misProyectos(params),
    queryFn: () => proyectosRemediacionApi.misProyectos(params),
    staleTime: 1000 * 60 * 2, // 2 minutos
    ...options,
  });
};

/**
 * Hook para obtener estadísticas
 */
export const useEstadisticasProyectos = (
  options?: Omit<UseQueryOptions<EstadisticasProyectos>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: proyectosKeys.estadisticas(),
    queryFn: () => proyectosRemediacionApi.estadisticas(),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

/**
 * Hook para obtener proyectos por estado
 */
export const useProyectosPorEstado = (
  estado: string,
  options?: Omit<UseQueryOptions<ProyectosPorEstadoResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: proyectosKeys.porEstado(estado),
    queryFn: () => proyectosRemediacionApi.porEstado(estado),
    enabled: !!estado,
    staleTime: 1000 * 60 * 3,
    ...options,
  });
};

/**
 * Hook para obtener proyectos vencidos
 */
export const useProyectosVencidos = (
  options?: Omit<UseQueryOptions<ProyectosVencidosResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: proyectosKeys.vencidos(),
    queryFn: () => proyectosRemediacionApi.vencidos(),
    staleTime: 1000 * 60 * 2,
    ...options,
  });
};

/**
 * Hook para obtener proyectos próximos a vencer
 */
export const useProyectosProximosVencer = (
  params?: ProyectosProximosVencerParams,
  options?: Omit<UseQueryOptions<ProyectosProximosVencerResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: proyectosKeys.proximosVencer(params?.dias),
    queryFn: () => proyectosRemediacionApi.proximosAVencer(params),
    staleTime: 1000 * 60 * 2,
    ...options,
  });
};

// ═══════════════════════════════════════════════════════════════
// HOOKS DE MUTACIÓN (useMutation)
// ═══════════════════════════════════════════════════════════════

/**
 * Hook para crear proyecto manualmente
 */
export const useCrearProyecto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CrearProyectoFormData) => proyectosRemediacionApi.crear(data),
    onSuccess: (data) => {
      // Invalidar caché
      queryClient.invalidateQueries({ queryKey: proyectosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: proyectosKeys.estadisticas() });
      queryClient.invalidateQueries({ queryKey: proyectosKeys.misProyectos() });
      
      toast.success(`Proyecto ${data.codigo_proyecto} creado exitosamente`);
    },
    onError: (error: any) => {
      const mensaje = error.response?.data?.message || 'Error al crear proyecto';
      toast.error(mensaje);
      console.error('Error al crear proyecto:', error);
    },
  });
};

/**
 * Hook para crear proyecto desde GAP
 */
export const useCrearProyectoDesdeGAP = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CrearDesdeGAPFormData) => proyectosRemediacionApi.crearDesdeGAP(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: proyectosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: proyectosKeys.estadisticas() });
      queryClient.invalidateQueries({ queryKey: proyectosKeys.misProyectos() });
      
      toast.success(`Proyecto ${data.codigo_proyecto} creado desde GAP exitosamente`);
    },
    onError: (error: any) => {
      const mensaje = error.response?.data?.message || 'Error al crear proyecto desde GAP';
      toast.error(mensaje);
      console.error('Error al crear proyecto desde GAP:', error);
    },
  });
};

/**
 * Hook para actualizar proyecto
 */
export const useActualizarProyecto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ActualizarProyectoFormData }) =>
      proyectosRemediacionApi.actualizar(id, data),
    onSuccess: (data) => {
      // Invalidar caché del proyecto específico
      queryClient.invalidateQueries({ queryKey: proyectosKeys.detail(data.id) });
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: proyectosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: proyectosKeys.estadisticas() });
      
      toast.success(`Proyecto ${data.codigo_proyecto} actualizado exitosamente`);
    },
    onError: (error: any) => {
      const mensaje = error.response?.data?.message || 'Error al actualizar proyecto';
      toast.error(mensaje);
      console.error('Error al actualizar proyecto:', error);
    },
  });
};

/**
 * Hook para eliminar (desactivar) proyecto
 */
export const useEliminarProyecto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => proyectosRemediacionApi.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proyectosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: proyectosKeys.estadisticas() });
      queryClient.invalidateQueries({ queryKey: proyectosKeys.misProyectos() });
      
      toast.success('Proyecto desactivado exitosamente');
    },
    onError: (error: any) => {
      const mensaje = error.response?.data?.message || 'Error al eliminar proyecto';
      toast.error(mensaje);
      console.error('Error al eliminar proyecto:', error);
    },
  });
};