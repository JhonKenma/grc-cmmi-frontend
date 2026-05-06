import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useActivosList,
  useCreateRiesgoActivo,
  useDeleteRiesgoActivo,
  useRiesgoActivosList,
  useRiesgosList,
} from '@/hooks/useRiesgosModule';
import type { CreateRiesgoActivoPayload } from '@/types';

const createInitialForm = (): CreateRiesgoActivoPayload => ({
  riesgo: '',
  activo_informacion: '',
  tipo_afectacion: 'operacional',
  nivel_afectacion: 'medio',
  impacto_especifico: '',
});

export const useRiesgoActivosPage = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateRiesgoActivoPayload>(createInitialForm);

  const riesgosQuery = useRiesgosList({ page_size: 200 });
  const activosQuery = useActivosList({ page_size: 200 });
  const relacionesQuery = useRiesgoActivosList();
  const createMutation = useCreateRiesgoActivo();
  const deleteMutation = useDeleteRiesgoActivo();

  const riesgosLookup = useMemo(() => {
    const map = new Map<string, string>();
    (riesgosQuery.data?.results ?? []).forEach((riesgo) => {
      map.set(String(riesgo.id), `${riesgo.codigo} - ${riesgo.titulo ?? riesgo.nombre}`);
    });
    return map;
  }, [riesgosQuery.data]);

  const activosLookup = useMemo(() => {
    const map = new Map<string, string>();
    (activosQuery.data?.results ?? []).forEach((activo) => {
      map.set(String(activo.id), `${activo.codigo} - ${activo.nombre}`);
    });
    return map;
  }, [activosQuery.data]);

  const submitCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: () => {
        setFormData(createInitialForm());
        setShowCreateForm(false);
      },
    });
  };

  return {
    navigate,
    showCreateForm,
    setShowCreateForm,
    formData,
    setFormData,
    riesgosQuery,
    activosQuery,
    relacionesQuery,
    createMutation,
    deleteMutation,
    riesgosLookup,
    activosLookup,
    submitCreate,
    createInitialForm,
  } as const;
};
