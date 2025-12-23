
// src/pages/Usuarios/components/UsuarioFormFields.tsx
import React from 'react';
import { Empresa } from '@/types';
import { Eye, EyeOff } from 'lucide-react';

interface FormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  empresa: string;
  rol: string;
  cargo: string;
  departamento: string;
  telefono: string;
}

interface UsuarioFormFieldsProps {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errors?: Record<string, string>;
  empresas: Empresa[];
  isSuperAdmin: boolean;
  isEdit?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  userEmpresaId?: number | null;
}

export const UsuarioFormFields: React.FC<UsuarioFormFieldsProps> = ({
  formData,
  onChange,
  errors = {},
  empresas,
  isSuperAdmin,
  isEdit = false,
  showPassword = false,
  onTogglePassword,
  userEmpresaId,
}) => {
  return (
    <div className="space-y-6">
      {/* Sección: Información Personal */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombres <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={onChange}
              className={`input-field ${errors.first_name ? 'border-red-500' : ''}`}
              placeholder="Ej: Juan Carlos"
              required
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
            )}
          </div>

          {/* Apellidos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellidos <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={onChange}
              className={`input-field ${errors.last_name ? 'border-red-500' : ''}`}
              placeholder="Ej: Pérez García"
              required
            />
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Corporativo <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className={`input-field ${errors.email ? 'border-red-500' : ''}`}
              placeholder="usuario@empresa.com"
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={onChange}
              className="input-field"
              placeholder="Ej: +51 999 999 999"
            />
          </div>

          {/* Contraseña (solo en crear) */}
          {!isEdit && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={onChange}
                  className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                {onTogglePassword && (
                  <button
                    type="button"
                    onClick={onTogglePassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                )}
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                La contraseña debe tener al menos 8 caracteres
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sección: Información Laboral */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Laboral</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cargo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cargo
            </label>
            <input
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={onChange}
              className="input-field"
              placeholder="Ej: Gerente de TI"
            />
          </div>

          {/* Departamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departamento
            </label>
            <input
              type="text"
              name="departamento"
              value={formData.departamento}
              onChange={onChange}
              className="input-field"
              placeholder="Ej: Tecnología"
            />
          </div>
        </div>
      </div>

      {/* Sección: Asignación y Permisos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Asignación y Permisos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Empresa - Solo si es SuperAdmin */}
          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa <span className="text-red-500">*</span>
              </label>
              <select
                name="empresa"
                value={formData.empresa}
                onChange={onChange}
                className={`input-field ${errors.empresa ? 'border-red-500' : ''}`}
                required={formData.rol !== 'superadmin'}
              >
                <option value="">Seleccionar empresa...</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
              {errors.empresa && (
                <p className="mt-1 text-sm text-red-600">{errors.empresa}</p>
              )}
              {formData.rol === 'superadmin' && (
                <p className="mt-1 text-xs text-gray-500">
                  Los SuperAdmins no tienen empresa asignada
                </p>
              )}
            </div>
          )}

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              name="rol"
              value={formData.rol}
              onChange={onChange}
              className={`input-field ${errors.rol ? 'border-red-500' : ''}`}
              required
            >
              <option value="">Seleccionar rol...</option>
              {isSuperAdmin && (
                <option value="superadmin">Super Administrador</option>
              )}
              <option value="administrador">Administrador</option>
              <option value="usuario">Usuario</option>
              <option value="auditor">Auditor</option>
            </select>
            {errors.rol && (
              <p className="mt-1 text-sm text-red-600">{errors.rol}</p>
            )}
          </div>
        </div>

        {/* Información del Rol */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Información del Rol</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            {formData.rol === 'superadmin' && (
              <>
                <li>• Acceso total al sistema</li>
                <li>• Gestiona todas las empresas y usuarios</li>
                <li>• No requiere empresa asignada</li>
              </>
            )}
            {formData.rol === 'administrador' && (
              <>
                <li>• Administra su empresa</li>
                <li>• Gestiona usuarios de su empresa</li>
                <li>• Crea y asigna encuestas</li>
              </>
            )}
            {formData.rol === 'usuario' && (
              <>
                <li>• Responde encuestas asignadas</li>
                <li>• Carga evidencias</li>
                <li>• Acceso limitado a sus tareas</li>
              </>
            )}
            {formData.rol === 'auditor' && (
              <>
                <li>• Visualiza información de su empresa</li>
                <li>• Acceso de solo lectura</li>
                <li>• Genera reportes</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};