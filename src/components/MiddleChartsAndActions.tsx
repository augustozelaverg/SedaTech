import React, { useState, useEffect, useRef } from 'react';
import { useTickets } from '../context/TicketContext';
import { exportTicketsToCsv } from '../utils/csv';
import { playSound, burst } from '../utils/audio';
import {
  Plus,
  UserCheck,
  LayoutGrid,
  FileSpreadsheet,
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Film,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface MiddleChartsAndActionsProps {
  onOpenCreateModal: () => void;
  onOpenAssignModal: () => void;
  onOpenCriteriaModal: () => void;
}

export const MiddleChartsAndActions: React.FC<MiddleChartsAndActionsProps> = ({
  onOpenCreateModal,
  onOpenAssignModal,
  onOpenCriteriaModal,
}) => {
  const { metrics, filteredTickets, tickets, currentUser } = useTickets();
  const [periodoEstado, setPeriodoEstado] = useState('Este mes');
  const [periodoPrioridad, setPeriodoPrioridad] = useState('Este mes');

  // Video Explainer States
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [hoveredPrioritySlice, setHoveredPrioritySlice] = useState<'alta' | 'media' | 'baja' | null>(null);

  const stepTimerRef = useRef<number | null>(null);

  const handleExportCsv = () => {
    exportTicketsToCsv(filteredTickets, `reporte_tickets_${currentUser.rol}`);
    burst(['📊', '💾', '✔️']);
  };

  // Metric values
  const total = metrics.total || 128;
  const pendientes = metrics.pendientes;
  const enAtencion = metrics.en_atencion;
  const resueltos = metrics.resueltos;
  const cancelados = metrics.cancelados;

  const pctPendientes = Math.round((pendientes / total) * 100) || 28;
  const pctEnAtencion = Math.round((enAtencion / total) * 100) || 42;
  const pctResueltos = Math.round((resueltos / total) * 100) || 25;
  const pctCancelados = Math.max(1, 100 - pctPendientes - pctEnAtencion - pctResueltos);

  // SVG Donut calculation
  const circumference = 251.3;
  const strokeDashoffsetPendientes = 0;
  const strokeDashoffsetEnAtencion = (pctPendientes / 100) * circumference;
  const strokeDashoffsetResueltos = ((pctPendientes + pctEnAtencion) / 100) * circumference;
  const strokeDashoffsetCancelados =
    ((pctPendientes + pctEnAtencion + pctResueltos) / 100) * circumference;

  // Mid-angle calculations for on-chart percentage badges (in degrees, 12 o'clock = -90deg)
  const angleStart = -90;
  const angle1Mid = angleStart + (pctPendientes / 2) * 3.6;
  const angle2Mid = angleStart + (pctPendientes + pctEnAtencion / 2) * 3.6;
  const angle3Mid = angleStart + (pctPendientes + pctEnAtencion + pctResueltos / 2) * 3.6;
  const angle4Mid = angleStart + (pctPendientes + pctEnAtencion + pctResueltos + pctCancelados / 2) * 3.6;

  const getCoordinates = (deg: number, radius = 40) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: 50 + radius * Math.cos(rad),
      y: 50 + radius * Math.sin(rad),
    };
  };

  const pos1 = getCoordinates(angle1Mid, 40);
  const pos2 = getCoordinates(angle2Mid, 40);
  const pos3 = getCoordinates(angle3Mid, 40);
  const pos4 = getCoordinates(angle4Mid, 40);

  // Video Explainer Steps Data (SedaTech: Azul, Celeste y Blanco)
  const explainerSteps = [
    {
      key: 'pendientes',
      name: 'Pendientes',
      pct: pctPendientes,
      count: pendientes,
      color: '#38bdf8',
      icon: '⏳',
      stepBadge: 'Paso 1 de 4',
      badgeClass: 'bg-[#0ea5e9] text-white',
      title: 'Fase Inicial: Tickets Pendientes',
      narration: `El ${pctPendientes}% (${pendientes} tickets) corresponden a requerimientos registrados que aguardan evaluación y asignación técnica en SedaTech.`,
      highlightTip: 'Prioridad según matriz de criticidad operativa.',
      pos: pos1,
    },
    {
      key: 'en_atencion',
      name: 'En atención',
      pct: pctEnAtencion,
      count: enAtencion,
      color: '#0284c7',
      icon: '🔧',
      stepBadge: 'Paso 2 de 4',
      badgeClass: 'bg-[#0284c7] text-white',
      title: 'Fase Activa: En Atención Técnica',
      narration: `El ${pctEnAtencion}% (${enAtencion} tickets) representa el mayor volumen operativo: personal técnico interviniendo hardware, redes y software en SedaTech.`,
      highlightTip: 'Mayor concentración de carga de trabajo operativa.',
      pos: pos2,
    },
    {
      key: 'resueltos',
      name: 'Resueltos',
      pct: pctResueltos,
      count: resueltos,
      color: '#0052a5',
      icon: '✅',
      stepBadge: 'Paso 3 de 4',
      badgeClass: 'bg-[#0052a5] text-white',
      title: 'Fase Concluyente: Resueltos',
      narration: `El ${pctResueltos}% (${resueltos} tickets) han sido solucionados y cerrados satisfactoriamente con reporte técnico y firma de conformidad.`,
      highlightTip: 'SLA promedio cumplido dentro de los estándares de calidad.',
      pos: pos3,
    },
    {
      key: 'cancelados',
      name: 'Cancelados',
      pct: pctCancelados,
      count: cancelados,
      color: '#0a2463',
      icon: '🚫',
      stepBadge: 'Paso 4 de 4',
      badgeClass: 'bg-[#0a2463] text-white',
      title: 'Fase de Depuración: Cancelados',
      narration: `El ${pctCancelados}% (${cancelados} tickets) fueron cancelados o desestimados por duplicidad o cambio de requerimiento del usuario.`,
      highlightTip: 'Tasa mínima que asegura eficiencia en la base de datos.',
      pos: pos4,
    },
    {
      key: 'resumen',
      name: 'Resumen Global',
      pct: 100,
      count: total,
      color: '#1d4ed8',
      icon: '📊',
      stepBadge: 'Conclusión',
      badgeClass: 'bg-[#1d4ed8] text-white',
      title: 'Balance General: 100% de Trazabilidad',
      narration: `Total consolidado de ${total} tickets registrados. El sistema SedaTech mantiene control inmutable y auditoría completa de tickets.`,
      highlightTip: 'Rendimiento general en estado óptimo.',
      pos: { x: 50, y: 50 },
    },
  ];

  const currentStep = explainerSteps[activeStepIndex] || explainerSteps[0];

  // Video playback loop effect
  useEffect(() => {
    if (!isVideoPlaying) {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      return;
    }

    const intervalMs = 50; // smooth update frequency
    const totalStepDuration = 3800 / playbackSpeed;
    const progressIncrement = (intervalMs / totalStepDuration) * 100;

    stepTimerRef.current = window.setInterval(() => {
      setStepProgress(prev => {
        if (prev >= 100) {
          // Advance to next step
          setActiveStepIndex(currentIdx => {
            const nextIdx = (currentIdx + 1) % explainerSteps.length;
            if (isAudioEnabled) playSound('click');
            if (nextIdx === explainerSteps.length - 1) {
              burst(['🎬', '✨', '📊', '🎉']);
            }
            return nextIdx;
          });
          return 0;
        }
        return prev + progressIncrement;
      });
    }, intervalMs);

    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [isVideoPlaying, playbackSpeed, isAudioEnabled, explainerSteps.length]);

  const handleTogglePlayVideo = () => {
    if (isAudioEnabled) playSound('click');
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleSelectStep = (idx: number) => {
    if (isAudioEnabled) playSound('click');
    setActiveStepIndex(idx);
    setStepProgress(0);
  };

  const handlePrevStep = () => {
    if (isAudioEnabled) playSound('click');
    setActiveStepIndex(prev => (prev > 0 ? prev - 1 : explainerSteps.length - 1));
    setStepProgress(0);
  };

  const handleNextStep = () => {
    if (isAudioEnabled) playSound('click');
    setActiveStepIndex(prev => (prev + 1) % explainerSteps.length);
    setStepProgress(0);
  };

  const handleRestartVideo = () => {
    if (isAudioEnabled) playSound('click');
    setActiveStepIndex(0);
    setStepProgress(0);
    setIsVideoPlaying(true);
  };

  // Priority circular chart & dynamic card background calculations
  const countAlta = tickets.filter(t => t.prioridad === 'alta').length + (currentUser.rol === 'administrador' ? 39 : 0);
  const countMedia = tickets.filter(t => t.prioridad === 'media').length + (currentUser.rol === 'administrador' ? 45 : 0);
  const countBaja = tickets.filter(t => t.prioridad === 'baja').length + (currentUser.rol === 'administrador' ? 36 : 0);
  const totalPriority = countAlta + countMedia + countBaja;

  let pctAlta = 0;
  let pctMedia = 0;
  let pctBaja = 0;

  if (totalPriority > 0) {
    const rawAlta = (countAlta / totalPriority) * 100;
    const rawMedia = (countMedia / totalPriority) * 100;
    const rawBaja = (countBaja / totalPriority) * 100;

    pctAlta = Math.floor(rawAlta);
    pctMedia = Math.floor(rawMedia);
    pctBaja = Math.floor(rawBaja);

    let remainder = 100 - (pctAlta + pctMedia + pctBaja);
    const remainders: Array<{ key: 'alta' | 'media' | 'baja'; frac: number }> = [
      { key: 'alta' as const, frac: rawAlta - pctAlta },
      { key: 'media' as const, frac: rawMedia - pctMedia },
      { key: 'baja' as const, frac: rawBaja - pctBaja },
    ];
    remainders.sort((a, b) => b.frac - a.frac);

    for (let i = 0; i < remainder; i++) {
      const target = remainders[i % remainders.length].key;
      if (target === 'alta') pctAlta += 1;
      else if (target === 'media') pctMedia += 1;
      else pctBaja += 1;
    }
  }

  const dominantPriority: 'alta' | 'media' | 'baja' | null =
    totalPriority === 0
      ? null
      : countAlta >= countMedia && countAlta >= countBaja
      ? 'alta'
      : countMedia >= countAlta && countMedia >= countBaja
      ? 'media'
      : 'baja';

  const priorityCardTheme =
    dominantPriority === 'alta'
      ? {
          cardBg: 'bg-red-100/90',
          cardBorder: 'border-2 border-red-400',
          titleText: 'text-red-950',
          subText: 'text-red-800',
          selectClass: 'bg-white/90 border-red-300 text-red-950',
          chevronClass: 'text-red-700',
          dominantBadge: 'bg-red-600 text-white',
          dominantLabel: `Mayor: Alta (${pctAlta}%)`,
          trackStroke: '#fecaca',
          centerColor: '#dc2626',
        }
      : dominantPriority === 'media'
      ? {
          cardBg: 'bg-yellow-100/95',
          cardBorder: 'border-2 border-yellow-400',
          titleText: 'text-amber-950',
          subText: 'text-amber-900',
          selectClass: 'bg-white/90 border-yellow-400 text-amber-950',
          chevronClass: 'text-amber-800',
          dominantBadge: 'bg-yellow-400 text-amber-950 border border-amber-500/40',
          dominantLabel: `Mayor: Media (${pctMedia}%)`,
          trackStroke: '#fef08a',
          centerColor: '#b45309',
        }
      : dominantPriority === 'baja'
      ? {
          cardBg: 'bg-green-100/90',
          cardBorder: 'border-2 border-green-400',
          titleText: 'text-green-950',
          subText: 'text-green-800',
          selectClass: 'bg-white/90 border-green-300 text-green-950',
          chevronClass: 'text-green-700',
          dominantBadge: 'bg-green-600 text-white',
          dominantLabel: `Mayor: Baja (${pctBaja}%)`,
          trackStroke: '#bbf7d0',
          centerColor: '#16a34a',
        }
      : {
          cardBg: 'bg-slate-50',
          cardBorder: 'border-2 border-slate-200',
          titleText: 'text-[#0a2463]',
          subText: 'text-slate-600',
          selectClass: 'bg-white border-slate-300 text-[#0a2463]',
          chevronClass: 'text-slate-500',
          dominantBadge: 'bg-slate-200 text-slate-700',
          dominantLabel: 'Sin tickets',
          trackStroke: '#e2e8f0',
          centerColor: '#475569',
        };

  const prioOffsetAlta = 0;
  const prioOffsetMedia = (pctAlta / 100) * circumference;
  const prioOffsetBaja = ((pctAlta + pctMedia) / 100) * circumference;

  const prioAngleAlta = angleStart + (pctAlta / 2) * 3.6;
  const prioAngleMedia = angleStart + (pctAlta + pctMedia / 2) * 3.6;
  const prioAngleBaja = angleStart + (pctAlta + pctMedia + pctBaja / 2) * 3.6;

  const prioPosAlta = getCoordinates(prioAngleAlta, 40);
  const prioPosMedia = getCoordinates(prioAngleMedia, 40);
  const prioPosBaja = getCoordinates(prioAngleBaja, 40);

  const priorityItems: Array<{
    key: 'alta' | 'media' | 'baja';
    label: string;
    count: number;
    pct: number;
    color: string;
    badgeBg: string;
    activeBorder: string;
    pos: { x: number; y: number };
    badgeFill: string;
    badgeText: string;
  }> = [
    {
      key: 'alta',
      label: 'Alta',
      count: countAlta,
      pct: pctAlta,
      color: '#dc2626',
      badgeBg: 'bg-red-600 text-white',
      activeBorder: 'border-red-500 bg-white shadow-sm',
      pos: prioPosAlta,
      badgeFill: '#dc2626',
      badgeText: '#ffffff',
    },
    {
      key: 'media',
      label: 'Media',
      count: countMedia,
      pct: pctMedia,
      color: '#facc15',
      badgeBg: 'bg-yellow-400 text-amber-950',
      activeBorder: 'border-yellow-500 bg-white shadow-sm',
      pos: prioPosMedia,
      badgeFill: '#facc15',
      badgeText: '#78350f',
    },
    {
      key: 'baja',
      label: 'Baja',
      count: countBaja,
      pct: pctBaja,
      color: '#16a34a',
      badgeBg: 'bg-green-600 text-white',
      activeBorder: 'border-green-500 bg-white shadow-sm',
      pos: prioPosBaja,
      badgeFill: '#16a34a',
      badgeText: '#ffffff',
    },
  ];

  const activePriorityKey = hoveredPrioritySlice ?? dominantPriority;
  const activePriorityItem = priorityItems.find(item => item.key === activePriorityKey) || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 select-none">
      {/* CARD 1: Tickets por estado (ANIMADO CON PORCENTAJES Y MODO VIDEO EXPLAINER) */}
      <div className="bg-white rounded-3xl p-5 border border-[#cce4ff] shadow-xs flex flex-col justify-between relative overflow-hidden transition-all duration-300">
        
        {/* Subtle Video Recording Glow Effect when video is playing */}
        {isVideoPlaying && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0a2463] via-[#0052a5] to-[#38bdf8] animate-pulse pointer-events-none" />
        )}

        {/* Top Header with Video Mode badge and Controls */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black font-display text-[#0a2463]">
              Tickets por estado
            </h3>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black transition-all ${
                isVideoPlaying
                  ? 'bg-[#0284c7] text-white animate-pulse'
                  : 'bg-[#f0f7ff] text-[#0052a5] border border-[#cce4ff]'
              }`}
            >
              <Film className="w-3 h-3 text-current" />
              <span>{isVideoPlaying ? 'REC · Video' : 'Animación'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsCinemaMode(true)}
              className="p-1.5 rounded-xl bg-[#f0f7ff] hover:bg-sky-100 text-[#0a2463] transition-colors cursor-pointer"
              title="Expandir modo presentación de video"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className="p-1.5 rounded-xl bg-[#f0f7ff] hover:bg-sky-100 text-[#0a2463] transition-colors cursor-pointer"
              title={isAudioEnabled ? 'Silenciar efectos' : 'Activar efectos'}
            >
              {isAudioEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#0284c7]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-[#4b6b94]" />
              )}
            </button>

            <div className="relative">
              <select
                value={periodoEstado}
                onChange={e => setPeriodoEstado(e.target.value)}
                className="appearance-none bg-[#f0f7ff] border border-[#cce4ff] text-[#0a2463] text-[11px] font-bold py-1 px-2.5 pr-6 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="Este mes">Este mes</option>
                <option value="Esta semana">Esta semana</option>
                <option value="Este año">Este año</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#4b6b94] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Main Interactive Chart Section: SVG Donut with Visible On-Chart Percentage Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
          <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full -rotate-90 transition-transform duration-500"
            >
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#e0f2fe"
                strokeWidth="15"
              />

              {/* Arc 1: Pendientes (Celeste #38bdf8) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#38bdf8"
                strokeWidth={
                  currentStep.key === 'pendientes' || hoveredSlice === 'pendientes'
                    ? '18'
                    : '14'
                }
                strokeDasharray={`${(pctPendientes / 100) * circumference} ${circumference}`}
                strokeDashoffset={-strokeDashoffsetPendientes}
                className="transition-all duration-300 cursor-pointer hover:opacity-90"
                onClick={() => handleSelectStep(0)}
                onMouseEnter={() => setHoveredSlice('pendientes')}
                onMouseLeave={() => setHoveredSlice(null)}
                style={{
                  opacity:
                    currentStep.key === 'pendientes' || currentStep.key === 'resumen'
                      ? 1
                      : isVideoPlaying
                      ? 0.35
                      : 0.9,
                }}
              />

              {/* Arc 2: En atención (Celeste Intenso #0284c7) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#0284c7"
                strokeWidth={
                  currentStep.key === 'en_atencion' || hoveredSlice === 'en_atencion'
                    ? '18'
                    : '14'
                }
                strokeDasharray={`${(pctEnAtencion / 100) * circumference} ${circumference}`}
                strokeDashoffset={-strokeDashoffsetEnAtencion}
                className="transition-all duration-300 cursor-pointer hover:opacity-90"
                onClick={() => handleSelectStep(1)}
                onMouseEnter={() => setHoveredSlice('en_atencion')}
                onMouseLeave={() => setHoveredSlice(null)}
                style={{
                  opacity:
                    currentStep.key === 'en_atencion' || currentStep.key === 'resumen'
                      ? 1
                      : isVideoPlaying
                      ? 0.35
                      : 0.9,
                }}
              />

              {/* Arc 3: Resueltos (Azul Institucional #0052a5) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#0052a5"
                strokeWidth={
                  currentStep.key === 'resueltos' || hoveredSlice === 'resueltos'
                    ? '18'
                    : '14'
                }
                strokeDasharray={`${(pctResueltos / 100) * circumference} ${circumference}`}
                strokeDashoffset={-strokeDashoffsetResueltos}
                className="transition-all duration-300 cursor-pointer hover:opacity-90"
                onClick={() => handleSelectStep(2)}
                onMouseEnter={() => setHoveredSlice('resueltos')}
                onMouseLeave={() => setHoveredSlice(null)}
                style={{
                  opacity:
                    currentStep.key === 'resueltos' || currentStep.key === 'resumen'
                      ? 1
                      : isVideoPlaying
                      ? 0.35
                      : 0.9,
                }}
              />

              {/* Arc 4: Cancelados (Azul Marino #0a2463) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#0a2463"
                strokeWidth={
                  currentStep.key === 'cancelados' || hoveredSlice === 'cancelados'
                    ? '18'
                    : '14'
                }
                strokeDasharray={`${(pctCancelados / 100) * circumference} ${circumference}`}
                strokeDashoffset={-strokeDashoffsetCancelados}
                className="transition-all duration-300 cursor-pointer hover:opacity-90"
                onClick={() => handleSelectStep(3)}
                onMouseEnter={() => setHoveredSlice('cancelados')}
                onMouseLeave={() => setHoveredSlice(null)}
                style={{
                  opacity:
                    currentStep.key === 'cancelados' || currentStep.key === 'resumen'
                      ? 1
                      : isVideoPlaying
                      ? 0.35
                      : 0.9,
                }}
              />

              {/* DIRECT ON-CHART PERCENTAGE BADGES */}
              {/* Badge 1: Pendientes */}
              <g
                className="cursor-pointer transition-transform duration-300"
                onClick={() => handleSelectStep(0)}
              >
                <circle
                  cx={pos1.x}
                  cy={pos1.y}
                  r={currentStep.key === 'pendientes' ? '7.5' : '6'}
                  fill={currentStep.key === 'pendientes' ? '#0ea5e9' : '#ffffff'}
                  stroke={currentStep.key === 'pendientes' ? '#ffffff' : '#0ea5e9'}
                  strokeWidth={currentStep.key === 'pendientes' ? '2' : '1.5'}
                  className="filter drop-shadow-md"
                />
                <text
                  x={pos1.x}
                  y={pos1.y + 1.8}
                  textAnchor="middle"
                  fill={currentStep.key === 'pendientes' ? '#ffffff' : '#0a2463'}
                  fontSize={currentStep.key === 'pendientes' ? '5.6' : '4.6'}
                  fontWeight="900"
                  fontFamily="Nunito, sans-serif"
                  transform={`rotate(90 ${pos1.x} ${pos1.y})`}
                  className="select-none pointer-events-none"
                >
                  {pctPendientes}%
                </text>
              </g>

              {/* Badge 2: En atención */}
              <g
                className="cursor-pointer transition-transform duration-300"
                onClick={() => handleSelectStep(1)}
              >
                <circle
                  cx={pos2.x}
                  cy={pos2.y}
                  r={currentStep.key === 'en_atencion' ? '7.5' : '6'}
                  fill={currentStep.key === 'en_atencion' ? '#0284c7' : '#ffffff'}
                  stroke={currentStep.key === 'en_atencion' ? '#ffffff' : '#0284c7'}
                  strokeWidth={currentStep.key === 'en_atencion' ? '2' : '1.5'}
                  className="filter drop-shadow-md"
                />
                <text
                  x={pos2.x}
                  y={pos2.y + 1.8}
                  textAnchor="middle"
                  fill={currentStep.key === 'en_atencion' ? '#ffffff' : '#0a2463'}
                  fontSize={currentStep.key === 'en_atencion' ? '5.6' : '4.6'}
                  fontWeight="900"
                  fontFamily="Nunito, sans-serif"
                  transform={`rotate(90 ${pos2.x} ${pos2.y})`}
                  className="select-none pointer-events-none"
                >
                  {pctEnAtencion}%
                </text>
              </g>

              {/* Badge 3: Resueltos */}
              <g
                className="cursor-pointer transition-transform duration-300"
                onClick={() => handleSelectStep(2)}
              >
                <circle
                  cx={pos3.x}
                  cy={pos3.y}
                  r={currentStep.key === 'resueltos' ? '7.5' : '6'}
                  fill={currentStep.key === 'resueltos' ? '#0052a5' : '#ffffff'}
                  stroke={currentStep.key === 'resueltos' ? '#ffffff' : '#0052a5'}
                  strokeWidth={currentStep.key === 'resueltos' ? '2' : '1.5'}
                  className="filter drop-shadow-md"
                />
                <text
                  x={pos3.x}
                  y={pos3.y + 1.8}
                  textAnchor="middle"
                  fill={currentStep.key === 'resueltos' ? '#ffffff' : '#0a2463'}
                  fontSize={currentStep.key === 'resueltos' ? '5.6' : '4.6'}
                  fontWeight="900"
                  fontFamily="Nunito, sans-serif"
                  transform={`rotate(90 ${pos3.x} ${pos3.y})`}
                  className="select-none pointer-events-none"
                >
                  {pctResueltos}%
                </text>
              </g>

              {/* Badge 4: Cancelados */}
              <g
                className="cursor-pointer transition-transform duration-300"
                onClick={() => handleSelectStep(3)}
              >
                <circle
                  cx={pos4.x}
                  cy={pos4.y}
                  r={currentStep.key === 'cancelados' ? '7.5' : '6'}
                  fill={currentStep.key === 'cancelados' ? '#0a2463' : '#ffffff'}
                  stroke={currentStep.key === 'cancelados' ? '#ffffff' : '#0a2463'}
                  strokeWidth={currentStep.key === 'cancelados' ? '2' : '1.5'}
                  className="filter drop-shadow-md"
                />
                <text
                  x={pos4.x}
                  y={pos4.y + 1.8}
                  textAnchor="middle"
                  fill={currentStep.key === 'cancelados' ? '#ffffff' : '#0a2463'}
                  fontSize={currentStep.key === 'cancelados' ? '5.6' : '4.6'}
                  fontWeight="900"
                  fontFamily="Nunito, sans-serif"
                  transform={`rotate(90 ${pos4.x} ${pos4.y})`}
                  className="select-none pointer-events-none"
                >
                  {pctCancelados}%
                </text>
              </g>
            </svg>

            {/* Dynamic Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-300">
              {currentStep.key === 'resumen' ? (
                <>
                  <span className="text-3xl font-black font-display text-[#0a2463] leading-none">
                    {total}
                  </span>
                  <span className="text-[10px] text-[#4b6b94] font-extrabold uppercase tracking-wide">
                    Total
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm">{currentStep.icon}</span>
                  <span
                    className="text-2xl font-black font-display leading-tight"
                    style={{ color: currentStep.color }}
                  >
                    {currentStep.pct}%
                  </span>
                  <span className="text-[9px] font-black text-[#4b6b94] uppercase tracking-tight truncate max-w-[70px]">
                    {currentStep.count} tickets
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Interactive Legend with Click-to-explain support */}
          <div className="space-y-1.5 text-xs flex-1 w-full">
            {explainerSteps.slice(0, 4).map((step, idx) => {
              const isSelected = activeStepIndex === idx;
              return (
                <div
                  key={step.key}
                  onClick={() => handleSelectStep(idx)}
                  className={`flex items-center justify-between p-1.5 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#f0f7ff] border border-[#0284c7] shadow-xs scale-[1.02]'
                      : 'hover:bg-[#f0f7ff]/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: step.color }}
                    />
                    <span
                      className={`text-xs ${
                        isSelected ? 'font-black text-[#0a2463]' : 'font-bold text-[#4b6b94]'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                        isSelected
                          ? 'bg-[#0a2463] text-white'
                          : 'bg-sky-100 text-[#0052a5]'
                      }`}
                    >
                      {step.pct}%
                    </span>
                    <span className="font-extrabold text-[#0a2463] text-[11px] w-6 text-right">
                      {step.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* VIDEO CONTROLLER & TELEPROMPTER EXPLAINER */}
        <div className="mt-3 pt-3 border-t border-[#cce4ff] space-y-2.5">
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-[#4b6b94] mb-1">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] animate-ping inline-block" />
                <span>Paso {activeStepIndex + 1} de {explainerSteps.length}: {currentStep.name}</span>
              </span>
              <span>
                {Math.round((activeStepIndex / (explainerSteps.length - 1)) * 100)}% Explicado
              </span>
            </div>

            <div className="h-2 w-full bg-sky-100 rounded-full overflow-hidden relative cursor-pointer">
              <div
                className="h-full bg-gradient-to-r from-[#38bdf8] via-[#0284c7] to-[#0052a5] transition-all duration-75 rounded-full"
                style={{
                  width: `${
                    (activeStepIndex / (explainerSteps.length - 1)) * 100 +
                    (stepProgress / (explainerSteps.length - 1))
                  }%`,
                }}
              />
            </div>

            <div className="grid grid-cols-5 gap-1 mt-1.5">
              {explainerSteps.map((s, idx) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => handleSelectStep(idx)}
                  className={`py-1 text-[9px] font-black rounded-lg transition-all truncate cursor-pointer ${
                    activeStepIndex === idx
                      ? `${s.badgeClass} shadow-xs scale-105`
                      : 'bg-[#f0f7ff] text-[#0052a5] hover:bg-sky-100'
                  }`}
                  title={s.name}
                >
                  {s.pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Video Subtitle Narration Box (Teleprompter in Navy & Celeste) */}
          <div className="p-3 rounded-2xl bg-[#0a2463] text-white shadow-sm border border-[#0284c7]/40 space-y-1.5 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{currentStep.icon}</span>
                <span className="text-[11px] font-black tracking-wide text-sky-300">
                  {currentStep.title}
                </span>
              </div>
              <span className="text-[9px] font-mono text-sky-100 px-1.5 py-0.5 rounded bg-[#0052a5]">
                {currentStep.stepBadge}
              </span>
            </div>

            <p className="text-[11px] text-white/95 leading-snug font-medium">
              {currentStep.narration}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-sky-400/20 text-[10px] text-sky-200">
              <span className="truncate max-w-[190px]">💡 {currentStep.highlightTip}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="p-1 rounded hover:bg-[#0052a5] text-sky-200 hover:text-white cursor-pointer"
                  title="Paso anterior"
                >
                  <ArrowLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="p-1 rounded hover:bg-[#0052a5] text-sky-200 hover:text-white cursor-pointer"
                  title="Paso siguiente"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Video Playback Action Controls Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleTogglePlayVideo}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-xs ${
                  isVideoPlaying
                    ? 'bg-[#0a2463] hover:bg-[#0052a5] text-white'
                    : 'bg-[#0284c7] hover:bg-[#0052a5] text-white'
                }`}
              >
                {isVideoPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Reproducir Video</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRestartVideo}
                className="p-1.5 rounded-xl bg-[#f0f7ff] hover:bg-sky-100 text-[#0052a5] transition-colors cursor-pointer"
                title="Reiniciar video desde el inicio"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1 bg-[#f0f7ff] p-0.5 rounded-xl border border-[#cce4ff]">
              {[1, 1.5, 2].map(speed => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-white text-[#0052a5] shadow-xs'
                      : 'text-[#4b6b94] hover:text-[#0a2463]'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CINEMA PRESENTATION MODE MODAL */}
        {isCinemaMode && (
          <div className="fixed inset-0 z-50 bg-[#061c47]/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#0a2463] border-2 border-sky-400/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-white shadow-2xl relative space-y-5">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-sky-400/25">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0284c7]/30 border border-sky-400/40 flex items-center justify-center text-sky-300">
                    <Film className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">
                      Video Explicativo · Tickets por Estado
                    </h2>
                    <p className="text-xs text-sky-200">
                      SedaTech · Sistema de Gestión de Tickets
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCinemaMode(false)}
                  className="p-2 rounded-xl bg-[#0052a5] hover:bg-[#0284c7] text-white transition-colors cursor-pointer"
                  title="Cerrar modo cine"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>

              {/* Theater Screen with Large Donut and Spotlight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-[#061c47] p-6 rounded-2xl border border-sky-400/25">
                <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0c2d72" strokeWidth="15" />
                    
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#38bdf8"
                      strokeWidth={currentStep.key === 'pendientes' ? '20' : '14'}
                      strokeDasharray={`${(pctPendientes / 100) * circumference} ${circumference}`}
                      strokeDashoffset={-strokeDashoffsetPendientes}
                      className="transition-all duration-300"
                      style={{ opacity: currentStep.key === 'pendientes' || currentStep.key === 'resumen' ? 1 : 0.3 }}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#0284c7"
                      strokeWidth={currentStep.key === 'en_atencion' ? '20' : '14'}
                      strokeDasharray={`${(pctEnAtencion / 100) * circumference} ${circumference}`}
                      strokeDashoffset={-strokeDashoffsetEnAtencion}
                      className="transition-all duration-300"
                      style={{ opacity: currentStep.key === 'en_atencion' || currentStep.key === 'resumen' ? 1 : 0.3 }}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#0052a5"
                      strokeWidth={currentStep.key === 'resueltos' ? '20' : '14'}
                      strokeDasharray={`${(pctResueltos / 100) * circumference} ${circumference}`}
                      strokeDashoffset={-strokeDashoffsetResueltos}
                      className="transition-all duration-300"
                      style={{ opacity: currentStep.key === 'resueltos' || currentStep.key === 'resumen' ? 1 : 0.3 }}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#93c5fd"
                      strokeWidth={currentStep.key === 'cancelados' ? '20' : '14'}
                      strokeDasharray={`${(pctCancelados / 100) * circumference} ${circumference}`}
                      strokeDashoffset={-strokeDashoffsetCancelados}
                      className="transition-all duration-300"
                      style={{ opacity: currentStep.key === 'cancelados' || currentStep.key === 'resumen' ? 1 : 0.3 }}
                    />

                    {/* Direct Percentages on Donut */}
                    <circle cx={pos1.x} cy={pos1.y} r="7.5" fill={currentStep.key === 'pendientes' ? '#38bdf8' : '#ffffff'} stroke="#ffffff" strokeWidth="1.5" />
                    <text x={pos1.x} y={pos1.y + 1.8} textAnchor="middle" fill={currentStep.key === 'pendientes' ? '#061c47' : '#0a2463'} fontSize="5" fontWeight="900" transform={`rotate(90 ${pos1.x} ${pos1.y})`}>
                      {pctPendientes}%
                    </text>

                    <circle cx={pos2.x} cy={pos2.y} r="7.5" fill={currentStep.key === 'en_atencion' ? '#0284c7' : '#ffffff'} stroke="#ffffff" strokeWidth="1.5" />
                    <text x={pos2.x} y={pos2.y + 1.8} textAnchor="middle" fill={currentStep.key === 'en_atencion' ? '#ffffff' : '#0a2463'} fontSize="5" fontWeight="900" transform={`rotate(90 ${pos2.x} ${pos2.y})`}>
                      {pctEnAtencion}%
                    </text>

                    <circle cx={pos3.x} cy={pos3.y} r="7.5" fill={currentStep.key === 'resueltos' ? '#0052a5' : '#ffffff'} stroke="#ffffff" strokeWidth="1.5" />
                    <text x={pos3.x} y={pos3.y + 1.8} textAnchor="middle" fill={currentStep.key === 'resueltos' ? '#ffffff' : '#0a2463'} fontSize="5" fontWeight="900" transform={`rotate(90 ${pos3.x} ${pos3.y})`}>
                      {pctResueltos}%
                    </text>

                    <circle cx={pos4.x} cy={pos4.y} r="7.5" fill={currentStep.key === 'cancelados' ? '#93c5fd' : '#ffffff'} stroke="#ffffff" strokeWidth="1.5" />
                    <text x={pos4.x} y={pos4.y + 1.8} textAnchor="middle" fill="#0a2463" fontSize="5" fontWeight="900" transform={`rotate(90 ${pos4.x} ${pos4.y})`}>
                      {pctCancelados}%
                    </text>
                  </svg>

                  {/* Center of Donut in Cinema */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl">{currentStep.icon}</span>
                    <span className="text-3xl font-black font-display text-white">
                      {currentStep.key === 'resumen' ? total : `${currentStep.pct}%`}
                    </span>
                    <span className="text-[11px] font-black text-sky-300 uppercase tracking-wider">
                      {currentStep.name}
                    </span>
                  </div>
                </div>

                {/* Narrator Voiceover Box */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-black ${currentStep.badgeClass}`}>
                      {currentStep.stepBadge}
                    </span>
                    <span className="text-xs font-mono text-sky-200">
                      Subtítulo sincronizado
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white">
                    {currentStep.title}
                  </h3>

                  <p className="text-sm text-sky-100 leading-relaxed bg-[#0a2463] p-4 rounded-xl border border-sky-400/30">
                    "{currentStep.narration}"
                  </p>

                  <div className="flex items-center gap-2 text-xs text-sky-300">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{currentStep.highlightTip}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Cinema Controls */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePlayVideo}
                    className="px-5 py-2.5 rounded-xl bg-[#0ea5e9] hover:bg-[#38bdf8] text-white font-black text-sm flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-sky-500/20"
                  >
                    {isVideoPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isVideoPlaying ? 'Pausar Video' : 'Continuar Video'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRestartVideo}
                    className="p-2.5 rounded-xl bg-[#0052a5] hover:bg-[#0284c7] text-white cursor-pointer"
                    title="Reiniciar"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-3 py-2 rounded-xl bg-[#0052a5] hover:bg-[#0284c7] text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-3 py-2 rounded-xl bg-[#0052a5] hover:bg-[#0284c7] text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Siguiente</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CARD 2: Tickets por prioridad (Gráfico circular por prioridad y fondo dinámico según mayor porcentaje) */}
      <div
        className={`${priorityCardTheme.cardBg} ${priorityCardTheme.cardBorder} rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-colors duration-500`}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className={`text-base font-black font-display ${priorityCardTheme.titleText}`}>
              Tickets por prioridad
            </h3>
            <span
              className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wide uppercase shadow-xs ${priorityCardTheme.dominantBadge}`}
            >
              {priorityCardTheme.dominantLabel}
            </span>
          </div>
          <div className="relative shrink-0">
            <select
              value={periodoPrioridad}
              onChange={e => setPeriodoPrioridad(e.target.value)}
              className={`appearance-none border text-xs font-bold py-1 px-3 pr-7 rounded-xl focus:outline-none cursor-pointer ${priorityCardTheme.selectClass}`}
            >
              <option value="Este mes">Este mes</option>
              <option value="Esta semana">Esta semana</option>
              <option value="Este año">Este año</option>
            </select>
            <ChevronDown
              className={`w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${priorityCardTheme.chevronClass}`}
            />
          </div>
        </div>

        {/* Circular Priority Donut Chart + Legend */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1 flex-1">
          <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={priorityCardTheme.trackStroke}
                strokeWidth="15"
              />

              {/* Arc 1: Alta (Rojo #dc2626) */}
              {pctAlta > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#dc2626"
                  strokeWidth={
                    hoveredPrioritySlice === 'alta' ||
                    (!hoveredPrioritySlice && dominantPriority === 'alta')
                      ? '18'
                      : '14'
                  }
                  strokeDasharray={`${(pctAlta / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-prioOffsetAlta}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredPrioritySlice('alta')}
                  onMouseLeave={() => setHoveredPrioritySlice(null)}
                  style={{
                    opacity: hoveredPrioritySlice && hoveredPrioritySlice !== 'alta' ? 0.45 : 1,
                  }}
                />
              )}

              {/* Arc 2: Media (Amarillo #facc15) */}
              {pctMedia > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#facc15"
                  strokeWidth={
                    hoveredPrioritySlice === 'media' ||
                    (!hoveredPrioritySlice && dominantPriority === 'media')
                      ? '18'
                      : '14'
                  }
                  strokeDasharray={`${(pctMedia / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-prioOffsetMedia}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredPrioritySlice('media')}
                  onMouseLeave={() => setHoveredPrioritySlice(null)}
                  style={{
                    opacity: hoveredPrioritySlice && hoveredPrioritySlice !== 'media' ? 0.45 : 1,
                  }}
                />
              )}

              {/* Arc 3: Baja (Verde #16a34a) */}
              {pctBaja > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#16a34a"
                  strokeWidth={
                    hoveredPrioritySlice === 'baja' ||
                    (!hoveredPrioritySlice && dominantPriority === 'baja')
                      ? '18'
                      : '14'
                  }
                  strokeDasharray={`${(pctBaja / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-prioOffsetBaja}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredPrioritySlice('baja')}
                  onMouseLeave={() => setHoveredPrioritySlice(null)}
                  style={{
                    opacity: hoveredPrioritySlice && hoveredPrioritySlice !== 'baja' ? 0.45 : 1,
                  }}
                />
              )}

              {/* Direct Percentages Visible on Circular Chart */}
              {priorityItems.map(item =>
                item.pct > 0 ? (
                  <g
                    key={item.key}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPrioritySlice(item.key)}
                    onMouseLeave={() => setHoveredPrioritySlice(null)}
                  >
                    <circle
                      cx={item.pos.x}
                      cy={item.pos.y}
                      r={activePriorityKey === item.key ? '7.6' : '6.6'}
                      fill={item.badgeFill}
                      stroke="#ffffff"
                      strokeWidth="1.6"
                      className="filter drop-shadow-md transition-all duration-200"
                    />
                    <text
                      x={item.pos.x}
                      y={item.pos.y + 1.8}
                      textAnchor="middle"
                      fill={item.badgeText}
                      fontSize={activePriorityKey === item.key ? '5.2' : '4.6'}
                      fontWeight="900"
                      fontFamily="Nunito, sans-serif"
                      transform={`rotate(90 ${item.pos.x} ${item.pos.y})`}
                      className="select-none pointer-events-none"
                    >
                      {item.pct}%
                    </text>
                  </g>
                ) : null
              )}
            </svg>

            {/* Center Donut Summary */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
              {activePriorityItem ? (
                <>
                  <span
                    className="text-2xl font-black font-display leading-none"
                    style={{
                      color:
                        activePriorityItem.key === 'media'
                          ? '#b45309'
                          : activePriorityItem.color,
                    }}
                  >
                    {activePriorityItem.pct}%
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-wide mt-0.5 ${priorityCardTheme.titleText}`}>
                    {activePriorityItem.label}
                  </span>
                  <span className={`text-[9px] font-bold ${priorityCardTheme.subText}`}>
                    {activePriorityItem.count} tickets
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xl font-black font-display text-slate-500">0%</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Sin datos</span>
                </>
              )}
            </div>
          </div>

          {/* Priority Color Legend */}
          <div className="space-y-2 text-xs flex-1 w-full">
            {priorityItems.map(item => {
              const isHighlighted = activePriorityKey === item.key;
              return (
                <div
                  key={item.key}
                  onMouseEnter={() => setHoveredPrioritySlice(item.key)}
                  onMouseLeave={() => setHoveredPrioritySlice(null)}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-xl border transition-all cursor-pointer ${
                    isHighlighted
                      ? item.activeBorder
                      : 'bg-white/80 border-white/90 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-extrabold text-slate-900 truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-slate-600 text-[11px]">
                      {item.count}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[11px] font-black ${item.badgeBg}`}>
                      {item.pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CARD 3: Acciones rápidas (Azul, Celeste y Blanco) */}
      <div className="bg-white rounded-3xl p-5 border border-[#cce4ff] shadow-xs flex flex-col justify-between">
        <h3 className="text-base font-black font-display text-[#0a2463] mb-3">Acciones rápidas</h3>

        <div className="grid grid-cols-2 gap-3 flex-1">
          {/* Button 1: Registrar ticket (Celeste #0ea5e9) */}
          <button
            onClick={onOpenCreateModal}
            className="p-3.5 rounded-2xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white flex flex-col justify-center items-start gap-2 shadow-sm transition-all cursor-pointer group btn-spring"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-black leading-tight text-left">
              Registrar ticket
            </span>
          </button>

          {/* Button 2: Asignar técnico (Azul Institucional #0052a5) */}
          <button
            onClick={onOpenAssignModal}
            className="p-3.5 rounded-2xl bg-[#0052a5] hover:bg-[#0a2463] text-white flex flex-col justify-center items-start gap-2 shadow-sm transition-all cursor-pointer group btn-spring"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-black leading-tight text-left">
              Asignar técnico
            </span>
          </button>

          {/* Button 3: Ver criterios de prioridad (Azul Marino #0a2463) */}
          <button
            onClick={onOpenCriteriaModal}
            className="p-3.5 rounded-2xl bg-[#0a2463] hover:bg-[#061c47] text-white flex flex-col justify-center items-start gap-2 shadow-sm transition-all cursor-pointer group btn-spring"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-black leading-tight text-left">
              Ver criterios de prioridad
            </span>
          </button>

          {/* Button 4: Exportar reporte (CSV) (Blanco con borde Celeste) */}
          <button
            onClick={handleExportCsv}
            className="p-3.5 rounded-2xl bg-white hover:bg-[#f0f7ff] text-[#0a2463] border-2 border-[#0284c7] flex flex-col justify-center items-start gap-2 shadow-sm transition-all cursor-pointer group btn-spring"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-[#0052a5]" />
            </div>
            <span className="text-xs font-black leading-tight text-left">
              Exportar reporte (CSV)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
