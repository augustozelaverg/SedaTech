/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Puente de plataforma de escritorio Windows (Win32 + WebView2 · Vergaray Bridge)
 */

import { isNativeDesktopHost } from '../utils/nativeHost';

export const isTauriDesktop = (): boolean => {
  return isNativeDesktopHost();
};

export const getPlatformLabel = (): string => {
  if (isNativeDesktopHost()) {
    return 'Windows Desktop Nativo (Win32 · DWM · WebView2)';
  }
  return 'Entorno Web de Escritorio';
};

export const saveFileNativeOrWeb = async (
  filename: string,
  content: string,
  mimeType: string = 'text/csv;charset=utf-8;'
): Promise<void> => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
