import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import type { ReporteEvaluacion } from '@/api/endpoints/reportes.api';

interface GenerateEvaluationPDFParams {
  evaluacionId: string;
  reporte: ReporteEvaluacion;
}

function formatDate(value: string): string {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-PE');
}

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function resolveDimensionPriority(gap: number): string {
  if (gap >= 1.0) return 'Alta';
  if (gap >= 0.5) return 'Media';
  return 'Baja';
}

function buildDimensionRecommendation(
  gap: number,
  cumplimiento: number,
  usuariosEvaluados: number
): string {
  const compliance = clampPercentage(cumplimiento);

  if (gap >= 1.0) {
    return `Ejecutar plan de remediacion inmediato con responsable dedicado y seguimiento semanal. Cobertura actual ${compliance.toFixed(1)}%.`;
  }

  if (gap >= 0.5) {
    return `Priorizar cierre de controles parcialmente implementados y validar evidencias cada 2 semanas. Cobertura actual ${compliance.toFixed(1)}%.`;
  }

  if (usuariosEvaluados <= 1) {
    return `Mantener controles actuales y ampliar validacion con mas responsables para confirmar estabilidad de la dimension.`;
  }

  return `Sostener nivel alcanzado con auditorias internas periodicas y monitoreo mensual de indicadores de control.`;
}

function buildDimensionRecommendationRows(reporte: ReporteEvaluacion): string[][] {
  return [...reporte.por_dimension]
    .sort((a, b) => b.gap_promedio - a.gap_promedio)
    .map((item) => {
      const priority = resolveDimensionPriority(item.gap_promedio);
      const recommendation = buildDimensionRecommendation(
        item.gap_promedio,
        item.porcentaje_cumplimiento_promedio,
        item.total_usuarios_evaluados
      );

      return [
        `${item.dimension.codigo} - ${item.dimension.nombre}`,
        priority,
        item.gap_promedio.toFixed(2),
        `${clampPercentage(item.porcentaje_cumplimiento_promedio).toFixed(1)}%`,
        recommendation,
      ];
    });
}

function buildDynamicRecommendations(reporte: ReporteEvaluacion): string[] {
  const recommendations: string[] = [];

  const criticalCount =
    (reporte.clasificaciones_gap.critico ?? 0) + (reporte.clasificaciones_gap.alto ?? 0);
  const compliance = clampPercentage(reporte.resumen.porcentaje_cumplimiento_promedio ?? 0);

  const dimensionsByGap = [...reporte.por_dimension]
    .sort((a, b) => b.gap_promedio - a.gap_promedio)
    .slice(0, 3);

  if (criticalCount > 0) {
    recommendations.push(
      `Priorizar ${criticalCount} brechas clasificadas como criticas/altas con planes de remediacion de corto plazo.`
    );
  }

  if (dimensionsByGap.length > 0) {
    const highGapDimensions = dimensionsByGap
      .filter((item) => item.gap_promedio > 0.75)
      .map((item) => `${item.dimension.codigo} (${item.dimension.nombre})`);

    if (highGapDimensions.length > 0) {
      recommendations.push(
        `Enfocar esfuerzos iniciales en dimensiones con mayor GAP: ${highGapDimensions.join(', ')}.`
      );
    }
  }

  if (compliance < 60) {
    recommendations.push(
      `El cumplimiento promedio actual es ${compliance.toFixed(1)}%. Se recomienda un plan intensivo de mejoras por control y seguimiento semanal.`
    );
  } else if (compliance < 80) {
    recommendations.push(
      `El cumplimiento promedio es ${compliance.toFixed(1)}%. Consolidar controles parcialmente implementados para superar el umbral del 80%.`
    );
  } else {
    recommendations.push(
      `El cumplimiento promedio es ${compliance.toFixed(1)}%. Mantener auditorias internas periodicas para sostener el nivel alcanzado.`
    );
  }

  const noCumplePct = clampPercentage(reporte.distribucion_respuestas.porcentajes.no_cumple ?? 0);
  if (noCumplePct >= 20) {
    recommendations.push(
      `El ${noCumplePct.toFixed(1)}% de respuestas esta en 'No cumple'; reforzar controles base, evidencias y validaciones de implementacion.`
    );
  }

  const usersByGap = [...reporte.por_usuario]
    .sort((a, b) => b.gap_promedio - a.gap_promedio)
    .slice(0, 2)
    .map((item) => item.usuario.nombre_completo);
  if (usersByGap.length > 0) {
    recommendations.push(
      `Acompanar a los responsables con mayor brecha (${usersByGap.join(', ')}) mediante coaching y revisiones tecnicas quincenales.`
    );
  }

  recommendations.push(
    'Definir hitos de avance por dimension y monitorear indicadores de cierre de brechas para medir efectividad de las acciones.'
  );

  return recommendations.slice(0, 6);
}

export function generateEvaluationPDF({ evaluacionId, reporte }: GenerateEvaluationPDFParams): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 40;
  let cursorY = 48;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Reporte de Evaluacion CMMI', marginX, cursorY);

  cursorY += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Evaluacion ID: ${evaluacionId}`, marginX, cursorY);
  cursorY += 14;
  doc.text(`Empresa: ${reporte.evaluacion.empresa}`, marginX, cursorY);
  cursorY += 14;
  doc.text(`Fecha de emision: ${new Date().toLocaleDateString('es-PE')}`, marginX, cursorY);

  cursorY += 18;
  autoTable(doc, {
    startY: cursorY,
    head: [['Indicador', 'Valor']],
    body: [
      ['Nivel actual promedio', reporte.resumen.nivel_actual_promedio.toFixed(2)],
      ['Nivel deseado promedio', reporte.resumen.nivel_deseado_promedio.toFixed(2)],
      ['GAP promedio', reporte.resumen.gap_promedio.toFixed(2)],
      ['Cumplimiento promedio', `${clampPercentage(reporte.resumen.porcentaje_cumplimiento_promedio).toFixed(1)}%`],
      ['Dimensiones evaluadas', String(reporte.resumen.dimensiones_evaluadas)],
      ['Usuarios evaluados', String(reporte.resumen.total_usuarios)],
    ],
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [22, 101, 52] },
    columnStyles: { 0: { fontStyle: 'bold' } },
  });

  cursorY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? cursorY;
  cursorY += 16;

  const topDimensions = [...reporte.por_dimension]
    .sort((a, b) => b.gap_promedio - a.gap_promedio)
    .slice(0, 5)
    .map((item) => [
      `${item.dimension.codigo} - ${item.dimension.nombre}`,
      item.nivel_actual_promedio.toFixed(2),
      item.nivel_deseado.toFixed(2),
      item.gap_promedio.toFixed(2),
      `${clampPercentage(item.porcentaje_cumplimiento_promedio).toFixed(1)}%`,
    ]);

  autoTable(doc, {
    startY: cursorY,
    head: [['Dimension', 'Nivel Actual', 'Nivel Deseado', 'GAP', 'Cumplimiento']],
    body: topDimensions,
    styles: { fontSize: 8.5, cellPadding: 5 },
    headStyles: { fillColor: [30, 64, 175] },
  });

  cursorY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? cursorY;
  cursorY += 18;

  const dimensionRecommendationRows = buildDimensionRecommendationRows(reporte);
  autoTable(doc, {
    startY: cursorY,
    head: [['Dimension', 'Prioridad', 'GAP', 'Cumplimiento', 'Recomendacion por dimension']],
    body: dimensionRecommendationRows,
    styles: {
      fontSize: 8,
      cellPadding: 5,
      valign: 'top',
      overflow: 'linebreak',
    },
    headStyles: { fillColor: [124, 58, 237] },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 55 },
      2: { cellWidth: 45 },
      3: { cellWidth: 70 },
      4: { cellWidth: 210 },
    },
    didDrawPage: () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Tabla de Recomendaciones por Dimension', marginX, 36);
    },
    margin: { top: 48 },
  });

  cursorY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? cursorY;
  cursorY += 18;

  if (cursorY > 700) {
    doc.addPage();
    cursorY = 52;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Recomendaciones Dinamicas', marginX, cursorY);
  cursorY += 12;

  const recommendations = buildDynamicRecommendations(reporte);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);

  recommendations.forEach((recommendation, index) => {
    const text = `${index + 1}. ${recommendation}`;
    const lines = doc.splitTextToSize(text, 510) as string[];
    if (cursorY + lines.length * 12 > 780) {
      doc.addPage();
      cursorY = 52;
    }
    doc.text(lines, marginX, cursorY);
    cursorY += lines.length * 12 + 4;
  });

  cursorY += 6;
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(
    `Fechas clave: asignacion ${formatDate(reporte.evaluacion.fecha_asignacion)} - limite ${formatDate(reporte.evaluacion.fecha_limite)}`,
    marginX,
    cursorY
  );

  doc.save(`Reporte_Evaluacion_${evaluacionId}.pdf`);
}
