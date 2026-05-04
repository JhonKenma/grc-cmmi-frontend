// src/pages/Usuarios/UsuarioEdit.tsx
import { ArrowLeft, Save } from 'lucide-react';
import { UsuarioFormFields } from './components/UsuarioFormFields';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useUsuarioEdit } from './hooks';

export const UsuarioEdit = () => {
  const {
    formData, errors, empresas,
    loading, loadingData,
    handleChange, handleSubmit, goToLista,
    isSuperAdmin, user,
  } = useUsuarioEdit();

  if (loadingData) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={goToLista} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Usuario</h1>
            <p className="text-gray-600 mt-1">Modifique los datos del usuario</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <UsuarioFormFields
          formData={formData}
          onChange={handleChange}
          errors={errors}
          empresas={empresas}
          isSuperAdmin={isSuperAdmin}
          isEdit={true}
          userEmpresaId={user?.empresa}
        />

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> La contraseña no se puede cambiar desde aquí.
            Si el usuario necesita cambiarla, debe usar la opción "Cambiar contraseña" en su perfil.
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={goToLista} className="btn-secondary" disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            {loading ? (
              <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Actualizando...</>
            ) : (
              <><Save size={20} /> Actualizar Usuario</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};