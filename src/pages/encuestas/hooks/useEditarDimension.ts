// src/pages/encuestas/hooks/useEditarDimension.ts
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { dimensionesApi } from '@/api/endpoints';
import { useNotification } from '@/hooks/useNotification';

// ── Schema ───────────────────────────────────────────────────────────────────

const editarDimensionSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido').max(20),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200),
  descripcion: z.string().optional(),
  orden: z.coerce.number().min(0, 'El orden debe ser mayor o igual a 0'),
});

export type EditarDimensionFormData = z.input<typeof editarDimensionSchema>;

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useEditarDimension = () => {
  const { encuestaId, dimensionId } = useParams<{
    encuestaId: string;
    dimensionId: string;
  }>();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<EditarDimensionFormData>({
    resolver: zodResolver(editarDimensionSchema),
  });

  useEffect(() => {
    if (dimensionId) loadDimension();
  }, [dimensionId]);

  const loadDimension = async () => {
    if (!dimensionId) return;
    try {
      setIsLoading(true);
      const data = await dimensionesApi.get(dimensionId);
      form.reset({
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion || '',
        orden: data.orden,
      });
    } catch (err: any) {
      showError(err?.message || 'Error al cargar la dimensión');
      navigate(`/encuestas/${encuestaId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: EditarDimensionFormData) => {
    if (!dimensionId) return;
    try {
      await dimensionesApi.update(dimensionId, { ...data, orden: Number(data.orden) });
      success('Dimensión actualizada exitosamente');
      navigate(`/encuestas/${encuestaId}`);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Error al actualizar la dimensión';
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