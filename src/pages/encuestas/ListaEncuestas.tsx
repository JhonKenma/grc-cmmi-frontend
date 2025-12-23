// src/pages/encuestas/ListaEncuestas.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Download, RefreshCw } from 'lucide-react';
import { Button, LoadingScreen } from '@/components/common';
import { EncuestaStats } from './components/EncuestaStats';
import { EncuestaFilters } from './components/EncuestaFilters';
import { EncuestaCard } from './components/EncuestaCard';
import { encuestasApi } from '@/api/endpoints';
import { useNotification } from '@/hooks/useNotification';
import { usePermissions } from '@/hooks/usePermissions';
import { EncuestaListItem } from '@/types';
import { ROUTES } from '@/utils/constants';

export const ListaEncuestas: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const { isSuperuser } = usePermissions();

  // Estados
  const [encuestas, setEncuestas] = useState<EncuestaListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  // Cargar encuestas
  useEffect(() => {
    loadEncuestas();
  }, []);

  const loadEncuestas = async () => {
    try {
        setIsLoading(true);
        const data = await encuestasApi.list() as EncuestaListItem[] | { results: EncuestaListItem[] };

        const lista =
        Array.isArray(data)
            ? data
            : Array.isArray(data.results)
            ? data.results
            : [];

        setEncuestas(lista);
    } catch (err: any) {
        showError(err?.message || 'Error al cargar las evaluaciones');
    } finally {
        setIsLoading(false);
    }
    };


  // Filtrar encuestas
  const encuestasFiltradas = encuestas.filter((encuesta) => {
    const matchSearch = encuesta.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchStatus = showInactive || encuesta.activo;
    return matchSearch && matchStatus;
  });

  // Calcular estadísticas
  const stats = {
    totalEncuestas: encuestas.length,
    totalDimensiones: encuestas.reduce(
      (sum, e) => sum + e.total_dimensiones,
      0
    ),
    totalPreguntas: encuestas.reduce((sum, e) => sum + e.total_preguntas, 0),
    encuestasActivas: encuestas.filter((e) => e.activo).length,
  };

  // Handlers
  const handleDuplicar = async (id: string) => {
    const encuesta = encuestas.find((e) => e.id === id);
    if (!encuesta) return;

    const nuevoNombre = prompt(
      'Ingresa el nombre para la evaluación duplicada:',
      `${encuesta.nombre} (Copia)`
    );

    if (!nuevoNombre) return;

    try {
      await encuestasApi.duplicar(id, nuevoNombre);
      success('Evaluación duplicada exitosamente');
      loadEncuestas();
    } catch (err: any) {
      showError(err?.message || 'Error al duplicar la encuesta');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await encuestasApi.toggleEstado(id);  // ✅ Usar la API correcta
      success('Estado actualizado correctamente');
      loadEncuestas();
    } catch (err: any) {
      showError(err?.response?.data?.message || err?.message || 'Error al cambiar el estado');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await encuestasApi.delete(id);
      success('Evaluación eliminada correctamente');
      loadEncuestas();
    } catch (err: any) {
      showError(err?.message || 'Error al eliminar la evaluación');
    }
  };

  const handleDescargarPlantilla = async () => {
    try {
      const blob = await encuestasApi.descargarPlantilla();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla_encuesta.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      success('Plantilla descargada correctamente');
    } catch (err: any) {
      showError(err?.message || 'Error al descargar la plantilla');
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Cargando evaluaciones ..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Evaluaciones de Madurez
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona las evaluaciones y plantillas del sistema
          </p>
        </div>

        {/* Botones de acción (solo superuser) */}
        {isSuperuser && (
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={handleDescargarPlantilla}
            >
              <Download size={18} className="mr-2" />
              Plantilla
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(ROUTES.ENCUESTA_CARGAR)}
            >
              <Upload size={18} className="mr-2" />
              Cargar Excel
            </Button>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <EncuestaStats
        totalEncuestas={stats.totalEncuestas}
        totalDimensiones={stats.totalDimensiones}
        totalPreguntas={stats.totalPreguntas}
        encuestasActivas={stats.encuestasActivas}
      />

      {/* Filtros */}
      <EncuestaFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showInactive={showInactive}
        onShowInactiveChange={setShowInactive}
      />

      {/* Lista de encuestas */}
      {encuestasFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm
              ? 'No se encontraron evaluaciones'
              : 'No hay evaluaciones cargadas'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza cargando una evaluaciones desde Excel'}
          </p>
          {isSuperuser && !searchTerm && (
            <Button
              variant="primary"
              onClick={() => navigate(ROUTES.ENCUESTA_CARGAR)}
            >
              <Upload size={18} className="mr-2" />
              Cargar Primera Evaluación
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Grid de cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {encuestasFiltradas.map((encuesta) => (
              <EncuestaCard
                key={encuesta.id}
                encuesta={encuesta}
                onDuplicar={handleDuplicar}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Contador */}
          <div className="text-center text-sm text-gray-500">
            Mostrando {encuestasFiltradas.length} de {encuestas.length}{' '}
            evaluaciones 
          </div>
        </>
      )}
    </div>
  );
};