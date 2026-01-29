// src/pages/notificaciones/EnviarNotificacion.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Send,
  Users,
  Building2,
  User,
  AlertCircle,
  CheckCircle,
  Mail,
  Link as LinkIcon,
  ArrowLeft,
} from 'lucide-react';
import { Card, Button, LoadingScreen } from '@/components/common';
import { notificacionesApi } from '@/api/endpoints/notificaciones.api';
import { EnviarNotificacionData, PrioridadNotificacion } from '@/types/notificaciones.types';
import toast from 'react-hot-toast';
import axiosInstance from '@/api/axios';

interface Usuario {
  id: number;
  nombre_completo: string;
  email: string;
  rol: string;
  empresa_info?: {
    id: number;
    nombre: string;
  };
}

interface Empresa {
  id: number;
  nombre: string;
  ruc: string;
}

export const EnviarNotificacion: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  // Tipo de destinatario
  const [tipoDestinatario, setTipoDestinatario] = useState<
    'usuario' | 'empresa' | 'admins' | 'todos'
  >('usuario');

  // Form data
  const [formData, setFormData] = useState<EnviarNotificacionData>({
    tipo: 'mensaje_personalizado',
    titulo: '',
    mensaje: '',
    prioridad: 'normal',
    url_accion: '',
    enviar_email: true,
  });

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<number | null>(null);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<number | null>(null);

  // ═══════════════════════════════════════════════════════════
  // CARGAR DATOS INICIALES
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    loadData();
  }, []);

    const loadData = async () => {
    try {
        setLoadingData(true);

        // ⭐ USAR EL NUEVO ENDPOINT DE NOTIFICACIONES
        const usuariosResponse = await axiosInstance.get('/notificaciones/usuarios-disponibles/');
        const usuariosData = usuariosResponse.data?.data || [];
        setUsuarios(usuariosData);

        // Cargar empresas (solo SuperAdmin)
        if (isSuperAdmin) {
        const empresasResponse = await axiosInstance.get('/notificaciones/empresas-disponibles/');
        const empresasData = empresasResponse.data?.data || [];
        setEmpresas(empresasData);
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar usuarios y empresas');
    } finally {
        setLoadingData(false);
    }
    };

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.titulo.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    if (!formData.mensaje.trim()) {
      toast.error('El mensaje es obligatorio');
      return;
    }

    // Validar destinatarios
    if (tipoDestinatario === 'usuario' && !usuarioSeleccionado) {
      toast.error('Selecciona un usuario');
      return;
    }

    if (tipoDestinatario === 'empresa' && !empresaSeleccionada) {
      toast.error('Selecciona una empresa');
      return;
    }

    try {
      setLoading(true);

      // Preparar datos según tipo de destinatario
      const dataToSend: EnviarNotificacionData = {
        ...formData,
      };

      if (tipoDestinatario === 'usuario') {
        dataToSend.usuario_id = usuarioSeleccionado!;
      } else if (tipoDestinatario === 'empresa') {
        dataToSend.empresa_id = empresaSeleccionada!;
      } else if (tipoDestinatario === 'admins') {
        dataToSend.enviar_a_todos_admins = true;
      } else if (tipoDestinatario === 'todos') {
        if (!isSuperAdmin) {
          toast.error('Solo SuperAdmin puede enviar a todos');
          return;
        }
        dataToSend.enviar_a_todos = true;
      }

      const result = await notificacionesApi.enviarPersonalizada(dataToSend);

      toast.success(
        `✅ Notificación enviada a ${result.usuarios_notificados} usuario(s). ${result.emails_enviados} email(s) enviado(s).`
      );

      // Resetear formulario
      setFormData({
        tipo: 'mensaje_personalizado',
        titulo: '',
        mensaje: '',
        prioridad: 'normal',
        url_accion: '',
        enviar_email: true,
      });
      setUsuarioSeleccionado(null);
      setEmpresaSeleccionada(null);
      setTipoDestinatario('usuario');

      // Opcional: navegar al historial
      setTimeout(() => {
        navigate('/notificaciones');
      }, 2000);
    } catch (error: any) {
      console.error('Error al enviar notificación:', error);
      toast.error(
        error.response?.data?.message || 'Error al enviar la notificación'
      );
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // FILTRAR USUARIOS SEGÚN ROL
  // ═══════════════════════════════════════════════════════════

  const usuariosFiltrados = usuarios.filter((u) => {
    // Administrador solo ve usuarios de su empresa
    if (!isSuperAdmin && user?.empresa_info) {
      return u.empresa_info?.id === user.empresa_info.id;
    }
    return true;
  });

  if (loadingData) {
    return <LoadingScreen message="Cargando datos..." />;
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ═══ HEADER ═══ */}
      <div>
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" />
          Volver
        </Button>

        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Enviar Notificación Personalizada
        </h1>
        <p className="text-gray-600 mt-1">
          Envía mensajes y anuncios a usuarios de tu organización
        </p>
      </div>

      {/* ═══ FORMULARIO ═══ */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* ═══ TIPO DE DESTINATARIO ═══ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿A quién deseas enviar la notificación?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setTipoDestinatario('usuario')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  tipoDestinatario === 'usuario'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <User size={24} className="mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">Usuario Específico</p>
              </button>

              <button
                type="button"
                onClick={() => setTipoDestinatario('empresa')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  tipoDestinatario === 'empresa'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={!isSuperAdmin}
              >
                <Building2 size={24} className="mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">Toda una Empresa</p>
                {!isSuperAdmin && (
                  <p className="text-xs text-gray-500 mt-1">Solo SuperAdmin</p>
                )}
              </button>

              <button
                type="button"
                onClick={() => setTipoDestinatario('admins')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  tipoDestinatario === 'admins'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users size={24} className="mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium">Todos los Admins</p>
              </button>

              <button
                type="button"
                onClick={() => setTipoDestinatario('todos')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  tipoDestinatario === 'todos'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={!isSuperAdmin}
              >
                <Users size={24} className="mx-auto mb-2 text-orange-600" />
                <p className="text-sm font-medium">Todos los Usuarios</p>
                {!isSuperAdmin && (
                  <p className="text-xs text-gray-500 mt-1">Solo SuperAdmin</p>
                )}
              </button>
            </div>
          </div>

          {/* ═══ SELECTOR DE USUARIO ═══ */}
          {tipoDestinatario === 'usuario' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Usuario
              </label>
              <select
                value={usuarioSeleccionado || ''}
                onChange={(e) => setUsuarioSeleccionado(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Selecciona un usuario --</option>
                {usuariosFiltrados.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre_completo} ({u.email}) - {u.rol}
                    {u.empresa_info && ` - ${u.empresa_info.nombre}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ═══ SELECTOR DE EMPRESA ═══ */}
          {tipoDestinatario === 'empresa' && isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Empresa
              </label>
              <select
                value={empresaSeleccionada || ''}
                onChange={(e) => setEmpresaSeleccionada(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Selecciona una empresa --</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre} ({emp.ruc})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ═══ TIPO DE NOTIFICACIÓN ═══ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Notificación
            </label>
            <select
              value={formData.tipo}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tipo: e.target.value as 'mensaje_personalizado' | 'anuncio' | 'sistema',
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="mensaje_personalizado">Mensaje Personalizado</option>
              <option value="anuncio">Anuncio</option>
              <option value="sistema">Sistema</option>
            </select>
          </div>

          {/* ═══ TÍTULO ═══ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ej: Importante: Mantenimiento del Sistema"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* ═══ MENSAJE ═══ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje *
            </label>
            <textarea
              value={formData.mensaje}
              onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
              placeholder="Escribe el mensaje completo de la notificación..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.mensaje.length} caracteres
            </p>
          </div>

          {/* ═══ PRIORIDAD ═══ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <select
              value={formData.prioridad}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  prioridad: e.target.value as PrioridadNotificacion,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="baja">📌 Baja</option>
              <option value="normal">📋 Normal</option>
              <option value="alta">⚠️ Alta</option>
              <option value="urgente">🚨 Urgente</option>
            </select>
          </div>

          {/* ═══ URL DE ACCIÓN ═══ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <LinkIcon size={16} className="inline mr-1" />
              URL de Acción (Opcional)
            </label>
            <input
              type="url"
              value={formData.url_accion}
              onChange={(e) => setFormData({ ...formData, url_accion: e.target.value })}
              placeholder="https://ejemplo.com o /ruta-interna"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Puede ser una URL externa o una ruta interna de la aplicación
            </p>
          </div>

          {/* ═══ ENVIAR EMAIL ═══ */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enviar_email"
              checked={formData.enviar_email}
              onChange={(e) =>
                setFormData({ ...formData, enviar_email: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="enviar_email" className="text-sm text-gray-700">
              <Mail size={16} className="inline mr-1" />
              Enviar también por correo electrónico
            </label>
          </div>

          {/* ═══ BOTONES ═══ */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Enviar Notificación
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>

      {/* ═══ NOTA INFORMATIVA ═══ */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Información importante:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Las notificaciones se envían inmediatamente</li>
              <li>Los destinatarios las verán en la campanita 🔔 y en su historial</li>
              <li>Si activas el email, también recibirán un correo</li>
              {!isSuperAdmin && (
                <li>Solo puedes enviar a usuarios de tu empresa</li>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};