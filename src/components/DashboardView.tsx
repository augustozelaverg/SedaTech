import React, { useState, useEffect } from 'react';
import { useTickets } from '../context/TicketContext';
import { BannerHero } from './BannerHero';
import { StatCards } from './StatCards';
import { MiddleChartsAndActions } from './MiddleChartsAndActions';
import { TicketFilters } from './TicketFilters';
import { TicketTable } from './TicketTable';
import { Ticket, TicketStatus } from '../types';

interface DashboardViewProps {
  onSelectTicket: (ticket: Ticket) => void;
  onOpenCreateModal: () => void;
  onOpenAssignModal: (ticket?: Ticket) => void;
  onOpenPriorityModal: (ticket?: Ticket) => void;
  onOpenResolveModal: (ticket: Ticket) => void;
  onOpenCancelModal: (ticket: Ticket) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTicket,
  onOpenCreateModal,
  onOpenAssignModal,
  onOpenPriorityModal,
  onOpenResolveModal,
  onOpenCancelModal,
}) => {
  const { isDashboardBannerVisible, setDashboardBannerVisible } = useTickets();
  const [activeStatPanel, setActiveStatPanel] = useState<TicketStatus | 'todos' | null>(null);

  useEffect(() => {
    if (isDashboardBannerVisible) {
      setActiveStatPanel(null);
    }
  }, [isDashboardBannerVisible]);

  const handleDashboardClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('[data-close-stat-panel="true"]')) {
      return;
    }
    if (target?.closest('button, [role="button"]')) {
      setDashboardBannerVisible(false);
    }
  };

  const handleDashboardKeyDownCapture = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-close-stat-panel="true"]')) {
        return;
      }
      if (target?.closest('button, [role="button"]')) {
        setDashboardBannerVisible(false);
      }
    }
  };

  return (
    <div
      onClickCapture={handleDashboardClickCapture}
      onKeyDownCapture={handleDashboardKeyDownCapture}
      className="space-y-5 animate-in fade-in duration-200"
    >
      {/* Banner de Bienvenida con temática de reparación de computadoras */}
      <BannerHero />

      {/* 5 Tarjetas métricas táctiles en la parte superior + su panel informativo debajo */}
      <StatCards
        onSelectTicket={onSelectTicket}
        onPanelStateChange={setActiveStatPanel}
      />

      {/* Ocultar el resto del dashboard cuando una tarjeta métrica está seleccionada */}
      {activeStatPanel === null && (
        <>
          {/* Gráficos de Estado, Prioridad y Acciones Rápidas */}
          <MiddleChartsAndActions
            onOpenCreateModal={onOpenCreateModal}
            onOpenAssignModal={() => onOpenAssignModal()}
            onOpenCriteriaModal={() => onOpenPriorityModal()}
          />

          {/* Barra de filtros y tabla: ocultas en vista inicial de Panel Principal */}
          {!isDashboardBannerVisible && (
            <>
              <TicketFilters />

              <TicketTable
                onSelectTicket={onSelectTicket}
                onOpenResolveModal={onOpenResolveModal}
                onOpenAssignModal={onOpenAssignModal}
                onOpenCancelModal={onOpenCancelModal}
                onOpenPriorityModal={onOpenPriorityModal}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};
