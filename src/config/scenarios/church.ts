// Escenario 1: evento religioso. Una noche de alabanza en una iglesia moderna, con
// banda en vivo y parrilla de luces. Dificultad baja: enseña movimiento, fotografía
// y los primeros láseres, con advertencias largas y patrones simples.

import { CHURCH_WARDROBE } from '../../art';
import { LASER_EMITTERS_X, LASER_EMITTER_Y, PEW_DEPTH, STAGE_X } from '../../art/church';
import type { PropDef, ScenarioConfig, SpotDef } from './types';

const PEW_X = [104, 160, 216, 272];
const UPPER_BACK = 128;
const LOWER_BACK = 216;
/** Pasillo central: siempre transitable de punta a punta. */
const AISLE = { x: 8, y: 178, w: STAGE_X - 18, h: 36 };

const props: PropDef[] = [];
const seats: SpotDef[] = [];

for (const x of PEW_X) {
  // Los bloques de bancos llegan hasta la pared y hasta el borde inferior: se circula por el pasillo central.
  props.push({ key: 'church_pew', x: x - 2, y: UPPER_BACK - 23, depth: UPPER_BACK, collide: { x, y: 110, w: 17, h: UPPER_BACK + PEW_DEPTH - 111 } });
  props.push({ key: 'church_pew', x: x - 2, y: LOWER_BACK - 23, depth: LOWER_BACK, collide: { x, y: LOWER_BACK - 2, w: 17, h: 60 } });
  for (const back of [UPPER_BACK, LOWER_BACK]) {
    for (const dy of [11, 24, 37]) seats.push({ x: x + 10, y: back + dy, facing: 1 });
  }
}

props.push(
  // Sobre el escenario (la tarima entera es sólida).
  { key: 'church_pulpit', x: 376, y: 172, depth: 204 },
  { key: 'church_keyboard', x: 408, y: 126, depth: 150 },
  { key: 'church_drums', x: 432, y: 160, depth: 198 },
  { key: 'church_wedge', x: 375, y: 132, depth: 145 },
  { key: 'church_wedge', x: 375, y: 240, depth: 253 },
  { key: 'church_candles', x: 384, y: 92, depth: 127 },
  { key: 'church_candles', x: 458, y: 92, depth: 127 },
  // Consola de sonido y luces, al fondo del salón.
  { key: 'church_booth', x: 14, y: 226, depth: 256, collide: { x: 15, y: 243, w: 38, h: 14 } },
);

export const church: ScenarioConfig = {
  id: 'church',
  nameKey: 'church.name',
  descKey: 'church.desc',
  phaseKey: 'church.phase',
  background: 'church_bg',
  music: 'church',
  bounds: { x: 8, y: 124, w: 464, h: 140 },
  props,
  solids: [{ x: STAGE_X - 6, y: 110, w: 120, h: 170 }],
  zones: [],
  playerStart: { x: 76, y: 196 },
  exit: { x: 34, y: 126 },

  guests: {
    wardrobe: CHURCH_WARDROBE,
    seats,
    seatOccupancy: 0.6,
    standing: [
      { x: 78, y: 146, facing: 1 },
      { x: 86, y: 250, facing: 1 },
      { x: 312, y: 148, facing: 1 },
      { x: 330, y: 138, facing: 1 },
      { x: 350, y: 150, facing: 1 },
      { x: 318, y: 246, facing: 1 },
      { x: 342, y: 236, facing: 1 },
    ],
    wanderers: 3,
    roam: [
      { x: 14, y: 140, w: 80, h: 66 },
      { x: 14, y: 182, w: 340, h: 28 },
      { x: 300, y: 160, w: 56, h: 68 },
    ],
    hub: { x: 14, y: 182, w: 340, h: 28 },
    seed: 7,
  },
  actors: [
    { id: 'pastor', look: 'church_pastor', x: 396, y: 199, facing: -1, main: true },
    { id: 'singer', look: 'church_singer', x: 398, y: 160, facing: -1, main: true },
    { id: 'guitarist', look: 'church_guitarist', x: 424, y: 238, facing: -1 },
    { id: 'keys', look: 'church_keys', x: 430, y: 146, facing: -1 },
    { id: 'drummer', look: 'church_drummer', x: 458, y: 192, facing: -1, seated: true },
    { id: 'operator', look: 'church_operator', x: 34, y: 240, facing: 1 },
  ],
  moments: [
    { id: 'worship', nameKey: 'church.moment.worship', at: 9, duration: 16, warn: 5, crowd: 'up', actions: [{ actor: 'singer', anim: 'cheer' }, { actor: 'guitarist', anim: 'up' }] },
    { id: 'sermon', nameKey: 'church.moment.sermon', at: 40, duration: 16, warn: 5, actions: [{ actor: 'pastor', anim: 'up' }] },
  ],

  objectives: {
    requiredPhotos: 4,
    cardCapacity: 10,
    specials: [
      { id: 'worship', textKey: 'church.special.worship', type: 'moment', moment: 'worship', actors: ['singer'] },
      { id: 'pastor', textKey: 'church.special.pastor', type: 'actor', actors: ['pastor'] },
      { id: 'group', textKey: 'church.special.group', type: 'group', count: 4 },
    ],
  },
  hazards: {
    lasers: {
      operator: 'operator',
      emitters: LASER_EMITTERS_X.map((x) => ({ x, y: LASER_EMITTER_Y })),
      area: { x: 8, y: 124, w: STAGE_X - 14, h: 140 },
      lane: AISLE,
      waves: [
        { from: 6, patterns: ['hSweep', 'vSweep'], rest: 3.2, warn: 2, pace: 1.15 },
        { from: 55, patterns: ['hSweep', 'diag', 'vSweep'], rest: 2.6, warn: 1.9, pace: 1.1 },
      ],
    },
  },
  difficulty: { timeLimit: 150, guestSpeedMul: 1 },
};
