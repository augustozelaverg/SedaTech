/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AdaptiveSidebar.tsx
 * Barra lateral adaptable para escritorio Windows
 * Breakpoints: Amplio (>= 1280px), Mediano (900-1279px), Compacto (< 900px)
 */

import React from 'react';
import { useTickets } from '../context/TicketContext';
import { AppScreen } from '../types';
import {
  LayoutDashboard,
  Ticket as TicketIcon,
  PlusCircle,
  ListOrdered,
  Wrench,
  FileSpreadsheet,
  Users,
  CheckSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  Bell,
} from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface AdaptiveSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCreateTicket: () => void;
  onOpenPriorityMatrix: () => void;
  onLogout?: () => void;
}

export const AdaptiveSidebar: React.FC<AdaptiveSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onOpenCreateTicket,
  onOpenPriorityMatrix,
  onLogout,
}) => {
  const {
    activeScreen,
    setActiveScreen,
    currentUser,
    unreadNotificationsCount,
    smartNextCandidate,
  } = useTickets();

  interface NavItem {
    id: AppScreen;
    label: string;
    icon: React.ReactNode;
    color: string;
    roles: ('administrador' | 'tecnico' | 'usuario')[];
    badge?: number | string | null;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      icon: <LayoutDashboard className="w-5 h-5" />,
      color: 'bg-[#0a2463]',
      roles: ['administrador'],
    },
    {
      id: 'mis_tickets',
      label: 'Mis Tickets',
      icon: <TicketIcon className="w-5 h-5" />,
      color: 'bg-[#0284c7]',
      roles: ['usuario'],
    },
    {
      id: 'cola_asignacion',
      label: 'Cola Asignación',
      icon: <ListOrdered className="w-5 h-5" />,
      color: 'bg-[#0ea5e9]',
      roles: ['administrador'],
      badge: smartNextCandidate ? '1 Urgente' : null,
    },
    {
      id: 'mis_asignaciones',
      label: 'Mis Asignaciones',
      icon: <Wrench className="w-5 h-5" />,
      color: 'bg-[#0052a5]',
      roles: ['tecnico'],
    },
    {
      id: 'reportes',
      label: 'Reportes & CSV',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      color: 'bg-[#1d4ed8]',
      roles: ['administrador'],
    },
    {
      id: 'usuarios',
      label: 'Gestión de Usuarios',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-[#0052a5]',
      roles: ['administrador'],
    },
    {
      id: 'pruebas_aceptacion',
      label: 'Pruebas PA-01/10',
      icon: <CheckSquare className="w-5 h-5" />,
      color: 'bg-[#0284c7]',
      roles: ['administrador', 'tecnico', 'usuario'],
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: <Settings className="w-5 h-5" />,
      color: 'bg-[#3b6ca8]',
      roles: ['administrador', 'tecnico', 'usuario'],
    },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(currentUser.rol));

  return (
    <aside
      className={`transition-all duration-300 ease-in-out bg-white border-r-2 border-[#cce4ff] flex flex-col justify-between shrink-0 select-none z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top: Nav list */}
      <div className="p-3 space-y-2">
        {/* Brand in Sidebar */}
        <div className="flex items-center justify-between px-1 mb-2">
          {!isCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <img src="./LOGOTIPO%20SEDATECH.png" alt="Logotipo SedaTech" className="h-6 w-auto max-w-[85px] object-contain" />
              <span className="font-display font-black text-xs text-[#0a2463] tracking-tight">SedaTech</span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl hover:bg-[#f0f7ff] text-[#4b6b94] hover:text-[#0052a5] transition-colors cursor-pointer ml-auto"
            title={isCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Action Button */}
        {currentUser.rol === 'usuario' ? (
          <button
            onClick={onOpenCreateTicket}
            className={`w-full py-3 px-3 rounded-2xl bg-gradient-to-r from-[#0284c7] to-[#0052a5] text-white font-black text-xs shadow-md shadow-sky-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer btn-spring min-h-[44px] ${
              isCollapsed ? 'px-0' : ''
            }`}
            title="Registrar Nuevo Ticket (RF-02)"
          >
            <PlusCircle className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="truncate">Nuevo Ticket</span>}
          </button>
        ) : (
          <button
            onClick={onOpenPriorityMatrix}
            className={`w-full py-3 px-3 rounded-2xl bg-gradient-to-r from-[#0a2463] via-[#0052a5] to-[#0284c7] text-white font-black text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer btn-spring min-h-[44px] ${
              isCollapsed ? 'px-0' : ''
            }`}
            title="Abrir Matriz de Impacto y Urgencia (RF-03)"
          >
            <Sparkles className="w-5 h-5 shrink-0 text-sky-300" />
            {!isCollapsed && <span className="truncate">Matriz Prioridad</span>}
          </button>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1.5 pt-2">
          {visibleItems.map(item => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playClickSound();
                  setActiveScreen(item.id);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl font-black text-xs transition-all duration-150 cursor-pointer min-h-[44px] group relative ${
                  isActive
                    ? 'bg-[#f0f7ff] text-[#0052a5] shadow-xs border border-[#0284c7]/30 font-black'
                    : 'text-[#4b6b94] hover:bg-[#f0f7ff]/70 hover:text-[#0a2463]'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
                    item.color
                  }`}
                >
                  {item.icon}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 text-left flex items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#0284c7] text-white shrink-0 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {isActive && (
                  <div className="absolute right-1 top-2 bottom-2 w-1.5 rounded-full bg-[#0284c7]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile and Logout Pill */}
      <div className="p-3 border-t border-[#cce4ff] space-y-2">
        <div
          className={`p-2.5 rounded-2xl bg-[#f0f7ff] border border-[#cce4ff] flex items-center gap-2.5 ${
            isCollapsed ? 'justify-center p-2' : ''
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-base shrink-0 shadow-xs ${currentUser.avatarColor}`}
          >
            {currentUser.avatarEmoji || '👤'}
          </div>

          {!isCollapsed && (
            <div className="flex-1 truncate">
              <strong className="text-xs font-black text-[#0a2463] block leading-tight truncate">
                {currentUser.nombre}
              </strong>
              <span className="text-[10px] font-bold text-[#4b6b94] uppercase tracking-wide block leading-none mt-0.5">
                {currentUser.rol}
              </span>
            </div>
          )}
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className={`w-full py-2 px-3 rounded-xl hover:bg-[#f0f7ff] text-[#4b6b94] hover:text-[#0a2463] text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        )}
      </div>
    </aside>
  );
};
