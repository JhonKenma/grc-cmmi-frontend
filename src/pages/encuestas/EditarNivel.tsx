// src/pages/encuestas/EditarNivel.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { nivelesApi } from '@/api/endpoints';
import { useNotification } from '@/hooks/useNotification';

/**
 * Schema de validación
 */
const editarNivelSchema = z.object({
  descripcion: z
    .string()
    .min(5, 'La descripción debe tener al menos 5 caracteres'),
  recomendaciones: z.string().optional(),
});

type EditarNivelFormData = z.infer<typeof editarNivelSchema>;

/**
 * Página para editar un nivel de referencia
 */
export const EditarNivel: React.FC = () => {
  const { encuestaId, nivelId } = useParams<{
    encuestaId: string;
    nivelId: string;
  }>();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [nivelNumero, setNivelNumero] = useState<number>(1);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditarNivelFormData>({
    resolver: zodResolver(editarNivelSchema),
  });

  useEffect(() => {
    if (nivelId) {
      loadNivel();
    }
  }, [nivelId]);

  const loadNivel = async () => {
    if (!nivelId) return;

    try {
      setIsLoading(true);
      const data = await nivelesApi.get(nivelId);
      setNivelNumero(data.numero);
      reset({
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
        err?.response?.data?.message ||
        err?.message ||
        'Error al actualizar el nivel';
      showError(errorMessage);
    }
  };

  // Colores por nivel
  const nivelColors = {
    1: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    2: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
    3: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
    4: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    5: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  };

  const color = nivelColors[nivelNumero as keyof typeof nivelColors];

  if (isLoading) {
    return <LoadingScreen message="Cargando nivel..." />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/encuestas/${encuestaId}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a la Evaluación
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">
            Editar Nivel {nivelNumero}
          </h1>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${color.bg} ${color.border} border`}>
            <Star size={16} className={color.text} />
            <span className={`text-sm font-medium ${color.text}`}>
              Nivel {nivelNumero}
            </span>
          </div>
        </div>
        <p className="text-gray-600 mt-2">
          Actualiza la descripción y recomendaciones del nivel
        </p>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Nivel de Madurez</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                {...register('descripcion')}
                rows={5}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe qué caracteriza este nivel de madurez..."
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.descripcion.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Explica claramente qué significa alcanzar este nivel
              </p>
            </div>

            {/* Recomendaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recomendaciones (Opcional)
              </label>
              <textarea
                {...register('recomendaciones')}
                rows={5}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="¿Qué se recomienda hacer para alcanzar este nivel?"
              />
              <p className="mt-1 text-xs text-gray-500">
                Proporciona acciones concretas para alcanzar este nivel
              </p>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(`/encuestas/${encuestaId}`)}
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