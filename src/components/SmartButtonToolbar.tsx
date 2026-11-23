import React from 'react';
import { useTickets } from '../context/TicketContext';
import { exportTicketsToCsv } from '../utils/csv';
import {
  Zap,
  PlusCircle,
  SlidersHorizontal,
  Download,
  RotateCcw,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface SmartButtonToolbarProps {
  onOpenCreateModal: () => void;
  onOpenMatrixModal: () => void;
  onOpenCriteriaModal: () => void;
  onOpenAuditDrawer: () => void;
}

export const SmartButtonToolbar: React.FC<SmartButtonToolbarProps> = ({
  onOpenCreateModal,
  onOpenMatrixModal,
  onOpenCriteriaModal,
  onOpenAuditDrawer,
}) => {
  const {
    currentUser,
    smartNextCandidate,
    takeSmartNextTicket,
    filteredTickets,
    metrics,
    filters,
    setFilters,
    resetToSeedData,
  } = useTickets();

  const handleTakeSmartTicket = () => {
    if (!smartNextCandidate) return;
    const taken = takeSmartNextTicket();
    if (taken) {
      // Notification handled in context
    }
  };

  const handleExportCsv = () => {
    exportTicketsToCsv(filteredTickets, `sedatech_tickets_${currentUser.rol}`);
  };

  const isTechnicianOrAdmin = currentUser.rol === 'tecnico' || currentUser.rol === 'administrador';

  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#cce4ff] shadow-xs mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9] animate-pulse" />
          <h2 className="text-sm font-bold text-[#0a2463] tracking-tight flex items-center gap-1.5">
            <span>Acciones Rápidas Inteligentes</span>
            <span className="text-[11px] font-normal text-[#4b6b94] hidden sm:inline">
              · Distribución y dimensionamiento dinámico según rol ({currentUser.rol})
            </span>
          </h2>
        </div>

        {/* Status ticker text */}
        <div className="text-xs text-[#4b6b94] flex items-center gap-2">
          {smartNextCandidate ? (
            <span className="flex items-center gap-1 text-[#0052a5] bg-[#f0f7ff] border border-[#cce4ff] px-2 py-0.5 rounded-md font-medium text-[11px]">
              <Sparkles className="w-3 h-3 text-[#0284c7]" />
              Siguiente en cola RF-04: <strong className="font-mono">{smartNextCandidate.codigo}</strong> (
              <span className="capitalize">{smartNextCandidate.prioridad}</span>)
            </span>
          ) : (
            <span className="text-[#4b6b94] text-[11px]">No hay tickets pendientes en cola</span>
          )}
        </div>
      </div>

      {/* Auto-distributing & Auto-resizing Smart Buttons Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-2.5 items-stretch w-full">
        {/* Smart Button 1: RF-04 Siguiente Ticket Prioritario */}
        {isTechnicianOrAdmin && (
          <button
            onClick={handleTakeSmartTicket}
            disabled={!smartNextCandidate}
            title={
              smartNextCandidate
                ? `Tomar ticket más urgente según RF-04 (Prioridad: ${smartNextCandidate.prioridad.toUpperCase()}, Antigüedad: ${new Date(smartNextCandidate.fecha).toLocaleTimeString()})`
                : 'No hay tickets pendientes disponibles'
            }
            className={`group relative lg:flex-1 min-w-[200px] flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border font-medium text-xs transition-all duration-200 cursor-pointer ${
              smartNextCandidate
                ? 'bg-gradient-to-r from-[#0a2463] to-[#0052a5] hover:from-[#0052a5] hover:to-[#0284c7] text-white border-[#0052a5] shadow-sm shadow-sky-200 hover:shadow-md'
                : 'bg-[#f0f7ff] text-[#4b6b94] border-[#cce4ff] cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Zap className={`w-4 h-4 shrink-0 ${smartNextCandidate ? 'text-sky-300' : 'text-[#4b6b94]'}`} />
              <div className="text-left truncate">
                <div className="font-semibold truncate">
                  {smartNextCandidate ? 'Atender Siguiente Prioritario' : 'Cola Despejada'}
                </div>
                <div className="text-[10px] opacity-80 truncate font-mono">
                  {smartNextCandidate ? `${smartNextCandidate.codigo} · ${smartNextCandidate.prioridad}` : '0 pendientes'}
                </div>
              </div>
            </div>
            {smartNextCandidate && (
              <span className="shrink-0 bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                RF-04
              </span>
            )}
          </button>
        )}

        {/* Smart Button 2: Crear Ticket (RF-02) */}
        <button
          onClick={onOpenCreateModal}
          className="lg:flex-1 min-w-[150px] flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-sky-300 bg-[#f0f7ff] hover:bg-sky-100 text-[#0a2463] font-medium text-xs transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-2 truncate">
            <PlusCircle className="w-4 h-4 text-[#0284c7] shrink-0" />
            <div className="text-left truncate">
              <div className="font-semibold">Nuevo Ticket</div>
              <div className="text-[10px] text-[#0052a5] truncate">Código único automático (RF-02)</div>
            </div>
          </div>
          <span className="shrink-0 bg-[#0284c7] text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
            +
          </span>
        </button>

        {/* Smart Button 3: Matriz de Prioridad (RF-03) */}
        {currentUser.rol === 'administrador' && (
          <button
            onClick={onOpenMatrixModal}
            className="lg:flex-1 min-w-[160px] flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-[#cce4ff] bg-white hover:bg-[#f0f7ff] text-[#0a2463] font-medium text-xs transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-2 truncate">
              <SlidersHorizontal className="w-4 h-4 text-[#0052a5] shrink-0" />
              <div className="text-left truncate">
                <div className="font-semibold">Matriz de Prioridad</div>
                <div className="text-[10px] text-[#4b6b94] truncate">Gestión y reasignación TI</div>
              </div>
            </div>
            <span className="shrink-0 bg-[#0052a5] text-white px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums">
              {metrics.pendientes}
            </span>
          </button>
        )}

        {/* Smart Button 4: Exportar CSV */}
        <button
          onClick={handleExportCsv}
          className="lg:flex-1 min-w-[150px] flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-[#0a2463] font-medium text-xs transition-all cursor-pointer shadow-xs"
          title="Descargar archivo CSV con encabezados, filtros aplicados y escape anti-fórmulas"
        >
          <div className="flex items-center gap-2 truncate">
            <Download className="w-4 h-4 text-[#0284c7] shrink-0" />
            <div className="text-left truncate">
              <div className="font-semibold">Exportar CSV</div>
              <div className="text-[10px] text-[#0052a5] truncate">Filtros actuales ({filteredTickets.length})</div>
            </div>
          </div>
          <span className="shrink-0 bg-sky-200 text-[#0a2463] px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase">
            RF-09
          </span>
        </button>

        {/* Smart Button 5: Historial Auditoría Inmutable (RF-10) */}
        <button
          onClick={onOpenAuditDrawer}
          className="lg:flex-1 min-w-[150px] flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-[#cce4ff] bg-white hover:bg-[#f0f7ff] text-[#0a2463] font-medium text-xs transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-2 truncate">
            <Clock className="w-4 h-4 text-[#0052a5] shrink-0" />
            <div className="text-left truncate">
              <div className="font-semibold">Libro de Auditoría</div>
              <div className="text-[10px] text-[#4b6b94] truncate">Registro append-only (RF-10)</div>
            </div>
          </div>
        </button>

        {/* Smart Button 6: Reiniciar Datos Semilla */}
        <button
          onClick={resetToSeedData}
          title="Restablecer tickets y logs de prueba originales"
          className="flex-initial flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#cce4ff] bg-white hover:bg-[#f0f7ff] text-[#4b6b94] hover:text-[#0a2463] text-xs font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Restablecer Semilla</span>
        </button>
      </div>

      {/* Quick context filters bar */}
      <div className="mt-3 pt-3 border-t border-sky-100 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-[#4b6b94] text-[11px]">
          <span>Filtros rápidos de estado:</span>
          <button
            onClick={() => setFilters(prev => ({ ...prev, estado: 'todos' }))}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              filters.estado === 'todos' ? 'bg-[#0a2463] text-white font-semibold' : 'hover:bg-[#f0f7ff] text-[#0a2463]'
            }`}
          >
            Todos ({metrics.total})
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, estado: 'pendiente' }))}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              filters.estado === 'pendiente' ? 'bg-[#0ea5e9] text-white font-semibold' : 'hover:bg-sky-50 text-[#0284c7]'
            }`}
          >
            Pendientes ({metrics.pendientes})
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, estado: 'en_atencion' }))}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              filters.estado === 'en_atencion' ? 'bg-[#0052a5] text-white font-semibold' : 'hover:bg-[#f0f7ff] text-[#0052a5]'
            }`}
          >
            En Atención ({metrics.en_atencion})
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, estado: 'resuelto' }))}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              filters.estado === 'resuelto' ? 'bg-[#0284c7] text-white font-semibold' : 'hover:bg-sky-50 text-[#0284c7]'
            }`}
          >
            Resueltos ({metrics.resueltos})
          </button>
        </div>

        {currentUser.rol === 'usuario' && (
          <div className="text-[11px] text-[#0052a5] bg-[#f0f7ff] border border-[#cce4ff] px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-[#0284c7]" />
            <span>RF-01 Activo: Estás visualizando únicamente tus propios tickets solicitados</span>
          </div>
        )}
      </div>
    </div>
  );
};
