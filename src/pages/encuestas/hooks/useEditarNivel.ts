// src/pages/encuestas/hooks/useEditarNivel.ts
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { nivelesApi } from '@/api/endpoints';
import { useNotification } from '@/hooks/useNotification';

// ── Schema ───────────────────────────────────────────────────────────────────

const editarNivelSchema = z.object({
  descripcion: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
  recomendaciones: z.string().optional(),
});

export type EditarNivelFormData = z.infer<typeof editarNivelSchema>;

// ── Constante de colores por nivel ───────────────────────────────────────────

const NIVEL_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700' },
  2: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  3: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  4: { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700' },
  5: { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700' },
};

const DEFAULT_COLOR = { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useEditarNivel = () => {
  const { encuestaId, nivelId } = useParams<{
    encuestaId: string;
    nivelId: string;
  }>();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [nivelNumero, setNivelNumero] = useState<number>(1);

  const form = useForm<EditarNivelFormData>({
    resolver: zodResolver(editarNivelSchema),
  });

  useEffect(() => {
    if (nivelId) loadNivel();
  }, [nivelId]);

  const loadNivel = async () => {
    if (!nivelId) return;
    try {
      setIsLoading(true);
      const data = await nivelesApi.get(nivelId);
      setNivelNumero(data.numero);
      form.reset({
        descripcion: data.descripcion,
        recomendaciones: data.recomendaciones || '',
      });
    } catch (err: any) {
      showError(err?.message || 'Error al cargar el nivel');
      navigate(`/encuestas/${encuestaId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: EditarNivelFormData) => {
    if (!nivelId) return;
    try {
      await nivelesApi.update(nivelId, data);
      success('Nivel actualizado exitosamente');
      navigate(`/encuestas/${encuestaId}`);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Error al actualizar el nivel';
      showError(errorMessage);
    }
  };

  // Colores derivados del número de nivel
  const nivelColor = useMemo(
    () => NIVEL_COLORS[nivelNumero] ?? DEFAULT_COLOR,
    [nivelNumero]
  );

  const goToDetalle = () => navigate(`/encuestas/${encuestaId}`);

  return {
    isLoading,
    nivelNumero,
    nivelColor,
    form,
    onSubmit: form.handleSubmit(onSubmit),
    goToDetalle,
  };
};