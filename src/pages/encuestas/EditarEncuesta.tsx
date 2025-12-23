// src/pages/encuestas/EditarEncuesta.tsx

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
import { encuestasApi } from '@/api/endpoints';
import { useNotification } from '@/hooks/useNotification';
import { ROUTES } from '@/utils/constants';

/**
 * Schema de validación
 */
const editarEncuestaSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(300, 'El nombre no puede superar los 300 caracteres'),
  version: z.string().max(20, 'La versión no puede superar los 20 caracteres').optional(),
  descripcion: z.string().optional(),
});

type EditarEncuestaFormData = z.infer<typeof editarEncuestaSchema>;

/**
 * Página para editar datos básicos de una encuesta
 */
export const EditarEncuesta: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditarEncuestaFormData>({
    resolver: zodResolver(editarEncuestaSchema),
  });

  useEffect(() => {
    if (id) {
      loadEncuesta();
    }
  }, [id]);

  const loadEncuesta = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const data = await encuestasApi.get(id);
      reset({
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
      navigate(`/encuestas`);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Error al actualizar la evaluación';
      showError(errorMessage);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Cargando evaluación..." />;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/encuestas/${id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver al Detalle
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Editar Evaluación</h1>
        <p className="text-gray-600 mt-2">
          Actualiza los datos básicos de la evaluación
        </p>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre */}
            <Input
              {...register('nombre')}
              label="Nombre de la Evaluación"
              placeholder="Ej: Evaluación de Madurez Digital 2025"
              error={errors.nombre?.message}
              required
            />

            {/* Versión */}
            <Input
              {...register('version')}
              label="Versión"
              placeholder="Ej: 1.0"
              error={errors.version?.message}
              helperText="Puedes usar números o letras (Ej: 1.0, v2.5, 2025-Q1)"
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
                placeholder="Describe brevemente esta evaluación..."
              />
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(`/encuestas/${id}`)}
              >
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