export type Priority = 'alta' | 'media' | 'baja';

export type TicketStatus = 'pendiente' | 'en_atencion' | 'resuelto' | 'cancelado';

export type UserRole = 'administrador' | 'tecnico' | 'usuario';

export interface User {
  id: string;
  username: string;
  nombre: string;
  email: string;
  rol: UserRole;
  cargo: string;
  avatarColor: string;
  avatarEmoji?: string;
  active: boolean;
  ticketsAsignadosCount?: number;
  password?: string;
}

export interface Ticket {
  id: string;
  codigo: string; // Ej: TK-2026-001
  asunto: string;
  descripcion: string;
  categoria: string;
  equipo_modelo?: string; // Ej: "Laptop ASUS ROG Strix G15"
  usuario_id: string;
  usuario: string; // Nombre del usuario creador
  usuario_email: string;
  fecha: string; // ISO string
  prioridad: Priority;
  tecnico_id: string | null;
  tecnico: string | null; // Nombre del técnico
  estado: TicketStatus;
  started?: string | null; // Fecha de inicio de atención (RF-05)
  resolved?: string | null; // Fecha de resolución (RF-05)
  solucion: string | null; // Obligatorio al resolver (RF-05)
  tiempo_resolucion_min?: number | null;
  cancelado_motivo?: string | null;
  updated_at: string;
}

export type EventoAuditoria =
  | 'ticket_creado'
  | 'atencion_iniciada'
  | 'ticket_resuelto'
  | 'ticket_cancelado'
  | 'prioridad_modificada'
  | 'tecnico_asignado'
  | 'usuario_creado'
  | 'usuario_modificado'
  | 'usuario_eliminado';

export interface AuditEntry {
  id: string;
  ticket_codigo: string;
  ticket_id: string;
  evento: EventoAuditoria;
  actor_id: string;
  actor_nombre: string;
  actor_rol: UserRole;
  fecha: string; // ISO string
  detalles: string;
  old_value?: string | null;
  new_value?: string | null;
  notificacion_destinatario: 'tecnico' | 'creador' | null;
  sonido_emitido: boolean;
}

export interface AppNotification {
  id: string;
  destinatario_id: string; // usuario_id, 'all_technicians', or 'all'
  destinatario_rol: UserRole | 'todos';
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  ticket_codigo: string;
  tipo: 'info' | 'success' | 'warning' | 'alert';
}

export interface TableFilters {
  fecha_desde: string;
  fecha_hasta: string;
  estado: TicketStatus | 'todos';
  prioridad: Priority | 'todas';
  busqueda: string;
}

export type AppScreen =
  | 'dashboard'
  | 'mis_tickets'
  | 'nuevo_ticket'
  | 'cola_asignacion'
  | 'mis_asignaciones'
  | 'reportes'
  | 'usuarios'
  | 'configuracion'
  | 'pruebas_aceptacion';

export interface AcceptanceTest {
  id: string; // PA-01 to PA-10
  nombre: string;
  procedimiento: string;
  resultadoEsperado: string;
  estado: 'pendiente' | 'ejecutando' | 'exito' | 'fallido';
  resultadoObtenido?: string;
  timestamp?: string;
}
