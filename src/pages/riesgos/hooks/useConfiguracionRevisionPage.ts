import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useConfiguracionRevision, useUpdateConfiguracionRevision } from '@/hooks/useMaestros';

export const useConfiguracionRevisionPage = () => {
  const navigate = useNavigate();
  const configQuery = useConfiguracionRevision();
  const updateMutation = useUpdateConfiguracionRevision();
  const [form, setForm] = useState({
    dias_critico: 90,
    dias_alto: 90,
    dias_medio: 180,
    dias_bajo: 360,
    dias_insignificante: 360,
  });

  useEffect(() => {
    if (configQuery.data) setForm(configQuery.data);
  }, [configQuery.data]);

  return {
    navigate,
    configQuery,
    updateMutation,
    form,
    setForm,
  } as const;
};
