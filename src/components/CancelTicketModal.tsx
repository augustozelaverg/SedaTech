import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { Ticket } from '../types';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';

interface CancelTicketModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CancelTicketModal: React.FC<CancelTicketModalProps> = ({
  ticket,
  isOpen,
  onClose,
}) => {
  const { cancelTicket, currentUser } = useTickets();

  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !ticket) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) {
      setError('Por favor detalle el motivo de la cancelación para el registro de auditoría.');
      return;
    }

    const res = cancelTicket(ticket.id, motivo);
    if (!res.success) {
      setError(res.error || 'No se pudo cancelar el ticket.');
      return;
    }

    setMotivo('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#061c47]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-[#cce4ff] max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#cce4ff] flex items-center justify-between bg-[#0a2463] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black">Cancelar Solicitud: {ticket.codigo}</h2>
              <p className="text-xs text-sky-200">Criterio RF-07: Preserva registro inmutable</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-sky-50 border border-[#0052a5] text-[#0a2463] text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#0052a5]" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-[#f0f7ff] border border-[#cce4ff] text-xs text-[#4b6b94]">
            <p className="font-bold text-[#0a2463] mb-1">{ticket.asunto}</p>
            <p className="text-[11px] text-[#4b6b94]">
              Creado por <strong className="text-[#0a2463]">{ticket.usuario}</strong> el{' '}
              {new Date(ticket.fecha).toLocaleDateString('es-ES')}.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0a2463] mb-1">
              Motivo de la cancelación *
            </label>
            <textarea
              rows={3}
              value={motivo}
              onChange={e => {
                setMotivo(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ej: El requerimiento fue atendido localmente o ya no es necesario..."
              className="w-full px-3.5 py-2 text-xs bg-[#f0f7ff] border border-[#cce4ff] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] text-[#0a2463]"
              required
            />
            <p className="text-[11px] text-[#4b6b94] mt-1">
              Conforme a RF-07, el ticket no se borra de la base de datos; queda registrado permanentemente como cancelado en el libro de auditoría.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#cce4ff]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#4b6b94] hover:text-[#0a2463] hover:bg-[#f0f7ff] rounded-xl transition-colors cursor-pointer"
            >
              Mantener Ticket
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-black text-white bg-[#0a2463] hover:bg-[#0052a5] rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Confirmar Cancelación (RF-07)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
