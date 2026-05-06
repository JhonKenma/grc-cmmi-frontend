import { Save, Send, AlertCircle } from 'lucide-react';
import { Button, Card } from '@/components/common';
import type { Pregunta, RespuestaListItem } from '@/types';
import { ModalEvidencia } from './ModalEvidencia';
import { SeccionEvidencias } from './SeccionEvidencias';
import { usePreguntaCard } from './hooks/usePreguntaCard';

interface PreguntaCardProps {
  pregunta: Pregunta;
  numero: number;
  asignacionId: string;
  respuestaExistente?: RespuestaListItem;
  onRespuestaChange: (respuesta: RespuestaListItem) => void;
}

export const PreguntaCard = ({
  pregunta,
  numero,
  asignacionId,
  respuestaExistente,
  onRespuestaChange,
}: PreguntaCardProps) => {
  const {
    modoSeleccionado,
    justificacion,
    setJustificacion,
    comentarios,
    setComentarios,
    evidencias,
    respuestaId,
    estado,
    saving,
    mostrarModalEvidencia,
    setMostrarModalEvidencia,
    puedeEditar,
    yaEnviada,
    handleCambiarModo,
    handleGuardarBorrador,
    handleEnviar,
    handleEliminarEvidencia,
    reloadEvidencias,
    getEstadoBadge,
    getModoLecturaInfo,
    cardBorder,
  } = usePreguntaCard({
    pregunta,
    asignacionId,
    respuestaExistente,
    onRespuestaChange,
  });

  return (
    <>
      <Card className={cardBorder}>
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-1 bg-primary-100 text-primary-700 rounded text-xs font-semibold">
                  {numero}
                </span>
                <span className="text-xs text-gray-500 font-medium">{pregunta.codigo}</span>
                {getEstadoBadge()}
              </div>
              <h3 className="text-base font-semibold text-gray-900">{pregunta.titulo}</h3>
              {pregunta.texto && (
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{pregunta.texto}</p>
              )}
            </div>
          </div>

          {puedeEditar && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                ¿Tu organización cumple con esto?
                <span className="text-red-500 ml-1">*</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleCambiarModo('SI')}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    modoSeleccionado === 'SI'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${modoSeleccionado === 'SI' ? 'bg-primary-100' : 'bg-gray-100'}`}>
                    <FileText size={18} className={modoSeleccionado === 'SI' ? 'text-primary-600' : 'text-gray-500'} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${modoSeleccionado === 'SI' ? 'text-primary-700' : 'text-gray-800'}`}>Sí</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      Adjunta documentos de respaldo para su revisión.
                    </p>
                  </div>
                  {modoSeleccionado === 'SI' && <CheckCircle size={16} className="text-primary-500 shrink-0 mt-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleCambiarModo('NO')}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    modoSeleccionado === 'NO'
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${modoSeleccionado === 'NO' ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <XCircle size={18} className={modoSeleccionado === 'NO' ? 'text-red-500' : 'text-gray-400'} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${modoSeleccionado === 'NO' ? 'text-red-700' : 'text-gray-800'}`}>No</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      Reconoce el no cumplimiento del mencionado control.
                    </p>
                  </div>
                  {modoSeleccionado === 'NO' && <CheckCircle size={16} className="text-red-400 shrink-0 mt-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleCambiarModo('NO_APLICA')}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    modoSeleccionado === 'NO_APLICA'
                      ? 'border-gray-500 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${modoSeleccionado === 'NO_APLICA' ? 'bg-gray-200' : 'bg-gray-100'}`}>
                    <Ban size={18} className={modoSeleccionado === 'NO_APLICA' ? 'text-gray-600' : 'text-gray-400'} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${modoSeleccionado === 'NO_APLICA' ? 'text-gray-700' : 'text-gray-800'}`}>No Aplica</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      Este criterio no aplica a tu organización.
                    </p>
                  </div>
                  {modoSeleccionado === 'NO_APLICA' && <CheckCircle size={16} className="text-gray-500 shrink-0 mt-0.5" />}
                </button>
              </div>
            </div>
          )}

          {yaEnviada && (() => {
            const { icon, texto, color } = getModoLecturaInfo();
            return (
              <div className={`flex items-center gap-2 p-3 rounded-lg border ${color}`}>
                {icon}
                <span className="text-sm font-medium">{texto}</span>
              </div>
            );
          })()}

          {(modoSeleccionado || yaEnviada) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justificación <span className="text-red-500">*</span>
                {modoSeleccionado === 'NO_APLICA' && <span className="text-gray-500 font-normal ml-2 text-xs">— Explica por qué no aplica</span>}
                {modoSeleccionado === 'NO' && <span className="text-gray-500 font-normal ml-2 text-xs">— Explica por qué no cumple</span>}
                <span className="text-gray-400 font-normal ml-2 text-xs">(mín. 10 caracteres)</span>
              </label>
              <textarea
                value={justificacion}
                onChange={(event) => setJustificacion(event.target.value)}
                disabled={!puedeEditar}
                rows={4}
                placeholder={
                  modoSeleccionado === 'NO_APLICA' ? 'Explica por qué esta pregunta no aplica a tu organización...'
                    : modoSeleccionado === 'NO' ? 'Explica por qué tu organización no cumple con este requisito...'
                    : 'Describe brevemente el contexto de las evidencias adjuntas...'
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              />
              <p className={`text-xs mt-1 ${justificacion.length < 10 ? 'text-red-400' : 'text-gray-400'}`}>
                {justificacion.length} caracteres
              </p>
            </div>
          )}

          {(modoSeleccionado === 'SI' || (yaEnviada && respuestaExistente?.respuesta === null)) && (
            <SeccionEvidencias
              evidencias={evidencias}
              puedeEditar={puedeEditar}
              respuestaId={respuestaId}
              onAgregarEvidencia={() => setMostrarModalEvidencia(true)}
              onEliminarEvidencia={handleEliminarEvidencia}
            />
          )}

          {modoSeleccionado === 'SI' && puedeEditar && evidencias.filter((evidencia) => evidencia.activo).length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle size={16} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700">
                Debes subir al menos una evidencia antes de poder enviar esta respuesta.
              </p>
            </div>
          )}

          {(modoSeleccionado || yaEnviada) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios Adicionales <span className="text-gray-500 font-normal ml-2 text-xs">(Opcional)</span>
              </label>
              <textarea
                value={comentarios}
                onChange={(event) => setComentarios(event.target.value)}
                disabled={!puedeEditar}
                rows={2}
                placeholder="Observaciones o notas adicionales..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              />
            </div>
          )}

          {estado === 'auditado' && respuestaExistente?.calificacion_auditor && (
            <div className="p-4 rounded-xl border border-green-200 bg-green-50 space-y-2">
              <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Calificación del Auditor</p>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  respuestaExistente.calificacion_auditor === 'SI_CUMPLE'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : respuestaExistente.calificacion_auditor === 'CUMPLE_PARCIAL'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }`}>
                  {respuestaExistente.calificacion_display || respuestaExistente.calificacion_auditor}
                </span>
                {respuestaExistente.nivel_madurez > 0 && (
                  <span className="text-xs text-gray-600">
                    Nivel de madurez: <strong>{respuestaExistente.nivel_madurez}</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {puedeEditar && modoSeleccionado && (
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleGuardarBorrador}
                disabled={saving || justificacion.trim().length < 10}
                type="button"
              >
                <Save size={15} className="mr-1.5" />
                {saving ? 'Guardando...' : 'Guardar Borrador'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleEnviar}
                disabled={saving || !respuestaId || (modoSeleccionado === 'SI' && evidencias.filter((evidencia) => evidencia.activo).length === 0)}
                type="button"
              >
                <Send size={15} className="mr-1.5" />
                {saving ? 'Enviando...' : 'Enviar Respuesta'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {mostrarModalEvidencia && respuestaId && (
        <ModalEvidencia
          respuestaId={respuestaId}
          onClose={() => setMostrarModalEvidencia(false)}
          onSuccess={() => void reloadEvidencias()}
        />
      )}
    </>
  );
};
