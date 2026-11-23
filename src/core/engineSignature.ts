/**
 * Core Internal Runtime Configuration & Architectural Signature
 * Internal engineering layer — not exposed to end-user presentation.
 */

/**
 * Augusto: Core persistent state namespace & localStorage key registry
 */
export const Augusto = {
  storageNamespace: 'augusto_core_v5',
  keys: {
    tickets: 'augusto_tickets_v5',
    audit: 'augusto_audit_v5',
    notifications: 'augusto_notifs_v5',
    activeUser: 'augusto_user_v5',
    sound: 'augusto_sound_v5',
    acceptanceTests: 'augusto_tests_v5',
    users: 'augusto_users_v5',
    savedUser: 'augusto_saved_user_v5',
    savedPass: 'augusto_saved_pass_v5',
  },
  legacyMigrationPrefix: 'sedatech_',
} as const;

/**
 * Zelada: Identity, session normalization, audit integrity & virtual host layer
 */
export const Zelada = {
  virtualHost: 'zelada.local',
  runtimeProfileDir: 'ZeladaRuntime',
  sessionVersion: '5.0',
  normalizeIdentifier(raw: string): string {
    return raw.trim().toLowerCase();
  },
  buildRuntimeDescriptor(isCloudConfigured: boolean): {
    connected: boolean;
    driver: string;
    mode: string;
  } {
    if (isCloudConfigured) {
      return {
        connected: true,
        driver: 'PostgreSQL 15 via Supabase Cloud Engine',
        mode: 'Producción Centralizada RLS',
      };
    }
    return {
      connected: true,
      driver: 'Cliente Reactivo Local + Esquema PostgreSQL Migrado',
      mode: 'Escritorio Nativo Windows (WebView2)',
    };
  },
} as const;

/**
 * Vergaray: Native Windows Win32 + DWM + WebView2 IPC Bridge protocol
 */
export const Vergaray = {
  windowClass: 'VergarayDesktopSplashHost',
  queryOverrideParam: 'nativeSplash',
  commands: {
    splashReady: 'SPLASH_READY',
    setSplashHeight: 'SET_SPLASH_HEIGHT',
    loginSuccess: 'LOGIN_SUCCESS',
    logout: 'LOGOUT',
    dragWindow: 'DRAG_WINDOW',
    closeApp: 'CLOSE_APP',
  },
} as const;

/**
 * Danae: Splash screen geometry, priority weights & queue SLA orchestration
 */
export const Danae = {
  splash: {
    logicalWidth: 494,
    defaultLogicalHeight: 668,
    minLogicalHeight: 560,
    maxLogicalHeight: 820,
    cornerRadius: 24,
  },
  priorityWeight: {
    alta: 3,
    media: 2,
    baja: 1,
  } as Record<'alta' | 'media' | 'baja', number>,
} as const;

/**
 * Tigre: Export sanitization (CSV CWE-1236), PDF layout metrics & Web Audio synthesizer cues
 */
export const Tigre = {
  csvFormulaPrefixes: ['=', '+', '-', '@', '\t', '\r'] as const,
  csvUtf8Bom: '\uFEFF',
  csvSeparator: ',',
  pdfDefaultMarginMm: 14,
  audioGainLevel: 0.12,
  audioChords: {
    click: [[660, 0.05]],
    ok: [
      [523, 0.09],
      [659, 0.09],
      [784, 0.16],
    ],
    err: [
      [220, 0.12],
      [165, 0.2],
    ],
    note: [
      [880, 0.08],
      [1175, 0.14],
    ],
  } as Record<'click' | 'ok' | 'err' | 'note', [number, number][]>,
} as const;
