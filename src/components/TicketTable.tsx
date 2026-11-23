import React, { useState, useRef, useEffect } from 'react';
import { useTickets } from '../context/TicketContext';
import { Ticket, Priority, TicketStatus } from '../types';
import {
  Eye,
  Edit2,
  UserCheck,
  MoreHorizontal,
  Clock,
  Sparkles,
  Play,
  CheckCircle,
  XCircle,
  History,
} from 'lucide-react';

interface TicketTableProps {
  onSelectTicket: (ticket: Ticket) => void;
  onOpenResolveModal: (ticket: Ticket) => void;
  onOpenAssignModal: (ticket: Ticket) => void;
  onOpenCancelModal: (ticket: Ticket) => void;
  onOpenPriorityModal: (ticket: Ticket) => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  onSelectTicket,
  onOpenResolveModal,
  onOpenAssignModal,
  onOpenCancelModal,
  onOpenPriorityModal,
}) => {
  const { filteredTickets, smartNextCandidate, startAttention, currentUser } = useTickets();
  const [activeMenuTicketId, setActiveMenuTicketId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuTicketId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Format date exactly like 19/10/2026 09:15 matching screenshot
  const formatDateDisplay = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return isoDate;
    }
  };

  const getPriorityPill = (priority: Priority) => {
    switch (priority) {
      case 'alta':
        return (
          <span className="inline-block w-20 text-center py-1 text-xs font-black text-white bg-red-600 rounded-full shadow-2xs">
            Alta
          </span>
        );
      case 'media':
        return (
          <span className="inline-block w-20 text-center py-1 text-xs font-black text-[#0a2463] bg-yellow-400 rounded-full shadow-2xs">
            Media
          </span>
        );
      case 'baja':
        return (
          <span className="inline-block w-20 text-center py-1 text-xs font-black text-white bg-green-600 rounded-full shadow-2xs">
            Baja
          </span>
        );
    }
  };

  const getStatusPill = (status: TicketStatus) => {
    switch (status) {
      case 'en_atencion':
        return (
          <span className="inline-block w-24 text-center py-1 text-xs font-black text-white bg-[#1d4ed8] rounded-full shadow-2xs">
            En atención
          </span>
        );
      case 'resuelto':
        return (
          <span className="inline-block w-24 text-center py-1 text-xs font-black text-white bg-[#0052a5] rounded-full shadow-2xs">
            Resuelto
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-block w-24 text-center py-1 text-xs font-black text-white bg-[#0ea5e9] rounded-full shadow-2xs">
            Pendiente
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-block w-24 text-center py-1 text-xs font-black text-[#0a2463] bg-white border border-[#0284c7] rounded-full shadow-2xs">
            Cancelado
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#cce4ff] shadow-xs overflow-hidden select-none mb-6">
      <div className="p-4 sm:p-5 border-b border-[#cce4ff] flex items-center justify-between">
        <h3 className="text-base font-black font-display text-[#0a2463] tracking-tight">
          Lista de tickets
        </h3>
        <span className="text-xs text-[#0052a5] bg-[#f0f7ff] border border-[#cce4ff] px-2.5 py-0.5 rounded-full font-mono font-bold">
          {filteredTickets.length} registros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#f0f7ff] border-b border-[#cce4ff] text-[#0a2463] font-black text-xs select-none">
              <th className="py-3.5 px-4 whitespace-nowrap">Código</th>
              <th className="py-3.5 px-4 min-w-[200px]">Asunto</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Usuario</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Fecha</th>
              <th className="py-3.5 px-4 text-center whitespace-nowrap">Prioridad</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Técnico</th>
              <th className="py-3.5 px-4 text-center whitespace-nowrap">Estado</th>
              <th className="py-3.5 px-4 text-center whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#cce4ff]/70 text-[#0a2463]">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#4b6b94]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Clock className="w-8 h-8 text-sky-300" />
                    <p className="text-sm font-bold text-[#0a2463]">No se encontraron tickets</p>
                    <p className="text-xs text-[#4b6b94]">Modifica los filtros de fecha, estado o prioridad.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTickets.map(ticket => {
                const isSmartCandidate = smartNextCandidate?.id === ticket.id;
                const isMenuOpen = activeMenuTicketId === ticket.id;

                return (
                  <tr
                    key={ticket.id}
                    className={`hover:bg-[#f0f7ff]/80 transition-colors ${
                      isSmartCandidate ? 'bg-sky-50/70' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-[#0a2463]">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectTicket(ticket)}
                          className="hover:text-[#0284c7] transition-colors cursor-pointer"
                        >
                          {ticket.codigo}
                        </button>
                        {isSmartCandidate && (
                          <span title="Siguiente en cola por prioridad y antigüedad (RF-04)">
                            <Sparkles className="w-3.5 h-3.5 text-[#0284c7] animate-pulse" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#0a2463]">
                      <div
                        onClick={() => onSelectTicket(ticket)}
                        className="hover:text-[#0284c7] transition-colors cursor-pointer truncate max-w-xs font-bold"
                      >
                        {ticket.asunto}
                      </div>
                      {ticket.equipo_modelo && (
                        <div className="text-[10px] text-[#4b6b94] font-mono flex items-center gap-1 mt-0.5">
                          <span className="text-[#0052a5] font-black">💻</span> {ticket.equipo_modelo}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-[#0a2463]/85 font-medium">
                      {ticket.usuario}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-[#4b6b94] font-mono text-[11px]">
                      {formatDateDisplay(ticket.fecha)}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {getPriorityPill(ticket.prioridad)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {ticket.tecnico ? (
                        <span className="font-medium text-[#0a2463]">{ticket.tecnico}</span>
                      ) : (
                        <span className="text-[#4b6b94] font-bold">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {getStatusPill(ticket.estado)}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap relative">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectTicket(ticket)}
                          className="w-7 h-7 rounded-lg border border-[#cce4ff] hover:border-[#0284c7] hover:bg-[#f0f7ff] flex items-center justify-center text-[#4b6b94] hover:text-[#0052a5] transition-colors cursor-pointer btn-spring"
                          title="Ver detalle del ticket"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onOpenPriorityModal(ticket)}
                          className="w-7 h-7 rounded-lg border border-[#cce4ff] hover:border-[#0284c7] hover:bg-[#f0f7ff] flex items-center justify-center text-[#4b6b94] hover:text-[#0284c7] transition-colors cursor-pointer btn-spring"
                          title="Establecer prioridad / Consultar matriz (RF-03)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onOpenAssignModal(ticket)}
                          className="w-7 h-7 rounded-lg border border-[#cce4ff] hover:border-[#0052a5] hover:bg-[#f0f7ff] flex items-center justify-center text-[#4b6b94] hover:text-[#0a2463] transition-colors cursor-pointer btn-spring"
                          title="Asignar técnico responsable (RF-04)"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>

                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenuTicketId(isMenuOpen ? null : ticket.id)
                            }
                            className="w-7 h-7 rounded-lg border border-[#cce4ff] hover:border-[#0284c7] hover:bg-[#f0f7ff] flex items-center justify-center text-[#4b6b94] hover:text-[#0a2463] transition-colors cursor-pointer btn-spring"
                            title="Opciones avanzadas"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>

                          {isMenuOpen && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 top-8 w-52 bg-white rounded-2xl shadow-xl border border-[#cce4ff] py-1.5 z-50 text-left animate-pop"
                            >
                              {ticket.estado === 'pendiente' && (
                                <button
                                  onClick={() => {
                                    startAttention(ticket.id);
                                    setActiveMenuTicketId(null);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-bold text-[#0052a5] hover:bg-[#f0f7ff] flex items-center gap-2 cursor-pointer"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                  <span>Iniciar atención (RF-05)</span>
                                </button>
                              )}

                              {ticket.estado === 'en_atencion' && (
                                <button
                                  onClick={() => {
                                    onOpenResolveModal(ticket);
                                    setActiveMenuTicketId(null);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-bold text-[#0284c7] hover:bg-[#f0f7ff] flex items-center gap-2 cursor-pointer"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Registrar solución (RF-05)</span>
                                </button>
                              )}

                              {ticket.estado === 'pendiente' && (
                                <button
                                  onClick={() => {
                                    onOpenCancelModal(ticket);
                                    setActiveMenuTicketId(null);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-bold text-[#0a2463] hover:bg-[#f0f7ff] flex items-center gap-2 cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Cancelar ticket (RF-07)</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  onSelectTicket(ticket);
                                  setActiveMenuTicketId(null);
                                }}
                                className="w-full px-3 py-2 text-xs font-semibold text-[#0a2463] hover:bg-[#f0f7ff] flex items-center gap-2 cursor-pointer border-t border-sky-100"
                              >
                                <History className="w-3.5 h-3.5" />
                                <span>Ver historial (RF-10)</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
