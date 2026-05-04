// src/pages/encuestas/hooks/useEditarEncuesta.ts
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { encuestasApi } from '@/api/endpoints';
import { useNotification } from '@/hooks/useNotification';
import { ROUTES } from '@/utils/constants';

// ── Schema ───────────────────────────────────────────────────────────────────

const editarEncuestaSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(300, 'El nombre no puede superar los 300 caracteres'),
  version: z.string().max(20, 'La versión no puede superar los 20 caracteres').optional(),
  descripcion: z.string().optional(),
});

export type EditarEncuestaFormData = z.infer<typeof editarEncuestaSchema>;

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useEditarEncuesta = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<EditarEncuestaFormData>({
    resolver: zodResolver(editarEncuestaSchema),
  });

  useEffect(() => {
    if (id) loadEncuesta();
  }, [id]);

  const loadEncuesta = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await encuestasApi.get(id);
      form.reset({
        nombre: data.nombre,
        version: data.version,
        descripcion: data.descripcion || '',
      });
    } catch (err: any) {
      showError(err?.message || 'Error al cargar la encuesta');
      navigate(ROUTES.ENCUESTAS);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: EditarEncuestaFormData) => {
    if (!id) return;
    try {
      await encuestasApi.update(id, data);
      success('Evaluación actualizada exitosamente');
      navigate(ROUTES.ENCUESTAS);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Error al actualizar la evaluación';
      showError(errorMessage);
    }
  };

  const goToDetalle = () => navigate(`/encuestas/${id}`);

  return {
    isLoading,
    form,
    onSubmit: form.handleSubmit(onSubmit),
    goToDetalle,
  };
};