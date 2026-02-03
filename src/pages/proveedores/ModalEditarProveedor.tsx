// src/pages/proveedores/ModalEditarProveedor.tsx

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Info,
  AlertCircle,
  Calendar,
  FileText,
  Shield,
  Save,
  Building2,
  Globe
} from 'lucide-react';
import { proveedoresApi, tiposProveedorApi, clasificacionesProveedorApi } from '@/api/endpoints';
import { 
  Proveedor,
  ProveedorUpdate, 
  TipoProveedor, 
  ClasificacionProveedor,
  NivelRiesgo,
  TipoContrato,
  EstadoProveedor,
  NIVELES_RIESGO,
  TIPOS_CONTRATO,
  ESTADOS_PROVEEDOR,
} from '@/types';
import { Button, Card } from '@/components/common';
import { usePermissions } from '@/hooks/usePermissions';
import toast from 'react-hot-toast';

interface ModalEditarProveedorProps {
  proveedor: Proveedor;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalEditarProveedor: React.FC<ModalEditarProveedorProps> = ({
  proveedor,
  onClose,
  onSuccess,
}) => {
  const { isSuperuser } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  
  // Estados para catálogos
  const [tiposProveedor, setTiposProveedor] = useState<TipoProveedor[]>([]);
  const [clasificaciones, setClasificaciones] = useState<ClasificacionProveedor[]>([]);
  
  const [mostrarCamposAvanzados, setMostrarCamposAvanzados] = useState(false);
  const [certificacionesInput, setCertificacionesInput] = useState('');
  
  const [formData, setFormData] = useState<ProveedorUpdate>({
    tipo_proveedor: proveedor.tipo_proveedor,
    clasificacion: proveedor.clasificacion || undefined,
    
    // Información básica
    razon_social: proveedor.razon_social,
    nombre_comercial: proveedor.nombre_comercial || '',
    
    // Legal y fiscal
    pais: proveedor.pais,
    tipo_documento_fiscal: proveedor.tipo_documento_fiscal,
    numero_documento_fiscal: proveedor.numero_documento_fiscal,
    direccion_legal: proveedor.direccion_legal || '',
    
    // Contacto
    nombre_contacto_principal: proveedor.nombre_contacto_principal || '',
    cargo_contacto: proveedor.cargo_contacto || '',
    email_contacto: proveedor.email_contacto,
    telefono_contacto: proveedor.telefono_contacto,
    
    // Contractual
    numero_contrato: proveedor.numero_contrato || '',
    fecha_inicio_contrato: proveedor.fecha_inicio_contrato || undefined,
    fecha_fin_contrato: proveedor.fecha_fin_contrato || undefined,
    tipo_contrato: proveedor.tipo_contrato || undefined,
    sla_aplica: proveedor.sla_aplica,
    
    // GRC
    nivel_riesgo: proveedor.nivel_riesgo,
    proveedor_estrategico: proveedor.proveedor_estrategico,
    estado_proveedor: proveedor.estado_proveedor,
    fecha_baja: proveedor.fecha_baja || undefined,
    
    // Cumplimiento
    requiere_certificaciones: proveedor.requiere_certificaciones,
    certificaciones: proveedor.certificaciones,
    cumple_compliance: proveedor.cumple_compliance,
    ultima_evaluacion_riesgo: proveedor.ultima_evaluacion_riesgo || undefined,
    proxima_evaluacion_riesgo: proveedor.proxima_evaluacion_riesgo || undefined,
    
    // Observaciones
    observaciones: proveedor.observaciones || '',
  });

  // Cargar catálogos al montar
  useEffect(() => {
    cargarCatalogos();
    // Convertir certificaciones array a string para input
    if (proveedor.certificaciones && proveedor.certificaciones.length > 0) {
      setCertificacionesInput(proveedor.certificaciones.join(', '));
    }
  }, []);

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      
      const [tiposData, clasificacionesData] = await Promise.all([
        tiposProveedorApi.getAll(),
        clasificacionesProveedorApi.getAll(),
      ]);
      
      setTiposProveedor(tiposData);
      setClasificaciones(clasificacionesData);
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
      toast.error('Error al cargar catálogos');
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.razon_social?.trim()) {
      toast.error('La razón social es obligatoria');
      return;
    }

    if (!formData.numero_documento_fiscal?.trim()) {
      toast.error('El número de documento fiscal es obligatorio');
      return;
    }

    if (!formData.tipo_proveedor) {
      toast.error('Debes seleccionar un tipo de proveedor');
      return;
    }

    if (!formData.email_contacto?.trim()) {
      toast.error('El email de contacto es obligatorio');
      return;
    }

    if (!formData.telefono_contacto?.trim()) {
      toast.error('El teléfono de contacto es obligatorio');
      return;
    }

    // Validar fechas de contrato si se proporcionan
    if (formData.fecha_inicio_contrato && formData.fecha_fin_contrato) {
      if (new Date(formData.fecha_inicio_contrato) > new Date(formData.fecha_fin_contrato)) {
        toast.error('La fecha de inicio no puede ser mayor a la fecha de fin del contrato');
        return;
      }
    }

    // Validar fecha de baja si estado es inactivo
    if (formData.estado_proveedor === 'inactivo' && !formData.fecha_baja) {
      const confirmar = confirm('El proveedor será marcado como inactivo sin fecha de baja. ¿Deseas continuar?');
      if (!confirmar) return;
    }

    try {
      setLoading(true);
      
      // Procesar certificaciones desde el input de texto
      const certificacionesArray = certificacionesInput
        .split(',')
        .map(cert => cert.trim())
        .filter(cert => cert.length > 0);
      
      // Preparar payload limpio
      const payload: ProveedorUpdate = {
        ...formData,
        // Limpiar strings vacíos
        nombre_comercial: formData.nombre_comercial?.trim() || undefined,
        direccion_legal: formData.direccion_legal?.trim() || undefined,
        nombre_contacto_principal: formData.nombre_contacto_principal?.trim() || undefined,
        cargo_contacto: formData.cargo_contacto?.trim() || undefined,
        numero_contrato: formData.numero_contrato?.trim() || undefined,
        observaciones: formData.observaciones?.trim() || undefined,
        // Convertir clasificacion vacía a null
        clasificacion: formData.clasificacion || null,
        // Agregar certificaciones procesadas
        certificaciones: certificacionesArray,
      };
      
      await proveedoresApi.partialUpdate(proveedor.id, payload);
      
      toast.success('Proveedor actualizado exitosamente');
      onSuccess();
    } catch (error: any) {
      console.error('Error al actualizar proveedor:', error);
      
      // Manejar errores específicos del backend
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'object' && !errorData.message) {
          const firstError = Object.values(errorData)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
        } else {
          toast.error(errorData.message || 'Error al actualizar proveedor');
        }
      } else {
        toast.error('Error al actualizar proveedor');
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
            <p className="text-gray-600">Cargando datos...</p>
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
          <div>
            <h2 className="text-xl font-bold text-gray-900">Editar Proveedor</h2>
            <p className="text-sm text-gray-600 mt-1">{proveedor.razon_social}</p>
          </div>
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
          {/* INFORMACIÓN DEL ALCANCE (Solo lectura) */}
          {/* ============================================================ */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              {proveedor.es_global ? (
                <>
                  <Globe size={20} className="text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Proveedor Global</p>
                    <p className="text-sm text-gray-600">Disponible para todas las empresas</p>
                  </div>
                </>
              ) : (
                <>
                  <Building2 size={20} className="text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Proveedor de Empresa</p>
                    <p className="text-sm text-gray-600">{proveedor.empresa_nombre}</p>
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ℹ️ El alcance del proveedor no se puede modificar después de la creación
            </p>
          </div>

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
                  required
                />
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* BOTÓN PARA MOSTRAR CAMPOS AVANZADOS */}
          {/* ============================================================ */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setMostrarCamposAvanzados(!mostrarCamposAvanzados)}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <Info size={16} />
              {mostrarCamposAvanzados ? 'Ocultar' : 'Mostrar'} información avanzada
              (contrato, GRC, cumplimiento)
            </button>
          </div>

          {/* ============================================================ */}
          {/* CAMPOS AVANZADOS */}
          {/* ============================================================ */}
          {mostrarCamposAvanzados && (
            <>
              {/* Estado del Proveedor */}
              <div className="space-y-4 border-t pt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Shield size={18} />
                  Estado del Proveedor
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.estado_proveedor}
                      onChange={(e) =>
                        setFormData({ ...formData, estado_proveedor: e.target.value as EstadoProveedor })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {ESTADOS_PROVEEDOR.map((estado) => (
                        <option key={estado.value} value={estado.value}>
                          {estado.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fecha de Baja (solo si está inactivo) */}
                  {formData.estado_proveedor === 'inactivo' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={14} className="inline mr-1" />
                        Fecha de Baja
                      </label>
                      <input
                        type="date"
                        value={formData.fecha_baja || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, fecha_baja: e.target.value || undefined })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Información Contractual */}
              <div className="space-y-4 border-t pt-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText size={18} />
                  Información Contractual
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
                      <option value="">Sin especificar</option>
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
              <div className="space-y-4 border-t pt-6 bg-amber-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle size={18} />
                  Clasificación GRC y Evaluaciones
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

                  {/* Última Evaluación de Riesgo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={14} className="inline mr-1" />
                      Última Evaluación
                    </label>
                    <input
                      type="date"
                      value={formData.ultima_evaluacion_riesgo || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, ultima_evaluacion_riesgo: e.target.value || undefined })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Próxima Evaluación de Riesgo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={14} className="inline mr-1" />
                      Próxima Evaluación
                    </label>
                    <input
                      type="date"
                      value={formData.proxima_evaluacion_riesgo || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, proxima_evaluacion_riesgo: e.target.value || undefined })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Cumplimiento */}
              <div className="space-y-4 border-t pt-6 bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Shield size={18} />
                  Cumplimiento y Certificaciones
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

                  {/* Certificaciones */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificaciones (separadas por comas)
                    </label>
                    <input
                      type="text"
                      value={certificacionesInput}
                      onChange={(e) => setCertificacionesInput(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="ISO 9001, ISO 27001, SOC 2, etc."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ejemplo: ISO 9001, ISO 27001, SOC 2
                    </p>
                  </div>

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
              <div className="space-y-2 border-t pt-6">
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
                  rows={4}
                />
              </div>
            </>
          )}

          {/* ============================================================ */}
          {/* INFORMACIÓN DE AUDITORÍA */}
          {/* ============================================================ */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Creado por:</strong> {proveedor.creado_por_nombre}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Fecha de creación: {new Date(proveedor.fecha_creacion).toLocaleString('es-PE')}
            </p>
            <p className="text-xs text-gray-500">
              Última actualización: {new Date(proveedor.fecha_actualizacion).toLocaleString('es-PE')}
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
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};