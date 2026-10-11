// Escenario final: pelea contra el DJ. Él ataca con láseres; el fotógrafo, con fotos.
// Cada flash con el DJ en cuadro le saca vida (el doble de cerca); acá el flash no apaga
// los láseres. En la última fase el DJ deja la cabina y persigue al fotógrafo para pegarle.

import { DISCO_GUESTS } from '../../art';
import { EMITTERS, FLOOR, LANE, spots } from './helpers';
import type { LaserWave, ScenarioConfig } from './types';

const DJ_HP = 14;

/** Una fase por cada tercio de vida del DJ: espectáculo, caos y desenlace. */
const PHASES: LaserWave[] = [
  { from: 3, patterns: ['hSweep', 'vSweep', 'diag'], rest: 2.4, warn: 1.5, pace: 1 },
  { from: 3, patterns: ['combo', 'vSweep', 'diag', 'hSweep'], rest: 1.9, warn: 1.3, pace: 0.9 },
  { from: 3, patterns: ['combo', 'diag', 'vSweep', 'combo'], rest: 1.6, warn: 1.1, pace: 0.82 },
];

export const boss: ScenarioConfig = {
  id: 'boss',
  nameKey: 'boss.name',
  descKey: 'boss.desc',
  phaseKey: 'boss.phase1',
  background: 'boss_bg',
  music: 'boss',
  bounds: FLOOR,
  props: [
    { key: 'v_djdesk_long', x: 104, y: 116, depth: 149, collide: { x: 104, y: 122, w: 272, h: 27 } },
    { key: 'v_speakers', x: 76, y: 104, depth: 148, collide: { x: 76, y: 138, w: 22, h: 11 } },
    { key: 'v_speakers', x: 382, y: 104, depth: 148, collide: { x: 382, y: 138, w: 22, h: 11 } },
  ],
  solids: [],
  zones: [],
  playerStart: { x: 240, y: 222 },
  exit: { x: -100, y: -100 },

  guests: {
    wardrobe: DISCO_GUESTS,
    seats: [],
    seatOccupancy: 0,
    standing: [],
    dancing: [...spots([[26, 252], [58, 258]]), ...spots([[452, 252], [422, 258]], -1)],
    wanderers: 0,
    roam: [],
    seed: 83,
  },
  actors: [{ id: 'dj', look: 'dj', x: 240, y: 138, facing: -1, main: true }],
  moments: [],

  objectives: {
    requiredPhotos: DJ_HP,
    cardCapacity: 30,
    specials: [],
    requiredKey: 'boss.required',
    counterKey: 'boss.counter',
  },
  hazards: {
    lasers: { operator: 'dj', emitters: EMITTERS, area: FLOOR, lane: LANE, waves: [PHASES[0]] },
  },
  boss: { actor: 'dj', hp: DJ_HP, patrol: [130, 350], phases: PHASES },
  difficulty: { timeLimit: 180, guestSpeedMul: 1.6, sensor: 5 },
};
