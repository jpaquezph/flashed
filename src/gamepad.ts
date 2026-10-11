// Mando de juego (TV, consola, PC): cada botón se traduce a la tecla equivalente,
// así todas las pantallas responden sin tratarlo como un caso aparte.

import { audioContext } from './audio/context';

interface KeyDef { key: string; code: string; keyCode: number }

const KEYS = {
  left: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
  up: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
  right: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
  down: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
  space: { key: ' ', code: 'Space', keyCode: 32 },
  e: { key: 'e', code: 'KeyE', keyCode: 69 },
  r: { key: 'r', code: 'KeyR', keyCode: 82 },
  escape: { key: 'Escape', code: 'Escape', keyCode: 27 },
} satisfies Record<string, KeyDef>;

/** Botones del mando estándar → tecla. A: foto/aceptar, B y X: interactuar, Y: reintentar, Start/Select: pausa. */
const BUTTONS: [number, KeyDef][] = [
  [0, KEYS.space], [1, KEYS.e], [2, KEYS.e], [3, KEYS.r], [8, KEYS.escape], [9, KEYS.escape],
  [12, KEYS.up], [13, KEYS.down], [14, KEYS.left], [15, KEYS.right],
];
const STICK = 0.5;

const held = new Set<KeyDef>();

function send(type: 'keydown' | 'keyup', def: KeyDef): void {
  const event = new KeyboardEvent(type, { key: def.key, code: def.code, bubbles: true });
  // Phaser identifica las teclas por keyCode, que el constructor no siempre respeta.
  Object.defineProperty(event, 'keyCode', { get: () => def.keyCode });
  Object.defineProperty(event, 'which', { get: () => def.keyCode });
  window.dispatchEvent(event);
}

function poll(): void {
  const pad = [...navigator.getGamepads()].find((p) => p && p.connected);
  const now = new Set<KeyDef>();
  if (pad) {
    for (const [index, def] of BUTTONS) if (pad.buttons[index]?.pressed) now.add(def);
    const [x = 0, y = 0] = pad.axes;
    if (x < -STICK) now.add(KEYS.left);
    if (x > STICK) now.add(KEYS.right);
    if (y < -STICK) now.add(KEYS.up);
    if (y > STICK) now.add(KEYS.down);
  }
  for (const def of now) {
    if (held.has(def)) continue;
    held.add(def);
    void audioContext();
    send('keydown', def);
  }
  for (const def of [...held]) {
    if (now.has(def)) continue;
    held.delete(def);
    send('keyup', def);
  }
  requestAnimationFrame(poll);
}

/** Empieza a escuchar mandos. No hace nada hasta que se conecta uno. */
export function watchGamepads(): void {
  if (!navigator.getGamepads) return;
  window.addEventListener('gamepadconnected', () => requestAnimationFrame(poll), { once: true });
}
