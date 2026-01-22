// src/pages/proveedores/ProveedoresPage.tsx

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, CheckCircle, XCircle, Edit, Power, Trash2 } from 'lucide-react';
import { proveedoresApi } from '@/api/endpoints';
import { Proveedor } from '@/types';
import { Button, Card } from '@/components/common';
import toast from 'react-hot-toast';
import { ModalCrearProveedor } from './ModalCrearProveedor';
import { ModalEditarProveedor } from './ModalEditarProveedor';

export const ProveedoresPage: React.FC = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [showModalCrear, setShowModalCrear] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState<Proveedor | null>(null);

  useEffect(() => {
    cargarProveedores();
  }, [filtroEstado]);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      let data: Proveedor[] = [];

      if (filtroEstado === 'activos') {
        data = await proveedoresApi.getActivos();
      } else if (filtroEstado === 'inactivos') {
        data = await proveedoresApi.getInactivos();
      } else {
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
    } catch (error) {
      toast.error('Error al activar proveedor');
    }
  };

  const handleDesactivar = async (id: string) => {
    try {
      await proveedoresApi.desactivar(id);
      toast.success('Proveedor desactivado');
      cargarProveedores();
    } catch (error) {
      toast.error('Error al desactivar proveedor');
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;

    try {
      await proveedoresApi.delete(id);
      toast.success('Proveedor eliminado');
      cargarProveedores();
    } catch (error) {
      toast.error('Error al eliminar proveedor');
    }
  };

  const proveedoresFiltrados = (proveedores || []).filter((p) =>
    p.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ruc?.includes(searchTerm) ||
    p.tipo_proveedor_display?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-600 mt-1">
            Gestión de proveedores de servicios
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowModalCrear(true)}>
          <Plus size={20} className="mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar por razón social, RUC o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro Estado */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Proveedores</p>
              <p className="text-2xl font-bold text-gray-900">{proveedores.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Filter className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {proveedores.filter((p) => p.activo).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactivos</p>
              <p className="text-2xl font-bold text-red-600">
                {proveedores.filter((p) => !p.activo).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla de Proveedores */}
      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Cargando proveedores...</p>
            </div>
          ) : proveedoresFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No se encontraron proveedores</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              {/* Header */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Razón Social
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RUC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
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
                    {/* Estado */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          proveedor.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {proveedor.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {/* Razón Social */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {proveedor.razon_social}
                      </div>
                    </td>

                    {/* RUC */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{proveedor.ruc}</div>
                    </td>

                    {/* Tipo */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {proveedor.tipo_proveedor_display}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{proveedor.contacto_email}</div>
                    </td>

                    {/* Teléfono */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{proveedor.contacto_telefono}</div>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {/* Editar */}
                        <button
                          onClick={() => {
                            setProveedorEditar(proveedor);
                            setShowModalEditar(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>

                        {/* Activar/Desactivar */}
                        {proveedor.activo ? (
                          <button
                            onClick={() => handleDesactivar(proveedor.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Desactivar"
                          >
                            <Power size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivar(proveedor.id)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Activar"
                          >
                            <Power size={18} />
                          </button>
                        )}

                        {/* Eliminar */}
                        <button
                          onClick={() => handleEliminar(proveedor.id)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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