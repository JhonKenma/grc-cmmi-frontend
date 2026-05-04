// src/pages/encuestas/hooks/useEditarPregunta.ts
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { preguntasApi } from '@/api/endpoints';
import { useNotification } from '@/hooks/useNotification';

// ── Schema ───────────────────────────────────────────────────────────────────

const editarPreguntaSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido').max(50),
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(500),
  texto: z.string().min(10, 'El texto debe tener al menos 10 caracteres'),
  peso: z.coerce.number().min(0.1, 'El peso debe ser mayor a 0'),
  orden: z.coerce.number().min(0, 'El orden debe ser mayor o igual a 0'),
  obligatoria: z.boolean().optional(),
});

export type EditarPreguntaFormData = z.input<typeof editarPreguntaSchema>;

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useEditarPregunta = () => {
  const { encuestaId, preguntaId } = useParams<{
    encuestaId: string;
    preguntaId: string;
  }>();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<EditarPreguntaFormData>({
    resolver: zodResolver(editarPreguntaSchema),
  });

  useEffect(() => {
    if (preguntaId) loadPregunta();
  }, [preguntaId]);

  const loadPregunta = async () => {
    if (!preguntaId) return;
    try {
      setIsLoading(true);
      const data = await preguntasApi.get(preguntaId);
      form.reset({
        codigo: data.codigo,
        titulo: data.titulo,
        texto: data.texto,
        peso: data.peso,
        orden: data.orden,
        obligatoria: data.obligatoria,
      });
    } catch (err: any) {
      showError(err?.message || 'Error al cargar la pregunta');
      navigate(`/encuestas/${encuestaId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: EditarPreguntaFormData) => {
    if (!preguntaId) return;
    try {
      await preguntasApi.update(preguntaId, {
        ...data,
        peso: Number(data.peso),
        orden: Number(data.orden),
      });
      success('Pregunta actualizada exitosamente');
      navigate(`/encuestas/${encuestaId}`);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Error al actualizar la pregunta';
      showError(errorMessage);
    }
  };

  const goToDetalle = () => navigate(`/encuestas/${encuestaId}`);

  return {
    isLoading,
    form,
    onSubmit: form.handleSubmit(onSubmit),
    goToDetalle,
  };
};