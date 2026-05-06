import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useCreateEvaluacionCuantitativa,
  useDeleteEvaluacionCuantitativa,
  useEvaluacionesCuantitativasList,
  useRiesgosList,
} from '@/hooks/useRiesgosModule';
import type { CreateEvaluacionCuantitativaPayload } from '@/types';

const createInitialForm = (): CreateEvaluacionCuantitativaPayload => ({
  riesgo: '',
  fecha: new Date().toISOString().slice(0, 10),
  sle: 0,
  aro: 0,
  ale: 0,
  metodo_evaluacion: 'ale',
  observaciones: '',
});

const computeAle = (sle: number, aro: number): number => Number((sle * aro).toFixed(2));

export const useEvaluacionesCuantitativasPage = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateEvaluacionCuantitativaPayload>(createInitialForm);

  const riesgosQuery = useRiesgosList({ page_size: 200 });
  const evaluacionesQuery = useEvaluacionesCuantitativasList();
  const createMutation = useCreateEvaluacionCuantitativa();
  const deleteMutation = useDeleteEvaluacionCuantitativa();

  const riesgosLookup = useMemo(() => {
    const map = new Map<string, string>();
    (riesgosQuery.data?.results ?? []).forEach((riesgo) => {
      map.set(String(riesgo.id), `${riesgo.codigo} - ${riesgo.titulo ?? riesgo.nombre}`);
    });
    return map;
  }, [riesgosQuery.data]);

  const alePreview = useMemo(
    () => computeAle(Number(formData.sle ?? 0), Number(formData.aro ?? 0)),
    [formData.sle, formData.aro],
  );

  const submitCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate(
      {
        ...formData,
        sle: Number(formData.sle ?? 0),
        aro: Number(formData.aro ?? 0),
        ale: alePreview,
      },
      {
        onSuccess: () => {
          setFormData(createInitialForm());
          setShowCreateForm(false);
        },
      },
    );
  };

  return {
    navigate,
    showCreateForm,
    setShowCreateForm,
    formData,
    setFormData,
    riesgosQuery,
    evaluacionesQuery,
    createMutation,
    deleteMutation,
    riesgosLookup,
    alePreview,
    submitCreate,
    createInitialForm,
  } as const;
};
