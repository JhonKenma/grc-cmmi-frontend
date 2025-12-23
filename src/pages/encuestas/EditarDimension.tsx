// src/pages/encuestas/EditarDimension.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { dimensionesApi } from '@/api/endpoints';
import { useNotification } from '@/hooks/useNotification';

/**
 * Schema de validación
 */
const editarDimensionSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido').max(20),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200),
  descripcion: z.string().optional(),
  // ✔ CORREGIDO: RHF envía string → usamos coerce
  orden: z.coerce.number().min(0, 'El orden debe ser mayor o igual a 0'),
});

// ✔ CORREGIDO: usar tipo de entrada, no de salida
type EditarDimensionFormData = z.input<typeof editarDimensionSchema>;

/**
 * Página para editar una dimensión
 */
export const EditarDimension: React.FC = () => {
  const { encuestaId, dimensionId } = useParams<{
    encuestaId: string;
    dimensionId: string;
  }>();

  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditarDimensionFormData>({
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

      reset({
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
      const payload = {
        ...data,
        orden: Number(data.orden),
      };

      await dimensionesApi.update(dimensionId, payload);
      success('Dimensión actualizada exitosamente');
      navigate(`/encuestas/${encuestaId}`);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Error al actualizar la dimensión';

      showError(errorMessage);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Cargando dimensión..." />;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/encuestas/${encuestaId}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a la Evaluación
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Editar Dimensión</h1>
        <p className="text-gray-600 mt-2">Actualiza los datos de la dimensión</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Dimensión</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Código */}
            <Input
              {...register('codigo')}
              label="Código"
              placeholder="Ej: GOB"
              error={errors.codigo?.message}
              required
              helperText="Código único de la dimensión"
            />

            {/* Nombre */}
            <Input
              {...register('nombre')}
              label="Nombre"
              placeholder="Ej: Gobernanza"
              error={errors.nombre?.message}
              required
            />

            {/* Orden */}
            <Input
              {...register('orden')}
              type="text"
              label="Orden"
              placeholder="1"
              error={errors.orden?.message}
              required
              helperText="Orden de aparición de la dimensión"
            />

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (Opcional)
              </label>
              <textarea
                {...register('descripcion')}
                rows={4}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe esta dimensión..."
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={() => navigate(`/encuestas/${encuestaId}`)}>
                Cancelar
              </Button>

              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                <Save size={18} className="mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
