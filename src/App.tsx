import React, { useState, useEffect } from 'react';
import { TicketProvider, useTickets } from './context/TicketContext';
import { Header } from './components/Header';
import { TopNavigationMenu } from './components/TopNavigationMenu';
import { AdaptiveSidebar } from './components/AdaptiveSidebar';
import { LoginPage } from './components/LoginPage';
import { DashboardView } from './components/DashboardView';
import { UserMyTicketsView } from './components/UserMyTicketsView';
import { AssignmentQueueView } from './components/AssignmentQueueView';
import { TechnicianAssignmentsView } from './components/TechnicianAssignmentsView';
import { ReportsView } from './components/ReportsView';
import { StoresAndUsersView } from './components/StoresAndUsersView';
import { AcceptanceTestsView } from './components/AcceptanceTestsView';
import { ConfigView } from './components/ConfigView';
import { CreateTicketModal } from './components/CreateTicketModal';
import { ResolveTicketModal } from './components/ResolveTicketModal';
import { CancelTicketModal } from './components/CancelTicketModal';
import { PriorityMatrixModal } from './components/PriorityMatrixModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { AssignTechnicianModal } from './components/AssignTechnicianModal';
import { Ticket } from './types';
import { playClickSound, burst } from './utils/audio';
import { postNativeMessage } from './utils/nativeHost';
import { Vergaray } from './core/engineSignature';

function AugustoCoreShell() {
  const {
    activeScreen,
    setActiveScreen,
    currentUser,
    smartNextCandidate,
    isLoggedIn,
    logout,
    windowSimulationWidth,
    density,
  } = useTickets();

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Floating top navigation menu state (triggered by centered triangle)
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Active ticket for row actions
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Global button click audio & escape key handler
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest('button')) {
        playClickSound();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTopMenuOpen(false);
        setIsCreateModalOpen(false);
        setIsResolveModalOpen(false);
        setIsCancelModalOpen(false);
        setIsPriorityModalOpen(false);
        setIsAssignModalOpen(false);
        setIsDetailModalOpen(false);
      }
      // Press 'm' or 'M' to toggle menu
      if ((e.key === 'm' || e.key === 'M') && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        setIsTopMenuOpen(prev => !prev);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Synchronize native Windows frameless splash window <-> full desktop app window
  const hasMountedAuthRef = React.useRef(false);
  useEffect(() => {
    if (!hasMountedAuthRef.current) {
      hasMountedAuthRef.current = true;
      return;
    }
    postNativeMessage({
      type: isLoggedIn ? Vergaray.commands.loginSuccess : Vergaray.commands.logout,
    });
  }, [isLoggedIn]);

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  const handleOpenResolveModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsResolveModalOpen(true);
  };

  const handleOpenAssignModal = (ticket?: Ticket) => {
    setSelectedTicket(ticket || null);
    setIsAssignModalOpen(true);
  };

  const handleOpenCancelModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsCancelModalOpen(true);
  };

  const handleOpenPriorityModal = (ticket?: Ticket) => {
    setSelectedTicket(ticket || null);
    setIsPriorityModalOpen(true);
  };

  if (!isLoggedIn) {
    return <LoginPage onSuccessLogin={() => setIsTopMenuOpen(false)} />;
  }

  const simulationMaxWidth =
    windowSimulationWidth === '720'
      ? 'max-w-[720px]'
      : windowSimulationWidth === '900'
      ? 'max-w-[900px]'
      : windowSimulationWidth === '1280'
      ? 'max-w-[1280px]'
      : windowSimulationWidth === '1366'
      ? 'max-w-[1366px]'
      : 'w-full';

  return (
    <div
      className={`min-h-screen bg-[#f0f7ff] text-[#0a2463] flex flex-col font-sans select-none overflow-x-hidden ${
        windowSimulationWidth !== 'auto' ? 'py-4 bg-[#0a2463]/10' : ''
      }`}
    >
      <div
        className={`${simulationMaxWidth} mx-auto w-full min-h-screen bg-[#f0f7ff] flex flex-col shadow-2xl transition-all duration-300 relative border-x border-[#cce4ff]`}
      >
        {/* Persistent Header: Brand, store badge, centered triangle trigger, connection & user */}
        <Header
          isMenuOpen={isTopMenuOpen}
          onToggleMenu={() => setIsTopMenuOpen(prev => !prev)}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenPriorityModal={() => handleOpenPriorityModal()}
        />

        {/* Floating touch grid navigation menu triggered by the centered top triangle */}
        <TopNavigationMenu
          isOpen={isTopMenuOpen}
          onClose={() => setIsTopMenuOpen(false)}
          onOpenCreateTicket={() => setIsCreateModalOpen(true)}
          onOpenPriorityMatrix={() => handleOpenPriorityModal()}
        />

        {/* Desktop Container with AdaptiveSidebar + Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Adaptive Sidebar Dock for Windows (Wide, Medium, and Compact breakpoints) */}
          <AdaptiveSidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
            onOpenCreateTicket={() => setIsCreateModalOpen(true)}
            onOpenPriorityMatrix={() => handleOpenPriorityModal()}
            onLogout={logout}
          />

          {/* Main Workspace */}
          <main className={`flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto max-w-full ${density === 'compacta' ? 'scale-95 origin-top' : ''}`}>
        {/* SCREEN 1: Inicio / Dashboard (Administrador) */}
        {activeScreen === 'dashboard' && (
          <DashboardView
            onSelectTicket={handleSelectTicket}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenAssignModal={handleOpenAssignModal}
            onOpenPriorityModal={handleOpenPriorityModal}
            onOpenResolveModal={handleOpenResolveModal}
            onOpenCancelModal={handleOpenCancelModal}
          />
        )}

        {/* SCREEN 2: Mis Tickets (Usuario) */}
        {activeScreen === 'mis_tickets' && (
          <UserMyTicketsView
            onSelectTicket={handleSelectTicket}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenCancelModal={handleOpenCancelModal}
          />
        )}

        {/* SCREEN 3: Cola de Asignación (Administrador - RF-04) */}
        {activeScreen === 'cola_asignacion' && (
          <AssignmentQueueView
            onSelectTicket={handleSelectTicket}
            onOpenAssignModal={handleOpenAssignModal}
            onOpenPriorityModal={handleOpenPriorityModal}
            onOpenMatrixOnly={() => handleOpenPriorityModal()}
          />
        )}

        {/* SCREEN 4: Mis Asignaciones (Técnico - RF-05, RF-06) */}
        {activeScreen === 'mis_asignaciones' && (
          <TechnicianAssignmentsView
            onSelectTicket={handleSelectTicket}
            onOpenResolveModal={handleOpenResolveModal}
          />
        )}

        {/* SCREEN 5: Reportes y Exportación CSV (Administrador - RF-09, RNF-06) */}
        {activeScreen === 'reportes' && <ReportsView />}

        {/* SCREEN 6: Gestión de Usuarios (Exclusivo Administrador - RNF-04) */}
        {activeScreen === 'usuarios' && currentUser.rol === 'administrador' && <StoresAndUsersView />}

        {/* SCREEN 7: Pruebas de Aceptación (PA-01 a PA-10) */}
        {activeScreen === 'pruebas_aceptacion' && <AcceptanceTestsView />}

        {/* SCREEN 8: Configuración & Entorno de Sistema */}
        {activeScreen === 'configuracion' && <ConfigView />}
      </main>
    </div>
  </div>

      {/* Floating Action Button (FAB) for quick mobile action */}
      {currentUser.rol === 'usuario' && (
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed right-5 bottom-5 z-40 px-5 py-3.5 bg-[#0284c7] hover:bg-[#0052a5] text-white rounded-full font-black text-xs shadow-2xl btn-spring flex items-center gap-2 cursor-pointer min-h-[44px] border-2 border-white/80"
        >
          <span>➕</span>
          <span>Nuevo Ticket</span>
        </button>
      )}

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ResolveTicketModal
        ticket={selectedTicket}
        isOpen={isResolveModalOpen}
        onClose={() => {
          setIsResolveModalOpen(false);
          setSelectedTicket(null);
        }}
      />

      <CancelTicketModal
        ticket={selectedTicket}
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedTicket(null);
        }}
      />

      <AssignTechnicianModal
        ticket={selectedTicket}
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedTicket(null);
        }}
      />

      <PriorityMatrixModal
        selectedTicket={selectedTicket}
        isOpen={isPriorityModalOpen}
        onClose={() => {
          setIsPriorityModalOpen(false);
          setSelectedTicket(null);
        }}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTicket(null);
        }}
        onOpenResolveModal={handleOpenResolveModal}
        onOpenCancelModal={handleOpenCancelModal}
      />
    </div>
  );
}

export default function App() {
  return (
    <TicketProvider>
      <AugustoCoreShell />
    </TicketProvider>
  );
}
