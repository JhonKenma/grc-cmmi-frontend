// src/pages/asignaciones/AsignarEvaluacion.tsx - VERSIÓN CORREGIDA

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { encuestasApi } from '@/api/endpoints/encuestas.api';
import { evaluacionesApi } from '@/api/endpoints/evaluaciones.api';
import { empresaService } from '@/api/empresa.service'; // ⭐ USAR ESTE
import { usuarioService } from '@/api/usuario.service';
import { EncuestaListItem, Usuario, Empresa } from '@/types';
import toast from 'react-hot-toast';

export const AsignarEvaluacion: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Datos
  const [encuestas, setEncuestas] = useState<EncuestaListItem[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [administradores, setAdministradores] = useState<Usuario[]>([]);

  // Formulario
  const [encuestaId, setEncuestaId] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [administradorId, setAdministradorId] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // ==========================================
  // CARGAR DATOS
  // ==========================================
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (empresaId) {
      loadAdministradoresPorEmpresa(parseInt(empresaId));
    } else {
      setAdministradores([]);
      setAdministradorId('');
    }
  }, [empresaId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar encuestas activas
      const encuestasData = await encuestasApi.list();
      const encuestasArray = Array.isArray(encuestasData) 
        ? encuestasData 
        : (encuestasData as any).results || [];
      setEncuestas(encuestasArray.filter((e: EncuestaListItem) => e.activo));

      // ⭐ Cargar empresas usando empresaService
      const empresasData = await empresaService.getAll();
      setEmpresas(empresasData.filter((e: Empresa) => e.activo));

    } catch (error: any) {
      toast.error('Error al cargar datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const loadAdministradoresPorEmpresa = async (empresaIdNum: number) => {
    try {
      const adminsDeLaEmpresa = await usuarioService.getByEmpresa(empresaIdNum, 'administrador');
      console.log('✅ Administradores filtrados:', adminsDeLaEmpresa);
      setAdministradores(adminsDeLaEmpresa);
    } catch (error: any) {
      toast.error('Error al cargar administradores');
      console.error(error);
      setAdministradores([]);
    }
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!encuestaId || !empresaId || !administradorId || !fechaLimite) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        encuesta_id: encuestaId,
        empresa_id: parseInt(empresaId),
        administrador_id: parseInt(administradorId),
        fecha_limite: fechaLimite,
        observaciones: observaciones || undefined,
      };
      
      console.log('📤 Payload enviado:', payload);

      const response = await evaluacionesApi.asignar(payload);

      console.log('✅ Respuesta:', response);
      toast.success(response.message || 'Evaluación asignada exitosamente');
      navigate('/asignaciones/mis-evaluaciones');
      
    } catch (error: any) {
      console.error('❌ Error completo:', error);
      console.error('❌ Response data:', error.response?.data);
      
      const errorMsg = error.response?.data?.message || 
                       error.response?.data?.error ||
                       error.response?.data?.encuesta_id?.[0] ||
                       error.response?.data?.empresa_id?.[0] ||
                       error.response?.data?.administrador_id?.[0] ||
                       Object.values(error.response?.data || {}).flat().join(', ') ||
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
          onClick={() => navigate('/asignaciones/mis-evaluaciones')}
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Asignar Evaluación a Empresa
          </h1>
          <p className="text-gray-600 mt-1">
            Asigna una evaluación completa a una empresa y su administrador responsable
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

          {/* Seleccionar Empresa */}
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

          {/* Seleccionar Administrador */}
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
                {empresaId 
                  ? 'Selecciona un administrador' 
                  : 'Primero selecciona una empresa'}
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
              onClick={() => navigate('/asignaciones/mis-evaluaciones')}
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