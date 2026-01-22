// src/pages/dashboard/proveedores/ModalCrearProveedor.tsx (CREAR ARCHIVO)

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { proveedoresApi } from '@/api/endpoints';
import { ProveedorCreate, TipoProveedor } from '@/types';
import { Button, Card } from '@/components/common';
import toast from 'react-hot-toast';

interface ModalCrearProveedorProps {
  onClose: () => void;
  onSuccess: () => void;
}

const TIPOS_PROVEEDOR: { value: TipoProveedor; label: string }[] = [
  { value: 'consultoria', label: 'Consultoría CMMI/GRC' },
  { value: 'software', label: 'Software/Herramientas' },
  { value: 'capacitacion', label: 'Capacitación y Entrenamiento' },
  { value: 'auditoria', label: 'Auditoría y Certificación' },
  { value: 'infraestructura', label: 'Infraestructura TI' },
  { value: 'otro', label: 'Otro' },
];

export const ModalCrearProveedor: React.FC<ModalCrearProveedorProps> = ({
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProveedorCreate>({
    razon_social: '',
    ruc: '',
    tipo_proveedor: 'consultoria',
    contacto_email: '',
    contacto_telefono: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.razon_social.trim()) {
      toast.error('La razón social es obligatoria');
      return;
    }

    if (!formData.ruc.trim()) {
      toast.error('El RUC es obligatorio');
      return;
    }

    if (!formData.contacto_email.trim()) {
      toast.error('El email de contacto es obligatorio');
      return;
    }

    try {
      setLoading(true);
      await proveedoresApi.create(formData);
      toast.success('Proveedor creado exitosamente (desactivado por defecto)');
      onSuccess();
    } catch (error: any) {
      console.error('Error al crear proveedor:', error);
      const errorMsg = error.response?.data?.message || 'Error al crear proveedor';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Nuevo Proveedor</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Razón Social */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razón Social <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.razon_social}
              onChange={(e) =>
                setFormData({ ...formData, razon_social: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ej: Consultora CMMI S.A.C."
              required
            />
          </div>

          {/* RUC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RUC / Tax ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.ruc}
              onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="20123456789"
              required
            />
          </div>

          {/* Tipo de Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Proveedor <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.tipo_proveedor}
              onChange={(e) =>
                setFormData({ ...formData, tipo_proveedor: e.target.value as TipoProveedor })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              {TIPOS_PROVEEDOR.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de Contacto <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.contacto_email}
              onChange={(e) =>
                setFormData({ ...formData, contacto_email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="contacto@proveedor.com"
              required
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.contacto_telefono}
              onChange={(e) =>
                setFormData({ ...formData, contacto_telefono: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="+51 999 888 777"
              required
            />
          </div>

          {/* Alerta */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-sm text-blue-700">
              ℹ️ El proveedor se creará <strong>desactivado</strong> por defecto.
              Deberás activarlo manualmente después de crearlo.
            </p>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Proveedor'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};