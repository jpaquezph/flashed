// Arte de los escenarios 3 a 7: cumpleaños de 15, boda, discoteca, recital y la
// pista del jefe final. Fondos fijos y utilería compartida.

import { GAME_H, GAME_W } from '../config/constants';
import { OUTLINE, rng, type TexDef } from './svg';

const FLOOR_Y = 120;
const ST = `stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"`;
const NEON = ['#ff3bd4', '#3bd4ff', '#39ff6a', '#ffe03b', '#ff5a3b', '#b07bff'];

/** Emisores láser de la parrilla de luces, iguales en todos los salones. */
export const VENUE_EMITTERS_X = [120, 240, 360];
export const VENUE_EMITTER_Y = 24;
/** Borde izquierdo del escenario del recital. */
export const CONCERT_STAGE_X = 372;

const glow = (id: string, color: string, alpha: number) =>
  `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${alpha}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;

function lightBar(lens: string[] = ['#ff3bd4', '#39ff6a']): string {
  let s = `<rect x="60" y="7" width="360" height="4" fill="#3a4060" stroke="${OUTLINE}" stroke-width="1"/>`;
  for (const x of VENUE_EMITTERS_X) {
    s += `<path d="M${x},11 v5" stroke="${OUTLINE}" stroke-width="1.6"/>`;
    s += `<rect x="${x - 8}" y="${VENUE_EMITTER_Y - 8}" width="16" height="11" rx="2" fill="#262b40" ${ST}/>`;
    s += `<circle cx="${x - 3.4}" cy="${VENUE_EMITTER_Y - 2}" r="2.4" fill="${lens[0]}" stroke="${OUTLINE}" stroke-width="0.8"/><circle cx="${x + 3.4}" cy="${VENUE_EMITTER_Y - 2}" r="2.4" fill="${lens[1]}" stroke="${OUTLINE}" stroke-width="0.8"/>`;
  }
  return s;
}

function exitDoor(x: number, door: string): string {
  return (
    `<rect x="${x - 18}" y="56" width="36" height="${FLOOR_Y - 56}" fill="#0d0a14" stroke="${OUTLINE}" stroke-width="1.4"/>` +
    `<rect x="${x - 14}" y="60" width="28" height="${FLOOR_Y - 60}" fill="${door}" stroke="${OUTLINE}" stroke-width="1.2"/>` +
    `<path d="M${x},60 V${FLOOR_Y}" stroke="${OUTLINE}" stroke-width="1.1"/><circle cx="${x + 4}" cy="92" r="1.6" fill="#f4f1ea" stroke="${OUTLINE}" stroke-width="0.7"/>` +
    `<rect x="${x - 11}" y="42" width="22" height="10" rx="2" fill="#3fe07a" stroke="${OUTLINE}" stroke-width="1.2"/>` +
    `<path d="M${x - 6},47 h9 M${x},44 l3.5,3 l-3.5,3" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`
  );
}

/** Cortinado con pliegues entre x1 y x2. */
function drapes(x1: number, x2: number, a: string, b: string): string {
  let s = '';
  for (let x = x1, i = 0; x < x2; x += 12, i++) {
    s += `<path d="M${x},10 h12 v${FLOOR_Y - 26} q-6,7 -12,0 Z" fill="${i % 2 ? a : b}" stroke="${OUTLINE}" stroke-width="0.9"/>`;
  }
  return s;
}

/** Globo sin hilo, para columnas y arcos. */
function partyBalloon(x: number, y: number, color: string, r = 5.4): string {
  return (
    `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${r}" ry="${r * 1.16}" fill="${color}" stroke="${OUTLINE}" stroke-width="1"/>` +
    `<path d="M${(x - r * 0.5).toFixed(1)},${(y - r * 0.5).toFixed(1)} q1,-2 2.6,-2.2" fill="none" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity="0.8"/>`
  );
}

/** Flor vista de frente. */
function flower(x: number, y: number, r: number, color: string): string {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    s += `<circle cx="${(x + Math.cos(a) * r * 0.62).toFixed(1)}" cy="${(y + Math.sin(a) * r * 0.62).toFixed(1)}" r="${(r * 0.55).toFixed(1)}" fill="${color}" stroke="${OUTLINE}" stroke-width="0.6"/>`;
  }
  return s + `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 0.36).toFixed(1)}" fill="#ffd23f"/>`;
}
const BLOOMS = ['#ffd0de', '#ffffff', '#ff9fb8', '#f6b8ff', '#ffe9b0'];

/** Bola de espejos colgada, con sus reflejos. */
function mirrorBall(cx: number, cy: number, r: number, from: number): string {
  const id = `mb${cx}`;
  let s = `<defs><clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><radialGradient id="${id}g" cx="0.35" cy="0.3"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#b9c0d0"/><stop offset="1" stop-color="#565c70"/></radialGradient></defs>`;
  s += `<path d="M${cx},${from} V${cy - r}" stroke="${OUTLINE}" stroke-width="1.6"/><path d="M${cx},${from} V${cy - r}" stroke="#8d93a3" stroke-width="0.7"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r + 9}" fill="#ffffff" opacity="0.07"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}g)" stroke="${OUTLINE}" stroke-width="1.4"/><g clip-path="url(#${id})" stroke="#3a4060" stroke-width="0.6" fill="none">`;
  for (let k = -3; k <= 3; k++) {
    s += `<path d="M${cx - r},${cy + k * (r / 3.5)} H${cx + r}"/><ellipse cx="${cx}" cy="${cy}" rx="${Math.abs(k) * (r / 3.5) + 0.01}" ry="${r}"/>`;
  }
  s += '</g>';
  for (const [dx, dy, c] of [[-5, -5, '#fff'], [3, -2, '#ffe03b'], [-2, 4, '#3bd4ff'], [6, 5, '#ff3bd4']] as const) s += `<rect x="${cx + dx - 1.3}" y="${cy + dy - 1.1}" width="2.6" height="2.2" fill="${c}"/>`;
  // Reflejos sobre las paredes.
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + 0.3;
    const d = 26 + ((i * 37) % 60);
    const x = cx + Math.cos(a) * d * 1.9;
    const y = cy + Math.sin(a) * d * 0.55 + 10;
    if (y < 6 || y > FLOOR_Y - 14) continue;
    s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="2.4" height="1.8" fill="${NEON[i % NEON.length]}" opacity="0.75" transform="rotate(${i * 23} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return s;
}

/** Pista de baile iluminada en damero. */
function danceFloor(x: number, y: number, w: number, h: number, a: string, b: string, cell = 20): string {
  let s = `<rect x="${x - 2}" y="${y - 2}" width="${w + 4}" height="${h + 4}" fill="#0d0a14"/>`;
  for (let r = 0; r * cell < h; r++) {
    for (let c = 0; c * cell < w; c++) {
      s += `<rect x="${x + c * cell}" y="${y + r * cell}" width="${Math.min(cell, w - c * cell)}" height="${Math.min(cell, h - r * cell)}" fill="${(r + c) % 2 ? a : b}" stroke="#0d0a14" stroke-width="0.7"/>`;
    }
  }
  return s;
}

function planks(color: string, line: string): string {
  let s = `<rect y="${FLOOR_Y}" width="${GAME_W}" height="${GAME_H - FLOOR_Y}" fill="${color}"/>`;
  [134, 150, 168, 188, 210, 236].forEach((y, r) => {
    s += `<path d="M0,${y} H${GAME_W}" stroke="${line}" stroke-width="1"/>`;
    for (let x = (r % 2) * 30 + 10; x < GAME_W; x += 60) s += `<path d="M${x},${y} v${r < 5 ? [16, 18, 20, 22, 26][r] : 34}" stroke="${line}" stroke-width="1"/>`;
  });
  return s + `<rect y="${FLOOR_Y}" width="${GAME_W}" height="10" fill="#05070f" opacity="0.4"/>`;
}

// ---------- Fondos ----------

/** Cumpleaños de 15: salón elegante en rosa y dorado, con pista en el centro. */
function quinceBg(): string {
  let s = `<defs>${glow('qg', '#ff9fd8', 0.4)}${glow('qw', '#ffe9b0', 0.4)}</defs>`;
  s += `<rect width="${GAME_W}" height="${FLOOR_Y}" fill="#3a1030"/>`;
  s += drapes(0, 150, '#b83a78', '#8f2a5e') + drapes(330, GAME_W, '#b83a78', '#8f2a5e');
  s += `<rect x="150" y="10" width="180" height="${FLOOR_Y - 20}" fill="#52183f" stroke="${OUTLINE}" stroke-width="1.2"/>`;
  s += `<ellipse cx="240" cy="62" rx="80" ry="46" fill="url(#qw)"/>`;
  // XV en letras luminosas.
  s += `<path d="M204,36 L218,60 L204,84 h10 l9,-16 l9,16 h10 L228,60 L242,36 h-10 l-9,16 l-9,-16 Z" fill="#ffd23f" stroke="${OUTLINE}" stroke-width="1.6" stroke-linejoin="round"/>`;
  s += `<path d="M246,36 h10 l9,32 l9,-32 h10 L270,84 h-10 Z" fill="#ffd23f" stroke="${OUTLINE}" stroke-width="1.6" stroke-linejoin="round"/>`;
  for (let x = 160; x <= 320; x += 16) s += `<circle cx="${x}" cy="${16 + 3 * Math.sin(x)}" r="2" fill="#fff7d6"/>`;
  s += `<rect y="${FLOOR_Y - 12}" width="${GAME_W}" height="12" fill="#240a1e" stroke="${OUTLINE}" stroke-width="1"/>`;
  // Globos: una columna donde termina cada telón y un arco sobre el panel de los 15.
  const globos = ['#ff7fc0', '#ffd23f', '#fff7f0', '#b07bff', '#ff4f8b'];
  for (let x = 156, i = 0; x <= 324; x += 8.4, i++) s += partyBalloon(x, 34 + 4 * Math.cos(i * 1.3) - 7 * Math.sin(((x - 156) / 168) * Math.PI), globos[i % globos.length]);
  for (const cx of [150, 330]) {
    for (let y = 16, i = 0; y <= FLOOR_Y - 16; y += 7.6, i++) {
      s += partyBalloon(cx + (i % 2 ? 4.4 : -4.4), y, globos[(i + (cx > 200 ? 2 : 0)) % globos.length]);
      if (i % 3 === 1) s += partyBalloon(cx + (i % 2 ? -5 : 5), y + 2, globos[(i + 3) % globos.length], 4.2);
    }
    s += partyBalloon(cx, 10, '#ffd23f', 7);
  }
  s += exitDoor(56, '#e7b84a') + lightBar(['#ff7fd0', '#ffe03b']);
  s += planks('#5a3340', '#48262f');
  s += danceFloor(150, 164, 180, 68, '#ffd0ea', '#ff8fc8');
  s += `<ellipse cx="240" cy="198" rx="110" ry="40" fill="url(#qg)"/>`;
  return s;
}

/** Boda: salón claro de noche, con arco de flores y guirnaldas de luces. */
function weddingBg(): string {
  let s = `<defs>${glow('wg', '#fff3c2', 0.38)}</defs>`;
  s += `<rect width="${GAME_W}" height="${FLOOR_Y}" fill="#27324a"/>`;
  s += drapes(0, GAME_W, '#e9e3d2', '#cfc8b4');
  for (const x of [96, 384]) s += `<rect x="${x - 24}" y="26" width="48" height="66" rx="24" fill="#16203a" stroke="${OUTLINE}" stroke-width="1.4"/><path d="M${x},26 v66 M${x - 24},58 h48" stroke="#3a4868" stroke-width="1.2"/>`;
  // Guirnaldas de luces cálidas.
  for (let k = 0; k < 4; k++) {
    const x0 = k * 120;
    s += `<path d="M${x0},12 Q${x0 + 60},34 ${x0 + 120},12" fill="none" stroke="#3a3350" stroke-width="0.9"/>`;
    for (let i = 1; i < 8; i++) {
      const u = i / 8;
      s += `<circle cx="${x0 + u * 120}" cy="${12 + 44 * u * (1 - u)}" r="1.8" fill="#fff3a8"/>`;
    }
  }
  // Flores: ramos en los nudos de las guirnaldas, jardineras bajo las ventanas y enredadera en el zócalo.
  const bloom = rng(8);
  for (let k = 0; k <= 4; k++) {
    for (let i = 0; i < 7; i++) s += flower(k * 120 + (bloom() - 0.5) * 22, 13 + bloom() * 12, 3.4 + bloom() * 1.6, BLOOMS[i % BLOOMS.length]);
  }
  for (const x of [96, 384]) {
    s += `<rect x="${x - 26}" y="92" width="52" height="7" rx="1.5" fill="#8a5a3a" stroke="${OUTLINE}" stroke-width="1"/>`;
    for (let i = 0; i < 9; i++) s += `<path d="M${x - 22 + i * 5.5},92 q-2,-5 1,-9" fill="none" stroke="#3f8a4c" stroke-width="1.2"/>` + flower(x - 22 + i * 5.5 + 1, 82 + (i % 2) * 3, 3.4, BLOOMS[(i + 2) % BLOOMS.length]);
  }
  s += `<rect y="${FLOOR_Y - 12}" width="${GAME_W}" height="12" fill="#1a2236" stroke="${OUTLINE}" stroke-width="1"/>`;
  for (let x = 6, i = 0; x < GAME_W; x += 13, i++) s += `<circle cx="${x + 5}" cy="${FLOOR_Y - 7 + (i % 2)}" r="3" fill="#3f8a4c"/>` + flower(x, FLOOR_Y - 7 - (i % 2) * 2, 2.8, BLOOMS[i % BLOOMS.length]);
  s += exitDoor(40, '#c9b98f') + lightBar(['#ffe9b0', '#ff9fd8']);
  s += `<rect y="${FLOOR_Y}" width="${GAME_W}" height="${GAME_H - FLOOR_Y}" fill="#56627e"/>`;
  for (let y = FLOOR_Y + 14, r = 0; y < GAME_H; y += 16 + r * 2, r++) s += `<path d="M0,${y} H${GAME_W}" stroke="#4a5570" stroke-width="1"/>`;
  s += danceFloor(8, 166, 464, 64, '#f4f1ea', '#d9d4c4', 29);
  s += `<rect y="${FLOOR_Y}" width="${GAME_W}" height="10" fill="#05070f" opacity="0.35"/>`;
  s += `<ellipse cx="240" cy="198" rx="150" ry="36" fill="url(#wg)"/>`;
  // Pétalos sobre el piso.
  for (let i = 0; i < 60; i++) {
    const x = bloom() * GAME_W;
    const y = FLOOR_Y + 8 + bloom() * (GAME_H - FLOOR_Y - 10);
    s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="2" ry="1" fill="${BLOOMS[i % 3 === 0 ? 2 : 0]}" opacity="0.85" transform="rotate(${(bloom() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return s;
}

/** Discoteca (y pista del jefe en su variante roja): negro, neón y piso de luces. */
function discoBg(boss: boolean): string {
  const random = rng(boss ? 5 : 3);
  const wall = boss ? '#1c0612' : '#0b0818';
  const tiles = boss ? ['#5a0f2a', '#8a1438', '#2a0614'] : ['#2a1560', '#0f3a6a', '#4a1260'];
  let s = `<defs>${glow('dg', boss ? '#ff3b5c' : '#b07bff', 0.4)}</defs>`;
  s += `<rect width="${GAME_W}" height="${FLOOR_Y}" fill="${wall}"/>`;
  // Paneles de luces de la pared.
  for (let x = 8; x < GAME_W; x += 26) {
    const h = 30 + random() * 62;
    const c = boss ? ['#ff3b5c', '#ff8a3b', '#ffe03b'][Math.floor(random() * 3)] : NEON[Math.floor(random() * NEON.length)];
    s += `<rect x="${x}" y="${FLOOR_Y - 12 - h}" width="18" height="${h}" fill="${c}" opacity="0.22"/>`;
    for (let y = FLOOR_Y - 16; y > FLOOR_Y - 12 - h; y -= 6) s += `<rect x="${x + 2}" y="${y}" width="14" height="3" fill="${c}" opacity="0.75"/>`;
  }
  // Cartel de neón.
  const sign = boss ? '#ff3b5c' : '#ff3bd4';
  for (const x0 of [142, 276]) {
    const zig = `M${x0},40 l10,-14 l8,14 l10,-14 l8,14 l10,-14 l8,14 l10,-14`;
    s += `<path d="${zig}" fill="none" stroke="${sign}" stroke-width="5" opacity="0.3" stroke-linejoin="round"/><path d="${zig}" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>`;
  }
  s += `<rect y="${FLOOR_Y - 12}" width="${GAME_W}" height="12" fill="#05030a" stroke="${OUTLINE}" stroke-width="1"/>`;
  s += exitDoor(boss ? 28 : 440, '#2a2550') + lightBar(boss ? ['#ff3b5c', '#ffe03b'] : ['#ff3bd4', '#3bd4ff']);
  s += mirrorBall(240, 58, 15, 27);
  // Piso de baldosas luminosas.
  s += `<rect y="${FLOOR_Y}" width="${GAME_W}" height="${GAME_H - FLOOR_Y}" fill="#0d0a14"/>`;
  const rows = [120, 134, 150, 168, 188, 210, 236, 270];
  for (let r = 0; r < rows.length - 1; r++) {
    for (let c = 0; c * 40 < GAME_W; c++) {
      s += `<rect x="${c * 40 + 1}" y="${rows[r] + 1}" width="38" height="${rows[r + 1] - rows[r] - 2}" fill="${tiles[Math.floor(random() * tiles.length)]}"/>`;
    }
  }
  s += `<rect y="${FLOOR_Y}" width="${GAME_W}" height="10" fill="#05070f" opacity="0.45"/>`;
  s += `<ellipse cx="240" cy="198" rx="170" ry="46" fill="url(#dg)"/>`;
  return s;
}

/** Recital: escenario a la derecha, pared de ladrillo con afiches y piso de cemento. */
function concertBg(): string {
  const random = rng(9);
  let s = `<defs>${glow('cg', '#ff8a3b', 0.36)}${glow('cb', '#5f9bff', 0.34)}${glow('cs', '#ffe9b0', 0.5)}</defs>`;
  s += `<rect width="${GAME_W}" height="${FLOOR_Y}" fill="#2a1c1c"/>`;
  for (let y = 12, r = 0; y < FLOOR_Y - 12; y += 9, r++) {
    for (let x = (r % 2) * 11 - 11; x < CONCERT_STAGE_X; x += 22) s += `<rect x="${x}" y="${y}" width="21" height="8" fill="${random() < 0.2 ? '#4a2a26' : '#3c2422'}"/>`;
  }
  // Afiches.
  // Afiches de recitales: cada uno con su instrumento.
  const instruments = [
    // Guitarra eléctrica.
    `<path d="M-7,10 q-5,-1 -4,-6 q1,-4 5,-3 l2,-2 l3,3 l-1,2 q3,4 0,7 q-2,2 -5,-1 Z" fill="${OUTLINE}"/><path d="M-1,1 L9,-11" stroke="${OUTLINE}" stroke-width="2.4" stroke-linecap="round"/><path d="M8,-13 l4,1 l-2,4 Z" fill="${OUTLINE}"/>`,
    // Batería.
    `<ellipse cx="0" cy="-2" rx="9" ry="3" fill="${OUTLINE}"/><path d="M-9,-2 V7 Q0,11 9,7 V-2" fill="${OUTLINE}"/><ellipse cx="0" cy="-2" rx="7" ry="2" fill="#f4f1ea"/><path d="M-4,-12 L3,-3 M6,-13 L-2,-3" stroke="${OUTLINE}" stroke-width="1.6" stroke-linecap="round"/>`,
    // Micrófono.
    `<circle cx="3" cy="-7" r="5.4" fill="${OUTLINE}"/><path d="M0,-3 L-7,10 L-4,12 L3,-1 Z" fill="${OUTLINE}"/><path d="M0,-9 l5,5 M-1,-6 l4,4" stroke="#f4f1ea" stroke-width="0.9"/>`,
    // Teclado.
    `<rect x="-11" y="-5" width="22" height="11" rx="1.5" fill="${OUTLINE}"/><rect x="-9.6" y="-0.6" width="19.2" height="5.4" fill="#f4f1ea"/><path d="M-6.4,-0.6 v3 M-3.2,-0.6 v3 M0,-0.6 v5.4 M3.2,-0.6 v3 M6.4,-0.6 v3" stroke="${OUTLINE}" stroke-width="1.2"/>`,
  ];
  [[70, '#ffe03b'], [150, '#ff3bd4'], [200, '#3bd4ff'], [286, '#ff5a3b']].forEach(([x, c], i) => {
    s += `<g transform="rotate(${[-4, 3, -2, 5][i]} ${x} 66)"><rect x="${(x as number) - 16}" y="44" width="32" height="44" fill="${c}" ${ST}/>` +
      `<rect x="${(x as number) - 13}" y="47" width="26" height="25" fill="#fff7d6" opacity="0.45"/><g transform="translate(${x},60)">${instruments[i]}</g>` +
      `<path d="M${(x as number) - 11},77 h22 M${(x as number) - 8},82 h16" stroke="${OUTLINE}" stroke-width="2"/></g>`;
  });
  // Fondo del escenario: telón, torres de luces y pantalla.
  s += `<rect x="${CONCERT_STAGE_X - 6}" y="0" width="${GAME_W - CONCERT_STAGE_X + 6}" height="${FLOOR_Y}" fill="#12101e" stroke="${OUTLINE}" stroke-width="1.2"/>`;
  s += `<rect x="388" y="26" width="78" height="56" fill="#ff5a3b" ${ST}/><path d="M396,70 l14,-30 l10,20 l8,-12 l14,22 Z" fill="#ffe03b" stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"/>`;
  for (const x of [378, 474]) s += `<rect x="${x - 3}" y="8" width="6" height="${FLOOR_Y - 8}" fill="#3a4060" stroke="${OUTLINE}" stroke-width="1"/>`;
  s += `<rect y="${FLOOR_Y - 12}" width="${CONCERT_STAGE_X - 6}" height="12" fill="#151012" stroke="${OUTLINE}" stroke-width="1"/>`;
  s += exitDoor(34, '#4a4a57') + lightBar(['#ff5a3b', '#3bd4ff']);
  // Piso de cemento y escenario de tablas.
  s += `<rect y="${FLOOR_Y}" width="${GAME_W}" height="${GAME_H - FLOOR_Y}" fill="#3a3d4c"/>`;
  for (let i = 0; i < 70; i++) s += `<rect x="${(random() * CONCERT_STAGE_X).toFixed(0)}" y="${(FLOOR_Y + 8 + random() * 140).toFixed(0)}" width="${(4 + random() * 10).toFixed(0)}" height="1.4" fill="#2f323f"/>`;
  s += `<rect y="${FLOOR_Y}" width="${GAME_W}" height="10" fill="#05070f" opacity="0.45"/>`;
  s += `<ellipse cx="130" cy="196" rx="90" ry="30" fill="url(#cb)"/><ellipse cx="280" cy="196" rx="80" ry="30" fill="url(#cg)"/>`;
  s += `<rect x="${CONCERT_STAGE_X - 6}" y="${FLOOR_Y}" width="6" height="${GAME_H - FLOOR_Y}" fill="#23232e" stroke="${OUTLINE}" stroke-width="1"/>`;
  s += `<rect x="${CONCERT_STAGE_X}" y="${FLOOR_Y}" width="${GAME_W - CONCERT_STAGE_X}" height="${GAME_H - FLOOR_Y}" fill="#2a1f26" stroke="${OUTLINE}" stroke-width="1.2"/>`;
  for (let y = FLOOR_Y + 14; y < GAME_H; y += 14) s += `<path d="M${CONCERT_STAGE_X + 1},${y} H${GAME_W}" stroke="#1f171c" stroke-width="1"/>`;
  s += `<path d="M${CONCERT_STAGE_X},${FLOOR_Y} V${GAME_H}" stroke="#ff8a3b" stroke-width="4" opacity="0.3"/><path d="M${CONCERT_STAGE_X},${FLOOR_Y} V${GAME_H}" stroke="#ffe0b0" stroke-width="1.4"/>`;
  s += `<ellipse cx="396" cy="194" rx="24" ry="13" fill="url(#cs)"/><ellipse cx="420" cy="236" rx="22" ry="11" fill="url(#cs)"/>`;
  return s;
}

// ---------- Utilería ----------

/** Mesa redonda con mantel largo y centro de mesa. El piso del frente queda en y = 27. */
function formalTable(cloth: string, trim: string, flower: string): string {
  let s = `<ellipse cx="13" cy="27" rx="13" ry="2" fill="#05030a" opacity="0.4"/>`;
  s += `<path d="M1,12 H25 L24,25 Q13,28 2,25 Z" fill="${cloth}" ${ST}/><path d="M2,21 Q13,24 24,21" fill="none" stroke="${trim}" stroke-width="1.4"/>`;
  s += `<ellipse cx="13" cy="10.5" rx="12" ry="4.6" fill="${cloth}" ${ST}/>`;
  s += `<rect x="12" y="4" width="2" height="6" fill="#3f8a4c"/>`;
  for (const [x, y] of [[13, 3.4], [10.4, 5.2], [15.6, 5.2]]) s += `<circle cx="${x}" cy="${y}" r="2.2" fill="${flower}" stroke="${OUTLINE}" stroke-width="0.8"/>`;
  s += `<ellipse cx="6" cy="10.6" rx="2.6" ry="1.2" fill="#f4f1ea" stroke="${OUTLINE}" stroke-width="0.7"/><ellipse cx="20" cy="10.6" rx="2.6" ry="1.2" fill="#f4f1ea" stroke="${OUTLINE}" stroke-width="0.7"/>`;
  return s;
}

/** Silla de costado, respaldo a la izquierda. Asiento a 9 del piso; apoyo en (6, 21). */
function formalChair(color: string): string {
  return (
    `<path d="M2.6,12 v9 M9.6,12 v9" stroke="${OUTLINE}" stroke-width="2.2"/>` +
    `<rect x="1" y="0.8" width="2.8" height="12.4" rx="1.2" fill="${color}" ${ST}/><rect x="1" y="11" width="10.4" height="2.8" rx="1" fill="${color}" ${ST}/>`
  );
}

/** Cabina chica del DJ o iluminador: parlante y consola. */
function booth(color: string): string {
  let s = `<rect x="1" y="6" width="20" height="26" rx="2" fill="#262b40" ${ST}/>`;
  s += `<circle cx="11" cy="14" r="4" fill="#0d0f1a" ${ST}/><circle cx="11" cy="25" r="5.4" fill="#0d0f1a" ${ST}/><circle cx="11" cy="25" r="2" fill="#3a4060"/>`;
  s += `<rect x="22" y="16" width="17" height="16" rx="1.5" fill="${color}" ${ST}/>`;
  for (const [x, c] of [[26, '#39ff6a'], [30.5, '#ff3bd4'], [35, '#ffe03b']] as const) s += `<circle cx="${x}" cy="21" r="1.5" fill="${c}"/>`;
  s += `<path d="M25,26 h11 M25,29 h7" stroke="${OUTLINE}" stroke-width="1.2"/>`;
  return s;
}

/** Cabina grande del DJ: mesa con bandejas y frente de luces. El piso del frente queda en y = 33. */
function djDesk(w: number): string {
  let s = `<rect x="1" y="14" width="${w - 2}" height="19" fill="#17131f" ${ST}/>`;
  for (let x = 6, i = 0; x < w - 8; x += 9, i++) {
    const h = 4 + ((i * 7) % 11);
    s += `<rect x="${x}" y="${30 - h}" width="5" height="${h}" fill="${NEON[i % NEON.length]}"/>`;
  }
  s += `<rect x="1" y="4" width="${w - 2}" height="10.5" rx="1.5" fill="#3a4060" ${ST}/>`;
  const mid = w / 2;
  for (const x of [mid - 24, mid + 24]) s += `<ellipse cx="${x}" cy="9" rx="9" ry="3.6" fill="#0d0f1a" ${ST}/><ellipse cx="${x}" cy="9" rx="2.6" ry="1.1" fill="#ff3bd4"/>`;
  s += `<rect x="${mid - 8}" y="5.6" width="16" height="7" rx="1" fill="#17131f" ${ST}/>`;
  for (let i = 0; i < 4; i++) s += `<rect x="${mid - 6 + i * 3.6}" y="${7 + (i % 2)}" width="1.6" height="2.4" fill="#f4f1ea"/>`;
  return s;
}

function speakers(): string {
  let s = `<ellipse cx="11" cy="43" rx="11" ry="2" fill="#05030a" opacity="0.45"/>`;
  for (const y of [1, 22]) s += `<rect x="1" y="${y}" width="20" height="21" rx="1.5" fill="#1d2134" ${ST}/><circle cx="11" cy="${y + 13}" r="6" fill="#0d0f1a" ${ST}/><circle cx="11" cy="${y + 13}" r="2.2" fill="#3a4060"/><circle cx="11" cy="${y + 4}" r="2" fill="#0d0f1a"/>`;
  return s;
}

function bar(): string {
  let s = `<rect x="1" y="1" width="82" height="16" fill="#1d1630" ${ST}/>`;
  for (let x = 6, i = 0; x < 80; x += 7, i++) s += `<rect x="${x}" y="${5 + (i % 3)}" width="3" height="${10 - (i % 3)}" rx="1" fill="${NEON[i % NEON.length]}" stroke="${OUTLINE}" stroke-width="0.7"/>`;
  s += `<rect x="1" y="17" width="82" height="6" rx="1" fill="#ff3bd4" ${ST}/><rect x="1" y="23" width="82" height="16" fill="#2a2046" ${ST}/>`;
  s += `<path d="M4,31 H80" stroke="#3bd4ff" stroke-width="1.6"/>`;
  // Tragos servidos sobre la barra: vaso largo con sorbete, copa y vaso corto.
  s += `<path d="M22,12.6 h6 l-0.8,9.4 h-4.4 Z" fill="#8fe9ff" fill-opacity="0.85" ${ST}/><path d="M22.6,16.4 h4.8" stroke="#fff" stroke-width="0.8"/><path d="M26,13.6 L29,8" stroke="#ff3bd4" stroke-width="1.3" stroke-linecap="round"/><circle cx="22.6" cy="12.8" r="1.6" fill="#ffe03b" stroke="${OUTLINE}" stroke-width="0.7"/>`;
  s += `<path d="M50,12 h9 l-4.5,6 Z" fill="#ff8fb0" ${ST}/><path d="M54.5,18 V22 M51.6,22 h5.8" stroke="${OUTLINE}" stroke-width="1.3" stroke-linecap="round"/><circle cx="56.6" cy="12.6" r="1.1" fill="#39ff6a"/>`;
  s += `<path d="M66,14 h5 l-0.6,8 h-3.8 Z" fill="#ffe03b" fill-opacity="0.9" ${ST}/>`;
  return s;
}

function sofa(): string {
  return (
    `<ellipse cx="22" cy="25" rx="21" ry="2" fill="#05030a" opacity="0.45"/>` +
    `<rect x="1" y="2" width="42" height="14" rx="4" fill="#8a1f5e" ${ST}/><rect x="3" y="12" width="38" height="10" rx="3" fill="#b83a82" ${ST}/>` +
    `<rect x="1" y="9" width="6" height="15" rx="2.5" fill="#8a1f5e" ${ST}/><rect x="37" y="9" width="6" height="15" rx="2.5" fill="#8a1f5e" ${ST}/>`
  );
}

/** Tramo de valla de seguridad (se repite en profundidad). Apoyo en (5, 25). */
function barrier(): string {
  return (
    `<rect x="3.4" y="2" width="3.2" height="12" fill="#c3c8d2" ${ST}/>` +
    `<rect x="3.8" y="13" width="2.4" height="12" fill="#8d93a3" ${ST}/><path d="M1,25 h8" stroke="${OUTLINE}" stroke-width="2"/>`
  );
}

function amp(): string {
  let s = `<ellipse cx="10" cy="33" rx="10" ry="2" fill="#05030a" opacity="0.45"/>`;
  s += `<rect x="1" y="1" width="18" height="9" rx="1" fill="#2b2b35" ${ST}/><path d="M4,5.5 h3 M9,5.5 h3 M14,5.5 h2" stroke="#ffd23f" stroke-width="1.6"/>`;
  s += `<rect x="1" y="10" width="18" height="23" rx="1" fill="#1d2134" ${ST}/><rect x="3.4" y="12.4" width="13.2" height="18.2" fill="#3a3d4c" stroke="${OUTLINE}" stroke-width="0.8"/>`;
  return s;
}

/** Pie con un gran arreglo floral. El piso queda en y = 45. */
function flowerStand(): string {
  const random = rng(15);
  let s = `<ellipse cx="11" cy="45" rx="8" ry="1.8" fill="#05030a" opacity="0.4"/>`;
  s += `<path d="M11,20 V44 M6,44.4 h10" stroke="${OUTLINE}" stroke-width="3" stroke-linecap="round"/><path d="M11,20 V44 M6,44.4 h10" stroke="#e9c94a" stroke-width="1.4" stroke-linecap="round"/>`;
  s += `<path d="M5,18 h12 l-2,7 h-8 Z" fill="#f4f1ea" ${ST}/>`;
  for (let i = 0; i < 6; i++) s += `<path d="M11,18 Q${(11 + (random() - 0.5) * 20).toFixed(1)},10 ${(11 + (random() - 0.5) * 20).toFixed(1)},4" fill="none" stroke="#3f8a4c" stroke-width="1.4"/>`;
  for (let i = 0; i < 12; i++) s += flower(11 + (random() - 0.5) * 17, 4 + random() * 13, 3 + random() * 1.4, BLOOMS[i % BLOOMS.length]);
  return s;
}

/** Arco de flores de la boda (va contra la pared). */
function arch(): string {
  const random = rng(4);
  let s = `<path d="M8,78 V34 Q8,6 35,6 Q62,6 62,34 V78" fill="none" stroke="#e9e3d2" stroke-width="6"/><path d="M8,78 V34 Q8,6 35,6 Q62,6 62,34 V78" fill="none" stroke="${OUTLINE}" stroke-width="1"/>`;
  for (let i = 0; i < 34; i++) {
    const a = Math.PI * (1 + i / 33);
    const x = 35 + Math.cos(a) * 27 + (random() - 0.5) * 6;
    const y = (i < 6 || i > 27 ? 34 + (i < 6 ? (6 - i) * 7 : (i - 27) * 7) : 34 + Math.sin(a) * 28) + (random() - 0.5) * 5;
    s += `<circle cx="${x.toFixed(1)}" cy="${Math.min(76, y).toFixed(1)}" r="${(3 + random() * 2).toFixed(1)}" fill="${['#ffd0de', '#fff', '#ff9fb8', '#8fca7a'][i % 4]}" stroke="${OUTLINE}" stroke-width="0.8"/>`;
  }
  return s;
}

export function venueTextures(): TexDef[] {
  return [
    { key: 'quince_bg', w: GAME_W, h: GAME_H, body: quinceBg() },
    { key: 'wedding_bg', w: GAME_W, h: GAME_H, body: weddingBg() },
    { key: 'disco_bg', w: GAME_W, h: GAME_H, body: discoBg(false) },
    { key: 'boss_bg', w: GAME_W, h: GAME_H, body: discoBg(true) },
    { key: 'concert_bg', w: GAME_W, h: GAME_H, body: concertBg() },
    { key: 'quince_table', w: 26, h: 29, body: formalTable('#ffd0ea', '#ff4f8b', '#ff4f8b') },
    { key: 'quince_chair', w: 12, h: 22, body: formalChair('#ffd23f') },
    { key: 'wedding_table', w: 26, h: 29, body: formalTable('#fbf8f0', '#e9c94a', '#ffd0de') },
    { key: 'wedding_chair', w: 12, h: 22, body: formalChair('#f4f1ea') },
    { key: 'quince_booth', w: 40, h: 33, body: booth('#ff7fc0') },
    { key: 'wedding_booth', w: 40, h: 33, body: booth('#e9c94a') },
    { key: 'concert_booth', w: 40, h: 33, body: booth('#ff5a3b') },
    { key: 'v_djdesk', w: 104, h: 34, body: djDesk(104) },
    { key: 'v_djdesk_long', w: 272, h: 34, body: djDesk(272) },
    { key: 'v_speakers', w: 22, h: 45, body: speakers() },
    { key: 'v_bar', w: 84, h: 40, body: bar() },
    { key: 'v_sofa', w: 44, h: 27, body: sofa() },
    { key: 'v_barrier', w: 10, h: 26, body: barrier() },
    { key: 'v_amp', w: 20, h: 35, body: amp() },
    { key: 'v_arch', w: 70, h: 80, body: arch() },
    { key: 'v_flowers', w: 22, h: 47, body: flowerStand() },
  ];
}
