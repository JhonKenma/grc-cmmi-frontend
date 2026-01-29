// src/pages/notificaciones/HistorialNotificaciones.tsx

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  Calendar,
  Filter,
  TrendingUp,
  Mail,
  ExternalLink,
  Check,
  X,
  Send
} from 'lucide-react';
import { Card, LoadingScreen, Button } from '@/components/common';
import { notificacionesApi } from '@/api/endpoints/notificaciones.api';
import {
  Notificacion,
  EstadisticasNotificaciones,
  PeriodoHistorial,
  getTipoColor,
  getPrioridadIcon,
} from '@/types/notificaciones.types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; 
type TabActiva = 'nuevas' | 'semana' | 'mes' | 'todas';

export const HistorialNotificaciones: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [tabActiva, setTabActiva] = useState<TabActiva>('nuevas');
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasNotificaciones | null>(null);
  const [totalMostradas, setTotalMostradas] = useState(0);
  const [totalGeneral, setTotalGeneral] = useState(0);

  useEffect(() => {
    loadData();
  }, [tabActiva]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar notificaciones según tab
      const historial = await notificacionesApi.getHistorial(tabActiva as PeriodoHistorial, 100);
      setNotificaciones(historial.notificaciones);
      setTotalMostradas(historial.mostrando);
      setTotalGeneral(historial.total);
      
      // Cargar estadísticas (solo una vez)
      if (!estadisticas) {
        const stats = await notificacionesApi.getEstadisticas();
        setEstadisticas(stats);
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      toast.error('Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarLeida = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificacionesApi.marcarLeida(id);
      setNotificaciones(prev =>
        prev.map(n => (n.id === id ? { ...n, leida: true } : n))
      );
      toast.success('Marcada como leída');
      
      // Actualizar estadísticas
      if (estadisticas) {
        setEstadisticas({
          ...estadisticas,
          nuevas: Math.max(0, estadisticas.nuevas - 1),
        });
      }
    } catch (error) {
      toast.error('Error al marcar como leída');
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      const result = await notificacionesApi.marcarTodasLeidas();
      toast.success(`${result.marcadas} notificaciones marcadas como leídas`);
      loadData();
    } catch (error) {
      toast.error('Error al marcar todas como leídas');
    }
  };

  const handleClickNotificacion = async (notif: Notificacion) => {
    // Marcar como leída si no lo está
    if (!notif.leida) {
      await notificacionesApi.marcarLeida(notif.id);
    }

    // Redirigir si tiene URL
    if (notif.url_accion) {
      if (notif.url_accion.startsWith('http')) {
        window.open(notif.url_accion, '_blank');
      } else {
        navigate(notif.url_accion);
      }
    }
  };

  if (loading && !notificaciones.length) {
    return <LoadingScreen message="Cargando notificaciones..." />;
  }

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Historial de Notificaciones
        </h1>
        <p className="text-gray-600 mt-1">
          Gestiona y revisa todas tus notificaciones
        </p>
      </div>
        {/* ⭐ AGREGAR ESTE BOTÓN */}
        {(user?.rol === 'superadmin' || user?.rol === 'administrador') && (
            <Button
            variant="primary"
            onClick={() => navigate('/notificaciones/enviar')}
            >
            <Send size={16} className="mr-2" />
            Enviar Notificación
            </Button>
        )}

      {/* ═══ ESTADÍSTICAS ═══ */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bell size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadisticas.total}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Mail size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">
                  Sin Leer
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {estadisticas.nuevas}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Clock size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">
                  Esta Semana
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {estadisticas.leidas_semana}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">
                  Este Mes
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {estadisticas.leidas_mes}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ═══ TABS Y FILTROS ═══ */}
      <Card className="p-0 border-none shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setTabActiva('nuevas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tabActiva === 'nuevas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔔 Nuevas
              {estadisticas && estadisticas.nuevas > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs font-bold">
                  {estadisticas.nuevas}
                </span>
              )}
            </button>

            <button
              onClick={() => setTabActiva('semana')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tabActiva === 'semana'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📅 Esta Semana
            </button>

            <button
              onClick={() => setTabActiva('mes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tabActiva === 'mes'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📆 Este Mes
            </button>

            <button
              onClick={() => setTabActiva('todas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tabActiva === 'todas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Todas
            </button>
          </div>

          {/* Acción: Marcar todas como leídas */}
          {estadisticas && estadisticas.nuevas > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarcarTodasLeidas}
            >
              <CheckCircle size={16} className="mr-2" />
              Marcar todas como leídas
            </Button>
          )}
        </div>

        {/* ═══ LISTA DE NOTIFICACIONES ═══ */}
        <div className="divide-y divide-gray-100">
          {notificaciones.length === 0 ? (
            <div className="p-12 text-center">
              <Bell size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay notificaciones
              </h3>
              <p className="text-gray-600">
                {tabActiva === 'nuevas'
                  ? 'No tienes notificaciones nuevas'
                  : `No hay notificaciones en este periodo`}
              </p>
            </div>
          ) : (
            <>
              {notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleClickNotificacion(notif)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notif.leida ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Indicador de leída/no leída */}
                    <div className="flex-shrink-0 mt-1">
                      {notif.leida ? (
                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full border font-medium ${getTipoColor(
                            notif.tipo
                          )}`}
                        >
                          {notif.tipo_display}
                        </span>
                        <span className="text-sm">
                          {getPrioridadIcon(notif.prioridad)}
                        </span>
                        {!notif.leida && (
                          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                            NUEVA
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-1">
                        {notif.titulo}
                      </h3>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {notif.mensaje}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {notif.tiempo_transcurrido}
                        </span>

                        {notif.email_enviado && (
                          <span className="flex items-center gap-1 text-green-600">
                            <Mail size={12} />
                            Email enviado
                          </span>
                        )}

                        {notif.url_accion && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <ExternalLink size={12} />
                            Ver más
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {!notif.leida && (
                        <button
                          onClick={(e) => handleMarcarLeida(notif.id, e)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Marcar como leída"
                        >
                          <Check size={18} className="text-blue-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer con info de paginación */}
        {notificaciones.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
            Mostrando {totalMostradas} de {totalGeneral} notificaciones
          </div>
        )}
      </Card>
    </div>
  );
};