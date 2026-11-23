/**
 * Internal Native Desktop Host Bridge (Win32 + DWM + Microsoft Edge WebView2)
 * Powered by the Vergaray IPC protocol for borderless OS splash-screen transitions.
 */

import { Vergaray } from '../core/engineSignature';

export type VergarayNativeMessage =
  | { type: typeof Vergaray.commands.splashReady; height?: number }
  | { type: typeof Vergaray.commands.setSplashHeight; height: number }
  | { type: typeof Vergaray.commands.loginSuccess }
  | { type: typeof Vergaray.commands.logout }
  | { type: typeof Vergaray.commands.dragWindow }
  | { type: typeof Vergaray.commands.closeApp };

export type NativeHostMessage = VergarayNativeMessage;

interface ChromeWebView {
  postMessage: (message: string) => void;
}

declare global {
  interface Window {
    chrome?: {
      webview?: ChromeWebView;
    };
  }
}

export function isNativeDesktopHost(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.chrome?.webview && typeof window.chrome.webview.postMessage === 'function') {
    return true;
  }
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(Vergaray.queryOverrideParam) === '1';
  } catch {
    return false;
  }
}

export function postNativeMessage(message: VergarayNativeMessage): void {
  try {
    if (typeof window !== 'undefined' && window.chrome?.webview?.postMessage) {
      window.chrome.webview.postMessage(JSON.stringify(message));
    }
  } catch {
    // Ignore when running outside native WebView2 host
  }
}
