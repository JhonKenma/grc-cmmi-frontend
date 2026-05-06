import { useState, useMemo } from 'react';

export const useTableSort = <T extends Record<string, any>>(
  data: T[],
  defaultSortBy: string,
  defaultSortOrder: 'asc' | 'desc' = 'desc'
) => {
  const [sortBy, setSortBy] = useState<string>(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let valueA: any = a[sortBy];
      let valueB: any = b[sortBy];

      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortBy, sortOrder]);

  return { sortBy, sortOrder, handleSort, sortedData };
};
