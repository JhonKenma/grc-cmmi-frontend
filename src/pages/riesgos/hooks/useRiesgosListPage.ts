import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { documentosApi } from '@/api/endpoints/documentos.api';
import { usuarioService } from '@/api/usuario.service';
import {
  useCausasRiesgo,
  useCreateRiesgo,
  useDeleteRiesgo,
  useNaturalezasConsecuencia,
  useTiposRiesgo,
  useUnidadesPerdida,
  useRiesgosList,
} from '@/hooks/useRiesgosModule';
import type { CreateRiesgoPayload, EstadoRiesgo } from '@/types';

export type RiesgoFormData = CreateRiesgoPayload & {
  tipo_riesgo: string;
  naturaleza_causa: string;
  naturaleza_consecuencia: string;
  proxima_revision_fecha: string;
  evaluacion_cuantitativa_activa: boolean;
  unidad_perdida: string;
  monto_perdida: string;
  valor_activo: string;
  factor_exposicion: string;
  impacto_financiero: number;
  impacto_operacional: number;
  impacto_reputacional: number;
  peso_financiero: number;
  peso_operacional: number;
  peso_reputacional: number;
};

export const createInitialFormData = (): RiesgoFormData => ({
  titulo: '',
  codigo: '',
  descripcion: '',
  categoria: '',
  categoria_coso: 'Operacional',
  probabilidad: 3,
  impacto: 3,
  causa_raiz: '',
  consecuencia: '',
  fecha_revision: '',
  controles_asociados: '',
  estado_tratamiento: 'Pendiente',
  dueno_riesgo: '',
  tipo_riesgo: '',
  naturaleza_causa: '',
  naturaleza_consecuencia: '',
  proxima_revision_fecha: '',
  evaluacion_cuantitativa_activa: false,
  unidad_perdida: '',
  monto_perdida: '',
  valor_activo: '',
  factor_exposicion: '',
  impacto_financiero: 3,
  impacto_operacional: 3,
  impacto_reputacional: 3,
  peso_financiero: 0.5,
  peso_operacional: 0.3,
  peso_reputacional: 0.2,
});

export const useRiesgosListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<RiesgoFormData>(createInitialFormData);

  const riesgosQuery = useRiesgosList({
    search: search || undefined,
    estado: (estado || undefined) as EstadoRiesgo | undefined,
  });

  const tiposRiesgoQuery = useTiposRiesgo();
  const causasQuery = useCausasRiesgo();
  const consecuenciasQuery = useNaturalezasConsecuencia();
  const unidadesPerdidaQuery = useUnidadesPerdida();
  const procesosQuery = useQuery({
    queryKey: ['documentos-procesos', 'riesgos-form'],
    queryFn: () => documentosApi.getProcesos(),
  });
  const usuariosQuery = useQuery({
    queryKey: ['usuarios-riesgos-form'],
    queryFn: () => usuarioService.getAll(),
  });
  const createMutation = useCreateRiesgo();
  const deleteMutation = useDeleteRiesgo();

  const riesgos = useMemo(() => {
    const base = riesgosQuery.data?.results ?? [];
    if (!categoria) return base;
    return base.filter((item) => String(item.categoria ?? item.tipo_riesgo ?? '') === categoria);
  }, [categoria, riesgosQuery.data]);

  const categorias = useMemo(
    () =>
      (tiposRiesgoQuery.data ?? []).map((tipo) => ({
        id: tipo.id,
        nombre: tipo.nombre,
      })),
    [tiposRiesgoQuery.data],
  );

  const procesos = useMemo(() => procesosQuery.data ?? [], [procesosQuery.data]);
  const usuarios = useMemo(() => usuariosQuery.data ?? [], [usuariosQuery.data]);

  return {
    navigate,
    search,
    setSearch,
    estado,
    setEstado,
    categoria,
    setCategoria,
    showCreateForm,
    setShowCreateForm,
    formData,
    setFormData,
    riesgosQuery,
    tiposRiesgoQuery,
    causasQuery,
    consecuenciasQuery,
    unidadesPerdidaQuery,
    procesosQuery,
    usuariosQuery,
    createMutation,
    deleteMutation,
    riesgos,
    categorias,
    procesos,
    usuarios,
    createInitialFormData,
  } as const;
};
