import React from 'react';
import { useTickets } from '../context/TicketContext';
import { X, Bell, Check, Volume2, Info, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    currentUser,
    markNotificationRead,
    markAllNotificationsRead,
    playTestSound,
    soundEnabled,
  } = useTickets();

  if (!isOpen) return null;

  // Filter notifications relevant to current user
  const userNotifications = notifications.filter(n => {
    if (currentUser.rol === 'administrador') return true;
    if (currentUser.rol === 'tecnico') {
      return n.destinatario_rol === 'tecnico' || n.destinatario_id === currentUser.id;
    }
    return n.destinatario_id === currentUser.id;
  });

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-[#0284c7] shrink-0" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-[#0a2463] shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-[#0052a5] shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#061c47]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 border-l-2 border-[#cce4ff]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#cce4ff] flex items-center justify-between bg-[#f0f7ff]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#0052a5] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#0a2463]">Notificaciones en Vivo</h2>
              <p className="text-xs text-[#4b6b94]">Criterio RF-06: Avisos automáticos y sonido opcional</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#4b6b94] hover:text-[#0a2463] hover:bg-sky-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-6 py-2.5 bg-sky-50 border-b border-[#cce4ff] flex items-center justify-between text-xs">
          <button
            onClick={playTestSound}
            className="flex items-center gap-1.5 text-[#0a2463] hover:text-[#0284c7] font-bold transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>Probar audio chime</span>
          </button>

          {userNotifications.some(n => !n.leida) && (
            <button
              onClick={markAllNotificationsRead}
              className="text-[#0052a5] hover:text-[#0a2463] font-bold cursor-pointer"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {userNotifications.length === 0 ? (
            <div className="text-center py-12 text-[#4b6b94] text-xs">
              No tienes notificaciones pendientes en tu bandeja.
            </div>
          ) : (
            userNotifications.map(n => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  !n.leida
                    ? 'bg-sky-50 border-[#0284c7] shadow-2xs'
                    : 'bg-white border-[#cce4ff] hover:bg-[#f0f7ff]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">{getIcon(n.tipo)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs text-[#0a2463] truncate">
                        {n.titulo}
                      </span>
                      {!n.leida && (
                        <span className="w-2 h-2 rounded-full bg-[#0284c7] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#4b6b94] mb-1.5 leading-relaxed">{n.mensaje}</p>
                    <div className="flex items-center justify-between text-[11px] text-[#4b6b94] font-mono">
                      <span className="text-[#0052a5] font-bold">{n.ticket_codigo}</span>
                      <span>{new Date(n.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-[#cce4ff] bg-[#f0f7ff] text-[11px] text-[#4b6b94] flex items-center justify-between">
          <span>Audio: {soundEnabled ? 'Activado 🔔' : 'Silenciado 🔕'}</span>
          <button
            onClick={onClose}
            className="px-3 py-1 font-bold text-[#0052a5] bg-white border border-[#cce4ff] hover:bg-sky-50 rounded-lg cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
