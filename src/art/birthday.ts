// Arte del escenario 2: salón de cumpleaños infantil, con las luces de fiesta prendidas.

import { GAME_H, GAME_W } from '../config/constants';
import { OUTLINE, type TexDef } from './svg';

const FLOOR_Y = 120;
const PARTY = ['#ff4f8b', '#ffd23f', '#4fe0ff', '#5be37a', '#ff8a3b', '#b07bff'];

/** Posición de las luces de fiesta desde las que salen los láseres. */
export const BDAY_EMITTERS_X = [120, 240, 360];
export const BDAY_EMITTER_Y = 24;

export function balloon(x: number, y: number, color: string, stringTo: number): string {
  return (
    `<path d="M${x},${y + 9} Q${x + 3},${(y + stringTo) / 2} ${x},${stringTo}" fill="none" stroke="#e9e6df" stroke-width="0.7"/>` +
    `<ellipse cx="${x}" cy="${y}" rx="7" ry="8.6" fill="${color}" stroke="${OUTLINE}" stroke-width="1.2"/>` +
    `<path d="M${x - 1.6},${y + 8.4} h3.2 l-1.6,2.2 Z" fill="${color}" stroke="${OUTLINE}" stroke-width="0.9" stroke-linejoin="round"/>` +
    `<path d="M${x - 3.6},${y - 4.4} q1.2,-2.4 3.4,-2.6" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity="0.8"/>`
  );
}

function background(): string {
  let s =
    '<defs><radialGradient id="glowP"><stop offset="0" stop-color="#ff7fd0" stop-opacity="0.4"/><stop offset="1" stop-color="#ff7fd0" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="glowC"><stop offset="0" stop-color="#7fe8ff" stop-opacity="0.32"/><stop offset="1" stop-color="#7fe8ff" stop-opacity="0"/></radialGradient></defs>';

  // Pared pintada: nubes, arcoíris y zócalo.
  s += `<rect width="${GAME_W}" height="${FLOOR_Y}" fill="#3f2466"/>`;
  s += `<rect y="0" width="${GAME_W}" height="12" fill="#2a1748"/>`;
  for (const [x, y, k] of [[150, 70, 1], [300, 52, 0.8], [436, 78, 0.9]]) {
    s += `<g transform="translate(${x},${y}) scale(${k})"><path d="M-26,8 a9,9 0 0 1 9,-11 a13,13 0 0 1 24,-3 a10,10 0 0 1 16,10 a7,7 0 0 1 -2,13 h-42 a8,8 0 0 1 -5,-9 Z" fill="#5a3690" stroke="#2a1748" stroke-width="1.6"/></g>`;
  }
  // Mural infantil: sol sonriente, osito y estrellas.
  for (let a = 0; a <= 8; a++) {
    const ang = Math.PI + (a / 8) * Math.PI;
    s += `<path d="M${(226 + Math.cos(ang) * 36).toFixed(1)},${(FLOOR_Y - 14 + Math.sin(ang) * 36).toFixed(1)} L${(226 + Math.cos(ang) * 47).toFixed(1)},${(FLOOR_Y - 14 + Math.sin(ang) * 47).toFixed(1)}" stroke="#ffb53f" stroke-width="4.4" stroke-linecap="round"/>`;
  }
  s += `<circle cx="226" cy="${FLOOR_Y - 14}" r="31" fill="#ffd23f" stroke="${OUTLINE}" stroke-width="1.6"/>`;
  s += `<circle cx="215" cy="${FLOOR_Y - 32}" r="2.6" fill="${OUTLINE}"/><circle cx="237" cy="${FLOOR_Y - 32}" r="2.6" fill="${OUTLINE}"/>`;
  s += `<path d="M213,${FLOOR_Y - 24} Q226,${FLOOR_Y - 12} 239,${FLOOR_Y - 24}" fill="none" stroke="${OUTLINE}" stroke-width="2" stroke-linecap="round"/>`;
  s += `<circle cx="208" cy="${FLOOR_Y - 25}" r="3.4" fill="#ff8a3b" opacity="0.7"/><circle cx="244" cy="${FLOOR_Y - 25}" r="3.4" fill="#ff8a3b" opacity="0.7"/>`;
  s += `<g transform="translate(316,84)"><circle cx="-11" cy="-11" r="5.6" fill="#b5814f" stroke="${OUTLINE}" stroke-width="1.3"/><circle cx="11" cy="-11" r="5.6" fill="#b5814f" stroke="${OUTLINE}" stroke-width="1.3"/>` +
    `<circle r="14" fill="#c9965f" stroke="${OUTLINE}" stroke-width="1.5"/><ellipse cy="5" rx="6.4" ry="5" fill="#f1d9a8" stroke="${OUTLINE}" stroke-width="1"/>` +
    `<circle cx="-5" cy="-3" r="1.7" fill="${OUTLINE}"/><circle cx="5" cy="-3" r="1.7" fill="${OUTLINE}"/><ellipse cy="3" rx="2.2" ry="1.5" fill="${OUTLINE}"/><path d="M-3,7 q3,2.4 6,0" fill="none" stroke="${OUTLINE}" stroke-width="1"/></g>`;
  [[168, 30, 0], [204, 56, 2], [262, 34, 1], [352, 40, 3], [398, 66, 4], [286, 96, 5], [20, 36, 1], [76, 88, 2]].forEach(([x, y, c]) => {
    let pts = '';
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 5 : 2.1;
      const ang = (Math.PI * i) / 5 - Math.PI / 2;
      pts += `${(x + Math.cos(ang) * r).toFixed(1)},${(y + Math.sin(ang) * r).toFixed(1)} `;
    }
    s += `<polygon points="${pts}" fill="${PARTY[c]}" stroke="${OUTLINE}" stroke-width="0.9" stroke-linejoin="round" opacity="0.9"/>`;
  });
  s += `<rect y="${FLOOR_Y - 14}" width="${GAME_W}" height="14" fill="#2a1748" stroke="${OUTLINE}" stroke-width="1"/>`;
  for (let x = 6; x < GAME_W; x += 22) s += `<circle cx="${x}" cy="${FLOOR_Y - 7}" r="2.4" fill="${PARTY[(x / 22) % PARTY.length | 0]}" opacity="0.8"/>`;
  s += `<ellipse cx="120" cy="60" rx="70" ry="44" fill="url(#glowP)"/><ellipse cx="360" cy="60" rx="70" ry="44" fill="url(#glowC)"/>`;

  // Puerta de salida.
  s += `<rect x="94" y="56" width="36" height="${FLOOR_Y - 56}" fill="#2a1748" stroke="${OUTLINE}" stroke-width="1.4"/>`;
  s += `<rect x="98" y="60" width="28" height="${FLOOR_Y - 60}" fill="#ffb53f" stroke="${OUTLINE}" stroke-width="1.2"/>`;
  s += `<rect x="102" y="66" width="20" height="18" rx="2" fill="#bfefff" stroke="${OUTLINE}" stroke-width="1"/><circle cx="121" cy="94" r="1.8" fill="#f4f1ea" stroke="${OUTLINE}" stroke-width="0.8"/>`;
  s += `<rect x="101" y="42" width="22" height="10" rx="2" fill="#3fe07a" stroke="${OUTLINE}" stroke-width="1.2"/>`;
  s += `<path d="M106,47 h9 M112,44 l3.5,3 l-3.5,3" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;

  // Guirnalda de banderines.
  const sag = (x: number) => 15 + 9 * Math.sin((x / GAME_W) * Math.PI * 3) ** 2;
  let rope = `M0,${sag(0)}`;
  for (let x = 8; x <= GAME_W; x += 8) rope += ` L${x},${sag(x).toFixed(1)}`;
  s += `<path d="${rope}" fill="none" stroke="#e9e6df" stroke-width="1"/>`;
  for (let x = 10, i = 0; x < GAME_W - 8; x += 17, i++) {
    const y = sag(x + 6);
    s += `<path d="M${x},${y.toFixed(1)} h12 l-6,13 Z" fill="${PARTY[i % PARTY.length]}" stroke="${OUTLINE}" stroke-width="1.1" stroke-linejoin="round"/>`;
  }

  // Luces de fiesta (emisores) y bola de espejos.
  for (const x of BDAY_EMITTERS_X) {
    s += `<path d="M${x},0 v${BDAY_EMITTER_Y - 8}" stroke="${OUTLINE}" stroke-width="1.6"/>`;
    s += `<rect x="${x - 8}" y="${BDAY_EMITTER_Y - 8}" width="16" height="11" rx="2" fill="#262b40" stroke="${OUTLINE}" stroke-width="1.2"/>`;
    s += `<circle cx="${x - 3.4}" cy="${BDAY_EMITTER_Y - 2}" r="2.4" fill="#ff3bd4" stroke="${OUTLINE}" stroke-width="0.8"/><circle cx="${x + 3.4}" cy="${BDAY_EMITTER_Y - 2}" r="2.4" fill="#39ff6a" stroke="${OUTLINE}" stroke-width="0.8"/>`;
  }
  s += `<path d="M186,0 v8" stroke="${OUTLINE}" stroke-width="1.4"/><circle cx="186" cy="17" r="9" fill="#c3c8d2" stroke="${OUTLINE}" stroke-width="1.3"/>`;
  s += `<path d="M177.6,14 h16.8 M177.6,20 h16.8 M182,8.6 v16.8 M190,8.6 v16.8" stroke="#8d93a3" stroke-width="0.8"/><path d="M181,12 l3,-2" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`;

  // Globos contra la pared.
  [[54, 44, 0], [66, 58, 1], [44, 62, 2], [268, 84, 3], [470, 40, 4], [458, 56, 0], [340, 92, 5]].forEach(([x, y, c]) => (s += balloon(x, y, PARTY[c], FLOOR_Y - 8)));

  // Piso de goma eva en damero.
  const rows = [120, 134, 150, 168, 188, 210, 236, 270];
  for (let r = 0; r < rows.length - 1; r++) {
    for (let c = 0; c * 40 < GAME_W + 40; c++) {
      const skew = (rows[r] - FLOOR_Y) * 0.06;
      s += `<path d="M${c * 40 - skew},${rows[r]} h40 l${-(rows[r + 1] - rows[r]) * 0.06},${rows[r + 1] - rows[r]} h-40 Z" fill="${(r + c) % 2 ? '#1f6f7a' : '#27848f'}"/>`;
    }
  }
  s += `<rect y="${FLOOR_Y}" width="${GAME_W}" height="10" fill="#05070f" opacity="0.35"/>`;
  for (const [x, y, id] of [[120, 196, 'glowP'], [360, 196, 'glowC'], [240, 240, 'glowP']]) s += `<ellipse cx="${x}" cy="${y}" rx="60" ry="20" fill="url(#${id})"/>`;
  return s;
}

const ST = `stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"`;

/** Mesa con mantel y comida. El piso del frente queda en y = 27. */
function table(): string {
  let s = `<ellipse cx="13" cy="27" rx="13" ry="2" fill="#05030a" opacity="0.4"/>`;
  s += `<path d="M4,22 v5 M22,22 v5" stroke="${OUTLINE}" stroke-width="2.4"/>`;
  s += `<path d="M1,14 H25 L24,23 Q13,25.5 2,23 Z" fill="#ffd23f" ${ST}/>`;
  for (let x = 4; x < 24; x += 5) s += `<circle cx="${x}" cy="19" r="1.3" fill="#ff4f8b"/>`;
  s += `<rect x="1" y="5" width="24" height="9.5" rx="1.5" fill="#fff3c2" ${ST}/>`;
  s += `<ellipse cx="7" cy="9.6" rx="3.6" ry="1.9" fill="#f4f1ea" ${ST}/><path d="M5,9 l2,-2.6 l2,2.6 Z" fill="#ff8a3b" stroke="${OUTLINE}" stroke-width="0.7"/>`;
  s += `<rect x="12" y="4.4" width="3" height="5" fill="#ff4f8b" ${ST}/><rect x="17" y="5.4" width="3" height="5" fill="#4fe0ff" ${ST}/>`;
  s += `<ellipse cx="20.5" cy="12" rx="2.8" ry="1.4" fill="#5be37a" ${ST}/>`;
  return s;
}

/** Silla de costado, respaldo a la izquierda. Asiento a 9 del piso; apoyo en (6, 21). */
function chair(): string {
  return (
    `<path d="M2.6,12 v9 M9.6,12 v9" stroke="${OUTLINE}" stroke-width="2.2"/>` +
    `<rect x="1" y="1" width="2.8" height="12" rx="1" fill="#ff8a3b" ${ST}/>` +
    `<rect x="1" y="11" width="10.4" height="2.8" rx="1" fill="#ff8a3b" ${ST}/>`
  );
}

function cakeTable(): string {
  let s = `<ellipse cx="24" cy="45" rx="22" ry="2.6" fill="#05030a" opacity="0.4"/>`;
  s += `<path d="M6,38 v7 M42,38 v7" stroke="${OUTLINE}" stroke-width="2.6"/>`;
  s += `<path d="M2,28 H46 L45,39 Q24,42.5 3,39 Z" fill="#ff4f8b" ${ST}/>`;
  for (let x = 6; x < 44; x += 6) s += `<path d="M${x},32 l2,3 l2,-3" fill="none" stroke="#ffd23f" stroke-width="1.2"/>`;
  s += `<rect x="2" y="16" width="44" height="12.5" rx="1.5" fill="#ffe1ee" ${ST}/>`;
  // Torta de dos pisos con velitas.
  s += `<rect x="15" y="13" width="18" height="8" rx="1.2" fill="#fff7d6" ${ST}/><path d="M15,15.5 q3,3 6,0 q3,3 6,0 q3,3 6,0" fill="none" stroke="#ff4f8b" stroke-width="1.6"/>`;
  s += `<rect x="18.5" y="7.4" width="11" height="6" rx="1.2" fill="#fff7d6" ${ST}/><path d="M18.5,9.4 q2.8,2.6 5.5,0 q2.8,2.6 5.5,0" fill="none" stroke="#4fe0ff" stroke-width="1.4"/>`;
  for (const x of [21, 24, 27]) s += `<rect x="${x - 0.5}" y="4.4" width="1" height="3.2" fill="#ffd23f"/><path d="M${x},4.2 q-1.1,-1.8 0,-3.4 q1.1,1.6 0,3.4 Z" fill="#ff8a3b"/>`;
  s += `<ellipse cx="8" cy="22" rx="4" ry="2" fill="#f4f1ea" ${ST}/><circle cx="7" cy="21.4" r="1.2" fill="#ff8a3b"/><circle cx="9.4" cy="21.8" r="1.2" fill="#5be37a"/>`;
  s += `<rect x="38" y="16" width="3.4" height="5.6" fill="#b07bff" ${ST}/><rect x="42" y="18" width="3" height="5" fill="#ffd23f" ${ST}/>`;
  return s;
}

/** Pelotero: pileta de pelotas con marco inflable. */
function ballPit(): string {
  let s = `<rect x="1" y="10" width="78" height="40" rx="6" fill="#ff8a3b" ${ST}/>`;
  s += `<rect x="6" y="6" width="68" height="34" rx="4" fill="#1b4f8f" ${ST}/>`;
  // Pelotitas hasta el borde: tapan todo el fondo de la pileta.
  let i = 0;
  for (let y = 9; y <= 39; y += 3.9) {
    for (let x = 8.6 + ((y * 7) % 3); x <= 72; x += 4.5, i++) {
      s += `<circle cx="${x.toFixed(1)}" cy="${(y + ((i * 5) % 3) - 1).toFixed(1)}" r="3.3" fill="${PARTY[(i * 5 + Math.floor(y)) % PARTY.length]}" stroke="${OUTLINE}" stroke-width="0.8"/>`;
    }
  }
  s += `<path d="M1,40 H79 V46 Q79,50 75,50 H5 Q1,50 1,46 Z" fill="#ffb53f" ${ST}/>`;
  for (const [x, y, c] of [[14, 41, 0], [33, 42.5, 2], [52, 41, 3], [66, 42.6, 5]]) s += `<circle cx="${x}" cy="${y}" r="3.3" fill="${PARTY[c]}" stroke="${OUTLINE}" stroke-width="0.8"/>`;
  for (const x of [1, 73]) s += `<rect x="${x}" y="2" width="6" height="44" rx="3" fill="#ff4f8b" ${ST}/>`;
  return s;
}

function gifts(): string {
  let s = `<ellipse cx="17" cy="29" rx="16" ry="2.2" fill="#05030a" opacity="0.4"/>`;
  const box = (x: number, y: number, w: number, h: number, c: string, r: string) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" ${ST}/><rect x="${x + w / 2 - 1.3}" y="${y}" width="2.6" height="${h}" fill="${r}"/>` +
    `<path d="M${x + w / 2},${y} q-4,-5 -5,-1 q1,2 5,1 q4,-5 5,-1 q-1,2 -5,1" fill="${r}" stroke="${OUTLINE}" stroke-width="0.8"/>`;
  s += box(1, 13, 15, 16, '#4fe0ff', '#ff4f8b') + box(17, 17, 15, 12, '#ffd23f', '#b07bff') + box(9, 4, 13, 10, '#5be37a', '#ff8a3b');
  return s;
}

/** Puesto del animador: parlante con su caja de luces. */
function booth(): string {
  let s = `<rect x="1" y="6" width="20" height="26" rx="2" fill="#262b40" ${ST}/>`;
  s += `<circle cx="11" cy="14" r="4" fill="#0d0f1a" ${ST}/><circle cx="11" cy="25" r="5.4" fill="#0d0f1a" ${ST}/><circle cx="11" cy="25" r="2" fill="#3a4060"/>`;
  s += `<rect x="22" y="16" width="17" height="16" rx="1.5" fill="#b07bff" ${ST}/>`;
  for (const [x, c] of [[26, '#39ff6a'], [30.5, '#ff3bd4'], [35, '#ffe03b']] as const) s += `<circle cx="${x}" cy="21" r="1.5" fill="${c}"/>`;
  s += `<path d="M25,26 h11 M25,29 h7" stroke="#2a1748" stroke-width="1.2"/>`;
  s += `<path d="M24,16 l2,-7 h8 l2,7 Z" fill="#ffd23f" ${ST}/><path d="M27,12 l3,-2.4 l3,2.4" fill="none" stroke="${OUTLINE}" stroke-width="1"/>`;
  return s;
}

function balloonBunch(): string {
  let s = '';
  [[9, 10, 0], [20, 7, 2], [14, 20, 1], [25, 19, 3]].forEach(([x, y, c]) => (s += balloon(x, y, PARTY[c], 52)));
  s += `<rect x="13" y="50" width="8" height="5" rx="1" fill="#8d93a3" ${ST}/>`;
  return s;
}

export function birthdayTextures(): TexDef[] {
  return [
    { key: 'bday_bg', w: GAME_W, h: GAME_H, body: background() },
    { key: 'bday_table', w: 26, h: 29, body: table() },
    { key: 'bday_chair', w: 12, h: 22, body: chair() },
    { key: 'bday_caketable', w: 48, h: 48, body: cakeTable() },
    { key: 'bday_ballpit', w: 80, h: 52, body: ballPit() },
    { key: 'bday_gifts', w: 34, h: 32, body: gifts() },
    { key: 'bday_booth', w: 40, h: 33, body: booth() },
    { key: 'bday_balloons', w: 34, h: 56, body: balloonBunch() },
  ];
}
