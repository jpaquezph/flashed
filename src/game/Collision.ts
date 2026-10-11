// Colisiones sencillas a nivel del piso: todo se resuelve con la caja de los pies
// del personaje, nunca con su ilustración completa.

export interface Rect { x: number; y: number; w: number; h: number }

export const rectsOverlap = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export const pointInRect = (r: Rect, x: number, y: number): boolean =>
  x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

/** Caja de pies: (x, y) es el punto de apoyo, la caja queda centrada y por encima. */
export const footBox = (x: number, y: number, w: number, h: number): Rect => ({ x: x - w / 2, y: y - h, w, h });

export function isBlocked(x: number, y: number, w: number, h: number, obstacles: Rect[], bounds: Rect): boolean {
  if (!pointInRect(bounds, x, y)) return true;
  const box = footBox(x, y, w, h);
  return obstacles.some((o) => rectsOverlap(box, o));
}

/** Mueve un cuerpo eje por eje para que pueda deslizarse contra los obstáculos. */
export function moveBody(pos: { x: number; y: number }, dx: number, dy: number, w: number, h: number, obstacles: Rect[], bounds: Rect): void {
  if (dx !== 0 && !isBlocked(pos.x + dx, pos.y, w, h, obstacles, bounds)) pos.x += dx;
  if (dy !== 0 && !isBlocked(pos.x, pos.y + dy, w, h, obstacles, bounds)) pos.y += dy;
}
