// src/pages/Usuarios/UsuarioCreate.tsx

import { useNavigate } from 'react-router-dom';
import { useUsuarioCreate } from './hooks/useUsuarioCreate';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { UsuarioFormFields } from './components/UsuarioFormFields';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const UsuarioCreate = () => {
  const navigate = useNavigate();
  const {
    formData,
    handleChange,
    errors,
    empresas,
    isSuperAdmin,
    showPassword,
    toggleShowPassword,
    loading,
    loadingEmpresas,
    planInfo,
    handleSubmit,
  } = useUsuarioCreate();

  if (loadingEmpresas) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/usuarios')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nuevo Usuario</h1>
            <p className="text-gray-600 mt-1">Complete los datos del nuevo usuario</p>
          </div>
        </div>
      </div>

      {/* ── Banner info del plan ── */}
      {planInfo && (
        <div className={`rounded-lg border p-4 ${
          planInfo.dias_restantes !== null && planInfo.dias_restantes <= 7
            ? 'bg-red-50 border-red-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={18}
              className={planInfo.dias_restantes !== null && planInfo.dias_restantes <= 7
                ? 'text-red-600 mt-0.5'
                : 'text-blue-600 mt-0.5'
              }
            />
            <div>
              <p className={`text-sm font-medium ${
                planInfo.dias_restantes !== null && planInfo.dias_restantes <= 7
                  ? 'text-red-800' : 'text-blue-800'
              }`}>
                Plan {planInfo.tipo.charAt(0).toUpperCase() + planInfo.tipo.slice(1)}
                {planInfo.dias_restantes !== null && (
                  <span className="ml-2 font-normal">
                    · {planInfo.dias_restantes} días restantes
                  </span>
                )}
              </p>
              <p className={`text-xs mt-1 ${
                planInfo.dias_restantes !== null && planInfo.dias_restantes <= 7
                  ? 'text-red-700' : 'text-blue-700'
              }`}>
                Límites: {planInfo.max_usuarios} usuarios
                · {planInfo.max_administradores} administrador(es)
                · {planInfo.max_auditores} auditor(es)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <UsuarioFormFields
          formData={formData}
          onChange={handleChange}
          errors={errors}
          empresas={empresas}
          isSuperAdmin={isSuperAdmin}
          isEdit={false}
          showPassword={showPassword}
          onTogglePassword={toggleShowPassword}
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                Crear Usuario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};