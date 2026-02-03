// src/pages/proveedores/ProveedoresPage.tsx

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Power, 
  Trash2, 
  Globe,
  AlertCircle,
  Shield,
  Ban,
  MoreVertical
} from 'lucide-react';
import { proveedoresApi, tiposProveedorApi, clasificacionesProveedorApi } from '@/api/endpoints';
import { Proveedor, TipoProveedor, ClasificacionProveedor, NivelRiesgo } from '@/types';
import { Button, Card } from '@/components/common';
import { usePermissions } from '@/hooks/usePermissions';
import toast from 'react-hot-toast';
import { ModalCrearProveedor } from './ModalCrearProveedor';
import { ModalEditarProveedor } from './ModalEditarProveedor';

type FiltroEstado = 'todos' | 'activos' | 'inactivos' | 'suspendidos' | 'globales' | 'estrategicos';

export const ProveedoresPage: React.FC = () => {
  const { isSuperuser } = usePermissions();
  
  // Estados principales
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Catálogos
  const [tiposProveedor, setTiposProveedor] = useState<TipoProveedor[]>([]);
  const [clasificaciones, setClasificaciones] = useState<ClasificacionProveedor[]>([]);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroClasificacion, setFiltroClasificacion] = useState<string>('');
  const [filtroRiesgo, setFiltroRiesgo] = useState<NivelRiesgo | ''>('');
  
  // Modales
  const [showModalCrear, setShowModalCrear] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState<Proveedor | null>(null);
  
  // Dropdown de acciones
  const [menuAbiertoId, setMenuAbiertoId] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    cargarProveedores();
  }, [filtroEstado]);

  const cargarDatos = async () => {
    try {
      // Cargar catálogos y proveedores en paralelo
      const [tipos, clasif] = await Promise.all([
        tiposProveedorApi.getAll(),
        clasificacionesProveedorApi.getAll(),
      ]);
      
      setTiposProveedor(tipos);
      setClasificaciones(clasif);
      
      await cargarProveedores();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos');
    }
  };

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      let data: Proveedor[] = [];

      switch (filtroEstado) {
        case 'activos':
          data = await proveedoresApi.getActivos();
          break;
        case 'inactivos':
          data = await proveedoresApi.getInactivos();
          break;
        case 'globales':
          data = await proveedoresApi.getGlobales();
          break;
        case 'estrategicos':
          data = await proveedoresApi.getEstrategicos();
          break;
        case 'suspendidos':
          const all = await proveedoresApi.getAll();
          data = all.filter(p => p.estado_proveedor === 'suspendido');
          break;
        default:
          data = await proveedoresApi.getAll();
      }

      setProveedores(data || []);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      toast.error('Error al cargar proveedores');
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActivar = async (id: string) => {
    try {
      await proveedoresApi.activar(id);
      toast.success('Proveedor activado');
      cargarProveedores();
      setMenuAbiertoId(null);
    } catch (error) {
      toast.error('Error al activar proveedor');
    }
  };

  const handleDesactivar = async (id: string) => {
    try {
      await proveedoresApi.desactivar(id);
      toast.success('Proveedor desactivado');
      cargarProveedores();
      setMenuAbiertoId(null);
    } catch (error) {
      toast.error('Error al desactivar proveedor');
    }
  };

  const handleSuspender = async (id: string) => {
    try {
      await proveedoresApi.suspender(id);
      toast.success('Proveedor suspendido');
      cargarProveedores();
      setMenuAbiertoId(null);
    } catch (error) {
      toast.error('Error al suspender proveedor');
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await proveedoresApi.delete(id);
      toast.success('Proveedor eliminado');
      cargarProveedores();
      setMenuAbiertoId(null);
    } catch (error) {
      toast.error('Error al eliminar proveedor');
    }
  };

  const toggleMenu = (id: string) => {
    setMenuAbiertoId(menuAbiertoId === id ? null : id);
  };

  // Aplicar filtros
  const proveedoresFiltrados = proveedores.filter((p) => {
    // Búsqueda por texto
    const matchSearch = !searchTerm || 
      p.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nombre_comercial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.numero_documento_fiscal?.includes(searchTerm) ||
      p.tipo_proveedor_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.empresa_nombre?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por tipo
    const matchTipo = !filtroTipo || p.tipo_proveedor === filtroTipo;

    // Filtro por clasificación
    const matchClasificacion = !filtroClasificacion || p.clasificacion === filtroClasificacion;

    // Filtro por riesgo
    const matchRiesgo = !filtroRiesgo || p.nivel_riesgo === filtroRiesgo;

    return matchSearch && matchTipo && matchClasificacion && matchRiesgo;
  });

  // Calcular estadísticas
  const stats = {
    total: proveedores.length,
    activos: proveedores.filter(p => p.estado_proveedor === 'activo').length,
    inactivos: proveedores.filter(p => p.estado_proveedor === 'inactivo').length,
    suspendidos: proveedores.filter(p => p.estado_proveedor === 'suspendido').length,
    globales: proveedores.filter(p => p.es_global).length,
    estrategicos: proveedores.filter(p => p.proveedor_estrategico).length,
    riesgoAlto: proveedores.filter(p => p.nivel_riesgo === 'alto').length,
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltroTipo('');
    setFiltroClasificacion('');
    setFiltroRiesgo('');
    setFiltroEstado('todos');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-600 mt-1">
            {isSuperuser 
              ? 'Gestión completa de proveedores globales y de empresas'
              : 'Gestión de proveedores de tu empresa'
            }
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowModalCrear(true)}>
          <Plus size={20} className="mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Filtros Avanzados */}
      <Card>
        <div className="space-y-4">
          {/* Fila 1: Búsqueda y Estado */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar por razón social, nombre comercial, documento fiscal, tipo o empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro Estado */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500 flex-shrink-0" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[150px]"
              >
                <option value="todos">Todos los estados</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
                <option value="suspendidos">Suspendidos</option>
                <option value="estrategicos">Estratégicos</option>
                {isSuperuser && <option value="globales">Globales</option>}
              </select>
            </div>
          </div>

          {/* Fila 2: Filtros adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Proveedor
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                {tiposProveedor.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Clasificación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clasificación
              </label>
              <select
                value={filtroClasificacion}
                onChange={(e) => setFiltroClasificacion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todas las clasificaciones</option>
                {clasificaciones.map((clasif) => (
                  <option key={clasif.id} value={clasif.id}>
                    {clasif.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Nivel de Riesgo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel de Riesgo
              </label>
              <select
                value={filtroRiesgo}
                onChange={(e) => setFiltroRiesgo(e.target.value as NivelRiesgo | '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todos los niveles</option>
                <option value="alto">Alto</option>
                <option value="medio">Medio</option>
                <option value="bajo">Bajo</option>
              </select>
            </div>
          </div>

          {/* Botón limpiar filtros */}
          {(searchTerm || filtroTipo || filtroClasificacion || filtroRiesgo || filtroEstado !== 'todos') && (
            <div className="flex justify-end">
              <button
                onClick={limpiarFiltros}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Filter className="text-blue-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Activos</p>
              <p className="text-xl font-bold text-green-600">{stats.activos}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Inactivos</p>
              <p className="text-xl font-bold text-gray-600">{stats.inactivos}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <XCircle className="text-gray-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Suspendidos</p>
              <p className="text-xl font-bold text-orange-600">{stats.suspendidos}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Ban className="text-orange-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Estratégicos</p>
              <p className="text-xl font-bold text-purple-600">{stats.estrategicos}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="text-purple-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Riesgo Alto</p>
              <p className="text-xl font-bold text-red-600">{stats.riesgoAlto}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-red-600" size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Contenido Principal - Vista de Tabla */}
      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Cargando proveedores...</p>
            </div>
          ) : proveedoresFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron proveedores</h3>
              <p className="mt-1 text-sm text-gray-500">
                Intenta ajustar los filtros o crear un nuevo proveedor.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              {/* Header */}
              <thead className="bg-gray-50">
                <tr>
                  {isSuperuser && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alcance
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clasificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Riesgo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {proveedoresFiltrados.map((proveedor) => (
                  <tr key={proveedor.id} className="hover:bg-gray-50 transition-colors">
                    {/* Columna Empresa/Global (solo para superadmin) */}
                    {isSuperuser && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {proveedor.es_global ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Globe size={12} className="mr-1" />
                            Global
                          </span>
                        ) : (
                          <span className="text-sm text-gray-900">
                            {proveedor.empresa_nombre}
                          </span>
                        )}
                      </td>
                    )}

                    {/* Razón Social y Documento */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {proveedor.razon_social}
                          </div>
                          {proveedor.nombre_comercial && (
                            <div className="text-xs text-gray-500 italic">
                              "{proveedor.nombre_comercial}"
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            {proveedor.tipo_documento_fiscal}: {proveedor.numero_documento_fiscal}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {proveedor.estado_proveedor === 'activo' && (
                            <CheckCircle size={16} className="text-green-600" />
                          )}
                          {proveedor.estado_proveedor === 'inactivo' && (
                            <XCircle size={16} className="text-gray-600" />
                          )}
                          {proveedor.estado_proveedor === 'suspendido' && (
                            <Ban size={16} className="text-orange-600" />
                          )}
                          {proveedor.proveedor_estrategico && (
                            <Shield size={16} className="text-purple-600" />
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {proveedor.tipo_proveedor_nombre}
                      </span>
                    </td>

                    {/* Clasificación */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {proveedor.clasificacion_nombre ? (
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: proveedor.clasificacion_color ? `${proveedor.clasificacion_color}20` : undefined,
                            color: proveedor.clasificacion_color || undefined,
                          }}
                        >
                          {proveedor.clasificacion_nombre}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Sin clasificar</span>
                      )}
                    </td>

                    {/* Riesgo */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          proveedor.nivel_riesgo === 'alto'
                            ? 'bg-red-100 text-red-800'
                            : proveedor.nivel_riesgo === 'medio'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {proveedor.nivel_riesgo_display}
                      </span>
                    </td>

                    {/* Contacto */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{proveedor.email_contacto}</div>
                      <div className="text-xs text-gray-500">{proveedor.telefono_contacto}</div>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => toggleMenu(proveedor.id)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors"
                          title="Más acciones"
                        >
                          <MoreVertical size={20} />
                        </button>

                        {/* Dropdown Menu */}
                        {menuAbiertoId === proveedor.id && (
                          <>
                            {/* Overlay para cerrar al hacer click fuera */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setMenuAbiertoId(null)}
                            />
                            
                            {/* Menu */}
                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                              <div className="py-1">
                                {/* Editar */}
                                <button
                                  onClick={() => {
                                    setProveedorEditar(proveedor);
                                    setShowModalEditar(true);
                                    setMenuAbiertoId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Edit size={16} />
                                  Editar
                                </button>

                                {/* Activar/Suspender/Desactivar */}
                                {proveedor.estado_proveedor === 'activo' ? (
                                  <>
                                    <button
                                      onClick={() => handleDesactivar(proveedor.id)}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <Power size={16} />
                                      Desactivar
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleActivar(proveedor.id)}
                                    className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                  >
                                    <Power size={16} />
                                    Activar
                                  </button>
                                )}

                                {/* Divider */}
                                <div className="border-t border-gray-100 my-1" />

                                {/* Eliminar */}
                                <button
                                  onClick={() => handleEliminar(proveedor.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 size={16} />
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pie de tabla con total */}
        {!loading && proveedoresFiltrados.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{proveedoresFiltrados.length}</span> de{' '}
              <span className="font-medium">{proveedores.length}</span> proveedores
            </p>
          </div>
        )}
      </Card>

      {/* Modal Crear */}
      {showModalCrear && (
        <ModalCrearProveedor
          onClose={() => setShowModalCrear(false)}
          onSuccess={() => {
            setShowModalCrear(false);
            cargarProveedores();
          }}
        />
      )}

      {/* Modal Editar */}
      {showModalEditar && proveedorEditar && (
        <ModalEditarProveedor
          proveedor={proveedorEditar}
          onClose={() => {
            setShowModalEditar(false);
            setProveedorEditar(null);
          }}
          onSuccess={() => {
            setShowModalEditar(false);
            setProveedorEditar(null);
            cargarProveedores();
          }}
        />
      )}
    </div>
  );
};