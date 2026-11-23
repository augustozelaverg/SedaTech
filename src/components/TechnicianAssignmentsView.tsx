import React from 'react';
import { useTickets } from '../context/TicketContext';
import { Ticket } from '../types';
import {
  Wrench,
  Play,
  CheckCircle,
  Eye,
  Clock,
  Sparkles,
  AlertTriangle,
  Computer,
} from 'lucide-react';

interface TechnicianAssignmentsViewProps {
  onSelectTicket: (ticket: Ticket) => void;
  onOpenResolveModal: (ticket: Ticket) => void;
}

export const TechnicianAssignmentsView: React.FC<TechnicianAssignmentsViewProps> = ({
  onSelectTicket,
  onOpenResolveModal,
}) => {
  const { visibleTicketsForCurrentRole, currentUser, startAttention } = useTickets();

  const ticketsEnAtencion = visibleTicketsForCurrentRole.filter(t => t.estado === 'en_atencion');
  const ticketsPendientes = visibleTicketsForCurrentRole.filter(t => t.estado === 'pendiente');
  const ticketsResueltos = visibleTicketsForCurrentRole.filter(t => t.estado === 'resuelto');

  return (
    <div className="space-y-6 animate-in fade-in duration-200 select-none">
      {/* Header Banner for Técnico */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#cce4ff] shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center text-3xl font-black shadow-md shadow-sky-500/20">
            {currentUser.avatarEmoji || '🐯'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-display text-[#0a2463]">
                Mis Asignaciones de Reparación
              </h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-[#0052a5] border border-sky-300">
                Rol: Técnico (RF-01)
              </span>
            </div>
            <p className="text-xs text-[#4b6b94] font-medium mt-0.5">
              Técnico asignado: <strong className="text-[#0a2463]">{currentUser.nombre}</strong> ({currentUser.cargo})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#0052a5] bg-[#f0f7ff] border border-[#cce4ff] px-3 py-1.5 rounded-xl">
            {visibleTicketsForCurrentRole.length} tickets asignados
          </span>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white border-2 border-[#cce4ff] flex items-center gap-3.5 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0284c7] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black font-display text-[#0a2463] leading-none">
              {ticketsPendientes.length}
            </span>
            <p className="text-xs font-bold text-[#4b6b94] mt-0.5">Pendientes por Iniciar</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border-2 border-[#cce4ff] flex items-center gap-3.5 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#1d4ed8]/15 text-[#1d4ed8] flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black font-display text-[#0a2463] leading-none">
              {ticketsEnAtencion.length}
            </span>
            <p className="text-xs font-bold text-[#4b6b94] mt-0.5">En Reparación Activa</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border-2 border-[#cce4ff] flex items-center gap-3.5 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#0052a5]/15 text-[#0052a5] flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black font-display text-[#0a2463] leading-none">
              {ticketsResueltos.length}
            </span>
            <p className="text-xs font-bold text-[#4b6b94] mt-0.5">Reparaciones Resueltas</p>
          </div>
        </div>
      </div>

      {/* List of Tickets assigned to Técnico */}
      <div className="bg-white rounded-3xl border-2 border-[#cce4ff] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#cce4ff] flex items-center justify-between">
          <h3 className="text-base font-black font-display text-[#0a2463]">
            Cola de Trabajo de {currentUser.nombre} ({visibleTicketsForCurrentRole.length})
          </h3>
          <span className="text-xs text-[#4b6b94] font-medium">
            RF-01: Acceso restringido exclusivamente a tickets asignados
          </span>
        </div>

        <div className="divide-y divide-[#cce4ff]">
          {visibleTicketsForCurrentRole.length === 0 ? (
            <div className="p-12 text-center text-[#4b6b94]">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 text-[#0284c7]" />
              <p className="text-sm font-bold text-[#0a2463]">No tienes reparaciones pendientes</p>
              <p className="text-xs text-[#4b6b94] mt-0.5">
                El Administrador te asignará nuevos tickets desde la cola.
              </p>
            </div>
          ) : (
            visibleTicketsForCurrentRole.map(ticket => {
              const isPendiente = ticket.estado === 'pendiente';
              const isEnAtencion = ticket.estado === 'en_atencion';
              const isResuelto = ticket.estado === 'resuelto';

              return (
                <div
                  key={ticket.id}
                  className="p-5 hover:bg-[#f0f7ff] transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono font-black text-xs text-[#0052a5] bg-sky-100 px-2.5 py-0.5 rounded-lg">
                        {ticket.codigo}
                      </span>

                      {/* State badge */}
                      <span
                        className={`text-xs font-black px-3 py-0.5 rounded-full text-white ${
                          isEnAtencion
                            ? 'bg-[#1d4ed8]'
                            : isResuelto
                            ? 'bg-[#0052a5]'
                            : 'bg-[#0ea5e9]'
                        }`}
                      >
                        {ticket.estado.replace('_', ' ').toUpperCase()}
                      </span>

                      {/* Priority */}
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          ticket.prioridad === 'alta'
                            ? 'bg-red-600 text-white'
                            : ticket.prioridad === 'media'
                            ? 'bg-yellow-400 text-[#0a2463]'
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        {ticket.prioridad}
                      </span>

                      <span className="text-xs text-[#4b6b94] font-medium">
                        · {ticket.categoria}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-[#0a2463] line-clamp-1">
                      {ticket.asunto}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-[#4b6b94] mt-1 flex-wrap">
                      <span>💻 Equipo: <strong>{ticket.equipo_modelo || 'General'}</strong></span>
                      <span>👤 Propietario: <strong>{ticket.usuario}</strong></span>
                      {ticket.started && (
                        <span>▶️ Iniciado: {new Date(ticket.started).toLocaleTimeString('es-PE')}</span>
                      )}
                      {ticket.resolved && (
                        <span>🏁 Resuelto: {new Date(ticket.resolved).toLocaleTimeString('es-PE')}</span>
                      )}
                    </div>

                    {/* Solution description if resolved */}
                    {ticket.solucion && (
                      <div className="mt-2 p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-[#0a2463] text-xs">
                        <strong>Solución registrada (RF-05):</strong> {ticket.solucion}
                      </div>
                    )}
                  </div>

                  {/* Actions for Technician (RF-05) */}
                  <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end flex-wrap">
                    {/* View Details */}
                    <button
                      onClick={() => onSelectTicket(ticket)}
                      className="px-3.5 py-2 rounded-xl border-2 border-[#cce4ff] hover:border-[#0284c7] text-xs font-bold text-[#0a2463] bg-white transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px]"
                    >
                      <Eye className="w-4 h-4 text-[#0284c7]" />
                      <span>Detalle</span>
                    </button>

                    {/* Action 1: Iniciar atención (RF-05, RF-06) */}
                    {isPendiente && (
                      <button
                        onClick={() => startAttention(ticket.id)}
                        className="px-5 py-2.5 rounded-2xl bg-[#0052a5] hover:bg-[#0a2463] text-white text-xs font-black shadow-md btn-spring cursor-pointer flex items-center gap-2 min-h-[44px]"
                        title="Iniciar diagnóstico y emitir aviso con audio"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Iniciar Atención (RF-05, RF-06)</span>
                      </button>
                    )}

                    {/* Action 2: Resolver con solución obligatoria (RF-05) */}
                    {isEnAtencion && (
                      <button
                        onClick={() => onOpenResolveModal(ticket)}
                        className="px-5 py-2.5 rounded-2xl bg-[#0284c7] hover:bg-[#0052a5] text-white text-xs font-black shadow-md btn-spring cursor-pointer flex items-center gap-2 min-h-[44px]"
                        title="Registrar solución técnica y marcar resuelto (RF-05)"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Registrar Solución (RF-05)</span>
                      </button>
                    )}

                    {/* If resolved */}
                    {isResuelto && (
                      <span className="px-4 py-2 text-xs font-bold text-[#0052a5] bg-sky-50 rounded-xl border border-sky-200 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-[#0284c7]" />
                        <span>Completado</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
