import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { Ticket } from '../types';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface ResolveTicketModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ResolveTicketModal: React.FC<ResolveTicketModalProps> = ({
  ticket,
  isOpen,
  onClose,
}) => {
  const { resolveTicket, currentUser } = useTickets();

  const [solucion, setSolucion] = useState('');
  const [tiempoMin, setTiempoMin] = useState(30);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !ticket) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solucion.trim()) {
      setError('Criterio RF-05: El registro de la solución técnica es estrictamente obligatorio para cerrar el ticket.');
      return;
    }

    const success = resolveTicket(ticket.id, solucion, Number(tiempoMin) || 30);
    if (success) {
      setSolucion('');
      setTiempoMin(30);
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#061c47]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-[#cce4ff] max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#cce4ff] flex items-center justify-between bg-gradient-to-r from-[#0a2463] to-[#0284c7] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black">Resolver Ticket: {ticket.codigo}</h2>
              <p className="text-xs text-sky-100">Criterio RF-05: Solución técnica obligatoria</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-sky-50 border border-[#0052a5] text-[#0a2463] text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#0052a5]" />
              <span>{error}</span>
            </div>
          )}

          {/* Ticket preview summary */}
          <div className="p-3.5 rounded-xl bg-[#f0f7ff] border border-[#cce4ff] text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0a2463]">{ticket.asunto}</span>
              <span className="font-mono text-[11px] text-[#0052a5] font-bold uppercase">{ticket.prioridad}</span>
            </div>
            <div className="text-[#4b6b94] text-[11px]">
              Solicitado por <strong className="text-[#0a2463]">{ticket.usuario}</strong> · Técnico asignado:{' '}
              <strong className="text-[#0a2463]">{currentUser.nombre}</strong>
            </div>
          </div>

          {/* Solución técnica (Obligatoria) */}
          <div>
            <label className="block text-xs font-bold text-[#0a2463] mb-1">
              Descripción de la Solución Técnica Aplicada *
            </label>
            <textarea
              rows={4}
              value={solucion}
              onChange={e => {
                setSolucion(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Describa el procedimiento técnico realizado, componentes reemplazados, comandos ejecutados o configuraciones modificadas..."
              className="w-full px-3.5 py-2 text-xs bg-[#f0f7ff] border border-[#cce4ff] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] text-[#0a2463]"
              required
            />
            <p className="text-[11px] text-[#4b6b94] mt-1">
              Este texto se enviará inmediatamente al usuario creador y se grabará en el registro inmutable de auditoría.
            </p>
          </div>

          {/* Tiempo invertido */}
          <div>
            <label className="block text-xs font-bold text-[#0a2463] mb-1">
              Tiempo total invertido (minutos)
            </label>
            <input
              type="number"
              min={5}
              max={600}
              step={5}
              value={tiempoMin}
              onChange={e => setTiempoMin(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs bg-[#f0f7ff] border border-[#cce4ff] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] text-[#0a2463]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#cce4ff]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#4b6b94] hover:text-[#0a2463] hover:bg-[#f0f7ff] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-black text-white bg-[#0284c7] hover:bg-[#0052a5] rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Cerrar Ticket como Resuelto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
