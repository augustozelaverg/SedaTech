import React from 'react';
import { useTickets } from '../context/TicketContext';
import { TicketStatus } from '../types';
import { Inbox, Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

interface DashboardCardsProps {
  onFilterByStatus?: (status: TicketStatus | 'todos') => void;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ onFilterByStatus }) => {
  const { metrics, filters, setFilters } = useTickets();

  const handleCardClick = (status: TicketStatus | 'todos') => {
    setFilters(prev => ({
      ...prev,
      estado: prev.estado === status ? 'todos' : status,
    }));
    if (onFilterByStatus) {
      onFilterByStatus(status);
    }
  };

  const cards = [
    {
      id: 'total',
      title: 'Total Tickets',
      value: metrics.total,
      subtitle: `${metrics.cancelados} cancelados`,
      statusFilter: 'todos' as const,
      color: 'blue',
      activeBorder: 'border-[#0a2463] bg-[#f0f7ff] ring-2 ring-[#0052a5]/25',
      icon: Inbox,
      iconBg: 'bg-[#0a2463] text-white',
      badge: 'Total general',
      metricPercent: '100%',
    },
    {
      id: 'pendientes',
      title: 'Pendientes',
      value: metrics.pendientes,
      subtitle: 'En espera de asignación TI',
      statusFilter: 'pendiente' as const,
      color: 'sky',
      activeBorder: 'border-[#0ea5e9] bg-sky-50 ring-2 ring-[#0ea5e9]/25',
      icon: Clock,
      iconBg: 'bg-[#0ea5e9] text-white',
      badge: 'Prioridad en cola',
      metricPercent: metrics.total > 0 ? `${Math.round((metrics.pendientes / metrics.total) * 100)}%` : '0%',
    },
    {
      id: 'en_atencion',
      title: 'En Atención',
      value: metrics.en_atencion,
      subtitle: 'Técnicos trabajando activamente',
      statusFilter: 'en_atencion' as const,
      color: 'cobalt',
      activeBorder: 'border-[#0052a5] bg-blue-50 ring-2 ring-[#0052a5]/25',
      icon: PlayCircle,
      iconBg: 'bg-[#0052a5] text-white',
      badge: 'En progreso',
      metricPercent: metrics.total > 0 ? `${Math.round((metrics.en_atencion / metrics.total) * 100)}%` : '0%',
    },
    {
      id: 'resueltos',
      title: 'Resueltos',
      value: metrics.resueltos,
      subtitle: 'Solución técnica documentada',
      statusFilter: 'resuelto' as const,
      color: 'celeste',
      activeBorder: 'border-[#0284c7] bg-sky-50 ring-2 ring-[#0284c7]/25',
      icon: CheckCircle2,
      iconBg: 'bg-[#0284c7] text-white',
      badge: 'Completados',
      metricPercent: metrics.total > 0 ? `${Math.round((metrics.resueltos / metrics.total) * 100)}%` : '0%',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map(card => {
        const IconComponent = card.icon;
        const isSelected = filters.estado === card.statusFilter;

        return (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.statusFilter)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCardClick(card.statusFilter);
              }
            }}
            className={`group relative p-4 sm:p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
              isSelected ? card.activeBorder : 'border-[#cce4ff] hover:border-[#0284c7]'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#4b6b94]">
                {card.title}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg} transition-transform group-hover:scale-105`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-extrabold tracking-tight text-[#0a2463] font-mono tabular-nums">
                {card.value}
              </span>
              <span className="text-xs font-medium text-[#4b6b94] tabular-nums">
                ({card.metricPercent})
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[#4b6b94] mt-2 pt-2 border-t border-sky-100">
              <span className="truncate">{card.subtitle}</span>
              <span className={`text-[11px] font-medium transition-colors ${isSelected ? 'text-[#0052a5] font-bold' : 'group-hover:text-[#0a2463]'}`}>
                {isSelected ? 'Filtrado ✓' : 'Filtrar →'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
