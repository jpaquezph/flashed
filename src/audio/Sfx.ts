// Efectos de sonido sintetizados con Web Audio: sin archivos ni descargas.

import { settings } from '../settings';
import { audioContext } from './context';

export type SfxName = 'shutter' | 'ok' | 'great' | 'empty' | 'warn' | 'laser' | 'evil' | 'card' | 'hit' | 'pickup' | 'win' | 'lose' | 'ui' | 'laugh' | 'door' | 'fizz' | 'cry';

function tone(ac: AudioContext, freq: number, at: number, dur: number, type: OscillatorType, vol: number, slideTo?: number): void {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const t0 = ac.currentTime + at;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(ac: AudioContext, at: number, dur: number, vol: number, highpass: number): void {
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();
  const t0 = ac.currentTime + at;
  src.buffer = buffer;
  filter.type = 'highpass';
  filter.frequency.value = highpass;
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start(t0);
}

const SOUNDS: Record<SfxName, (ac: AudioContext) => void> = {
  shutter: (ac) => {
    noise(ac, 0, 0.05, 0.25, 2500);
    tone(ac, 1800, 0, 0.03, 'square', 0.08);
    noise(ac, 0.07, 0.06, 0.18, 1800);
  },
  ok: (ac) => {
    tone(ac, 660, 0.05, 0.09, 'square', 0.09);
    tone(ac, 880, 0.13, 0.12, 'square', 0.09);
  },
  great: (ac) => [523, 659, 784, 1047].forEach((f, i) => tone(ac, f, 0.05 + i * 0.07, 0.14, 'square', 0.09)),
  empty: (ac) => tone(ac, 220, 0.05, 0.14, 'triangle', 0.12, 160),
  warn: (ac) => {
    tone(ac, 980, 0, 0.09, 'square', 0.09);
    tone(ac, 980, 0.16, 0.09, 'square', 0.09);
  },
  laser: (ac) => {
    tone(ac, 1400, 0, 0.35, 'sawtooth', 0.05, 500);
    tone(ac, 90, 0, 0.3, 'square', 0.05);
  },
  // Risa malvada: "ja ja ja" que baja en escalera, fuerte y en un registro que se escucha en cualquier parlante.
  evil: (ac) =>
    [540, 480, 510, 430, 455, 380, 400, 330].forEach((f, i) => {
      const at = 0.26 + i * 0.115;
      tone(ac, f, at, 0.1, 'sawtooth', 0.2, f * 0.72);
      tone(ac, f / 2, at, 0.1, 'square', 0.13, f * 0.36);
    }),
  // Risa del fotógrafo: aguda y contenta.
  laugh: (ac) => [660, 740, 660, 830, 740, 880, 780].forEach((f, i) => tone(ac, f, i * 0.12, 0.09, 'triangle', 0.16, f * 1.12)),
  // Llanto: tres quejidos que bajan.
  cry: (ac) => [620, 560, 500].forEach((f, i) => tone(ac, f, i * 0.42, 0.34, 'triangle', 0.15, f * 0.62)),
  door: (ac) => {
    tone(ac, 180, 0, 0.18, 'triangle', 0.14, 110);
    noise(ac, 0.02, 0.1, 0.1, 900);
  },
  // Chisporroteo de un aparato quemado.
  fizz: (ac) => {
    noise(ac, 0, 0.35, 0.12, 3500);
    tone(ac, 900, 0, 0.3, 'sawtooth', 0.05, 120);
  },
  card: (ac) => {
    tone(ac, 160, 0, 0.16, 'square', 0.12);
    tone(ac, 120, 0.2, 0.3, 'square', 0.12);
  },
  hit: (ac) => {
    tone(ac, 300, 0, 0.25, 'sawtooth', 0.16, 70);
    noise(ac, 0, 0.12, 0.2, 500);
  },
  pickup: (ac) => {
    tone(ac, 880, 0, 0.07, 'triangle', 0.14);
    tone(ac, 1320, 0.07, 0.12, 'triangle', 0.14);
  },
  win: (ac) => [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(ac, f, i * 0.11, 0.2, 'square', 0.1)),
  lose: (ac) => [392, 330, 262, 196].forEach((f, i) => tone(ac, f, i * 0.16, 0.26, 'triangle', 0.15)),
  ui: (ac) => tone(ac, 740, 0, 0.06, 'square', 0.07),
};

export function playSfx(name: SfxName): void {
  if (settings.sfxMuted) return;
  const ac = audioContext();
  if (ac) SOUNDS[name](ac);
}

/** Voz de los diálogos: un punto o una raya de código morse por sílaba. */
export function playVoice(pitch: number): void {
  if (settings.sfxMuted) return;
  const ac = audioContext();
  if (ac) tone(ac, pitch, 0, Math.random() < 0.4 ? 0.12 : 0.05, 'square', 0.07);
}
