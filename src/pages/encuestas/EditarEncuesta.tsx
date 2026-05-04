// src/pages/encuestas/EditarEncuesta.tsx
import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useEditarEncuesta } from './hooks';

export const EditarEncuesta: React.FC = () => {
  const { isLoading, form, onSubmit, goToDetalle } = useEditarEncuesta();
  const { register, formState: { errors, isSubmitting } } = form;

  if (isLoading) return <LoadingScreen message="Cargando evaluación..." />;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={goToDetalle}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver al Detalle
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Editar Evaluación</h1>
        <p className="text-gray-600 mt-2">Actualiza los datos básicos de la evaluación</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <Input
              {...register('nombre')}
              label="Nombre de la Evaluación"
              placeholder="Ej: Evaluación de Madurez Digital 2025"
              error={errors.nombre?.message}
              required
            />

            <Input
              {...register('version')}
              label="Versión"
              placeholder="Ej: 1.0"
              error={errors.version?.message}
              helperText="Puedes usar números o letras (Ej: 1.0, v2.5, 2025-Q1)"
            />

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

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={goToDetalle}>
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