// src/components/asignaciones/ConfigurarNivelModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Target, Save } from 'lucide-react';
import { Button, Card } from '@/components/common';
import { configNivelesApi } from '@/api/endpoints/config-niveles.api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface ConfigurarNivelModalProps {
  isOpen: boolean;
  onClose: () => void;
  dimensionId: string;
  dimensionNombre: string;
  dimensionCodigo: string;
  onConfigured?: () => void;
}

export const ConfigurarNivelModal: React.FC<ConfigurarNivelModalProps> = ({
  isOpen,
  onClose,
  dimensionId,
  dimensionNombre,
  dimensionCodigo,
  onConfigured,
}) => {
  const { user } = useAuth();
  const [nivelDeseado, setNivelDeseado] = useState<number>(3);
  const [motivoCambio, setMotivoCambio] = useState('');
  const [loading, setLoading] = useState(false);
  const [configExistente, setConfigExistente] = useState<any>(null);

  // ==========================================
  // CARGAR CONFIGURACIÓN EXISTENTE
  // ==========================================
  useEffect(() => {
    if (isOpen && user?.empresa) {
      loadConfigExistente();
    }
  }, [isOpen, dimensionId, user?.empresa]);

  const loadConfigExistente = async () => {
    if (!user?.empresa) return;

    try {
      const data = await configNivelesApi.getPorDimension(dimensionId, user.empresa);
      
      if ('nivel_deseado' in data && data.nivel_deseado) {
        setConfigExistente(data);
        setNivelDeseado(data.nivel_deseado as number);
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  };

  // ==========================================
  // GUARDAR CONFIGURACIÓN
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.empresa) {
      toast.error('No tienes empresa asignada');
      return;
    }

    try {
      setLoading(true);

      if (configExistente && 'id' in configExistente) {
        // Actualizar existente
        await configNivelesApi.update(configExistente.id, {
          nivel_deseado: nivelDeseado as 1 | 2 | 3 | 4 | 5,
          motivo_cambio: motivoCambio || undefined,
        });
        toast.success('Nivel deseado actualizado');
      } else {
        // Crear nuevo
        await configNivelesApi.create({
          dimension: dimensionId,
          empresa: user.empresa,
          nivel_deseado: nivelDeseado as 1 | 2 | 3 | 4 | 5,
          motivo_cambio: motivoCambio || undefined,
        });
        toast.success('Nivel deseado configurado');
      }

      onConfigured?.();
      onClose();
    } catch (error: any) {
      console.error('Error al guardar:', error);
      toast.error(
        error.response?.data?.message || 'Error al configurar nivel deseado'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // ==========================================
  // DESCRIPCIONES DE NIVELES
  // ==========================================
  const nivelesInfo = [
    {
      nivel: 1,
      nombre: 'Inicial',
      descripcion: 'Procesos ad-hoc, sin documentación formal',
      color: 'bg-red-500',
    },
    {
      nivel: 2,
      nombre: 'Gestionado',
      descripcion: 'Procesos documentados, pero no estandarizados',
      color: 'bg-orange-500',
    },
    {
      nivel: 3,
      nombre: 'Definido',
      descripcion: 'Procesos estandarizados y documentados',
      color: 'bg-yellow-500',
    },
    {
      nivel: 4,
      nombre: 'Cuantitativamento Gestionado',
      descripcion: 'Procesos medidos y controlados',
      color: 'bg-blue-500',
    },
    {
      nivel: 5,
      nombre: 'Optimizado',
      descripcion: 'Mejora continua de procesos',
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Target size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Configurar Nivel Deseado
              </h2>
              <p className="text-sm text-gray-600">
                {dimensionCodigo} - {dimensionNombre}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selector de nivel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nivel Deseado <span className="text-red-500">*</span>
            </label>

            <div className="space-y-3">
              {nivelesInfo.map((nivel) => (
                <button
                  key={nivel.nivel}
                  type="button"
                  onClick={() => setNivelDeseado(nivel.nivel)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    nivelDeseado === nivel.nivel
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 ${nivel.color} text-white rounded-lg flex items-center justify-center font-bold text-xl`}
                    >
                      {nivel.nivel}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        Nivel {nivel.nivel}: {nivel.nombre}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {nivel.descripcion}
                      </p>
                    </div>
                    {nivelDeseado === nivel.nivel && (
                      <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Motivo del cambio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo o Justificación (Opcional)
            </label>
            <textarea
              value={motivoCambio}
              onChange={(e) => setMotivoCambio(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="¿Por qué se estableció este nivel como objetivo?"
            />
          </div>

          {/* Información */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">ℹ️</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-1">
                  ¿Qué es el nivel deseado?
                </h3>
                <p className="text-sm text-blue-700">
                  Es el objetivo que tu empresa quiere alcanzar en esta dimensión.
                  Se utilizará para calcular el GAP entre tu nivel actual y el objetivo.
                </p>
              </div>
            </div>
          </Card>

          {/* Botones */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                'Guardando...'
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  {configExistente && 'id' in configExistente
                    ? 'Actualizar Nivel'
                    : 'Guardar Nivel'}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={onClose}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};