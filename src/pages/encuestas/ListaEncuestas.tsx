// src/pages/encuestas/ListaEncuestas.tsx
import React from 'react';
import { Upload } from 'lucide-react';
import { Button, LoadingScreen } from '@/components/common';
import { EncuestaStats } from './components/EncuestaStats';
import { EncuestaFilters } from './components/EncuestaFilters';
import { EncuestaCard } from './components/EncuestaCard';
import { usePermissions } from '@/hooks/usePermissions';
import { useListaEncuestas } from './hooks';

export const ListaEncuestas: React.FC = () => {
  const {
    isLoading,
    searchTerm, setSearchTerm,
    showInactive, setShowInactive,
    encuestasFiltradas,
    totalEncuestas,
    stats,
    handleDuplicar,
    handleToggleStatus,
    handleDelete,
    goToCargar,
  } = useListaEncuestas();

  const { isSuperuser } = usePermissions();

  if (isLoading) return <LoadingScreen message="Cargando evaluaciones ..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluaciones de Madurez</h1>
          <p className="text-gray-600 mt-1">Gestiona las evaluaciones y plantillas del sistema</p>
        </div>
        {isSuperuser && (
          <Button variant="primary" size="md" onClick={goToCargar}>
            <Upload size={18} className="mr-2" />
            Cargar Evaluación
          </Button>
        )}
      </div>

      <EncuestaStats
        totalEncuestas={stats.totalEncuestas}
        totalDimensiones={stats.totalDimensiones}
        totalPreguntas={stats.totalPreguntas}
        encuestasActivas={stats.encuestasActivas}
      />

      <EncuestaFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showInactive={showInactive}
        onShowInactiveChange={setShowInactive}
      />

      {encuestasFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron evaluaciones' : 'No hay evaluaciones cargadas'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza cargando una evaluación desde Excel'}
          </p>
          {isSuperuser && !searchTerm && (
            <Button variant="primary" onClick={goToCargar}>
              <Upload size={18} className="mr-2" />
              Cargar Primera Evaluación
            </Button>
          )}
        </div>
      ) : (
        <>
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
          <div className="text-center text-sm text-gray-500">
            Mostrando {encuestasFiltradas.length} de {totalEncuestas} evaluaciones
          </div>
        </>
      )}
    </div>
  );
};