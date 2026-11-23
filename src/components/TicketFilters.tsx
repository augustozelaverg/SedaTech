import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { Priority, TicketStatus } from '../types';
import { Calendar, Search, RotateCcw, ChevronDown } from 'lucide-react';

export const TicketFilters: React.FC = () => {
  const { filters, setFilters, resetFilters } = useTickets();

  const [localSearch, setLocalSearch] = useState(filters.busqueda);
  const [localDate, setLocalDate] = useState(filters.fecha_desde);
  const [localEstado, setLocalEstado] = useState<TicketStatus | 'todos'>(filters.estado);
  const [localPrioridad, setLocalPrioridad] = useState<Priority | 'todas'>(filters.prioridad);

  const handleSearchClick = () => {
    setFilters(prev => ({
      ...prev,
      busqueda: localSearch,
      fecha_desde: localDate,
      estado: localEstado,
      prioridad: localPrioridad,
    }));
  };

  const handleResetClick = () => {
    setLocalSearch('');
    setLocalDate('');
    setLocalEstado('todos');
    setLocalPrioridad('todas');
    resetFilters();
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#cce4ff] shadow-xs mb-5 select-none">
      <div className="flex flex-wrap items-center gap-3 justify-between">

        {/* Filter: Fecha */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#0052a5]" />
          <span className="text-xs font-black text-[#0a2463]">Fecha</span>
          <div className="relative">
            <input
              type="date"
              value={localDate}
              onChange={e => setLocalDate(e.target.value)}
              placeholder="Seleccione fecha"
              aria-label="Seleccionar fecha"
              className="py-2 px-3 text-xs bg-[#f0f7ff] border border-[#cce4ff] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0284c7]/30 font-bold text-[#0a2463] cursor-pointer min-h-[44px]"
            />
          </div>
        </div>

        {/* Filter: Estado */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#0a2463]">Estado</span>
          <div className="relative">
            <select
              value={localEstado}
              onChange={e => setLocalEstado(e.target.value as TicketStatus | 'todos')}
              className="appearance-none py-2 pl-3 pr-8 text-xs bg-[#f0f7ff] border border-[#cce4ff] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0284c7]/30 font-bold text-[#0a2463] cursor-pointer min-h-[44px]"
            >
              <option value="todos">Todos los Estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_atencion">En atención</option>
              <option value="resuelto">Resuelto</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#4b6b94] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Filter: Prioridad */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#0a2463]">Prioridad</span>
          <div className="relative">
            <select
              value={localPrioridad}
              onChange={e => setLocalPrioridad(e.target.value as Priority | 'todas')}
              className="appearance-none py-2 pl-3 pr-8 text-xs bg-[#f0f7ff] border border-[#cce4ff] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0284c7]/30 font-bold text-[#0a2463] cursor-pointer min-h-[44px]"
            >
              <option value="todas">Todas las Prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#4b6b94] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#0284c7] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearchClick()}
            placeholder="Buscar por código, falla, equipo o usuario..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#f0f7ff] border border-[#cce4ff] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/30 font-semibold text-[#0a2463] placeholder:text-[#4b6b94]/70 min-h-[44px]"
          />
        </div>

        {/* Action Buttons: Buscar & Limpiar */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSearchClick}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0052a5] hover:bg-[#0a2463] text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm btn-spring min-h-[44px]"
          >
            <Search className="w-4 h-4" />
            <span>Buscar</span>
          </button>

          <button
            onClick={handleResetClick}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-[#f0f7ff] text-[#0052a5] border-2 border-[#cce4ff] rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs btn-spring min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Limpiar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
