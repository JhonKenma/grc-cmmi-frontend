import { useState, useMemo } from 'react';

interface UsuarioData {
  usuario: { nombre_completo: string };
  nivel_actual_promedio: number;
  gap_promedio: number;
  porcentaje_cumplimiento_promedio: number;
}

export const useProgresoUsuariosTable = (usuarios: UsuarioData[]) => {
  const [sortBy, setSortBy] = useState<'nombre' | 'nivel' | 'gap' | 'cumplimiento'>('cumplimiento');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedUsuarios, setSelectedUsuarios] = useState<UsuarioData[]>([]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedUsuarios = useMemo(() => {
    return [...usuarios].sort((a, b) => {
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
  }, [usuarios, sortBy, sortOrder]);

  const openModal = (title: string, filteredUsuarios: UsuarioData[]) => {
    setModalTitle(title);
    setSelectedUsuarios(filteredUsuarios);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleMejorNivel = () => {
    const maxNivel = Math.max(...usuarios.map(u => u.nivel_actual_promedio));
    const filtrados = usuarios.filter(u => u.nivel_actual_promedio === maxNivel);
    openModal(`Colaboradores con Mejor Nivel (${maxNivel.toFixed(1)})`, filtrados);
  };

  const handleMenorBrecha = () => {
    const minGap = Math.min(...usuarios.map(u => u.gap_promedio));
    const filtrados = usuarios.filter(u => u.gap_promedio === minGap);
    openModal(`Colaboradores con Menor Brecha (${minGap.toFixed(1)})`, filtrados);
  };

  const handleMayorCumplimiento = () => {
    const maxCumplimiento = Math.max(...usuarios.map(u => u.porcentaje_cumplimiento_promedio));
    const filtrados = usuarios.filter(u => u.porcentaje_cumplimiento_promedio === maxCumplimiento);
    openModal(`Colaboradores con Mayor Cumplimiento (${maxCumplimiento.toFixed(0)}%)`, filtrados);
  };

  const handleTodosUsuarios = () => {
    openModal('Todos los Colaboradores', usuarios);
  };

  return {
    sortBy,
    sortOrder,
    sortedUsuarios,
    modalOpen,
    modalTitle,
    selectedUsuarios,
    handleSort,
    handleMejorNivel,
    handleMenorBrecha,
    handleMayorCumplimiento,
    handleTodosUsuarios,
    closeModal,
  };
};
