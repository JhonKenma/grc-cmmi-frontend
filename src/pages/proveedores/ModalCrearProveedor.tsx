// src/pages/proveedores/ModalCrearProveedor.tsx

import React, { useState, useEffect } from 'react';
import { X, Globe, Building2 } from 'lucide-react';
import axiosInstance from '@/api/axios'; // ⭐ SOLO NECESITAS ESTO
import { proveedoresApi } from '@/api/endpoints';
import { ProveedorCreate, TipoProveedor, Empresa } from '@/types';
import { Button, Card } from '@/components/common';
import { usePermissions } from '@/hooks/usePermissions';
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
  const { isSuperuser } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [esGlobal, setEsGlobal] = useState(false);
  
  const [formData, setFormData] = useState<ProveedorCreate>({
    empresa: undefined,
    razon_social: '',
    ruc: '',
    tipo_proveedor: 'consultoria',
    contacto_email: '',
    contacto_telefono: '',
  });

  // ⭐ Cargar empresas si es superadmin
  useEffect(() => {
    if (isSuperuser) {
      cargarEmpresas();
    }
  }, [isSuperuser]);

  const cargarEmpresas = async () => {
    try {
      setLoadingEmpresas(true);
      
      // ⭐ Usar axiosInstance directamente
      const response = await axiosInstance.get('/empresas/');
      const data = response.data;
      
      // Manejar diferentes formatos de respuesta
      if (data.results) {
        setEmpresas(data.results);
      } else if (Array.isArray(data)) {
        setEmpresas(data);
      } else {
        setEmpresas([]);
      }
    } catch (error) {
      console.error('Error al cargar empresas:', error);
      toast.error('Error al cargar empresas');
      setEmpresas([]);
    } finally {
      setLoadingEmpresas(false);
    }
  };

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

    // ⭐ Validación para superadmin
    if (isSuperuser && !esGlobal && !formData.empresa) {
      toast.error('Debes seleccionar una empresa o marcar como global');
      return;
    }

    try {
      setLoading(true);
      
      // ⭐ Preparar payload según si es global o no
      const payload: ProveedorCreate = {
        ...formData,
        empresa: esGlobal ? null : formData.empresa,
      };
      
      await proveedoresApi.create(payload);
      
      const mensaje = esGlobal 
        ? 'Proveedor global creado exitosamente'
        : 'Proveedor creado exitosamente';
      
      toast.success(mensaje);
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
          {/* ⭐ Selector Global/Empresa (solo superadmin) */}
          {isSuperuser && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Tipo de Proveedor
              </label>
              
              <div className="flex gap-4">
                {/* Opción: Proveedor de Empresa */}
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoProveedor"
                    checked={!esGlobal}
                    onChange={() => setEsGlobal(false)}
                    className="sr-only"
                  />
                  <div
                    className={`p-4 rounded-lg border-2 transition-all ${
                      !esGlobal
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 size={24} className={!esGlobal ? 'text-primary-600' : 'text-gray-400'} />
                      <div>
                        <p className="font-medium text-gray-900">Proveedor de Empresa</p>
                        <p className="text-sm text-gray-600">Asignar a una empresa específica</p>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Opción: Proveedor Global */}
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoProveedor"
                    checked={esGlobal}
                    onChange={() => setEsGlobal(true)}
                    className="sr-only"
                  />
                  <div
                    className={`p-4 rounded-lg border-2 transition-all ${
                      esGlobal
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Globe size={24} className={esGlobal ? 'text-purple-600' : 'text-gray-400'} />
                      <div>
                        <p className="font-medium text-gray-900">Proveedor Global</p>
                        <p className="text-sm text-gray-600">Sin empresa asignada</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ⭐ Selector de Empresa (solo si no es global y es superadmin) */}
          {isSuperuser && !esGlobal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa <span className="text-red-500">*</span>
              </label>
              {loadingEmpresas ? (
                <div className="text-sm text-gray-500">Cargando empresas...</div>
              ) : (
                <select
                  value={formData.empresa || ''}
                  onChange={(e) =>
                    setFormData({ 
                      ...formData, 
                      empresa: e.target.value ? Number(e.target.value) : undefined 
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar empresa...</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

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
          <div className={`border-l-4 p-4 rounded ${
            esGlobal 
              ? 'bg-purple-50 border-purple-400'
              : 'bg-blue-50 border-blue-400'
          }`}>
            <p className={`text-sm ${esGlobal ? 'text-purple-700' : 'text-blue-700'}`}>
              {esGlobal ? (
                <>
                  🌐 Este será un <strong>proveedor global</strong> sin empresa asignada.
                  Se creará desactivado por defecto.
                </>
              ) : (
                <>
                  ℹ️ El proveedor se creará <strong>desactivado</strong> por defecto.
                  Deberás activarlo manualmente después de crearlo.
                </>
              )}
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