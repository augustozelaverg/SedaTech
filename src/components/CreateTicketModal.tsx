import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { Priority } from '../types';
import { CATEGORIES_CONFIG } from '../data/seedData';
import { X, Sparkles, AlertCircle, Computer } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose }) => {
  const { createTicket, currentUser } = useTickets();

  const [asunto, setAsunto] = useState('');
  const [equipoModelo, setEquipoModelo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<string>('Hardware');
  const [prioridad, setPrioridad] = useState<Priority>('media');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asunto.trim()) {
      setError('Por favor indica el problema principal o asunto.');
      return;
    }
    if (!descripcion.trim()) {
      setError('Cuéntanos qué falló en el equipo y desde cuándo.');
      return;
    }

    createTicket({
      asunto,
      equipo_modelo: equipoModelo || 'Equipo de cómputo general',
      descripcion,
      categoria,
      prioridad,
    });

    setAsunto('');
    setEquipoModelo('');
    setDescripcion('');
    setPrioridad('media');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#061c47]/70 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-[#cce4ff] max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh] animate-pop">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#cce4ff] flex items-center justify-between bg-gradient-to-r from-[#0a2463] via-[#0052a5] to-[#0284c7] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-xs">
              💻
            </div>
            <div>
              <h2 className="text-lg font-black font-display tracking-wide">
                Registrar Equipo a Reparar (RF-02)
              </h2>
              <p className="text-xs text-sky-100 font-medium">
                Genera código único TK-2026-XXX y estado «Pendiente»
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto bg-[#f0f7ff]">
          {error && (
            <div className="p-3 rounded-2xl bg-sky-100 border border-[#0052a5] text-[#0a2463] text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#0052a5]" />
              <span>{error}</span>
            </div>
          )}

          {/* User & Institution info strip */}
          <div className="p-3 rounded-2xl bg-white border border-[#cce4ff] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{currentUser.avatarEmoji || '🧑‍💻'}</span>
              <div>
                <span className="text-[10px] text-[#4b6b94] block font-bold">Usuario solicitante:</span>
                <strong className="text-[#0a2463]">{currentUser.nombre}</strong>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#4b6b94] block font-bold">Sistema:</span>
              <strong className="text-[#0052a5]">SedaTech · Gestión de Tickets</strong>
            </div>
          </div>

          {/* Equipo / Modelo */}
          <div>
            <label className="block text-xs font-black text-[#0a2463] mb-1">
              Marca y Modelo del Equipo *
            </label>
            <input
              type="text"
              value={equipoModelo}
              onChange={e => setEquipoModelo(e.target.value)}
              placeholder="Ej: Laptop ASUS ROG Strix G15 / PC Workstation"
              className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-[#cce4ff] rounded-2xl focus:border-[#0284c7] focus:outline-none text-[#0a2463] font-semibold placeholder:text-[#4b6b94]/60"
            />
          </div>

          {/* Asunto */}
          <div>
            <label className="block text-xs font-black text-[#0a2463] mb-1">
              Falla o Asunto Principal *
            </label>
            <input
              type="text"
              maxLength={90}
              value={asunto}
              onChange={e => setAsunto(e.target.value)}
              placeholder="Ej: No enciende - LED de carga parpadea"
              className="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-[#cce4ff] rounded-2xl focus:border-[#0284c7] focus:outline-none text-[#0a2463] font-semibold placeholder:text-[#4b6b94]/60"
              required
            />
          </div>

          {/* Categoría Chips */}
          <div>
            <label className="block text-xs font-black text-[#0a2463] mb-1.5">
              Categoría de Reparación *
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(CATEGORIES_CONFIG).map(([catName, catEmoji]) => {
                const isSelected = categoria === catName;
                return (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => {
                      setCategoria(catName);
                      playClickSound();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 btn-spring ${
                      isSelected
                        ? 'bg-[#0284c7] text-white shadow-sm'
                        : 'bg-white text-[#0a2463] border-2 border-[#cce4ff] hover:border-[#0284c7]'
                    }`}
                  >
                    <span>{catEmoji}</span>
                    <span>{catName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prioridad Inicial */}
          <div>
            <label className="block text-xs font-black text-[#0a2463] mb-1.5">
              Prioridad Solicitada
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPrioridad('alta')}
                className={`py-2 px-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                  prioridad === 'alta'
                    ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-600/30'
                    : 'bg-white text-[#4b6b94] border-2 border-[#cce4ff] hover:border-red-400'
                }`}
              >
                🔥 Alta
              </button>
              <button
                type="button"
                onClick={() => setPrioridad('media')}
                className={`py-2 px-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                  prioridad === 'media'
                    ? 'bg-yellow-400 text-[#0a2463] shadow-sm ring-2 ring-yellow-400/50'
                    : 'bg-white text-[#4b6b94] border-2 border-[#cce4ff] hover:border-yellow-400'
                }`}
              >
                ⚡ Media
              </button>
              <button
                type="button"
                onClick={() => setPrioridad('baja')}
                className={`py-2 px-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                  prioridad === 'baja'
                    ? 'bg-green-600 text-white shadow-sm ring-2 ring-green-600/30'
                    : 'bg-white text-[#4b6b94] border-2 border-[#cce4ff] hover:border-green-400'
                }`}
              >
                🌱 Baja
              </button>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-black text-[#0a2463] mb-1">
              Descripción de la Falla y Síntomas *
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Cuéntanos qué le pasó al equipo, ruidos, caídas, líquidos o mensajes de error..."
              className="w-full px-3.5 py-2 text-xs bg-white border-2 border-[#cce4ff] rounded-2xl focus:border-[#0284c7] focus:outline-none text-[#0a2463] placeholder:text-[#4b6b94]/60 font-medium"
              required
            />
          </div>

          {/* Submit buttons */}
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
              className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#0052a5] hover:bg-[#0a2463] rounded-2xl shadow-md btn-spring cursor-pointer flex items-center gap-1.5 min-h-[44px]"
            >
              <span>🚀</span>
              <span>Registrar Ticket (RF-02)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
