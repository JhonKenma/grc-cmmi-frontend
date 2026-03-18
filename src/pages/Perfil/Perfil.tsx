// src/pages/Perfil/Perfil.tsx
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/api/auth.service';
import {
  User, Mail, Briefcase, Phone,
  Building2, Lock, Eye, EyeOff, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Perfil = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'info' | 'password'>('info');

  const [pwData, setPwData] = useState({
    password_actual: '',
    password_nuevo: '',
    password_confirmacion: '',
  });
  const [showPw, setShowPw] = useState({
    actual: false,
    nuevo: false,
    confirmacion: false,
  });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [loadingPw, setLoadingPw] = useState(false);

  const validatePassword = (): boolean => {
    const errors: Record<string, string> = {};

    if (!pwData.password_actual)
      errors.password_actual = 'Ingresa tu contraseña actual';

    if (!pwData.password_nuevo)
      errors.password_nuevo = 'Ingresa la nueva contraseña';
    else if (pwData.password_nuevo.length < 8)
      errors.password_nuevo = 'Mínimo 8 caracteres';
    else if (!/[A-Z]/.test(pwData.password_nuevo))
      errors.password_nuevo = 'Debe contener al menos una mayúscula';
    else if (!/[0-9]/.test(pwData.password_nuevo))
      errors.password_nuevo = 'Debe contener al menos un número';

    if (!pwData.password_confirmacion)
      errors.password_confirmacion = 'Confirma tu nueva contraseña';
    else if (pwData.password_nuevo !== pwData.password_confirmacion)
      errors.password_confirmacion = 'Las contraseñas no coinciden';

    setPwErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setLoadingPw(true);
    try {
      await authService.changePassword(pwData);
      toast.success('Contraseña cambiada exitosamente');
      setPwData({
        password_actual: '',
        password_nuevo: '',
        password_confirmacion: '',
      });
      setPwErrors({});
    } catch (error: any) {
      const data = error?.response?.data;
      if (data?.password_actual) {
        setPwErrors({ password_actual: data.password_actual[0] });
      } else {
        toast.error('No se pudo cambiar la contraseña');
      }
    } finally {
      setLoadingPw(false);
    }
  };

  // ── Componentes internos ─────────────────────────────────────────────────

  const Field = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value?: string;
    icon: any;
  }) => (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
        <Icon size={16} className="text-gray-400 shrink-0" />
        <span className="text-sm text-gray-800">{value || '—'}</span>
      </div>
    </div>
  );

  const PwField = ({
    name,
    label,
    show,
    onToggle,
  }: {
    name: keyof typeof pwData;
    label: string;
    show: boolean;
    onToggle: () => void;
  }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        {label}
      </label>
      <div
        className={`flex items-center border rounded-lg px-3 py-2.5 bg-gray-50
          ${pwErrors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
      >
        <Lock size={16} className="text-gray-400 shrink-0 mr-2" />
        <input
          type={show ? 'text' : 'password'}
          value={pwData[name]}
          onChange={(e) =>
            setPwData((p) => ({ ...p, [name]: e.target.value }))
          }
          className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-300"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 ml-2"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {pwErrors[name] && (
        <span className="text-xs text-red-500">{pwErrors[name]}</span>
      )}
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header con avatar e info básica */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.nombre_completo}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={28} className="text-blue-500" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {user?.nombre_completo}
            </h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
            {user?.empresa_info && (
              <p className="text-xs text-blue-600 font-medium mt-0.5">
                {user.empresa_info.nombre}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['info', 'password'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
          >
            {t === 'info' ? 'Mi Información' : 'Cambiar Contraseña'}
          </button>
        ))}
      </div>

      {/* Panel: Información */}
      {tab === 'info' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre completo" value={user?.nombre_completo} icon={User} />
          <Field label="Email" value={user?.email} icon={Mail} />
          <Field label="Cargo" value={user?.cargo} icon={Briefcase} />
          <Field label="Teléfono" value={user?.telefono} icon={Phone} />
          {user?.empresa_info && (
            <>
              <Field label="Empresa" value={user.empresa_info.nombre} icon={Building2} />
              <Field label="RUC" value={user.empresa_info.ruc} icon={Building2} />
            </>
          )}
        </div>
      )}

      {/* Panel: Cambiar contraseña */}
      {tab === 'password' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
            La nueva contraseña debe tener mínimo 8 caracteres, una mayúscula y un número.
          </div>
          <form onSubmit={handleCambiarPassword} className="flex flex-col gap-4">
            <PwField
              name="password_actual"
              label="Contraseña actual"
              show={showPw.actual}
              onToggle={() => setShowPw((p) => ({ ...p, actual: !p.actual }))}
            />
            <PwField
              name="password_nuevo"
              label="Nueva contraseña"
              show={showPw.nuevo}
              onToggle={() => setShowPw((p) => ({ ...p, nuevo: !p.nuevo }))}
            />
            <PwField
              name="password_confirmacion"
              label="Confirmar nueva contraseña"
              show={showPw.confirmacion}
              onToggle={() =>
                setShowPw((p) => ({ ...p, confirmacion: !p.confirmacion }))
              }
            />
            <button
              type="submit"
              disabled={loadingPw}
              className="mt-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700
                text-white font-semibold text-sm transition-colors
                disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingPw ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Cambiar Contraseña
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};