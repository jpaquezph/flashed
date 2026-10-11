// Arte del escenario 1: iglesia moderna con escenario, pared de paneles LED,
// pantalla, banda en vivo y parrilla de luces.

import { GAME_H, GAME_W } from '../config/constants';
import { OUTLINE, rng, type TexDef } from './svg';

const FLOOR_Y = 120;
/** Borde izquierdo del escenario elevado. */
export const STAGE_X = 372;

/** Bloque escalonado de la pared LED: fondo azul con tiras de luz verticales. */
function ledBlock(x: number, w: number, top: number, random: () => number): string {
  let s = `<rect x="${x}" y="${top}" width="${w}" height="${FLOOR_Y - 6 - top}" fill="url(#led)" stroke="#060a1e" stroke-width="1.2"/>`;
  for (let sx = x + 3; sx < x + w - 2; sx += 4.6) {
    let y = top + 3 + random() * 6;
    while (y < FLOOR_Y - 12) {
      const len = 8 + random() * 22;
      const end = Math.min(y + len, FLOOR_Y - 9);
      s += `<rect x="${sx.toFixed(1)}" y="${y.toFixed(1)}" width="1.5" height="${(end - y).toFixed(1)}" fill="#dff3ff"/>`;
      y = end + 3 + random() * 7;
    }
  }
  s += `<ellipse cx="${x + w / 2}" cy="${FLOOR_Y - 6}" rx="${w * 0.55}" ry="20" fill="url(#uplight)"/>`;
  return s;
}

/** Vitral con arco de medio punto, iluminado desde atrás. */
function stainedGlass(cx: number, top: number, w: number, bottom: number): string {
  const x = cx - w / 2;
  const arch = `M${x},${bottom} V${top + w / 2} A${w / 2},${w / 2} 0 0 1 ${x + w},${top + w / 2} V${bottom} Z`;
  const id = `sg${cx}`;
  const glass = ['#e2553f', '#f1c232', '#3fae63', '#5d8fd6', '#c56bd6', '#2fb5a6'];
  let s = `<defs><clipPath id="${id}"><path d="${arch}"/></clipPath></defs>`;
  s += `<ellipse cx="${cx}" cy="${(top + bottom) / 2}" rx="${w}" ry="${(bottom - top) * 0.7}" fill="#ffe9b0" opacity="0.14"/>`;
  s += `<g clip-path="url(#${id})">`;
  for (let r = 0, y = top; y < bottom; y += 9, r++) {
    for (let c = 0; c < 3; c++) s += `<rect x="${x + (c * w) / 3}" y="${y}" width="${w / 3}" height="9" fill="${glass[(r * 2 + c) % glass.length]}"/>`;
  }
  // Cruz clara en el centro del vitral.
  s += `<rect x="${cx - 1.6}" y="${top + 6}" width="3.2" height="${bottom - top - 12}" fill="#fff7d6"/><rect x="${cx - 6}" y="${top + 16}" width="12" height="3.2" fill="#fff7d6"/>`;
  for (let y = top + 9; y < bottom; y += 9) s += `<path d="M${x},${y} H${x + w}" stroke="${OUTLINE}" stroke-width="0.8"/>`;
  s += `<path d="M${x + w / 3},${top} V${bottom} M${x + (2 * w) / 3},${top} V${bottom}" stroke="${OUTLINE}" stroke-width="0.8"/></g>`;
  s += `<path d="${arch}" fill="none" stroke="#c9a24a" stroke-width="2.6"/><path d="${arch}" fill="none" stroke="${OUTLINE}" stroke-width="0.9"/>`;
  return s;
}

function background(): string {
  const random = rng(11);
  let s =
    '<defs>' +
    '<linearGradient id="led" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1648"/><stop offset="1" stop-color="#1450d8"/></linearGradient>' +
    '<radialGradient id="uplight"><stop offset="0" stop-color="#6fe0ff" stop-opacity="0.75"/><stop offset="1" stop-color="#2f8dff" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="pool"><stop offset="0" stop-color="#ffe9b0" stop-opacity="0.5"/><stop offset="1" stop-color="#ffe9b0" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="bluepool"><stop offset="0" stop-color="#5f9bff" stop-opacity="0.35"/><stop offset="1" stop-color="#5f9bff" stop-opacity="0"/></radialGradient>' +
    '</defs>';

  // Pared del fondo y techo a dos aguas con la línea de luz azul.
  s += `<rect width="${GAME_W}" height="${FLOOR_Y}" fill="#0b1030"/>`;
  s += `<path d="M0,0 H${GAME_W} V52 L240,6 L0,52 Z" fill="#232c52" stroke="${OUTLINE}" stroke-width="1.2"/>`;
  for (const x of [80, 160, 320, 400]) s += `<path d="M${x},0 L${x + (x < 240 ? 18 : -18)},${6 + Math.abs(240 - x) * 0.19}" stroke="#1a2142" stroke-width="1"/>`;
  s += `<path d="M0,54 L240,8 L${GAME_W},54" fill="none" stroke="#2f8dff" stroke-width="7" opacity="0.35"/>`;
  s += `<path d="M0,54 L240,8 L${GAME_W},54" fill="none" stroke="#9fe2ff" stroke-width="1.6"/>`;

  // Pared LED escalonada a ambos lados de la pantalla.
  const blocks: [number, number, number][] = [
    [62, 30, 80], [92, 32, 64], [124, 32, 50], [156, 32, 38],
    [292, 32, 38], [324, 32, 50], [356, 32, 64], [388, 30, 80], [418, 44, 90],
  ];
  for (const [x, w, top] of blocks) s += ledBlock(x, w, top, random);

  // Pantalla de proyección y monitor.
  s += `<rect x="192" y="20" width="96" height="62" fill="#05070f" stroke="${OUTLINE}" stroke-width="1.4"/>`;
  s += `<rect x="195" y="26" width="90" height="53" fill="#e9edf6"/>`;
  // En la pantalla: cruz con rayos de luz.
  for (let a = 0; a < 12; a++) {
    const ang = (a / 12) * Math.PI * 2;
    s += `<path d="M${(240 + Math.cos(ang) * 14).toFixed(1)},${(52 + Math.sin(ang) * 12).toFixed(1)} L${(240 + Math.cos(ang) * 40).toFixed(1)},${(52 + Math.sin(ang) * 24).toFixed(1)}" stroke="#ffd98a" stroke-width="2.4" stroke-linecap="round" opacity="0.8"/>`;
  }
  s += `<path d="M235.5,30 h9 v11 h10 v8 h-10 v24 h-9 v-24 h-10 v-8 h10 Z" fill="#c9a24a" stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"/>`;
  // Vitrales a los costados y cruz iluminada sobre el escenario.
  s += stainedGlass(108, 54, 26, 108) + stainedGlass(340, 40, 26, 108);
  s += `<ellipse cx="432" cy="50" rx="24" ry="34" fill="#ffe9b0" opacity="0.2"/>`;
  s += `<path d="M428.5,22 h7 v16 h11 v7 h-11 v40 h-7 v-40 h-11 v-7 h11 Z" fill="#8a5a3a" stroke="${OUTLINE}" stroke-width="1.3" stroke-linejoin="round"/>`;
  s += `<path d="M430,24 v60 M419,40 h26" stroke="#b5814f" stroke-width="1"/>`;
  s += `<rect x="208" y="88" width="64" height="24" rx="1.5" fill="#141828" stroke="${OUTLINE}" stroke-width="1.4"/>`;
  s += `<path d="M212,108 L236,91 H250 L226,108 Z" fill="#232a45"/>`;

  // Puerta de salida.
  s += `<rect x="16" y="60" width="36" height="${FLOOR_Y - 60}" fill="#1b223f" stroke="${OUTLINE}" stroke-width="1.4"/>`;
  s += `<rect x="20" y="64" width="28" height="${FLOOR_Y - 64}" fill="#3a4266" stroke="${OUTLINE}" stroke-width="1.2"/>`;
  s += `<path d="M34,64 V${FLOOR_Y}" stroke="${OUTLINE}" stroke-width="1.2"/><rect x="30" y="90" width="1.6" height="7" fill="#c3c8d2"/><rect x="36.4" y="90" width="1.6" height="7" fill="#c3c8d2"/>`;
  s += `<rect x="23" y="45" width="22" height="10" rx="2" fill="#3fe07a" stroke="${OUTLINE}" stroke-width="1.2"/>`;
  s += `<path d="M28,50 h9 M34,47 l3.5,3 l-3.5,3" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<ellipse cx="34" cy="50" rx="20" ry="11" fill="#3fe07a" opacity="0.12"/>`;

  // Parrilla de luces: reflectores, emisores láser y parlantes colgados.
  s += `<rect x="54" y="13" width="372" height="4" fill="#3a4060" stroke="${OUTLINE}" stroke-width="1"/>`;
  for (let x = 58; x < 424; x += 8) s += `<path d="M${x},13 l4,4 l4,-4" fill="none" stroke="#1d2340" stroke-width="0.8"/>`;
  for (const x of [84, 176, 304, 396]) {
    s += `<path d="M${x},17 v3" stroke="${OUTLINE}" stroke-width="1.6"/>`;
    s += `<path d="M${x - 5},20 h10 l2,8 h-14 Z" fill="#1a1d2c" stroke="${OUTLINE}" stroke-width="1.1" stroke-linejoin="round"/>`;
    s += `<ellipse cx="${x}" cy="28.5" rx="5.4" ry="1.8" fill="#fff3b8"/>`;
    s += `<path d="M${x - 5},29 L${x - 22},${FLOOR_Y} H${x + 22} L${x + 5},29 Z" fill="#fff3b8" opacity="0.045"/>`;
  }
  for (const x of LASER_EMITTERS_X) {
    s += `<rect x="${x - 6}" y="17" width="12" height="8" rx="1.5" fill="#262b40" stroke="${OUTLINE}" stroke-width="1.1"/>`;
    s += `<circle cx="${x}" cy="23" r="2.4" fill="#39ff6a" stroke="${OUTLINE}" stroke-width="0.8"/><circle cx="${x - 0.7}" cy="22.3" r="0.8" fill="#eaffef"/>`;
  }
  for (const x of [8, 456]) {
    for (let i = 0; i < 4; i++) s += `<rect x="${x + i * 0.8}" y="${20 + i * 9}" width="16" height="9" fill="#1d2134" stroke="${OUTLINE}" stroke-width="1"/><rect x="${x + 2 + i * 0.8}" y="${22 + i * 9}" width="12" height="5" fill="#0d0f1a"/>`;
  }
  s += `<rect y="${FLOOR_Y - 6}" width="${GAME_W}" height="6" fill="#05070f"/>`;

  // Piso alfombrado y pasillo central.
  s += `<rect y="${FLOOR_Y}" width="${GAME_W}" height="${GAME_H - FLOOR_Y}" fill="#38457a"/>`;
  for (let y = FLOOR_Y + 9; y < GAME_H; y += 13) s += `<path d="M0,${y} H${STAGE_X - 6}" stroke="#313c6c" stroke-width="1.4"/>`;
  s += `<rect x="0" y="177" width="${STAGE_X - 6}" height="36" fill="#4d5c9c" stroke="${OUTLINE}" stroke-width="1.2"/>`;
  s += `<path d="M0,181 H${STAGE_X - 6} M0,209 H${STAGE_X - 6}" stroke="#7f8fd0" stroke-width="1"/>`;
  for (const x of [108, 164, 220, 276, 336]) s += `<ellipse cx="${x + 16}" cy="150" rx="26" ry="9" fill="url(#bluepool)"/>`;
  s += `<rect y="${FLOOR_Y}" width="${GAME_W}" height="12" fill="#05070f" opacity="0.4"/>`;

  // Escenario elevado: escalón, tablas y borde con tira LED.
  s += `<rect x="${STAGE_X - 6}" y="${FLOOR_Y}" width="6" height="${GAME_H - FLOOR_Y}" fill="#252c50" stroke="${OUTLINE}" stroke-width="1"/>`;
  s += `<rect x="${STAGE_X}" y="${FLOOR_Y}" width="${GAME_W - STAGE_X}" height="${GAME_H - FLOOR_Y}" fill="#1b2040" stroke="${OUTLINE}" stroke-width="1.2"/>`;
  for (let y = FLOOR_Y + 14; y < GAME_H; y += 14) s += `<path d="M${STAGE_X + 1},${y} H${GAME_W}" stroke="#141832" stroke-width="1"/>`;
  s += `<path d="M${STAGE_X},${FLOOR_Y} V${GAME_H}" stroke="#4fe0ff" stroke-width="4" opacity="0.3"/><path d="M${STAGE_X},${FLOOR_Y} V${GAME_H}" stroke="#bff4ff" stroke-width="1.4"/>`;
  s += `<ellipse cx="398" cy="196" rx="24" ry="13" fill="url(#pool)"/><ellipse cx="400" cy="158" rx="20" ry="10" fill="url(#pool)"/>`;
  s += `<ellipse cx="446" cy="200" rx="30" ry="22" fill="url(#bluepool)"/>`;
  return s;
}

/** Posición horizontal de los emisores láser de la parrilla (altura fija). */
export const LASER_EMITTERS_X = [130, 240, 350];
export const LASER_EMITTER_Y = 23;

/** Banco visto de costado con profundidad: respaldo a la izquierda, mira hacia el escenario. */
export const PEW_DEPTH = 44;
function pew(): string {
  const d = PEW_DEPTH;
  const st = `stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"`;
  let s = `<rect x="5.5" y="12" width="12.5" height="${d}" fill="#8f3350" ${st}/>`;
  s += `<rect x="5.5" y="12" width="4" height="${d}" fill="#6f2540"/>`;
  for (let y = 23; y < 12 + d; y += 11) s += `<path d="M6,${y} H17.5" stroke="#5a1c33" stroke-width="0.9"/>`;
  s += `<rect x="2" y="1" width="3.5" height="${d}" fill="#7a5238" ${st}/>`;
  s += `<path d="M2,${1 + d} h3.5 v10 l12.5,2.5 v9.5 h-2.6 v-5 h-9.8 v5 h-3.6 Z" fill="#4d3222" ${st}/>`;
  s += `<path d="M5.5,${12 + d} h12.5 v2.6 h-12.5 Z" fill="#5a1c33" ${st}/>`;
  return s;
}

function pulpit(): string {
  const st = `stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"`;
  return (
    `<ellipse cx="8" cy="31.5" rx="7" ry="2" fill="#05030a" opacity="0.45"/>` +
    `<path d="M3,12 h10 l-1.5,19 h-7 Z" fill="#8fdcff" fill-opacity="0.45" ${st}/>` +
    `<path d="M5,14 l1,15" stroke="#eaffff" stroke-width="1" opacity="0.8"/>` +
    `<path d="M1,12.5 L15,7 L15.4,10 L1.6,15.6 Z" fill="#3a4060" ${st}/>`
  );
}

function drums(): string {
  const st = `stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"`;
  let s = `<ellipse cx="20" cy="37" rx="18" ry="3" fill="#05030a" opacity="0.45"/>`;
  // Platillos con sus pies.
  for (const [x, y] of [[5, 9], [33, 6]]) {
    s += `<path d="M${x},${y} V36" stroke="#9aa1ad" stroke-width="1.2"/>`;
    s += `<ellipse cx="${x}" cy="${y}" rx="6" ry="1.8" fill="#f1c232" ${st}/>`;
  }
  // Toms y redoblante.
  s += `<rect x="12" y="13" width="8" height="6" rx="1" fill="#e2553f" ${st}/><ellipse cx="16" cy="13" rx="4" ry="1.4" fill="#f3efe6" ${st}/>`;
  s += `<rect x="22" y="12" width="8" height="6" rx="1" fill="#e2553f" ${st}/><ellipse cx="26" cy="12" rx="4" ry="1.4" fill="#f3efe6" ${st}/>`;
  s += `<rect x="1" y="21" width="9" height="5" rx="1" fill="#c3c8d2" ${st}/><ellipse cx="5.5" cy="21" rx="4.5" ry="1.5" fill="#f3efe6" ${st}/><path d="M5.5,26 V36" stroke="#9aa1ad" stroke-width="1.2"/>`;
  // Bombo de frente.
  s += `<circle cx="20" cy="27" r="9.5" fill="#e2553f" ${st}/><circle cx="20" cy="27" r="7" fill="#f3efe6" ${st}/><circle cx="20" cy="27" r="2.2" fill="#232c52"/>`;
  s += `<path d="M12,35 l-2,2 M28,35 l2,2" stroke="${OUTLINE}" stroke-width="1.4"/>`;
  return s;
}

function keyboard(): string {
  const st = `stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"`;
  let s = `<ellipse cx="15" cy="23" rx="13" ry="2" fill="#05030a" opacity="0.45"/>`;
  s += `<path d="M6,10 L24,22 M24,10 L6,22" stroke="#9aa1ad" stroke-width="1.6"/>`;
  s += `<rect x="1" y="4" width="28" height="6.5" rx="1" fill="#262b40" ${st}/>`;
  s += `<rect x="2.5" y="6.6" width="25" height="3" fill="#f3efe6"/>`;
  for (let x = 4; x < 27; x += 2.2) s += `<rect x="${x.toFixed(1)}" y="6.6" width="1" height="1.7" fill="${OUTLINE}"/>`;
  return s;
}

/** Monitor de piso en el borde del escenario. */
function wedge(): string {
  const st = `stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"`;
  return (
    `<ellipse cx="8" cy="12.5" rx="8" ry="1.8" fill="#05030a" opacity="0.45"/>` +
    `<path d="M1,12 L4,3 H14 L15,12 Z" fill="#262b40" ${st}/><path d="M4.4,10.4 L6,4.6 H12.6 L13.2,10.4 Z" fill="#0d0f1a"/>` +
    `<circle cx="9" cy="7.6" r="1.8" fill="#3a4060"/>`
  );
}

/** Candelabro de pie con tres velas encendidas. */
function candles(): string {
  const st = `stroke="${OUTLINE}" stroke-width="1.1" stroke-linejoin="round"`;
  let s = `<ellipse cx="9" cy="37" rx="7" ry="1.8" fill="#05030a" opacity="0.45"/><ellipse cx="9" cy="8" rx="11" ry="9" fill="#ffe9b0" opacity="0.22"/>`;
  s += `<path d="M9,16 V36 M4,36 h10" stroke="${OUTLINE}" stroke-width="2.6" stroke-linecap="round"/><path d="M9,16 V36 M4,36 h10" stroke="#c9a24a" stroke-width="1.2" stroke-linecap="round"/>`;
  s += `<path d="M2.6,16 Q9,22 15.4,16" fill="none" stroke="${OUTLINE}" stroke-width="2.4"/><path d="M2.6,16 Q9,22 15.4,16" fill="none" stroke="#c9a24a" stroke-width="1.1"/>`;
  for (const [x, y] of [[2.6, 9], [9, 6], [15.4, 9]]) {
    s += `<rect x="${x - 1.4}" y="${y}" width="2.8" height="8" fill="#f4f1ea" ${st}/>`;
    s += `<path d="M${x},${y - 0.4} q-1.8,-2.4 0,-5 q1.8,2.6 0,5 Z" fill="#ffb53f" stroke="${OUTLINE}" stroke-width="0.6"/>`;
  }
  return s;
}

/** Consola del operador de sonido y luces. */
function booth(): string {
  const st = `stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"`;
  let s = `<rect x="1" y="9" width="38" height="8" fill="#3a4060" ${st}/>`;
  s += `<rect x="1" y="17" width="38" height="13" fill="#1d2134" ${st}/>`;
  for (let x = 4; x < 22; x += 3) s += `<path d="M${x},10.5 v5" stroke="#0d0f1a" stroke-width="1"/><rect x="${x - 0.9}" y="${11 + ((x * 7) % 3)}" width="1.8" height="1.6" fill="#f3efe6"/>`;
  s += `<path d="M25,10 h11 l1,-8 h-11 Z" fill="#141828" ${st}/><path d="M26.4,8.6 l0.8,-5.4 h8.4 l-0.8,5.4 Z" fill="#4fe0ff"/>`;
  for (const [x, c] of [[6, '#39ff6a'], [10, '#ff3b5c'], [14, '#ffd23f']] as const) s += `<circle cx="${x}" cy="22" r="1.2" fill="${c}"/>`;
  return s;
}

export function churchTextures(): TexDef[] {
  return [
    { key: 'church_bg', w: GAME_W, h: GAME_H, body: background() },
    { key: 'church_pew', w: 20, h: PEW_DEPTH + 24, body: pew() },
    { key: 'church_pulpit', w: 16, h: 34, body: pulpit() },
    { key: 'church_drums', w: 40, h: 40, body: drums() },
    { key: 'church_keyboard', w: 30, h: 26, body: keyboard() },
    { key: 'church_wedge', w: 16, h: 15, body: wedge() },
    { key: 'church_booth', w: 40, h: 31, body: booth() },
    { key: 'church_candles', w: 18, h: 39, body: candles() },
  ];
}
