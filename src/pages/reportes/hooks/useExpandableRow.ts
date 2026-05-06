import { useState } from 'react';

export const useExpandableRow = () => {
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const toggle = (id: string | number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const isExpanded = (id: string | number) => expandedId === id;

  const close = () => setExpandedId(null);

  return { expandedId, toggle, isExpanded, close };
};
