import React from 'react';
import { useTickets } from '../context/TicketContext';
import { Computer, Wrench, ShieldCheck, Cpu } from 'lucide-react';

export const BannerHero: React.FC = () => {
  const { currentUser, isDashboardBannerVisible } = useTickets();

  return (
    <div
      aria-hidden={!isDashboardBannerVisible}
      className={`${
        isDashboardBannerVisible ? '' : 'hidden'
      } relative w-full rounded-3xl bg-gradient-to-r from-[#e0f2fe] via-[#f0f9ff] to-[#ffffff] border-2 border-[#cce4ff] p-5 sm:p-6 shadow-xs overflow-hidden select-none`}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left Welcome message */}
        <div className="flex items-center gap-4 text-left">
          <div className="w-14 h-14 rounded-2xl bg-[#0052a5] text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-400/30">
            <Cpu className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#0a2463] tracking-tight font-display">
                ¡Bienvenido, {currentUser.nombre}!
              </h2>
              <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#0284c7] text-white shadow-2xs">
                {currentUser.rol}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#4b6b94] font-medium mt-1 max-w-lg">
              Sistema integral de soporte técnico y gestión de incidencias <strong className="text-[#0052a5]">SedaTech</strong>.
            </p>
          </div>
        </div>

        {/* Center Tech Illustration & Right Quote */}
        <div className="flex items-center gap-6 lg:gap-8 justify-center lg:justify-end w-full lg:w-auto">
          {/* Laptop, diagnostic tools and computer board vector art strictly in Azul, Celeste & Blanco */}
          <div className="w-44 sm:w-52 h-22 relative shrink-0">
            <svg viewBox="0 0 200 90" className="w-full h-full drop-shadow-sm">
              {/* Laptop screen */}
              <rect x="50" y="10" width="100" height="60" rx="8" fill="#0a2463" />
              <rect x="55" y="15" width="90" height="50" rx="4" fill="#0284c7" />
              {/* Diagnostic chart line on screen */}
              <path
                d="M60 45 L75 35 L90 50 L105 25 L120 40 L135 30"
                stroke="#ffffff"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="105" cy="25" r="3.5" fill="#7dd3fc" />
              {/* Laptop base */}
              <path d="M35 70 L165 70 L155 78 L45 78 Z" fill="#0052a5" />
              {/* Screwdriver tool */}
              <rect x="22" y="24" width="8" height="32" rx="4" fill="#0ea5e9" transform="rotate(-30 22 24)" />
              <polygon points="12,18 20,24 16,30" fill="#bae6fd" />
              {/* Microchip */}
              <rect x="156" y="20" width="24" height="24" rx="4" fill="#0052a5" />
              <circle cx="168" cy="32" r="5" fill="#38bdf8" />
              <line x1="150" y1="26" x2="156" y2="26" stroke="#38bdf8" strokeWidth="2" />
              <line x1="150" y1="32" x2="156" y2="32" stroke="#38bdf8" strokeWidth="2" />
              <line x1="150" y1="38" x2="156" y2="38" stroke="#38bdf8" strokeWidth="2" />
              <line x1="180" y1="26" x2="186" y2="26" stroke="#38bdf8" strokeWidth="2" />
              <line x1="180" y1="32" x2="186" y2="32" stroke="#38bdf8" strokeWidth="2" />
              <line x1="180" y1="38" x2="186" y2="38" stroke="#38bdf8" strokeWidth="2" />
            </svg>
          </div>

          {/* Right Quote */}
          <div className="hidden sm:block text-right max-w-[210px]">
            <p className="text-xs font-bold italic text-[#0a2463] leading-tight">
              “Diagnóstico certero, solución garantizada y trazabilidad en cada reparación”
            </p>
            <span className="text-[10px] text-[#0284c7] font-black uppercase tracking-wider block mt-1">
              SedaTech v3.5 · Gestión de Tickets
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
