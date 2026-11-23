import React from 'react';
import { useTickets } from '../context/TicketContext';
import { Priority, TicketStatus } from '../types';
import { PieChart, BarChart3, Clock, CheckCircle } from 'lucide-react';

export const AnalyticsCharts: React.FC = () => {
  const { visibleTicketsForCurrentRole, filters, setFilters } = useTickets();

  // Status breakdown
  const statusCounts: Record<TicketStatus, number> = {
    pendiente: 0,
    en_atencion: 0,
    resuelto: 0,
    cancelado: 0,
  };

  // Priority breakdown
  const priorityCounts: Record<Priority, number> = {
    alta: 0,
    media: 0,
    baja: 0,
  };

  let totalResolutionTime = 0;
  let resolvedCount = 0;

  visibleTicketsForCurrentRole.forEach(ticket => {
    statusCounts[ticket.estado]++;
    priorityCounts[ticket.prioridad]++;
    if (ticket.estado === 'resuelto' && ticket.tiempo_resolucion_min) {
      totalResolutionTime += ticket.tiempo_resolucion_min;
      resolvedCount++;
    }
  });

  const avgResolutionTime = resolvedCount > 0 ? Math.round(totalResolutionTime / resolvedCount) : 40;
  const total = visibleTicketsForCurrentRole.length || 1;

  // Status configuration (Azul, Celeste, Blanco)
  const statusConfig: { key: TicketStatus; label: string; color: string; bg: string; text: string }[] = [
    { key: 'pendiente', label: 'Pendientes', color: '#38bdf8', bg: 'bg-[#38bdf8]', text: 'text-[#0284c7]' },
    { key: 'en_atencion', label: 'En Atención', color: '#0284c7', bg: 'bg-[#0284c7]', text: 'text-[#0052a5]' },
    { key: 'resuelto', label: 'Resueltos', color: '#0052a5', bg: 'bg-[#0052a5]', text: 'text-[#0052a5]' },
    { key: 'cancelado', label: 'Cancelados', color: '#0a2463', bg: 'bg-[#0a2463]', text: 'text-[#0a2463]' },
  ];

  // Priority configuration (Rojo, Amarillo, Verde)
  const priorityConfig: { key: Priority; label: string; color: string; bg: string; text: string }[] = [
    { key: 'alta', label: 'Alta Prioridad', color: '#dc2626', bg: 'bg-red-600', text: 'text-red-700' },
    { key: 'media', label: 'Media Prioridad', color: '#facc15', bg: 'bg-yellow-400', text: 'text-amber-700' },
    { key: 'baja', label: 'Baja Prioridad', color: '#16a34a', bg: 'bg-green-600', text: 'text-green-700' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Chart 1: Distribution by Estado */}
      <div className="bg-white rounded-2xl p-5 border border-[#cce4ff] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f0f7ff] text-[#0052a5] flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0a2463]">Distribución por Estado</h3>
              <p className="text-xs text-[#4b6b94]">Métrica en tiempo real de ciclo de vida</p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-[#4b6b94] tabular-nums">
            Total: {visibleTicketsForCurrentRole.length}
          </span>
        </div>

        {/* Stacked bar representation */}
        <div className="h-4 w-full rounded-full overflow-hidden flex bg-sky-100 mb-5 shadow-inner">
          {statusConfig.map(s => {
            const count = statusCounts[s.key];
            const pct = (count / total) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={s.key}
                style={{ width: `${pct}%` }}
                className={`${s.bg} transition-all duration-300 relative group cursor-pointer hover:opacity-90`}
                title={`${s.label}: ${count} (${Math.round(pct)}%)`}
                onClick={() => setFilters(prev => ({ ...prev, estado: s.key }))}
              />
            );
          })}
        </div>

        {/* Breakdown items */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statusConfig.map(s => {
            const count = statusCounts[s.key];
            const pct = Math.round((count / total) * 100);
            const isSelected = filters.estado === s.key;

            return (
              <button
                key={s.key}
                onClick={() =>
                  setFilters(prev => ({
                    ...prev,
                    estado: prev.estado === s.key ? 'todos' : s.key,
                  }))
                }
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#0284c7] bg-[#f0f7ff] shadow-xs'
                    : 'border-[#cce4ff] hover:border-[#0284c7] bg-[#f8fbff]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full ${s.bg}`} />
                  <span className="text-[11px] font-medium text-[#4b6b94] truncate">{s.label}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold font-mono text-[#0a2463] tabular-nums">{count}</span>
                  <span className="text-[10px] text-[#4b6b94] font-mono tabular-nums">{pct}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart 2: Distribution by Prioridad */}
      <div className="bg-white rounded-2xl p-5 border border-[#cce4ff] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284c7] flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0a2463]">Carga por Nivel de Prioridad</h3>
              <p className="text-xs text-[#4b6b94]">Base del algoritmo de atención RF-04</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#0052a5] bg-[#f0f7ff] border border-[#cce4ff] px-2 py-0.5 rounded-md font-medium">
            <Clock className="w-3 h-3" />
            <span>Resolución prom: {avgResolutionTime}m</span>
          </div>
        </div>

        {/* Bar comparison */}
        <div className="space-y-3">
          {priorityConfig.map(p => {
            const count = priorityCounts[p.key];
            const maxVal = Math.max(...Object.values(priorityCounts), 1);
            const pct = Math.round((count / maxVal) * 100);
            const isSelected = filters.prioridad === p.key;

            return (
              <div
                key={p.key}
                onClick={() =>
                  setFilters(prev => ({
                    ...prev,
                    prioridad: prev.prioridad === p.key ? 'todas' : p.key,
                  }))
                }
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isSelected ? 'bg-[#f0f7ff]' : 'hover:bg-[#f8fbff]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className={`w-2.5 h-2.5 rounded-full ${p.bg}`} />
                    <span className="text-[#0a2463]">{p.label}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-[#0a2463] tabular-nums">{count} tickets</span>
                    <span className="text-[11px] text-[#4b6b94] tabular-nums">
                      ({Math.round((count / total) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full bg-sky-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full ${p.bg} transition-all duration-300 rounded-full`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
