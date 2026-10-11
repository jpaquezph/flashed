// Piezas reutilizables para armar la configuración de los salones.

import { VENUE_EMITTERS_X, VENUE_EMITTER_Y } from '../../art/venues';
import type { Rect } from '../../game/Collision';
import type { Point, PropDef, SpotDef } from './types';

/** Franja central libre de muebles: circulación, pista y huecos de los láseres. */
export const OPEN: Rect = { x: 12, y: 162, w: 456, h: 70 };
export const LANE: Rect = { x: 8, y: 182, w: 464, h: 32 };
export const FLOOR: Rect = { x: 8, y: 124, w: 464, h: 140 };
export const EMITTERS: Point[] = VENUE_EMITTERS_X.map((x) => ({ x, y: VENUE_EMITTER_Y }));

/**
 * Mesas con una silla de cada lado y dos invitados enfrentados.
 * `style` es el prefijo de las texturas (`<style>_table`, `<style>_chair`).
 */
export function tableSets(style: string, centers: [number, number][]): { props: PropDef[]; seats: SpotDef[] } {
  const props: PropDef[] = [];
  const seats: SpotDef[] = [];
  for (const [tx, ty] of centers) {
    props.push(
      { key: `${style}_chair`, x: tx - 25, y: ty - 23, depth: ty - 2.5 },
      { key: `${style}_chair`, x: tx + 13, y: ty - 23, depth: ty - 2.5, flip: true },
      { key: `${style}_table`, x: tx - 13, y: ty - 24, depth: ty + 3, collide: { x: tx - 26, y: ty - 9, w: 52, h: 13 } },
    );
    seats.push({ x: tx - 19, y: ty - 2, facing: 1 }, { x: tx + 19, y: ty - 2, facing: -1 });
  }
  return { props, seats };
}

/** Cabina chica en una esquina de abajo, con el lugar donde se para quien la maneja. */
export function cornerBooth(key: string, right: boolean): { prop: PropDef; spot: SpotDef } {
  const x = right ? 428 : 12;
  return {
    prop: { key, x, y: 226, depth: 258, collide: { x: x + 1, y: 246, w: 38, h: 13 } },
    spot: { x: x + 20, y: 242, facing: right ? -1 : 1 },
  };
}

/** Lista de lugares a partir de pares (x, y); miran hacia la derecha salvo que se indique. */
export const spots = (points: [number, number][], facing: 1 | -1 = 1): SpotDef[] => points.map(([x, y]) => ({ x, y, facing }));
