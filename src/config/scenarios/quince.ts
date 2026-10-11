// Escenario 3: cumpleaños de 15. Más invitados y movimiento, pista de baile en el
// centro y momentos fotográficos marcados: la entrada y el vals.

import { QUINCE_GUESTS } from '../../art';
import { cornerBooth, EMITTERS, FLOOR, LANE, OPEN, spots, tableSets } from './helpers';
import type { ScenarioConfig } from './types';

const tables = tableSets('quince', [[110, 150], [200, 150], [290, 150], [380, 150], [150, 248], [250, 248], [350, 248]]);
const booth = cornerBooth('quince_booth', false);

export const quince: ScenarioConfig = {
  id: 'quince',
  nameKey: 'quince.name',
  descKey: 'quince.desc',
  phaseKey: 'quince.phase',
  background: 'quince_bg',
  music: 'quince',
  bounds: FLOOR,
  props: [...tables.props, booth.prop],
  solids: [],
  zones: [],
  playerStart: { x: 90, y: 200 },
  exit: { x: 56, y: 126 },

  guests: {
    wardrobe: QUINCE_GUESTS,
    seats: tables.seats,
    seatOccupancy: 0.8,
    standing: [...spots([[26, 150], [70, 256]]), ...spots([[452, 150], [446, 258]], -1)],
    dancing: [...spots([[176, 172], [262, 170], [196, 226], [286, 224]]), ...spots([[216, 168], [302, 174], [240, 228]], -1)],
    wanderers: 3,
    roam: [OPEN],
    seed: 31,
  },
  actors: [
    { id: 'quinceanera', look: 'quince_girl', x: 78, y: 132, facing: 1, main: true },
    { id: 'dj', look: 'quince_dj', ...booth.spot },
  ],
  moments: [
    { id: 'entrance', nameKey: 'quince.moment.entrance', at: 9, duration: 15, warn: 5, crowd: 'cheer', actions: [{ actor: 'quinceanera', moveTo: { x: 240, y: 198 } }] },
    { id: 'waltz', nameKey: 'quince.moment.waltz', at: 40, duration: 15, warn: 5, crowd: 'up', actions: [{ actor: 'quinceanera', moveTo: { x: 240, y: 198 }, anim: 'cheer' }] },
  ],

  objectives: {
    requiredPhotos: 5,
    cardCapacity: 10,
    specials: [
      { id: 'entrance', textKey: 'quince.special.entrance', type: 'moment', moment: 'entrance', actors: ['quinceanera'] },
      { id: 'waltz', textKey: 'quince.special.waltz', type: 'moment', moment: 'waltz', actors: ['quinceanera'] },
      { id: 'group', textKey: 'special.group', type: 'group', count: 5 },
    ],
  },
  hazards: {
    lasers: {
      operator: 'dj',
      emitters: EMITTERS,
      area: FLOOR,
      lane: LANE,
      waves: [
        { from: 5, patterns: ['hSweep', 'vSweep', 'diag'], rest: 2.3, warn: 1.6, pace: 1 },
        { from: 50, patterns: ['vSweep', 'diag', 'hSweep', 'combo'], rest: 1.8, warn: 1.5, pace: 0.94 },
      ],
    },
  },
  difficulty: { timeLimit: 140, guestSpeedMul: 1.15 },
};
