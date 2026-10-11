// Escenario 4: boda. Salón lleno de mesas, más gente y momentos cortos que
// exigen estar bien ubicado a tiempo: el vals de los novios y el ramo.

import { WEDDING_GUESTS } from '../../art';
import { cornerBooth, EMITTERS, FLOOR, LANE, OPEN, spots, tableSets } from './helpers';
import type { ScenarioConfig } from './types';

const tables = tableSets('wedding', [[92, 150], [164, 150], [316, 150], [388, 150], [110, 248], [200, 248], [290, 248], [380, 248]]);
const booth = cornerBooth('wedding_booth', true);

export const wedding: ScenarioConfig = {
  id: 'wedding',
  nameKey: 'wedding.name',
  descKey: 'wedding.desc',
  phaseKey: 'wedding.phase',
  background: 'wedding_bg',
  music: 'wedding',
  bounds: FLOOR,
  props: [
    ...tables.props,
    booth.prop,
    { key: 'v_arch', x: 205, y: 44, depth: 121 },
    // Arreglos florales contra la pared y en las esquinas del salón.
    ...[66, 128, 352, 416].map((x) => ({ key: 'v_flowers', x: x - 11, y: 78, depth: 122.5 })),
    { key: 'v_flowers', x: 10, y: 216, depth: 262, collide: { x: 14, y: 256, w: 14, h: 8 } },
  ],
  solids: [],
  zones: [],
  playerStart: { x: 60, y: 200 },
  exit: { x: 40, y: 126 },

  guests: {
    wardrobe: WEDDING_GUESTS,
    seats: tables.seats,
    seatOccupancy: 0.85,
    standing: [...spots([[22, 160], [128, 136], [156, 262], [246, 262]]), ...spots([[352, 136], [462, 170], [336, 262]], -1)],
    dancing: [...spots([[150, 170], [190, 226], [96, 224]]), ...spots([[300, 172], [340, 226], [400, 172]], -1)],
    wanderers: 4,
    roam: [OPEN],
    seed: 47,
  },
  actors: [
    { id: 'bride', look: 'wedding_bride', x: 230, y: 134, facing: 1, main: true },
    { id: 'groom', look: 'wedding_groom', x: 252, y: 134, facing: -1, main: true },
    { id: 'violin_a', look: 'wedding_violin_a', x: 204, y: 131, facing: 1 },
    { id: 'violin_b', look: 'wedding_violin_b', x: 280, y: 131, facing: -1 },
    { id: 'dj', look: 'wedding_dj', ...booth.spot },
  ],
  moments: [
    { id: 'waltz', nameKey: 'wedding.moment.waltz', at: 9, duration: 13, warn: 5, crowd: 'cheer', actions: [{ actor: 'bride', moveTo: { x: 228, y: 198 } }, { actor: 'groom', moveTo: { x: 252, y: 198 } }] },
    { id: 'bouquet', nameKey: 'wedding.moment.bouquet', at: 38, duration: 11, warn: 5, crowd: 'up', actions: [{ actor: 'bride', moveTo: { x: 330, y: 196 }, anim: 'cheer' }] },
  ],

  objectives: {
    requiredPhotos: 5,
    cardCapacity: 10,
    specials: [
      { id: 'waltz', textKey: 'wedding.special.waltz', type: 'moment', moment: 'waltz', actors: ['bride', 'groom'] },
      { id: 'bouquet', textKey: 'wedding.special.bouquet', type: 'moment', moment: 'bouquet', actors: ['bride'] },
      { id: 'group', textKey: 'special.group', type: 'group', count: 6 },
    ],
  },
  hazards: {
    lasers: {
      operator: 'dj',
      emitters: EMITTERS,
      area: FLOOR,
      lane: LANE,
      waves: [
        { from: 5, patterns: ['hSweep', 'diag', 'vSweep'], rest: 2, warn: 1.5, pace: 0.96 },
        { from: 48, patterns: ['combo', 'vSweep', 'diag', 'hSweep'], rest: 1.6, warn: 1.4, pace: 0.9 },
      ],
    },
  },
  difficulty: { timeLimit: 135, guestSpeedMul: 1.2 },
};
