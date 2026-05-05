// src/pages/asignaciones/AsignarEvaluacion.tsx
import React from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { useAsignarEvaluacion } from './hooks';

export const AsignarEvaluacion: React.FC = () => {
  const {
    loading, submitting,
    encuestas, empresas, administradores,
    encuestaId, setEncuestaId,
    empresaId, setEmpresaId,
    administradorId, setAdministradorId,
    fechaLimite, setFechaLimite,
    handleSubmit, goToLista,
  } = useAsignarEvaluacion();

  if (loading) return <LoadingScreen message="Cargando datos..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" onClick={goToLista}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asignar Evaluación a Empresa</h1>
          <p className="text-gray-600 mt-1">
            Asigna una evaluación completa a una empresa y su administrador responsable
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Evaluación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evaluación <span className="text-red-500">*</span>
            </label>
            <select
              value={encuestaId}
              onChange={(e) => setEncuestaId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Selecciona una evaluación</option>
              {encuestas.map((encuesta) => (
                <option key={encuesta.id} value={encuesta.id}>
                  {encuesta.nombre} (v{encuesta.version}) - {encuesta.total_dimensiones} dimensiones
                </option>
              ))}
            </select>
          </div>

          {/* Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa <span className="text-red-500">*</span>
            </label>
            <select
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Selecciona una empresa</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre} {empresa.ruc && `- ${empresa.ruc}`}
                </option>
              ))}
            </select>
          </div>

          {/* Administrador */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Administrador Responsable <span className="text-red-500">*</span>
            </label>
            <select
              value={administradorId}
              onChange={(e) => setAdministradorId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={!empresaId}
            >
              <option value="">
                {empresaId ? 'Selecciona un administrador' : 'Primero selecciona una empresa'}
              </option>
              {administradores.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.nombre_completo} - {admin.email}
                </option>
              ))}
            </select>
            {empresaId && administradores.length === 0 && (
              <p className="mt-1 text-sm text-orange-600">
                ⚠️ Esta empresa no tiene administradores asignados
              </p>
            )}
          </div>

          {/* Fecha Límite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Límite <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Botones */}
          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="lg" disabled={submitting}>
              {submitting ? 'Asignando...' : (
                <><Send size={18} className="mr-2" /> Asignar Evaluación</>
              )}
            </Button>
            <Button type="button" variant="secondary" size="lg" onClick={goToLista}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">ℹ️</span>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-blue-900 mb-1">¿Qué sucede al asignar?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• El administrador recibirá una notificación por email</li>
              <li>• Podrá ver la evaluación en su panel con todas las dimensiones</li>
              <li>• Podrá configurar los niveles deseados por dimensión</li>
              <li>• Podrá asignar dimensiones específicas a usuarios de su empresa</li>
              <li>• Se creará un registro de evaluación único para esta empresa</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};