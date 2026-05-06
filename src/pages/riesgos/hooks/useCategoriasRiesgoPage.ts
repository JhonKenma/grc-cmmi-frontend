import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import {
  useCategoriasRiesgoList,
  useCreateCategoriaRiesgo,
  useDeleteCategoriaRiesgo,
  useUpdateCategoriaRiesgo,
} from '@/hooks/useRiesgosModule';
import type { CreateCategoriaRiesgoPayload, Id } from '@/types';

const createInitialForm = (): CreateCategoriaRiesgoPayload => ({
  nombre: '',
  descripcion: '',
  activo: true,
});

export const useCategoriasRiesgoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateCategoriaRiesgoPayload>(createInitialForm);

  const categoriasQuery = useCategoriasRiesgoList();
  const createMutation = useCreateCategoriaRiesgo();
  const updateMutation = useUpdateCategoriaRiesgo();
  const deleteMutation = useDeleteCategoriaRiesgo();

  const submitCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate({
      ...formData,
      empresa: user?.empresa ?? undefined,
    }, {
      onSuccess: () => {
        setFormData(createInitialForm());
        setShowCreateForm(false);
      },
    });
  };

  const toggleCategoria = (categoria: { id: Id; activo: boolean }) => {
    updateMutation.mutate({ id: categoria.id, payload: { activo: !categoria.activo } });
  };

  return {
    navigate,
    user,
    showCreateForm,
    setShowCreateForm,
    formData,
    setFormData,
    categoriasQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    submitCreate,
    toggleCategoria,
    createInitialForm,
  } as const;
};
