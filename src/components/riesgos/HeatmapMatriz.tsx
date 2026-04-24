interface HeatmapMatrizProps {
  data: Map<string, number>;
  onCellClick?: (cell: { probabilidad: number; impacto: number; total: number }) => void;
}

function buildHeatColor(probabilidad: number, impacto: number): {
  bg: string;
  text: string;
  border: string;
  emptyBg: string;
  emptyText: string;
  emptyBorder: string;
} {
  const key = `${probabilidad}-${impacto}`;

  // Distribucion fija solicitada:
  // 3 rojas, 5 naranjas, 8 verdes y 9 amarillas.
  const celdasRojas = new Set(['5-5', '5-4', '4-5']);
  const celdasNaranjas = new Set(['5-3', '4-4', '3-5', '4-3', '3-4']);
  const celdasVerdes = new Set(['1-1', '1-2', '2-1', '1-3', '3-1', '2-2', '1-4', '4-1']);

  // Colores suavizados para mayor legibilidad
  if (celdasRojas.has(key)) {
    return {
      bg: 'bg-red-500',
      text: 'text-white',
      border: 'border-red-600',
      emptyBg: 'bg-red-100',
      emptyText: 'text-red-300',
      emptyBorder: 'border-red-200',
    };
  }
  if (celdasNaranjas.has(key)) {
    return {
      bg: 'bg-orange-400',
      text: 'text-white',
      border: 'border-orange-500',
      emptyBg: 'bg-orange-100',
      emptyText: 'text-orange-300',
      emptyBorder: 'border-orange-200',
    };
  }
  if (celdasVerdes.has(key)) {
    return {
      bg: 'bg-emerald-500',
      text: 'text-white',
      border: 'border-emerald-600',
      emptyBg: 'bg-emerald-100',
      emptyText: 'text-emerald-300',
      emptyBorder: 'border-emerald-200',
    };
  }

  // Resto de celdas en amarillo
  return {
    bg: 'bg-yellow-300',
    text: 'text-slate-900',
    border: 'border-yellow-400',
    emptyBg: 'bg-yellow-100',
    emptyText: 'text-yellow-400',
    emptyBorder: 'border-yellow-200',
  };
}

export function HeatmapMatriz({ data, onCellClick }: HeatmapMatrizProps) {
  const etiquetasProbabilidad: Record<number, string> = {
    5: 'Casi Seguro',
    4: 'Probable',
    3: 'Posible',
    2: 'Improbable',
    1: 'Raro',
  };

  const etiquetasImpacto: Record<number, string> = {
    1: 'Insignificante',
    2: 'Menor',
    3: 'Moderado',
    4: 'Mayor',
    5: 'Catastrófico',
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
      <div className="grid w-full gap-1" style={{ gridTemplateColumns: 'minmax(160px, 1.15fr) repeat(5, minmax(0, 1fr))' }}>
        {/* Header de Probabilidad */}
          <div className="flex items-center justify-center bg-slate-100 p-3 text-center text-xs font-bold leading-tight text-slate-700">
            Impacto / Prob.
          </div>
          {[1, 2, 3, 4, 5].map((impacto) => (
            <div key={`prob-${impacto}`} className="bg-slate-100 p-2 text-center text-[11px] font-semibold leading-tight text-slate-700">
              <div className="break-words">{etiquetasProbabilidad[impacto]}</div>
              <div className="mt-1 text-[11px] font-medium text-slate-500">P{impacto}</div>
            </div>
          ))}

          {/* Filas por Impacto */}
          {[5, 4, 3, 2, 1].map((impacto) => [
            <div
              key={`impact-${impacto}`}
              className="flex h-20 flex-col items-center justify-center bg-slate-100 p-2 text-center text-xs font-semibold leading-tight text-slate-700"
            >
              <span className="break-words">{etiquetasImpacto[impacto]}</span>
              <span className="mt-1 text-[11px] font-medium text-slate-500">I{impacto}</span>
            </div>,
            ...Array.from({ length: 5 }, (_, probIdx) => {
              const probabilidad = probIdx + 1;
              const total = data.get(`${probabilidad}-${impacto}`) ?? 0;
              const colors = buildHeatColor(probabilidad, impacto);
              const handleClick = () => {
                onCellClick?.({ probabilidad, impacto, total });
              };

              // Ocultar ceros - mostrar solo si hay riesgos
              if (total === 0) {
                return (
                  <button
                    key={`cell-${probabilidad}-${impacto}`}
                    type="button"
                    onClick={handleClick}
                    className={`flex h-20 w-full items-center justify-center border p-2 text-center transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${colors.emptyBg} ${colors.emptyBorder} hover:brightness-95`}
                  >
                    <span className={`text-[11px] font-semibold ${colors.emptyText}`}>-</span>
                  </button>
                );
              }

              return (
                <button
                  key={`cell-${probabilidad}-${impacto}`}
                  type="button"
                  onClick={handleClick}
                  className={`flex h-20 w-full flex-col items-center justify-center rounded-lg border-2 p-2 text-center transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-sm ${colors.bg} ${colors.text} ${colors.border}`}
                  title={`Probabilidad ${probabilidad} × Impacto ${impacto} = ${probabilidad * impacto} (${total} riesgos)`}
                >
                  <div className="text-2xl font-bold leading-none">{total}</div>
                </button>
              );
            }),
          ])}
      </div>
    </div>
  );
}
