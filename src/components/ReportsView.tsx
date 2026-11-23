import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { exportTicketsToCsv } from '../utils/csv';
import { exportTicketsToPdf } from '../utils/pdf';
import { TicketFilters } from './TicketFilters';
import { burst } from '../utils/audio';
import { Download, FileText, ShieldCheck } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { filteredTickets, currentUser, filters } = useTickets();
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportCsv = () => {
    exportTicketsToCsv(filteredTickets, `sedatech_reporte_${currentUser.rol}`);
    burst(['📊', '💾', '✔️', '💻']);
  };

  const handleExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      await exportTicketsToPdf({
        tickets: filteredTickets,
        currentUser,
        filters,
        filenamePrefix: `sedatech_reporte_${currentUser.rol}`,
      });
      burst(['📄', '✨', '✔️', '🖨️']);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 select-none">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#cce4ff] shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0052a5] text-white flex items-center justify-center text-3xl font-black shadow-md shadow-sky-900/20">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-display text-[#0a2463]">
                Reportes y Exportación
              </h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-[#0052a5] border border-sky-300">
                Criterios RF-08 / RF-09 / RNF-06
              </span>
            </div>
            <p className="text-xs text-[#4b6b94] font-medium mt-0.5">
              Auditoría analítica con exportación CSV segura y reporte ejecutivo en hojas tamaño A4 (PDF).
            </p>
          </div>
        </div>

        {/* Export CSV & Export PDF A4 Buttons (>= 44x44px target) */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="px-5 py-3.5 bg-[#0284c7] hover:bg-[#0052a5] text-white rounded-2xl text-xs font-black shadow-md btn-spring cursor-pointer flex items-center gap-2 min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Reporte Filtrado CSV ({filteredTickets.length})</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-5 py-3.5 bg-[#0a2463] hover:bg-[#0052a5] text-white rounded-2xl text-xs font-black shadow-md btn-spring cursor-pointer flex items-center gap-2 min-h-[44px] disabled:opacity-60"
          >
            <FileText className="w-4 h-4 text-sky-300" />
            <span>
              {isExportingPdf
                ? 'Generando PDF A4...'
                : `Exportar Reporte en PDF (${filteredTickets.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <TicketFilters />

      {/* Security Banner: Anti-formula protection notice (RF-09 / RNF-06) */}
      <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-center gap-3 text-xs text-[#0a2463]">
        <ShieldCheck className="w-5 h-5 text-[#0284c7] shrink-0" />
        <div>
          <strong className="block font-black text-[#0052a5]">Protección Anti-Inyección de Fórmulas (CWE-1236 / RNF-06):</strong>
          Cada celda que inicie con =, +, -, @, \t es automáticamente sanitizada con prefijo de comilla simple al generar el archivo .CSV delimitado por comas.
        </div>
      </div>

      {/* Analytical Table */}
      <div className="bg-white rounded-3xl border-2 border-[#cce4ff] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#cce4ff] flex items-center justify-between">
          <h3 className="text-base font-black font-display text-[#0a2463]">
            Registros Filtrados ({filteredTickets.length} tickets)
          </h3>
          <span className="text-xs text-[#4b6b94] font-mono">
            SedaTech · Gestión de Tickets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f0f7ff] border-b border-[#cce4ff] text-[#0a2463] font-black">
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Equipo / Modelo</th>
                <th className="py-3 px-4">Asunto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Prioridad</th>
                <th className="py-3 px-4">Técnico</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Ingreso</th>
                <th className="py-3 px-4">Resolución</th>
                <th className="py-3 px-4">Tiempo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cce4ff]/80 text-[#0a2463]">
              {filteredTickets.map(t => (
                <tr key={t.id} className="hover:bg-[#f0f7ff]/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#0052a5] whitespace-nowrap">
                    {t.codigo}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#0a2463] whitespace-nowrap">
                    {t.equipo_modelo || 'General'}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#0a2463] min-w-[200px]">
                    {t.asunto}
                  </td>
                  <td className="py-3 px-4 text-[#4b6b94] whitespace-nowrap">
                    {t.categoria}
                  </td>
                  <td className="py-3 px-4 font-semibold whitespace-nowrap">
                    {t.usuario}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        t.prioridad === 'alta'
                          ? 'bg-red-600 text-white'
                          : t.prioridad === 'media'
                          ? 'bg-yellow-400 text-[#0a2463]'
                          : 'bg-green-600 text-white'
                      }`}
                    >
                      {t.prioridad.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium whitespace-nowrap">
                    {t.tecnico || '—'}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        t.estado === 'resuelto'
                          ? 'bg-[#0052a5] text-white'
                          : t.estado === 'en_atencion'
                          ? 'bg-[#1d4ed8] text-white'
                          : t.estado === 'pendiente'
                          ? 'bg-[#0ea5e9] text-white'
                          : 'bg-white text-[#0a2463] border border-[#0284c7]'
                      }`}
                    >
                      {t.estado.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#4b6b94] whitespace-nowrap">
                    {new Date(t.fecha).toLocaleDateString('es-PE')}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#4b6b94] whitespace-nowrap">
                    {t.resolved ? new Date(t.resolved).toLocaleDateString('es-PE') : '—'}
                  </td>
                  <td className="py-3 px-4 font-mono text-center font-bold text-[#0a2463] whitespace-nowrap">
                    {t.tiempo_resolucion_min ? `${t.tiempo_resolucion_min} m` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
