/**
 * Web Audio Synthesizer & Visual Feedback Engine
 * Uses Tigre harmonic presets for subtle interface cues.
 */

import { Tigre } from '../core/engineSignature';

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export type SoundType = 'click' | 'ok' | 'err' | 'note';

export function playSound(type: SoundType): void {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = Tigre.audioChords[type];
    if (!notes) return;

    let time = ctx.currentTime;
    notes.forEach(([freq, duration]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(Tigre.audioGainLevel, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration);

      time += duration * 0.9;
    });
  } catch (err) {
    console.warn('Audio playback not permitted yet', err);
  }
}

export function setMuted(muted: boolean): void {
  isMuted = muted;
}

export function playNotificationSound(): void {
  playSound('note');
}

export function playSuccessSound(): void {
  playSound('ok');
}

export function playClickSound(): void {
  playSound('click');
}

export function playErrorSound(): void {
  playSound('err');
}

/**
 * Radial celebration particle burst
 */
export function burst(emojis: string[] = ['🎉', '✨', '🚀', '✔️', '🎫']): void {
  if (typeof window === 'undefined' || !document.body) return;

  for (let i = 0; i < 24; i++) {
    const span = document.createElement('span');
    span.className = 'cf-particle';
    span.textContent = emojis[i % emojis.length];
    span.style.left = `${window.innerWidth / 2}px`;
    span.style.top = `${window.innerHeight / 2}px`;

    const offsetX = (Math.random() - 0.5) * window.innerWidth * 0.85;
    const offsetY = (Math.random() - 0.75) * window.innerHeight * 0.65;

    span.style.setProperty('--x', `${offsetX}px`);
    span.style.setProperty('--y', `${offsetY}px`);

    document.body.appendChild(span);
    setTimeout(() => {
      span.remove();
    }, 1500);
  }
}
