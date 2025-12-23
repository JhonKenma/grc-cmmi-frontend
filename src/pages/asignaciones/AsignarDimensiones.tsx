// src/pages/asignaciones/AsignarDimensiones.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Check, AlertCircle, User } from 'lucide-react';
import { Button, Card, LoadingScreen } from '@/components/common';
import { 
  encuestasApi, 
  asignacionesApi,
  usuariosApi 
} from '@/api/endpoints';
import { EncuestaListItem, DimensionListItem, Usuario } from '@/types';
import { DetalleAsignacion } from '@/api/endpoints/asignaciones.api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export const AsignarDimensiones: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingDimensiones, setLoadingDimensiones] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Datos
  const [encuestas, setEncuestas] = useState<EncuestaListItem[]>([]);
  const [dimensionesDisponibles, setDimensionesDisponibles] = useState<DimensionListItem[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [detalleAsignaciones, setDetalleAsignaciones] = useState<DetalleAsignacion[]>([]); // ⭐ AGREGADO
  const [infoDimensiones, setInfoDimensiones] = useState<{
    total: number;
    asignadas: number;
    disponibles: number;
  }>({ total: 0, asignadas: 0, disponibles: 0 });

  // Formulario
  const [encuestaId, setEncuestaId] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [dimensionesSeleccionadas, setDimensionesSeleccionadas] = useState<string[]>([]);
  const [fechaLimite, setFechaLimite] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [requiereRevision, setRequiereRevision] = useState(false);

  // ==========================================
  // CARGAR DATOS INICIALES
  // ==========================================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadEncuestas(), loadUsuarios()]);
    } catch (error: any) {
      toast.error('Error al cargar datos iniciales');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadEncuestas = async () => {
    try {
      const data = await encuestasApi.list();
      const lista = Array.isArray(data) ? data : (data as any).results || [];
      setEncuestas(lista.filter((e: EncuestaListItem) => e.activo));
    } catch (error: any) {
      toast.error('Error al cargar evaluaciones');
      console.error(error);
    }
  };

  const loadUsuarios = async () => {
    try {
      const usuariosData = await usuariosApi.list();
      const usuariosFiltrados = usuariosData.filter(
        (u: Usuario) => u.rol !== 'superadmin' && u.id !== user?.id
      );
      setUsuarios(usuariosFiltrados);
    } catch (error: any) {
      toast.error('Error al cargar usuarios');
      console.error(error);
    }
  };

  // ==========================================
  // ⭐ CARGAR DIMENSIONES DISPONIBLES (ACTUALIZADO)
  // ==========================================
  useEffect(() => {
    if (encuestaId && user?.empresa) {
      loadDimensionesDisponibles();
    } else {
      setDimensionesDisponibles([]);
      setDimensionesSeleccionadas([]);
      setDetalleAsignaciones([]);
      setInfoDimensiones({ total: 0, asignadas: 0, disponibles: 0 });
    }
  }, [encuestaId]);

  const loadDimensionesDisponibles = async () => {
    if (!encuestaId || !user?.empresa) return;
    
    try {
      setLoadingDimensiones(true);
      
      // ⭐ CAMBIO: Pasar empresa_id en lugar de usuario_id
      const data = await asignacionesApi.getDimensionesDisponibles(
        encuestaId,
        user.empresa
      );
      
      console.log('📦 Dimensiones disponibles:', data);
      
      setDimensionesDisponibles(data.dimensiones);
      setDetalleAsignaciones(data.detalle_asignaciones || []); // ⭐ NUEVO
      setInfoDimensiones({
        total: data.total_dimensiones,
        asignadas: data.dimensiones_asignadas,
        disponibles: data.dimensiones_disponibles
      });
      
      setDimensionesSeleccionadas([]);
      
    } catch (error: any) {
      toast.error('Error al cargar dimensiones disponibles');
      console.error(error);
    } finally {
      setLoadingDimensiones(false);
    }
  };

  // ==========================================
  // MANEJO DE SELECCIÓN
  // ==========================================
  const handleToggleDimension = (dimensionId: string) => {
    setDimensionesSeleccionadas(prev => {
      if (prev.includes(dimensionId)) {
        return prev.filter(id => id !== dimensionId);
      } else {
        return [...prev, dimensionId];
      }
    });
  };

  const handleSeleccionarTodas = () => {
    if (dimensionesSeleccionadas.length === dimensionesDisponibles.length) {
      setDimensionesSeleccionadas([]);
    } else {
      setDimensionesSeleccionadas(dimensionesDisponibles.map(d => d.id));
    }
  };

  // ==========================================
  // SUBMIT
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!encuestaId || !usuarioId || dimensionesSeleccionadas.length === 0 || !fechaLimite) {
      toast.error('Completa todos los campos y selecciona al menos una dimensión');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        encuesta_id: encuestaId,
        dimension_ids: dimensionesSeleccionadas,
        usuario_id: parseInt(usuarioId),
        fecha_limite: fechaLimite,
        observaciones: observaciones || undefined,
        requiere_revision: requiereRevision,
      };

      console.log('📤 Enviando asignación múltiple:', payload);

      const response = await asignacionesApi.asignarDimension(payload);

      const mensajeExtra = requiereRevision 
        ? ' Estas asignaciones requerirán tu revisión.'
        : '';

      const totalAsignadas = response?.data?.total_asignadas || dimensionesSeleccionadas.length;

      toast.success(
        `${totalAsignadas} dimensión(es) asignada(s) exitosamente.${mensajeExtra}`
      );
      
      navigate('/asignaciones');
    } catch (error: any) {
      console.error('❌ Error al asignar:', error);
      
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.dimension_ids?.[0] ||
        'Error al asignar dimensiones';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando datos..." />;
  }

  const todasSeleccionadas = dimensionesSeleccionadas.length === dimensionesDisponibles.length && dimensionesDisponibles.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            Asignar Dimensiones
          </h1>
          <p className="text-gray-600 mt-1">
            Asigna dimensiones a usuarios de tu empresa (cada dimensión solo se asigna una vez)
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleccionar Evaluación y Usuario */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Evaluación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evaluación <span className="text-red-500">*</span>
              </label>
              <select
                value={encuestaId}
                onChange={(e) => {
                  setEncuestaId(e.target.value);
                  setDimensionesSeleccionadas([]);
                  setUsuarioId('');
                }}
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

            {/* Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asignar a <span className="text-red-500">*</span>
              </label>
              <select
                value={usuarioId}
                onChange={(e) => {
                  setUsuarioId(e.target.value);
                  setDimensionesSeleccionadas([]);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={!encuestaId}
              >
                <option value="">Selecciona un usuario</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre_completo}
                  </option>
                ))}
              </select>
              {usuarios.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  ⚠️ No hay usuarios disponibles
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* ⭐ INFORMACIÓN DE DIMENSIONES (Mejorada con detalle) */}
        {encuestaId && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Estado de Dimensiones en tu Empresa
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-blue-700">
                    <span>Total: {infoDimensiones.total}</span>
                    <span>•</span>
                    <span>Asignadas: {infoDimensiones.asignadas}</span>
                    <span>•</span>
                    <span className="font-medium">Disponibles: {infoDimensiones.disponibles}</span>
                  </div>
                </div>
                
                {dimensionesDisponibles.length > 0 && usuarioId && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleSeleccionarTodas}
                  >
                    {todasSeleccionadas ? 'Deseleccionar Todas' : 'Seleccionar Todas'}
                  </Button>
                )}
              </div>

              {/* ⭐ MOSTRAR DETALLE DE ASIGNACIONES */}
              {detalleAsignaciones.length > 0 && (
                <div className="border-t border-blue-200 pt-3 mt-3">
                  <p className="text-xs font-medium text-blue-900 mb-2">
                    📋 Dimensiones ya asignadas:
                  </p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {detalleAsignaciones.map((detalle) => (
                      <div 
                        key={detalle.dimension_id}
                        className="flex items-center justify-between text-xs text-blue-700 bg-white/50 px-2 py-1.5 rounded"
                      >
                        <span className="flex-1">
                          <strong className="font-mono">{detalle.dimension_codigo}</strong> - {detalle.dimension_nombre}
                        </span>
                        <span className="flex items-center gap-1 text-blue-600 ml-2">
                          <User size={12} />
                          {detalle.asignado_a}
                          {detalle.porcentaje_avance > 0 && (
                            <span className="text-green-700 ml-1 font-medium">
                              ({detalle.porcentaje_avance.toFixed(0)}%)
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Lista de Dimensiones Disponibles */}
        {loadingDimensiones ? (
          <Card>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando dimensiones disponibles...</p>
            </div>
          </Card>
        ) : dimensionesDisponibles.length === 0 && encuestaId ? (
          <Card>
            <div className="text-center py-8">
              <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
              <p className="text-gray-900 font-medium mb-2">
                Todas las dimensiones están asignadas
              </p>
              <p className="text-gray-600 text-sm">
                Ya no hay dimensiones disponibles para asignar en esta evaluación.
              </p>
            </div>
          </Card>
        ) : dimensionesDisponibles.length > 0 && usuarioId ? (
          <Card>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selecciona las dimensiones <span className="text-red-500">*</span>
                <span className="text-gray-500 font-normal ml-2">
                  ({dimensionesSeleccionadas.length} seleccionada{dimensionesSeleccionadas.length !== 1 ? 's' : ''})
                </span>
              </label>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {dimensionesDisponibles.map((dimension) => {
                  const isSelected = dimensionesSeleccionadas.includes(dimension.id);
                  
                  return (
                    <div
                      key={dimension.id}
                      onClick={() => handleToggleDimension(dimension.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-primary-600 border-primary-600' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <Check size={16} className="text-white" />}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {dimension.codigo}
                            </span>
                            <h3 className="font-medium text-gray-900">
                              {dimension.nombre}
                            </h3>
                          </div>
                          
                          {dimension.descripcion && (
                            <p className="text-sm text-gray-600 mt-1">
                              {dimension.descripcion}
                            </p>
                          )}
                          
                          <p className="text-xs text-gray-500 mt-2">
                            📋 {dimension.total_preguntas} preguntas
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        ) : encuestaId && !usuarioId ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600">
                👆 Selecciona un usuario para continuar
              </p>
            </div>
          </Card>
        ) : null}

        {/* Fecha Límite */}
        {dimensionesDisponibles.length > 0 && usuarioId && (
          <>
            <Card>
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
            </Card>

            {/* Requiere Revisión */}
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
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
                    Requiere revisión
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    Si activas esta opción, cuando el usuario complete las dimensiones, 
                    deberás revisarlas y aprobarlas antes de que se marquen como completadas.
                  </p>
                </div>
              </div>
            </Card>

            {/* Observaciones */}
            <Card>
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
            </Card>

            {/* Botones */}
            <Card>
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={submitting || dimensionesSeleccionadas.length === 0}
                >
                  {submitting ? (
                    <>Asignando...</>
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      Asignar {dimensionesSeleccionadas.length} Dimensión{dimensionesSeleccionadas.length !== 1 ? 'es' : ''}
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
            </Card>
          </>
        )}
      </form>
    </div>
  );
};