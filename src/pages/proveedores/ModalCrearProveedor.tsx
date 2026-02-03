// src/pages/proveedores/ModalCrearProveedor.tsx

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Globe, 
  Building2, 
  Info,
  AlertCircle,
  Calendar,
  FileText,
  Shield
} from 'lucide-react';
import axiosInstance from '@/api/axios';
import { proveedoresApi, tiposProveedorApi, clasificacionesProveedorApi } from '@/api/endpoints';
import { 
  ProveedorCreate, 
  TipoProveedor, 
  ClasificacionProveedor,
  Empresa,
  NivelRiesgo,
  TipoContrato,
  NIVELES_RIESGO,
  TIPOS_CONTRATO,
} from '@/types';
import { Button, Card } from '@/components/common';
import { usePermissions } from '@/hooks/usePermissions';
import toast from 'react-hot-toast';

interface ModalCrearProveedorProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalCrearProveedor: React.FC<ModalCrearProveedorProps> = ({
  onClose,
  onSuccess,
}) => {
  const { isSuperuser } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  
  // Estados para catálogos
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [tiposProveedor, setTiposProveedor] = useState<TipoProveedor[]>([]);
  const [clasificaciones, setClasificaciones] = useState<ClasificacionProveedor[]>([]);
  
  const [esGlobal, setEsGlobal] = useState(false);
  const [mostrarCamposOpcionales, setMostrarCamposOpcionales] = useState(false);
  
  const [formData, setFormData] = useState<ProveedorCreate>({
    empresa: undefined,
    tipo_proveedor: '',
    clasificacion: undefined,
    
    // Información básica
    razon_social: '',
    nombre_comercial: '',
    
    // Legal y fiscal
    pais: 'Perú',
    tipo_documento_fiscal: 'RUC',
    numero_documento_fiscal: '',
    direccion_legal: '',
    
    // Contacto
    nombre_contacto_principal: '',
    cargo_contacto: '',
    email_contacto: '',
    telefono_contacto: '',
    
    // Contractual (opcional)
    numero_contrato: '',
    fecha_inicio_contrato: undefined,
    fecha_fin_contrato: undefined,
    tipo_contrato: undefined,
    sla_aplica: false,
    
    // GRC (opcional)
    nivel_riesgo: 'medio',
    proveedor_estrategico: false,
    
    // Cumplimiento (opcional)
    requiere_certificaciones: false,
    certificaciones: [],
    cumple_compliance: true,
    
    // Observaciones
    observaciones: '',
  });

  // Cargar catálogos al montar
  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      
      // Cargar en paralelo
      const [tiposData, clasificacionesData, empresasData] = await Promise.all([
        tiposProveedorApi.getAll(),
        clasificacionesProveedorApi.getAll(),
        isSuperuser ? cargarEmpresas() : Promise.resolve([]),
      ]);
      
      setTiposProveedor(tiposData);
      setClasificaciones(clasificacionesData);
      
      if (isSuperuser) {
        setEmpresas(empresasData);
      }
      
      // Establecer primer tipo por defecto si existe
      if (tiposData.length > 0) {
        setFormData(prev => ({ ...prev, tipo_proveedor: tiposData[0].id }));
      }
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
      toast.error('Error al cargar catálogos');
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const cargarEmpresas = async (): Promise<Empresa[]> => {
    try {
      const response = await axiosInstance.get('/empresas/');
      const data = response.data;
      
      if (data.results) return data.results;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error al cargar empresas:', error);
      return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.razon_social.trim()) {
      toast.error('La razón social es obligatoria');
      return;
    }

    if (!formData.numero_documento_fiscal.trim()) {
      toast.error('El número de documento fiscal es obligatorio');
      return;
    }

    if (!formData.tipo_proveedor) {
      toast.error('Debes seleccionar un tipo de proveedor');
      return;
    }

    if (!formData.email_contacto.trim()) {
      toast.error('El email de contacto es obligatorio');
      return;
    }

    if (!formData.telefono_contacto.trim()) {
      toast.error('El teléfono de contacto es obligatorio');
      return;
    }

    // Validación para superadmin
    if (isSuperuser && !esGlobal && !formData.empresa) {
      toast.error('Debes seleccionar una empresa o marcar como global');
      return;
    }

    // Validar fechas de contrato si se proporcionan
    if (formData.fecha_inicio_contrato && formData.fecha_fin_contrato) {
      if (new Date(formData.fecha_inicio_contrato) > new Date(formData.fecha_fin_contrato)) {
        toast.error('La fecha de inicio no puede ser mayor a la fecha de fin del contrato');
        return;
      }
    }

    try {
      setLoading(true);
      
      // Preparar payload limpio (sin campos vacíos)
      const payload: ProveedorCreate = {
        ...formData,
        empresa: esGlobal ? null : formData.empresa,
        // Limpiar strings vacíos
        nombre_comercial: formData.nombre_comercial?.trim() || undefined,
        direccion_legal: formData.direccion_legal?.trim() || undefined,
        nombre_contacto_principal: formData.nombre_contacto_principal?.trim() || undefined,
        cargo_contacto: formData.cargo_contacto?.trim() || undefined,
        numero_contrato: formData.numero_contrato?.trim() || undefined,
        observaciones: formData.observaciones?.trim() || undefined,
        // Convertir clasificacion vacía a null
        clasificacion: formData.clasificacion || null,
      };
      
      await proveedoresApi.create(payload);
      
      const mensaje = esGlobal 
        ? 'Proveedor global creado exitosamente'
        : 'Proveedor creado exitosamente';
      
      toast.success(mensaje);
      onSuccess();
    } catch (error: any) {
      console.error('Error al crear proveedor:', error);
      
      // Manejar errores específicos del backend
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Si hay errores de campo específicos
        if (typeof errorData === 'object' && !errorData.message) {
          const firstError = Object.values(errorData)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
        } else {
          toast.error(errorData.message || 'Error al crear proveedor');
        }
      } else {
        toast.error('Error al crear proveedor');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingCatalogos) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando catálogos...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Nuevo Proveedor</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ============================================================ */}
          {/* TIPO DE PROVEEDOR (Global/Empresa) - Solo Superadmin */}
          {/* ============================================================ */}
          {isSuperuser && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg space-y-4 border border-purple-200">
              <label className="block text-sm font-medium text-gray-700">
                <Shield className="inline-block mr-2" size={16} />
                Alcance del Proveedor
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Opción: Proveedor de Empresa */}
                <label className="cursor-pointer">
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
                        ? 'border-primary-500 bg-white shadow-md'
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
                <label className="cursor-pointer">
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
                        ? 'border-purple-500 bg-white shadow-md'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Globe size={24} className={esGlobal ? 'text-purple-600' : 'text-gray-400'} />
                      <div>
                        <p className="font-medium text-gray-900">Proveedor Global</p>
                        <p className="text-sm text-gray-600">Disponible para todas las empresas</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Selector de Empresa (solo si no es global y es superadmin) */}
          {isSuperuser && !esGlobal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.empresa || ''}
                onChange={(e) =>
                  setFormData({ 
                    ...formData, 
                    empresa: e.target.value || undefined
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
            </div>
          )}

          {/* ============================================================ */}
          {/* INFORMACIÓN BÁSICA */}
          {/* ============================================================ */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={18} />
              Información Básica
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Razón Social */}
              <div className="col-span-2">
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
                  placeholder="Ej: Tech Solutions S.A.C."
                  required
                />
              </div>

              {/* Nombre Comercial */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Comercial
                </label>
                <input
                  type="text"
                  value={formData.nombre_comercial}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre_comercial: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Nombre comercial (opcional)"
                />
              </div>

              {/* Tipo de Proveedor */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Proveedor <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tipo_proveedor}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo_proveedor: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar tipo...</option>
                  {tiposProveedor.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clasificación */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clasificación de Criticidad
                </label>
                <select
                  value={formData.clasificacion || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, clasificacion: e.target.value || undefined })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sin clasificar</option>
                  {clasificaciones.map((clasificacion) => (
                    <option key={clasificacion.id} value={clasificacion.id}>
                      {clasificacion.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Define la criticidad del proveedor para tu organización
                </p>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* INFORMACIÓN LEGAL Y FISCAL */}
          {/* ============================================================ */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building2 size={18} />
              Información Legal y Fiscal
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* País */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País
                </label>
                <input
                  type="text"
                  value={formData.pais}
                  onChange={(e) =>
                    setFormData({ ...formData, pais: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Tipo de Documento Fiscal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento
                </label>
                <input
                  type="text"
                  value={formData.tipo_documento_fiscal}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo_documento_fiscal: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="RUC, Tax ID, NIT, etc."
                />
              </div>

              {/* Número de Documento Fiscal */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Documento Fiscal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.numero_documento_fiscal}
                  onChange={(e) =>
                    setFormData({ ...formData, numero_documento_fiscal: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="20123456789"
                  required
                />
              </div>

              {/* Dirección Legal */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección Legal
                </label>
                <textarea
                  value={formData.direccion_legal}
                  onChange={(e) =>
                    setFormData({ ...formData, direccion_legal: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Dirección legal completa"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* INFORMACIÓN DE CONTACTO */}
          {/* ============================================================ */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-semibold text-gray-900">Información de Contacto</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Nombre Contacto */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Contacto Principal
                </label>
                <input
                  type="text"
                  value={formData.nombre_contacto_principal}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre_contacto_principal: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Juan Pérez"
                />
              </div>

              {/* Cargo */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo del Contacto
                </label>
                <input
                  type="text"
                  value={formData.cargo_contacto}
                  onChange={(e) =>
                    setFormData({ ...formData, cargo_contacto: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Gerente Comercial"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Contacto <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email_contacto}
                  onChange={(e) =>
                    setFormData({ ...formData, email_contacto: e.target.value })
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
                  value={formData.telefono_contacto}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono_contacto: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+51 999 888 777"
                  required
                />
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* BOTÓN PARA MOSTRAR CAMPOS OPCIONALES */}
          {/* ============================================================ */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setMostrarCamposOpcionales(!mostrarCamposOpcionales)}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <Info size={16} />
              {mostrarCamposOpcionales ? 'Ocultar' : 'Mostrar'} campos opcionales
              (contrato, GRC, cumplimiento)
            </button>
          </div>

          {/* ============================================================ */}
          {/* CAMPOS OPCIONALES */}
          {/* ============================================================ */}
          {mostrarCamposOpcionales && (
            <>
              {/* Información Contractual */}
              <div className="space-y-4 border-t pt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText size={18} />
                  Información Contractual (Opcional)
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Número de Contrato */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Contrato
                    </label>
                    <input
                      type="text"
                      value={formData.numero_contrato}
                      onChange={(e) =>
                        setFormData({ ...formData, numero_contrato: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="CONT-2024-001"
                    />
                  </div>

                  {/* Tipo de Contrato */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Contrato
                    </label>
                    <select
                      value={formData.tipo_contrato || ''}
                      onChange={(e) =>
                        setFormData({ 
                          ...formData, 
                          tipo_contrato: (e.target.value as TipoContrato) || undefined 
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar tipo...</option>
                      {TIPOS_CONTRATO.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fecha Inicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={14} className="inline mr-1" />
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_inicio_contrato || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, fecha_inicio_contrato: e.target.value || undefined })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Fecha Fin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={14} className="inline mr-1" />
                      Fecha de Fin
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_fin_contrato || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, fecha_fin_contrato: e.target.value || undefined })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* SLA Aplica */}
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sla_aplica}
                        onChange={(e) =>
                          setFormData({ ...formData, sla_aplica: e.target.checked })
                        }
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        ¿Aplica SLA (Acuerdo de Nivel de Servicio)?
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Clasificación GRC */}
              <div className="space-y-4 border-t pt-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Shield size={18} />
                  Clasificación GRC (Opcional)
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Nivel de Riesgo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nivel de Riesgo
                    </label>
                    <select
                      value={formData.nivel_riesgo}
                      onChange={(e) =>
                        setFormData({ ...formData, nivel_riesgo: e.target.value as NivelRiesgo })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {NIVELES_RIESGO.map((nivel) => (
                        <option key={nivel.value} value={nivel.value}>
                          {nivel.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Proveedor Estratégico */}
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.proveedor_estrategico}
                        onChange={(e) =>
                          setFormData({ ...formData, proveedor_estrategico: e.target.checked })
                        }
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Proveedor Estratégico
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Cumplimiento */}
              <div className="space-y-4 border-t pt-6 bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle size={18} />
                  Cumplimiento (Opcional)
                </h3>

                <div className="space-y-4">
                  {/* Requiere Certificaciones */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requiere_certificaciones}
                      onChange={(e) =>
                        setFormData({ ...formData, requiere_certificaciones: e.target.checked })
                      }
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Requiere Certificaciones
                    </span>
                  </label>

                  {/* Cumple Compliance */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cumple_compliance}
                      onChange={(e) =>
                        setFormData({ ...formData, cumple_compliance: e.target.checked })
                      }
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Cumple con Compliance
                    </span>
                  </label>
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) =>
                    setFormData({ ...formData, observaciones: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Notas adicionales sobre el proveedor..."
                  rows={3}
                />
              </div>
            </>
          )}

          {/* ============================================================ */}
          {/* ALERTA INFORMATIVA */}
          {/* ============================================================ */}
          <div className={`border-l-4 p-4 rounded ${
            esGlobal 
              ? 'bg-purple-50 border-purple-400'
              : 'bg-blue-50 border-blue-400'
          }`}>
            <p className={`text-sm ${esGlobal ? 'text-purple-700' : 'text-blue-700'}`}>
              <Info size={16} className="inline mr-2" />
              {esGlobal ? (
                <>
                  Este será un <strong>proveedor global</strong> disponible para todas las empresas.
                  Se creará desactivado por defecto y requerirá aprobación.
                </>
              ) : (
                <>
                  El proveedor se creará <strong>desactivado</strong> por defecto.
                  Deberás activarlo manualmente después de revisarlo.
                </>
              )}
            </p>
          </div>

          {/* ============================================================ */}
          {/* BOTONES DE ACCIÓN */}
          {/* ============================================================ */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose} 
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                'Crear Proveedor'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};