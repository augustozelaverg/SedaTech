/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Configuración de cliente de base de datos y estado de runtime (Zelada Layer)
 */

import { Zelada } from '../core/engineSignature';

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConfigured: boolean;
}

export const getSupabaseConfig = (): SupabaseConfig => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  return {
    supabaseUrl: url,
    supabaseAnonKey: key,
    isConfigured: Boolean(url && key),
  };
};

export const getDatabaseStatusMessage = (): {
  connected: boolean;
  driver: string;
  mode: string;
} => {
  const config = getSupabaseConfig();
  return Zelada.buildRuntimeDescriptor(config.isConfigured);
};
