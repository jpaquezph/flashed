// Escenario 6: recital. Público apretado contra la valla, menos espacio para
// moverse y los patrones de láseres más exigentes antes del jefe.

import { CONCERT_GUESTS } from '../../art';
import { CONCERT_STAGE_X } from '../../art/venues';
import { cornerBooth, EMITTERS, spots } from './helpers';
import type { PropDef, ScenarioConfig } from './types';

/** La valla de seguridad corta el paso antes del escenario. */
const BARRIER_X = 350;
const AREA = { x: 8, y: 124, w: BARRIER_X - 12, h: 140 };
const booth = cornerBooth('concert_booth', false);

const props: PropDef[] = [booth.prop];
for (let y = 128; y <= 270; y += 11) props.push({ key: 'v_barrier', x: BARRIER_X - 5, y: y - 25, depth: y });
props.push(
  { key: 'church_drums', x: 432, y: 156, depth: 194 },
  { key: 'v_amp', x: 440, y: 112, depth: 146 },
  { key: 'v_amp', x: 458, y: 224, depth: 258 },
  { key: 'church_wedge', x: 375, y: 132, depth: 145 },
  { key: 'church_wedge', x: 375, y: 250, depth: 263 },
);

export const concert: ScenarioConfig = {
  id: 'concert',
  nameKey: 'concert.name',
  descKey: 'concert.desc',
  phaseKey: 'concert.phase',
  background: 'concert_bg',
  music: 'concert',
  bounds: { x: 8, y: 124, w: 464, h: 140 },
  props,
  solids: [
    { x: BARRIER_X - 3, y: 110, w: 6, h: 170 },
    { x: CONCERT_STAGE_X - 6, y: 110, w: 120, h: 170 },
  ],
  zones: [],
  playerStart: { x: 70, y: 198 },
  exit: { x: 34, y: 126 },

  guests: {
    wardrobe: CONCERT_GUESTS,
    seats: [],
    seatOccupancy: 0,
    standing: spots([[80, 146], [110, 256], [150, 140]]),
    dancing: spots([
      [236, 138], [262, 150], [290, 136], [316, 148], [336, 136], [248, 168], [300, 170], [330, 166],
      [240, 226], [268, 240], [296, 224], [322, 238], [338, 222], [254, 256], [310, 258], [200, 150], [204, 246],
    ]),
    wanderers: 4,
    roam: [{ x: 14, y: 162, w: 200, h: 70 }],
    seed: 71,
  },
  actors: [
    { id: 'singer', look: 'rock_singer', x: 394, y: 196, facing: -1, main: true },
    { id: 'guitarist', look: 'rock_guitarist', x: 416, y: 238, facing: -1, main: true },
    { id: 'drummer', look: 'rock_drummer', x: 458, y: 188, facing: -1, seated: true },
    { id: 'tech', look: 'concert_tech', ...booth.spot },
  ],
  moments: [
    { id: 'solo', nameKey: 'concert.moment.solo', at: 9, duration: 13, warn: 5, crowd: 'up', actions: [{ actor: 'guitarist', anim: 'up' }] },
    { id: 'chorus', nameKey: 'concert.moment.chorus', at: 38, duration: 13, warn: 5, crowd: 'cheer', actions: [{ actor: 'singer', anim: 'cheer' }] },
  ],

  objectives: {
    requiredPhotos: 6,
    cardCapacity: 10,
    specials: [
      { id: 'solo', textKey: 'concert.special.solo', type: 'moment', moment: 'solo', actors: ['guitarist'] },
      { id: 'chorus', textKey: 'concert.special.chorus', type: 'moment', moment: 'chorus', actors: ['singer'] },
      { id: 'group', textKey: 'special.group', type: 'group', count: 7 },
    ],
  },
  hazards: {
    lasers: {
      operator: 'tech',
      emitters: EMITTERS,
      area: AREA,
      lane: { x: 8, y: 182, w: BARRIER_X - 12, h: 32 },
      waves: [
        { from: 5, patterns: ['diag', 'hSweep', 'vSweep', 'combo'], rest: 1.5, warn: 1.3, pace: 0.9 },
        { from: 40, patterns: ['combo', 'vSweep', 'diag', 'combo', 'hSweep'], rest: 1.2, warn: 1.15, pace: 0.84 },
        { from: 80, patterns: ['combo', 'diag', 'combo', 'vSweep'], rest: 1, warn: 1.1, pace: 0.8 },
      ],
    },
  },
  difficulty: { timeLimit: 125, guestSpeedMul: 1.3 },
};
