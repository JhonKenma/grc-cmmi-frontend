// src/pages/proveedores/ProveedorCard.tsx

import React from 'react';
import { 
  Mail, 
  Phone, 
  Edit, 
  Power, 
  Globe, 
  Building2,
  MapPin,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  Eye,
  Ban
} from 'lucide-react';
import { Proveedor } from '@/types';
import { Card } from '@/components/common';
import { usePermissions } from '@/hooks/usePermissions';

interface ProveedorCardProps {
  proveedor: Proveedor;
  onActivar: (id: string) => void;
  onDesactivar: (id: string) => void;
  onSuspender?: (id: string) => void;
  onEditar: (id: string) => void;
  onVerDetalle?: (id: string) => void;
  onEliminar?: (id: string) => void;
}

export const ProveedorCard: React.FC<ProveedorCardProps> = ({
  proveedor,
  onActivar,
  onDesactivar,
  onSuspender,
  onEditar,
  onVerDetalle,
  onEliminar,
}) => {
  const { isSuperuser } = usePermissions();

  // Helper para obtener el color del estado
  const getEstadoColor = () => {
    switch (proveedor.estado_proveedor) {
      case 'activo':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'suspendido':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'inactivo':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Helper para obtener el color del riesgo
  const getRiesgoColor = () => {
    switch (proveedor.nivel_riesgo) {
      case 'alto':
        return 'bg-red-100 text-red-700';
      case 'medio':
        return 'bg-yellow-100 text-yellow-700';
      case 'bajo':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="relative hover:shadow-lg transition-all hover:scale-[1.02] duration-200">
      {/* Badge Estado Principal */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full border ${getEstadoColor()}`}
        >
          {proveedor.estado_proveedor_display}
        </span>
        
        {/* Badge Estratégico */}
        {proveedor.proveedor_estrategico && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 border border-purple-300">
            ⭐ Estratégico
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="space-y-4">
        {/* Header */}
        <div className="pr-32">
          <h3 className="font-bold text-gray-900 text-lg mb-1">
            {proveedor.razon_social}
          </h3>
          {proveedor.nombre_comercial && (
            <p className="text-sm text-gray-600 italic mb-1">
              "{proveedor.nombre_comercial}"
            </p>
          )}
          <p className="text-sm text-gray-600">
            {proveedor.tipo_documento_fiscal}: {proveedor.numero_documento_fiscal}
          </p>
        </div>

        {/* Badges Principales */}
        <div className="flex flex-wrap gap-2">
          {/* Tipo de Proveedor */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-300">
            {proveedor.tipo_proveedor_nombre}
          </span>

          {/* Clasificación */}
          {proveedor.clasificacion_nombre && (
            <span 
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: proveedor.clasificacion_color ? `${proveedor.clasificacion_color}20` : undefined,
                borderColor: proveedor.clasificacion_color || undefined,
                color: proveedor.clasificacion_color || undefined,
              }}
            >
              <Shield size={12} className="mr-1" />
              {proveedor.clasificacion_nombre}
            </span>
          )}

          {/* Nivel de Riesgo */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRiesgoColor()}`}>
            <AlertCircle size={12} className="mr-1" />
            Riesgo {proveedor.nivel_riesgo_display}
          </span>

          {/* Empresa o Global (solo visible para superadmin) */}
          {isSuperuser && (
            proveedor.es_global ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-300">
                <Globe size={12} className="mr-1" />
                Global
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                <Building2 size={12} className="mr-1" />
                {proveedor.empresa_nombre}
              </span>
            )
          )}
        </div>

        {/* Información de Contacto */}
        <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
          {proveedor.nombre_contacto_principal && (
            <div className="text-sm text-gray-700 font-medium">
              👤 {proveedor.nombre_contacto_principal}
              {proveedor.cargo_contacto && (
                <span className="text-gray-500 font-normal"> - {proveedor.cargo_contacto}</span>
              )}
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600">
            <Mail size={14} className="mr-2 flex-shrink-0" />
            <span className="truncate">{proveedor.email_contacto}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Phone size={14} className="mr-2 flex-shrink-0" />
            {proveedor.telefono_contacto}
          </div>

          {proveedor.pais !== 'Perú' && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin size={14} className="mr-2 flex-shrink-0" />
              {proveedor.pais}
            </div>
          )}
        </div>

        {/* Información de Contrato (si existe) */}
        {(proveedor.numero_contrato || proveedor.fecha_fin_contrato) && (
          <div className="space-y-1 bg-blue-50 p-3 rounded-lg border border-blue-200">
            {proveedor.numero_contrato && (
              <div className="flex items-center text-xs text-blue-700">
                <FileText size={12} className="mr-1 flex-shrink-0" />
                Contrato: {proveedor.numero_contrato}
              </div>
            )}
            
            {proveedor.fecha_fin_contrato && (
              <div className="flex items-center text-xs text-blue-700">
                <Calendar size={12} className="mr-1 flex-shrink-0" />
                Vence: {new Date(proveedor.fecha_fin_contrato).toLocaleDateString('es-PE')}
                {proveedor.contrato_vigente !== null && (
                  proveedor.contrato_vigente ? (
                    <CheckCircle size={12} className="ml-2 text-green-600" />
                  ) : (
                    <XCircle size={12} className="ml-2 text-red-600" />
                  )
                )}
              </div>
            )}

            {proveedor.sla_aplica && (
              <div className="text-xs text-blue-600 font-medium">
                ✓ Con SLA
              </div>
            )}
          </div>
        )}

        {/* Cumplimiento */}
        {(proveedor.requiere_certificaciones || proveedor.certificaciones.length > 0) && (
          <div className="space-y-1 bg-green-50 p-3 rounded-lg border border-green-200">
            {proveedor.requiere_certificaciones && (
              <div className="flex items-center text-xs text-green-700">
                <Shield size={12} className="mr-1 flex-shrink-0" />
                Requiere certificaciones
              </div>
            )}
            
            {proveedor.certificaciones.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {proveedor.certificaciones.slice(0, 3).map((cert, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 text-xs bg-white rounded border border-green-300 text-green-700"
                  >
                    {cert}
                  </span>
                ))}
                {proveedor.certificaciones.length > 3 && (
                  <span className="px-2 py-0.5 text-xs text-green-600">
                    +{proveedor.certificaciones.length - 3} más
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              {proveedor.cumple_compliance ? (
                <span className="text-xs text-green-700 flex items-center">
                  <CheckCircle size={12} className="mr-1" />
                  Cumple compliance
                </span>
              ) : (
                <span className="text-xs text-red-700 flex items-center">
                  <XCircle size={12} className="mr-1" />
                  No cumple compliance
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer con información de auditoría */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              <p className="font-medium">Creado por: {proveedor.creado_por_nombre}</p>
              <p className="text-gray-400">
                {new Date(proveedor.fecha_creacion).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            {proveedor.proxima_evaluacion_riesgo && (
              <div className="text-right">
                <p className="text-orange-600 font-medium">Próx. evaluación:</p>
                <p className="text-orange-500">
                  {new Date(proveedor.proxima_evaluacion_riesgo).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 pt-2">
          {/* Ver Detalle */}
          {onVerDetalle && (
            <button
              onClick={() => onVerDetalle(proveedor.id)}
              className="flex-1 px-3 py-2 text-sm bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors flex items-center justify-center font-medium"
              title="Ver detalle completo"
            >
              <Eye size={16} className="mr-1" />
              Ver
            </button>
          )}

          {/* Editar */}
          <button
            onClick={() => onEditar(proveedor.id)}
            className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center font-medium"
            title="Editar proveedor"
          >
            <Edit size={16} className="mr-1" />
            Editar
          </button>

          {/* Activar/Desactivar/Suspender */}
          {proveedor.estado_proveedor === 'activo' ? (
            <div className="flex gap-2 flex-1">
              {onSuspender && (
                <button
                  onClick={() => onSuspender(proveedor.id)}
                  className="flex-1 px-3 py-2 text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors flex items-center justify-center font-medium"
                  title="Suspender proveedor"
                >
                  <Ban size={16} className="mr-1" />
                  Suspender
                </button>
              )}
              <button
                onClick={() => onDesactivar(proveedor.id)}
                className="flex-1 px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors flex items-center justify-center font-medium"
                title="Desactivar proveedor"
              >
                <Power size={16} className="mr-1" />
                Desactivar
              </button>
            </div>
          ) : (
            <button
              onClick={() => onActivar(proveedor.id)}
              className="flex-1 px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors flex items-center justify-center font-medium"
              title="Activar proveedor"
            >
              <Power size={16} className="mr-1" />
              Activar
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};