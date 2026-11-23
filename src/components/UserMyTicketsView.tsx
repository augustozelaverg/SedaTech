import React from 'react';
import { useTickets } from '../context/TicketContext';
import { Ticket } from '../types';
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Wrench,
  Computer,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';

interface UserMyTicketsViewProps {
  onSelectTicket: (ticket: Ticket) => void;
  onOpenCreateModal: () => void;
  onOpenCancelModal: (ticket: Ticket) => void;
}

export const UserMyTicketsView: React.FC<UserMyTicketsViewProps> = ({
  onSelectTicket,
  onOpenCreateModal,
  onOpenCancelModal,
}) => {
  const { visibleTicketsForCurrentRole, currentUser, notifications } = useTickets();

  // Check for in-attention alerts for this user (RF-06)
  const ticketsEnAtencion = visibleTicketsForCurrentRole.filter(t => t.estado === 'en_atencion');
  const ticketsPendientes = visibleTicketsForCurrentRole.filter(t => t.estado === 'pendiente');
  const ticketsResueltos = visibleTicketsForCurrentRole.filter(t => t.estado === 'resuelto');

  return (
    <div className="space-y-6 animate-in fade-in duration-200 select-none">
      {/* Top Banner for Usuario */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#cce4ff] shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0ea5e9] text-white flex items-center justify-center text-3xl font-black shadow-md shadow-sky-500/20">
            {currentUser.avatarEmoji || '🧑‍💻'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-display text-[#0a2463]">
                Mis Tickets de Reparación
              </h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-[#0052a5] border border-sky-300">
                Rol: Usuario (RF-01)
              </span>
            </div>
            <p className="text-xs text-[#4b6b94] font-medium mt-0.5">
              Cliente: <strong className="text-[#0a2463]">{currentUser.nombre}</strong> ({currentUser.email})
            </p>
          </div>
        </div>

        {/* Big tactile button to register ticket (>= 44x44px target) */}
        <button
          onClick={onOpenCreateModal}
          className="px-6 py-3.5 bg-[#0284c7] hover:bg-[#0052a5] text-white rounded-2xl text-xs font-black shadow-md btn-spring cursor-pointer flex items-center gap-2 min-h-[44px]"
        >
          <Plus className="w-5 h-5" />
          <span>+ Nuevo Ticket de Reparación (RF-02)</span>
        </button>
      </div>

      {/* RF-06: Aviso destacado dentro de la cuenta cuando un ticket pasa a «En atención» */}
      {ticketsEnAtencion.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#0a2463] via-[#0052a5] to-[#0284c7] text-white shadow-lg shadow-sky-900/20 flex items-center justify-between flex-wrap gap-3 animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shrink-0">
              ⚡
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-md inline-block">
                Aviso de Atención en Vivo (Criterio RF-06)
              </span>
              <p className="text-sm font-black mt-0.5">
                ¡Tu equipo está siendo atendido por el servicio técnico!
              </p>
              <p className="text-xs text-sky-100">
                {ticketsEnAtencion[0].tecnico || 'El técnico'} está diagnosticando {ticketsEnAtencion[0].equipo_modelo} ({ticketsEnAtencion[0].codigo}).
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectTicket(ticketsEnAtencion[0])}
            className="px-4 py-2 bg-white text-[#0a2463] rounded-xl text-xs font-black hover:bg-sky-50 transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <span>Ver Diagnóstico en Vivo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards for User */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white border-2 border-[#cce4ff] flex items-center gap-3.5 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0284c7] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black font-display text-[#0a2463] leading-none">
              {ticketsPendientes.length}
            </span>
            <p className="text-xs font-bold text-[#4b6b94] mt-0.5">Pendientes en Cola</p>
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
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black font-display text-[#0a2463] leading-none">
              {ticketsResueltos.length}
            </span>
            <p className="text-xs font-bold text-[#4b6b94] mt-0.5">Reparados / Listos</p>
          </div>
        </div>
      </div>

      {/* Tickets List for Usuario */}
      <div className="bg-white rounded-3xl border-2 border-[#cce4ff] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#cce4ff] flex items-center justify-between">
          <h3 className="text-base font-black font-display text-[#0a2463]">
            Mis Solicitudes de Reparación ({visibleTicketsForCurrentRole.length})
          </h3>
          <span className="text-xs text-[#4b6b94] font-medium">
            Segregación estricta: Solo visibles por {currentUser.nombre}
          </span>
        </div>

        <div className="divide-y divide-[#cce4ff]">
          {visibleTicketsForCurrentRole.length === 0 ? (
            <div className="p-12 text-center text-[#4b6b94]">
              <Computer className="w-10 h-10 mx-auto mb-2 text-sky-300" />
              <p className="text-sm font-bold text-[#0a2463]">Aún no tienes tickets registrados</p>
              <p className="text-xs text-[#4b6b94] mt-0.5">
                Registra tu primer equipo de cómputo con el botón superior.
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
                  className="p-5 hover:bg-[#f0f7ff] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono font-black text-xs text-[#0052a5] bg-sky-100 px-2.5 py-0.5 rounded-lg">
                        {ticket.codigo}
                      </span>

                      {/* State pill */}
                      <span
                        className={`text-xs font-extrabold px-3 py-0.5 rounded-full ${
                          isEnAtencion
                            ? 'bg-[#1d4ed8] text-white'
                            : isResuelto
                            ? 'bg-[#0052a5] text-white'
                            : isPendiente
                            ? 'bg-[#0ea5e9] text-white'
                            : 'bg-white text-[#0a2463] border-2 border-[#0284c7]'
                        }`}
                      >
                        {ticket.estado.replace('_', ' ').toUpperCase()}
                      </span>

                      {/* Priority pill */}
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          ticket.prioridad === 'alta'
                            ? 'bg-red-600 text-white'
                            : ticket.prioridad === 'media'
                            ? 'bg-yellow-400 text-[#0a2463]'
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        Prioridad: {ticket.prioridad}
                      </span>

                      <span className="text-xs text-[#4b6b94] font-medium">
                        · {ticket.categoria}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-[#0a2463] line-clamp-1">
                      {ticket.asunto}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-[#4b6b94] mt-1 flex-wrap">
                      <span>💻 Equipo: <strong>{ticket.equipo_modelo || 'No especificado'}</strong></span>
                      <span>📅 Ingreso: {new Date(ticket.fecha).toLocaleDateString('es-PE')}</span>
                      {ticket.tecnico && (
                        <span>🔧 Técnico asignado: <strong>{ticket.tecnico}</strong></span>
                      )}
                    </div>

                    {/* Resolution preview if solved */}
                    {ticket.solucion && (
                      <div className="mt-2 p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-[#0a2463] text-xs">
                        <strong>Solución aplicada:</strong> {ticket.solucion}
                      </div>
                    )}

                    {/* Cancellation reason if cancelled */}
                    {ticket.cancelado_motivo && (
                      <div className="mt-2 p-2.5 rounded-xl bg-white border-2 border-[#0284c7] text-[#0a2463] text-xs">
                        <strong>Motivo de cancelación:</strong> {ticket.cancelado_motivo}
                      </div>
                    )}
                  </div>

                  {/* Actions for this ticket */}
                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                    {/* View details */}
                    <button
                      onClick={() => onSelectTicket(ticket)}
                      className="px-4 py-2 rounded-xl border-2 border-[#cce4ff] hover:border-[#0284c7] text-xs font-bold text-[#0a2463] bg-white transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px]"
                    >
                      <Eye className="w-4 h-4 text-[#0284c7]" />
                      <span>Ver Detalles</span>
                    </button>

                    {/* RF-07: Cancelar ticket solo si permanece Pendiente */}
                    {isPendiente && (
                      <button
                        onClick={() => onOpenCancelModal(ticket)}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-sky-50 text-[#0a2463] border-2 border-[#0a2463] text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px]"
                        title="Cancelar ticket propio mientras permanezca Pendiente (RF-07)"
                      >
                        <XCircle className="w-4 h-4 text-[#0052a5]" />
                        <span>Cancelar Ticket (RF-07)</span>
                      </button>
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
