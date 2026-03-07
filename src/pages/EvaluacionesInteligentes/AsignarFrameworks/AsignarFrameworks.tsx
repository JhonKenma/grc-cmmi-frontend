// src/pages/EvaluacionesInteligentes/AsignarFrameworks/AsignarFrameworks.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Check, Building2, Package } from 'lucide-react';
import { empresaFrameworkApi, evaluacionesInteligentesApi } from '@/api/endpoints';
import { empresaService } from '@/api/empresa.service';
import { FrameworkCard } from '@/components/iqevaluaciones/FrameworkCard';
import toast from 'react-hot-toast';
import type { Framework } from '@/types/iqevaluaciones.types';
import type { Empresa } from '@/types';

export const AsignarFrameworks = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);

  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<number | null>(null);
  const [frameworksSeleccionados, setFrameworksSeleccionados] = useState<number[]>([]);
  const [frameworksYaAsignados, setFrameworksYaAsignados] = useState<number[]>([]);
  const [notas, setNotas] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (empresaSeleccionada) {
      cargarFrameworksAsignados();
    }
  }, [empresaSeleccionada]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar empresas y frameworks
      const [empresasData, frameworksData] = await Promise.all([
        empresaService.getAll(),
        evaluacionesInteligentesApi.frameworks.listar(),
      ]);
      
      setEmpresas(empresasData);
      setFrameworks(frameworksData);
      
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('No tienes permisos para gestionar empresas');
      } else {
        toast.error('Error al cargar datos');
      }
      
      // Asegurar arrays vacíos en caso de error
      setEmpresas([]);
      setFrameworks([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarFrameworksAsignados = async () => {
    if (!empresaSeleccionada) return;

    try {
      const data = await empresaFrameworkApi.porEmpresa(empresaSeleccionada);
      const idsAsignados = data.frameworks
        .filter(fw => fw.activo)
        .map(fw => fw.framework);
      setFrameworksYaAsignados(idsAsignados);
    } catch (error) {
      console.error('Error al cargar frameworks asignados:', error);
    }
  };

  const handleFrameworkToggle = (frameworkId: number) => {
    setFrameworksSeleccionados((prev) =>
      prev.includes(frameworkId)
        ? prev.filter((id) => id !== frameworkId)
        : [...prev, frameworkId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!empresaSeleccionada) {
      toast.error('Selecciona una empresa');
      return;
    }

    if (frameworksSeleccionados.length === 0) {
      toast.error('Selecciona al menos un framework');
      return;
    }

    try {
      setSubmitting(true);

      const response = await empresaFrameworkApi.asignarVarios({
        empresa: empresaSeleccionada,
        frameworks: frameworksSeleccionados,
        notas: notas.trim() || undefined,
      });

      toast.success(
        `${response.total_asignados} framework(s) asignado(s) correctamente`
      );

      if (response.ya_existian.length > 0) {
        toast.success(
          `${response.ya_existian.length} framework(s) ya estaban asignados`
        );
      }

      // Limpiar formulario
      setFrameworksSeleccionados([]);
      setNotas('');
      // Recargar frameworks asignados
      await cargarFrameworksAsignados();
    } catch (error: any) {
      console.error('Error al asignar frameworks:', error);
      toast.error(
        error.response?.data?.message || 'Error al asignar frameworks'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  const empresaActual = empresas.find((e) => e.id === empresaSeleccionada);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/evaluaciones-inteligentes')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver al Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          Asignar Frameworks a Empresas
        </h1>
        <p className="text-gray-600 mt-2">
          Gestiona qué frameworks tiene disponibles cada empresa para crear evaluaciones
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Selección de Empresa */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="mr-2 text-primary-600" size={24} />
            1. Selecciona la Empresa
          </h2>

          <select
            value={empresaSeleccionada || ''}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : null;
              setEmpresaSeleccionada(value);
              setFrameworksSeleccionados([]);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Selecciona una empresa...</option>
            {empresas.map((empresa) => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nombre} {empresa.ruc ? `- RUC: ${empresa.ruc}` : ''}
              </option>
            ))}
          </select>

          {empresaActual && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Empresa seleccionada:</span>{' '}
                {empresaActual.nombre}
              </p>
              {frameworksYaAsignados.length > 0 && (
                <p className="text-sm text-blue-700 mt-2">
                  Esta empresa ya tiene {frameworksYaAsignados.length} framework(s) asignado(s)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Selección de Frameworks */}
        {empresaSeleccionada && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="mr-2 text-primary-600" size={24} />
                2. Selecciona los Frameworks a Asignar
              </h2>

              <p className="text-sm text-gray-600 mb-4">
                Marca los frameworks que quieres asignar. Los ya asignados aparecen marcados
                con un ✓.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {frameworks.map((framework) => {
                  const yaAsignado = frameworksYaAsignados.includes(framework.id);
                  const seleccionado = frameworksSeleccionados.includes(framework.id);

                  return (
                    <div key={framework.id} className="relative">
                      <FrameworkCard
                        framework={framework}
                        selected={seleccionado}
                        onSelect={(selected) => {
                            if (selected) {
                                setFrameworksSeleccionados(prev => [...prev, framework.id]);
                            } else {
                                setFrameworksSeleccionados(prev => prev.filter(id => id !== framework.id));
                            }
                            }}
                            showCheckbox
                      />
                      {yaAsignado && (
                        <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center text-xs font-medium">
                          <Check size={14} className="mr-1" />
                          Ya asignado
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {frameworksSeleccionados.length > 0 && (
                <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <p className="text-sm text-primary-900 font-medium">
                    {frameworksSeleccionados.length} framework(s) seleccionado(s) para asignar
                  </p>
                </div>
              )}
            </div>

            {/* Notas Opcionales */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. Notas (Opcional)
              </h2>

              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Agrega observaciones sobre esta asignación..."
              />
            </div>

            {/* Botones */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/evaluaciones-inteligentes')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting || frameworksSeleccionados.length === 0}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Asignando...
                  </>
                ) : (
                  <>Asignar {frameworksSeleccionados.length} Framework(s)</>
                )}
              </button>
            </div>
          </>
        )}
      </form>

      {/* Vista de Frameworks Asignados */}
      {empresaSeleccionada && frameworksYaAsignados.length > 0 && (
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Frameworks Ya Asignados a {empresaActual?.nombre}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {frameworks
              .filter((fw) => frameworksYaAsignados.includes(fw.id))
              .map((framework) => (
                <FrameworkCard
                  key={framework.id}
                  framework={framework}
                  selected={false}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};