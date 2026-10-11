// Generador de personajes: arma una figura por piezas (cabeza, torso, brazos y piernas
// articulados) a partir de un "look" y una pose, y la empaqueta en un spritesheet SVG.
// Estilo: beat 'em up dibujado, formas angulosas, contorno negro grueso y sombreado plano.
// Todos los personajes del juego salen de acá, así que para sustituirlos por arte
// dibujado alcanza con respetar celdas, anclas y nombres de frame.

import { OUTLINE, n, shade, type TexDef } from './svg';

/** Tamaño de celda y punto de apoyo de los pies dentro de la celda. */
export const CELL_W = 44;
export const CELL_H = 64;
export const FOOT_X = 22;
export const FOOT_Y = 60;

const UPPER_ARM = 7;
const FORE_ARM = 6.5;
const THIGH = 8;
const SHIN = 8;
const ARM_W = 4;
const LEG_W = 4.8;

export type Clothing = 'tee' | 'shirt' | 'suit' | 'dress';
export type Hair = 'short' | 'quiff' | 'long' | 'bob' | 'bun' | 'ponytail' | 'bald' | 'curly';
export type Face = 'neutral' | 'smile' | 'open' | 'ouch' | 'wink' | 'evil' | 'angry' | 'cry';

export interface Look {
  skin: string;
  hair: Hair;
  hairColor: string;
  clothing: Clothing;
  top: string;
  bottom: string;
  shoes: string;
  /** Corbata o cinturón. */
  accent?: string;
  /** Suela clara (zapatillas). */
  sole?: boolean;
  /** Escala general (niños < 1). */
  scale?: number;
  headScale?: number;
  glasses?: boolean;
  beard?: boolean;
  headphones?: boolean;
  /** Gorro de cumpleaños o corona. */
  hat?: 'party' | 'crown';
  hatColor?: string;
  /** Lleva la cámara réflex con flash: solo el fotógrafo. */
  camera?: boolean;
  /** Objeto de escenario. */
  prop?: 'mic' | 'guitar' | 'violin' | 'bouquet';
  /** Vestido largo hasta el piso (novia, quinceañera). */
  gown?: boolean;
  /** Velo de novia. */
  veil?: boolean;
}

/** Ángulos en grados. Brazos y piernas: [articulación superior hacia adelante, flexión]. */
export interface Pose {
  fLeg: [number, number];
  bLeg: [number, number];
  fArm: [number, number];
  bArm: [number, number];
  /** Desplazamiento vertical de todo el cuerpo (positivo = más abajo). */
  bob?: number;
  /** Desplazamiento vertical solo del tronco (respiración). */
  breath?: number;
  /** Baja la cadera: personaje sentado. */
  hipDrop?: number;
  /** Inclinación del tronco hacia adelante. */
  lean?: number;
  face?: Face;
  /** Dónde va la cámara: en la mano o colgando de la correa. */
  camera?: 'hand' | 'hang';
  /** Lleva la tarjeta de memoria en la mano de adelante. */
  card?: boolean;
}

/** Nombres de frame, en el orden en que se ubican en el spritesheet. */
export const FRAMES = [
  'idle0', 'idle1', 'walk0', 'walk1', 'walk2', 'walk3', 'sit0', 'sit1',
  'pose0', 'pose1', 'hurt', 'cheer0', 'cheer1', 'up0', 'up1',
] as const;
export type FrameName = (typeof FRAMES)[number];
export type PoseSet = Record<FrameName, Pose>;
const SHEET_COLS = 8;

const WALK_LEGS: Pick<Pose, 'fLeg' | 'bLeg' | 'bob'>[] = [
  { fLeg: [28, 6], bLeg: [-24, 22], bob: 1.6 },
  { fLeg: [6, 4], bLeg: [12, 58], bob: 0 },
  { fLeg: [-24, 22], bLeg: [28, 6], bob: 1.6 },
  { fLeg: [12, 58], bLeg: [6, 4], bob: 0 },
];
const STAND: Pick<Pose, 'fLeg' | 'bLeg'> = { fLeg: [4, 0], bLeg: [-5, 0] };

/** Poses de los invitados. */
export const GUEST_POSES: PoseSet = {
  idle0: { ...STAND, fArm: [8, 10], bArm: [-8, 6] },
  idle1: { ...STAND, fArm: [9, 12], bArm: [-8, 8], breath: 0.7 },
  walk0: { ...WALK_LEGS[0], fArm: [-26, 10], bArm: [28, 25] },
  walk1: { ...WALK_LEGS[1], fArm: [-6, 12], bArm: [8, 16] },
  walk2: { ...WALK_LEGS[2], fArm: [28, 25], bArm: [-26, 10] },
  walk3: { ...WALK_LEGS[3], fArm: [8, 16], bArm: [-6, 12] },
  sit0: { fLeg: [86, 86], bLeg: [84, 84], fArm: [40, 30], bArm: [36, 30], hipDrop: 7 },
  sit1: { fLeg: [86, 86], bLeg: [84, 84], fArm: [40, 32], bArm: [36, 30], hipDrop: 7, breath: 0.6 },
  // Posan para la foto.
  pose0: { ...STAND, fArm: [128, -30], bArm: [-8, 6], face: 'smile' },
  pose1: { ...STAND, fArm: [136, 10], bArm: [-8, 6], face: 'smile', breath: 0.5 },
  hurt: { ...STAND, fArm: [40, 60], bArm: [30, 60], face: 'open', lean: -1 },
  cheer0: { ...STAND, fArm: [150, -10], bArm: [140, -10], face: 'smile' },
  cheer1: { ...STAND, fArm: [160, 14], bArm: [150, 14], face: 'smile', bob: -1.5 },
  // Brazos en alto.
  up0: { ...STAND, fArm: [132, -12], bArm: [122, -12] },
  up1: { ...STAND, fArm: [138, -4], bArm: [128, -6], breath: 0.6 },
};

/** Variante de las poses de pie con los brazos fijos (cantante con micrófono, guitarrista). */
function withArms(base: PoseSet, fArm: [number, number], bArm: [number, number], raised: [number, number]): PoseSet {
  const out = { ...base };
  for (const name of ['idle0', 'idle1', 'pose0', 'pose1'] as const) out[name] = { ...base[name], fArm, bArm };
  for (const name of ['up0', 'up1', 'cheer0', 'cheer1'] as const) out[name] = { ...base[name], fArm, bArm: raised, face: 'smile' };
  return out;
}

/** Operador de luces: su festejo es una risa malvada con el puño en alto. */
export const OPERATOR_POSES: PoseSet = {
  ...GUEST_POSES,
  cheer0: { ...STAND, fArm: [112, -24], bArm: [38, 60], face: 'evil', lean: -1 },
  cheer1: { ...STAND, fArm: [124, -10], bArm: [44, 66], face: 'evil', lean: -1.8, bob: -1.4 },
};

/** El DJ derrotado: patalea y sacude el puño (se usa en la cinemática final). */
export const ANGRY_POSES: PoseSet = {
  ...GUEST_POSES,
  idle0: { ...STAND, fArm: [30, 100], bArm: [20, 100], face: 'angry' },
  idle1: { ...STAND, fArm: [32, 104], bArm: [22, 102], face: 'angry', breath: 0.7 },
  cheer0: { ...STAND, fArm: [100, -34], bArm: [40, 70], face: 'angry', lean: 1 },
  cheer1: { fLeg: [22, 34], bLeg: [-5, 0], fArm: [110, -20], bArm: [46, 78], face: 'angry', lean: 1.6, bob: -1.2 },
};

export const MIC_POSES = withArms(GUEST_POSES, [70, 95], [-6, 8], [140, -10]);
export const GUITAR_POSES = withArms(GUEST_POSES, [30, 62], [62, 34], [62, 34]);

/** Violinista: una mano en el mástil y la otra moviendo el arco. */
export const VIOLIN_POSES: PoseSet = (() => {
  const out = { ...GUEST_POSES };
  const bows: [number, number][] = [[75, 60], [60, 70]];
  (['idle0', 'idle1', 'pose0', 'pose1', 'up0', 'up1', 'cheer0', 'cheer1'] as const).forEach((name, i) => {
    out[name] = { ...GUEST_POSES[name], fArm: bows[i % 2], bArm: [95, 45], face: name.startsWith('idle') ? 'neutral' : 'smile' };
  });
  return out;
})();

const HOLD: Pick<Pose, 'fArm' | 'bArm'> = { fArm: [25, 95], bArm: [40, 80] };
const AIM: Pick<Pose, 'fArm' | 'bArm'> = { fArm: [95, 70], bArm: [100, 60] };

/** Poses del fotógrafo: siempre lleva la cámara en las manos. */
export const PHOTOGRAPHER_POSES: PoseSet = {
  idle0: { ...STAND, ...HOLD },
  idle1: { ...STAND, fArm: [26, 97], bArm: [40, 82], breath: 0.7 },
  walk0: { ...WALK_LEGS[0], fArm: [22, 96], bArm: [38, 80] },
  walk1: { ...WALK_LEGS[1], ...HOLD },
  walk2: { ...WALK_LEGS[2], fArm: [28, 94], bArm: [42, 80] },
  walk3: { ...WALK_LEGS[3], ...HOLD },
  sit0: { ...STAND, ...HOLD },
  sit1: { ...STAND, ...HOLD },
  // pose0/pose1 = apuntar y disparar.
  pose0: { fLeg: [12, 4], bLeg: [-14, 4], ...AIM, lean: 1, face: 'wink', bob: 0.8 },
  pose1: { fLeg: [14, 6], bLeg: [-16, 6], ...AIM, lean: 1.6, face: 'wink', bob: 1.1 },
  hurt: { fLeg: [-14, 8], bLeg: [-26, 16], fArm: [-50, 30], bArm: [-70, 20], lean: -2.5, face: 'ouch', camera: 'hang', bob: 0.8 },
  cheer0: { ...STAND, fArm: [128, -18], bArm: [40, 80], face: 'smile', camera: 'hang' },
  cheer1: { fLeg: [8, 20], bLeg: [-8, 24], fArm: [142, -14], bArm: [40, 80], face: 'smile', bob: -3, camera: 'hang' },
  up0: { ...STAND, ...HOLD },
  up1: { ...STAND, ...HOLD },
};

/**
 * Tarjeta llena: el fotógrafo mira la cámara (idle), saca la tarjeta (pose0) y la
 * levanta (pose1), y se larga a llorar (cheer). Va en un spritesheet aparte.
 */
export const CARD_POSES: PoseSet = {
  ...PHOTOGRAPHER_POSES,
  idle0: { ...STAND, fArm: [42, 104], bArm: [54, 88], lean: 1.4, face: 'open' },
  idle1: { ...STAND, fArm: [44, 108], bArm: [56, 90], lean: 1.8, face: 'open', bob: 0.6 },
  pose0: { ...STAND, fArm: [48, 62], bArm: [40, 80], lean: 1, face: 'open', camera: 'hang' },
  pose1: { ...STAND, fArm: [112, 34], bArm: [40, 80], face: 'ouch', camera: 'hang', card: true },
  cheer0: { fLeg: [10, 14], bLeg: [-8, 14], fArm: [120, 80], bArm: [125, 70], face: 'cry', camera: 'hang', bob: 1.4, lean: 0.6 },
  cheer1: { fLeg: [10, 22], bLeg: [-8, 22], fArm: [124, 84], bArm: [128, 74], face: 'cry', camera: 'hang', bob: 2.6, lean: 1.2 },
};

const rad = (deg: number) => (deg * Math.PI) / 180;

interface Joint { kx: number; ky: number; ex: number; ey: number }

/** Posición de la articulación media y del extremo de una extremidad de dos segmentos. */
function joint(x: number, y: number, a1: number, l1: number, a2: number, l2: number): Joint {
  const kx = x + Math.sin(rad(a1)) * l1;
  const ky = y + Math.cos(rad(a1)) * l1;
  return { kx, ky, ex: kx + Math.sin(rad(a2)) * l2, ey: ky + Math.cos(rad(a2)) * l2 };
}

/** Dibuja una extremidad como dos tramos con contorno común. */
function limb(x: number, y: number, j: Joint, w: number, upper: string, lower: string): string {
  const a = `M${n(x)},${n(y)} L${n(j.kx)},${n(j.ky)}`;
  const b = `M${n(j.kx)},${n(j.ky)} L${n(j.ex)},${n(j.ey)}`;
  const base = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';
  return (
    `<path d="${a} L${n(j.ex)},${n(j.ey)}" ${base} stroke="${OUTLINE}" stroke-width="${w + 2.4}"/>` +
    `<path d="${b}" ${base} stroke="${lower}" stroke-width="${w}"/>` +
    `<path d="${a}" ${base} stroke="${upper}" stroke-width="${w}"/>`
  );
}

/** Zapato con puntera hacia adelante. */
function shoe(x: number, y: number, color: string, sole: boolean): string {
  const d = `M${n(x - 2.8)},${n(y + 1.9)} L${n(x - 2.8)},${n(y - 1.2)} L${n(x + 1.2)},${n(y - 1.8)} L${n(x + 5)},${n(y + 0.1)} L${n(x + 5.6)},${n(y + 1.9)} Z`;
  return (
    `<path d="${d}" fill="${color}" stroke="${OUTLINE}" stroke-width="1.3" stroke-linejoin="round"/>` +
    (sole ? `<path d="M${n(x - 2.3)},${n(y + 1.5)} H${n(x + 5.1)}" stroke="#f1eee6" stroke-width="1"/>` : '')
  );
}

function fist(x: number, y: number, skin: string): string {
  return `<rect x="${n(x - 2.2)}" y="${n(y - 2.2)}" width="4.4" height="4.4" rx="1.4" fill="${skin}" stroke="${OUTLINE}" stroke-width="1.1"/>`;
}

/** Cámara réflex vista de costado, con flash de zapata. (x, y) es el centro del cuerpo. */
function cameraSvg(x: number, y: number): string {
  const st = `stroke="${OUTLINE}" stroke-width="1" stroke-linejoin="round"`;
  return (
    // Flash de zapata: cuello y cabezal con difusor claro.
    `<rect x="${n(x - 0.9)}" y="${n(y - 7.6)}" width="2.2" height="3.4" fill="#3b3b47" ${st}/>` +
    `<path d="M${n(x - 2.2)},${n(y - 11.6)} h5.6 l0.8,0.9 v2.6 l-0.8,0.9 h-5.6 Z" fill="#4c4c5a" ${st}/>` +
    `<rect x="${n(x + 2.6)}" y="${n(y - 11)}" width="1.6" height="3.2" fill="#fff6c2" stroke="${OUTLINE}" stroke-width="0.6"/>` +
    // Objetivo.
    `<rect x="${n(x + 3.6)}" y="${n(y - 2.9)}" width="5.2" height="5.8" rx="0.8" fill="#2b2b35" ${st}/>` +
    `<rect x="${n(x + 6.1)}" y="${n(y - 2.9)}" width="1.1" height="5.8" fill="#e23b4a"/>` +
    `<ellipse cx="${n(x + 8.9)}" cy="${n(y)}" rx="0.95" ry="2.5" fill="#8fdcff" stroke="${OUTLINE}" stroke-width="0.7"/>` +
    // Cuerpo con pentaprisma y empuñadura.
    `<path d="M${n(x - 2.6)},${n(y - 3.2)} l1.2,-1.9 h3 l1.2,1.9 Z" fill="#4c4c5a" ${st}/>` +
    `<rect x="${n(x - 4.8)}" y="${n(y - 3.3)}" width="9" height="7" rx="1.2" fill="#4c4c5a" ${st}/>` +
    `<rect x="${n(x - 4.3)}" y="${n(y - 2.8)}" width="8" height="1.5" fill="#c3c8d2"/>` +
    `<rect x="${n(x - 4.3)}" y="${n(y + 0.2)}" width="2.2" height="3" fill="#33333d"/>` +
    `<circle cx="${n(x + 2.4)}" cy="${n(y - 2)}" r="0.6" fill="#e23b4a"/>`
  );
}

/** Pelo que queda por detrás de la cabeza y del torso. Coordenadas relativas al centro de la cabeza. */
function hairBack(look: Look): string {
  const st = `fill="${look.hairColor}" stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"`;
  switch (look.hair) {
    case 'long':
      return `<path d="M-6.5,-6 L-10.6,2 L-10,14 L-5.5,15.6 L-1,13 L-1,-5 Z" ${st}/>`;
    case 'bob':
      return `<path d="M-6.5,-6 L-10.4,1 L-9.6,8.6 L-5,10 L-1,8 L-1,-5 Z" ${st}/>`;
    case 'ponytail':
      return `<path d="M-6,-6.5 L-12.5,-7.6 L-15.6,-1 L-13,8.6 L-10.6,3 L-8,-0.5 Z" ${st}/>`;
    case 'bun':
      return `<path d="M-7.6,-12 L-4.2,-10.6 L-3.6,-7 L-6.4,-4.4 L-10.4,-5 L-11.6,-8.6 Z" ${st}/>`;
    default:
      return '';
  }
}

function hairFront(look: Look): string {
  const c = look.hairColor;
  const st = `fill="${c}" stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"`;
  const shine = `<path d="M-3.4,-8.6 L3,-8.4 L1.4,-6.9 L-4.4,-7.1 Z" fill="${shade(c, 0.28)}"/>`;
  const cap = `<path d="M7.9,-3.2 L8.2,-7 L5,-9.6 L-3,-10 L-7.6,-7.6 L-8.3,-1 L-7.5,3.8 L-5.3,1 L-4.8,-2.6 L-1.5,-4.4 L1,-2.8 L3.6,-4.6 L5.6,-3 Z" ${st}/>`;
  switch (look.hair) {
    case 'bald':
      return `<path d="M-7.6,-2.4 L-8,3.2 L-6,3.8 L-4.6,-0.4 L-5,-3.8 Z" ${st}/>`;
    case 'quiff':
      return `<path d="M7.6,-3.4 L11.2,-8.6 L7.2,-8.2 L8.2,-12.2 L3.6,-9.6 L3,-12.6 L-1,-10 L-5,-10.4 L-8,-7 L-8.4,-1 L-7.5,3.8 L-5.3,1 L-4.8,-2.8 L0,-4.6 L4,-3.4 Z" ${st}/>` + shine;
    case 'curly': {
      const blobs: [number, number, number][] = [[-7.4, -1.4, 3.1], [-5.6, -6.2, 3.9], [-0.6, -9, 4.1], [4.4, -7.4, 3.6]];
      return (
        blobs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${OUTLINE}" stroke-width="2.4"/>`).join('') +
        blobs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join('') +
        `<circle cx="-1.6" cy="-9.8" r="1.6" fill="${shade(c, 0.28)}"/>`
      );
    }
    default:
      return cap + shine;
  }
}

/** Ojo rectangular con ceja gruesa: da el gesto serio del estilo. */
function eye(x: number, w: number, browTilt: number, browLift: number, tall = 0): string {
  return (
    `<rect x="${n(x - w / 2)}" y="${n(-1 - tall)}" width="${w}" height="${n(3 + tall)}" fill="#fff" stroke="${OUTLINE}" stroke-width="0.7"/>` +
    `<rect x="${n(x + w / 2 - 1.7)}" y="${n(-0.6 - tall / 2)}" width="1.4" height="2.4" fill="${OUTLINE}"/>` +
    `<path d="M${n(x - w / 2 - 0.5)},${n(-2.5 - browLift - tall - browTilt)} L${n(x + w / 2 + 0.5)},${n(-2.5 - browLift - tall + browTilt)}" stroke="${OUTLINE}" stroke-width="1.3" stroke-linecap="square"/>`
  );
}

function faceSvg(face: Face): string {
  const ink = `stroke="${OUTLINE}" stroke-linecap="square" fill="none"`;
  switch (face) {
    case 'smile':
      return eye(0.5, 2.4, 0, 0.9) + eye(4.7, 3, 0, 0.9) + `<path d="M1.6,4 h5.4 l-1,2.5 h-3.2 Z" fill="#fff" stroke="${OUTLINE}" stroke-width="0.9" stroke-linejoin="round"/>`;
    case 'open':
      return eye(0.5, 2.4, 0, 1.2, 1) + eye(4.7, 3, 0, 1.2, 1) + `<rect x="2.6" y="3.8" width="3" height="3" fill="#5a1626" stroke="${OUTLINE}" stroke-width="0.9"/>`;
    case 'ouch':
      return (
        `<path d="M-0.8,-1.6 l2.4,1.4 l-2.4,1.4 M6.6,-1.6 l-2.4,1.4 l2.4,1.4" ${ink} stroke-width="1.2"/>` +
        `<path d="M1.4,3.8 h5.6 v2.4 h-5.6 Z" fill="#fff" stroke="${OUTLINE}" stroke-width="0.9"/><path d="M3.2,3.8 v2.4 M5.1,3.8 v2.4" ${ink} stroke-width="0.6"/>`
      );
    case 'evil':
      // Ceño fruncido, ojos entrecerrados y sonrisa de dientes.
      return (
        eye(0.5, 2.4, 0.9, 0, -1.2) + eye(4.7, 3, 1.1, 0, -1.2) +
        `<path d="M0.4,3.2 L7.4,2.8 L6.4,6.8 L1.6,7 Z" fill="#fff" stroke="${OUTLINE}" stroke-width="0.9" stroke-linejoin="round"/>` +
        `<path d="M2.2,3.2 v3.7 M3.9,3.1 v3.8 M5.6,3 v3.8 M0.9,5 h6" ${ink} stroke-width="0.6"/>`
      );
    case 'angry':
      // Cejas clavadas hacia adentro y dientes apretados.
      return (
        eye(0.5, 2.4, 1.3, -0.3, -0.9) + eye(4.7, 3, 1.5, -0.3, -0.9) +
        `<path d="M0.8,7 L1.8,3.7 L6.6,3.5 L7.5,6.8 Z" fill="#fff" stroke="${OUTLINE}" stroke-width="0.9" stroke-linejoin="round"/>` +
        `<path d="M2.6,3.7 v3.2 M4.2,3.6 v3.3 M5.8,3.6 v3.2 M1.2,5.3 h6" ${ink} stroke-width="0.6"/>` +
        `<path d="M9.4,-6 l2.2,-1.6 M9.8,-3.2 l2.6,0 M8,-8.4 l1.4,-2.2" ${ink} stroke-width="0.9"/>`
      );
    case 'cry':
      // Ojos apretados, boca abierta en llanto y lágrimas que caen.
      return (
        `<path d="M-0.8,-0.6 q1.2,1.6 2.6,0 M3.2,-0.6 q1.5,1.8 3.2,0" ${ink} stroke-width="1.2"/>` +
        `<path d="M-1,-2.6 L1.8,-3.4 M3.2,-3.6 L6.6,-2.6" ${ink} stroke-width="1.2"/>` +
        `<path d="M1.6,3.4 h5 l-0.4,3.8 h-4.2 Z" fill="#5a1626" stroke="${OUTLINE}" stroke-width="0.9" stroke-linejoin="round"/>` +
        `<path d="M0.4,1 q-1.4,2.6 0,3.8 q1.4,-1.2 0,-3.8 Z M5.6,1.2 q-1.4,3 0,4.4 q1.4,-1.4 0,-4.4 Z" fill="#7fd8ff" stroke="${OUTLINE}" stroke-width="0.5"/>`
      );
    case 'wink':
      return `<path d="M-0.8,0.4 h2.6" ${ink} stroke-width="1.2"/><path d="M-1,-1.6 L2,-1" ${ink} stroke-width="1.3"/>` + eye(4.7, 3, 0.45, 0) + `<path d="M3,4.9 h3.2" ${ink} stroke-width="1"/>`;
    default:
      return eye(0.5, 2.4, 0.3, 0) + eye(4.7, 3, 0.3, 0) + `<path d="M2.6,4.9 h3.6" ${ink} stroke-width="1"/>`;
  }
}

function headSvg(look: Look, cx: number, cy: number, face: Face): { back: string; front: string } {
  const hs = look.headScale ?? 1;
  const open = `<g transform="translate(${n(cx)},${n(cy)}) scale(${hs})">`;
  const skin = look.skin;
  const head = 'M-6.6,-6 Q-7,-8 -4,-8 L4.6,-8 Q7.6,-8 7.6,-5 L7.9,1.6 Q7.9,4.4 6,6 L3.6,7.9 Q1,8.7 -2,7.9 L-5.6,6 Q-7,4.6 -7,2 Z';
  let front =
    `<path d="M7.4,-0.4 L9.9,2.4 L7.6,3.2 Z" fill="${skin}" stroke="${OUTLINE}" stroke-width="1.1" stroke-linejoin="round"/>` +
    `<path d="${head}" fill="${skin}" stroke="${OUTLINE}" stroke-width="1.5" stroke-linejoin="round"/>` +
    // Sombra plana bajo la mandíbula y en la nuca.
    `<path d="M-6.9,2 L-5.6,6 L-2,7.9 Q1,8.7 3.6,7.9 L5,6.8 Q1,7.4 -2.6,5.6 Q-5,4.2 -5.6,0 Z" fill="${shade(skin, -0.2)}"/>`;
  if (look.beard) {
    front += `<path d="M-5.8,2.2 L-5.4,6 L-2,7.9 L1,8.7 L3.6,7.9 L6,6 L7.7,3.2 L4.8,5.4 L1,5 L-2.6,4.4 Z" fill="${look.hairColor}" stroke="${OUTLINE}" stroke-width="1" stroke-linejoin="round"/>`;
  }
  front += faceSvg(face);
  if (look.glasses) {
    front +=
      `<rect x="2.6" y="-1.8" width="4.4" height="4.2" rx="0.8" fill="#bfe9ff" fill-opacity="0.35" stroke="${OUTLINE}" stroke-width="1"/>` +
      `<rect x="-1.4" y="-1.8" width="3.6" height="4.2" rx="0.8" fill="#bfe9ff" fill-opacity="0.35" stroke="${OUTLINE}" stroke-width="1"/>` +
      `<path d="M-1.4,-0.4 L-5.4,-1" stroke="${OUTLINE}" stroke-width="1"/>`;
  }
  front += hairFront(look);
  if (look.hat === 'party') {
    const c = look.hatColor ?? '#ff4f8b';
    front +=
      `<path d="M-4,-8.4 L1,-17.6 L5.6,-8 Z" fill="${c}" stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"/>` +
      `<path d="M-2.2,-11.6 L3.9,-11.2 M-0.6,-14.6 L2.5,-14.4" stroke="#fff7d6" stroke-width="1.2"/>` +
      `<circle cx="1" cy="-18" r="1.7" fill="#ffd23f" stroke="${OUTLINE}" stroke-width="0.9"/>`;
  } else if (look.hat === 'crown') {
    front +=
      `<path d="M-4.8,-8.2 L-5.4,-14 L-2.2,-11.4 L0.6,-15.4 L3.2,-11.4 L6.6,-14 L5.8,-8 Z" fill="#ffd23f" stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"/>` +
      `<circle cx="0.6" cy="-10.4" r="1" fill="#ff4f8b"/>`;
  }
  if (look.headphones) {
    front +=
      `<path d="M-3.4,-0.6 Q-5.4,-12.6 3,-12.4" fill="none" stroke="${OUTLINE}" stroke-width="3.4" stroke-linecap="round"/>` +
      `<path d="M-3.4,-0.6 Q-5.4,-12.6 3,-12.4" fill="none" stroke="#c3c8d2" stroke-width="1.4" stroke-linecap="round"/>` +
      `<rect x="-6" y="-2.2" width="4.6" height="6.6" rx="1.2" fill="#e23b4a" stroke="${OUTLINE}" stroke-width="1.1"/>`;
  }
  const veil = look.veil
    ? `<path d="M2,-9.6 L-8.6,-7.6 L-13.6,8 L-12.4,24 L-5,19 L-3.4,-3 Z" fill="#ffffff" fill-opacity="0.78" stroke="${OUTLINE}" stroke-width="0.9" stroke-linejoin="round"/>`
    : '';
  return { back: open + hairBack(look) + veil + '</g>', front: open + front + '</g>' };
}

/** Dibuja una figura completa mirando hacia la derecha, dentro de una celda CELL_W × CELL_H. */
export function figure(look: Look, pose: Pose): string {
  const bob = pose.bob ?? 0;
  const drop = pose.hipDrop ?? 0;
  const seated = drop > 3;
  const hx = FOOT_X;
  const hy = 44 + bob + drop;
  const sx = FOOT_X + (pose.lean ?? 0);
  const sy = 30 + bob + drop + (pose.breath ?? 0);
  const { skin, top, bottom, clothing } = look;
  const sole = look.sole ?? false;

  // Colores de mangas y piernas según la ropa.
  const longSleeves = clothing === 'suit' || clothing === 'shirt';
  const armUpper = clothing === 'dress' ? skin : top;
  const armLower = longSleeves ? top : skin;
  let thigh = bottom;
  let shin = bottom;
  if (clothing === 'dress') {
    thigh = seated ? top : skin;
    shin = skin;
  }

  const fLeg = joint(hx + 1.6, hy, pose.fLeg[0], THIGH, pose.fLeg[0] - pose.fLeg[1], SHIN);
  const bLeg = joint(hx - 1.6, hy, pose.bLeg[0], THIGH, pose.bLeg[0] - pose.bLeg[1], SHIN);
  const fArm = joint(sx + 1.5, sy + 0.8, pose.fArm[0], UPPER_ARM, pose.fArm[0] + pose.fArm[1], FORE_ARM);
  const bArm = joint(sx - 3.2, sy + 0.8, pose.bArm[0], UPPER_ARM, pose.bArm[0] + pose.bArm[1], FORE_ARM);
  const head = headSvg(look, sx + 0.8, sy - 2.8 - 8 * (look.headScale ?? 1), pose.face ?? 'neutral');

  let body = head.back;

  // Brazo de atrás.
  body += limb(sx - 3.2, sy + 0.8, bArm, ARM_W, shade(armUpper, -0.28), shade(armLower, -0.28)) + fist(bArm.ex, bArm.ey, shade(skin, -0.2));

  // Piernas.
  body += limb(hx - 1.6, hy, bLeg, LEG_W, shade(thigh, -0.28), shade(shin, -0.28)) + shoe(bLeg.ex, bLeg.ey, shade(look.shoes, -0.25), sole);
  body += limb(hx + 1.6, hy, fLeg, LEG_W, thigh, shin) + shoe(fLeg.ex, fLeg.ey, look.shoes, sole);

  // Torso: relleno, franja de sombra en la espalda y contorno.
  const hem = clothing === 'suit' ? 3.4 : 1.6;
  const shoulder = `M${n(sx - 6.4)},${n(sy + 2.2)} L${n(sx - 5.6)},${n(sy - 1.6)} Q${n(sx - 5.2)},${n(sy - 2.7)} ${n(sx - 3.2)},${n(sy - 2.7)}`;
  const torso = `${shoulder} L${n(sx + 4)},${n(sy - 2.7)} Q${n(sx + 6.3)},${n(sy - 2.7)} ${n(sx + 6.8)},${n(sy - 0.4)} L${n(sx + 6.4)},${n(sy + 4.5)} L${hx + 5.3},${n(hy + hem)} L${hx - 5.3},${n(hy + hem)} Z`;
  body += `<path d="${torso}" fill="${top}"/>`;
  body += `<path d="${shoulder} L${n(sx - 1.6)},${n(sy - 2.7)} L${hx - 1.6},${n(hy + hem)} L${hx - 5.3},${n(hy + hem)} Z" fill="${shade(top, -0.25)}"/>`;
  if (clothing === 'suit' || clothing === 'shirt') {
    const inner = clothing === 'suit' ? '#f3efe6' : shade(top, 0.4);
    body += `<path d="M${n(sx + 1.8)},${n(sy - 2.6)} L${n(sx + 5.9)},${n(sy - 2.4)} L${n(sx + 5.2)},${n(sy + (clothing === 'suit' ? 6.5 : 1.4))} Z" fill="${inner}" stroke="${OUTLINE}" stroke-width="0.8" stroke-linejoin="round"/>`;
    if (clothing === 'suit') body += `<path d="M${n(sx + 4.3)},${n(sy - 1.8)} L${n(sx + 5.6)},${n(sy + 5)} L${n(sx + 4.2)},${n(sy + 4)} Z" fill="${look.accent ?? '#b3262e'}"/>`;
  }
  body += `<path d="${torso}" fill="none" stroke="${OUTLINE}" stroke-width="1.5" stroke-linejoin="round"/>`;
  if (clothing === 'dress' && !seated) {
    // Falda corta o, en los vestidos de gala, larga y acampanada hasta el piso.
    const hw = look.gown ? 11.4 : 8.8;
    const len = look.gown ? 15.2 - bob : 9.6;
    const skirt = `M${hx - 5.5},${n(hy - 4)} L${hx + 5.5},${n(hy - 4)} L${n(hx + hw)},${n(hy + len)} L${n(hx - hw)},${n(hy + len)} Z`;
    body += `<path d="${skirt}" fill="${top}"/><path d="M${hx - 5.5},${n(hy - 4)} L${hx - 1.6},${n(hy - 4)} L${n(hx - hw * 0.3)},${n(hy + len)} L${n(hx - hw)},${n(hy + len)} Z" fill="${shade(top, -0.2)}"/>`;
    if (look.gown) body += `<path d="M${n(hx - hw + 1.2)},${n(hy + len - 3.2)} L${n(hx + hw - 1.2)},${n(hy + len - 3.2)}" stroke="${look.accent ?? shade(top, -0.3)}" stroke-width="1.1" stroke-dasharray="2 1.4"/>`;
    body += `<path d="${skirt}" fill="none" stroke="${OUTLINE}" stroke-width="1.5" stroke-linejoin="round"/>`;
  }
  if (look.accent && clothing !== 'suit') {
    const y = clothing === 'dress' ? hy - 3.4 : hy + 0.6;
    body += `<path d="M${hx - 5},${n(y)} L${hx + 5.2},${n(y)}" stroke="${look.accent}" stroke-width="1.5"/>`;
  }

  // Cuello y cabeza.
  body += `<rect x="${n(sx - 1)}" y="${n(sy - 4.8)}" width="4" height="3.4" fill="${shade(skin, -0.2)}" stroke="${OUTLINE}" stroke-width="1.1"/>`;
  body += head.front;

  // Brazo de adelante y lo que lleva en la mano.
  const frontArm = limb(sx + 1.5, sy + 0.8, fArm, ARM_W, armUpper, armLower);
  if (look.camera) {
    const hang = pose.camera === 'hang';
    const cx = hang ? sx + 4.5 : fArm.ex + 0.4;
    const cy = hang ? sy + 10 : fArm.ey - 1.6;
    const strap = `M${n(sx - 0.5)},${n(sy - 2)} Q${n((sx + cx) / 2 - 1)},${n((sy + cy) / 2 + 3)} ${n(cx - 3)},${n(cy - 3)}`;
    body += `<path d="${strap}" fill="none" stroke="${OUTLINE}" stroke-width="2.4" stroke-linecap="round"/><path d="${strap}" fill="none" stroke="#e9c94a" stroke-width="1.1" stroke-linecap="round"/>`;
    body += hang ? cameraSvg(cx, cy) + frontArm : frontArm + cameraSvg(cx, cy) + fist(fArm.ex - 1.6, fArm.ey + 1.6, skin);
    if (hang && pose.card) {
      const kx = fArm.ex - 1;
      const ky = fArm.ey - 5.4;
      body += `<path d="M${n(kx)},${n(ky)} h3.4 l1.6,1.6 v5 h-5 Z" fill="#3b6fe0" stroke="${OUTLINE}" stroke-width="0.9" stroke-linejoin="round"/><rect x="${n(kx + 0.8)}" y="${n(ky + 3)}" width="3.2" height="2.2" fill="#f4f1ea"/>`;
    }
    if (hang) body += fist(fArm.ex, fArm.ey, skin);
  } else if (look.prop === 'guitar') {
    const gx = hx + 1.5;
    const gy = hy - 3.5;
    body += `<path d="M${n(gx)},${n(gy)} L${n(gx + 15)},${n(gy - 9.5)}" stroke="${OUTLINE}" stroke-width="3.4" stroke-linecap="round"/><path d="M${n(gx)},${n(gy)} L${n(gx + 15)},${n(gy - 9.5)}" stroke="#d9b377" stroke-width="1.6" stroke-linecap="round"/>`;
    body += `<path d="M${n(gx - 6)},${n(gy - 1)} L${n(gx - 2)},${n(gy - 4.4)} L${n(gx + 3.4)},${n(gy - 3)} L${n(gx + 4.4)},${n(gy + 2)} L${n(gx - 0.5)},${n(gy + 5)} L${n(gx - 5.4)},${n(gy + 3.6)} Z" fill="${look.accent ?? '#d8433d'}" stroke="${OUTLINE}" stroke-width="1.3" stroke-linejoin="round"/>`;
    body += `<circle cx="${n(gx - 0.6)}" cy="${n(gy + 0.4)}" r="1.5" fill="${OUTLINE}"/>`;
    body += frontArm + fist(fArm.ex, fArm.ey, skin);
  } else if (look.prop === 'violin') {
    // Violín apoyado en el hombro, apuntando hacia adelante; el arco lo lleva la mano de adelante.
    const vx = sx + 8;
    const vy = sy - 3.4;
    body += `<path d="M${n(vx)},${n(vy)} L${n(vx + 9.4)},${n(vy - 3.2)}" stroke="${OUTLINE}" stroke-width="2.6" stroke-linecap="round"/><path d="M${n(vx)},${n(vy)} L${n(vx + 9.2)},${n(vy - 3.1)}" stroke="#3a2418" stroke-width="1.2" stroke-linecap="round"/>`;
    body += `<ellipse cx="${n(vx)}" cy="${n(vy)}" rx="5" ry="2.7" transform="rotate(-19 ${n(vx)} ${n(vy)})" fill="#b5652a" stroke="${OUTLINE}" stroke-width="1.2"/>`;
    body += `<path d="M${n(vx - 2.6)},${n(vy + 0.6)} L${n(vx + 3)},${n(vy - 1.3)}" stroke="#f1d9a8" stroke-width="0.6"/>`;
    body += frontArm;
    body += `<path d="M${n(fArm.ex + 0.6)},${n(fArm.ey + 1.4)} L${n(fArm.ex - 3.6)},${n(fArm.ey - 12)}" stroke="${OUTLINE}" stroke-width="1.9" stroke-linecap="round"/><path d="M${n(fArm.ex + 0.6)},${n(fArm.ey + 1.4)} L${n(fArm.ex - 3.6)},${n(fArm.ey - 12)}" stroke="#f1e6c8" stroke-width="0.8" stroke-linecap="round"/>`;
    body += fist(fArm.ex, fArm.ey, skin);
  } else {
    body += frontArm;
    if (look.prop === 'bouquet') {
      const bx = fArm.ex + 1;
      const by = fArm.ey - 1;
      body += `<path d="M${n(bx - 0.4)},${n(by + 1)} L${n(bx + 0.6)},${n(by + 5.4)}" stroke="#3f8a4c" stroke-width="2"/>`;
      for (const [dx, dy, c] of [[-2.2, -0.6, '#ffd0de'], [2.2, -0.4, '#ff9fb8'], [0, -2.6, '#ffffff'], [0, 0.8, '#ff7fa8']] as const) {
        body += `<circle cx="${n(bx + dx)}" cy="${n(by + dy)}" r="2.1" fill="${c}" stroke="${OUTLINE}" stroke-width="0.8"/>`;
      }
    }
    if (look.prop === 'mic') {
      body += `<path d="M${n(fArm.ex)},${n(fArm.ey + 1)} L${n(fArm.ex + 0.8)},${n(fArm.ey - 3.6)}" stroke="${OUTLINE}" stroke-width="2.4" stroke-linecap="round"/>`;
      body += `<circle cx="${n(fArm.ex + 1)}" cy="${n(fArm.ey - 4.8)}" r="2" fill="#aab1bd" stroke="${OUTLINE}" stroke-width="1"/>`;
    }
    body += fist(fArm.ex, fArm.ey, skin);
  }

  const s = look.scale ?? 1;
  const scale = s === 1 ? '' : ` transform="translate(${FOOT_X},${FOOT_Y}) scale(${s}) translate(${-FOOT_X},${-FOOT_Y})"`;
  const shadow = seated ? '' : `<ellipse cx="${FOOT_X + 1}" cy="${FOOT_Y + 1.6}" rx="${n(10 * s)}" ry="${n(2.6 * s)}" fill="#05030a" opacity="0.5"/>`;
  return `${shadow}<g${scale}>${body}</g>`;
}

/** Spritesheet completo de un personaje: una celda por frame. */
export function sheetDef(key: string, look: Look, poses: PoseSet, scale?: number): TexDef {
  const rows = Math.ceil(FRAMES.length / SHEET_COLS);
  let body = '';
  const frames: NonNullable<TexDef['frames']> = [];
  FRAMES.forEach((name, i) => {
    const x = (i % SHEET_COLS) * CELL_W;
    const y = Math.floor(i / SHEET_COLS) * CELL_H;
    body += `<g transform="translate(${x},${y})">${figure(look, poses[name])}</g>`;
    frames.push({ name, x, y, w: CELL_W, h: CELL_H });
  });
  return { key, w: SHEET_COLS * CELL_W, h: rows * CELL_H, body, frames, scale };
}

/** Una sola pose a mayor resolución, para ilustraciones de menú. */
export function portraitDef(key: string, look: Look, pose: Pose, scale: number): TexDef {
  return { key, w: CELL_W, h: CELL_H, body: figure(look, pose), scale };
}
