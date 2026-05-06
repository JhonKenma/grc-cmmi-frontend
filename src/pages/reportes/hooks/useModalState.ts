import { useState } from 'react';

export const useModalState = <T,>(initialData?: T) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<T | null>(initialData ?? null);

  const openModal = (data: T) => {
    setSelectedData(data);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedData(null);
  };

  return {
    isOpen,
    selectedData,
    openModal,
    closeModal,
  };
};
