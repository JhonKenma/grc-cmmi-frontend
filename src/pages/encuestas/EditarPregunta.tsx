// src/pages/encuestas/EditarPregunta.tsx

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
import { preguntasApi } from '@/api/endpoints';
import { useNotification } from '@/hooks/useNotification';

/**
 * Schema de validación
 */
const editarPreguntaSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido').max(50),
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(500),
  texto: z.string().min(10, 'El texto debe tener al menos 10 caracteres'),
  peso: z.coerce.number().min(0.1, 'El peso debe ser mayor a 0'),
  orden: z.coerce.number().min(0, 'El orden debe ser mayor o igual a 0'),
  obligatoria: z.boolean().optional(),
});

// 👈 ESTA ES LA CORRECCIÓN
type EditarPreguntaFormData = z.input<typeof editarPreguntaSchema>;

/**
 * Página para editar una pregunta
 */
export const EditarPregunta: React.FC = () => {
  const { encuestaId, preguntaId } = useParams<{
    encuestaId: string;
    preguntaId: string;
  }>();

  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditarPreguntaFormData>({
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

      reset({
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
      const payload = {
        ...data,
        peso: Number(data.peso),
        orden: Number(data.orden),
      };

      await preguntasApi.update(preguntaId, payload);

      success('Pregunta actualizada exitosamente');
      navigate(`/encuestas/${encuestaId}`);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Error al actualizar la pregunta';

      showError(errorMessage);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Cargando pregunta..." />;
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
        <h1 className="text-3xl font-bold text-gray-900">Editar Pregunta</h1>
        <p className="text-gray-600 mt-2">Actualiza los datos de la pregunta</p>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Pregunta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Código */}
            <Input
              {...register('codigo')}
              label="Código"
              placeholder="Ej: GOB-1.1"
              error={errors.codigo?.message}
              required
              helperText="Código único de la pregunta dentro de su dimensión"
            />

            {/* Título */}
            <Input
              {...register('titulo')}
              label="Título"
              placeholder="Ej: Política de Seguridad"
              error={errors.titulo?.message}
              required
            />

            {/* Texto completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texto de la Pregunta *
              </label>
              <textarea
                {...register('texto')}
                rows={4}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="¿Existe una política de seguridad documentada y aprobada?"
              />
              {errors.texto && (
                <p className="mt-1 text-sm text-red-600">{errors.texto.message}</p>
              )}
            </div>

            {/* Grid para peso y orden */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register('peso')}
                type="text"
                step="0.1"
                label="Peso"
                placeholder="1.0"
                error={errors.peso?.message}
                required
                helperText="Ponderación de la pregunta"
              />

              <Input
                {...register('orden')}
                type="text"
                label="Orden"
                placeholder="1"
                error={errors.orden?.message}
                required
                helperText="Orden de aparición"
              />
            </div>

            {/* Obligatoria */}
            <div className="flex items-center gap-2">
              <input
                {...register('obligatoria')}
                type="checkbox"
                id="obligatoria"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="obligatoria" className="text-sm font-medium text-gray-700">
                Pregunta obligatoria
              </label>
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
