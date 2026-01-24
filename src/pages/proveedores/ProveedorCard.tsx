// src/pages/proveedores/ProveedorCard.tsx

import React from 'react';
import { Mail, Phone, Edit, Power, Globe, Building2 } from 'lucide-react';
import { Proveedor } from '@/types';
import { Card } from '@/components/common';
import { usePermissions } from '@/hooks/usePermissions'; // ⭐ CORRECTO

interface ProveedorCardProps {
  proveedor: Proveedor;
  onActivar: (id: string) => void;
  onDesactivar: (id: string) => void;
  onEditar: (id: string) => void;
  onEliminar: (id: string) => void;
}

export const ProveedorCard: React.FC<ProveedorCardProps> = ({
  proveedor,
  onActivar,
  onDesactivar,
  onEditar,
  onEliminar,
}) => {
  const { isSuperuser } = usePermissions(); // ⭐ CORRECTO

  return (
    <Card className="relative hover:shadow-lg transition-shadow">
      {/* Badge Estado */}
      <div className="absolute top-4 right-4">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            proveedor.activo
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {proveedor.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {/* Contenido */}
      <div className="space-y-4">
        {/* Header */}
        <div className="pr-20">
          <h3 className="font-bold text-gray-900 text-lg">
            {proveedor.razon_social}
          </h3>
          <p className="text-sm text-gray-600">RUC: {proveedor.ruc}</p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {/* Tipo */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
            {proveedor.tipo_proveedor_display}
          </span>

          {/* Empresa o Global (solo visible para superadmin) */}
          {isSuperuser && (
            proveedor.es_global ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                <Globe size={14} className="mr-1" />
                Global
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                <Building2 size={14} className="mr-1" />
                {proveedor.empresa_nombre}
              </span>
            )
          )}
        </div>

        {/* Contacto */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Mail size={16} className="mr-2 flex-shrink-0" />
            <span className="truncate">{proveedor.contacto_email}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone size={16} className="mr-2 flex-shrink-0" />
            {proveedor.contacto_telefono}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Creado por: {proveedor.creado_por_nombre}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(proveedor.fecha_creacion).toLocaleDateString('es-PE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => onEditar(proveedor.id)}
            className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center"
          >
            <Edit size={16} className="mr-1" />
            Editar
          </button>

          {proveedor.activo ? (
            <button
              onClick={() => onDesactivar(proveedor.id)}
              className="flex-1 px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors flex items-center justify-center"
            >
              <Power size={16} className="mr-1" />
              Desactivar
            </button>
          ) : (
            <button
              onClick={() => onActivar(proveedor.id)}
              className="flex-1 px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors flex items-center justify-center"
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