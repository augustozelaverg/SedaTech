import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { Priority, Ticket } from '../types';
import {
  X,
  Check,
  Info,
  ShieldCheck,
  Grid3X3,
  SlidersHorizontal,
} from 'lucide-react';
import { burst } from '../utils/audio';

interface PriorityMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTicket?: Ticket | null;
}

export const PriorityMatrixModal: React.FC<PriorityMatrixModalProps> = ({
  isOpen,
  onClose,
  selectedTicket,
}) => {
  const { tickets, changePriority, assignTechnician, users, currentUser } = useTickets();

  const [activeTab, setActiveTab] = useState<'matrix3x3' | 'editor'>('matrix3x3');
  const [targetTicketId, setTargetTicketId] = useState<string>(selectedTicket?.id || '');
  const [newPriority, setNewPriority] = useState<Priority>(selectedTicket?.prioridad || 'media');
  const [reason, setReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedTicket) {
      setTargetTicketId(selectedTicket.id);
      setNewPriority(selectedTicket.prioridad);
    } else if (tickets.length > 0) {
      setTargetTicketId(tickets[0].id);
      setNewPriority(tickets[0].prioridad);
    }
  }, [selectedTicket, tickets]);

  if (!isOpen) return null;

  // 3x3 Matrix headers with semantic priority colors (Rojo, Amarillo, Verde)
  const urgencyHeaders = [
    { label: 'Alta', sub: 'Atención inmediata sin alternativa.', color: 'text-red-700' },
    { label: 'Media', sub: 'Durante jornada con alternativa limitada.', color: 'text-amber-600' },
    { label: 'Baja', sub: 'Programable sin detener operaciones.', color: 'text-green-700' },
  ];

  const impactRows: {
    impact: string;
    desc: string;
    cells: { prio: Priority; label: string }[];
  }[] = [
    {
      impact: 'Alto',
      desc: 'Interrupción crítica o área completa.',
      cells: [
        { prio: 'alta', label: 'Prioridad Alta' },
        { prio: 'alta', label: 'Prioridad Alta' },
        { prio: 'media', label: 'Prioridad Media' },
      ],
    },
    {
      impact: 'Medio',
      desc: 'Afectación parcial o grupo reducido.',
      cells: [
        { prio: 'alta', label: 'Prioridad Alta' },
        { prio: 'media', label: 'Prioridad Media' },
        { prio: 'baja', label: 'Prioridad Baja' },
      ],
    },
    {
      impact: 'Bajo',
      desc: 'Actividad no crítica de un usuario.',
      cells: [
        { prio: 'media', label: 'Prioridad Media' },
        { prio: 'baja', label: 'Prioridad Baja' },
        { prio: 'baja', label: 'Prioridad Baja' },
      ],
    },
  ];

  const handleApplyMatrixCell = (priority: Priority) => {
    if (!targetTicketId) {
      setToastMessage('Selecciona primero un ticket para asignarle esta prioridad.');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    const t = tickets.find(tk => tk.id === targetTicketId);
    if (!t) return;

    changePriority(targetTicketId, priority, `Ajustado mediante celda de Matriz de Impacto y Urgencia`);
    burst(['✨', '🎯', '✔️']);
    setToastMessage(`¡Prioridad ${priority.toUpperCase()} aplicada a ${t.codigo}!`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleApplySingleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTicketId) return;

    const t = tickets.find(tk => tk.id === targetTicketId);
    changePriority(targetTicketId, newPriority, reason || 'Ajuste operativo desde Matriz');

    burst(['🎉', '✨', '✔️']);
    setToastMessage(`¡Prioridad actualizada para ${t?.codigo || 'ticket'}!`);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#061c47]/70 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-[#cce4ff] max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-pop">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#cce4ff] flex items-center justify-between bg-gradient-to-r from-[#0a2463] via-[#0052a5] to-[#0284c7] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-xs">
              📊
            </div>
            <div>
              <h2 className="text-lg font-black font-display tracking-wide">
                Matriz de Impacto y Urgencia (Sección 5 · RF-03)
              </h2>
              <p className="text-xs text-sky-100 font-medium">
                Criterio oficial SedaTech para priorizar y gobernar los tickets de atención
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-black/20 p-1 rounded-xl flex items-center text-xs">
              <button
                onClick={() => setActiveTab('matrix3x3')}
                className={`px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                  activeTab === 'matrix3x3' ? 'bg-white text-[#0a2463] shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                Matriz 3×3
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                  activeTab === 'editor' ? 'bg-white text-[#0a2463] shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                Reclasificar
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Toast inside modal */}
        {toastMessage && (
          <div className="bg-[#0284c7] text-white text-xs font-black py-2 px-4 text-center flex items-center justify-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-[#f0f7ff]">
          {/* TAB 1: 3x3 Impact / Urgency Matrix from Section 5 */}
          {activeTab === 'matrix3x3' && (
            <div className="space-y-4">
              {/* Ticket selector for quick applying from matrix */}
              <div className="bg-white p-4 rounded-2xl border-2 border-[#cce4ff] flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-[#0a2463]">Ticket a priorizar:</span>
                  <select
                    value={targetTicketId}
                    onChange={e => setTargetTicketId(e.target.value)}
                    className="py-1.5 px-3 bg-[#f0f7ff] border border-[#cce4ff] rounded-xl text-xs font-black text-[#0a2463] focus:outline-none"
                  >
                    {tickets.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.codigo} · {t.asunto.slice(0, 35)}... [{t.prioridad.toUpperCase()}]
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-[11px] text-[#4b6b94] flex items-center gap-1 font-medium">
                  <Info className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>Haz clic en cualquier celda para aplicar la prioridad</span>
                </div>
              </div>

              {/* 3x3 Table matching Section 5 */}
              <div className="overflow-x-auto rounded-2xl border-2 border-[#cce4ff] bg-white shadow-xs">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-[#f0f7ff]">
                      <th className="p-3.5 font-black text-[#0a2463] border-b border-r border-[#cce4ff] w-48">
                        Impacto ↓ / Urgencia →
                      </th>
                      {urgencyHeaders.map((u, idx) => (
                        <th key={idx} className="p-3.5 border-b border-[#cce4ff] text-center w-52">
                          <div className={`font-black text-sm ${u.color}`}>{u.label}</div>
                          <div className="text-[10px] text-[#4b6b94] font-medium leading-tight mt-0.5">
                            {u.sub}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {impactRows.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-[#cce4ff] last:border-b-0">
                        {/* Impact header cell */}
                        <th className="p-3.5 bg-[#f0f7ff]/60 border-r border-[#cce4ff] align-top">
                          <div className="font-black text-[#0a2463] text-sm">{row.impact}</div>
                          <div className="text-[10px] text-[#4b6b94] font-normal leading-tight mt-0.5">
                            {row.desc}
                          </div>
                        </th>

                        {/* 3 Priority Cells */}
                        {row.cells.map((cell, cIdx) => {
                          const isAlta = cell.prio === 'alta';
                          const isMedia = cell.prio === 'media';
                          const bgClass = isAlta
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : isMedia
                            ? 'bg-yellow-400 text-[#0a2463] hover:bg-yellow-300'
                            : 'bg-green-600 text-white hover:bg-green-700';

                          return (
                            <td key={cIdx} className="p-2 text-center align-middle">
                              <button
                                onClick={() => handleApplyMatrixCell(cell.prio)}
                                className={`w-full py-4 px-2 rounded-xl font-black text-xs transition-transform transform active:scale-95 shadow-xs cursor-pointer btn-spring ${bgClass}`}
                                title={`Asignar ${cell.label}`}
                              >
                                <span className="block text-base mb-0.5">
                                  {isAlta ? '🔥' : isMedia ? '⚡' : '🌱'}
                                </span>
                                {cell.label}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Direct Editor */}
          {activeTab === 'editor' && (
            <form onSubmit={handleApplySingleChange} className="max-w-lg mx-auto bg-white p-6 rounded-2xl border-2 border-[#cce4ff] shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-black text-[#0a2463] mb-1">Seleccionar Ticket</label>
                <select
                  value={targetTicketId}
                  onChange={e => {
                    setTargetTicketId(e.target.value);
                    const tk = tickets.find(t => t.id === e.target.value);
                    if (tk) setNewPriority(tk.prioridad);
                  }}
                  className="w-full px-3 py-2 text-xs bg-[#f0f7ff] border border-[#cce4ff] rounded-xl text-[#0a2463] font-bold"
                >
                  {tickets.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.codigo} · {t.asunto.slice(0, 40)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-[#0a2463] mb-1">Nueva Prioridad</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPriority('alta')}
                    className={`py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      newPriority === 'alta' ? 'bg-red-600 text-white shadow-sm' : 'bg-[#f0f7ff] text-[#4b6b94] border border-[#cce4ff] hover:border-red-400'
                    }`}
                  >
                    🔥 Alta
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPriority('media')}
                    className={`py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      newPriority === 'media' ? 'bg-yellow-400 text-[#0a2463] shadow-sm' : 'bg-[#f0f7ff] text-[#4b6b94] border border-[#cce4ff] hover:border-yellow-400'
                    }`}
                  >
                    ⚡ Media
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPriority('baja')}
                    className={`py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      newPriority === 'baja' ? 'bg-green-600 text-white shadow-sm' : 'bg-[#f0f7ff] text-[#4b6b94] border border-[#cce4ff] hover:border-green-400'
                    }`}
                  >
                    🌱 Baja
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#0a2463] mb-1">Motivo o Justificación</label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Ej: Equipo indispensable para atención operativa prioritaria"
                  className="w-full px-3 py-2 text-xs bg-[#f0f7ff] border border-[#cce4ff] rounded-xl text-[#0a2463]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-[#4b6b94] hover:bg-[#f0f7ff] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black text-white bg-[#0052a5] hover:bg-[#0a2463] rounded-xl shadow-md btn-spring cursor-pointer min-h-[44px]"
                >
                  Guardar Prioridad (RF-03)
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#cce4ff] bg-white flex items-center justify-between text-xs text-[#4b6b94]">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
            <span>Matriz integrada con algoritmo de asignación inteligente RF-04</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-black text-[#0052a5] bg-[#f0f7ff] hover:bg-sky-100 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
