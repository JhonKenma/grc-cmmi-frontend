import React from 'react';
import { X, User, Mail, Briefcase } from 'lucide-react';

interface Usuario {
  usuario: {
    id: number;
    nombre_completo: string;
    email: string;
    cargo: string;
  };
  nivel_actual_promedio: number;
  gap_promedio: number;
  porcentaje_cumplimiento_promedio: number;
  total_dimensiones_evaluadas: number;
}

interface ModalListaUsuariosProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  usuarios: Usuario[];
}

export const ModalListaUsuarios: React.FC<ModalListaUsuariosProps> = ({
  isOpen,
  onClose,
  title,
  usuarios,
}) => {
  if (!isOpen) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getNivelBadgeColor = (nivel: number) => {
    if (nivel >= 4) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (nivel >= 3) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (nivel >= 2) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getGapBadgeColor = (gap: number) => {
    if (gap >= 2) return 'bg-red-100 text-red-700 border-red-200';
    if (gap >= 1) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {usuarios.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-500">No hay colaboradores para mostrar</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {usuarios.map((usuario) => (
                <div
                  key={usuario.usuario.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white font-semibold text-sm">
                        {getInitials(usuario.usuario.nombre_completo)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {usuario.usuario.nombre_completo}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <Mail size={12} />
                        {usuario.usuario.email}
                      </div>
                      {usuario.usuario.cargo && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Briefcase size={12} />
                          {usuario.usuario.cargo}
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-2">
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Nivel</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getNivelBadgeColor(usuario.nivel_actual_promedio)}`}
                        >
                          {usuario.nivel_actual_promedio.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">GAP</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getGapBadgeColor(usuario.gap_promedio)}`}
                        >
                          {usuario.gap_promedio.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Cumplimiento</p>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                          {usuario.porcentaje_cumplimiento_promedio.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};