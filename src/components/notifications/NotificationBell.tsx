// src/components/notifications/NotificationBell.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { notificacionesApi } from '@/api/endpoints/notificaciones.api';
import { Notificacion, getTipoColor, getPrioridadIcon } from '@/types/notificaciones.types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [contador, setContador] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ==========================================
  // CARGAR CONTADOR (cada 30 segundos)
  // ==========================================
  useEffect(() => {
    fetchContador();
    const interval = setInterval(fetchContador, 30000); // 30 segundos
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // CARGAR NOTIFICACIONES AL ABRIR
  // ==========================================
  useEffect(() => {
    if (isOpen) {
      fetchNotificaciones();
    }
  }, [isOpen]);

  // ==========================================
  // CERRAR AL HACER CLICK AFUERA
  // ==========================================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchContador = async () => {
    try {
      const count = await notificacionesApi.getContador();
      setContador(count);
    } catch (error) {
      console.error('Error al obtener contador:', error);
    }
  };

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const data = await notificacionesApi.getNoLeidas(10);
      setNotificaciones(data.results);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      toast.error('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarLeida = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificacionesApi.marcarLeida(id);
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
      setContador((prev) => Math.max(0, prev - 1));
      toast.success('Notificación marcada como leída');
    } catch (error) {
      toast.error('Error al marcar como leída');
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      const result = await notificacionesApi.marcarTodasLeidas();
      setNotificaciones([]);
      setContador(0);
      toast.success(`${result.marcadas} notificaciones marcadas como leídas`);
    } catch (error) {
      toast.error('Error al marcar todas como leídas');
    }
  };

  const handleClickNotificacion = async (notificacion: Notificacion) => {
    try {
      // Marcar como leída
      if (!notificacion.leida) {
        await notificacionesApi.marcarLeida(notificacion.id);
        setContador((prev) => Math.max(0, prev - 1));
      }

      // Cerrar dropdown
      setIsOpen(false);

      // Navegar si tiene URL
      if (notificacion.url_accion) {
        if (notificacion.url_accion.startsWith('http')) {
          window.open(notificacion.url_accion, '_blank');
        } else {
          navigate(notificacion.url_accion);
        }
      }
    } catch (error) {
      console.error('Error al abrir notificación:', error);
    }
  };

  // ==========================================
  // COLORES POR PRIORIDAD
  // ==========================================
  const getPrioridadBorderColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente':
        return 'border-l-red-500 bg-red-50/50';
      case 'alta':
        return 'border-l-orange-500 bg-orange-50/50';
      case 'normal':
        return 'border-l-blue-500 bg-blue-50/50';
      case 'baja':
        return 'border-l-gray-500 bg-gray-50/50';
      default:
        return 'border-l-gray-500 bg-gray-50/50';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de campanita */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Notificaciones"
      >
        <Bell size={22} className="text-gray-600" />
        
        {/* Badge con contador */}
        {contador > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {contador > 99 ? '99+' : contador}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Notificaciones</h3>
              {contador > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {contador}
                </span>
              )}
            </div>
            
            {notificaciones.length > 0 && (
              <button
                onClick={handleMarcarTodasLeidas}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                title="Marcar todas como leídas"
              >
                <CheckCheck size={14} />
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell size={48} className="text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium">No tienes notificaciones nuevas</p>
                <p className="text-gray-400 text-sm mt-1">
                  Te avisaremos cuando llegue algo nuevo
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notificaciones.map((notificacion) => (
                  <div
                    key={notificacion.id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${getPrioridadBorderColor(
                      notificacion.prioridad
                    )}`}
                    onClick={() => handleClickNotificacion(notificacion)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Tipo y Prioridad */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getTipoColor(notificacion.tipo)}`}>
                            {notificacion.tipo_display}
                          </span>
                          <span className="text-sm">
                            {getPrioridadIcon(notificacion.prioridad)}
                          </span>
                        </div>

                        {/* Título */}
                        <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                          {notificacion.titulo}
                        </h4>

                        {/* Tiempo */}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{notificacion.tiempo_transcurrido}</span>
                          {notificacion.url_accion && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <ExternalLink size={12} />
                              Ver más
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botón marcar como leída */}
                      <button
                        onClick={(e) => handleMarcarLeida(notificacion.id, e)}
                        className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                        title="Marcar como leída"
                      >
                        <Check size={16} className="text-blue-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notificaciones.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notificaciones');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-center"
              >
                Ver todas las notificaciones →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};