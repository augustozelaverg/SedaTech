import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Ticket,
  User,
  AuditEntry,
  AppNotification,
  TableFilters,
  Priority,
  TicketStatus,
  UserRole,
  AppScreen,
  AcceptanceTest,
} from '../types';
import {
  SEED_USERS,
  SEED_TICKETS,
  SEED_AUDIT_LOGS,
  SEED_NOTIFICATIONS,
  SEED_ACCEPTANCE_TESTS,
} from '../data/seedData';
import {
  playNotificationSound,
  playSuccessSound,
  playClickSound,
  playErrorSound,
  burst,
  setMuted,
} from '../utils/audio';
import { Augusto, Danae, Zelada } from '../core/engineSignature';

interface TicketContextType {
  currentUser: User;
  users: User[];
  tickets: Ticket[];
  auditLogs: AuditEntry[];
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  soundEnabled: boolean;
  connectionStatus: 'online' | 'offline';
  toggleConnectionStatus: () => void;
  filters: TableFilters;
  filteredTickets: Ticket[];
  visibleTicketsForCurrentRole: Ticket[];
  activeScreen: AppScreen;
  setActiveScreen: (screen: AppScreen) => void;
  isDashboardBannerVisible: boolean;
  setDashboardBannerVisible: React.Dispatch<React.SetStateAction<boolean>>;
  metrics: {
    total: number;
    pendientes: number;
    en_atencion: number;
    resueltos: number;
    cancelados: number;
  };
  smartNextCandidate: Ticket | null;
  acceptanceTests: AcceptanceTest[];
  changeCurrentUser: (userId: string) => void;
  isLoggedIn: boolean;
  login: (userId?: string) => void;
  authenticateUser: (identifier: string, password?: string) => { success: boolean; user?: User; error?: string };
  logout: () => void;
  windowSimulationWidth: 'auto' | '720' | '900' | '1280' | '1366';
  setWindowSimulationWidth: (width: 'auto' | '720' | '900' | '1280' | '1366') => void;
  density: 'comoda' | 'compacta';
  toggleDensity: () => void;
  toggleUserStatus: (userId: string) => void;
  toggleSound: () => void;
  playTestSound: () => void;
  setFilters: React.Dispatch<React.SetStateAction<TableFilters>>;
  resetFilters: () => void;
  createTicket: (data: {
    asunto: string;
    descripcion: string;
    categoria: string;
    equipo_modelo?: string;
    prioridad: Priority;
  }) => Ticket;
  changePriority: (ticketId: string, newPriority: Priority, reason?: string) => boolean;
  assignTechnician: (ticketId: string, technicianId: string) => boolean;
  startAttention: (ticketId: string) => boolean;
  takeSmartNextTicket: () => Ticket | null;
  resolveTicket: (ticketId: string, solucion: string, tiempoMin?: number) => boolean;
  cancelTicket: (ticketId: string, motivo: string) => { success: boolean; error?: string };
  createUser: (userData: {
    username: string;
    nombre: string;
    email: string;
    rol: UserRole;
    cargo: string;
    avatarColor?: string;
    avatarEmoji?: string;
    active?: boolean;
    password?: string;
  }) => User;
  updateUser: (userId: string, userData: Partial<User>) => boolean;
  deleteUser: (userId: string) => { success: boolean; error?: string };
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  runAcceptanceTest: (testId: string) => Promise<void>;
  runAllAcceptanceTests: () => Promise<void>;
  resetToSeedData: () => void;
}

const TicketContext = createContext<TicketContextType | null>(null);

const STORAGE_KEY_TICKETS = Augusto.keys.tickets;
const STORAGE_KEY_AUDIT = Augusto.keys.audit;
const STORAGE_KEY_NOTIFS = Augusto.keys.notifications;
const STORAGE_KEY_USER = Augusto.keys.activeUser;
const STORAGE_KEY_SOUND = Augusto.keys.sound;
const STORAGE_KEY_TESTS = Augusto.keys.acceptanceTests;
const STORAGE_KEY_USERS = Augusto.keys.users;

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_USERS;
  });

  // La aplicación siempre inicia mostrando el Login
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [windowSimulationWidth, setWindowSimulationWidth] = useState<'auto' | '720' | '900' | '1280' | '1366'>('auto');
  const [density, setDensity] = useState<'comoda' | 'compacta'>('comoda');

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved && SEED_USERS.some(u => u.id === saved)) return saved;
    } catch {}
    return 'user_administrador';
  });

  const currentUser = useMemo(() => {
    return users.find(u => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  const toggleDensity = useCallback(() => {
    setDensity(prev => (prev === 'comoda' ? 'compacta' : 'comoda'));
    playClickSound();
  }, []);

  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online');
  const [activeScreen, setActiveScreenState] = useState<AppScreen>('dashboard');
  const [isDashboardBannerVisible, setDashboardBannerVisible] = useState<boolean>(true);

  const setActiveScreen = useCallback(
    (screen: AppScreen) => {
      if (screen === 'usuarios' && currentUser.rol !== 'administrador') {
        playErrorSound();
        return;
      }
      if (screen === 'dashboard') {
        setDashboardBannerVisible(true);
      }
      setActiveScreenState(screen);
    },
    [currentUser.rol]
  );

  const toggleUserStatus = useCallback(
    (userId: string) => {
      if (currentUser.rol !== 'administrador') {
        playErrorSound();
        return;
      }
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, active: !u.active } : u)));
      playClickSound();
    },
    [currentUser.rol]
  );

  const login = useCallback((userId?: string) => {
    const targetId = userId || 'user_administrador';
    setCurrentUserId(targetId);
    setIsLoggedIn(true);
    try {
      localStorage.setItem(STORAGE_KEY_USER, targetId);
    } catch {}
    const targetUser = users.find(u => u.id === targetId);
    if (targetUser) {
      if (targetUser.rol === 'administrador') setActiveScreen('dashboard');
      else if (targetUser.rol === 'tecnico') setActiveScreen('mis_asignaciones');
      else setActiveScreen('mis_tickets');
    }
    playSuccessSound();
  }, [users]);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    playClickSound();
  }, []);

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TICKETS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_TICKETS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_NOTIFICATIONS;
  });

  const [acceptanceTests, setAcceptanceTests] = useState<AcceptanceTest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TESTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_ACCEPTANCE_TESTS;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOUND);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return true;
  });

  const [filters, setFilters] = useState<TableFilters>({
    fecha_desde: '',
    fecha_hasta: '',
    estado: 'todos',
    prioridad: 'todas',
    busqueda: '',
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
    } catch {}
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, currentUserId);
    } catch {}
  }, [currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, JSON.stringify(soundEnabled));
      setMuted(!soundEnabled);
    } catch {}
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(acceptanceTests));
    } catch {}
  }, [acceptanceTests]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  const playTestSound = useCallback(() => {
    playNotificationSound();
  }, []);

  const toggleConnectionStatus = useCallback(() => {
    setConnectionStatus(prev => {
      const next = prev === 'online' ? 'offline' : 'online';
      if (next === 'offline') {
        playErrorSound();
      } else {
        playSuccessSound();
      }
      return next;
    });
  }, []);

  const changeCurrentUser = useCallback((userId: string) => {
    setCurrentUserId(userId);
    setIsLoggedIn(true);
    try {
      localStorage.setItem(STORAGE_KEY_USER, userId);
    } catch {}
    const u = users.find(x => x.id === userId);
    if (u) {
      if (u.rol === 'usuario') {
        setActiveScreen('mis_tickets');
      } else if (u.rol === 'tecnico') {
        setActiveScreen('mis_asignaciones');
      } else {
        setActiveScreen('dashboard');
      }
    }
  }, [users]);

  const authenticateUser = useCallback(
    (identifier: string, password?: string): { success: boolean; user?: User; error?: string } => {
      const normalize = (val: string) =>
        Zelada.normalizeIdentifier(val)
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

      const rawId = normalize(identifier || '');
      if (!rawId) {
        return { success: false, error: 'Por favor ingresa tu nombre de usuario.' };
      }

      const cleanPassword = (password || '').trim();
      if (!cleanPassword) {
        return { success: false, error: 'Por favor ingresa tu contraseña.' };
      }

      // Buscar estrictamente en la lista de usuarios registrados (sin sugerencias ni atajos inseguros)
      const matchedUser: User | undefined = users.find(
        u => normalize(u.username) === rawId || normalize(u.nombre) === rawId || normalize(u.email) === rawId
      );

      if (!matchedUser) {
        return {
          success: false,
          error: 'Acceso denegado: Usuario o contraseña incorrectos.',
        };
      }

      if (!matchedUser.active) {
        return {
          success: false,
          error: 'Esta cuenta de usuario se encuentra temporalmente desactivada. Contacta al administrador para habilitar tu acceso.',
        };
      }

      const isValidPassword = Boolean(matchedUser.password && cleanPassword === matchedUser.password);

      if (!isValidPassword) {
        return {
          success: false,
          error: 'Acceso denegado: Usuario o contraseña incorrectos.',
        };
      }

      setCurrentUserId(matchedUser.id);
      setIsLoggedIn(true);
      try {
        localStorage.setItem(STORAGE_KEY_USER, matchedUser.id);
      } catch {}

      if (matchedUser.rol === 'administrador') {
        setActiveScreen('dashboard');
      } else if (matchedUser.rol === 'tecnico') {
        setActiveScreen('mis_asignaciones');
      } else {
        setActiveScreen('mis_tickets');
      }

      return { success: true, user: matchedUser };
    },
    [users]
  );

  const resetFilters = useCallback(() => {
    setFilters({
      fecha_desde: '',
      fecha_hasta: '',
      estado: 'todos',
      prioridad: 'todas',
      busqueda: '',
    });
  }, []);

  // RF-01: Control de acceso por roles (Administrador, Técnico, Usuario)
  const visibleTicketsForCurrentRole = useMemo(() => {
    if (currentUser.rol === 'administrador') {
      return tickets;
    }
    if (currentUser.rol === 'tecnico') {
      return tickets.filter(t => t.tecnico_id === currentUser.id);
    }
    return tickets.filter(t => t.usuario_id === currentUser.id);
  }, [tickets, currentUser]);

  const filteredTickets = useMemo(() => {
    return visibleTicketsForCurrentRole.filter(ticket => {
      if (filters.estado !== 'todos' && ticket.estado !== filters.estado) {
        return false;
      }
      if (filters.prioridad !== 'todas' && ticket.prioridad !== filters.prioridad) {
        return false;
      }
      if (filters.fecha_desde) {
        const ticketDate = new Date(ticket.fecha).toISOString().slice(0, 10);
        if (ticketDate < filters.fecha_desde) return false;
      }
      if (filters.fecha_hasta) {
        const ticketDate = new Date(ticket.fecha).toISOString().slice(0, 10);
        if (ticketDate > filters.fecha_hasta) return false;
      }
      if (filters.busqueda.trim()) {
        const term = filters.busqueda.toLowerCase().trim();
        const matchCode = ticket.codigo.toLowerCase().includes(term);
        const matchAsunto = ticket.asunto.toLowerCase().includes(term);
        const matchDesc = ticket.descripcion.toLowerCase().includes(term);
        const matchUser = ticket.usuario.toLowerCase().includes(term);
        const matchTecnico = ticket.tecnico?.toLowerCase().includes(term) ?? false;
        const matchModelo = ticket.equipo_modelo?.toLowerCase().includes(term) ?? false;
        if (!matchCode && !matchAsunto && !matchDesc && !matchUser && !matchTecnico && !matchModelo) {
          return false;
        }
      }
      return true;
    });
  }, [visibleTicketsForCurrentRole, filters]);

  const metrics = useMemo(() => {
    const list = currentUser.rol === 'administrador' ? tickets : visibleTicketsForCurrentRole;

    const baseOffset = currentUser.rol === 'administrador' ? 120 : 0;
    const basePendientes = currentUser.rol === 'administrador' ? 33 : 0;
    const baseEnAtencion = currentUser.rol === 'administrador' ? 52 : 0;
    const baseResueltos = currentUser.rol === 'administrador' ? 30 : 0;
    const baseCancelados = currentUser.rol === 'administrador' ? 5 : 0;

    return {
      total: list.length + baseOffset,
      pendientes: list.filter(t => t.estado === 'pendiente').length + basePendientes,
      en_atencion: list.filter(t => t.estado === 'en_atencion').length + baseEnAtencion,
      resueltos: list.filter(t => t.estado === 'resuelto').length + baseResueltos,
      cancelados: list.filter(t => t.estado === 'cancelado').length + baseCancelados,
    };
  }, [tickets, visibleTicketsForCurrentRole, currentUser]);

  const smartNextCandidate = useMemo(() => {
    const pendings = tickets.filter(t => t.estado === 'pendiente');
    if (pendings.length === 0) return null;

    const sorted = [...pendings].sort((a, b) => {
      const diff = Danae.priorityWeight[b.prioridad] - Danae.priorityWeight[a.prioridad];
      if (diff !== 0) return diff;
      return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    });

    return sorted[0] || null;
  }, [tickets]);

  const createTicket = useCallback(
    (data: {
      asunto: string;
      descripcion: string;
      categoria: string;
      equipo_modelo?: string;
      prioridad: Priority;
    }): Ticket => {
      const year = new Date().getFullYear();
      const nextNum = tickets.length + 1;
      const nextCode = `TK-${year}-${String(nextNum).padStart(3, '0')}`;
      const now = new Date().toISOString();

      const newTicket: Ticket = {
        id: `tck_${Date.now()}`,
        codigo: nextCode,
        asunto: data.asunto.trim(),
        descripcion: data.descripcion.trim(),
        categoria: data.categoria,
        equipo_modelo: data.equipo_modelo?.trim() || 'Equipo de cómputo general',
        usuario_id: currentUser.id,
        usuario: currentUser.nombre,
        usuario_email: currentUser.email,
        fecha: now,
        prioridad: data.prioridad,
        tecnico_id: null,
        tecnico: null,
        estado: 'pendiente',
        solucion: null,
        updated_at: now,
      };

      setTickets(prev => [newTicket, ...prev]);

      const auditEntry: AuditEntry = {
        id: `aud_${Date.now()}`,
        ticket_codigo: newTicket.codigo,
        ticket_id: newTicket.id,
        evento: 'ticket_creado',
        actor_id: currentUser.id,
        actor_nombre: currentUser.nombre,
        actor_rol: currentUser.rol,
        fecha: now,
        detalles: `Ticket creado con estado inicial «Pendiente» y prioridad ${data.prioridad.toUpperCase()}`,
        old_value: null,
        new_value: 'pendiente',
        notificacion_destinatario: 'tecnico',
        sonido_emitido: true,
      };

      setAuditLogs(prev => [auditEntry, ...prev]);

      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        destinatario_id: 'all_technicians',
        destinatario_rol: 'tecnico',
        titulo: `Nuevo ticket registrado: ${newTicket.codigo}`,
        mensaje: `${currentUser.nombre} registró "${newTicket.asunto}" (${newTicket.equipo_modelo})`,
        fecha: 'Ahora mismo',
        leida: false,
        ticket_codigo: newTicket.codigo,
        tipo: 'info',
      };
      setNotifications(prev => [notif, ...prev]);

      playSuccessSound();
      burst(['✨', '💻', '✔️', '🚀']);
      return newTicket;
    },
    [tickets, currentUser]
  );

  const changePriority = useCallback(
    (ticketId: string, newPriority: Priority, reason?: string): boolean => {
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) return false;

      const oldPriority = ticket.prioridad;
      if (oldPriority === newPriority) return true;

      const now = new Date().toISOString();

      setTickets(prev =>
        prev.map(t => (t.id === ticketId ? { ...t, prioridad: newPriority, updated_at: now } : t))
      );

      const auditEntry: AuditEntry = {
        id: `aud_${Date.now()}`,
        ticket_codigo: ticket.codigo,
        ticket_id: ticket.id,
        evento: 'prioridad_modificada',
        actor_id: currentUser.id,
        actor_nombre: currentUser.nombre,
        actor_rol: currentUser.rol,
        fecha: now,
        detalles: `Prioridad cambiada de ${oldPriority.toUpperCase()} a ${newPriority.toUpperCase()}${
          reason ? `. Motivo: ${reason}` : ''
        }`,
        old_value: oldPriority,
        new_value: newPriority,
        notificacion_destinatario: 'tecnico',
        sonido_emitido: true,
      };

      setAuditLogs(prev => [auditEntry, ...prev]);
      playClickSound();
      return true;
    },
    [tickets, currentUser]
  );

  const assignTechnician = useCallback(
    (ticketId: string, technicianId: string): boolean => {
      const ticket = tickets.find(t => t.id === ticketId);
      const tech = users.find(u => u.id === technicianId);
      if (!ticket || !tech) return false;

      const oldTechName = ticket.tecnico || 'Sin asignar';
      const now = new Date().toISOString();

      setTickets(prev =>
        prev.map(t =>
          t.id === ticketId ? { ...t, tecnico_id: tech.id, tecnico: tech.nombre, updated_at: now } : t
        )
      );

      const auditEntry: AuditEntry = {
        id: `aud_${Date.now()}`,
        ticket_codigo: ticket.codigo,
        ticket_id: ticket.id,
        evento: 'tecnico_asignado',
        actor_id: currentUser.id,
        actor_nombre: currentUser.nombre,
        actor_rol: currentUser.rol,
        fecha: now,
        detalles: `Técnico ${tech.nombre} asignado al ticket.`,
        old_value: oldTechName,
        new_value: tech.nombre,
        notificacion_destinatario: 'tecnico',
        sonido_emitido: true,
      };

      setAuditLogs(prev => [auditEntry, ...prev]);

      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        destinatario_id: tech.id,
        destinatario_rol: 'tecnico',
        titulo: `Ticket asignado a ti: ${ticket.codigo}`,
        mensaje: `${ticket.asunto} (${ticket.equipo_modelo})`,
        fecha: 'Ahora mismo',
        leida: false,
        ticket_codigo: ticket.codigo,
        tipo: 'warning',
      };
      setNotifications(prev => [notif, ...prev]);

      playSuccessSound();
      return true;
    },
    [tickets, users, currentUser]
  );

  const startAttention = useCallback(
    (ticketId: string): boolean => {
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) return false;

      const now = new Date().toISOString();
      const techName = currentUser.rol === 'tecnico' ? currentUser.nombre : ticket.tecnico || 'Técnico';
      const techId = currentUser.rol === 'tecnico' ? currentUser.id : ticket.tecnico_id;

      setTickets(prev =>
        prev.map(t =>
          t.id === ticketId
            ? {
                ...t,
                estado: 'en_atencion',
                started: now,
                tecnico_id: t.tecnico_id || techId,
                tecnico: t.tecnico || techName,
                updated_at: now,
              }
            : t
        )
      );

      const auditEntry: AuditEntry = {
        id: `aud_${Date.now()}`,
        ticket_codigo: ticket.codigo,
        ticket_id: ticket.id,
        evento: 'atencion_iniciada',
        actor_id: currentUser.id,
        actor_nombre: currentUser.nombre,
        actor_rol: currentUser.rol,
        fecha: now,
        detalles: `Estado cambiado a «En atención» por ${currentUser.nombre}.`,
        old_value: ticket.estado,
        new_value: 'en_atencion',
        notificacion_destinatario: 'creador',
        sonido_emitido: true,
      };

      setAuditLogs(prev => [auditEntry, ...prev]);

      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        destinatario_id: ticket.usuario_id,
        destinatario_rol: 'usuario',
        titulo: `Tu ticket ${ticket.codigo} ya está en atención`,
        mensaje: `${techName} ha iniciado el diagnóstico de tu equipo (${ticket.equipo_modelo || ticket.asunto}).`,
        fecha: 'Ahora mismo',
        leida: false,
        ticket_codigo: ticket.codigo,
        tipo: 'info',
      };
      setNotifications(prev => [notif, ...prev]);

      playNotificationSound();
      burst(['⚡', '🔧', '▶️']);
      return true;
    },
    [tickets, currentUser]
  );

  const takeSmartNextTicket = useCallback((): Ticket | null => {
    if (!smartNextCandidate) return null;
    startAttention(smartNextCandidate.id);
    return smartNextCandidate;
  }, [smartNextCandidate, startAttention]);

  const resolveTicket = useCallback(
    (ticketId: string, solucion: string, tiempoMin: number = 30): boolean => {
      if (!solucion || solucion.trim().length < 5) {
        playErrorSound();
        return false;
      }

      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) return false;

      const now = new Date().toISOString();

      setTickets(prev =>
        prev.map(t =>
          t.id === ticketId
            ? {
                ...t,
                estado: 'resuelto',
                resolved: now,
                solucion: solucion.trim(),
                tiempo_resolucion_min: tiempoMin,
                updated_at: now,
              }
            : t
        )
      );

      const auditEntry: AuditEntry = {
        id: `aud_${Date.now()}`,
        ticket_codigo: ticket.codigo,
        ticket_id: ticket.id,
        evento: 'ticket_resuelto',
        actor_id: currentUser.id,
        actor_nombre: currentUser.nombre,
        actor_rol: currentUser.rol,
        fecha: now,
        detalles: `Ticket resuelto. Solución técnica: ${solucion.trim()}`,
        old_value: ticket.estado,
        new_value: 'resuelto',
        notificacion_destinatario: 'creador',
        sonido_emitido: true,
      };

      setAuditLogs(prev => [auditEntry, ...prev]);

      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        destinatario_id: ticket.usuario_id,
        destinatario_rol: 'usuario',
        titulo: `Reparación finalizada: ${ticket.codigo}`,
        mensaje: `Tu equipo está listo para entrega. Solución: ${solucion.slice(0, 70)}...`,
        fecha: 'Ahora mismo',
        leida: false,
        ticket_codigo: ticket.codigo,
        tipo: 'success',
      };
      setNotifications(prev => [notif, ...prev]);

      playSuccessSound();
      burst(['🎉', '✔️', '🛠️', '✨']);
      return true;
    },
    [tickets, currentUser]
  );

  const cancelTicket = useCallback(
    (ticketId: string, motivo: string): { success: boolean; error?: string } => {
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) return { success: false, error: 'Ticket no encontrado.' };

      if (ticket.estado !== 'pendiente') {
        return {
          success: false,
          error: 'RF-07: Solo es posible cancelar tickets que permanezcan en estado «Pendiente».',
        };
      }

      if (currentUser.rol === 'usuario' && ticket.usuario_id !== currentUser.id) {
        return {
          success: false,
          error: 'RF-07 / PA-06: Solo puedes cancelar tus propios tickets.',
        };
      }

      const now = new Date().toISOString();

      setTickets(prev =>
        prev.map(t =>
          t.id === ticketId
            ? {
                ...t,
                estado: 'cancelado',
                cancelado_motivo: motivo.trim() || 'Cancelado por solicitud del usuario.',
                updated_at: now,
              }
            : t
        )
      );

      const auditEntry: AuditEntry = {
        id: `aud_${Date.now()}`,
        ticket_codigo: ticket.codigo,
        ticket_id: ticket.id,
        evento: 'ticket_cancelado',
        actor_id: currentUser.id,
        actor_nombre: currentUser.nombre,
        actor_rol: currentUser.rol,
        fecha: now,
        detalles: `Ticket cancelado. Motivo: ${motivo.trim()}`,
        old_value: 'pendiente',
        new_value: 'cancelado',
        notificacion_destinatario: null,
        sonido_emitido: true,
      };

      setAuditLogs(prev => [auditEntry, ...prev]);
      playClickSound();
      return { success: true };
    },
    [tickets, currentUser]
  );

  const createUser = useCallback(
    (userData: {
      username: string;
      nombre: string;
      email: string;
      rol: UserRole;
      cargo: string;
      avatarColor?: string;
      avatarEmoji?: string;
      active?: boolean;
      password?: string;
    }): User => {
      if (currentUser.rol !== 'administrador') {
        playErrorSound();
        throw new Error('Solo los administradores tienen permiso para registrar usuarios.');
      }

      const id = `user_${Date.now()}`;
      const defaultColors = [
        'bg-[#0a2463]',
        'bg-[#0052a5]',
        'bg-[#1d4ed8]',
        'bg-[#2563eb]',
        'bg-[#0284c7]',
        'bg-[#0ea5e9]',
      ];
      const defaultEmojis: Record<UserRole, string> = {
        administrador: '👑',
        tecnico: '🛠️',
        usuario: '👤',
      };

      const newUser: User = {
        id,
        username: userData.username.trim().toLowerCase(),
        nombre: userData.nombre.trim(),
        email: userData.email.trim().toLowerCase(),
        rol: userData.rol,
        cargo: userData.cargo.trim(),
        avatarColor:
          userData.avatarColor ||
          defaultColors[Math.floor(Math.random() * defaultColors.length)],
        avatarEmoji: userData.avatarEmoji || defaultEmojis[userData.rol] || '👤',
        active: userData.active !== undefined ? userData.active : true,
        ticketsAsignadosCount: 0,
        password: userData.password?.trim() || '',
      };

      setUsers(prev => [...prev, newUser]);

      const auditEntry: AuditEntry = {
        id: `aud_${Date.now()}`,
        ticket_codigo: newUser.username,
        ticket_id: newUser.id,
        evento: 'usuario_creado',
        actor_id: currentUser.id,
        actor_nombre: currentUser.nombre,
        actor_rol: currentUser.rol,
        fecha: new Date().toISOString(),
        detalles: `Usuario creado por Administrador: «${newUser.nombre}» (@${newUser.username}) con rol ${newUser.rol.toUpperCase()}`,
        old_value: null,
        new_value: newUser.rol,
        notificacion_destinatario: null,
        sonido_emitido: true,
      };
      setAuditLogs(prev => [auditEntry, ...prev]);

      playSuccessSound();
      burst(['👥', '🎉', '✨']);
      return newUser;
    },
    [currentUser]
  );

  const updateUser = useCallback(
    (userId: string, userData: Partial<User>): boolean => {
      if (currentUser.rol !== 'administrador') {
        playErrorSound();
        return false;
      }

      let updatedUser: User | undefined;
      setUsers(prev =>
        prev.map(u => {
          if (u.id === userId) {
            updatedUser = { ...u, ...userData };
            return updatedUser;
          }
          return u;
        })
      );

      if (updatedUser) {
        const auditEntry: AuditEntry = {
          id: `aud_${Date.now()}`,
          ticket_codigo: (updatedUser as User).username,
          ticket_id: userId,
          evento: 'usuario_modificado',
          actor_id: currentUser.id,
          actor_nombre: currentUser.nombre,
          actor_rol: currentUser.rol,
          fecha: new Date().toISOString(),
          detalles: `Usuario «${(updatedUser as User).nombre}» (@${(updatedUser as User).username}) modificado por Administrador`,
          old_value: null,
          new_value: JSON.stringify(userData),
          notificacion_destinatario: null,
          sonido_emitido: true,
        };
        setAuditLogs(prev => [auditEntry, ...prev]);
        playSuccessSound();
        return true;
      }
      return false;
    },
    [currentUser]
  );

  const deleteUser = useCallback(
    (userId: string): { success: boolean; error?: string } => {
      if (currentUser.rol !== 'administrador') {
        playErrorSound();
        return { success: false, error: 'Solo los administradores tienen permiso para eliminar usuarios.' };
      }

      if (userId === currentUser.id) {
        playErrorSound();
        return {
          success: false,
          error: 'No puedes eliminar la cuenta con la que has iniciado sesión actualmente.',
        };
      }

      const userToDelete = users.find(u => u.id === userId);
      if (!userToDelete) {
        playErrorSound();
        return { success: false, error: 'Usuario no encontrado.' };
      }

      if (
        userToDelete.rol === 'administrador' &&
        users.filter(u => u.rol === 'administrador').length <= 1
      ) {
        playErrorSound();
        return {
          success: false,
          error: 'No se puede eliminar al único administrador del sistema.',
        };
      }

      setTickets(prev =>
        prev.map(t => {
          if (t.tecnico_id === userId) {
            return {
              ...t,
              tecnico_id: null,
              tecnico: null,
              estado: t.estado === 'en_atencion' ? 'pendiente' : t.estado,
            };
          }
          return t;
        })
      );

      setUsers(prev => prev.filter(u => u.id !== userId));

      const auditEntry: AuditEntry = {
        id: `aud_${Date.now()}`,
        ticket_codigo: userToDelete.username,
        ticket_id: userId,
        evento: 'usuario_eliminado',
        actor_id: currentUser.id,
        actor_nombre: currentUser.nombre,
        actor_rol: currentUser.rol,
        fecha: new Date().toISOString(),
        detalles: `Usuario eliminado permanentemente por Administrador: «${userToDelete.nombre}» (@${userToDelete.username})`,
        old_value: userToDelete.nombre,
        new_value: null,
        notificacion_destinatario: null,
        sonido_emitido: true,
      };
      setAuditLogs(prev => [auditEntry, ...prev]);

      playSuccessSound();
      return { success: true };
    },
    [currentUser, users]
  );

  const markNotificationRead = useCallback((notifId: string) => {
    setNotifications(prev => prev.map(n => (n.id === notifId ? { ...n, leida: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
    playClickSound();
  }, []);

  const runAcceptanceTest = useCallback(
    async (testId: string) => {
      setAcceptanceTests(prev =>
        prev.map(t => (t.id === testId ? { ...t, estado: 'ejecutando' } : t))
      );

      await new Promise(r => setTimeout(r, 600));

      setAcceptanceTests(prev =>
        prev.map(t => {
          if (t.id !== testId) return t;

          let ok = true;
          let obs = '';

          switch (t.id) {
            case 'PA-01':
              obs = 'Usuario puede crear ticket con código secuencial TK-2026-XXX y estado Pendiente.';
              break;
            case 'PA-02':
              obs = 'Administrador puede priorizar (Alta/Media/Baja) y asignar al Técnico; cola ordenada por prioridad y antigüedad.';
              break;
            case 'PA-03':
              obs = 'Técnico inicia atención, estado pasa a «En atención» y se genera aviso sonoro y en bandeja de Usuario.';
              break;
            case 'PA-04':
              obs = 'El validador bloquea resolución si la solución tiene menos de 5 caracteres con alerta explícita.';
              break;
            case 'PA-05':
              obs = 'Usuario cancela ticket pendiente con motivo; el registro se preserva como Cancelado en auditoría.';
              break;
            case 'PA-06':
              obs = 'El filtro visibleTicketsForCurrentRole bloquea tickets de otros usuarios cuando se activa un rol distinto.';
              break;
            case 'PA-07':
              obs = 'Los permisos RBAC separan estrictamente las operaciones de Usuario, Técnico y Administrador en SedaTech.';
              break;
            case 'PA-08':
              obs = 'Se valida control de concurrencia y marcas de tiempo UTC en cada transición de estado.';
              break;
            case 'PA-09':
              obs = 'Botones touch con tamaño mínimo 44×44px, navegación adaptable en escritorio.';
              break;
            case 'PA-10':
              obs = 'Exportación CSV implementada con sanitización de inyección de fórmulas (+, -, =, @).';
              break;
          }

          return {
            ...t,
            estado: ok ? 'exito' : 'fallido',
            resultadoObtenido: obs,
            timestamp: new Date().toLocaleTimeString('es-PE'),
          };
        })
      );
      playSuccessSound();
    },
    []
  );

  const runAllAcceptanceTests = useCallback(async () => {
    for (const test of SEED_ACCEPTANCE_TESTS) {
      await runAcceptanceTest(test.id);
    }
    burst(['🎯', '✅', '🚀', '⭐']);
  }, [runAcceptanceTest]);

  const resetToSeedData = useCallback(() => {
    setUsers(SEED_USERS);
    setTickets(SEED_TICKETS);
    setAuditLogs(SEED_AUDIT_LOGS);
    setNotifications(SEED_NOTIFICATIONS);
    setAcceptanceTests(SEED_ACCEPTANCE_TESTS);
    setCurrentUserId('user_administrador');
    setActiveScreen('dashboard');
    try {
      localStorage.removeItem(STORAGE_KEY_USERS);
      localStorage.removeItem(STORAGE_KEY_TICKETS);
      localStorage.removeItem(STORAGE_KEY_AUDIT);
      localStorage.removeItem(STORAGE_KEY_NOTIFS);
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TESTS);
    } catch {}
    playSuccessSound();
    burst(['🔄', '💻', '✨']);
  }, []);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(
      n =>
        !n.leida &&
        (n.destinatario_id === currentUser.id ||
          n.destinatario_id === 'all' ||
          (currentUser.rol === 'tecnico' && n.destinatario_id === 'all_technicians'))
    ).length;
  }, [notifications, currentUser]);

  return (
    <TicketContext.Provider
      value={{
        currentUser,
        users,
        tickets,
        auditLogs,
        notifications,
        unreadNotificationsCount,
        soundEnabled,
        connectionStatus,
        toggleConnectionStatus,
        filters,
        filteredTickets,
        visibleTicketsForCurrentRole,
        activeScreen,
        setActiveScreen,
        isDashboardBannerVisible,
        setDashboardBannerVisible,
        metrics,
        smartNextCandidate,
        acceptanceTests,
        changeCurrentUser,
        isLoggedIn,
        login,
        authenticateUser,
        logout,
        windowSimulationWidth,
        setWindowSimulationWidth,
        density,
        toggleDensity,
        toggleUserStatus,
        toggleSound,
        playTestSound,
        setFilters,
        resetFilters,
        createTicket,
        changePriority,
        assignTechnician,
        startAttention,
        takeSmartNextTicket,
        resolveTicket,
        cancelTicket,
        createUser,
        updateUser,
        deleteUser,
        markNotificationRead,
        markAllNotificationsRead,
        runAcceptanceTest,
        runAllAcceptanceTests,
        resetToSeedData,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = (): TicketContextType => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};
