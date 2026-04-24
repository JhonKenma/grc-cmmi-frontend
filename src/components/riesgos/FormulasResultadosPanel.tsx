import React from 'react';

interface ConfigFormulas {
  peso_impacto_financiero: number;
  peso_impacto_operacional: number;
  peso_impacto_reputacional: number;
  apetito_riesgo_nrc: number;
}

interface FormulasResultadosPanelProps {
  probabilidad: number;
  impactoFinanciero: number;
  impactoOperacional: number;
  impactoReputacional: number;
  valorActivo?: number;
  factorExposicion?: number;
  aro?: number;
  config: ConfigFormulas;
  cuantitativaActiva: boolean;
}

export const FormulasResultadosPanel: React.FC<FormulasResultadosPanelProps> = ({
  probabilidad,
  impactoFinanciero,
  impactoOperacional,
  impactoReputacional,
  valorActivo,
  factorExposicion,
  aro,
  config,
  cuantitativaActiva,
}) => {
  // F3: NRC
  const IC =
    impactoFinanciero * config.peso_impacto_financiero +
    impactoOperacional * config.peso_impacto_operacional +
    impactoReputacional * config.peso_impacto_reputacional;
  const nrc = probabilidad * IC;

  const nivelNrc = nrc >= 20 ? 'Crítico' : nrc >= 12 ? 'Alto' : nrc >= 6 ? 'Medio' : 'Bajo';
  const colorNrc = nrc >= 20 ? 'red' : nrc >= 12 ? 'orange' : nrc >= 6 ? 'yellow' : 'green';

  // F2: SLE
  const sle = cuantitativaActiva && valorActivo && factorExposicion ? valorActivo * factorExposicion : null;

  // F1: ALE
  const ale = sle && aro ? sle * aro : null;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-blue-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>📐</span> Resultados de Fórmulas (Tiempo Real)
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {/* F3 NRC */}
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">F3 — NRC</span>
              <p className="text-xs text-gray-500 mt-1">
                {probabilidad} × ({impactoFinanciero}×{config.peso_impacto_financiero.toFixed(2)} + {impactoOperacional}×
                {config.peso_impacto_operacional.toFixed(2)} + {impactoReputacional}×{config.peso_impacto_reputacional.toFixed(2)})
              </p>
            </div>
            <div className="text-right">
              <div
                className={`text-2xl font-black ${
                  colorNrc === 'red'
                    ? 'text-red-600'
                    : colorNrc === 'orange'
                      ? 'text-orange-500'
                      : colorNrc === 'yellow'
                        ? 'text-yellow-600'
                        : 'text-green-600'
                }`}
              >
                {nrc.toFixed(1)}
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-1 ${
                  colorNrc === 'red'
                    ? 'bg-red-100 text-red-700'
                    : colorNrc === 'orange'
                      ? 'bg-orange-100 text-orange-700'
                      : colorNrc === 'yellow'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                }`}
              >
                {nivelNrc}
              </span>
            </div>
          </div>
        </div>

        {/* F2 SLE — Solo si cuantitativa activa */}
        {cuantitativaActiva && (
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">F2 — SLE</span>
                <p className="text-xs text-gray-500 mt-1">
                  ${(valorActivo || 0).toLocaleString()} × {(factorExposicion || 0).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {sle ? `$${sle.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—'}
                </div>
                <span className="text-xs text-gray-400">por evento</span>
              </div>
            </div>
          </div>
        )}

        {/* F1 ALE — Solo si cuantitativa activa */}
        {cuantitativaActiva && (
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">F1 — ALE</span>
                <p className="text-xs text-gray-500 mt-1">{(aro || 0).toFixed(2)} eventos/año × SLE</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-700">
                  {ale ? `$${ale.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—'}
                </div>
                <span className="text-xs text-gray-400">pérdida anual esperada</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comparación con Apetito */}
      {nrc > 0 && (
        <div
          className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
            nrc > config.apetito_riesgo_nrc ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}
        >
          <span>{nrc > config.apetito_riesgo_nrc ? '⚠️' : '✅'}</span>
          <span className="text-sm">
            {nrc > config.apetito_riesgo_nrc
              ? `Este riesgo (NRC ${nrc.toFixed(1)}) supera el apetito de riesgo (${config.apetito_riesgo_nrc}). Requiere tratamiento.`
              : `Dentro del apetito de riesgo (${config.apetito_riesgo_nrc}). Monitoreo estándar.`}
          </span>
        </div>
      )}
    </div>
  );
};
