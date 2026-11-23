import React, { useEffect, useRef } from 'react';
import { useTickets } from '../context/TicketContext';
import { AppScreen } from '../types';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Clock,
  Wrench,
  BarChart3,
  Users,
  Grid3X3,
  CheckCheck,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';

interface TopNavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateTicket: () => void;
  onOpenPriorityMatrix: () => void;
}

export const TopNavigationMenu: React.FC<TopNavigationMenuProps> = ({
  isOpen,
  onClose,
  onOpenCreateTicket,
  onOpenPriorityMatrix,
}) => {
  const { activeScreen, setActiveScreen, currentUser, smartNextCandidate } = useTickets();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  interface MenuItem {
    id: AppScreen | 'action_create' | 'action_matrix';
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    colorBg: string;
    colorText: string;
    roles: ('administrador' | 'tecnico' | 'usuario')[];
    badge?: string | number | null;
    action?: () => void;
  }

  const items: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Inicio / Dashboard',
      sublabel: 'Resumen, métricas y filtros',
      icon: LayoutDashboard,
      colorBg: 'bg-[#0a2463]',
      colorText: 'text-white',
      roles: ['administrador'],
    },
    {
      id: 'mis_tickets',
      label: 'Mis Tickets',
      sublabel: 'Mis reparaciones y estados',
      icon: Ticket,
      colorBg: 'bg-[#0052a5]',
      colorText: 'text-white',
      roles: ['usuario'],
    },
    {
      id: 'action_create',
      label: 'Nuevo Ticket',
      sublabel: 'Registrar equipo a reparar',
      icon: PlusCircle,
      colorBg: 'bg-[#0284c7]',
      colorText: 'text-white',
      roles: ['usuario', 'administrador'],
      action: () => {
        onClose();
        onOpenCreateTicket();
      },
    },
    {
      id: 'cola_asignacion',
      label: 'Cola de Asignación',
      sublabel: 'Orden por prioridad y antigüedad',
      icon: Clock,
      colorBg: 'bg-[#0ea5e9]',
      colorText: 'text-white',
      roles: ['administrador'],
      badge: smartNextCandidate ? '1 Prioritario' : null,
    },
    {
      id: 'mis_asignaciones',
      label: 'Mis Asignaciones',
      sublabel: 'Reparaciones asignadas a mí',
      icon: Wrench,
      colorBg: 'bg-[#0052a5]',
      colorText: 'text-white',
      roles: ['tecnico'],
    },
    {
      id: 'action_matrix',
      label: 'Matriz de Prioridad',
      sublabel: 'Cuadro 3×3 impacto/urgencia',
      icon: Grid3X3,
      colorBg: 'bg-[#1d4ed8]',
      colorText: 'text-white',
      roles: ['administrador', 'tecnico'],
      action: () => {
        onClose();
        onOpenPriorityMatrix();
      },
    },
    {
      id: 'reportes',
      label: 'Reportes y CSV',
      sublabel: 'Auditoría y exportación',
      icon: BarChart3,
      colorBg: 'bg-[#0284c7]',
      colorText: 'text-white',
      roles: ['administrador'],
    },
    {
      id: 'usuarios',
      label: 'Gestión de Usuarios',
      sublabel: 'Roles y cuentas de acceso',
      icon: Users,
      colorBg: 'bg-[#0052a5]',
      colorText: 'text-white',
      roles: ['administrador'],
    },
    {
      id: 'pruebas_aceptacion',
      label: 'Pruebas de Aceptación',
      sublabel: 'Validación PA-01 a PA-10',
      icon: CheckCheck,
      colorBg: 'bg-[#0ea5e9]',
      colorText: 'text-white',
      roles: ['administrador', 'tecnico', 'usuario'],
      badge: '10 Tests',
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      sublabel: 'Preferencias y conexión',
      icon: Settings,
      colorBg: 'bg-[#3b6ca8]',
      colorText: 'text-white',
      roles: ['administrador', 'tecnico', 'usuario'],
    },
  ];

  const authorizedItems = items.filter(item => item.roles.includes(currentUser.rol));

  const handleSelect = (item: MenuItem) => {
    if (item.action) {
      item.action();
    } else {
      setActiveScreen(item.id as AppScreen);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#061c47]/60 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        ref={menuRef}
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-2 border-[#cce4ff] overflow-hidden animate-pop"
      >
        {/* Header bar of floating menu */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0a2463] via-[#0052a5] to-[#0284c7] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-xs">
              📱
            </div>
            <div>
              <h2 className="text-base font-black font-display tracking-wide flex items-center gap-2">
                <span>Navegación Táctil SedaTech</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Gestión de Tickets</span>
              </h2>
              <p className="text-xs text-sky-100 font-medium">
                Módulos autorizados para <strong className="text-white uppercase">{currentUser.nombre}</strong> ({currentUser.rol})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[11px] font-mono bg-white/15 px-2.5 py-1 rounded-xl text-white">
              Presiona [Esc] para cerrar
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              title="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grid of big tactile rounded cards */}
        <div className="p-6 bg-[#f0f7ff] max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {authorizedItems.map(item => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`p-4 rounded-3xl text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 border-2 btn-spring min-h-[105px] relative group ${
                    isActive
                      ? 'border-[#0284c7] bg-white shadow-lg shadow-sky-500/15 ring-2 ring-[#0284c7]/25'
                      : 'border-[#cce4ff] bg-white hover:border-[#0284c7] hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl ${item.colorBg} flex items-center justify-center text-white shadow-sm`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {item.badge && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#0a2463] text-white">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-[#0a2463] font-display leading-tight group-hover:text-[#0284c7] transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-[11px] text-[#4b6b94] font-medium leading-snug line-clamp-1 mt-0.5">
                      {item.sublabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer tip */}
        <div className="px-6 py-3 bg-white border-t border-[#cce4ff] flex items-center justify-between text-xs text-[#4b6b94]">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-4 h-4 text-[#0284c7]" />
            <span>Navegación SedaTech · Sistema de Gestión de Tickets</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-black text-[#0052a5] hover:bg-[#f0f7ff] rounded-xl transition-colors cursor-pointer"
          >
            Volver a la vista
          </button>
        </div>
      </div>
    </div>
  );
};
