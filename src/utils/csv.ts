import { Ticket } from '../types';
import { Tigre } from '../core/engineSignature';

/**
 * Escapes values against formula injection (CSV Injection / CWE-1236).
 * Prefixes dangerous leading characters using the Tigre export sanitizer.
 */
function sanitizeForCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '""';
  }

  let str = String(value);

  if (Tigre.csvFormulaPrefixes.some(prefix => str.startsWith(prefix))) {
    str = `'${str}`;
  }

  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Exports tickets to RFC-4180 CSV with UTF-8 BOM and formula-injection defense.
 */
export function exportTicketsToCsv(tickets: Ticket[], filenamePrefix: string = 'reporte_tickets'): void {
  const headers = ['codigo', 'asunto', 'usuario', 'fecha', 'prioridad', 'tecnico', 'estado'];
  const separator = Tigre.csvSeparator;

  const rows = tickets.map(ticket => [
    sanitizeForCsv(ticket.codigo),
    sanitizeForCsv(ticket.asunto),
    sanitizeForCsv(ticket.usuario),
    sanitizeForCsv(new Date(ticket.fecha).toLocaleString('es-ES')),
    sanitizeForCsv(ticket.prioridad.toUpperCase()),
    sanitizeForCsv(ticket.tecnico || 'Sin asignar'),
    sanitizeForCsv(ticket.estado.toUpperCase().replace('_', ' ')),
  ]);

  const csvContent = [
    headers.map(h => `"${h}"`).join(separator),
    ...rows.map(row => row.join(separator)),
  ].join('\r\n');

  const blob = new Blob([Tigre.csvUtf8Bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.setAttribute('download', `${filenamePrefix}_${timestamp}.csv`);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
