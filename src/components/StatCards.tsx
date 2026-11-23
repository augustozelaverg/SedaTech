import React, { useState, useMemo, useEffect } from 'react';
import { useTickets } from '../context/TicketContext';
import { TicketStatus, Ticket as TicketType, Priority } from '../types';
import {
  Ticket,
  Clock,
  Wrench,
  CheckCircle2,
  XCircle,
  ChevronRight,
  BarChart2,
  X,
  Eye,
  User as UserIcon,
  Computer,
} from 'lucide-react';

interface StatCardsProps {
  onSelectTicket?: (ticket: TicketType) => void;
  onPanelStateChange?: (status: TicketStatus | 'todos' | null) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({
  onSelectTicket,
  onPanelStateChange,
}) => {
  const {
    metrics,
    visibleTicketsForCurrentRole,
    setFilters,
    resetFilters,
    isDashboardBannerVisible,
    setDashboardBannerVisible,
  } = useTickets();
  const [activePanelStatus, setActivePanelStatus] = useState<TicketStatus | 'todos' | null>(null);

  useEffect(() => {
    if (isDashboardBannerVisible) {
      setActivePanelStatus(null);
      resetFilters();
    }
  }, [isDashboardBannerVisible, resetFilters]);

  const handleCardClick = (status: TicketStatus | 'todos') => {
    const next = activePanelStatus === status ? null : status;
    setActivePanelStatus(next);
    onPanelStateChange?.(next);
    if (next === null) {
      resetFilters();
      setDashboardBannerVisible(true);
    } else {
      setDashboardBannerVisible(false);
      setFilters(prevFilters => ({
        ...prevFilters,
        estado: next,
      }));
    }
  };

  const handleClosePanel = () => {
    setActivePanelStatus(null);
    onPanelStateChange?.(null);
    resetFilters();
    setDashboardBannerVisible(true);
  };

  // Paleta SedaTech: Azul, Celeste y Blanco
  const cards = [
    {
      id: 'total',
      title: 'Total de tickets',
      panelTitle: 'Resumen Total de Tickets',
      description: 'Todos los tickets registrados bajo tu perfil en la mesa de servicio.',
      value: metrics.total,
      bg: 'bg-[#0052a5] hover:bg-[#0a2463] text-white border border-[#0052a5]',
      headerBg: 'bg-[#0052a5] text-white',
      panelBorder: 'border-[#0052a5]',
      iconBg: 'bg-white/20 text-white',
      mutedText: 'text-sky-100',
      icon: Ticket,
      rightIcon: BarChart2,
      status: 'todos' as const,
    },
    {
      id: 'pendientes',
      title: 'Pendientes',
      panelTitle: 'Tickets Pendientes de Atención',
      description: 'Solicitudes en espera de asignación o inicio de diagnóstico técnico.',
      value: metrics.pendientes,
      bg: 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white border border-[#38bdf8]',
      headerBg: 'bg-[#0ea5e9] text-white',
      panelBorder: 'border-[#0ea5e9]',
      iconBg: 'bg-white/20 text-white',
      mutedText: 'text-white/95',
      icon: Clock,
      rightIcon: ChevronRight,
      status: 'pendiente' as const,
    },
    {
      id: 'en_atencion',
      title: 'En atención',
      panelTitle: 'Tickets En Atención Activa',
      description: 'Equipos e incidencias actualmente en reparación o diagnóstico.',
      value: metrics.en_atencion,
      bg: 'bg-[#1d4ed8] hover:bg-[#1e40af] text-white border border-[#2563eb]',
      headerBg: 'bg-[#1d4ed8] text-white',
      panelBorder: 'border-[#1d4ed8]',
      iconBg: 'bg-white/20 text-white',
      mutedText: 'text-sky-100',
      icon: Wrench,
      rightIcon: ChevronRight,
      status: 'en_atencion' as const,
    },
    {
      id: 'resueltos',
      title: 'Resueltos',
      panelTitle: 'Tickets Resueltos',
      description: 'Incidencias reparadas y cerradas con solución técnica documentada.',
      value: metrics.resueltos,
      bg: 'bg-[#0284c7] hover:bg-[#0369a1] text-white border border-[#0ea5e9]',
      headerBg: 'bg-[#0284c7] text-white',
      panelBorder: 'border-[#0284c7]',
      iconBg: 'bg-white/20 text-white',
      mutedText: 'text-sky-100',
      icon: CheckCircle2,
      rightIcon: ChevronRight,
      status: 'resuelto' as const,
    },
    {
      id: 'cancelados',
      title: 'Cancelados',
      panelTitle: 'Tickets Cancelados',
      description: 'Solicitudes anuladas con motivo registrado en auditoría.',
      value: metrics.cancelados,
      bg: 'bg-white hover:bg-[#f0f7ff] text-[#0a2463] border-2 border-[#0284c7]',
      headerBg: 'bg-[#0a2463] text-white',
      panelBorder: 'border-[#0284c7]',
      iconBg: 'bg-sky-100 text-[#0052a5]',
      mutedText: 'text-[#0052a5]',
      icon: XCircle,
      rightIcon: ChevronRight,
      status: 'cancelado' as const,
    },
  ];

  const selectedCard = useMemo(
    () => cards.find(c => c.status === activePanelStatus) || null,
    [activePanelStatus, metrics]
  );

  const panelTickets = useMemo(() => {
    if (!activePanelStatus) return [];
    const priorityOrder: Record<Priority, number> = { alta: 3, media: 2, baja: 1 };
    return visibleTicketsForCurrentRole
      .filter(t => (activePanelStatus === 'todos' ? true : t.estado === activePanelStatus))
      .sort((a, b) => {
        const pDiff = priorityOrder[b.prioridad] - priorityOrder[a.prioridad];
        if (pDiff !== 0) return pDiff;
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      });
  }, [activePanelStatus, visibleTicketsForCurrentRole]);

  const countAlta = panelTickets.filter(t => t.prioridad === 'alta').length;
  const countMedia = panelTickets.filter(t => t.prioridad === 'media').length;
  const countBaja = panelTickets.filter(t => t.prioridad === 'baja').length;

  const getPriorityBadge = (priority: Priority) => {
    if (priority === 'alta') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white uppercase">
          Alta
        </span>
      );
    }
    if (priority === 'media') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-yellow-400 text-[#0a2463] uppercase">
          Media
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-green-600 text-white uppercase">
        Baja
      </span>
    );
  };

  const getStatusBadge = (status: TicketStatus) => {
    if (status === 'en_atencion') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#1d4ed8] text-white">
          En atención
        </span>
      );
    }
    if (status === 'resuelto') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#0052a5] text-white">
          Resuelto
        </span>
      );
    }
    if (status === 'pendiente') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#0ea5e9] text-white">
          Pendiente
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white text-[#0a2463] border border-[#0284c7]">
        Cancelado
      </span>
    );
  };

  return (
    <div className="mb-5 select-none space-y-5">
      {/* Botonera de 5 tarjetas métricas táctiles SIEMPRE en la parte superior */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {cards.map(card => {
          const IconComponent = card.icon;
          const RightIcon = card.rightIcon;
          const isSelected = activePanelStatus === card.status;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.status)}
              role="button"
              tabIndex={0}
              data-close-stat-panel={isSelected ? 'true' : undefined}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(card.status);
                }
              }}
              className={`p-4 rounded-3xl ${card.bg} transition-all duration-150 cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between btn-spring min-h-[92px] ${
                isSelected ? 'ring-4 ring-[#0284c7]/45 scale-[1.02]' : ''
              }`}
            >
              {/* Top row with main icon, big value, and right accessory */}
              <div className="flex items-center justify-between mb-1">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                  <IconComponent className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-3xl sm:text-4xl font-black font-display tracking-tight leading-none">
                    {card.value}
                  </span>
                  <RightIcon className={`w-4 h-4 opacity-75 ${card.mutedText}`} />
                </div>
              </div>

              {/* Bottom label */}
              <div className={`text-xs font-black tracking-wide mt-1 ${card.mutedText}`}>
                {card.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Información mostrada DEBAJO de los botones, totalmente extendida y sin div contenedor ni scroll interno */}
      {selectedCard && (
        <>
          <div
            className={`${selectedCard.headerBg} rounded-3xl px-5 py-3.5 flex items-center justify-between flex-wrap gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <selectedCard.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black font-display">
                    {selectedCard.panelTitle}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white/20 text-white">
                    {selectedCard.value} total · {panelTickets.length} detallados
                  </span>
                </div>
                <p className="text-xs text-sky-100 font-medium">{selectedCard.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-red-600 text-white shadow-xs">
                Alta: {countAlta}
              </span>
              <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-yellow-400 text-[#0a2463] shadow-xs">
                Media: {countMedia}
              </span>
              <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-green-600 text-white shadow-xs">
                Baja: {countBaja}
              </span>

              <button
                type="button"
                data-close-stat-panel="true"
                onClick={handleClosePanel}
                className="ml-1 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black flex items-center gap-1 transition-colors cursor-pointer"
                title="Volver al Panel Principal"
              >
                <X className="w-4 h-4" />
                <span>Cerrar</span>
              </button>
            </div>
          </div>

          {panelTickets.length === 0 ? (
            <div className={`p-6 text-center bg-white rounded-3xl border-2 ${selectedCard.panelBorder} shadow-xs`}>
              <p className="text-sm font-black text-[#0a2463]">
                No hay registros activos detallados en estado «{selectedCard.title}»
              </p>
              <p className="text-xs text-[#4b6b94] mt-1">
                El indicador acumula {selectedCard.value} registro(s) histórico(s) en la mesa de servicio.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {panelTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => onSelectTicket?.(ticket)}
                  className={`p-4 rounded-3xl bg-white border-2 ${selectedCard.panelBorder}/40 hover:border-[#0284c7] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2.5`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-black text-[#0052a5] bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                        {ticket.codigo}
                      </span>
                      {getPriorityBadge(ticket.prioridad)}
                      {getStatusBadge(ticket.estado)}
                    </div>

                    <span className="text-[10px] font-mono text-[#4b6b94]">
                      {new Date(ticket.fecha).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-[#0a2463] leading-snug">
                      {ticket.asunto}
                    </h4>
                    <p className="text-xs text-[#4b6b94] mt-1 leading-relaxed">
                      {ticket.descripcion}
                    </p>
                  </div>

                  {ticket.solucion && (
                    <div className="px-3 py-2 rounded-xl bg-sky-50 border border-sky-200 text-xs text-[#0a2463]">
                      <strong className="text-[#0052a5]">Solución:</strong> {ticket.solucion}
                      {ticket.tiempo_resolucion_min ? ` (${ticket.tiempo_resolucion_min} min)` : ''}
                    </div>
                  )}

                  {ticket.cancelado_motivo && (
                    <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0a2463]">
                      <strong>Motivo de cancelación:</strong> {ticket.cancelado_motivo}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#e0f2fe] text-[11px] text-[#4b6b94]">
                    <div className="flex items-center gap-3 min-w-0 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Computer className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
                        <span className="font-semibold text-[#0a2463]">
                          {ticket.equipo_modelo || ticket.categoria}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5 text-[#0052a5] shrink-0" />
                        <span>
                          {ticket.tecnico ? `Téc: ${ticket.tecnico}` : `Sol: ${ticket.usuario}`}
                        </span>
                      </span>
                    </div>

                    {onSelectTicket && (
                      <span className="inline-flex items-center gap-1 font-black text-[#0284c7] shrink-0">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
