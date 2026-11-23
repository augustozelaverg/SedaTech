import React from 'react';
import { useTickets } from '../context/TicketContext';
import {
  Settings,
  ShieldCheck,
  Key,
  Volume2,
  Wifi,
  WifiOff,
  Server,
  Database,
  Computer,
  Sparkles,
} from 'lucide-react';

export const ConfigView: React.FC = () => {
  const {
    currentUser,
    connectionStatus,
    toggleConnectionStatus,
    soundEnabled,
    toggleSound,
    playTestSound,
    resetToSeedData,
  } = useTickets();

  return (
    <div className="space-y-6 animate-in fade-in duration-200 select-none">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#cce4ff] shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0a2463] text-white flex items-center justify-center text-3xl font-black shadow-md shadow-sky-900/20">
            ⚙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-display text-[#0a2463]">
                Configuración & Entorno de Sistema
              </h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-[#0052a5] border border-sky-300">
                SedaTech · Gestión de Tickets
              </span>
            </div>
            <p className="text-xs text-[#4b6b94] font-medium mt-0.5">
              Parámetros de conectividad, almacenamiento seguro y preferencias de la aplicación Windows.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connectivity card (RNF-05) */}
        <div className="p-6 rounded-3xl bg-white border-2 border-[#cce4ff] shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <Wifi className="w-5 h-5 text-[#0052a5]" />
              <h3 className="text-base font-black font-display text-[#0a2463]">
                Estado de Red e Internet (RNF-05)
              </h3>
            </div>
            <p className="text-xs text-[#4b6b94] leading-relaxed">
              En caso de pérdida de Internet, SedaTech pasa automáticamente a modo sólo lectura de caché local sin confirmar operaciones al servidor hasta reconectar.
            </p>

            <div className="mt-4 p-4 rounded-2xl bg-[#f0f7ff] border border-[#cce4ff] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#0a2463] block">Conexión Actual:</span>
                <span
                  className={`text-xs font-black inline-flex items-center gap-1.5 mt-0.5 ${
                    connectionStatus === 'online' ? 'text-[#0052a5]' : 'text-[#0a2463]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'online' ? 'bg-[#0ea5e9]' : 'bg-[#0a2463]'
                    }`}
                  />
                  {connectionStatus === 'online' ? 'En Línea (Sincronizado)' : 'Sin Conexión (Caché Local)'}
                </span>
              </div>

              <button
                onClick={toggleConnectionStatus}
                className="px-4 py-2 bg-[#0052a5] hover:bg-[#0a2463] text-white rounded-xl text-xs font-black transition-colors cursor-pointer min-h-[44px]"
              >
                {connectionStatus === 'online' ? 'Desconectar' : 'Conectar'}
              </button>
            </div>
          </div>
        </div>

        {/* Audio notification synthesized (RF-06) */}
        <div className="p-6 rounded-3xl bg-white border-2 border-[#cce4ff] shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <Volume2 className="w-5 h-5 text-[#0284c7]" />
              <h3 className="text-base font-black font-display text-[#0a2463]">
                Efectos Sonoros y Chimes (RF-06)
              </h3>
            </div>
            <p className="text-xs text-[#4b6b94] leading-relaxed">
              Sintetizador Web Audio API de ondas triangulares para avisos de inicio de atención, confirmación de tickets y alertas de sistema.
            </p>

            <div className="mt-4 p-4 rounded-2xl bg-[#f0f7ff] border border-[#cce4ff] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#0a2463] block">Sonido de Sistema:</span>
                <span className="text-xs font-black text-[#0052a5] mt-0.5 block">
                  {soundEnabled ? 'Activado (Chimes activos)' : 'Silenciado'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={playTestSound}
                  className="px-3.5 py-2 bg-white hover:bg-sky-50 text-[#0a2463] border border-[#cce4ff] rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[44px]"
                >
                  Probar Chime
                </button>
                <button
                  onClick={toggleSound}
                  className="px-4 py-2 bg-[#0284c7] hover:bg-[#0052a5] text-white rounded-xl text-xs font-black transition-colors cursor-pointer min-h-[44px]"
                >
                  {soundEnabled ? 'Silenciar' : 'Activar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Architecture (Section 8, 9, 10) */}
      <div className="p-6 rounded-3xl bg-white border-2 border-[#cce4ff] shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#0284c7]" />
          <h3 className="text-base font-black font-display text-[#0a2463]">
            Seguridad & Arquitectura Técnica de Tres Capas (Sección 8 & 10)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#f0f7ff] border border-[#cce4ff]">
            <Computer className="w-6 h-6 text-[#0052a5] mb-2" />
            <strong className="block text-[#0a2463] font-black mb-1">Capa 1: Cliente Windows</strong>
            <p className="text-[#4b6b94] leading-relaxed">
              C# .NET + WPF/MVVM (propuesta objetivo), componentes táctiles redondeados de al menos 44 px, distribución por instalador MSIX firmado.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f0f7ff] border border-[#cce4ff]">
            <Server className="w-6 h-6 text-[#0284c7] mb-2" />
            <strong className="block text-[#0a2463] font-black mb-1">Capa 2: Backend API Segura</strong>
            <p className="text-[#4b6b94] leading-relaxed">
              ASP.NET Core Web API, control de acceso RBAC por rol, tokens HttpOnly y SignalR autenticado para avisos en tiempo real.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f0f7ff] border border-[#cce4ff]">
            <Database className="w-6 h-6 text-[#0ea5e9] mb-2" />
            <strong className="block text-[#0a2463] font-black mb-1">Capa 3: Persistencia Segura</strong>
            <p className="text-[#4b6b94] leading-relaxed">
              PostgreSQL con integridad referencial estricta, claves foráneas protegidas y contraseñas hash Argon2id (Sección 10).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
