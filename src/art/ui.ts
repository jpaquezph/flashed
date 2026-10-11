// Íconos de interfaz y efectos.

import { OUTLINE, n, type TexDef } from './svg';

function star(cx: number, cy: number, points: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    pts.push(`${n(cx + Math.cos(a) * r)},${n(cy + Math.sin(a) * r)}`);
  }
  return pts.join(' ');
}

/** Sensor de la cámara: una pastilla con su grilla de píxeles. */
function sensor(burnt: boolean): string {
  const st = `stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"`;
  let s = `<rect x="1" y="1.5" width="12" height="11" rx="1.5" fill="${burnt ? '#2a2535' : '#c3c8d2'}" ${st}/>`;
  s += `<rect x="3" y="3.5" width="8" height="7" fill="${burnt ? '#15121d' : '#3fd0b0'}" stroke="${OUTLINE}" stroke-width="0.8"/>`;
  if (burnt) {
    s += `<path d="M4,4.4 L7,7 L6,8 L9.8,9.8" fill="none" stroke="#ff7a2f" stroke-width="1.2" stroke-linejoin="round"/><circle cx="7" cy="7" r="1.1" fill="#ffd23f"/>`;
  } else {
    s += `<path d="M5.7,3.5 v7 M8.3,3.5 v7 M3,5.8 h8 M3,8.2 h8" stroke="#1f8f7a" stroke-width="0.6"/><path d="M3.6,4.2 h3 v1.4" fill="none" stroke="#eafff9" stroke-width="0.8"/>`;
  }
  return s;
}

/** Tarjeta de memoria. */
function card(full: boolean): string {
  const st = `stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"`;
  let s = `<path d="M1.5,1.5 H8.5 L12.5,5 V14.5 H1.5 Z" fill="${full ? '#ff3b5c' : '#3b6fe0'}" ${st}/>`;
  for (const x of [3, 5, 7]) s += `<rect x="${x}" y="2.6" width="1.1" height="2.6" fill="#ffd23f"/>`;
  s += `<rect x="3" y="7.4" width="8" height="5.4" rx="0.8" fill="#f4f1ea" stroke="${OUTLINE}" stroke-width="0.7"/>`;
  s += full
    ? `<path d="M7,8.2 v2.6" stroke="#ff3b5c" stroke-width="1.5" stroke-linecap="round"/><circle cx="7" cy="12" r="0.8" fill="#ff3b5c"/>`
    : `<path d="M4.2,9.2 h5.6 M4.2,11 h3.6" stroke="#8fa0c8" stroke-width="0.8"/>`;
  return s;
}

/** Íconos de los accesorios (16 × 16). */
function upgradeIcons(): TexDef[] {
  const st = `stroke="${OUTLINE}" stroke-width="1.1" stroke-linejoin="round"`;
  const icons: Record<string, string> = {
    // Cotillón protector: gorrito con matraca.
    up_shield: `<path d="M3,13.5 L8,2 L13,13.5 Z" fill="#ff4f8b" ${st}/><path d="M5.2,9 L10.8,9 M6.4,6 L9.6,6" stroke="#ffd23f" stroke-width="1.3"/><circle cx="8" cy="2" r="1.6" fill="#ffd23f" ${st}/><path d="M2,13.5 h12" stroke="#4fe0ff" stroke-width="2" stroke-linecap="round"/>`,
    // Bebida para el DJ.
    up_drink: `<path d="M4,5 h8 l-1.2,9.5 h-5.6 Z" fill="#4fe0ff" ${st}/><path d="M4.5,8 h7" stroke="#fff" stroke-width="1"/><path d="M9,5.5 L11.5,1" stroke="#ff4f8b" stroke-width="1.5" stroke-linecap="round"/><circle cx="5.4" cy="4.6" r="2" fill="#ffd23f" ${st}/>`,
    // Flash mejorado.
    up_flash: `<rect x="6.4" y="9.5" width="3.2" height="5" fill="#3b3b47" ${st}/><rect x="3" y="3" width="10" height="7" rx="1.2" fill="#4c4c5a" ${st}/><rect x="4.6" y="4.6" width="6.8" height="3.8" fill="#fff6c2"/><path d="M9,1 L6,6.4 h2.4 L7,11 L11,5 h-2.4 Z" fill="#ffd23f" stroke="${OUTLINE}" stroke-width="0.8" stroke-linejoin="round"/>`,
    // Gran angular.
    up_wide: `<circle cx="8" cy="8" r="5.6" fill="#2b2b35" ${st}/><circle cx="8" cy="8" r="3.4" fill="#8fdcff" ${st}/><path d="M1,8 h2.4 M12.6,8 H15 M2.6,6.4 L1,8 l1.6,1.6 M13.4,6.4 L15,8 l-1.6,1.6" fill="none" stroke="#ffd23f" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`,
    // Zapatillas.
    up_shoes: `<path d="M2,11.5 V6 L6.4,5 L8,7.6 L13.4,9.4 Q14.6,10 14.4,11.5 Z" fill="#ff5a3b" ${st}/><path d="M2,11.5 h12.4 v1.8 H2 Z" fill="#f4f1ea" ${st}/><path d="M6.6,7 l1.4,1.6 M8.6,7.8 l1.2,1.4" stroke="#fff" stroke-width="1"/>`,
    // Correa de cámara.
    up_strap: `<path d="M3,13 Q1.5,3 8,2.6 Q14.5,3 13,13" fill="none" stroke="${OUTLINE}" stroke-width="4" stroke-linecap="round"/><path d="M3,13 Q1.5,3 8,2.6 Q14.5,3 13,13" fill="none" stroke="#e9c94a" stroke-width="2.2" stroke-linecap="round"/><rect x="1.6" y="11.6" width="3" height="3" fill="#c3c8d2" ${st}/><rect x="11.4" y="11.6" width="3" height="3" fill="#c3c8d2" ${st}/>`,
    // Tarjeta extra.
    up_card: `<path d="M3,1.5 H9.5 L13,4.6 V14.5 H3 Z" fill="#3b6fe0" ${st}/><rect x="4.6" y="2.6" width="1" height="2.4" fill="#ffd23f"/><rect x="6.6" y="2.6" width="1" height="2.4" fill="#ffd23f"/><path d="M8,7 v5.4 M5.3,9.7 h5.4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`,
  };
  return Object.entries(icons).map(([key, body]) => ({ key, w: 16, h: 16, body, scale: 4 }));
}

export function uiTextures(): TexDef[] {
  const st = `stroke="${OUTLINE}" stroke-width="1.2" stroke-linejoin="round"`;
  return [
    ...upgradeIcons(),
    { key: 'ui_card', w: 14, h: 16, body: card(false), scale: 4 },
    { key: 'ui_card_full', w: 14, h: 16, body: card(true), scale: 4 },
    { key: 'ui_sensor', w: 14, h: 14, body: sensor(false) },
    { key: 'ui_sensor_burnt', w: 14, h: 14, body: sensor(true) },
    { key: 'ui_star', w: 12, h: 12, body: `<polygon points="${star(6, 6.3, 5, 5.2, 2.3)}" fill="#ffd23f" ${st}/>` },
    { key: 'ui_star_empty', w: 12, h: 12, body: `<polygon points="${star(6, 6.3, 5, 5.2, 2.3)}" fill="#6b6390" ${st}/>` },
    {
      key: 'ui_camera', w: 16, h: 12,
      body:
        `<rect x="4.5" y="1" width="5" height="3" rx="0.8" fill="#c9cdd6" ${st}/>` +
        `<rect x="1" y="3" width="14" height="8" rx="1.6" fill="#f4f1ea" ${st}/>` +
        `<circle cx="8" cy="7" r="2.7" fill="#4fd0ff" ${st}/><circle cx="12.6" cy="5" r="0.8" fill="#ff3b5c"/>`,
    },
    {
      key: 'fx_flash', w: 40, h: 40,
      body: `<polygon points="${star(20, 20, 8, 19, 6)}" fill="#fffbe0" stroke="#ffd23f" stroke-width="1.4" stroke-linejoin="round"/><circle cx="20" cy="20" r="5" fill="#fff"/>`,
    },
    {
      key: 'fx_burst', w: 120, h: 120, scale: 2,
      body: `<polygon points="${star(60, 60, 14, 58, 40)}" fill="#ffd23f" stroke="${OUTLINE}" stroke-width="2" stroke-linejoin="round"/><polygon points="${star(60, 60, 14, 46, 32)}" fill="#fff1a8"/>`,
    },
  ];
}
