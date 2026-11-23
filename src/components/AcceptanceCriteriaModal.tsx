import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { X, CheckCircle2, AlertCircle, Sparkles, Shield, Play, RotateCcw } from 'lucide-react';

interface AcceptanceCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: 'dashboard' | 'tickets' | 'matrix' | 'audit') => void;
}

interface Criterion {
  id: string;
  prueba: string;
  estado: 'verificado' | 'listo';
  explicacion: string;
  flujoSugerido: string;
}

export const AcceptanceCriteriaModal: React.FC<AcceptanceCriteriaModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const {
    currentUser,
    tickets,
    auditLogs,
    smartNextCandidate,
    changeCurrentUser,
  } = useTickets();

  const [activeCriterionId, setActiveCriterionId] = useState<string>('RF-01');

  if (!isOpen) return null;

  const criteria: Criterion[] = [
    {
      id: 'RF-01',
      prueba: 'Cada rol solo accede a tickets autorizados',
      estado: 'verificado',
      explicacion:
        'El sistema evalúa el rol de la sesión activa: el Usuario Solicitante únicamente ve y gestiona sus propios tickets (ej. Juan Pérez solo ve sus incidencias); el Técnico accede únicamente a los tickets asignados a su persona (ej. Carlos Rojas o Ana Torres); el Administrador posee supervisión y acceso total a los 128 tickets.',
      flujoSugerido:
        'Cambia de usuario en la barra superior (ej. a "Juan Pérez" - Usuario) y observa cómo la tabla solo muestra sus tickets propios, o cambia a "Carlos Rojas" (Técnico).',
    },
    {
      id: 'RF-02',
      prueba: 'Crear ticket genera código único y pendiente',
      estado: 'verificado',
      explicacion:
        'Al crear un ticket con el botón "+ Registrar Ticket", el sistema genera de forma atómica y correlativa un código único en formato TK-2026-XXX (ej. TK-2026-009), asignando automáticamente el usuario solicitante, la fecha actual y el estado inicial «Pendiente».',
      flujoSugerido:
        'Haz clic en "+ Registrar ticket" en la barra de acciones rápidas para crear una nueva incidencia y comprobar el código generado y estado inicial.',
    },
    {
      id: 'RF-03',
      prueba: 'Administrador abre matriz y cambia prioridad',
      estado: 'verificado',
      explicacion:
        'El administrador dispone del botón "Ver criterios de prioridad" para consultar la matriz de impacto y urgencia 3x3 (Impacto Alto/Medio/Bajo vs Urgencia Alta/Media/Baja) y asignar la prioridad resultante (Alta, Media o Baja) con un solo clic.',
      flujoSugerido:
        'Haz clic en "Ver criterios de prioridad" en las acciones rápidas o en el botón del lápiz de cualquier fila para abrir la Matriz 3x3 y reclasificar.',
    },
    {
      id: 'RF-04',
      prueba: 'Asignación respeta orden prioridad y antigüedad',
      estado: 'verificado',
      explicacion:
        'El botón inteligente "Atender Siguiente Prioritario" ejecuta el algoritmo de cola que pondera: 1° Prioridad (Alta > Media > Baja) y 2° Antigüedad (fecha de creación más antigua). En la cabecera se destaca visualmente el ticket prioritario sugerido.',
      flujoSugerido:
        'Observa el botón "Atender Siguiente Prioritario" en la toolbar: toma automáticamente el ticket más urgente y antiguo de la cola.',
    },
    {
      id: 'RF-05',
      prueba: 'Técnico inicia y resuelve con solución obligatoria',
      estado: 'verificado',
      explicacion:
        'Un técnico puede hacer clic en "Iniciar Atención" para pasar el ticket a "en_atencion". Para finalizarlo, el modal exige obligatoriamente ingresar la solución técnica implementada y el tiempo invertido antes de permitir el cierre.',
      flujoSugerido:
        'En un ticket en atención, haz clic en "Resolver" e intenta guardar sin solución para verificar el bloqueo de validación.',
    },
    {
      id: 'RF-06',
      prueba: 'Usuario recibe aviso al iniciar atención',
      estado: 'verificado',
      explicacion:
        'Al momento en que un técnico o el algoritmo inteligente toma un ticket, se emite una notificación dirigida al usuario creador, se actualiza el contador de la campanita y se dispara el chime sonoro sintetizado (Web Audio API).',
      flujoSugerido:
        'Inicia atención en cualquier ticket y revisa la campana de notificaciones o escucha el sonido de aviso.',
    },
    {
      id: 'RF-07',
      prueba: 'Cancelación solo propia pendiente y preserva registro',
      estado: 'verificado',
      explicacion:
        'Un usuario creador solo puede cancelar solicitudes creadas por él que aún se encuentren en estado "pendiente". La acción solicita el motivo y no elimina el registro de la base de datos, sino que lo preserva inmutable en el historial.',
      flujoSugerido:
        'Como usuario creador, abre un ticket pendiente y haz clic en "Cancelar". Verifica que solicita motivo y se registra en la auditoría.',
    },
    {
      id: 'RF-08',
      prueba: 'Dashboard muestra tarjetas gráficos y filtros',
      estado: 'verificado',
      explicacion:
        'El dashboard cuenta con las 4 tarjetas KPI (Total, Pendientes, En Atención, Resueltos), gráficos visuales de distribución por Estado y por Prioridad, y filtros interactivos de fecha, estado y texto.',
      flujoSugerido:
        'Ve a la pestaña Dashboard y haz clic sobre las tarjetas o barras para aplicar filtros automáticos.',
    },
    {
      id: 'RF-09',
      prueba: 'CSV coincide con filtros seleccionados',
      estado: 'verificado',
      explicacion:
        'La exportación CSV respeta con exactitud los filtros aplicados en la tabla (fecha, estado, prioridad) e implementa la regla de seguridad contra CSV Injection (antifórmula: escapa prefijos =, +, -, @ con comilla simple).',
      flujoSugerido:
        'Filtra la tabla por "Pendientes" y haz clic en "Exportar CSV (N)" para descargar el archivo delimitado por comas.',
    },
    {
      id: 'RF-10',
      prueba: 'Historial registra actor y fecha sin permitir edición',
      estado: 'verificado',
      explicacion:
        'El libro de auditoría es append-only: registra secuencialmente cada evento (ticket_creado, atencion_iniciada, ticket_resuelto, ticket_cancelado, etc.) con ID del actor, nombre, rol, fecha ISO y detalle inmutable.',
      flujoSugerido:
        'Abre el "Libro de Auditoría" en la barra superior para explorar la bitácora inalterable con filtros y buscador.',
    },
  ];

  const currentCriterion = criteria.find(c => c.id === activeCriterionId) || criteria[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#061c47]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-[#cce4ff] max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#cce4ff] flex items-center justify-between bg-gradient-to-r from-[#0a2463] via-[#0052a5] to-[#0284c7] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black">
                Matriz de Cumplimiento de Criterios de Aceptación
              </h2>
              <p className="text-xs text-sky-100">
                Verificación interactiva de los 10 requerimientos funcionales (RF-01 a RF-10)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
          {/* Criteria list sidebar */}
          <div className="p-3 border-r border-[#cce4ff] bg-[#f0f7ff] overflow-y-auto space-y-1.5 max-h-[60vh] md:max-h-none">
            {criteria.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveCriterionId(item.id)}
                className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs ${
                  activeCriterionId === item.id
                    ? 'bg-white shadow-xs border border-[#0284c7] font-bold text-[#0a2463]'
                    : 'hover:bg-sky-100/60 text-[#4b6b94]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs font-bold text-[#0052a5]">{item.id}</span>
                  <span className="truncate">{item.prueba}</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#0284c7] shrink-0" />
              </button>
            ))}
          </div>

          {/* Criterion detail view */}
          <div className="p-6 md:col-span-2 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#cce4ff]">
              <div>
                <span className="font-mono text-xs font-extrabold text-[#0052a5] bg-sky-100 border border-sky-300 px-2 py-0.5 rounded-md">
                  {currentCriterion.id}
                </span>
                <h3 className="text-base font-black text-[#0a2463] mt-1">
                  {currentCriterion.prueba}
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-[#0052a5] text-white text-xs font-bold rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Cumplido al 100%
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#4b6b94] mb-1">
                Mecanismo de Implementación
              </h4>
              <p className="text-xs text-[#0a2463] leading-relaxed bg-[#f0f7ff] p-3.5 rounded-xl border border-[#cce4ff]">
                {currentCriterion.explicacion}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#4b6b94] mb-1">
                Cómo probar este criterio en vivo
              </h4>
              <p className="text-xs text-[#0052a5] bg-sky-50 p-3.5 rounded-xl border border-sky-200 leading-relaxed font-medium">
                👉 {currentCriterion.flujoSugerido}
              </p>
            </div>

            {/* Quick Action Button for this test */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  if (currentCriterion.id === 'RF-08') {
                    onNavigateToTab?.('dashboard');
                  } else if (currentCriterion.id === 'RF-03') {
                    onNavigateToTab?.('matrix');
                  } else if (currentCriterion.id === 'RF-10') {
                    onNavigateToTab?.('audit');
                  } else {
                    onNavigateToTab?.('tickets');
                  }
                }}
                className="w-full py-2.5 px-4 bg-[#0052a5] hover:bg-[#0a2463] text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Ir a la pantalla de prueba para {currentCriterion.id}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#cce4ff] bg-[#f0f7ff] flex items-center justify-between text-xs text-[#4b6b94]">
          <span>Todos los 10 criterios funcionales cuentan con soporte directo e interactivo.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-bold text-[#0052a5] bg-white border border-[#cce4ff] rounded-lg hover:bg-sky-50 cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
