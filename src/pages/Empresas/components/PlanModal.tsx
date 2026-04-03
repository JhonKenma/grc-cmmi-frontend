// src/pages/Empresas/components/PlanModal.tsx
import { useState } from 'react';
import { X, Shield, Calendar } from 'lucide-react';
import { empresaService } from '@/api/empresa.service';
import { Empresa } from '@/types';
import toast from 'react-hot-toast';

interface PlanModalProps {
  empresa: Empresa;
  onClose: () => void;
  onSave: () => void;
}

type PlanType = 'demo' | 'basico' | 'profesional' | 'enterprise';

interface PlanFormData {
  tipo: PlanType;
  max_usuarios: number;
  max_administradores: number;
  max_auditores: number;
  fecha_expiracion: string;
  sin_expiracion: boolean;
}

const PLANES = [
  { value: 'demo',        label: 'Demo'        },
  { value: 'basico',      label: 'Básico'      },
  { value: 'profesional', label: 'Profesional' },
  { value: 'enterprise',  label: 'Enterprise'  },
];

// Calcula la fecha mínima seleccionable (hoy)
const hoy = () => new Date().toISOString().split('T')[0];

// Convierte fecha ISO a formato input date (YYYY-MM-DD)
const toInputDate = (isoDate: string | null): string => {
  if (!isoDate) return '';
  // Funciona tanto con "2026-03-30T05:00:00Z" como con "2026-03-30"
  return isoDate.slice(0, 10);
};

// Calcula días entre hoy y una fecha seleccionada
const diasHastaFecha = (fechaStr: string): number => {
  if (!fechaStr) return 0;
  const hoyMs   = new Date().setHours(0, 0, 0, 0);
  const fechaMs = new Date(fechaStr).setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((fechaMs - hoyMs) / (1000 * 60 * 60 * 24)));
};

export const PlanModal: React.FC<PlanModalProps> = ({ empresa, onClose, onSave }) => {
  const planActual = empresa.plan;

  // Fecha de expiración actual como string YYYY-MM-DD
    const fechaActual = planActual?.fecha_expiracion
    ? planActual.fecha_expiracion.slice(0, 10)  // ← directo, sin función
    : '';

    const [formData, setFormData] = useState({
    tipo:                planActual?.tipo               ?? 'demo',
    max_usuarios:        planActual?.max_usuarios        ?? 3,
    max_administradores: planActual?.max_administradores ?? 1,
    max_auditores:       planActual?.max_auditores       ?? 1,
    fecha_expiracion:    fechaActual,
    sin_expiracion:      !planActual?.fecha_expiracion,
    });

  const [loading, setLoading] = useState(false);
    
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? Number(value)
          : value,
    }));
  };

  const handleTipoChange = (tipo: PlanType) => {
    const defaults: Record<PlanType, Partial<PlanFormData>> = {
      demo:        { max_usuarios: 3,   max_administradores: 1, max_auditores: 1, sin_expiracion: false },
      basico:      { max_usuarios: 10,  max_administradores: 2, max_auditores: 2, sin_expiracion: false },
      profesional: { max_usuarios: 50,  max_administradores: 5, max_auditores: 5, sin_expiracion: false },
      enterprise:  { max_usuarios: 999, max_administradores: 99, max_auditores: 99, sin_expiracion: true, fecha_expiracion: '' },
    };

    // Si no hay fecha seleccionada, poner default según plan
    const diasDefault: Record<string, number> = {
      demo: 60, basico: 365, profesional: 365, enterprise: 0,
    };

    const nuevaFecha = tipo === 'enterprise'
      ? ''
      : formData.fecha_expiracion || (() => {
          const d = new Date();
          d.setDate(d.getDate() + diasDefault[tipo]);
          return d.toISOString().split('T')[0];
        })();

    setFormData(prev => ({
      ...prev,
      tipo,
      ...defaults[tipo],
      fecha_expiracion: nuevaFecha,
    }));
  };

  const diasRestantes = diasHastaFecha(formData.fecha_expiracion);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sin_expiracion && !formData.fecha_expiracion) {
        toast.error('Selecciona una fecha de expiración');
        return;
    }

    try {
        setLoading(true);
        await empresaService.asignarPlan(empresa.id, {
        tipo:                formData.tipo,
        max_usuarios:        formData.max_usuarios,
        max_administradores: formData.max_administradores,
        max_auditores:       formData.max_auditores,
        fecha_expiracion:    formData.sin_expiracion ? null : formData.fecha_expiracion,
        sin_expiracion:      formData.sin_expiracion,
        });
        toast.success('Plan actualizado correctamente');
        onSave();
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Error al actualizar el plan');
    } finally {
        setLoading(false);
    }
    };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Gestionar Plan</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={24} />
            </button>
          </div>

          {/* Info empresa */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700">{empresa.nombre}</p>
            {planActual && (
              <p className="text-xs text-gray-500 mt-0.5">
                Plan actual:{' '}
                <span className="font-medium">{planActual.tipo_display}</span>
                {planActual.dias_restantes !== null && (
                  <span className={`ml-2 ${planActual.dias_restantes <= 7 ? 'text-red-600' : ''}`}>
                    · {planActual.dias_restantes} días restantes
                  </span>
                )}
                {!planActual.esta_activo && (
                  <span className="ml-2 text-red-600 font-semibold">· EXPIRADO</span>
                )}
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5">

            {/* Tipo de plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Plan
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PLANES.map(plan => (
                  <button
                    key={plan.value}
                    type="button"
                    onClick={() => handleTipoChange(plan.value as PlanType)}
                    className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      formData.tipo === plan.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {plan.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Límites */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Límites de Usuarios
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Usuarios</label>
                  <input
                    type="number" name="max_usuarios" min={1}
                    value={formData.max_usuarios}
                    onChange={handleChange}
                    className="input-field text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Admins</label>
                  <input
                    type="number" name="max_administradores" min={1}
                    value={formData.max_administradores}
                    onChange={handleChange}
                    className="input-field text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Auditores</label>
                  <input
                    type="number" name="max_auditores" min={1}
                    value={formData.max_auditores}
                    onChange={handleChange}
                    className="input-field text-center"
                  />
                </div>
              </div>
            </div>

            {/* Vigencia con calendar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vigencia
              </label>

              {/* Sin expiración (enterprise) */}
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  name="sin_expiracion"
                  id="sin_expiracion"
                  checked={formData.sin_expiracion}
                  onChange={handleChange}
                  className="rounded border-gray-300"
                />
                <label htmlFor="sin_expiracion" className="text-sm text-gray-600">
                  Sin fecha de expiración (Enterprise)
                </label>
              </div>

              {/* Calendar */}
              {!formData.sin_expiracion && (
                <div className="space-y-2">
                  <div className="relative">
                    <Calendar
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      type="date"
                      name="fecha_expiracion"
                      value={formData.fecha_expiracion}
                      min={hoy()}
                      onChange={handleChange}
                      className="input-field pl-9"
                    />
                  </div>

                  {/* Resumen de días */}
                  {formData.fecha_expiracion && (
                    <p className={`text-xs ${
                      diasRestantes <= 7
                        ? 'text-red-600'
                        : diasRestantes <= 30
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}>
                      {diasRestantes === 0
                        ? '⚠️ La fecha seleccionada es hoy'
                        : `✓ ${diasRestantes} días de vigencia desde hoy`}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    Guardar Plan
                  </>
                )}
              </button>
            </div>
      </form>
    </div>
  </div>
    </div>
  );
};
