/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * P01: Inicio de Sesión SedaTech - Sistema de Gestión de Tickets
 * Estilo Azul, Celeste y Blanco.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTickets } from '../context/TicketContext';
import {
  User,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { playErrorSound, playSuccessSound, burst } from '../utils/audio';
import { isNativeDesktopHost, postNativeMessage } from '../utils/nativeHost';
import { Augusto, Danae, Vergaray } from '../core/engineSignature';

interface LoginPageProps {
  onSuccessLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { authenticateUser } = useTickets();
  const isNativeHost = isNativeDesktopHost();
  const splashWrapperRef = useRef<HTMLDivElement>(null);
  const splashCardRef = useRef<HTMLDivElement>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>('username');
  const [isExiting, setIsExiting] = useState(false);

  // Load saved credentials on mount only if previously remembered by the user
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(Augusto.keys.savedUser);
      const savedPass = localStorage.getItem(Augusto.keys.savedPass);
      if (savedUser) {
        setUsername(savedUser);
        if (savedPass) setPassword(savedPass);
        setRememberMe(true);
      }
    } catch {
      // Ignore localStorage errors in restricted environments
    }
  }, []);

  // Notify native Windows transparent splash host when painted & keep height tightly matched
  useEffect(() => {
    if (!isNativeHost) return;

    const notifyHeight = (isInitial: boolean) => {
      const el = splashWrapperRef.current || splashCardRef.current;
      const height = el ? Math.ceil(el.scrollHeight) : Danae.splash.defaultLogicalHeight;
      if (isInitial) {
        postNativeMessage({ type: Vergaray.commands.splashReady, height });
      } else {
        postNativeMessage({ type: Vergaray.commands.setSplashHeight, height });
      }
    };

    const raf = requestAnimationFrame(() => {
      notifyHeight(true);
    });

    const el = splashWrapperRef.current || splashCardRef.current;
    let observer: ResizeObserver | null = null;
    if (el && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        notifyHeight(false);
      });
      observer.observe(el);
    }

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [isNativeHost, errorMsg, successMsg]);

  const handleSplashDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isNativeHost || e.button !== 0) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, input, label, form')) return;
    postNativeMessage({ type: Vergaray.commands.dragWindow });
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUser = username.trim();
    if (!cleanUser) {
      setErrorMsg('Por favor ingrese su nombre de usuario.');
      playErrorSound();
      return;
    }

    if (!password) {
      setErrorMsg('Por favor ingrese su contraseña.');
      playErrorSound();
      return;
    }

    setIsLoggingIn(true);

    try {
      if (rememberMe) {
        localStorage.setItem(Augusto.keys.savedUser, cleanUser);
        localStorage.setItem(Augusto.keys.savedPass, password);
      } else {
        localStorage.removeItem(Augusto.keys.savedUser);
        localStorage.removeItem(Augusto.keys.savedPass);
      }
    } catch {
      // Ignore storage errors
    }

    const result = authenticateUser(cleanUser, password);

    if (result.success && result.user) {
      playSuccessSound();
      burst(['✨', '🔐', '🚀', '⭐', '🎉']);
      setSuccessMsg(`¡Bienvenido(a), ${result.user.nombre}! Iniciando sesión...`);
      setIsExiting(true);

      setTimeout(() => {
        onSuccessLogin?.();
        setIsLoggingIn(false);
      }, 350);
    } else {
      setIsLoggingIn(false);
      playErrorSound();
      setErrorMsg(result.error || 'Acceso denegado: Usuario o contraseña incorrectos.');
    }
  };

  const cardInnerContent = (
    <div
      ref={splashCardRef}
      onMouseDown={handleSplashDragStart}
      className={`relative overflow-hidden bg-[#081b44] ${
        isNativeHost
          ? 'w-full max-w-[438px] rounded-3xl border border-sky-300/40 ring-1 ring-white/15 shadow-[0_22px_42px_-10px_rgba(3,13,36,0.78),0_0_24px_rgba(56,189,248,0.22)] p-7 sm:p-8 flex flex-col justify-between cursor-default'
          : 'bg-[#081b44]/95 backdrop-blur-2xl rounded-3xl border border-sky-300/35 ring-1 ring-white/15 shadow-[0_38px_90px_-15px_rgba(3,13,36,0.78),0_14px_32px_-8px_rgba(0,82,165,0.45)] p-7 sm:p-9'
      }`}
    >
      {/* Subtle luminous splash-screen top highlight bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0052a5] via-[#38bdf8] to-[#0ea5e9] overflow-hidden pointer-events-none">
        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-splash-sweep" />
      </div>

      {/* Subtle top glass reflection */}
      <div className="absolute -top-24 -right-24 w-56 h-56 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Native Borderless Splash Close Button */}
      {isNativeHost && (
        <button
          type="button"
          onClick={() => postNativeMessage({ type: Vergaray.commands.closeApp })}
          title="Cerrar SedaTech"
          aria-label="Cerrar SedaTech"
          className="absolute top-3 right-3 z-20 w-7 h-7 rounded-lg bg-white/10 hover:bg-red-500/85 text-sky-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="relative z-10">
        {/* Top Logo Frame matching reference layout (draggable area in native splash) */}
        <div
          className={`w-full bg-[#10285c] rounded-xl px-4 py-1.5 flex items-center justify-center border border-sky-300/20 shadow-inner mb-6 ${
            isNativeHost ? 'mt-2 cursor-move' : ''
          }`}
        >
          <img
            src="./LOGOTIPO%20SEDATECH.png"
            alt="Logotipo SedaTech"
            draggable={false}
            className="h-14 sm:h-16 w-auto object-contain rounded-sm pointer-events-none"
          />
        </div>

        {/* App Title & Subtitle */}
        <div className={`text-center mb-7 ${isNativeHost ? 'cursor-move' : ''}`}>
          <h1 className="text-2xl sm:text-[26px] font-black text-white tracking-tight uppercase leading-none">
            SEDATECH
          </h1>
          <p className="text-[11px] font-semibold text-sky-200/75 tracking-[0.2em] uppercase mt-2">
            GESTIÓN PROFESIONAL DE TICKETS
          </p>
        </div>

        {/* Feedback Banners */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#0052a5]/40 border border-sky-400/60 text-white text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sky-300 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-white border-2 border-[#38bdf8] text-[#0a2463] text-xs font-bold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#0052a5] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleManualLogin} autoComplete="off" className="space-y-5">
          {/* Field 1: NOMBRE DE USUARIO */}
          <div>
            <label
              htmlFor="login-username"
              className="block text-[11px] font-bold uppercase tracking-wider text-sky-100/90 mb-2"
            >
              NOMBRE DE USUARIO
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-300/75 pointer-events-none">
                <User className="w-4 h-4" />
              </div>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                placeholder="Ingrese usuario"
                autoFocus
                className={`w-full pl-10 pr-4 py-3 bg-[#04102b] rounded-xl text-white font-medium text-sm placeholder:text-sky-200/45 transition-colors outline-none ${
                  focusedField === 'username'
                    ? 'border-2 border-[#38bdf8] ring-2 ring-[#38bdf8]/20'
                    : 'border border-sky-400/20 hover:border-sky-400/35'
                }`}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Field 2: CONTRASEÑA */}
          <div>
            <label
              htmlFor="login-password"
              className="block text-[11px] font-bold uppercase tracking-wider text-sky-100/90 mb-2"
            >
              CONTRASEÑA
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-300/75 pointer-events-none">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Ingrese contraseña"
                className={`w-full pl-10 pr-10 py-3 bg-[#04102b] rounded-xl text-white font-medium text-sm placeholder:text-sky-200/45 transition-colors outline-none ${
                  focusedField === 'password'
                    ? 'border-2 border-[#38bdf8] ring-2 ring-[#38bdf8]/20'
                    : 'border border-sky-400/20 hover:border-sky-400/35'
                }`}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-300/75 hover:text-white p-1.5 cursor-pointer"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="pt-0.5 flex items-center">
            <button
              type="button"
              role="checkbox"
              aria-checked={rememberMe}
              onClick={() => setRememberMe(prev => !prev)}
              className="inline-flex items-center gap-2.5 text-xs text-sky-100 font-semibold cursor-pointer select-none group"
            >
              <span
                className={`w-4 h-4 rounded-[3px] flex items-center justify-center transition-colors border ${
                  rememberMe
                    ? 'bg-[#38bdf8] border-[#38bdf8] text-[#041230]'
                    : 'bg-white border-white text-transparent group-hover:border-sky-200'
                }`}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <span>Recordar usuario y contraseña</span>
            </button>
          </div>

          {/* Primary CTA: Ingresar al Sistema */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#0ea5e9] hover:from-[#7dd3fc] hover:to-[#38bdf8] active:scale-[0.99] text-[#041230] font-black text-sm tracking-wide shadow-[0_10px_28px_-6px_rgba(56,189,248,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
          >
            <span>{isLoggingIn ? 'Ingresando al Sistema...' : 'Ingresar al Sistema'}</span>
          </button>
        </form>
      </div>

      {/* Footer Divider & Copyright */}
      <div className="mt-7 pt-5 border-t border-sky-400/15 text-center font-mono text-[11px] text-sky-200/60 relative z-10">
        &copy; 2026 SedaTech · Sistema de Gestión de Tickets. Todos los derechos reservados.
      </div>
    </div>
  );

  // Native Windows WebView2 mode: truly transparent OS window with ONLY the floating Login card visible
  if (isNativeHost) {
    return (
      <div
        ref={splashWrapperRef}
        className={`w-screen min-h-screen bg-transparent flex items-center justify-center p-7 select-none overflow-hidden transition-all duration-300 ${
          isExiting ? 'opacity-0 scale-95' : 'opacity-100'
        }`}
      >
        {cardInnerContent}
      </div>
    );
  }

  // Web browser preview mode: centered floating foreground splash screen
  return (
    <div className="fixed inset-0 z-[100] min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-y-auto overflow-x-hidden bg-gradient-to-br from-[#e0f0ff] via-[#eef6ff] to-[#cfe5ff]">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.28),transparent_48%),radial-gradient(circle_at_80%_80%,rgba(0,82,165,0.22),transparent_52%)] backdrop-blur-md pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-[#0052a5]/15 rounded-full blur-3xl pointer-events-none" />

      <div
        className={`w-full max-w-[438px] relative z-20 animate-splash-enter transition-all duration-300 ${
          isExiting ? 'opacity-0 scale-95 -translate-y-4' : 'opacity-100'
        }`}
      >
        <div className="animate-splash-float">{cardInnerContent}</div>
        <div className="w-[76%] h-6 mx-auto mt-4 rounded-full bg-[#04102b]/35 blur-xl pointer-events-none animate-splash-shadow" />
      </div>
    </div>
  );
};
