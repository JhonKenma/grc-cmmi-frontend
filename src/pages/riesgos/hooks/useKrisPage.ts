import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useCreateKri,
  useDeleteKri,
  useKrisList,
  useRegistrarMedicionKri,
  useRiesgosList,
} from '@/hooks/useRiesgosModule';
import type { CreateKRIPayload } from '@/types';

const createInitialForm = (): CreateKRIPayload => ({
  riesgo: '',
  nombre: '',
  descripcion: '',
  unidad_medida: '%',
  umbral_verde: 5,
  umbral_amarillo: 10,
  umbral_rojo: 15,
  frecuencia: 'mensual',
});

export const useKrisPage = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateKRIPayload>(createInitialForm);
  const [mediciones, setMediciones] = useState<Record<string, string>>({});

  const riesgosQuery = useRiesgosList({ page_size: 200 });
  const krisQuery = useKrisList();
  const createMutation = useCreateKri();
  const deleteMutation = useDeleteKri();
  const registrarMutation = useRegistrarMedicionKri();

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
    mediciones,
    setMediciones,
    riesgosQuery,
    krisQuery,
    createMutation,
    deleteMutation,
    registrarMutation,
    submitCreate,
    createInitialForm,
  } as const;
};
