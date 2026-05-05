// src/pages/auditor/hooks/index.ts
export { useAuditorRevisionDetalle, formatFecha, getColorGap } from './useAuditorRevisionDetalle';
export { useAuditorRevisionDetalleIQ, formatFechaIQ } from './useAuditorRevisionDetalleIQ';
export { useAuditorRevisiones, formatFechaRevision, POR_PAGINA } from './useAuditorRevisiones';
export { useAuditorRevisionesIQ, formatFechaIQList, POR_PAGINA_IQ } from './useAuditorRevisionesIQ';

export type { AsignacionDetalle, ResultadoCierre } from './useAuditorRevisionDetalle';
export type { ResultadoCierreIQ } from './useAuditorRevisionDetalleIQ';
export type { AsignacionAuditor, FiltroFecha, FiltroEstado } from './useAuditorRevisiones';
export type { FiltroFechaIQ, FiltroEstadoIQ } from './useAuditorRevisionesIQ';