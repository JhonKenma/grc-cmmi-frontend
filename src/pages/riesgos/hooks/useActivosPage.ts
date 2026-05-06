import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useActivosList,
  useCreateActivo,
  useDeleteActivo,
} from '@/hooks/useRiesgosModule';
import type { CreateActivoInformacionPayload } from '@/types';

export const ACTIVO_DESCRIPCION_MAX_LENGTH = 400;

const createInitialForm = (): CreateActivoInformacionPayload => ({
  codigo: '',
  nombre: '',
  tipo_activo: 'datos',
  descripcion: '',
  valor_economico: 0,
  criticidad: 'media',
  propietario: '',
});

export const useActivosPage = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateActivoInformacionPayload>(createInitialForm);

  const activosQuery = useActivosList();
  const createMutation = useCreateActivo();
  const deleteMutation = useDeleteActivo();

  const submitCreate = (event: React.FormEvent<HTMLFormElement>) => {
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
    activosQuery,
    createMutation,
    deleteMutation,
    submitCreate,
    createInitialForm,
  } as const;
};
