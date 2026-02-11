// src/pages/reportes/components/ProgresoUsuarios.tsx

import React, { useState } from 'react';
import { Card } from '@/components/common';
import { User, TrendingUp, TrendingDown, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { ModalListaUsuarios } from './ModalListaUsuarios';

interface ProgresoUsuariosProps {
  usuarios: Array<{
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
  }>;
}

export const ProgresoUsuarios: React.FC<ProgresoUsuariosProps> = ({ usuarios }) => {
  const [sortBy, setSortBy] = useState<'nombre' | 'nivel' | 'gap' | 'cumplimiento'>('cumplimiento');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedUsuarios, setSelectedUsuarios] = useState<typeof usuarios>([]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getProgressColorText = (percentage: number) => {
    if (percentage >= 80) return 'text-green-700';
    if (percentage >= 60) return 'text-blue-700';
    if (percentage >= 40) return 'text-yellow-700';
    return 'text-orange-700';
  };

  const getGapBadgeColor = (gap: number) => {
    if (gap >= 2) return 'bg-red-100 text-red-700 border-red-200';
    if (gap >= 1) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getNivelBadgeColor = (nivel: number) => {
    if (nivel >= 4) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (nivel >= 3) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (nivel >= 2) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // ⭐ Funciones para mostrar modales con usuarios filtrados
  const handleMejorNivel = () => {
    const maxNivel = Math.max(...usuarios.map(u => u.nivel_actual_promedio));
    const filtrados = usuarios.filter(u => u.nivel_actual_promedio === maxNivel);
    setSelectedUsuarios(filtrados);
    setModalTitle(`Colaboradores con Mejor Nivel (${maxNivel.toFixed(1)})`);
    setModalOpen(true);
  };

  const handleMenorBrecha = () => {
    const minGap = Math.min(...usuarios.map(u => u.gap_promedio));
    const filtrados = usuarios.filter(u => u.gap_promedio === minGap);
    setSelectedUsuarios(filtrados);
    setModalTitle(`Colaboradores con Menor Brecha (${minGap.toFixed(1)})`);
    setModalOpen(true);
  };

  const handleMayorCumplimiento = () => {
    const maxCumplimiento = Math.max(...usuarios.map(u => u.porcentaje_cumplimiento_promedio));
    const filtrados = usuarios.filter(u => u.porcentaje_cumplimiento_promedio === maxCumplimiento);
    setSelectedUsuarios(filtrados);
    setModalTitle(`Colaboradores con Mayor Cumplimiento (${maxCumplimiento.toFixed(0)}%)`);
    setModalOpen(true);
  };

  const handleTodosUsuarios = () => {
    setSelectedUsuarios(usuarios);
    setModalTitle('Todos los Colaboradores');
    setModalOpen(true);
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedUsuarios = [...usuarios].sort((a, b) => {
    let valueA: number | string;
    let valueB: number | string;

    switch (sortBy) {
      case 'nombre':
        valueA = a.usuario.nombre_completo.toLowerCase();
        valueB = b.usuario.nombre_completo.toLowerCase();
        break;
      case 'nivel':
        valueA = a.nivel_actual_promedio;
        valueB = b.nivel_actual_promedio;
        break;
      case 'gap':
        valueA = a.gap_promedio;
        valueB = b.gap_promedio;
        break;
      case 'cumplimiento':
        valueA = a.porcentaje_cumplimiento_promedio;
        valueB = b.porcentaje_cumplimiento_promedio;
        break;
      default:
        return 0;
    }

    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ column }: { column: typeof sortBy }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp size={16} className="inline ml-1" />
    ) : (
      <ChevronDown size={16} className="inline ml-1" />
    );
  };

  return (
    <>
      <Card className="overflow-hidden">
        {/* Header con Estadísticas Clickeables */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Progreso por Usuario</h3>
            <p className="text-sm text-gray-600 mt-1">
              {usuarios.length} colaborador{usuarios.length !== 1 ? 'es' : ''} evaluado{usuarios.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* ⭐ Estadísticas Clickeables */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Mejor Nivel */}
            <button
              onClick={handleMejorNivel}
              className="text-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all hover:shadow-md group"
            >
              <p className="text-xs text-green-700 mb-1 font-medium">Mejor Nivel</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.max(...usuarios.map(u => u.nivel_actual_promedio)).toFixed(1)}
              </p>
              <p className="text-xs text-green-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver colaboradores →
              </p>
            </button>

            {/* Menor Brecha */}
            <button
              onClick={handleMenorBrecha}
              className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all hover:shadow-md group"
            >
              <p className="text-xs text-blue-700 mb-1 font-medium">Menor Brecha</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.min(...usuarios.map(u => u.gap_promedio)).toFixed(1)}
              </p>
              <p className="text-xs text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver colaboradores →
              </p>
            </button>

            {/* Mayor Cumplimiento */}
            <button
              onClick={handleMayorCumplimiento}
              className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all hover:shadow-md group"
            >
              <p className="text-xs text-purple-700 mb-1 font-medium">Mayor Cumplimiento</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.max(...usuarios.map(u => u.porcentaje_cumplimiento_promedio)).toFixed(0)}%
              </p>
              <p className="text-xs text-purple-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver colaboradores →
              </p>
            </button>

            {/* Total Dimensiones */}
            <button
              onClick={handleTodosUsuarios}
              className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-all hover:shadow-md group"
            >
              <p className="text-xs text-orange-700 mb-1 font-medium">Total Colaboradores</p>
              <p className="text-2xl font-bold text-orange-600">
                {usuarios.length}
              </p>
              <p className="text-xs text-orange-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver todos →
              </p>
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('nombre')}
                >
                  Usuario <SortIcon column="nombre" />
                </th>
                <th
                  className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('nivel')}
                >
                  Nivel Promedio <SortIcon column="nivel" />
                </th>
                <th
                  className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('gap')}
                >
                  Brecha (GAP) <SortIcon column="gap" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('cumplimiento')}
                >
                  Cumplimiento <SortIcon column="cumplimiento" />
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dimensiones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedUsuarios.map((usuario) => (
                <tr
                  key={usuario.usuario.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Usuario */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white font-semibold text-sm">
                          {getInitials(usuario.usuario.nombre_completo)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {usuario.usuario.nombre_completo}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {usuario.usuario.email}
                        </p>
                        {usuario.usuario.cargo && (
                          <p className="text-xs text-gray-500 truncate">
                            {usuario.usuario.cargo}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Nivel Promedio */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getNivelBadgeColor(usuario.nivel_actual_promedio)}`}>
                      {usuario.nivel_actual_promedio.toFixed(1)}
                    </span>
                  </td>

                  {/* GAP */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getGapBadgeColor(usuario.gap_promedio)}`}>
                      {usuario.gap_promedio >= 2 ? (
                        <TrendingUp size={14} className="mr-1" />
                      ) : (
                        <TrendingDown size={14} className="mr-1" />
                      )}
                      {usuario.gap_promedio.toFixed(1)}
                    </span>
                  </td>

                  {/* Cumplimiento con barra */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getProgressColor(usuario.porcentaje_cumplimiento_promedio)}`}
                          style={{ width: `${usuario.porcentaje_cumplimiento_promedio}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold min-w-[3rem] text-right ${getProgressColorText(usuario.porcentaje_cumplimiento_promedio)}`}>
                        {usuario.porcentaje_cumplimiento_promedio.toFixed(0)}%
                      </span>
                    </div>
                  </td>

                  {/* Dimensiones */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-100 text-purple-700 text-sm font-medium border border-purple-200">
                      <Award size={14} className="mr-1" />
                      {usuario.total_dimensiones_evaluadas}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ⭐ Modal para mostrar lista de usuarios */}
      <ModalListaUsuarios
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        usuarios={selectedUsuarios}
      />
    </>
  );
};