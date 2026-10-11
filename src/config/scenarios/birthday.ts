// Escenario 2: cumpleaños infantil. Sube la dificultad con obstáculos móviles
// impredecibles (los chicos corriendo), un protagonista que no se queda quieto
// y láseres más seguidos que incluyen diagonales desde el principio.

import { BDAY_ADULTS, BDAY_KIDS } from '../../art';
import { BDAY_EMITTERS_X, BDAY_EMITTER_Y } from '../../art/birthday';
import type { PropDef, ScenarioConfig, SpotDef } from './types';

/** Franja central libre de muebles: por acá corren los chicos y caen los huecos de los láseres. */
const OPEN = { x: 12, y: 162, w: 456, h: 70 };
const LANE = { x: 8, y: 182, w: 464, h: 32 };

const props: PropDef[] = [];
const seats: SpotDef[] = [];

/** Mesa con una silla de cada lado: dos invitados comiendo enfrentados. */
function tableSet(tx: number, ty: number): void {
  props.push(
    { key: 'bday_chair', x: tx - 25, y: ty - 23, depth: ty - 2.5 },
    { key: 'bday_chair', x: tx + 13, y: ty - 23, depth: ty - 2.5, flip: true },
    { key: 'bday_table', x: tx - 13, y: ty - 24, depth: ty + 3, collide: { x: tx - 26, y: ty - 9, w: 52, h: 13 } },
  );
  seats.push({ x: tx - 19, y: ty - 2, facing: 1 }, { x: tx + 19, y: ty - 2, facing: -1 });
}

for (const tx of [176, 252, 328]) tableSet(tx, 152);
for (const tx of [130, 230, 330]) tableSet(tx, 248);

props.push(
  { key: 'bday_ballpit', x: 8, y: 104, depth: 150, collide: { x: 8, y: 110, w: 80, h: 46 } },
  { key: 'bday_caketable', x: 408, y: 113, depth: 158, collide: { x: 410, y: 144, w: 44, h: 15 } },
  { key: 'bday_gifts', x: 436, y: 228, depth: 258, collide: { x: 437, y: 246, w: 32, h: 12 } },
  { key: 'bday_booth', x: 12, y: 226, depth: 258, collide: { x: 13, y: 246, w: 38, h: 13 } },
  { key: 'bday_balloons', x: 452, y: 72, depth: 126 },
  { key: 'bday_balloons', x: 364, y: 74, depth: 125 },
);

export const birthday: ScenarioConfig = {
  id: 'birthday',
  nameKey: 'bday.name',
  descKey: 'bday.desc',
  phaseKey: 'bday.phase',
  background: 'bday_bg',
  music: 'birthday',
  bounds: { x: 8, y: 124, w: 464, h: 140 },
  props,
  solids: [],
  zones: [],
  playerStart: { x: 112, y: 176 },
  exit: { x: 112, y: 126 },

  guests: {
    wardrobe: BDAY_ADULTS,
    seats,
    seatOccupancy: 0.75,
    standing: [
      { x: 214, y: 136, facing: 1 },
      { x: 290, y: 138, facing: -1 },
      { x: 386, y: 136, facing: 1 },
      { x: 182, y: 262, facing: 1 },
      { x: 282, y: 262, facing: -1 },
      { x: 466, y: 176, facing: -1 },
    ],
    wanderers: 2,
    roam: [OPEN],
    // Los chicos: rápidos, casi sin pausas y por toda la franja central.
    runners: { count: 5, wardrobe: BDAY_KIDS, speedMul: 2.4, pauseMul: 0.3, roam: [OPEN] },
    seed: 23,
  },
  actors: [
    { id: 'bdaykid', look: 'bday_kid', x: 300, y: 200, facing: 1, main: true, runner: true },
    { id: 'animator', look: 'bday_animator', x: 32, y: 242, facing: 1 },
  ],
  moments: [
    { id: 'cake', nameKey: 'bday.moment.cake', at: 10, duration: 16, warn: 5, crowd: 'cheer', actions: [{ actor: 'bdaykid', moveTo: { x: 398, y: 160 }, anim: 'cheer' }] },
    { id: 'dance', nameKey: 'bday.moment.dance', at: 42, duration: 14, warn: 5, crowd: 'up', actions: [] },
  ],

  objectives: {
    requiredPhotos: 4,
    cardCapacity: 10,
    specials: [
      { id: 'cake', textKey: 'bday.special.cake', type: 'moment', moment: 'cake', actors: ['bdaykid'] },
      { id: 'kid', textKey: 'bday.special.kid', type: 'actor', actors: ['bdaykid'] },
      { id: 'group', textKey: 'bday.special.group', type: 'group', count: 5 },
    ],
  },
  hazards: {
    lasers: {
      operator: 'animator',
      emitters: BDAY_EMITTERS_X.map((x) => ({ x, y: BDAY_EMITTER_Y })),
      area: { x: 8, y: 124, w: 464, h: 140 },
      lane: LANE,
      waves: [
        { from: 5, patterns: ['hSweep', 'diag', 'vSweep'], rest: 2.7, warn: 1.8, pace: 1.05 },
        { from: 55, patterns: ['vSweep', 'diag', 'hSweep', 'combo'], rest: 2.2, warn: 1.7, pace: 1 },
      ],
    },
  },
  difficulty: { timeLimit: 145, guestSpeedMul: 1.15 },
};
