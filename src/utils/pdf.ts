import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Ticket, TableFilters, User } from '../types';
import { Tigre } from '../core/engineSignature';

interface PdfReportOptions {
  tickets: Ticket[];
  currentUser: User;
  filters?: TableFilters;
  filenamePrefix?: string;
}

function loadLogoAsDataUrl(src: string): Promise<{ dataUrl: string; width: number; height: number } | null> {
  return new Promise(resolve => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const timeout = window.setTimeout(() => resolve(null), 1500);

      img.onload = () => {
        window.clearTimeout(timeout);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 300;
          canvas.height = img.naturalHeight || 120;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          resolve({
            dataUrl: canvas.toDataURL('image/png'),
            width: canvas.width,
            height: canvas.height,
          });
        } catch {
          resolve(null);
        }
      };

      img.onerror = () => {
        window.clearTimeout(timeout);
        resolve(null);
      };

      img.src = src;
    } catch {
      resolve(null);
    }
  });
}

function formatEstadoLabel(estado: Ticket['estado']): string {
  switch (estado) {
    case 'pendiente':
      return 'PENDIENTE';
    case 'en_atencion':
      return 'EN ATENCIÓN';
    case 'resuelto':
      return 'RESUELTO';
    case 'cancelado':
      return 'CANCELADO';
    default:
      return String(estado).toUpperCase();
  }
}

function formatFiltersSummary(filters?: TableFilters): string {
  if (!filters) return 'Todos los registros visibles';
  const parts: string[] = [];
  if (filters.estado && filters.estado !== 'todos') {
    parts.push(`Estado: ${filters.estado.replace('_', ' ').toUpperCase()}`);
  }
  if (filters.prioridad && filters.prioridad !== 'todas') {
    parts.push(`Prioridad: ${filters.prioridad.toUpperCase()}`);
  }
  if (filters.fecha_desde || filters.fecha_hasta) {
    parts.push(`Fechas: ${filters.fecha_desde || 'Inicio'} a ${filters.fecha_hasta || 'Hoy'}`);
  }
  if (filters.busqueda?.trim()) {
    parts.push(`Búsqueda: "${filters.busqueda.trim()}"`);
  }
  return parts.length > 0 ? parts.join('  |  ') : 'Todos los registros visibles (sin filtros activos)';
}

/**
 * Genera y descarga un reporte profesional en hojas tamaño A4 (210 × 297 mm)
 * con identidad SedaTech · Sistema de Gestión de Tickets (Azul, Celeste y Blanco).
 */
export async function exportTicketsToPdf({
  tickets,
  currentUser,
  filters,
  filenamePrefix = 'sedatech_reporte',
}: PdfReportOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const margin = Tigre.pdfDefaultMarginMm;
  const contentWidth = pageWidth - margin * 2; // 182 mm

  const now = new Date();
  const formattedDate = now.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Load logo safely
  const logo = await loadLogoAsDataUrl('./LOGOTIPO%20SEDATECH.png');

  // --- PAGE 1 EXECUTIVE HEADER BANNER ---
  doc.setFillColor(10, 36, 99); // #0a2463 Azul Marino
  doc.roundedRect(margin, 12, contentWidth, 24, 3, 3, 'F');

  // Celeste bottom accent line
  doc.setFillColor(56, 189, 248); // #38bdf8 Celeste
  doc.rect(margin, 34.6, contentWidth, 1.4, 'F');

  // White logo frame on left of header
  if (logo) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin + 3.5, 15, 36, 17, 2, 2, 'F');
    const ratio = logo.width / logo.height;
    let drawW = 33;
    let drawH = drawW / ratio;
    if (drawH > 14.5) {
      drawH = 14.5;
      drawW = drawH * ratio;
    }
    const imgX = margin + 3.5 + (36 - drawW) / 2;
    const imgY = 15 + (17 - drawH) / 2;
    doc.addImage(logo.dataUrl, 'PNG', imgX, imgY, drawW, drawH);
  }

  const textStartX = logo ? margin + 43.5 : margin + 6;
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SEDATECH · SISTEMA DE GESTIÓN DE TICKETS', textStartX, 21.5);

  doc.setTextColor(186, 230, 253); // sky-200
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('REPORTE EJECUTIVO DE TICKETS Y SOPORTE TÉCNICO', textStartX, 27);

  doc.setTextColor(224, 242, 254);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Gestión Institucional de Incidencias TI', textStartX, 31.8);

  // Right metadata pill inside banner
  doc.setFillColor(0, 82, 165); // #0052a5
  doc.roundedRect(pageWidth - margin - 43, 15.5, 39.5, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('FORMATO A4 OFICIAL', pageWidth - margin - 23.25, 20.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(186, 230, 253);
  doc.text(`Emitido: ${formattedDate}`, pageWidth - margin - 23.25, 25.2, { align: 'center' });
  doc.text(`Hora: ${formattedTime}`, pageWidth - margin - 23.25, 29.2, { align: 'center' });

  // --- METADATA & FILTERS BOX ---
  doc.setFillColor(240, 247, 255); // #f0f7ff
  doc.setDrawColor(204, 228, 255); // #cce4ff
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, 40, contentWidth, 15, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(10, 36, 99);
  doc.text('Generado por:', margin + 4, 45.8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 82, 165);
  const roleLabel =
    currentUser.rol === 'administrador'
      ? 'Administrador'
      : currentUser.rol === 'tecnico'
      ? 'Técnico'
      : 'Usuario';
  doc.text(`${currentUser.nombre} (${roleLabel})`, margin + 27, 45.8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 36, 99);
  doc.text('Registros en el reporte:', pageWidth - margin - 58, 45.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(`${tickets.length} ticket(s)`, pageWidth - margin - 4, 45.8, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 36, 99);
  doc.text('Criterio / Filtros:', margin + 4, 51.6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 107, 148);
  const filterText = formatFiltersSummary(filters);
  const clippedFilterText = doc.splitTextToSize(filterText, contentWidth - 36)[0] || filterText;
  doc.text(clippedFilterText, margin + 30, 51.6);

  // --- KPI SUMMARY CARDS ---
  const totalCount = tickets.length;
  const pendingCount = tickets.filter(t => t.estado === 'pendiente').length;
  const activeCount = tickets.filter(t => t.estado === 'en_atencion').length;
  const resolvedCount = tickets.filter(t => t.estado === 'resuelto').length;
  const resolvedTimes = tickets
    .map(t => t.tiempo_resolucion_min)
    .filter((v): v is number => typeof v === 'number' && v > 0);
  const avgResolution =
    resolvedTimes.length > 0
      ? `${Math.round(resolvedTimes.reduce((a, b) => a + b, 0) / resolvedTimes.length)} min`
      : 'N/A';

  const kpis = [
    { label: 'TOTAL FILTRADOS', value: String(totalCount), rgb: [10, 36, 99] as const },
    { label: 'PENDIENTES', value: String(pendingCount), rgb: [14, 165, 233] as const },
    { label: 'EN ATENCIÓN', value: String(activeCount), rgb: [29, 78, 216] as const },
    { label: 'RESUELTOS', value: String(resolvedCount), rgb: [0, 82, 165] as const },
    { label: 'PROM. RESOLUCIÓN', value: avgResolution, rgb: [2, 132, 199] as const },
  ];

  const cardGap = 2.5;
  const cardWidth = (contentWidth - cardGap * (kpis.length - 1)) / kpis.length;
  const kpiY = 58.5;
  const kpiH = 16.5;

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (cardWidth + cardGap);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(204, 228, 255);
    doc.setLineWidth(0.35);
    doc.roundedRect(x, kpiY, cardWidth, kpiH, 2, 2, 'FD');

    // Top accent strip per KPI
    doc.setFillColor(kpi.rgb[0], kpi.rgb[1], kpi.rgb[2]);
    doc.rect(x + 0.5, kpiY + 0.5, cardWidth - 1, 1.8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(75, 107, 148);
    doc.text(kpi.label, x + cardWidth / 2, kpiY + 6.8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(kpi.rgb[0], kpi.rgb[1], kpi.rgb[2]);
    doc.text(kpi.value, x + cardWidth / 2, kpiY + 13.5, { align: 'center' });
  });

  // --- SECTION TITLE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(10, 36, 99);
  doc.text('Detalle Analítico de Tickets', margin, 82);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 107, 148);
  doc.text('Listado ordenado según los criterios vigentes en la vista de Reportes', pageWidth - margin, 82, {
    align: 'right',
  });

  // --- ANALYTICAL TABLE OR EMPTY STATE ---
  if (tickets.length === 0) {
    doc.setFillColor(240, 247, 255);
    doc.setDrawColor(204, 228, 255);
    doc.roundedRect(margin, 86, contentWidth, 24, 2.5, 2.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(10, 36, 99);
    doc.text('No hay tickets que coincidan con los filtros seleccionados.', pageWidth / 2, 97, {
      align: 'center',
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(75, 107, 148);
    doc.text('Ajuste los filtros en el panel de Reportes y vuelva a generar el documento A4.', pageWidth / 2, 103, {
      align: 'center',
    });
  } else {
    const tableRows = tickets.map(t => {
      const equipoYAsunto = `${t.equipo_modelo ? `[${t.equipo_modelo}]\n` : ''}${t.asunto}`;
      const ingresoStr = new Date(t.fecha).toLocaleDateString('es-PE');
      const tiempoStr = t.tiempo_resolucion_min ? `${t.tiempo_resolucion_min} min` : '—';
      return [
        t.codigo,
        equipoYAsunto,
        t.categoria,
        t.usuario,
        t.prioridad.toUpperCase(),
        t.tecnico || 'Sin asignar',
        formatEstadoLabel(t.estado),
        `${ingresoStr}\n${tiempoStr}`,
      ];
    });

    autoTable(doc, {
      startY: 85,
      margin: { top: 22, right: margin, bottom: 20, left: margin },
      head: [[
        'Código',
        'Equipo / Asunto',
        'Categoría',
        'Usuario',
        'Prioridad',
        'Técnico',
        'Estado',
        'Fecha / Tiempo',
      ]],
      body: tableRows,
      theme: 'grid',
      showHead: 'everyPage',
      styles: {
        font: 'helvetica',
        fontSize: 7.5,
        cellPadding: 2.6,
        textColor: [10, 36, 99],
        lineColor: [204, 228, 255],
        lineWidth: 0.25,
        valign: 'middle',
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [10, 36, 99],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'left',
      },
      alternateRowStyles: {
        fillColor: [240, 247, 255],
      },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'bold', textColor: [0, 82, 165] },
        1: { cellWidth: 52 },
        2: { cellWidth: 22, textColor: [75, 107, 148] },
        3: { cellWidth: 16 },
        4: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 17 },
        6: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
        7: { cellWidth: 19, halign: 'center', fontSize: 7 },
      },
      didParseCell: data => {
        if (data.section === 'body') {
          if (data.column.index === 4) {
            const val = String(data.cell.raw || '').toUpperCase();
            if (val === 'ALTA') {
              data.cell.styles.textColor = [185, 28, 28];
              data.cell.styles.fillColor = [254, 226, 226];
            } else if (val === 'MEDIA') {
              data.cell.styles.textColor = [146, 64, 14];
              data.cell.styles.fillColor = [254, 240, 138];
            } else {
              data.cell.styles.textColor = [21, 128, 61];
              data.cell.styles.fillColor = [220, 252, 231];
            }
          }
          if (data.column.index === 6) {
            const val = String(data.cell.raw || '').toUpperCase();
            if (val === 'RESUELTO') {
              data.cell.styles.textColor = [0, 82, 165];
            } else if (val === 'EN ATENCIÓN') {
              data.cell.styles.textColor = [29, 78, 216];
            } else if (val === 'PENDIENTE') {
              data.cell.styles.textColor = [2, 132, 199];
            } else {
              data.cell.styles.textColor = [75, 107, 148];
            }
          }
        }
      },
      didDrawPage: data => {
        // Running header on pages 2+
        if (data.pageNumber > 1) {
          doc.setFillColor(10, 36, 99);
          doc.rect(margin, 10, contentWidth, 8, 'F');
          doc.setFillColor(56, 189, 248);
          doc.rect(margin, 18, contentWidth, 0.8, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(255, 255, 255);
          doc.text('SEDATECH · Sistema de Gestión de Tickets — Reporte Ejecutivo (Continuación)', margin + 3, 15.2);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(186, 230, 253);
          doc.text(`${formattedDate} ${formattedTime}`, pageWidth - margin - 3, 15.2, { align: 'right' });
        }
      },
    });
  }

  // --- ADD A4 FOOTER WITH PAGE NUMBERS ON ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(204, 228, 255);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(75, 107, 148);
    doc.text('SedaTech · Sistema de Gestión de Tickets — Documento generado automáticamente', margin, pageHeight - 8.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 36, 99);
    doc.text(`Hoja A4 · Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8.5, {
      align: 'right',
    });
  }

  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  doc.save(`${filenamePrefix}_A4_${timestamp}.pdf`);
}
