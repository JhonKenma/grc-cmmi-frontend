// src/pages/Usuarios/UsuarioCreate.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usuarioService } from '@/api/usuario.service';
import { empresaService } from '@/api/empresa.service';
import { Empresa } from '@/types';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';   // ← AlertTriangle nuevo
import toast from 'react-hot-toast';
import { UsuarioFormFields } from './components/UsuarioFormFields';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { manejarErrorCrearUsuario } from '@/utils/errorHandler';  // ← nuevo

export const UsuarioCreate = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [planInfo, setPlanInfo] = useState<{     // ← nuevo: info del plan
    max_usuarios: number;
    max_administradores: number;
    max_auditores: number;
    dias_restantes: number | null;
    tipo: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    empresa: '',
    rol: 'usuario',
    cargo: '',
    departamento: '',
    telefono: '',
  });

  // ── Cargar empresas ────────────────────────────────────
  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        setLoadingEmpresas(true);
        if (isSuperAdmin) {
          const data = await empresaService.getAll();
          setEmpresas(data);
        } else if (user?.empresa_info) {
          setEmpresas([user.empresa_info]);
          setFormData((prev) => ({
            ...prev,
            empresa: user.empresa_info!.id.toString(),
          }));
          // Cargar info del plan de la empresa del admin
          if (user.empresa_info.plan) {
            setPlanInfo({
              max_usuarios:        user.empresa_info.plan.max_usuarios,
              max_administradores: user.empresa_info.plan.max_administradores,
              max_auditores:       user.empresa_info.plan.max_auditores,
              dias_restantes:      user.empresa_info.plan.dias_restantes,
              tipo:                user.empresa_info.plan.tipo,
            });
          }
        }
      } catch (error) {
        toast.error('Error al cargar empresas');
      } finally {
        setLoadingEmpresas(false);
      }
    };

    loadEmpresas();
  }, [isSuperAdmin, user]);

  // ── Cuando SuperAdmin elige empresa, cargar su plan ───
  useEffect(() => {
    if (!isSuperAdmin || !formData.empresa) {
      setPlanInfo(null);
      return;
    }
    const empresa = empresas.find((e) => e.id === parseInt(formData.empresa));
    if (empresa?.plan) {
      setPlanInfo({
        max_usuarios:        empresa.plan.max_usuarios,
        max_administradores: empresa.plan.max_administradores,
        max_auditores:       empresa.plan.max_auditores,
        dias_restantes:      empresa.plan.dias_restantes,
        tipo:                empresa.plan.tipo,
      });
    } else {
      setPlanInfo(null);
    }
  }, [formData.empresa, empresas, isSuperAdmin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'rol' && value === 'superadmin') {
      setFormData((prev) => ({ ...prev, [name]: value, empresa: '' }));
      setPlanInfo(null);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'El nombre es requerido';
    if (!formData.last_name.trim())  newErrors.last_name  = 'El apellido es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!formData.rol) newErrors.rol = 'El rol es requerido';
    if (formData.rol !== 'superadmin' && !formData.empresa) {
      newErrors.empresa = 'La empresa es requerida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Por favor, complete todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);

      const dataToSend: any = {
        email:        formData.email,
        password:     formData.password,
        first_name:   formData.first_name,
        last_name:    formData.last_name,
        rol:          formData.rol,
        cargo:        formData.cargo,
        departamento: formData.departamento,
        telefono:     formData.telefono,
      };

      if (formData.rol !== 'superadmin') {
        dataToSend.empresa = parseInt(formData.empresa);
      }

      await usuarioService.create(dataToSend);
      toast.success('Usuario creado correctamente');
      navigate('/usuarios');

    } catch (error: any) {
      manejarErrorCrearUsuario(error, setErrors, toast);
    } finally {
      setLoading(false);
    }
  };

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
          onTogglePassword={() => setShowPassword(!showPassword)}
          userEmpresaId={user?.empresa}
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