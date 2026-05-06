import { useState, useCallback } from 'react';

/**
 * Generic hook for managing tab navigation state
 * Used by ReporteEvaluacion, ReporteEvaluacionIQ and similar tab-based pages
 */
export const useTabState = <T extends string>(initialTab: T) => {
  const [activeTab, setActiveTab] = useState<T>(initialTab);

  const handleTabChange = useCallback((tab: T) => {
    setActiveTab(tab);
  }, []);

  const isTabActive = useCallback((tab: T) => {
    return activeTab === tab;
  }, [activeTab]);

  const resetTab = useCallback(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return {
    activeTab,
    handleTabChange,
    setActiveTab,
    isTabActive,
    resetTab,
  };
};
