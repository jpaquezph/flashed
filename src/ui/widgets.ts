// Piezas de interfaz compartidas por todas las pantallas: cámara, textos, paneles y teclas.

import Phaser from 'phaser';
import { COLORS, FONT, GAME_H, GAME_W, RS } from '../config/constants';
import { TOUCH } from '../device';

/** Ajusta la cámara para trabajar en coordenadas lógicas (480 × 270). */
export function setupCamera(scene: Phaser.Scene): void {
  scene.cameras.main.setZoom(RS).centerOn(GAME_W / 2, GAME_H / 2);
}

export interface LabelOptions {
  color?: string;
  stroke?: number;
  align?: 'left' | 'center' | 'right';
  wrap?: number;
  italic?: boolean;
}

/** Texto arcade con contorno. El tamaño está en píxeles lógicos. */
export function label(scene: Phaser.Scene, x: number, y: number, text: string, size: number, opts: LabelOptions = {}): Phaser.GameObjects.Text {
  const align = opts.align ?? 'left';
  return scene.add
    .text(x, y, text, {
      fontFamily: FONT,
      fontSize: `${size}px`,
      fontStyle: opts.italic ? 'italic' : 'normal',
      color: opts.color ?? '#ffffff',
      stroke: '#120e1c',
      strokeThickness: opts.stroke ?? Math.max(2, size * 0.3),
      align,
      resolution: RS,
      wordWrap: opts.wrap ? { width: opts.wrap } : undefined,
      padding: { x: 2, y: 2 },
    })
    .setOrigin(align === 'center' ? 0.5 : align === 'right' ? 1 : 0, 0);
}

/** Panel con contorno grueso y borde de color. */
export function panel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, accent: number = COLORS.yellow, alpha = 0.93): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(COLORS.ink, 1).fillRoundedRect(x - 2, y - 2, w + 4, h + 4, 6);
  g.fillStyle(accent, 1).fillRoundedRect(x, y, w, h, 5);
  g.fillStyle(COLORS.panel, alpha).fillRoundedRect(x + 1.5, y + 1.5, w - 3, h - 3, 4);
  return g;
}

/** Tecla dibujada: devuelve el ancho ocupado. */
export function keyCap(scene: Phaser.Scene, x: number, y: number, text: string, w = 13): number {
  const g = scene.add.graphics();
  g.fillStyle(COLORS.ink, 1).fillRoundedRect(x - 1, y - 1, w + 2, 15, 3);
  g.fillStyle(0xb9b3cf, 1).fillRoundedRect(x, y, w, 13, 2.5);
  g.fillStyle(0xf4f1ea, 1).fillRoundedRect(x, y, w, 10.5, 2.5);
  label(scene, x + w / 2, y + 0.5, text, 6.5, { color: '#120e1c', stroke: 0, align: 'center' });
  return w;
}

/** Fondo de pantallas de menú: franjas diagonales arcade. */
export function stripedBackdrop(scene: Phaser.Scene, base: number, stripe: number): void {
  const g = scene.add.graphics();
  g.fillStyle(base, 1).fillRect(0, 0, GAME_W, GAME_H);
  g.fillStyle(stripe, 1);
  for (let x = -GAME_H; x < GAME_W; x += 44) {
    g.fillPoints([
      new Phaser.Geom.Point(x, GAME_H),
      new Phaser.Geom.Point(x + GAME_H, 0),
      new Phaser.Geom.Point(x + GAME_H + 20, 0),
      new Phaser.Geom.Point(x + 20, GAME_H),
    ], true);
  }
}

/** En dispositivos táctiles, un toque en cualquier lugar de la pantalla ejecuta la acción. */
export function onTap(scene: Phaser.Scene, action: () => void): void {
  if (TOUCH) scene.input.on('pointerdown', (_p: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => over.length === 0 && action());
}

/** En dispositivos táctiles, convierte un rectángulo de la pantalla en un botón. */
export function tapZone(scene: Phaser.Scene, x: number, y: number, w: number, h: number, action: () => void): Phaser.GameObjects.Zone | null {
  if (!TOUCH) return null;
  return scene.add.zone(x, y, w, h).setOrigin(0).setInteractive().on('pointerdown', action);
}

/** Botón de texto para pantallas táctiles: etiqueta con fondo y su zona de toque. Devuelve sus piezas. */
export function tapButton(scene: Phaser.Scene, cx: number, y: number, text: string, size: number, action: () => void): Phaser.GameObjects.GameObject[] {
  const caption = label(scene, cx, y, text, size, { align: 'center', stroke: 0 });
  const w = caption.width + 16;
  const h = caption.height + 6;
  const g = scene.add.graphics();
  g.fillStyle(0x08080a, 1).fillRoundedRect(cx - w / 2 - 1.5, y - 4.5, w + 3, h + 3, 5);
  g.fillStyle(0x55555f, 1).fillRoundedRect(cx - w / 2, y - 3, w, h, 4);
  g.fillStyle(0x2a2a30, 1).fillRoundedRect(cx - w / 2 + 1, y - 2, w - 2, h - 2, 3.2);
  const zone = scene.add.zone(cx - w / 2 - 4, y - 7, w + 8, h + 8).setOrigin(0).setInteractive().on('pointerdown', action);
  caption.setDepth(1);
  return [g, caption, zone];
}

/** Fuego: llamas que suben desde un punto hasta que se corta el temporizador que devuelve. */
export function burn(scene: Phaser.Scene, x: number, y: number, depth: number, size = 1): Phaser.Time.TimerEvent {
  return scene.time.addEvent({
    delay: 55,
    loop: true,
    callback: () => {
      const heat = Math.random();
      const color = heat < 0.3 ? 0xfff3a8 : heat < 0.7 ? 0xffb53f : 0xff5a2f;
      const flame = scene.add
        .ellipse(x + (Math.random() - 0.5) * 8 * size, y, (3 + Math.random() * 3) * size, (5 + Math.random() * 4) * size, color, 0.95)
        .setDepth(depth + (heat < 0.3 ? 1 : 0));
      scene.tweens.add({
        targets: flame, y: y - (9 + Math.random() * 11) * size, scaleX: 0.2, scaleY: 0.45, alpha: 0,
        duration: 360 + Math.random() * 240, onComplete: () => flame.destroy(),
      });
    },
  });
}

export const formatTime = (seconds: number): string => {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
