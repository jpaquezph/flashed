// Utilidades compartidas por los generadores de arte vectorial.

/** Color de contorno común a todo el arte del juego. */
export const OUTLINE = '#0d0a14';

/** Redondea para mantener cortas las cadenas SVG. */
export const n = (v: number): number => Math.round(v * 100) / 100;

/** Aclara (amt > 0) u oscurece (amt < 0) un color hexadecimal. amt va de -1 a 1. */
export function shade(hex: string, amt: number): string {
  const v = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt));
  const r = mix((v >> 16) & 255);
  const g = mix((v >> 8) & 255);
  const b = mix(v & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

/** Generador pseudoaleatorio determinista (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Descripción de una textura a generar en el arranque. Las medidas están en unidades lógicas. */
export interface TexDef {
  key: string;
  w: number;
  h: number;
  /** Contenido SVG (sin la etiqueta raíz). */
  body: string;
  frames?: { name: string; x: number; y: number; w: number; h: number }[];
  /** Factor de raster extra, para ilustraciones que se muestran ampliadas. */
  scale?: number;
}
