import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { usuarioService } from '@/api/usuario.service';
import {
  useTiposActivoRemediacion,
  useTiposTratamiento,
  useCreatePlanTratamiento,
  usePlanActions,
  usePlanesTratamientoList,
  useRiesgosList,
} from '@/hooks/useRiesgosModule';
import type { CreatePlanTratamientoPayload } from '@/types';

export const createInitialPlanData = (): CreatePlanTratamientoPayload => ({
  riesgo: '',
  riesgos: [],
  riesgos_asociados: [],
  nombre: '',
  descripcion_accion: '',
  avance: 0,
  fecha_inicio: '',
  fecha_fin_plan: '',
  responsable_accion: '',
  tipo_tratamiento: '',
  mejora: '',
  nueva_probabilidad: 3,
  nuevo_impacto: 3,
  dependencias: [],
});

export const usePlanesPage = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [avanceDrafts, setAvanceDrafts] = useState<Record<string, number>>({});
  const [procesandoIds, setProcesandoIds] = useState<Record<string, boolean>>({});
  const [activos, setActivos] = useState<Array<{ tipo_activo: string; descripcion: string; costo_estimado: number; estado: 'pendiente' | 'en_proceso' | 'adquirido' | 'implementado' }>>([]);
  const [formData, setFormData] = useState<CreatePlanTratamientoPayload>(createInitialPlanData);

  const riesgosQuery = useRiesgosList({ page_size: 200 });
  const tiposTratamientoQuery = useTiposTratamiento();
  const tiposActivoRemediacionQuery = useTiposActivoRemediacion();
  const planesQuery = usePlanesTratamientoList();
  const usuariosQuery = useQuery({
    queryKey: ['usuarios-planes-form'],
    queryFn: () => usuarioService.getAll(),
  });
  const createMutation = useCreatePlanTratamiento();
  const actions = usePlanActions();

  const riesgosLookup = useMemo(() => {
    const map = new Map<string, string>();
    (riesgosQuery.data?.results ?? []).forEach((riesgo) => {
      map.set(String(riesgo.id), `${riesgo.codigo} - ${riesgo.titulo ?? riesgo.nombre}`);
    });
    return map;
  }, [riesgosQuery.data]);

  return {
    navigate,
    showCreateForm,
    setShowCreateForm,
    avanceDrafts,
    setAvanceDrafts,
    procesandoIds,
    setProcesandoIds,
    activos,
    setActivos,
    formData,
    setFormData,
    riesgosQuery,
    tiposTratamientoQuery,
    tiposActivoRemediacionQuery,
    planesQuery,
    usuariosQuery,
    createMutation,
    actions,
    riesgosLookup,
    createInitialPlanData,
  } as const;
};
