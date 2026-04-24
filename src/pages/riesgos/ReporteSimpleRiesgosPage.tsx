import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/common';
import { useExportRiesgoReporteSimple, useRiesgoReporteSimple } from '@/hooks/useRiesgosModule';

export function ReporteSimpleRiesgosPage() {
  const navigate = useNavigate();
  const reporteQuery = useRiesgoReporteSimple();
  const exportMutation = useExportRiesgoReporteSimple();

  return (
    <div className="space-y-5">
      <section className="mb-6 flex flex-col gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Regresar
        </button>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Entrega 1</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Reporte simple de riesgos</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-60"
            >
              {exportMutation.isPending ? 'Exportando...' : 'Exportar CSV'}
            </button>
          </div>
        </div>
      </section>

      <Card className="rounded-xl p-0">
        {reporteQuery.isLoading ? (
          <div className="p-4 text-sm text-slate-600">Cargando reporte...</div>
        ) : (reporteQuery.data?.results.length ?? 0) === 0 ? (
          <div className="p-5 text-sm text-slate-600">No hay registros para el reporte.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Codigo</th>
                  <th className="px-4 py-3">Riesgo</th>
                  <th className="px-4 py-3">Proceso</th>
                  <th className="px-4 py-3">Categoria COSO</th>
                  <th className="px-4 py-3">P x I</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3">Tratamiento</th>
                </tr>
              </thead>
              <tbody>
                {(reporteQuery.data?.results ?? []).map((item) => (
                  <tr key={String(item.id)} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-700">{item.codigo}</td>
                    <td className="px-4 py-3 text-slate-900">{item.nombre}</td>
                    <td className="px-4 py-3 text-slate-700">{item.proceso || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{item.categoria_coso || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.probabilidad} x {item.impacto} = {item.nivel_riesgo}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.categoria_riesgo}</td>
                    <td className="px-4 py-3 text-slate-700">{item.responsable_riesgo || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{item.estado_tratamiento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
