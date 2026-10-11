// Escenario 5: discoteca. La noche empieza tranquila y se va cargando: más
// láseres, más seguidos y combinados, con la pista llena de gente bailando.

import { DISCO_GUESTS } from '../../art';
import { EMITTERS, FLOOR, LANE, OPEN, spots } from './helpers';
import type { ScenarioConfig } from './types';

export const disco: ScenarioConfig = {
  id: 'disco',
  nameKey: 'disco.name',
  descKey: 'disco.desc',
  phaseKey: 'disco.phase',
  background: 'disco_bg',
  music: 'disco',
  bounds: FLOOR,
  props: [
    { key: 'v_bar', x: 8, y: 112, depth: 152, collide: { x: 8, y: 112, w: 84, h: 42 } },
    { key: 'v_djdesk', x: 188, y: 116, depth: 149, collide: { x: 188, y: 122, w: 104, h: 27 } },
    { key: 'v_speakers', x: 160, y: 104, depth: 148, collide: { x: 160, y: 138, w: 22, h: 11 } },
    { key: 'v_speakers', x: 298, y: 104, depth: 148, collide: { x: 298, y: 138, w: 22, h: 11 } },
    { key: 'v_sofa', x: 10, y: 238, depth: 264, collide: { x: 10, y: 251, w: 44, h: 14 } },
    { key: 'v_sofa', x: 426, y: 238, depth: 264, collide: { x: 426, y: 251, w: 44, h: 14 } },
  ],
  solids: [],
  zones: [],
  playerStart: { x: 70, y: 198 },
  exit: { x: 440, y: 126 },

  guests: {
    wardrobe: DISCO_GUESTS,
    seats: [],
    seatOccupancy: 0,
    standing: [...spots([[104, 146], [120, 164]], -1), ...spots([[400, 140], [70, 244]])],
    dancing: [
      ...spots([[150, 166], [196, 172], [250, 164], [330, 170], [380, 166], [130, 226], [210, 230], [300, 226], [356, 232]]),
      ...spots([[172, 176], [282, 174], [420, 176], [170, 236], [254, 224], [400, 228]], -1),
    ],
    wanderers: 4,
    roam: [OPEN],
    seed: 59,
  },
  actors: [
    { id: 'dj', look: 'dj', x: 240, y: 138, facing: -1, main: true },
    { id: 'bartender', look: 'disco_bartender', x: 50, y: 130, facing: 1 },
  ],
  moments: [
    { id: 'drop', nameKey: 'disco.moment.drop', at: 10, duration: 14, warn: 5, crowd: 'cheer', actions: [] },
    { id: 'anthem', nameKey: 'disco.moment.anthem', at: 40, duration: 14, warn: 5, crowd: 'up', actions: [] },
  ],

  objectives: {
    requiredPhotos: 6,
    cardCapacity: 10,
    specials: [
      { id: 'drop', textKey: 'disco.special.drop', type: 'moment', moment: 'drop', actors: ['dj'] },
      { id: 'bartender', textKey: 'disco.special.bartender', type: 'actor', actors: ['bartender'] },
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
        { from: 5, patterns: ['hSweep', 'vSweep', 'diag'], rest: 1.8, warn: 1.4, pace: 0.94 },
        { from: 40, patterns: ['diag', 'hSweep', 'vSweep', 'combo'], rest: 1.5, warn: 1.3, pace: 0.9 },
        { from: 80, patterns: ['combo', 'diag', 'vSweep', 'combo'], rest: 1.2, warn: 1.2, pace: 0.85 },
      ],
    },
  },
  difficulty: { timeLimit: 130, guestSpeedMul: 1.25 },
};
