import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { EventoAuditoria } from '../types';
import { X, ShieldCheck, Search, Filter, Volume2, Lock } from 'lucide-react';

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({ isOpen, onClose }) => {
  const { auditLogs } = useTickets();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState<string>('todos');

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter(log => {
    if (filterEvent !== 'todos' && log.evento !== filterEvent) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchCode = log.ticket_codigo.toLowerCase().includes(term);
      const matchActor = log.actor_nombre.toLowerCase().includes(term);
      const matchDetail = log.detalles.toLowerCase().includes(term);
      if (!matchCode && !matchActor && !matchDetail) return false;
    }
    return true;
  });

  const getEventBadge = (evento: EventoAuditoria) => {
    switch (evento) {
      case 'ticket_creado':
        return <span className="bg-sky-100 text-[#0284c7] px-2 py-0.5 rounded text-[10px] font-bold border border-sky-200">ticket_creado</span>;
      case 'atencion_iniciada':
        return <span className="bg-[#1d4ed8]/15 text-[#1d4ed8] px-2 py-0.5 rounded text-[10px] font-bold">atencion_iniciada</span>;
      case 'ticket_resuelto':
        return <span className="bg-[#0052a5] text-white px-2 py-0.5 rounded text-[10px] font-bold">ticket_resuelto</span>;
      case 'ticket_cancelado':
        return <span className="bg-white text-[#0a2463] border border-[#0a2463] px-2 py-0.5 rounded text-[10px] font-bold">ticket_cancelado</span>;
      case 'prioridad_modificada':
        return <span className="bg-[#0ea5e9] text-white px-2 py-0.5 rounded text-[10px] font-bold">prioridad_modificada</span>;
      case 'tecnico_asignado':
        return <span className="bg-[#0a2463] text-white px-2 py-0.5 rounded text-[10px] font-bold">tecnico_asignado</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#061c47]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 border-l-2 border-[#cce4ff]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#0052a5] flex items-center justify-between bg-[#0a2463] text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0284c7]/30 text-sky-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                <span>Libro de Auditoría Inmutable</span>
                <span className="text-[10px] font-mono bg-[#0284c7]/30 text-sky-200 px-1.5 py-0.5 rounded border border-sky-400/40">
                  APPEND-ONLY
                </span>
              </h2>
              <p className="text-xs text-sky-200">
                Criterio RF-10: Historial permanente sin permisos de alteración ni borrado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-sky-200 hover:text-white hover:bg-[#0052a5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Info Ribbon */}
        <div className="bg-[#0052a5] text-sky-100 px-6 py-2.5 text-xs flex items-center justify-between border-b border-[#0284c7]">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-sky-300" />
            <span>Integridad criptográfica y trazabilidad de actores activa</span>
          </div>
          <span className="font-mono text-sky-200 font-bold">{auditLogs.length} asientos</span>
        </div>

        {/* Search & Filter toolbar */}
        <div className="p-4 border-b border-[#cce4ff] bg-[#f0f7ff] flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#4b6b94] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por ticket, actor o detalle..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#cce4ff] rounded-lg text-[#0a2463] focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
            />
          </div>

          <select
            value={filterEvent}
            onChange={e => setFilterEvent(e.target.value)}
            className="py-1.5 px-2.5 text-xs bg-white border border-[#cce4ff] rounded-lg text-[#0a2463] focus:outline-none"
          >
            <option value="todos">Todos los eventos</option>
            <option value="ticket_creado">ticket_creado</option>
            <option value="atencion_iniciada">atencion_iniciada</option>
            <option value="ticket_resuelto">ticket_resuelto</option>
            <option value="ticket_cancelado">ticket_cancelado</option>
            <option value="prioridad_modificada">prioridad_modificada</option>
            <option value="tecnico_asignado">tecnico_asignado</option>
          </select>
        </div>

        {/* Ledger Entries List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 bg-[#f0f7ff]/50">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-[#4b6b94] text-xs">
              No hay asientos de auditoría que coincidan con la búsqueda.
            </div>
          ) : (
            filteredLogs.map(entry => (
              <div
                key={entry.id}
                className="p-3.5 bg-white rounded-xl border border-[#cce4ff] shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#0052a5]">
                      {entry.ticket_codigo}
                    </span>
                    {getEventBadge(entry.evento)}
                  </div>
                  <span className="text-[11px] font-mono text-[#4b6b94]">
                    {new Date(entry.fecha).toLocaleString('es-ES')}
                  </span>
                </div>

                <p className="text-xs text-[#0a2463] mb-2 leading-relaxed">{entry.detalles}</p>

                <div className="flex items-center justify-between text-[11px] text-[#4b6b94] pt-2 border-t border-[#cce4ff]/60">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#4b6b94]">Actor:</span>
                    <strong className="text-[#0a2463]">{entry.actor_nombre}</strong>
                    <span className="text-[#4b6b94] capitalize">({entry.actor_rol})</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    {entry.notificacion_destinatario && (
                      <span className="text-[#0052a5] bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded">
                        Notif: {entry.notificacion_destinatario}
                      </span>
                    )}
                    {entry.sonido_emitido && (
                      <span className="flex items-center gap-0.5 text-[#0284c7] font-bold">
                        <Volume2 className="w-3 h-3" /> Sonido
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#cce4ff] bg-white flex items-center justify-between text-xs text-[#4b6b94]">
          <span>Modo append-only: Prohibida modificación o eliminación.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 font-bold text-[#0052a5] bg-[#f0f7ff] hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
