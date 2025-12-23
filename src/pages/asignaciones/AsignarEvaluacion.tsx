// src/pages/asignaciones/AsignarEvaluacion.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { encuestasApi } from '@/api/endpoints/encuestas.api';
import { usuarioService } from '@/api/usuario.service';
import { asignacionesApi } from '@/api/endpoints/asignaciones.api';
import { EncuestaListItem, Usuario } from '@/types';
import toast from 'react-hot-toast';

export const AsignarEvaluacion: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Datos
  const [encuestas, setEncuestas] = useState<EncuestaListItem[]>([]);
  const [administradores, setAdministradores] = useState<Usuario[]>([]);

  // Formulario
  const [encuestaId, setEncuestaId] = useState('');
  const [administradorId, setAdministradorId] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // ==========================================
  // CARGAR DATOS
  // ==========================================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar encuestas activas
      const encuestasData = await encuestasApi.list();
      const encuestasArray = Array.isArray(encuestasData) 
        ? encuestasData 
        : (encuestasData as any).results || [];
      setEncuestas(encuestasArray.filter((e: EncuestaListItem) => e.activo));

      // Cargar administradores
      const usuariosData = await usuarioService.getByRol('administrador');
      setAdministradores(usuariosData);
    } catch (error: any) {
      toast.error('Error al cargar datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SUBMIT
  // ==========================================

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!encuestaId || !administradorId || !fechaLimite) {
    toast.error('Completa todos los campos obligatorios');
    return;
  }

  try {
    setSubmitting(true);

    // ⭐ AGREGAR ESTE CONSOLE.LOG
    const payload = {
      encuesta_id: encuestaId,
      administrador_id: parseInt(administradorId),
      fecha_limite: fechaLimite,
      observaciones: observaciones || undefined,
    };
    console.log('📤 Payload enviado:', payload);

    await asignacionesApi.asignarEvaluacion(payload);

    toast.success('Evaluación asignada exitosamente. Se envió notificación al administrador.');
    navigate('/asignaciones');
  } catch (error: any) {
    // ⭐ AGREGAR ESTE CONSOLE.LOG
    console.error('❌ Error completo:', error);
    console.error('❌ Response data:', error.response?.data);
    
    const errorMsg = error.response?.data?.message || 
                     error.response?.data?.error ||
                     error.response?.data?.encuesta_id?.[0] ||
                     error.response?.data?.administrador_id?.[0] ||
                     'Error al asignar evaluación';
    toast.error(errorMsg);
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return <LoadingScreen message="Cargando datos..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/asignaciones')}
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Asignar Evaluación Completa
          </h1>
          <p className="text-gray-600 mt-1">
            Asigna una evaluación completa a un administrador de empresa
          </p>
        </div>
      </div>

      {/* Formulario */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleccionar Evaluación */}
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

          {/* Seleccionar Administrador */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Administrador <span className="text-red-500">*</span>
            </label>
            <select
              value={administradorId}
              onChange={(e) => setAdministradorId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Selecciona un administrador</option>
              {administradores.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.nombre_completo} - {admin.empresa_info?.nombre}
                </option>
              ))}
            </select>
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

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Instrucciones adicionales, prioridad, etc."
            />
          </div>

          {/* Botones */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
            >
              {submitting ? (
                <>Asignando...</>
              ) : (
                <>
                  <Send size={18} className="mr-2" />
                  Asignar Evaluación
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate('/asignaciones')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>

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
              ¿Qué sucede al asignar?
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• El administrador recibirá una notificación por email y en la campanita</li>
              <li>• Podrá ver la evaluación completa con todas sus dimensiones</li>
              <li>• Podrá asignar dimensiones específicas a usuarios de su empresa</li>
              <li>• Puede configurar los niveles deseados por dimensión</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};