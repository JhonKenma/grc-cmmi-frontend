// src/pages/asignaciones/MisTareas.tsx - VERSIÓN ACTUALIZADA CON REVISIÓN

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  FileText,
  Layers,
  Target,
  Eye,        // ⭐ NUEVO
  XCircle     // ⭐ NUEVO
} from 'lucide-react';
import { Card, LoadingScreen } from '@/components/common';
import { asignacionesApi } from '@/api/endpoints/asignaciones.api';
import { AsignacionListItem } from '@/types';
import { ConfigurarNivelModal } from '@/components/asignaciones/ConfigurarNivelModal';
import toast from 'react-hot-toast';

export const MisTareas: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [asignaciones, setAsignaciones] = useState<AsignacionListItem[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  // Estados para el modal
  const [modalConfigNivel, setModalConfigNivel] = useState(false);
  const [dimensionSeleccionada, setDimensionSeleccionada] = useState<{
    id: string;
    nombre: string;
    codigo: string;
  } | null>(null);

  // ==========================================
  // CARGAR ASIGNACIONES
  // ==========================================
  useEffect(() => {
    loadAsignaciones();
  }, []);

  const loadAsignaciones = async () => {
    try {
      setLoading(true);
      const data = await asignacionesApi.getMisAsignaciones();
      setAsignaciones(data.results);
    } catch (error: any) {
      toast.error('Error al cargar tus asignaciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FILTRAR ASIGNACIONES
  // ==========================================
  const asignacionesFiltradas = asignaciones.filter((asignacion) => {
    if (filtroEstado === 'todos') return true;
    return asignacion.estado === filtroEstado;
  });

  // ==========================================
  // ESTADÍSTICAS - ⭐ ACTUALIZADO
  // ==========================================
  const stats = {
    total: asignaciones.length,
    pendientes: asignaciones.filter((a) => a.estado === 'pendiente').length,
    en_progreso: asignaciones.filter((a) => a.estado === 'en_progreso').length,
    completadas: asignaciones.filter((a) => a.estado === 'completado').length,
    vencidas: asignaciones.filter((a) => a.estado === 'vencido').length,
    pendientes_revision: asignaciones.filter((a) => a.estado === 'pendiente_revision').length, // ⭐ NUEVO
    rechazadas: asignaciones.filter((a) => a.estado === 'rechazado').length, // ⭐ NUEVO
  };

  // ==========================================
  // HELPERS - ⭐ ACTUALIZADO
  // ==========================================
  const getEstadoBadge = (estado: string) => {
    const estados = {
      pendiente: { label: 'Pendiente', color: 'yellow', icon: '⏳' },
      en_progreso: { label: 'En Progreso', color: 'blue', icon: '🔄' },
      completado: { label: 'Completado', color: 'green', icon: '✅' },
      vencido: { label: 'Vencido', color: 'red', icon: '❌' },
      pendiente_revision: { label: 'En Revisión', color: 'purple', icon: '👁️' }, // ⭐ NUEVO
      rechazado: { label: 'Rechazado', color: 'orange', icon: '🔴' }, // ⭐ NUEVO
    };
    
    const config = estados[estado as keyof typeof estados] || estados.pendiente;
    
    const colorClasses = {
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      purple: 'bg-purple-100 text-purple-800',   // ⭐ NUEVO
      orange: 'bg-orange-100 text-orange-800',   // ⭐ NUEVO
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses[config.color as keyof typeof colorClasses]}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getDiasRestantesColor = (dias: number) => {
    if (dias < 0) return 'text-red-600';
    if (dias <= 3) return 'text-orange-600';
    if (dias <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  // ⭐ FUNCIÓN: Abrir modal de configurar nivel
  const handleConfigurarNivel = (asignacion: AsignacionListItem) => {
    if (asignacion.dimension_nombre && asignacion.dimension_id) {
      setDimensionSeleccionada({
        id: asignacion.dimension_id,
        nombre: asignacion.dimension_nombre,
        codigo: asignacion.dimension_codigo || 'DIM',
      });
      setModalConfigNivel(true);
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando tus tareas..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Tareas</h1>
        <p className="text-gray-600 mt-1">
          Gestiona tus evaluaciones y dimensiones asignadas
        </p>
      </div>

      {/* Estadísticas - ⭐ ACTUALIZADO con 2 nuevas cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <ClipboardList size={24} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En Progreso</p>
              <p className="text-2xl font-bold text-blue-600">{stats.en_progreso}</p>
            </div>
          </div>
        </Card>

        {/* ⭐ NUEVA CARD: En Revisión */}
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En Revisión</p>
              <p className="text-2xl font-bold text-purple-600">{stats.pendientes_revision}</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.completadas}</p>
            </div>
          </div>
        </Card>

        {/* ⭐ NUEVA CARD: Rechazadas */}
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <XCircle size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rechazadas</p>
              <p className="text-2xl font-bold text-orange-600">{stats.rechazadas}</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vencidas</p>
              <p className="text-2xl font-bold text-red-600">{stats.vencidas}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros - ⭐ ACTUALIZADO con nuevos estados */}
      <Card>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
          {[
            'todos', 
            'pendiente', 
            'en_progreso', 
            'pendiente_revision',  // ⭐ NUEVO
            'rechazado',          // ⭐ NUEVO
            'completado', 
            'vencido'
          ].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === estado
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {estado === 'todos' 
                ? 'Todos' 
                : estado === 'pendiente_revision'
                ? 'En Revisión'
                : estado.replace('_', ' ').charAt(0).toUpperCase() + estado.replace('_', ' ').slice(1)
              }
            </button>
          ))}
        </div>
      </Card>

      {/* Lista de asignaciones */}
      {asignacionesFiltradas.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes tareas {filtroEstado !== 'todos' && `en este estado`}
            </h3>
            <p className="text-gray-600">
              {filtroEstado !== 'todos'
                ? 'Cambia el filtro para ver otras tareas'
                : 'Cuando te asignen evaluaciones o dimensiones, aparecerán aquí'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {asignacionesFiltradas.map((asignacion) => (
            <Card key={asignacion.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                {/* Contenido principal */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {asignacion.encuesta_nombre}
                    </h3>
                    {getEstadoBadge(asignacion.estado)}
                    
                    {/* ⭐ NUEVO: Badge "Requiere Revisión" */}
                    {asignacion.requiere_revision && asignacion.estado !== 'completado' && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        📋 Requiere Revisión
                      </span>
                    )}
                  </div>

                  {asignacion.dimension_nombre && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Layers size={16} />
                      <span>Dimensión: {asignacion.dimension_nombre}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Vence: {new Date(asignacion.fecha_limite).toLocaleDateString()}</span>
                    </div>
                    <div className={`flex items-center gap-2 font-medium ${getDiasRestantesColor(asignacion.dias_restantes)}`}>
                      <Clock size={16} />
                      <span>
                        {asignacion.dias_restantes < 0
                          ? `Vencida hace ${Math.abs(asignacion.dias_restantes)} días`
                          : `${asignacion.dias_restantes} días restantes`}
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">Progreso</span>
                      <span className="text-xs font-medium text-primary-600">
                        {Number(asignacion.porcentaje_avance || 0).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          asignacion.estado === 'completado' 
                            ? 'bg-green-600'
                            : asignacion.estado === 'pendiente_revision'
                            ? 'bg-purple-600'
                            : asignacion.estado === 'rechazado'
                            ? 'bg-orange-600'
                            : 'bg-primary-600'
                        }`}
                        style={{ width: `${asignacion.porcentaje_avance}%` }}
                      />
                    </div>
                  </div>

                  {/* ⭐ NUEVO: Mensaje de rechazo */}
                  {asignacion.estado === 'rechazado' && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <XCircle size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-900">
                            Esta tarea fue rechazada y requiere correcciones
                          </p>
                          <p className="text-xs text-orange-700 mt-1">
                            Revisa los comentarios del revisor y vuelve a completarla
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ⭐ NUEVO: Mensaje de pendiente revisión */}
                  {asignacion.estado === 'pendiente_revision' && (
                    <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Eye size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-purple-900">
                            Tu tarea está en proceso de revisión
                          </p>
                          <p className="text-xs text-purple-700 mt-1">
                            El administrador revisará tu trabajo y te notificará cuando esté aprobado
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              {/* Botones de acción */}
              <div className="flex flex-col gap-2">
                {/* ⭐ Botón Responder - SOLO PARA USUARIOS */}
                {user?.rol !== 'administrador' && user?.rol !== 'superadmin' && (
                  <button
                    onClick={() => navigate(`/respuestas/${asignacion.id}`)}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      asignacion.estado === 'completado'
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : asignacion.estado === 'pendiente_revision'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : asignacion.estado === 'rechazado'
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-primary-600 hover:bg-primary-700'
                    } text-white`}
                  >
                    {asignacion.estado === 'completado'
                      ? 'Ver Respuestas'
                      : asignacion.estado === 'pendiente_revision'
                      ? 'En Revisión'
                      : asignacion.estado === 'rechazado'
                      ? 'Corregir'
                      : 'Responder'}
                  </button>
                )}

                {/* ⭐ Botón Ver Respuestas - SOLO PARA ADMINISTRADORES */}
                {(user?.rol === 'administrador' || user?.rol === 'superadmin') && (
                  <button
                    onClick={() => navigate(`/asignaciones/${asignacion.id}/revisar`)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Eye size={16} />
                    <span>Revisar Respuestas</span>
                  </button>
                )}

                {/* Botón: Configurar Niveles (solo para admins) */}
                {(user?.rol === 'administrador' || user?.rol === 'superadmin') && (
                  <button
                    onClick={() => {
                      if (asignacion.dimension_nombre && asignacion.dimension_id) {
                        handleConfigurarNivel(asignacion);
                      } else {
                        navigate(`/asignaciones/${asignacion.id}/configurar-niveles`);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    title={
                      asignacion.dimension_nombre
                        ? 'Configurar nivel deseado para esta dimensión'
                        : 'Configurar niveles deseados para todas las dimensiones'
                    }
                  >
                    <Target size={16} />
                    <span>
                      {asignacion.dimension_nombre ? 'Configurar Nivel' : 'Configurar Niveles'}
                    </span>
                  </button>
                )}
              </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de configurar nivel */}
      {modalConfigNivel && dimensionSeleccionada && (
        <ConfigurarNivelModal
          isOpen={modalConfigNivel}
          onClose={() => {
            setModalConfigNivel(false);
            setDimensionSeleccionada(null);
          }}
          dimensionId={dimensionSeleccionada.id}
          dimensionNombre={dimensionSeleccionada.nombre}
          dimensionCodigo={dimensionSeleccionada.codigo}
          onConfigured={() => {
            toast.success('Nivel configurado correctamente');
            loadAsignaciones();
          }}
        />
      )}
    </div>
  );
};