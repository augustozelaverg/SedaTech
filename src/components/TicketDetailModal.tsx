import React from 'react';
import { useTickets } from '../context/TicketContext';
import { Ticket } from '../types';
import { CATEGORIES_CONFIG } from '../data/seedData';
import { X, CheckCircle2, Play, AlertCircle, Computer, History, User, Calendar, Clock } from 'lucide-react';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenResolveModal: (ticket: Ticket) => void;
  onOpenCancelModal: (ticket: Ticket) => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onOpenResolveModal,
  onOpenCancelModal,
}) => {
  const { auditLogs, currentUser, startAttention } = useTickets();

  if (!isOpen || !ticket) return null;

  const ticketHistory = auditLogs.filter(log => log.ticket_codigo === ticket.codigo);

  const isTechnicianOrAdmin = currentUser.rol === 'tecnico' || currentUser.rol === 'administrador';
  const canCancel =
    ticket.estado === 'pendiente' &&
    (ticket.usuario_id === currentUser.id || currentUser.rol === 'administrador');
  const canStartAttention = ticket.estado === 'pendiente' && isTechnicianOrAdmin;
  const canResolve = ticket.estado === 'en_atencion' && isTechnicianOrAdmin;

  const catEmoji = CATEGORIES_CONFIG[ticket.categoria] || '💻';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#061c47]/70 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-[#cce4ff] max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-pop">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#cce4ff] flex items-center justify-between bg-gradient-to-r from-[#0a2463] via-[#0052a5] to-[#0284c7] text-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{catEmoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black bg-white/20 px-2.5 py-0.5 rounded-lg text-white">
                  {ticket.codigo}
                </span>
                <span className="text-xs font-bold text-sky-100">{ticket.categoria}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display tracking-tight text-white line-clamp-1 mt-0.5">
                {ticket.asunto}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 bg-[#f0f7ff] text-xs">
          {/* Status & Priority tags row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-xs ${
                ticket.estado === 'en_atencion'
                  ? 'bg-[#1d4ed8] text-white'
                  : ticket.estado === 'resuelto'
                  ? 'bg-[#0052a5] text-white'
                  : ticket.estado === 'pendiente'
                  ? 'bg-[#0ea5e9] text-white'
                  : 'bg-white text-[#0a2463] border-2 border-[#0284c7]'
              }`}
            >
              {ticket.estado === 'en_atencion'
                ? '▶️ En atención'
                : ticket.estado === 'resuelto'
                ? '✔️ Resuelto'
                : ticket.estado === 'pendiente'
                ? '⏳ Pendiente'
                : '✖️ Cancelado'}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-black text-xs ${
                ticket.prioridad === 'alta'
                  ? 'bg-red-600 text-white'
                  : ticket.prioridad === 'media'
                  ? 'bg-yellow-400 text-[#0a2463]'
                  : 'bg-green-600 text-white'
              }`}
            >
              {ticket.prioridad === 'alta'
                ? '🔥 Prioridad Alta'
                : ticket.prioridad === 'media'
                ? '⚡ Prioridad Media'
                : '🌱 Prioridad Baja'}
            </span>

            {ticket.equipo_modelo && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs bg-white text-[#0a2463] border border-[#cce4ff]">
                <Computer className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>{ticket.equipo_modelo}</span>
              </span>
            )}
          </div>

          {/* Grid of properties */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-white border border-[#cce4ff]">
              <span className="text-[10px] text-[#4b6b94] font-black block">👤 Propietario / Cliente</span>
              <strong className="text-[#0a2463] text-xs truncate block">{ticket.usuario}</strong>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#cce4ff]">
              <span className="text-[10px] text-[#4b6b94] font-black block">🔧 Técnico Responsable</span>
              <strong className="text-[#0a2463] text-xs truncate block">
                {ticket.tecnico || 'Sin asignar'}
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#cce4ff]">
              <span className="text-[10px] text-[#4b6b94] font-black block">📅 Fecha de Ingreso</span>
              <strong className="text-[#0a2463] text-xs font-mono">
                {new Date(ticket.fecha).toLocaleDateString('es-PE')}
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#cce4ff]">
              <span className="text-[10px] text-[#4b6b94] font-black block">▶️ Inicio de Reparación</span>
              <strong className="text-[#0a2463] text-xs font-mono">
                {ticket.started ? new Date(ticket.started).toLocaleTimeString('es-PE') : '—'}
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#cce4ff]">
              <span className="text-[10px] text-[#4b6b94] font-black block">🏁 Resolución / Tiempo</span>
              <strong className="text-[#0a2463] text-xs font-mono">
                {ticket.resolved ? `${ticket.tiempo_resolucion_min || 30} min` : '—'}
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#cce4ff]">
              <span className="text-[10px] text-[#4b6b94] font-black block">🏷️ Categoría</span>
              <strong className="text-[#0a2463] text-xs truncate block">{ticket.categoria}</strong>
            </div>
          </div>

          {/* Description */}
          <div className="p-3.5 bg-white rounded-2xl border border-[#cce4ff]">
            <span className="text-[11px] font-black text-[#0a2463] block mb-1">
              Descripción del problema y síntomas:
            </span>
            <p className="text-[#0a2463] leading-relaxed whitespace-pre-wrap">{ticket.descripcion}</p>
          </div>

          {/* Solution box if resolved (RF-05) */}
          {ticket.estado === 'resuelto' && (
            <div className="p-3.5 bg-sky-50 rounded-2xl border border-[#0284c7] text-[#0a2463]">
              <span className="text-xs font-black flex items-center gap-1.5 mb-1 text-[#0052a5]">
                <CheckCircle2 className="w-4 h-4 text-[#0284c7]" />
                <span>Descripción de la Solución Técnica Aplicada (RF-05):</span>
              </span>
              <p className="font-semibold leading-relaxed whitespace-pre-wrap">{ticket.solucion}</p>
            </div>
          )}

          {/* Cancel box if cancelled (RF-07) */}
          {ticket.estado === 'cancelado' && (
            <div className="p-3.5 bg-white rounded-2xl border-2 border-[#0a2463] text-[#0a2463]">
              <span className="text-xs font-black block mb-1 text-[#0052a5]">Motivo de Cancelación (RF-07):</span>
              <p className="font-semibold">{ticket.cancelado_motivo || 'Cancelado a solicitud del cliente.'}</p>
            </div>
          )}

          {/* Immutable Audit History (RF-10 / Section 4 & 9) */}
          <div className="pt-2">
            <h3 className="text-xs font-black text-[#0a2463] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#0284c7]" />
              <span>Historial Inmutable del Ticket (RF-10 · Solo Lectura)</span>
            </h3>

            <div className="border-l-4 border-[#cce4ff] ml-2 pl-4 space-y-3">
              {ticketHistory.map(entry => (
                <div key={entry.id} className="relative">
                  <span className="absolute -left-6.5 top-0 text-sm">
                    {entry.evento === 'ticket_creado'
                      ? '✨'
                      : entry.evento === 'atencion_iniciada'
                      ? '▶️'
                      : entry.evento === 'ticket_resuelto'
                      ? '✔️'
                      : entry.evento === 'ticket_cancelado'
                      ? '✖️'
                      : entry.evento === 'prioridad_modificada'
                      ? '⚡'
                      : '👤'}
                  </span>
                  <div>
                    <strong className="text-[#0a2463] block font-bold leading-tight">
                      {entry.detalles}
                    </strong>
                    {(entry.old_value || entry.new_value) && (
                      <div className="text-[10px] font-mono text-[#4b6b94] mt-0.5">
                        [Valor anterior: {entry.old_value || 'ninguno'} → Valor nuevo: {entry.new_value || 'actual'}]
                      </div>
                    )}
                    <small className="text-[#4b6b94] font-medium block mt-0.5">
                      {new Date(entry.fecha).toLocaleString('es-PE')} · Por: {entry.actor_nombre} ({entry.actor_rol})
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#cce4ff] bg-white flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#4b6b94]">ID: {ticket.codigo}</span>

          <div className="flex items-center gap-2">
            {canStartAttention && (
              <button
                onClick={() => {
                  startAttention(ticket.id);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-black text-white bg-[#0052a5] hover:bg-[#0a2463] rounded-xl shadow-xs btn-spring cursor-pointer flex items-center gap-1 min-h-[44px]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Iniciar Atención (RF-05)</span>
              </button>
            )}

            {canResolve && (
              <button
                onClick={() => {
                  onClose();
                  onOpenResolveModal(ticket);
                }}
                className="px-4 py-2 text-xs font-black text-white bg-[#0284c7] hover:bg-[#0052a5] rounded-xl shadow-xs btn-spring cursor-pointer flex items-center gap-1 min-h-[44px]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resolver con Solución</span>
              </button>
            )}

            {canCancel && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCancelModal(ticket);
                }}
                className="px-4 py-2 text-xs font-black text-[#0a2463] bg-white hover:bg-sky-50 border-2 border-[#0a2463] rounded-xl transition-all cursor-pointer min-h-[44px]"
              >
                Cancelar Ticket (RF-07)
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-black text-[#0052a5] bg-[#f0f7ff] hover:bg-sky-100 rounded-xl cursor-pointer min-h-[44px]"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
