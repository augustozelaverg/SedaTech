import React, { useState, useRef, useEffect } from 'react';
import { useTickets } from '../context/TicketContext';
import {
  Bell,
  ChevronDown,
  Volume2,
  VolumeX,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  Settings,
  Monitor,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onOpenCreateModal: () => void;
  onOpenPriorityModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMenuOpen,
  onToggleMenu,
}) => {
  const {
    currentUser,
    notifications,
    markAllNotificationsRead,
    unreadNotificationsCount,
    soundEnabled,
    toggleSound,
    connectionStatus,
    toggleConnectionStatus,
    logout,
    windowSimulationWidth,
    setWindowSimulationWidth,
    density,
    toggleDensity,
  } = useTickets();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b-2 border-[#cce4ff] sticky top-0 z-40 select-none shadow-xs">
      {/* Offline Alert Strip (RNF-05) */}
      {connectionStatus === 'offline' && (
        <div className="bg-[#0a2463] text-white text-xs font-black py-1.5 px-4 text-center flex items-center justify-center gap-2 border-b border-sky-400/40">
          <WifiOff className="w-3.5 h-3.5 text-sky-300" />
          <span>
            MODO SIN CONEXIÓN (RNF-05): Operando en caché local. Los cambios se sincronizarán al restablecer Internet.
          </span>
          <button
            onClick={toggleConnectionStatus}
            className="underline font-bold text-sky-300 hover:text-white cursor-pointer ml-2 text-[11px]"
          >
            Reconectar
          </button>
        </div>
      )}

      <div className="w-full px-4 sm:px-6 h-20 flex items-center justify-between gap-2 relative">
        {/* LEFT: Brand */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Logo image container */}
          <div className="h-12 px-2.5 py-1 rounded-2xl bg-white border border-[#cce4ff] shadow-sm flex items-center justify-center">
            <img
              src="./LOGOTIPO%20SEDATECH.png"
              alt="Logotipo SedaTech"
              className="h-8 sm:h-9 w-auto max-w-[110px] sm:max-w-[130px] object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0a2463] leading-none font-display">
                SedaTech
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-100 text-[#0052a5] border border-sky-300">
                Gestión de Tickets
              </span>
            </div>
            <p className="text-xs font-semibold text-[#4b6b94] mt-0.5 hidden xs:block">
              Gestión de Tickets & Soporte Técnico
            </p>
          </div>
        </div>

        {/* CENTER: THE SMALL TRIANGLE TOP TRIGGER */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-30">
          <button
            onClick={onToggleMenu}
            aria-label="Abrir o cerrar menú de navegación táctil"
            title="Triángulo central: Abrir o cerrar menú"
            className={`group flex flex-col items-center justify-center px-4 py-1.5 sm:px-5 sm:py-2 rounded-2xl transition-all duration-200 cursor-pointer shadow-md btn-spring border-2 ${
              isMenuOpen
                ? 'bg-[#0052a5] text-white border-[#38bdf8] shadow-sky-500/30 scale-105'
                : 'bg-white text-[#0a2463] border-[#0284c7] hover:bg-[#f0f7ff] shadow-sky-100'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`text-sm transition-transform duration-200 font-mono ${
                  isMenuOpen ? 'rotate-180 text-white' : 'text-[#0284c7]'
                }`}
              >
                ▼
              </span>
              <span className="text-xs font-black font-display tracking-wide uppercase">
                Menú
              </span>
            </div>

            <span className="text-[9px] font-bold opacity-80 leading-none mt-0.5">
              {isMenuOpen ? 'Tocar para cerrar' : 'Tocar para navegar'}
            </span>
          </button>
        </div>

        {/* RIGHT: Status, sound, notifications & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Windows Resolution Simulator Dropdown */}
          <div className="hidden lg:flex items-center gap-1 bg-[#f0f7ff] p-1 rounded-2xl border border-[#cce4ff] text-[11px] font-bold">
            <Monitor className="w-3.5 h-3.5 text-[#0052a5] ml-1.5" />
            <span className="text-[#4b6b94] text-[10px] uppercase font-black px-1">Ventana:</span>
            {(['auto', '720', '900', '1280', '1366'] as const).map(w => (
              <button
                key={w}
                onClick={() => setWindowSimulationWidth(w)}
                className={`px-2 py-0.5 rounded-xl transition-all cursor-pointer font-black ${
                  windowSimulationWidth === w
                    ? 'bg-[#0052a5] text-white shadow-2xs'
                    : 'text-[#0a2463]/75 hover:bg-white hover:text-[#0a2463]'
                }`}
                title={`Simular resolución de ventana Windows: ${w === 'auto' ? 'Adaptable 100%' : `${w} px`}`}
              >
                {w === 'auto' ? 'Auto' : `${w}p`}
              </button>
            ))}
          </div>

          {/* Connection status toggle (RNF-05) */}
          <button
            onClick={toggleConnectionStatus}
            className={`px-3 py-1.5 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              connectionStatus === 'online'
                ? 'bg-sky-50 text-[#0052a5] border-sky-300 hover:bg-sky-100'
                : 'bg-[#0a2463] text-white border-sky-400 hover:bg-[#0052a5] animate-pulse'
            }`}
            title="Estado de conexión a Internet (Haz clic para simular modo offline RNF-05)"
          >
            {connectionStatus === 'online' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-ping" />
                <span className="hidden sm:inline">En línea</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-sky-300" />
                <span className="hidden sm:inline">Sin conexión</span>
              </>
            )}
          </button>

          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Efectos sonoros activados' : 'Sonido silenciado'}
            className={`p-2 rounded-2xl transition-colors cursor-pointer border ${
              soundEnabled
                ? 'bg-sky-50 text-[#0284c7] border-sky-200 hover:bg-sky-100'
                : 'bg-white text-[#4b6b94] border-[#cce4ff] hover:bg-[#f0f7ff]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="w-10 h-10 rounded-2xl bg-[#f0f7ff] hover:bg-sky-100 border border-[#cce4ff] text-[#0a2463] flex items-center justify-center transition-colors relative cursor-pointer"
              title="Notificaciones y avisos (RF-06)"
            >
              <Bell className="w-5 h-5 text-[#0052a5]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#0284c7] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs border border-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-88 bg-white rounded-3xl shadow-2xl border-2 border-[#cce4ff] py-3 z-50 animate-pop">
                <div className="px-4 pb-2 border-b border-[#cce4ff] flex items-center justify-between">
                  <span className="font-black text-sm text-[#0a2463] font-display">Avisos y Alertas</span>
                  <button
                    onClick={() => {
                      markAllNotificationsRead();
                      setIsNotifOpen(false);
                    }}
                    className="text-xs font-bold text-[#0284c7] hover:text-[#0052a5] transition-colors cursor-pointer"
                  >
                    Marcar leídas
                  </button>
                </div>

                <div className="divide-y divide-sky-100 max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-[#f0f7ff]/70 transition-colors flex items-start gap-3 ${
                        !n.leida ? 'bg-[#f0f7ff]' : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          n.tipo === 'success'
                            ? 'bg-sky-100 text-[#0284c7]'
                            : n.tipo === 'alert'
                            ? 'bg-[#0a2463] text-white'
                            : 'bg-blue-100 text-[#0052a5]'
                        }`}
                      >
                        {n.tipo === 'success' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : n.tipo === 'alert' ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <Settings className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#0a2463] leading-snug">{n.titulo}</p>
                        <p className="text-[11px] text-[#4b6b94] mt-0.5 leading-snug">{n.mensaje}</p>
                        <span className="text-[10px] text-[#4b6b94]/80 font-medium block mt-1">{n.fecha}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Account Switcher */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-2xl hover:bg-[#f0f7ff] transition-colors cursor-pointer border border-[#cce4ff] bg-white"
            >
              <div
                className={`w-9 h-9 rounded-2xl ${currentUser.avatarColor} text-white flex items-center justify-center text-lg shadow-xs font-black`}
              >
                {currentUser.avatarEmoji || '👤'}
              </div>

              <div className="text-left hidden sm:block">
                <div className="text-xs font-black text-[#0a2463] leading-tight">
                  {currentUser.nombre}
                </div>
                <div className="text-[10px] text-[#4b6b94] font-bold capitalize leading-none mt-0.5">
                  {currentUser.rol}
                </div>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-[#4b6b94]" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-88 bg-white rounded-3xl shadow-2xl border-2 border-[#cce4ff] py-3 z-50 animate-pop">
                <div className="px-5 py-3 border-b border-[#cce4ff] bg-[#f0f7ff] rounded-t-3xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0052a5] block">
                    Cuenta Actual Iniciada
                  </span>
                  <p className="text-xs text-[#0a2463] font-bold mt-0.5">
                    Sesión activa en SedaTech · Sistema de Gestión de Tickets
                  </p>
                </div>

                <div className="p-3 space-y-2">
                  {/* Only the currently logged-in account */}
                  <div className="w-full flex items-center justify-between p-3 rounded-2xl text-xs bg-[#0052a5] text-white border border-[#0052a5]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl ${currentUser.avatarColor || 'bg-[#0a2463]'} border border-white/25 text-white flex items-center justify-center text-xl shrink-0 font-black`}
                      >
                        {currentUser.avatarEmoji || '👤'}
                      </div>
                      <div className="text-left min-w-0">
                        <div className="font-black text-sm truncate">
                          {currentUser.nombre}
                        </div>
                        <div className="text-[11px] font-bold text-sky-100 capitalize">
                          Rol: {currentUser.rol === 'administrador' ? 'Administrador' : currentUser.rol === 'tecnico' ? 'Técnico' : 'Usuario'}
                        </div>
                        <div className="text-[10px] text-sky-200/90 truncate mt-0.5">
                          {currentUser.rol === 'administrador'
                            ? 'Acceso total al sistema SedaTech'
                            : currentUser.rol === 'tecnico'
                            ? 'Únicamente accede a sus tickets asignados'
                            : 'Únicamente accede a sus propios tickets'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Density toggle & Logout */}
                  <div className="pt-2 border-t border-sky-100 space-y-1.5">
                    <button
                      onClick={() => toggleDensity()}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-[#0a2463] hover:bg-[#f0f7ff] cursor-pointer"
                    >
                      <span>Densidad de pantalla:</span>
                      <span className="px-2 py-0.5 rounded-lg bg-sky-100 text-[#0052a5] text-[10px] font-black uppercase">
                        {density}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-[#f0f7ff] border border-sky-200 text-[#0a2463] hover:bg-[#0a2463] hover:text-white text-xs font-black transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
