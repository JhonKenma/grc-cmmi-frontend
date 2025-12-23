// src/pages/asignaciones/AsignarDimension.tsx - VERSIÓN CORREGIDA

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { encuestasApi } from '@/api/endpoints/encuestas.api';
import { dimensionesApi } from '@/api/endpoints/dimensiones.api';
import { usuarioService } from '@/api/usuario.service';
import { asignacionesApi } from '@/api/endpoints/asignaciones.api';
import { EncuestaListItem, DimensionListItem, Usuario } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export const AsignarDimension: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Datos
  const [encuestas, setEncuestas] = useState<EncuestaListItem[]>([]);
  const [dimensiones, setDimensiones] = useState<DimensionListItem[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Formulario
  const [encuestaId, setEncuestaId] = useState('');
  const [dimensionId, setDimensionId] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [requiereRevision, setRequiereRevision] = useState(false);

  // ==========================================
  // CARGAR DATOS INICIALES
  // ==========================================
  useEffect(() => {
    loadEncuestas();
    loadUsuarios();
  }, []);

  const loadEncuestas = async () => {
    try {
      setLoading(true);
      const data = await encuestasApi.list();
      const lista = Array.isArray(data) ? data : (data as any).results || [];
      setEncuestas(lista.filter((e: EncuestaListItem) => e.activo));
    } catch (error: any) {
      toast.error('Error al cargar evaluaciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

    const loadUsuarios = async () => {
    try {
        // ⭐ Sin parámetros - el backend ya filtra por permisos
        const usuariosData = await usuarioService.list();
        
        console.log('📦 Usuarios del API:', usuariosData);
        console.log('👤 Usuario actual:', user);
        
        // ⭐ FILTRO SIMPLE: Solo excluir superadmin y a mí mismo
        const usuariosFiltrados = usuariosData.filter((u: Usuario) => {
        const noEsSuperAdmin = u.rol !== 'superadmin';
        const noSoyYo = u.id !== user?.id;
        
        console.log(`Usuario: ${u.nombre_completo}`, {
            id: u.id,
            rol: u.rol,
            noEsSuperAdmin,
            'user.id': user?.id,
            noSoyYo,
            PASA: noEsSuperAdmin && noSoyYo
        });
        
        return noEsSuperAdmin && noSoyYo;
        });
        
        console.log('✅ Usuarios filtrados:', usuariosFiltrados);
        setUsuarios(usuariosFiltrados);
        
        if (usuariosFiltrados.length === 0) {
        toast.success('No hay usuarios disponibles para asignar');
        }
    } catch (error: any) {
        toast.error('Error al cargar usuarios');
        console.error(error);
    }
    };

  // ==========================================
  // CARGAR DIMENSIONES AL SELECCIONAR ENCUESTA
  // ==========================================
  useEffect(() => {
    if (encuestaId) {
      loadDimensiones(encuestaId);
    } else {
      setDimensiones([]);
      setDimensionId('');
    }
  }, [encuestaId]);

  const loadDimensiones = async (encuestaId: string) => {
    try {
      const data = await dimensionesApi.list(encuestaId);
      
      // ⭐ SOLUCIÓN: Manejar tanto array como objeto con .results
      const lista = Array.isArray(data) 
        ? data 
        : (data as any).results || [];
      
      console.log('📦 Dimensiones cargadas:', lista); // Debug
      
      setDimensiones(lista.filter((d: DimensionListItem) => d.activo));
    } catch (error: any) {
      toast.error('Error al cargar dimensiones');
      console.error('Error en loadDimensiones:', error);
    }
  };

  // ==========================================
  // SUBMIT
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!encuestaId || !dimensionId || !usuarioId || !fechaLimite) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        encuesta_id: encuestaId,
        dimension_id: dimensionId,
        usuario_id: parseInt(usuarioId),
        fecha_limite: fechaLimite,
        observaciones: observaciones || undefined,
        requiere_revision: requiereRevision,
      };

      console.log('📤 Enviando asignación:', payload); // Debug

      await asignacionesApi.asignarDimension(payload);

      const mensajeExtra = requiereRevision 
        ? ' La asignación requerirá tu revisión antes de completarse.'
        : '';

      toast.success(
        `Dimensión asignada exitosamente. Se envió notificación al usuario.${mensajeExtra}`
      );
      navigate('/asignaciones');
    } catch (error: any) {
      console.error('❌ Error al asignar:', error);
      console.error('❌ Response:', error.response?.data);
      
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.dimension_id?.[0] ||
        error.response?.data?.usuario_id?.[0] ||
        'Error al asignar dimensión';
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
            Asignar Dimensión
          </h1>
          <p className="text-gray-600 mt-1">
            Asigna una dimensión específica a un usuario de tu empresa
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
                  {encuesta.nombre} (v{encuesta.version})
                </option>
              ))}
            </select>
          </div>

          {/* Seleccionar Dimensión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dimensión <span className="text-red-500">*</span>
            </label>
            <select
              value={dimensionId}
              onChange={(e) => setDimensionId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={!encuestaId}
            >
              <option value="">
                {encuestaId 
                  ? dimensiones.length === 0 
                    ? 'No hay dimensiones disponibles'
                    : 'Selecciona una dimensión'
                  : 'Primero selecciona una evaluación'}
              </option>
              {dimensiones.map((dimension) => (
                <option key={dimension.id} value={dimension.id}>
                  {dimension.codigo} - {dimension.nombre} ({dimension.total_preguntas} preguntas)
                </option>
              ))}
            </select>
            {encuestaId && dimensiones.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ Esta evaluación no tiene dimensiones activas
              </p>
            )}
          </div>

          {/* Seleccionar Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asignar a <span className="text-red-500">*</span>
            </label>
            <select
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Selecciona un usuario</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre_completo} - {usuario.email}
                </option>
              ))}
            </select>
            {usuarios.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ No hay usuarios disponibles en tu empresa
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

          {/* Requiere Revisión */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <input
              type="checkbox"
              id="requiere_revision"
              checked={requiereRevision}
              onChange={(e) => setRequiereRevision(e.target.checked)}
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label
                htmlFor="requiere_revision"
                className="font-medium text-gray-900 cursor-pointer"
              >
                Requiere revisión antes de completarse
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Si activas esta opción, cuando el usuario complete la asignación, 
                deberás revisarla y aprobarla antes de que se marque como completada.
              </p>
            </div>
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
              placeholder="Instrucciones adicionales para el usuario..."
            />
          </div>

          {/* Botones */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting || usuarios.length === 0}
            >
              {submitting ? (
                <>Asignando...</>
              ) : (
                <>
                  <Send size={18} className="mr-2" />
                  Asignar Dimensión
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
              <li>• El usuario recibirá una notificación por email y en la campanita</li>
              <li>• Podrá ver las preguntas de la dimensión asignada</li>
              <li>• Deberá completar todas las preguntas antes de la fecha límite</li>
              {requiereRevision && (
                <li className="font-medium">• Cuando complete, tú deberás revisar y aprobar su trabajo</li>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};