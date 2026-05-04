// src/pages/Empresas/Empresas.tsx
import {
  Plus, Search, Building2, Edit, Trash2,
  MoreVertical, X, Check, AlertTriangle, Shield,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PlanModal } from './components/PlanModal';
import { useEmpresas, PlanBadge } from './hooks';

export const Empresas = () => {
  const {
    isSuperAdmin, loading,
    filteredEmpresas, stats,
    searchTerm, setSearchTerm,
    menuOpen, setMenuOpen,
    deleteConfirm, planModal,
    handleCreate, handleEdit, handleCloseMenu,
    handleToggleStatus,
    handleDelete, handleOpenDelete, handleCancelDelete,
    handleOpenPlanModal, handleClosePlanModal, handleSavePlan,
    navigate,
  } = useEmpresas();

  if (!isSuperAdmin) {
    return <div className="card"><p className="text-center text-gray-600">No tienes permisos para acceder a esta sección</p></div>;
  }

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Empresas</h1>
          <p className="text-gray-600 mt-1">Administra las empresas del sistema</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Nueva Empresa
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, RUC o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Empresas</p><p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p></div><Building2 className="text-primary-600" size={32} /></div></div>
        <div className="card"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Activas</p><p className="text-2xl font-bold text-green-600 mt-1">{stats.activas}</p></div><Check className="text-green-600" size={32} /></div></div>
        <div className="card"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Inactivas</p><p className="text-2xl font-bold text-red-600 mt-1">{stats.inactivas}</p></div><X className="text-red-600" size={32} /></div></div>
        <div className="card"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Planes Demo</p><p className="text-2xl font-bold text-yellow-600 mt-1">{stats.demo}</p></div><Shield className="text-yellow-600" size={32} /></div></div>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">País</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sector</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuarios</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmpresas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron empresas' : 'No hay empresas registradas'}
                  </td>
                </tr>
              ) : (
                filteredEmpresas.map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Building2 size={20} className="text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{empresa.nombre}</p>
                          <p className="text-sm text-gray-500">{empresa.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{empresa.ruc || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{empresa.pais_display}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{empresa.sector_display || '-'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/usuarios?empresa=${empresa.nombre}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      >
                        {empresa.total_usuarios} usuarios
                      </button>
                    </td>
                    <td className="px-6 py-4"><PlanBadge empresa={empresa} /></td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${empresa.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {empresa.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button onClick={() => setMenuOpen(menuOpen === empresa.id ? null : empresa.id)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical size={18} />
                        </button>
                        {menuOpen === empresa.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={handleCloseMenu} />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                              <button onClick={() => handleEdit(empresa.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Edit size={16} /> Editar</button>
                              <button onClick={() => handleOpenPlanModal(empresa)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Shield size={16} /> Gestionar Plan</button>
                              <button onClick={() => handleToggleStatus(empresa)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                {empresa.activo ? <><X size={16} /> Desactivar</> : <><Check size={16} /> Activar</>}
                              </button>
                              <button onClick={() => handleOpenDelete(empresa.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 size={16} /> Eliminar</button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Eliminar */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={handleCancelDelete} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">¿Eliminar empresa?</h3>
                <p className="text-sm text-gray-500 mt-1">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">Se eliminarán todos los datos asociados a esta empresa.</p>
            <div className="flex justify-end gap-3">
              <button onClick={handleCancelDelete} className="btn-secondary">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Plan */}
      {planModal && (
        <PlanModal empresa={planModal} onClose={handleClosePlanModal} onSave={handleSavePlan} />
      )}
    </div>
  );
};