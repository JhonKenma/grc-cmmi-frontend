import { useEffect, useState } from 'react';

import { X, ShieldAlert, CircleAlert, ChevronLeft, ChevronRight } from 'lucide-react';

import { riesgosApi } from '@/api/endpoints/riesgos.api';
import { Card } from '@/components/common';
import type { Riesgo, RiesgoFilter } from '@/types';

interface ModalDetalleCeldaRiesgosProps {
  isOpen: boolean;
  onClose: () => void;
  probabilidad: number;
  impacto: number;
  total: number;
  filters?: RiesgoFilter;
}

const getEstadoLabel = (estado: string): string => {
  switch (estado) {
    case 'borrador':
      return 'Borrador';
    case 'en_revision':
      return 'En revisión';
    case 'aprobado':
      return 'Aprobado';
    case 'rechazado':
      return 'Rechazado';
    case 'cerrado':
      return 'Cerrado';
    default:
      return estado;
  }
};

export function ModalDetalleCeldaRiesgos({
  isOpen,
  onClose,
  probabilidad,
  impacto,
  total,
  filters,
}: ModalDetalleCeldaRiesgosProps) {
  const [riesgos, setRiesgos] = useState<Riesgo[]>([]);
  const [count, setCount] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 1;
  const FETCH_SIZE = 1000;

  useEffect(() => {
    if (!isOpen) return;
    setPaginaActual(1);
  }, [isOpen, probabilidad, impacto, filters]);

  useEffect(() => {
    if (!isOpen) return;

    let isActive = true;

    const load = async () => {
      setLoading(true);
      try {
        const response = await riesgosApi.listRiesgos({
          ...filters,
          probabilidad,
          impacto,
          page: 1,
          page_size: FETCH_SIZE,
        });

        const filtrados = response.results.filter((riesgo) => {
          const probabilidadRiesgo = Number(riesgo.probabilidad ?? 0);
          const impactoRiesgo = Number(riesgo.impacto ?? 0);
          return probabilidadRiesgo === probabilidad && impactoRiesgo === impacto;
        });

        const inicio = (paginaActual - 1) * PAGE_SIZE;
        const pagina = filtrados.slice(inicio, inicio + PAGE_SIZE);

        if (!isActive) return;

        setRiesgos(pagina);
        setCount(filtrados.length);
      } catch {
        if (!isActive) return;
        setRiesgos([]);
        setCount(0);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [isOpen, probabilidad, impacto, paginaActual, filters]);

  const totalPaginas = Math.max(1, Math.ceil(count / PAGE_SIZE));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <Card className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">Detalle del mapa de riesgos</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Probabilidad {probabilidad} × Impacto {impacto}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{total} riesgo(s) en esta celda.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-600">
              <CircleAlert size={18} className="text-cyan-600" />
              Cargando riesgos de la celda...
            </div>
          ) : riesgos.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
              No hay riesgos visibles para esta combinación.
            </div>
          ) : (
            <div className="space-y-4">
              {riesgos.map((riesgo) => (
                <div key={riesgo.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 p-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{riesgo.codigo}</span>
                        <span className="rounded-full bg-cyan-100 px-2 py-1 text-[11px] font-semibold text-cyan-800">
                          {getEstadoLabel(String(riesgo.estado))}
                        </span>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">{riesgo.nombre}</h3>
                      <p className="mt-2 text-sm text-slate-600">{riesgo.descripcion}</p>
                    </div>
                    <div className="hidden rounded-full bg-slate-900 px-3 py-2 text-center text-xs font-semibold text-white sm:block">
                      <ShieldAlert size={16} className="mx-auto mb-1" />
                      {riesgo.clasificacion ?? 'sin clasif.'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 p-4 text-xs text-slate-600 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="font-semibold text-slate-500">Categoría</p>
                      <p className="mt-1 text-slate-900">{riesgo.categoria_nombre ?? 'Sin categoría'}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="font-semibold text-slate-500">Responsable</p>
                      <p className="mt-1 text-slate-900">{riesgo.propietario_nombre ?? riesgo.responsable_riesgo_nombre ?? 'Sin responsable'}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="font-semibold text-slate-500">Fecha</p>
                      <p className="mt-1 text-slate-900">{riesgo.fecha_creacion ?? 'Sin fecha'}</p>
                    </div>
                  </div>
                </div>
              ))}

              {totalPaginas > 1 ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    {paginaActual > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setPaginaActual(1)}
                          className="rounded-lg px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Primera
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          <ChevronLeft size={16} /> Anterior
                        </button>
                      </>
                    ) : null}
                  </div>

                  <span className="text-center font-semibold text-slate-800">
                    Página {paginaActual} de {totalPaginas}
                  </span>

                  <div className="flex items-center gap-2">
                    {paginaActual < totalPaginas ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Siguiente <ChevronRight size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaginaActual(totalPaginas)}
                          className="rounded-lg px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Última
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">Se muestran {riesgos.length} de {count || total} riesgo(s) de esta celda.</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}