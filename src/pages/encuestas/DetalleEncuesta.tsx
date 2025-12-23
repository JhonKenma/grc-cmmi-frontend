// src/pages/encuestas/DetalleEncuesta.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Power, PowerOff } from 'lucide-react'; 
import {
  ArrowLeft,
  FileText,
  Layers,
  CheckCircle,
  Calendar,
  Edit,
  Copy,
  Download,
} from 'lucide-react';
import { Button, LoadingScreen, Card } from '@/components/common';
import { DimensionCard } from './components/DimensionCard';
import { encuestasApi } from '@/api/endpoints';
import { useNotification } from '@/hooks/useNotification';
import { usePermissions } from '@/hooks/usePermissions';
import { Encuesta } from '@/types';
import { ROUTES } from '@/utils/constants';
import { formatDate } from '@/utils/helpers';

export const DetalleEncuesta: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const { isSuperuser } = usePermissions();

  const [encuesta, setEncuesta] = useState<Encuesta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      setEncuesta(data);
    } catch (err: any) {
      showError(err?.message || 'Error al cargar la encuesta');
      navigate(ROUTES.ENCUESTAS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicar = async () => {
    if (!encuesta) return;

    const nuevoNombre = prompt(
      'Ingresa el nombre para la encuesta duplicada:',
      `${encuesta.nombre} (Copia)`
    );

    if (!nuevoNombre) return;

    try {
      await encuestasApi.duplicar(encuesta.id, nuevoNombre);
      success('Encuesta duplicada exitosamente');
      navigate(ROUTES.ENCUESTAS);
    } catch (err: any) {
      showError(err?.message || 'Error al duplicar la encuesta');
    }
  };

  const handleExportarExcel = async () => {
    // TODO: Implementar exportar a Excel
    success('Función disponible próximamente');
  };

  if (isLoading) {
    return <LoadingScreen message="Cargando encuesta..." />;
  }

  if (!encuesta) {
    return null;
  }

  const handleToggleEstado = async () => {
    if (!encuesta) return;

    const accion = encuesta.activo ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Estás seguro de ${accion} esta evaluación?`)) {
      return;
    }

    try {
      await encuestasApi.toggleEstado(encuesta.id);
      success(`Evaluación ${accion}da exitosamente`);
      loadEncuesta(); // Recargar para actualizar el estado
    } catch (err: any) {
      showError(err?.message || `Error al ${accion} la evaluación`);
    }
  };  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <button
            onClick={() => navigate(ROUTES.ENCUESTAS)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-3 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver a Encuestas
          </button>

          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {encuesta.nombre}
            </h1>
            <span className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
              v{encuesta.version}
            </span>
          </div>

          {encuesta.descripcion && (
            <p className="text-gray-600 mt-2">{encuesta.descripcion}</p>
          )}

          {/* Badges */}
          <div className="flex items-center gap-2 mt-3">
            {encuesta.activo ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Activa
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Inactiva
              </span>
            )}
            {encuesta.es_plantilla && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Plantilla
              </span>
            )}
          </div>
        </div>

        {/* Botones de acción (solo superuser) */}
        {isSuperuser && (
          <div className="flex items-center gap-3">

            <Button variant="secondary" size="md" onClick={handleExportarExcel}>
              <Download size={18} className="mr-2" />
              Exportar
            </Button>

            {/* ✅ NUEVO: Botón Editar */}
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/encuestas/${encuesta.id}/editar`)}
            >
              <Edit size={18} className="mr-2" />
              Editar
            </Button>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dimensiones</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {encuesta.total_dimensiones}
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Layers className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Preguntas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {encuesta.total_preguntas}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Creada</p>
              <p className="text-base font-semibold text-gray-900 mt-1">
                {formatDate(encuesta.fecha_creacion)}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actualizada</p>
              <p className="text-base font-semibold text-gray-900 mt-1">
                {formatDate(encuesta.fecha_actualizacion)}
              </p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Dimensiones */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Layers size={24} className="text-primary-600" />
          Dimensiones y Preguntas
        </h2>

        {encuesta.dimensiones.length === 0 ? (
          <Card>
            <p className="text-center text-gray-600 py-8">
              Esta encuesta no tiene dimensiones configuradas
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {encuesta.dimensiones
              .sort((a, b) => a.orden - b.orden)
              .map((dimension, index) => (
                <DimensionCard
                  key={dimension.id}
                  dimension={dimension}
                  numero={index + 1}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};