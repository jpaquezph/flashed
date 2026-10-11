// Vestuario: cada entrada es un "look" reutilizable que genera un spritesheet propio.

import type { Look } from './character';
import { rng } from './svg';

const SKIN = { pale: '#f3cfae', light: '#e9b98f', tan: '#d39a68', brown: '#a9683f', dark: '#7c4a2e' };

/** El fotógrafo: siempre de negro, con la réflex y su flash bien visibles. */
export const PHOTOGRAPHER: Look = {
  skin: SKIN.light,
  hair: 'quiff',
  hairColor: '#5a3524',
  clothing: 'tee',
  top: '#3a3a47',
  bottom: '#2a2a35',
  shoes: '#1d1d26',
  sole: true,
  camera: true,
};

type Extra = Partial<Look>;
const casual = (clothing: 'tee' | 'shirt', skin: string, hair: Look['hair'], hairColor: string, top: string, bottom: string, extra: Extra = {}): Look => ({
  skin, hair, hairColor, clothing, top, bottom, shoes: '#ece8df', sole: true, ...extra,
});
const dress = (skin: string, hair: Look['hair'], hairColor: string, top: string, accent: string, extra: Extra = {}): Look => ({
  skin, hair, hairColor, clothing: 'dress', top, bottom: top, shoes: accent, accent, ...extra,
});

const JEANS = '#34508c';
const DARK_JEANS = '#27324f';
const KHAKI = '#b59a6a';

const SKINS = Object.values(SKIN);
const HAIR_COLORS = ['#1c1618', '#3b2620', '#5a3a26', '#b5482a', '#e3c36a', '#2a1c18', '#8a8f9a', '#7a4a2a'];
const HAIR_M: Look['hair'][] = ['short', 'quiff', 'curly', 'bald'];
const HAIR_F: Look['hair'][] = ['long', 'bob', 'bun', 'ponytail', 'curly'];

/**
 * Arma un público variado y repetible a partir de una paleta. En los eventos formales
 * ellos van de traje y ellas de vestido; en los informales, remeras, camisas y vestidos.
 */
function crowd(seed: number, tops: string[], bottoms: string[], formal: boolean, count = tops.length): Look[] {
  const random = rng(seed);
  const pick = <T,>(list: T[]): T => list[Math.floor(random() * list.length)];
  return Array.from({ length: count }, (_, i) => {
    const skin = pick(SKINS);
    const hairColor = pick(HAIR_COLORS);
    const top = tops[i % tops.length];
    const extra: Extra = { glasses: random() < 0.2 };
    if (i % 2 === 1) return dress(skin, pick(HAIR_F), hairColor, top, tops[(i + 5) % tops.length], extra);
    if (formal) return { skin, hair: pick(HAIR_M), hairColor, clothing: 'suit', top: bottoms[i % bottoms.length], bottom: bottoms[i % bottoms.length], shoes: '#2a1d1a', accent: top, beard: random() < 0.3, ...extra } as Look;
    return casual(random() < 0.5 ? 'tee' : 'shirt', skin, pick(HAIR_M), hairColor, top, bottoms[i % bottoms.length], { beard: random() < 0.3, ...extra });
  });
}

/** Público del evento religioso: ropa de calle prolija, colores vivos sobre el salón oscuro. */
export const CHURCH_GUESTS: Look[] = [
  casual('shirt', SKIN.light, 'short', '#5a3a26', '#e8e2d2', JEANS),
  casual('shirt', SKIN.pale, 'bald', '#b9b4ad', '#5d8fd6', KHAKI, { glasses: true, shoes: '#5a3a26', sole: false }),
  casual('tee', SKIN.tan, 'quiff', '#1f1a1c', '#e2553f', DARK_JEANS, { beard: true }),
  casual('tee', SKIN.dark, 'short', '#1c1618', '#3fae63', JEANS),
  casual('shirt', SKIN.brown, 'curly', '#221a1a', '#f1c232', DARK_JEANS),
  dress(SKIN.light, 'long', '#3b2620', '#c56bd6', '#7d3c8f'),
  dress(SKIN.pale, 'bun', '#e3c36a', '#2fb5a6', '#1f7a70'),
  dress(SKIN.tan, 'bob', '#b5482a', '#f08a5d', '#b8532d'),
  dress(SKIN.pale, 'bun', '#cfcbc6', '#6f7fd8', '#46509a', { glasses: true }),
  casual('tee', SKIN.brown, 'ponytail', '#2a1c18', '#f2a0c0', JEANS),
  casual('tee', SKIN.light, 'short', '#7a4a2a', '#f1c232', JEANS, { scale: 0.78, headScale: 1.15 }),
  dress(SKIN.tan, 'ponytail', '#2a1c18', '#ff7fa8', '#c74f7a', { scale: 0.78, headScale: 1.15 }),
  ...crowd(13, ['#8fd0c0', '#d98a4a', '#9a6fd0', '#d0d07a', '#4a9fc0', '#c05a7a'], ['#4a4f5e', '#5a3a2a', '#2f4a44'], false),
];

/** Quienes están sobre el escenario. */
export const CHURCH_PASTOR: Look = casual('shirt', SKIN.light, 'quiff', '#3a2a22', '#f3efe6', DARK_JEANS, { beard: true, prop: 'mic', shoes: '#6a4426', sole: false });
export const CHURCH_SINGER: Look = casual('tee', SKIN.tan, 'long', '#2a1c18', '#f1c232', DARK_JEANS, { prop: 'mic' });
export const CHURCH_GUITARIST: Look = casual('tee', SKIN.pale, 'short', '#c9843a', '#2f2f3a', JEANS, { prop: 'guitar', accent: '#e2553f' });
export const CHURCH_DRUMMER: Look = casual('tee', SKIN.dark, 'curly', '#1c1618', '#e8e2d2', DARK_JEANS);
/** El iluminador: maneja la consola y disfruta demasiado de prender los láseres. */
export const CHURCH_OPERATOR: Look = casual('shirt', SKIN.pale, 'quiff', '#1c1618', '#6a2fb0', '#1f1f2a', { beard: true, headphones: true });
export const CHURCH_KEYS: Look = casual('shirt', SKIN.brown, 'bob', '#221a1a', '#c56bd6', DARK_JEANS);

// ---------- Escenario 2: cumpleaños infantil ----------

const KID: Extra = { scale: 0.72, headScale: 1.18 };
const party = (hatColor: string): Extra => ({ hat: 'party', hatColor });

/** Adultos del cumpleaños: ropa de fin de semana, algunos con gorrito. */
export const BDAY_ADULT_LOOKS: Look[] = [
  casual('tee', SKIN.light, 'short', '#5a3a26', '#ff8a3b', JEANS, party('#4fe0ff')),
  casual('shirt', SKIN.tan, 'quiff', '#1f1a1c', '#5be37a', KHAKI, { beard: true }),
  casual('tee', SKIN.dark, 'curly', '#1c1618', '#ffd23f', DARK_JEANS),
  casual('shirt', SKIN.pale, 'bald', '#b9b4ad', '#e8e2d2', JEANS, { glasses: true, ...party('#ff4f8b') }),
  dress(SKIN.light, 'ponytail', '#b5482a', '#4fe0ff', '#2f8fb0'),
  dress(SKIN.brown, 'long', '#221a1a', '#ff4f8b', '#b02f63', party('#ffd23f')),
  dress(SKIN.pale, 'bob', '#e3c36a', '#b07bff', '#6f48b8'),
  casual('tee', SKIN.tan, 'bun', '#3b2620', '#f4f1ea', '#c2603f', { glasses: true }),
  ...crowd(29, ['#7fd0ff', '#ff6f6f', '#c0e04a', '#ffa0d0', '#6f7fe0', '#e0a04a'], ['#4a4f5e', '#5a3a2a', '#27324f'], false),
];

/** Los chicos: corren por todo el salón. */
export const BDAY_KID_LOOKS: Look[] = [
  casual('tee', SKIN.light, 'short', '#7a4a2a', '#ff4f8b', JEANS, { ...KID, ...party('#5be37a') }),
  casual('tee', SKIN.dark, 'curly', '#1c1618', '#4fe0ff', KHAKI, KID),
  dress(SKIN.tan, 'ponytail', '#2a1c18', '#ffd23f', '#c9962a', { ...KID, ...party('#b07bff') }),
  casual('tee', SKIN.pale, 'quiff', '#e3c36a', '#5be37a', DARK_JEANS, KID),
  dress(SKIN.light, 'bob', '#3b2620', '#ff8a3b', '#b85a1f', { ...KID, ...party('#4fe0ff') }),
  casual('tee', SKIN.brown, 'short', '#221a1a', '#b07bff', JEANS, { ...KID, glasses: true }),
  dress(SKIN.pale, 'bun', '#b5482a', '#5be37a', '#2f8f4a', KID),
  casual('tee', SKIN.tan, 'curly', '#3b2620', '#ffe03b', '#c2603f', { ...KID, ...party('#ff4f8b') }),
];

/** El cumpleañero, con su corona. */
export const BDAY_KID: Look = casual('tee', SKIN.light, 'quiff', '#c9843a', '#e2553f', JEANS, { ...KID, scale: 0.76, hat: 'crown' });
/** El animador: maneja las luces de la fiesta. */
export const BDAY_ANIMATOR: Look = casual('shirt', SKIN.tan, 'curly', '#e2553f', '#ffd23f', '#6a2fb0', { headphones: true, accent: '#ff4f8b' });

// ---------- Escenarios 3 a 7 ----------

const operator = (shirt: string, hairColor: string, skin: string): Look =>
  casual('shirt', skin, 'quiff', hairColor, shirt, '#1f1f2a', { beard: true, headphones: true });

/** Cumpleaños de 15: gala en rosas, lilas y dorados. */
export const QUINCE_LOOKS = crowd(
  31,
  ['#ff7fc0', '#b07bff', '#ffd23f', '#4fe0ff', '#ff4f8b', '#f4f1ea', '#7fe0b0', '#ff9a5a', '#8f9fff', '#e05ad0', '#c0e06f', '#5ac0d0', '#ffb0b0', '#d0a0ff', '#f0e08a', '#6fd08f'],
  ['#3a3f6b', '#5a2a5e', '#2f4f6b', '#6b4a35', '#2a2a35', '#4a3a6b', '#6b2f3f', '#2f5a4a'],
  true,
);
export const QUINCE_GIRL: Look = dress(SKIN.light, 'long', '#3b2620', '#ff5fb0', '#ffd23f', { hat: 'crown', gown: true });
export const QUINCE_DJ = operator('#ff7fc0', '#1c1618', SKIN.tan);

/** Boda: elegantes, en tonos joya y pasteles. */
export const WEDDING_LOOKS = crowd(
  47,
  ['#2f8f7a', '#c9a24a', '#8a4a7a', '#4a7fc0', '#d98a8a', '#7a8f4a', '#c05a4a', '#5a6fc0', '#b08fd0', '#4ab0a0', '#e0b07a', '#9a3a5a', '#6f9fd0', '#d0c04a', '#7a5ab0', '#4a8f5a', '#e08fb0', '#a0704a'],
  ['#27324f', '#4a4f5e', '#5a3a2a', '#2f4a44', '#1f1f2a', '#4a2f4a', '#3a4a6b', '#5a4a3a', '#2a3a3a'],
  true,
);
/** La novia: vestido blanco largo, velo y ramo. */
export const WEDDING_BRIDE: Look = dress(SKIN.light, 'bun', '#5a3a26', '#ffffff', '#e9d9a0', { gown: true, veil: true, prop: 'bouquet', shoes: '#f4f1ea' });
const violinist = (skin: string, hair: Look['hair'], hairColor: string): Look =>
  ({ skin, hair, hairColor, clothing: 'suit', top: '#1f1f2a', bottom: '#1f1f2a', shoes: '#15121d', accent: '#f4f1ea', prop: 'violin' });
export const WEDDING_VIOLIN_A = violinist(SKIN.brown, 'bun', '#1c1618');
export const WEDDING_VIOLIN_B = violinist(SKIN.pale, 'short', '#b5482a');
export const WEDDING_GROOM: Look = { skin: SKIN.tan, hair: 'short', hairColor: '#1c1618', clothing: 'suit', top: '#27407a', bottom: '#27407a', shoes: '#2a1d1a', accent: '#e9c94a' };
export const WEDDING_DJ = operator('#e9c94a', '#5a3a26', SKIN.pale);

/** Discoteca: ropa de salir, colores flúo. */
export const DISCO_LOOKS = crowd(
  59,
  ['#ff3bd4', '#3bd4ff', '#39ff6a', '#ffe03b', '#ff5a3b', '#b07bff', '#f4f1ea', '#ff8fb0', '#5affd0', '#ffa03b', '#7f8fff', '#d0ff5a', '#ff5a8f', '#5ab0ff'],
  ['#27324f', '#3a2a5e', '#4a4f5e', '#1f3a44', '#15121d', '#5a2a4a', '#2a4a5e'],
  false,
);
/** El DJ: responsable de los láseres y jefe final. */
export const DJ: Look = casual('tee', SKIN.pale, 'quiff', '#39ff6a', '#ff3bd4', '#27203f', { beard: true, headphones: true, glasses: true });
export const DISCO_BARTENDER: Look = casual('shirt', SKIN.brown, 'bun', '#1c1618', '#f4f1ea', '#27324f', { accent: '#ff3bd4' });

/** Recital: público rockero. */
export const CONCERT_LOOKS = crowd(
  71,
  ['#c0392b', '#e8e2d2', '#3f6fb0', '#e2a53a', '#6a8f4a', '#8a4ab0', '#2a2a35', '#d05a8f', '#4ab0b0', '#b0b04a', '#e07a3a', '#6f6fd0', '#8f3a3a', '#5a8f6f'],
  [JEANS, DARK_JEANS, '#5a4a3a', '#3a3d4c', '#15121d', '#4a3a2a', '#2f3f4a'],
  false,
);
export const ROCK_SINGER: Look = casual('tee', SKIN.pale, 'long', '#e3c36a', '#c0392b', DARK_JEANS, { prop: 'mic' });
export const ROCK_GUITARIST: Look = casual('tee', SKIN.tan, 'curly', '#1c1618', '#e8e2d2', JEANS, { prop: 'guitar', accent: '#3bd4ff', beard: true });
export const ROCK_DRUMMER: Look = casual('tee', SKIN.dark, 'bald', '#1c1618', '#e2a53a', DARK_JEANS, { beard: true });
export const CONCERT_TECH = operator('#ff5a3b', '#b5482a', SKIN.light);
