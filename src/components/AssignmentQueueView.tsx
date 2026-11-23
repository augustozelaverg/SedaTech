import React from 'react';
import { useTickets } from '../context/TicketContext';
import { Ticket, Priority } from '../types';
import {
  Clock,
  Sparkles,
  UserCheck,
  Grid3X3,
  SlidersHorizontal,
  ArrowUpRight,
  Eye,
  CheckCircle,
} from 'lucide-react';

interface AssignmentQueueViewProps {
  onSelectTicket: (ticket: Ticket) => void;
  onOpenAssignModal: (ticket: Ticket) => void;
  onOpenPriorityModal: (ticket: Ticket) => void;
  onOpenMatrixOnly: () => void;
}

export const AssignmentQueueView: React.FC<AssignmentQueueViewProps> = ({
  onSelectTicket,
  onOpenAssignModal,
  onOpenPriorityModal,
  onOpenMatrixOnly,
}) => {
  const { tickets, smartNextCandidate, users, assignTechnician } = useTickets();

  // RF-04: Orden Prioridad Descendente (Alta > Media > Baja) y Antigüedad Ascendente (más antiguos primero)
  const priorityWeight: Record<Priority, number> = {
    alta: 3,
    media: 2,
    baja: 1,
  };

  const pendingTickets = tickets
    .filter(t => t.estado === 'pendiente')
    .sort((a, b) => {
      const diff = priorityWeight[b.prioridad] - priorityWeight[a.prioridad];
      if (diff !== 0) return diff;
      return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    });

  const technicians = users.filter(u => u.rol === 'tecnico');

  return (
    <div className="space-y-6 animate-in fade-in duration-200 select-none">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#cce4ff] shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0052a5] text-white flex items-center justify-center text-2xl font-black shadow-md shadow-sky-900/20">
            ⏳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-display text-[#0a2463]">
                Cola de Asignación y Despacho Técnico
              </h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-[#0052a5] border border-sky-300">
                Criterio RF-04
              </span>
            </div>
            <p className="text-xs text-[#4b6b94] font-medium mt-0.5">
              Ordenamiento estricto por mayor prioridad y antigüedad de ingreso para reparaciones.
            </p>
          </div>
        </div>

        {/* Action Button: Matriz de Impacto / Urgencia 3x3 (Section 5) */}
        <button
          onClick={onOpenMatrixOnly}
          className="px-5 py-3 bg-[#0284c7] hover:bg-[#0052a5] text-white rounded-2xl text-xs font-black shadow-md btn-spring cursor-pointer flex items-center gap-2 min-h-[44px]"
        >
          <Grid3X3 className="w-4 h-4" />
          <span>Ver Criterios de Prioridad (Matriz 3×3)</span>
        </button>
      </div>

      {/* Suggested next ticket card */}
      {smartNextCandidate && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#0a2463] via-[#0052a5] to-[#0284c7] text-white shadow-xl shadow-sky-900/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
              ⭐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-lg">
                  Siguiente Prioritario Sugerido (RF-04)
                </span>
                <span className="text-xs font-mono font-bold">{smartNextCandidate.codigo}</span>
              </div>
              <h3 className="text-base font-black mt-1 leading-snug">
                {smartNextCandidate.asunto}
              </h3>
              <p className="text-xs text-sky-100 font-medium">
                Equipo: {smartNextCandidate.equipo_modelo} · Prioridad: {smartNextCandidate.prioridad.toUpperCase()} · Cliente: {smartNextCandidate.usuario}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => onOpenAssignModal(smartNextCandidate)}
              className="px-5 py-2.5 bg-white text-[#0a2463] hover:bg-sky-50 rounded-xl text-xs font-black transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 min-h-[44px]"
            >
              <UserCheck className="w-4 h-4 text-[#0284c7]" />
              <span>Asignar Ahora</span>
            </button>
          </div>
        </div>
      )}

      {/* Pending Tickets Table */}
      <div className="bg-white rounded-3xl border-2 border-[#cce4ff] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#cce4ff] flex items-center justify-between">
          <div>
            <h3 className="text-base font-black font-display text-[#0a2463]">
              Tickets Pendientes en Espera ({pendingTickets.length})
            </h3>
            <p className="text-xs text-[#4b6b94] font-medium">
              Orden: 1° Alta → 2° Media → 3° Baja | Dentro de cada nivel: los más antiguos primero
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#cce4ff]">
          {pendingTickets.length === 0 ? (
            <div className="p-12 text-center text-[#4b6b94]">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 text-[#0284c7]" />
              <p className="text-sm font-bold text-[#0a2463]">¡No hay tickets pendientes!</p>
              <p className="text-xs text-[#4b6b94]">Todos los equipos están asignados o resueltos.</p>
            </div>
          ) : (
            pendingTickets.map((ticket, index) => {
              const priorityTheme =
                ticket.prioridad === 'alta'
                  ? {
                      row: 'bg-red-50/90 hover:bg-red-100/75 border-l-[6px] border-l-red-600',
                      indexBadge: 'text-white bg-red-600',
                      codeBadge: 'text-red-900 bg-red-100 border border-red-300',
                      prioPill: 'bg-red-600 text-white',
                      categoryText: 'text-red-800',
                      titleText: 'text-red-950',
                      metaText: 'text-red-900/80',
                      timeText: 'text-red-700',
                      detailBtn: 'border-red-300 hover:border-red-600 text-red-950 bg-white hover:bg-red-50',
                      detailIcon: 'text-red-600',
                      prioBtn: 'bg-red-100 hover:bg-red-200 text-red-950 border-red-300',
                      prioIcon: 'text-red-700',
                      quickAssignBtn: 'bg-red-500 hover:bg-red-600 text-white',
                      otherTechBtn: 'bg-red-700 hover:bg-red-800 text-white',
                    }
                  : ticket.prioridad === 'media'
                  ? {
                      row: 'bg-yellow-50/95 hover:bg-yellow-100/75 border-l-[6px] border-l-yellow-500',
                      indexBadge: 'text-amber-950 bg-yellow-400 border border-amber-400',
                      codeBadge: 'text-amber-950 bg-yellow-100 border border-yellow-300',
                      prioPill: 'bg-yellow-400 text-amber-950 border border-amber-400/70',
                      categoryText: 'text-amber-800',
                      titleText: 'text-amber-950',
                      metaText: 'text-amber-900/85',
                      timeText: 'text-amber-800',
                      detailBtn: 'border-yellow-400 hover:border-amber-600 text-amber-950 bg-white hover:bg-yellow-50',
                      detailIcon: 'text-amber-600',
                      prioBtn: 'bg-yellow-100 hover:bg-yellow-200 text-amber-950 border-yellow-400',
                      prioIcon: 'text-amber-700',
                      quickAssignBtn: 'bg-yellow-400 hover:bg-yellow-500 text-amber-950',
                      otherTechBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
                    }
                  : {
                      row: 'bg-green-50/90 hover:bg-green-100/75 border-l-[6px] border-l-green-600',
                      indexBadge: 'text-white bg-green-600',
                      codeBadge: 'text-green-900 bg-green-100 border border-green-300',
                      prioPill: 'bg-green-600 text-white',
                      categoryText: 'text-green-800',
                      titleText: 'text-green-950',
                      metaText: 'text-green-900/80',
                      timeText: 'text-green-700',
                      detailBtn: 'border-green-300 hover:border-green-600 text-green-950 bg-white hover:bg-green-50',
                      detailIcon: 'text-green-600',
                      prioBtn: 'bg-green-100 hover:bg-green-200 text-green-950 border-green-300',
                      prioIcon: 'text-green-700',
                      quickAssignBtn: 'bg-green-500 hover:bg-green-600 text-white',
                      otherTechBtn: 'bg-green-700 hover:bg-green-800 text-white',
                    };

              return (
                <div
                  key={ticket.id}
                  className={`p-5 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${priorityTheme.row}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`font-mono text-xs font-black px-2 py-0.5 rounded-md ${priorityTheme.indexBadge}`}>
                        #{index + 1}
                      </span>

                      <span className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-lg ${priorityTheme.codeBadge}`}>
                        {ticket.codigo}
                      </span>

                      {/* Priority pill with semantic Rojo/Amarillo/Verde contrast */}
                      <span
                        className={`text-xs font-black px-3 py-0.5 rounded-full ${priorityTheme.prioPill}`}
                      >
                        PRIORIDAD {ticket.prioridad.toUpperCase()}
                      </span>

                      <span className={`text-xs font-semibold ${priorityTheme.categoryText}`}>
                        · {ticket.categoria}
                      </span>
                    </div>

                    <h4 className={`text-sm font-black line-clamp-1 ${priorityTheme.titleText}`}>
                      {ticket.asunto}
                    </h4>

                    <div className={`flex items-center gap-3 text-xs mt-1 flex-wrap ${priorityTheme.metaText}`}>
                      <span>💻 Equipo: <strong>{ticket.equipo_modelo || 'General'}</strong></span>
                      <span>👤 Solicitante: <strong>{ticket.usuario}</strong></span>
                      <span className={`font-mono font-bold ${priorityTheme.timeText}`}>
                        🕒 Esperando desde: {new Date(ticket.fecha).toLocaleString('es-PE')}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons (Touch targets >= 44x44) */}
                  <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end flex-wrap">
                    {/* View Details */}
                    <button
                      onClick={() => onSelectTicket(ticket)}
                      className={`px-3.5 py-2 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px] ${priorityTheme.detailBtn}`}
                      title="Ver detalle del ticket"
                    >
                      <Eye className={`w-4 h-4 ${priorityTheme.detailIcon}`} />
                      <span>Detalle</span>
                    </button>

                    {/* Change Priority */}
                    <button
                      onClick={() => onOpenPriorityModal(ticket)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px] ${priorityTheme.prioBtn}`}
                      title="Ajustar prioridad mediante Matriz (RF-03)"
                    >
                      <SlidersHorizontal className={`w-4 h-4 ${priorityTheme.prioIcon}`} />
                      <span>Prioridad</span>
                    </button>

                    {/* Quick Assign to first available technician with 1-click */}
                    {technicians[0] && (
                      <button
                        onClick={() => assignTechnician(ticket.id, technicians[0].id)}
                        className={`px-4 py-2 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px] ${priorityTheme.quickAssignBtn}`}
                        title={`Asignar a ${technicians[0].nombre} con 1 clic`}
                      >
                        <span>🛠️ Asignar a {technicians[0].nombre}</span>
                      </button>
                    )}

                    {/* Choose technician modal */}
                    <button
                      onClick={() => onOpenAssignModal(ticket)}
                      className={`px-4 py-2 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px] ${priorityTheme.otherTechBtn}`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Otro Técnico</span>
                    </button>
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
