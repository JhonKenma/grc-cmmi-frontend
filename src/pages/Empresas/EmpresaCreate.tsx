// src/pages/Empresas/EmpresaCreate.tsx
import { ArrowLeft, Save } from 'lucide-react';
import { EmpresaFormFields } from './components/EmpresaFormFields';
import { useEmpresaCreate } from './hooks';

export const EmpresaCreate = () => {
  const { formData, errors, loading, handleChange, handleSubmit, goToLista } = useEmpresaCreate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={goToLista} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nueva Empresa</h1>
            <p className="text-gray-600 mt-1">Complete los datos de la nueva empresa</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <EmpresaFormFields formData={formData} onChange={handleChange} errors={errors} />

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={goToLista} className="btn-secondary" disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            {loading
              ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Guardando...</>
              : <><Save size={20} /> Crear Empresa</>
            }
          </button>
        </div>
      </form>
    </div>
  );
};