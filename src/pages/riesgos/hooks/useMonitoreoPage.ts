import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useCreateRegistroMonitoreo,
  useRegistroMonitoreoList,
  useRiesgosList,
} from '@/hooks/useRiesgosModule';
import type { CreateRegistroMonitoreoPayload } from '@/types';

const createInitialForm = (): CreateRegistroMonitoreoPayload => ({
  riesgo: '',
  fecha: new Date().toISOString().slice(0, 10),
  estado: 'sin_cambios',
  comentario: '',
  alerta: false,
});

export const useMonitoreoPage = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateRegistroMonitoreoPayload>(createInitialForm);

  const riesgosQuery = useRiesgosList({ page_size: 200 });
  const monitoreoQuery = useRegistroMonitoreoList();
  const createMutation = useCreateRegistroMonitoreo();

  const riesgosLookup = useMemo(() => {
    const map = new Map<string, string>();
    (riesgosQuery.data?.results ?? []).forEach((riesgo) => {
      map.set(String(riesgo.id), `${riesgo.codigo} - ${riesgo.titulo ?? riesgo.nombre}`);
    });
    return map;
  }, [riesgosQuery.data]);

  const submitCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: () => {
        setFormData((prev) => ({ ...prev, comentario: '', alerta: false }));
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
    monitoreoQuery,
    createMutation,
    riesgosLookup,
    submitCreate,
    createInitialForm,
  } as const;
};
