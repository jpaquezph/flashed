// Arte del menú principal y de las cinemáticas.

import { GAME_H, GAME_W } from '../config/constants';
import { OUTLINE, rng, type TexDef } from './svg';

const ST = `stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"`;

/** Tramo de estructura metálica (truss) entre dos puntos, con su reticulado. */
function truss(x1: number, y1: number, x2: number, y2: number, width: number, color: string): string {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const nx = -uy * width;
  const ny = ux * width;
  let d = `M${x1},${y1} L${x2},${y2} M${x1 + nx},${y1 + ny} L${x2 + nx},${y2 + ny}`;
  for (let t = 0, i = 0; t < len; t += width * 1.1, i++) {
    const ax = x1 + ux * t + (i % 2 ? nx : 0);
    const ay = y1 + uy * t + (i % 2 ? ny : 0);
    const e = Math.min(len, t + width * 1.1);
    const bx = x1 + ux * e + (i % 2 ? 0 : nx);
    const by = y1 + uy * e + (i % 2 ? 0 : ny);
    d += ` M${ax.toFixed(1)},${ay.toFixed(1)} L${bx.toFixed(1)},${by.toFixed(1)}`;
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.3"/>`;
}

/** Haces fijos del fondo del menú: x1, y1, x2, y2, color. */
const MENU_BEAMS: [number, number, number, number, string][] = [
  [38, 0, 50, 270, '#39ff6a'],
  [0, 20, 205, 46, '#ff5a3b'],
  [240, 0, 300, 90, '#39ff6a'],
  [0, 140, 480, 62, '#39ff6a'],
  [140, 0, 60, 150, '#ff5a3b'],
  [0, 160, 190, 152, '#ff5a3b'],
  [100, 270, 0, 214, '#ff3bd4'],
  [90, 270, 200, 150, '#ff5a3b'],
  [345, 0, 430, 60, '#ff5a3b'],
  [440, 0, 400, 50, '#ffe03b'],
  [330, 58, 480, 76, '#ff5a3b'],
  [240, 270, 300, 205, '#ffe03b'],
  [360, 206, 410, 270, '#3bd4ff'],
  [436, 160, 480, 210, '#ff5a3b'],
];

/** Fondo del menú: estructura de escenario a oscuras cruzada por láseres. */
function menuBg(): string {
  let s =
    '<defs><linearGradient id="mbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0f1e"/><stop offset="1" stop-color="#151d34"/></linearGradient>' +
    '<radialGradient id="mspot"><stop offset="0" stop-color="#5f7fc0" stop-opacity="0.3"/><stop offset="1" stop-color="#5f7fc0" stop-opacity="0"/></radialGradient></defs>';
  s += `<rect width="${GAME_W}" height="${GAME_H}" fill="url(#mbg)"/>`;
  // Estructura del fondo, más tenue, y torres del frente.
  const far = '#1a2440';
  const near = '#232f52';
  for (const x of [78, 150, 300, 386]) s += truss(x, 0, x, 232, 9, far);
  s += truss(0, 44, GAME_W, 44, 8, far) + truss(0, 132, GAME_W, 132, 8, far);
  s += truss(8, 0, 8, GAME_H, 15, near) + truss(452, 0, 452, GAME_H, 15, near) + truss(0, 8, GAME_W, 8, 13, near);
  s += `<ellipse cx="110" cy="230" rx="130" ry="46" fill="url(#mspot)"/>`;
  // Piso del escenario y baranda.
  s += `<path d="M0,238 H188 L176,270 H0 Z" fill="#1a2238" stroke="${OUTLINE}" stroke-width="1.4"/>`;
  s += `<path d="M0,238 H188" stroke="#3a4a78" stroke-width="1.2"/>`;
  for (let x = 20; x < 180; x += 32) s += `<path d="M${x},239 L${x - 8},270" stroke="#141a2c" stroke-width="1"/>`;
  s += `<path d="M118,216 L186,166 V242 L118,268 Z" fill="#232c48" fill-opacity="0.55" stroke="${OUTLINE}" stroke-width="1.3" stroke-linejoin="round"/>`;
  s += `<path d="M118,216 L186,166" stroke="#5a6a98" stroke-width="2"/><path d="M186,164 V244 M118,214 V270" stroke="#5a6a98" stroke-width="2.4"/>`;
  // Láseres.
  for (const [x1, y1, x2, y2, c] of MENU_BEAMS) {
    const line = `x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-linecap="round"`;
    s += `<line ${line} stroke="${c}" stroke-width="5" opacity="0.14"/><line ${line} stroke="${c}" stroke-width="2" opacity="0.55"/><line ${line} stroke="#ffffff" stroke-width="0.6" opacity="0.7"/>`;
  }
  return s;
}

export const MENU_CAM_W = 246;
export const MENU_CAM_H = 110;

/** Panel de controles con forma de tapa superior de cámara: diales, visor de datos y tornillos. */
function menuCamera(): string {
  const random = rng(21);
  const w = MENU_CAM_W;
  const top = 8;
  let s = '';
  // Botón disparador y diales que asoman por arriba.
  const knurl = (x: number, y: number, kw: number, kh: number) => {
    let k = `<rect x="${x}" y="${y}" width="${kw}" height="${kh}" rx="${kh / 2.4}" fill="#26262b" stroke="#08080a" stroke-width="1.2"/>`;
    for (let i = x + 2; i < x + kw - 1; i += 2) k += `<path d="M${i},${y + 1.4} V${y + kh - 1.4}" stroke="#4a4a52" stroke-width="0.7"/>`;
    return k;
  };
  s += knurl(13, 1, 26, 10) + knurl(44, 3, 19, 8);
  s += `<rect x="1" y="${top}" width="${w - 2}" height="${MENU_CAM_H - top - 1}" rx="6" fill="#18181c" stroke="#08080a" stroke-width="2"/>`;
  s += `<rect x="4.5" y="${top + 15}" width="${w - 9}" height="${MENU_CAM_H - top - 20}" rx="3.5" fill="#222227" stroke="#0d0d10" stroke-width="1"/>`;
  // Textura de cuero.
  for (let i = 0; i < 260; i++) {
    s += `<circle cx="${(7 + random() * (w - 14)).toFixed(1)}" cy="${(top + 18 + random() * (MENU_CAM_H - top - 26)).toFixed(1)}" r="0.5" fill="#2c2c33"/>`;
  }
  s += `<path d="M6,${top + 1.6} H${w - 6}" stroke="#3a3a42" stroke-width="0.8"/>`;
  // Datos de exposición.
  const chip = (x: number, cw: number, text: string) =>
    `<rect x="${x}" y="${top + 3.5}" width="${cw}" height="8.5" rx="2" fill="#26262c" stroke="#0d0d10" stroke-width="0.8"/>` +
    `<text x="${x + cw / 2}" y="${top + 10}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="5.2" fill="#8d8d99">${text}</text>`;
  s += chip(82, 33, 'ISO 200') + chip(119, 30, 'ƒ/8.0') + chip(153, 40, '1/500 sec');
  s += knurl(200, top + 3, 30, 9);
  for (const [x, y] of [[9, top + 20], [w - 9, top + 20], [9, MENU_CAM_H - 8], [w - 9, MENU_CAM_H - 8]]) {
    s += `<circle cx="${x}" cy="${y}" r="2" fill="#3a3a42" stroke="#08080a" stroke-width="0.7"/><path d="M${x - 1.2},${y - 0.8} l2.4,1.6" stroke="#121215" stroke-width="0.7"/>`;
  }
  return s;
}

/** Íconos del menú (12 × 12). */
function menuIcons(): TexDef[] {
  const icons: Record<string, string> = {
    mi_shoe:
      `<path d="M1,8.6 V4.4 L4.4,3.4 L5.8,5.6 L10,6.8 Q11.2,7.4 11,8.6 Z" fill="#ffffff" ${ST}/>` +
      `<path d="M1,8.6 H11 V10 H1 Z" fill="#c9cdd6" ${ST}/><path d="M4.8,5.4 l1,1.2 M6.4,6 l0.9,1.1" stroke="${OUTLINE}" stroke-width="0.7"/>`,
    mi_hand:
      `<path d="M4.4,6.6 V1.8 Q4.4,0.8 5.4,0.8 Q6.4,0.8 6.4,1.8 V5 L9.6,5.8 Q10.6,6.2 10.4,7.4 L9.8,11 H4.6 L2,7.8 Q1.6,6.8 2.6,6.4 Q3.4,6.2 4.4,7.4 Z" fill="#ffffff" ${ST}/>`,
    mi_bolt:
      `<rect x="0.6" y="0.6" width="10.8" height="10.8" rx="2" fill="#26262c" stroke="#0d0d10" stroke-width="1"/>` +
      `<path d="M7.2,1.6 L3.4,6.6 h2.2 L4.6,10.4 L8.6,5.2 h-2.2 Z" fill="#ff8a2f"/>`,
    // Diafragma: seis hojas alrededor de la abertura.
    mi_aperture:
      `<circle cx="6" cy="6" r="5.4" fill="#0d0d10"/><circle cx="6" cy="6" r="4.9" fill="#b9bcc6"/>` +
      `<path d="M6.00,3.70 L10.89,4.96 M7.99,4.85 L9.35,9.72 M7.99,7.15 L4.45,10.76 M6.00,8.30 L1.11,7.04 M4.01,7.15 L2.65,2.28 M4.01,4.85 L7.55,1.24" fill="none" stroke="#18181c" stroke-width="0.7" stroke-linecap="round"/>` +
      `<polygon points="6.00,3.70 7.99,4.85 7.99,7.15 6.00,8.30 4.01,7.15 4.01,4.85" fill="#18181c"/><circle cx="5.3" cy="5.3" r="0.6" fill="#5ac8ff"/>`,
  };
  return Object.entries(icons).map(([key, body]) => ({ key, w: 12, h: 12, body, scale: 2 }));
}

// ---------- Cinemáticas ----------

export const ROOM_DOOR = { x: 388, y: 84, w: 50, h: 118 };

/** Estudio del fotógrafo, de madrugada, antes de salir a trabajar. */
function room(): string {
  const d = ROOM_DOOR;
  let s =
    '<defs><linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4a9a"/><stop offset="0.6" stop-color="#ff9a7a"/><stop offset="1" stop-color="#ffd98a"/></linearGradient>' +
    '<radialGradient id="lamp"><stop offset="0" stop-color="#ffe9b0" stop-opacity="0.45"/><stop offset="1" stop-color="#ffe9b0" stop-opacity="0"/></radialGradient></defs>';
  s += `<rect width="${GAME_W}" height="202" fill="#3b3358"/>`;
  for (let x = 0; x < GAME_W; x += 24) s += `<path d="M${x},0 V202" stroke="#352e50" stroke-width="1"/>`;
  // Ventana con el amanecer.
  s += `<rect x="52" y="40" width="76" height="80" fill="#1d1830" ${ST}/><rect x="56" y="44" width="68" height="72" fill="url(#dawn)"/>`;
  s += `<circle cx="100" cy="104" r="9" fill="#fff3c2" opacity="0.9"/><path d="M90,44 V116 M56,80 H124" stroke="#1d1830" stroke-width="3"/>`;
  s += `<path d="M46,40 h88 v-6 h-88 Z" fill="#6a4a8a" ${ST}/>`;
  // Fotos enmarcadas y repisa con lentes.
  [[158, 50, '#4fe0ff'], [186, 44, '#ff4f8b'], [158, 82, '#ffd23f']].forEach(([x, y, c]) => {
    s += `<rect x="${x}" y="${y}" width="22" height="26" fill="#f4f1ea" ${ST}/><rect x="${(x as number) + 3}" y="${(y as number) + 3}" width="16" height="15" fill="${c}"/>`;
  });
  s += `<rect x="224" y="96" width="120" height="5" fill="#7a5238" ${ST}/><path d="M234,101 v9 M334,101 v9" stroke="${OUTLINE}" stroke-width="2"/>`;
  for (const [x, w2, h] of [[236, 14, 20], [256, 11, 14], [274, 16, 26]]) s += `<rect x="${x}" y="${96 - h}" width="${w2}" height="${h}" rx="2" fill="#2b2b35" ${ST}/><rect x="${x}" y="${96 - h + 3}" width="${w2}" height="2.4" fill="#e23b4a"/>`;
  s += `<rect x="300" y="78" width="30" height="18" rx="2" fill="#4c4c5a" ${ST}/><circle cx="315" cy="87" r="5.6" fill="#8fdcff" ${ST}/>`;
  // Zócalo y piso de madera.
  s += `<rect y="196" width="${GAME_W}" height="8" fill="#241e38" ${ST}/>`;
  s += `<rect y="204" width="${GAME_W}" height="${GAME_H - 204}" fill="#6a4c38"/>`;
  [216, 230, 248].forEach((y, r) => {
    s += `<path d="M0,${y} H${GAME_W}" stroke="#573c2c" stroke-width="1"/>`;
    for (let x = (r % 2) * 40 + 18; x < GAME_W; x += 80) s += `<path d="M${x},${y} v${[14, 18, 22][r]}" stroke="#573c2c" stroke-width="1"/>`;
  });
  s += `<path d="M40,270 L96,204 H150 L128,270 Z" fill="#ffd98a" opacity="0.1"/>`;
  s += `<ellipse cx="230" cy="238" rx="96" ry="16" fill="#8a3a5a" stroke="${OUTLINE}" stroke-width="1.2"/><ellipse cx="230" cy="238" rx="80" ry="11" fill="none" stroke="#ffd23f" stroke-width="1.2"/>`;
  // Escritorio con notebook, flash, taza y tarjetas.
  s += `<rect x="24" y="160" width="118" height="7" fill="#8a5a3a" ${ST}/><rect x="28" y="167" width="110" height="44" fill="#6a4228" ${ST}/>`;
  s += `<rect x="34" y="173" width="44" height="14" fill="#573420" ${ST}/><rect x="34" y="191" width="44" height="14" fill="#573420" ${ST}/><circle cx="56" cy="180" r="1.6" fill="#e9c94a"/><circle cx="56" cy="198" r="1.6" fill="#e9c94a"/>`;
  s += `<path d="M40,160 l3,-24 h34 l3,24 Z" fill="#2b2b35" ${ST}/><path d="M45,157 l2,-18 h26 l2,18 Z" fill="#8fdcff"/>`;
  s += `<rect x="92" y="146" width="10" height="14" fill="#4c4c5a" ${ST}/><rect x="90" y="140" width="14" height="8" rx="1.5" fill="#4c4c5a" ${ST}/><rect x="101" y="141.4" width="2.4" height="5" fill="#fff6c2"/>`;
  s += `<rect x="114" y="150" width="10" height="10" rx="1.5" fill="#f4f1ea" ${ST}/><path d="M124,152 q5,3 0,6" fill="none" stroke="${OUTLINE}" stroke-width="1.4"/><path d="M117,148 q2,-3 0,-6 M121,148 q2,-3 0,-6" fill="none" stroke="#b9b3cf" stroke-width="0.9"/>`;
  s += `<ellipse cx="70" cy="150" rx="46" ry="26" fill="url(#lamp)"/>`;
  // Bolso de equipo y trípode junto a la puerta.
  s += `<path d="M352,150 L344,214 M352,150 L360,214 M352,150 V214" stroke="${OUTLINE}" stroke-width="2.6" stroke-linecap="round"/><path d="M352,150 L344,214 M352,150 L360,214 M352,150 V214" stroke="#8d93a3" stroke-width="1.1" stroke-linecap="round"/>`;
  s += `<rect x="312" y="190" width="30" height="22" rx="4" fill="#3a3a47" ${ST}/><path d="M318,190 q9,-12 18,0" fill="none" stroke="${OUTLINE}" stroke-width="2.2"/><rect x="321" y="197" width="12" height="7" rx="1.5" fill="#ffd23f" ${ST}/>`;
  // Puerta cerrada.
  s += `<rect x="${d.x - 4}" y="${d.y - 4}" width="${d.w + 8}" height="${d.h + 4}" fill="#241e38" ${ST}/>`;
  s += `<rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" fill="#b8763f" ${ST}/>`;
  s += `<rect x="${d.x + 6}" y="${d.y + 8}" width="${d.w - 12}" height="42" fill="#a36636" ${ST}/><rect x="${d.x + 6}" y="${d.y + 58}" width="${d.w - 12}" height="50" fill="#a36636" ${ST}/>`;
  s += `<circle cx="${d.x + 8}" cy="${d.y + 62}" r="2.6" fill="#e9c94a" ${ST}/>`;
  return s;
}

/** La misma puerta, abierta: se ve la calle iluminada. Se dibuja encima de la cerrada. */
function doorOpen(): string {
  const d = ROOM_DOOR;
  return (
    `<rect x="0" y="0" width="${d.w}" height="${d.h}" fill="#fff3c2" ${ST}/>` +
    `<path d="M0,${d.h} L${d.w},${d.h} L${d.w},60 Q${d.w / 2},40 0,64 Z" fill="#ffd98a"/>` +
    `<path d="M${d.w},0 L${d.w + 14},10 V${d.h + 8} L${d.w},${d.h} Z" fill="#8f5a30" ${ST}/>`
  );
}

/** Máquina de láseres del DJ, fundida. */
function burntMachine(): string {
  let s = `<ellipse cx="45" cy="74" rx="40" ry="5" fill="#05030a" opacity="0.55"/>`;
  s += `<path d="M30,52 L20,74 M60,52 L70,74 M45,52 V74" stroke="${OUTLINE}" stroke-width="4" stroke-linecap="round"/><path d="M30,52 L20,74 M60,52 L70,74 M45,52 V74" stroke="#6a6f80" stroke-width="1.8" stroke-linecap="round"/>`;
  s += `<path d="M8,20 L80,14 L84,48 L10,54 Z" fill="#2b2b35" stroke="${OUTLINE}" stroke-width="1.8" stroke-linejoin="round"/>`;
  s += `<path d="M8,20 L80,14 L80.6,20 L8.8,26 Z" fill="#4a4a57"/>`;
  s += `<path d="M34,17 Q52,30 44,51 L82,48 L80,14 Z" fill="#110e16" opacity="0.7"/>`;
  [[22, 38, '#39ff6a'], [44, 36, '#ff3bd4'], [66, 34, '#3bd4ff']].forEach(([x, y, c], i) => {
    s += `<circle cx="${x}" cy="${y}" r="8" fill="#15121a" ${ST}/><circle cx="${x}" cy="${y}" r="5" fill="${i === 0 ? (c as string) : '#3a2420'}" opacity="${i === 0 ? 0.35 : 1}" stroke="${OUTLINE}" stroke-width="0.8"/>`;
    s += `<path d="M${(x as number) - 4},${(y as number) - 3} l3,3 l-2,2 l4,3" fill="none" stroke="#ff7a2f" stroke-width="1.1" stroke-linejoin="round"/>`;
  });
  s += `<path d="M70,15 L78,2 L74,0" fill="none" stroke="${OUTLINE}" stroke-width="2"/><path d="M12,53 q-8,6 -4,14 q3,5 -2,8" fill="none" stroke="${OUTLINE}" stroke-width="2"/>`;
  s += `<path d="M52,14.6 q2,-7 6,-5 q-1,4 2,5 Z" fill="#ff7a2f" stroke="${OUTLINE}" stroke-width="0.8"/><path d="M30,17 q1,-5 4,-4 q0,3 2,4 Z" fill="#ffd23f" stroke="${OUTLINE}" stroke-width="0.8"/>`;
  return s;
}

export function sceneTextures(): TexDef[] {
  return [
    { key: 'menu_bg', w: GAME_W, h: GAME_H, body: menuBg() },
    { key: 'menu_cam', w: MENU_CAM_W, h: MENU_CAM_H, body: menuCamera() },
    ...menuIcons(),
    { key: 'cs_room', w: GAME_W, h: GAME_H, body: room() },
    { key: 'cs_door_open', w: ROOM_DOOR.w + 16, h: ROOM_DOOR.h + 10, body: doorOpen() },
    { key: 'cs_machine', w: 90, h: 80, body: burntMachine(), scale: 2 },
  ];
}
