import React, { useState, useMemo } from 'react';
import { useTickets } from '../context/TicketContext';
import { Ticket, Priority } from '../types';
import { X, UserCheck, Check, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { burst } from '../utils/audio';

interface AssignTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket?: Ticket | null;
}

export const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({
  isOpen,
  onClose,
  ticket,
}) => {
  const { tickets, users, assignTechnician, smartNextCandidate } = useTickets();

  // RF-04: Orden Prioridad (Alta > Media > Baja) y dentro de cada nivel los más antiguos
  const priorityWeight: Record<Priority, number> = {
    alta: 3,
    media: 2,
    baja: 1,
  };

  const sortedPendingTickets = useMemo(() => {
    const pendings = tickets.filter(t => t.estado === 'pendiente');
    return [...pendings].sort((a, b) => {
      const diff = priorityWeight[b.prioridad] - priorityWeight[a.prioridad];
      if (diff !== 0) return diff;
      return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    });
  }, [tickets]);

  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    ticket?.id || sortedPendingTickets[0]?.id || ''
  );
  const [selectedTechId, setSelectedTechId] = useState<string>(
    ticket?.tecnico_id || ''
  );
  const [successMsg, setSuccessMsg] = useState(false);

  React.useEffect(() => {
    if (ticket) {
      setSelectedTicketId(ticket.id);
      setSelectedTechId(ticket.tecnico_id || '');
    } else if (sortedPendingTickets.length > 0) {
      setSelectedTicketId(sortedPendingTickets[0].id);
      setSelectedTechId(sortedPendingTickets[0].tecnico_id || '');
    }
  }, [ticket, sortedPendingTickets]);

  if (!isOpen) return null;

  const technicians = users.filter(u => u.rol === 'tecnico');
  const currentTicket = tickets.find(t => t.id === selectedTicketId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !selectedTechId) return;

    assignTechnician(selectedTicketId, selectedTechId);
    burst(['🎯', '🔧', '✔️']);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#061c47]/70 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#cce4ff] max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh] animate-pop">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#cce4ff] flex items-center justify-between bg-gradient-to-r from-[#0a2463] via-[#0052a5] to-[#0284c7] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <h2 className="text-lg font-black font-display tracking-wide">
                Asignación de Técnicos (RF-04)
              </h2>
              <p className="text-xs text-sky-100 font-medium">
                Ordenado por mayor prioridad y antigüedad de ingreso
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="bg-[#0284c7] text-white text-xs py-2 px-4 text-center font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>¡Técnico asignado exitosamente! Notificación enviada.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto bg-[#f0f7ff]">
          {/* RF-04 Banner */}
          <div className="p-3 bg-white rounded-2xl border border-[#cce4ff] text-xs flex items-start gap-2.5 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
            <div className="text-[#0a2463]">
              <strong className="block font-black text-[#0052a5]">Regla de Despacho RF-04:</strong>
              Los tickets pendientes se priorizan automáticamente: primero <strong>Alta</strong>, luego <strong>Media</strong>, luego <strong>Baja</strong>, y dentro de cada nivel los más antiguos en cola.
            </div>
          </div>

          {/* Ticket Selector */}
          <div>
            <label className="block text-xs font-black text-[#0a2463] mb-1">
              Seleccionar Ticket Pendiente *
            </label>
            <select
              value={selectedTicketId}
              onChange={e => {
                const id = e.target.value;
                setSelectedTicketId(id);
                const t = tickets.find(tk => tk.id === id);
                if (t && t.tecnico_id) setSelectedTechId(t.tecnico_id);
              }}
              className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-[#cce4ff] rounded-2xl focus:border-[#0284c7] focus:outline-none text-[#0a2463] font-bold"
              required
            >
              {sortedPendingTickets.length === 0 ? (
                <option value="">No hay tickets pendientes por asignar</option>
              ) : (
                sortedPendingTickets.map((t, idx) => (
                  <option key={t.id} value={t.id}>
                    {idx === 0 ? '⭐ [PRÓXIMO RECOMENDADO] ' : ''}
                    {t.codigo} · [{t.prioridad.toUpperCase()}] · {t.asunto.slice(0, 35)}... ({new Date(t.fecha).toLocaleDateString('es-ES')})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Selected Ticket Preview */}
          {currentTicket && (
            <div className="p-3.5 bg-white rounded-2xl border border-[#cce4ff] text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#0052a5]">{currentTicket.codigo}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    currentTicket.prioridad === 'alta'
                      ? 'bg-[#0a2463] text-white'
                      : currentTicket.prioridad === 'media'
                      ? 'bg-[#0284c7] text-white'
                      : 'bg-sky-100 text-[#0052a5] border border-sky-300'
                  }`}
                >
                  Prioridad {currentTicket.prioridad}
                </span>
              </div>
              <div className="font-bold text-[#0a2463]">{currentTicket.asunto}</div>
              <div className="text-[11px] text-[#4b6b94] flex items-center justify-between pt-1">
                <span>Solicitado por: <strong>{currentTicket.usuario}</strong></span>
                <span className="font-mono">{new Date(currentTicket.fecha).toLocaleString('es-ES')}</span>
              </div>
            </div>
          )}

          {/* Technicians List */}
          <div>
            <label className="block text-xs font-black text-[#0a2463] mb-1.5">
              Técnico Especialista Responsable *
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {technicians.map(tech => (
                <label
                  key={tech.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedTechId === tech.id
                      ? 'border-[#0284c7] bg-sky-100/70 text-[#0a2463] font-bold'
                      : 'border-[#cce4ff] bg-white hover:bg-sky-50/50 text-[#0a2463]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="technician"
                      value={tech.id}
                      checked={selectedTechId === tech.id}
                      onChange={() => setSelectedTechId(tech.id)}
                      className="text-[#0052a5] focus:ring-[#0284c7]"
                    />
                    <div className="text-xl">{tech.avatarEmoji || '🔧'}</div>
                    <div>
                      <div className="text-xs font-black">{tech.nombre}</div>
                      <div className="text-[10px] text-[#4b6b94]">{tech.cargo}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#0052a5] bg-sky-100 px-2 py-0.5 rounded-full">
                    {tech.ticketsAsignadosCount || 2} activos
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#cce4ff]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#4b6b94] hover:bg-white rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedTechId || !selectedTicketId}
              className="px-5 py-2.5 text-xs font-extrabold text-white bg-[#0052a5] hover:bg-[#0a2463] rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-50 btn-spring flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Confirmar Asignación (RF-04)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
