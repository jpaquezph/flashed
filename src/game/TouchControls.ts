// Controles táctiles: palanca a la izquierda y botones a la derecha.
// Solo se crean en dispositivos táctiles; el teclado sigue funcionando igual.

import Phaser from 'phaser';
import { GAME_H, RS } from '../config/constants';
import { label } from '../ui/widgets';

const DEPTH = 6000;
const STICK_HOME = { x: 58, y: 212 };
const STICK_RADIUS = 24;
const DEAD_ZONE = 7;

export interface TouchInput {
  ix: number;
  iy: number;
  photo: boolean;
  use: boolean;
  pause: boolean;
}

export class TouchControls {
  private ix = 0;
  private iy = 0;
  private pressed = { photo: false, use: false, pause: false };
  private stickPointer = -1;
  private origin = { ...STICK_HOME };
  private readonly base: Phaser.GameObjects.Arc;
  private readonly knob: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene) {
    scene.input.addPointer(2);
    this.base = scene.add.circle(STICK_HOME.x, STICK_HOME.y, STICK_RADIUS, 0xffffff, 0.1).setStrokeStyle(1.6, 0xffffff, 0.45).setDepth(DEPTH);
    this.knob = scene.add.circle(STICK_HOME.x, STICK_HOME.y, 11, 0xffffff, 0.4).setStrokeStyle(1.2, 0x120e1c, 0.6).setDepth(DEPTH + 1);

    this.button(scene, 436, 214, 24, 0xffd23f, 'photo').add(scene.add.image(0, 0, 'ui_camera').setScale(1.7 / RS));
    this.button(scene, 386, 244, 14, 0x5be37a, 'use').add(label(scene, 0, -7.5, 'E', 10, { align: 'center' }));
    this.button(scene, 15, 36, 10, 0x4fe0ff, 'pause').add(label(scene, 0, -5.5, 'II', 7, { align: 'center' }));

    // La palanca aparece donde se apoya el dedo, en la mitad izquierda de la pantalla.
    scene.input.on('pointerdown', (p: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
      if (this.stickPointer >= 0 || over.length > 0 || p.worldX > 230 || p.worldY < 60) return;
      this.stickPointer = p.id;
      this.origin = { x: Phaser.Math.Clamp(p.worldX, 34, 200), y: Phaser.Math.Clamp(p.worldY, 90, GAME_H - 30) };
      this.base.setPosition(this.origin.x, this.origin.y);
      this.knob.setPosition(this.origin.x, this.origin.y);
    });
    scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.id !== this.stickPointer) return;
      const dx = p.worldX - this.origin.x;
      const dy = p.worldY - this.origin.y;
      const dist = Math.hypot(dx, dy);
      const k = dist > STICK_RADIUS ? STICK_RADIUS / dist : 1;
      this.knob.setPosition(this.origin.x + dx * k, this.origin.y + dy * k);
      // Ocho direcciones, como con el teclado.
      const active = dist > DEAD_ZONE;
      this.ix = active && Math.abs(dx) > dist * 0.38 ? Math.sign(dx) : 0;
      this.iy = active && Math.abs(dy) > dist * 0.38 ? Math.sign(dy) : 0;
    });
    const release = (p: Phaser.Input.Pointer) => {
      if (p.id !== this.stickPointer) return;
      this.stickPointer = -1;
      this.ix = 0;
      this.iy = 0;
      this.origin = { ...STICK_HOME };
      this.base.setPosition(STICK_HOME.x, STICK_HOME.y);
      this.knob.setPosition(STICK_HOME.x, STICK_HOME.y);
    };
    scene.input.on('pointerup', release);
    scene.input.on('pointerupoutside', release);
  }

  private button(scene: Phaser.Scene, x: number, y: number, r: number, color: number, key: keyof TouchControls['pressed']): Phaser.GameObjects.Container {
    const disc = scene.add.circle(0, 0, r, color, 0.28).setStrokeStyle(1.8, 0xffffff, 0.75);
    const pad = r * 1.3;
    const box = scene.add
      .container(x, y, [disc])
      .setDepth(DEPTH)
      .setSize(pad * 2, pad * 2)
      .setInteractive();
    box.on('pointerdown', () => {
      this.pressed[key] = true;
      disc.setFillStyle(color, 0.7);
    });
    const up = () => disc.setFillStyle(color, 0.28);
    box.on('pointerup', up).on('pointerout', up);
    return box;
  }

  /** Estado de este cuadro. Los botones cuentan una sola vez por toque. */
  read(): TouchInput {
    const out = { ix: this.ix, iy: this.iy, ...this.pressed };
    this.pressed = { photo: false, use: false, pause: false };
    return out;
  }
}
