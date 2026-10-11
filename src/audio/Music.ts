// Música de fondo generada con Web Audio: un secuenciador por pasos con varias voces.
// Cada pista define su compás, su armonía, su batería y sus instrumentos, así que
// cada escenario suena a un género distinto. No se descarga ni se carga ningún archivo.

import { settings } from '../settings';
import { audioContext } from './context';

export type TrackId = 'menu' | 'church' | 'birthday' | 'quince' | 'wedding' | 'disco' | 'concert' | 'boss' | 'win' | 'prep' | 'lose';

type Inst = 'tri' | 'square' | 'saw' | 'sine' | 'organ' | 'box' | 'piano' | 'pad' | 'strings' | 'guitar' | 'sub' | 'upright' | 'vibes' | 'brass';
type Drum = 'kick' | 'snare' | 'clap' | 'hat' | 'ride' | 'rim';

interface Voice {
  inst: Inst;
  vol: number;
  /** Largo de cada nota, en pasos. */
  len: number;
  /** Octavas que se suman a la nota. */
  oct?: number;
  /** Por paso del compás: índice de nota del acorde (0 = bajo), 5 = quinta del bajo, 9 = acorde completo, -1 = silencio. */
  pat?: number[];
  /** Melodía en notas MIDI absolutas (0 = silencio). Cada elemento dura `every` pasos y la lista se repite. */
  line?: number[];
  every?: number;
}

interface Track {
  bpm: number;
  /** Pasos por compás y pasos por tiempo: 16/4 = 4/4, 12/4 = 3/4 (vals), 12/3 = 4/4 con swing. */
  steps: number;
  div: number;
  /** Un acorde por compás, en notas MIDI. La primera nota es el bajo. */
  bars: number[][];
  drums: Partial<Record<Drum, number[]>>;
  drumVol?: number;
  voices: Voice[];
}

const R = -1;
/** Patrón de un compás con el valor `v` en los pasos indicados. */
const on = (steps: number[], v: number, n = 16): number[] => Array.from({ length: n }, (_, i) => (steps.includes(i) ? v : R));
/** Melodía de `n` pasos a partir de pares [paso, nota]. */
const sparse = (n: number, notes: [number, number][]): number[] => {
  const out = new Array<number>(n).fill(0);
  for (const [step, midi] of notes) out[step] = midi;
  return out;
};
const EIGHTHS = [0, 2, 4, 6, 8, 10, 12, 14];

const TRACKS: Record<TrackId, Track> = {
  // Menú: jazz tranquilo. Contrabajo caminando, platillo con swing, acordes de piano eléctrico y vibráfono.
  menu: {
    bpm: 82,
    steps: 12,
    div: 3,
    bars: [[38, 53, 57, 60, 64], [43, 53, 59, 64], [36, 52, 59, 62, 67], [45, 55, 61, 65]],
    drums: { ride: [0, 3, 5, 6, 9, 11], hat: [3, 9] },
    drumVol: 0.55,
    voices: [
      { inst: 'upright', vol: 0.24, len: 3, every: 3, line: [38, 41, 45, 44, 43, 47, 50, 49, 48, 52, 55, 52, 45, 49, 52, 39] },
      { inst: 'piano', vol: 0.04, len: 4, pat: on([0, 8], 9, 12) },
      {
        inst: 'vibes', vol: 0.075, len: 5,
        line: sparse(96, [
          [0, 69], [5, 72], [6, 74], [12, 77], [20, 74], [21, 71], [24, 76], [30, 67], [32, 71], [36, 73], [42, 76], [47, 69],
          [51, 77], [53, 76], [54, 74], [57, 69], [60, 71], [66, 74], [68, 77], [72, 76], [90, 73], [93, 70],
        ]),
      },
    ],
  },
  // Iglesia: coral de órgano, lento y solemne, con campana. Sin batería.
  church: {
    bpm: 70,
    steps: 16,
    div: 4,
    bars: [[36, 55, 60, 64], [41, 57, 60, 65], [36, 55, 60, 64], [43, 55, 59, 62], [45, 57, 60, 64], [41, 57, 60, 65], [43, 55, 59, 62], [36, 55, 60, 64]],
    drums: {},
    voices: [
      { inst: 'organ', vol: 0.032, len: 16, pat: on([0], 9) },
      { inst: 'organ', vol: 0.085, len: 16, pat: on([0], 0) },
      {
        inst: 'organ', vol: 0.06, len: 4.2, every: 4,
        line: [67, 72, 76, 74, 72, 69, 72, 0, 76, 74, 72, 76, 74, 0, 71, 0, 72, 76, 81, 79, 77, 76, 72, 69, 71, 74, 79, 77, 76, 0, 72, 0],
      },
      { inst: 'box', vol: 0.05, len: 14, every: 16, line: [84, 0, 0, 0, 79, 0, 0, 84] },
    ],
  },
  // Cumpleaños infantil: cajita de música saltarina sobre un "um-pa" de tuba.
  birthday: {
    bpm: 124,
    steps: 16,
    div: 4,
    bars: [[36, 60, 64, 67], [36, 60, 64, 67], [41, 60, 65, 69], [43, 59, 62, 67], [36, 60, 64, 67], [36, 60, 64, 67], [43, 59, 62, 67], [36, 60, 64, 67]],
    drums: { kick: [0, 8], rim: [4, 12], hat: [2, 6, 10, 14] },
    drumVol: 0.7,
    voices: [
      { inst: 'tri', vol: 0.2, len: 3, oct: 1, pat: [0, R, R, R, R, R, R, R, 5, R, R, R, R, R, R, R] },
      { inst: 'tri', vol: 0.05, len: 1.5, pat: on([4, 12], 9) },
      {
        inst: 'box', vol: 0.11, len: 3, every: 2,
        line: [
          67, 64, 67, 64, 72, 0, 67, 0, 76, 74, 72, 74, 76, 0, 72, 0, 69, 72, 77, 72, 81, 0, 77, 0, 79, 77, 76, 74, 71, 74, 67, 0,
          67, 64, 67, 64, 72, 0, 76, 0, 79, 76, 72, 76, 79, 0, 84, 0, 83, 79, 74, 79, 77, 74, 71, 74, 72, 0, 76, 0, 72, 0, 0, 0,
        ],
      },
    ],
  },
  // Cumpleaños de 15: reguetón. Dembow en la batería, bajo 808 y sintetizador sincopado.
  quince: {
    bpm: 95,
    steps: 16,
    div: 4,
    bars: [[45, 57, 60, 64], [41, 57, 60, 65], [48, 55, 60, 64], [43, 55, 59, 62]],
    drums: { kick: [0, 4, 8, 12], snare: [3, 6, 11, 14], hat: [2, 10] },
    voices: [
      { inst: 'sub', vol: 0.26, len: 2.6, pat: on([0, 3, 6, 8, 11, 14], 0) },
      { inst: 'square', vol: 0.035, len: 1.4, oct: 1, pat: [3, R, R, 2, R, R, 1, R, 3, R, R, 2, R, 1, R, R] },
      { inst: 'pad', vol: 0.016, len: 16, pat: on([0], 9) },
      {
        inst: 'vibes', vol: 0.07, len: 2.4, every: 2,
        line: [76, 0, 76, 74, 72, 0, 69, 0, 69, 0, 72, 0, 77, 76, 72, 0, 79, 0, 79, 76, 72, 0, 76, 0, 74, 0, 74, 71, 67, 0, 71, 74],
      },
    ],
  },
  // Boda: vals romántico. Arpegio de piano, colchón de cuerdas y melodía de violín.
  wedding: {
    bpm: 88,
    steps: 12,
    div: 4,
    bars: [[36, 55, 60, 64], [45, 57, 60, 64], [41, 57, 60, 65], [43, 55, 59, 62], [40, 55, 59, 64], [45, 57, 60, 64], [38, 57, 62, 65], [43, 55, 59, 65]],
    drums: {},
    voices: [
      { inst: 'piano', vol: 0.085, len: 3.5, oct: 1, pat: [0, R, 1, R, 2, R, 3, R, 2, R, 1, R] },
      { inst: 'pad', vol: 0.1, len: 12, pat: on([0], 0, 12) },
      { inst: 'strings', vol: 0.02, len: 12, pat: on([0], 9, 12) },
      {
        inst: 'strings', vol: 0.075, len: 7, every: 4,
        line: [76, 0, 79, 76, 0, 72, 69, 0, 72, 74, 0, 0, 79, 0, 83, 84, 0, 81, 77, 0, 81, 79, 0, 0],
      },
    ],
  },
  // Discoteca: house a cuatro tiempos.
  disco: {
    bpm: 126,
    steps: 16,
    div: 4,
    bars: [[45, 57, 60, 64], [45, 57, 60, 64], [43, 55, 59, 62], [41, 57, 60, 65]],
    drums: { kick: [0, 4, 8, 12], clap: [4, 12], hat: [2, 6, 10, 14] },
    voices: [
      { inst: 'tri', vol: 0.2, len: 1.8, oct: -1, pat: on([2, 6, 10, 14], 0) },
      { inst: 'square', vol: 0.035, len: 1.6, oct: 1, pat: [1, 2, 3, 1, 2, 3, 1, 2, 1, 2, 3, 1, 2, 3, 2, 3] },
    ],
  },
  // Recital: rock. Guitarra distorsionada en corcheas, bajo, batería derecha y riff de guitarra líder.
  concert: {
    bpm: 138,
    steps: 16,
    div: 4,
    bars: [[40, 52, 59, 64], [43, 55, 62, 67], [38, 50, 57, 62], [45, 57, 64, 69]],
    drums: { kick: [0, 8, 10], snare: [4, 12], hat: EIGHTHS },
    drumVol: 0.8,
    voices: [
      { inst: 'guitar', vol: 0.09, len: 1.5, pat: on(EIGHTHS, 9) },
      { inst: 'tri', vol: 0.14, len: 1.6, pat: on(EIGHTHS, 0) },
      {
        inst: 'guitar', vol: 0.085, len: 2, every: 2,
        line: [
          76, 0, 79, 76, 81, 0, 79, 76, 79, 0, 83, 79, 86, 0, 83, 0, 74, 0, 81, 74, 86, 0, 81, 78, 81, 0, 83, 81, 88, 0, 86, 83,
          ...new Array<number>(32).fill(0),
        ],
      },
    ],
  },
  // Jefe final: tenso y rápido, en menor.
  boss: {
    bpm: 150,
    steps: 16,
    div: 4,
    bars: [[40, 52, 55, 59], [40, 52, 55, 59], [36, 51, 55, 60], [38, 50, 54, 57]],
    drums: { kick: [0, 3, 6, 8, 11, 14], clap: [4, 12], hat: [1, 2, 5, 6, 9, 10, 13, 14] },
    voices: [
      { inst: 'tri', vol: 0.2, len: 1.8, oct: -1, pat: on([0, 3, 6, 8, 11, 14], 0) },
      { inst: 'square', vol: 0.035, len: 1.6, oct: 1, pat: [1, 3, 2, 3, 1, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3] },
    ],
  },
  // Trabajo cumplido: fanfarria de bronces.
  win: {
    bpm: 128,
    steps: 16,
    div: 4,
    bars: [[36, 60, 64, 67], [41, 60, 65, 69], [43, 59, 62, 67], [36, 60, 64, 67]],
    drums: { kick: [0, 4, 8, 12], clap: [4, 12], hat: [2, 6, 10, 14] },
    voices: [
      { inst: 'tri', vol: 0.16, len: 1.6, oct: 1, pat: on(EIGHTHS, 0) },
      { inst: 'brass', vol: 0.028, len: 6, pat: on([0, 8], 9) },
      {
        inst: 'brass', vol: 0.075, len: 2.2, every: 2,
        line: [72, 0, 72, 72, 76, 0, 79, 0, 81, 0, 81, 81, 84, 0, 81, 0, 79, 0, 79, 79, 83, 0, 86, 0, 84, 0, 0, 0, 84, 84, 84, 0],
      },
    ],
  },
  // Derrota: lento y en menor, piano y cuerdas que bajan.
  lose: {
    bpm: 60,
    steps: 16,
    div: 4,
    bars: [[45, 57, 60, 64], [41, 57, 60, 65], [38, 57, 62, 65], [40, 56, 59, 64]],
    drums: {},
    voices: [
      { inst: 'piano', vol: 0.085, len: 5, pat: [0, R, R, R, 1, R, 2, R, 3, R, R, R, 2, R, R, R] },
      { inst: 'pad', vol: 0.07, len: 16, oct: -1, pat: on([0], 0) },
      { inst: 'strings', vol: 0.02, len: 16, pat: on([0], 9) },
      { inst: 'strings', vol: 0.07, len: 9, every: 8, line: [76, 72, 72, 69, 69, 65, 68, 64] },
    ],
  },
  // Cinemática inicial: mañana tranquila, con algo de expectativa.
  prep: {
    bpm: 94,
    steps: 16,
    div: 4,
    bars: [[48, 52, 59, 64], [45, 55, 60, 64], [41, 57, 60, 64], [43, 55, 59, 64]],
    drums: { kick: [0, 10], rim: [4, 12], hat: [2, 6, 10, 14] },
    drumVol: 0.55,
    voices: [
      { inst: 'upright', vol: 0.2, len: 4, pat: on([0, 10], 0) },
      { inst: 'piano', vol: 0.045, len: 4, pat: on([0, 6, 10], 9) },
      {
        inst: 'box', vol: 0.075, len: 3, every: 2,
        line: [79, 0, 76, 0, 72, 0, 76, 79, 81, 0, 0, 76, 0, 72, 0, 0, 77, 0, 76, 0, 72, 0, 69, 72, 74, 0, 0, 71, 0, 74, 0, 0],
      },
    ],
  },
};

const VOLUME = 0.55;
const freq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

let current: TrackId | null = null;
let timer: number | undefined;
let step = 0;
let nextTime = 0;
let master: GainNode | null = null;
let driveIn: GainNode | null = null;

function output(ac: AudioContext): GainNode {
  if (!master) {
    master = ac.createGain();
    master.gain.value = VOLUME;
    master.connect(ac.destination);
  }
  return master;
}

/** Entrada de la cadena de distorsión (guitarra eléctrica). */
function drive(ac: AudioContext): GainNode {
  if (!driveIn) {
    driveIn = ac.createGain();
    const shaper = ac.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh(((i / (curve.length - 1)) * 2 - 1) * 7);
    shaper.curve = curve;
    const tone = ac.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 3000;
    const level = ac.createGain();
    level.gain.value = 0.1;
    driveIn.connect(shaper).connect(tone).connect(level).connect(output(ac));
  }
  return driveIn;
}

/** Envolvente: percusiva (decae sola) o sostenida (se mantiene hasta soltar). */
function envelope(ac: AudioContext, dest: AudioNode, at: number, dur: number, vol: number, attack: number, sustained: boolean): GainNode {
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(vol, at + attack);
  if (sustained) {
    gain.gain.setValueAtTime(vol, at + Math.max(attack, dur - 0.08));
    gain.gain.linearRampToValueAtTime(0.0001, at + dur);
  } else {
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  }
  gain.connect(dest);
  return gain;
}

function osc(ac: AudioContext, type: OscillatorType, hz: number, at: number, dur: number, dest: AudioNode, level = 1, detune = 0): OscillatorNode {
  const o = ac.createOscillator();
  o.type = type;
  o.frequency.value = hz;
  o.detune.value = detune;
  if (level === 1) o.connect(dest);
  else {
    const g = ac.createGain();
    g.gain.value = level;
    o.connect(g).connect(dest);
  }
  o.start(at);
  o.stop(at + dur + 0.05);
  return o;
}

function play(ac: AudioContext, inst: Inst, midi: number, at: number, dur: number, vol: number): void {
  const f = freq(midi);
  const out = output(ac);
  switch (inst) {
    case 'organ': {
      const g = envelope(ac, out, at, dur, vol, 0.05, true);
      osc(ac, 'sine', f, at, dur, g);
      osc(ac, 'sine', f * 2, at, dur, g, 0.5);
      osc(ac, 'sine', f * 3, at, dur, g, 0.22);
      osc(ac, 'sine', f * 4, at, dur, g, 0.12);
      break;
    }
    case 'box': {
      const d = Math.max(dur, 0.5);
      const g = envelope(ac, out, at, d, vol, 0.003, false);
      osc(ac, 'sine', f, at, d, g);
      osc(ac, 'sine', f * 3, at, d, g, 0.22);
      break;
    }
    case 'vibes': {
      const d = Math.max(dur, 0.7);
      const g = envelope(ac, out, at, d, vol, 0.006, false);
      osc(ac, 'sine', f, at, d, g);
      osc(ac, 'sine', f * 4, at, d, g, 0.1);
      break;
    }
    case 'piano': {
      const d = Math.max(dur, 0.45);
      const g = envelope(ac, out, at, d, vol, 0.004, false);
      osc(ac, 'triangle', f, at, d, g);
      osc(ac, 'sine', f * 2, at, d, g, 0.3);
      break;
    }
    case 'pad':
      osc(ac, 'triangle', f, at, dur, envelope(ac, out, at, dur, vol, 0.25, true));
      break;
    case 'strings': {
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2000;
      lp.connect(envelope(ac, out, at, dur, vol, 0.14, true));
      const a = osc(ac, 'sawtooth', f, at, dur, lp, 0.6);
      osc(ac, 'sawtooth', f, at, dur, lp, 0.4, 9);
      // Vibrato.
      const lfo = ac.createOscillator();
      const depth = ac.createGain();
      lfo.frequency.value = 5.5;
      depth.gain.value = 9;
      lfo.connect(depth).connect(a.detune);
      lfo.start(at);
      lfo.stop(at + dur + 0.05);
      break;
    }
    case 'brass': {
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2400;
      lp.connect(envelope(ac, out, at, dur, vol, 0.03, true));
      osc(ac, 'sawtooth', f, at, dur, lp, 0.7);
      osc(ac, 'square', f, at, dur, lp, 0.3);
      break;
    }
    case 'guitar':
      osc(ac, 'sawtooth', f, at, dur, envelope(ac, drive(ac), at, dur, vol, 0.005, true));
      break;
    case 'sub': {
      const g = envelope(ac, out, at, dur, vol, 0.006, false);
      const o = osc(ac, 'sine', f, at, dur, g);
      o.frequency.setValueAtTime(f * 1.6, at);
      o.frequency.exponentialRampToValueAtTime(f, at + 0.05);
      osc(ac, 'triangle', f * 2, at, dur, g, 0.25);
      break;
    }
    case 'upright': {
      const d = Math.max(dur, 0.4);
      const g = envelope(ac, out, at, d, vol, 0.008, false);
      osc(ac, 'sine', f, at, d, g);
      osc(ac, 'triangle', f * 2, at, d, g, 0.45);
      break;
    }
    default: {
      const type: OscillatorType = inst === 'tri' ? 'triangle' : inst === 'saw' ? 'sawtooth' : inst;
      osc(ac, type, f, at, dur, envelope(ac, out, at, dur, vol, 0.005, false));
    }
  }
}

let noiseBuffer: AudioBuffer | null = null;
function noise(ac: AudioContext, at: number, dur: number, vol: number, highpass: number): void {
  if (!noiseBuffer) {
    noiseBuffer = ac.createBuffer(1, ac.sampleRate * 0.4, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const src = ac.createBufferSource();
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();
  src.buffer = noiseBuffer;
  filter.type = 'highpass';
  filter.frequency.value = highpass;
  gain.gain.setValueAtTime(vol, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(filter).connect(gain).connect(output(ac));
  src.start(at);
  src.stop(at + dur + 0.02);
}

/** Golpe con tono que cae: bombo, cuerpo del redoblante. */
function thump(ac: AudioContext, at: number, from: number, to: number, dur: number, vol: number): void {
  const o = ac.createOscillator();
  const gain = ac.createGain();
  o.frequency.setValueAtTime(from, at);
  o.frequency.exponentialRampToValueAtTime(to, at + dur * 0.75);
  gain.gain.setValueAtTime(vol, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(gain).connect(output(ac));
  o.start(at);
  o.stop(at + dur + 0.02);
}

function drum(ac: AudioContext, kind: Drum, at: number, v: number): void {
  switch (kind) {
    case 'kick': return thump(ac, at, 140, 42, 0.16, 0.32 * v);
    case 'snare':
      noise(ac, at, 0.13, 0.13 * v, 1100);
      return thump(ac, at, 220, 150, 0.08, 0.1 * v);
    case 'clap': return noise(ac, at, 0.09, 0.09 * v, 1400);
    case 'hat': return noise(ac, at, 0.035, 0.045 * v, 7000);
    case 'ride': return noise(ac, at, 0.2, 0.04 * v, 8500);
    case 'rim':
      noise(ac, at, 0.02, 0.06 * v, 3000);
      return thump(ac, at, 1500, 1100, 0.03, 0.06 * v);
  }
}

function scheduleStep(ac: AudioContext, track: Track, index: number, at: number): void {
  const stepLen = 60 / track.bpm / track.div;
  const s = index % track.steps;
  const chord = track.bars[Math.floor(index / track.steps) % track.bars.length];
  const dv = track.drumVol ?? 1;
  for (const kind of Object.keys(track.drums) as Drum[]) {
    if (track.drums[kind]!.includes(s)) drum(ac, kind, at, dv);
  }
  for (const v of track.voices) {
    const shift = (v.oct ?? 0) * 12;
    const dur = stepLen * v.len;
    if (v.pat) {
      const p = v.pat[s];
      if (p === 9) for (const midi of chord.slice(1)) play(ac, v.inst, midi + shift, at, dur, v.vol);
      else if (p === 5) play(ac, v.inst, chord[0] + 7 + shift, at, dur, v.vol);
      else if (p >= 0) play(ac, v.inst, chord[p] + shift, at, dur, v.vol);
    }
    if (v.line) {
      const every = v.every ?? 1;
      if (index % every !== 0) continue;
      const midi = v.line[(index / every) % v.line.length];
      if (midi > 0) play(ac, v.inst, midi + shift, at, dur, v.vol);
    }
  }
}

function tick(): void {
  const ac = audioContext();
  if (!ac || !current) return;
  const track = TRACKS[current];
  // Si la pestaña estuvo en segundo plano, se retoma desde ahora en lugar de recuperar lo perdido.
  if (nextTime < ac.currentTime - 0.2) nextTime = ac.currentTime + 0.05;
  while (nextTime < ac.currentTime + 0.15) {
    if (!settings.musicMuted) scheduleStep(ac, track, step, nextTime);
    nextTime += 60 / track.bpm / track.div;
    step += 1;
  }
}

/** Empieza una pista (si ya está sonando, no la reinicia). */
export function playMusic(id: TrackId): void {
  if (current === id) return;
  current = id;
  step = 0;
  nextTime = (audioContext()?.currentTime ?? 0) + 0.1;
  timer ??= window.setInterval(tick, 40);
}

export function stopMusic(): void {
  current = null;
}

/** Baja la música unos segundos para que se escuche un efecto importante (la risa del DJ). */
export function duckMusic(seconds: number): void {
  const ac = audioContext();
  if (!ac || !master) return;
  const now = ac.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setTargetAtTime(VOLUME * 0.22, now, 0.03);
  master.gain.setTargetAtTime(VOLUME, now + seconds, 0.12);
}
