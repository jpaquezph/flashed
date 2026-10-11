// El fotógrafo: control, estados y animaciones.

import Phaser from 'phaser';
import { ensureCharacterAnims, PHOTOGRAPHER_KEY, PHOTOGRAPHER_SAD } from '../art';
import { CELL_H, CELL_W, FOOT_X, FOOT_Y } from '../art/character';
import { COLORS, GUEST, PLAYER, RS } from '../config/constants';
import type { PlayerStats } from './Campaign';
import { isBlocked, moveBody, type Rect } from './Collision';

type State = 'normal' | 'shoot' | 'hurt' | 'cheer' | 'down';

export interface World {
  obstacles: Rect[];
  bounds: Rect;
  /** Personajes que ocupan lugar en el piso. */
  blockers: { x: number; y: number }[];
}

/** Crea un sprite de personaje anclado en los pies. */
export function makeCharacterSprite(scene: Phaser.Scene, key: string, x: number, y: number): Phaser.GameObjects.Sprite {
  ensureCharacterAnims(scene, key);
  return scene.add
    .sprite(x, y, key, 'idle0')
    .setOrigin(FOOT_X / CELL_W, FOOT_Y / CELL_H)
    .setScale(1 / RS)
    .setDepth(y);
}

export class Player {
  readonly sprite: Phaser.GameObjects.Sprite;
  /** Flecha sobre la cabeza: lo ubica de un vistazo entre los invitados. */
  private readonly marker: Phaser.GameObjects.Triangle;
  x: number;
  y: number;
  facing: 1 | -1 = 1;
  private state: State = 'normal';
  private stateTime = 0;
  private invuln = 0;
  private blink = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.sprite = makeCharacterSprite(scene, PHOTOGRAPHER_KEY, x, y);
    this.marker = scene.add.triangle(x, y, -4, 0, 4, 0, 0, 5.5, COLORS.yellow).setStrokeStyle(1.2, COLORS.ink).setDepth(4500);
    this.play('idle');
  }

  get invulnerable(): boolean {
    return this.invuln > 0;
  }

  get canAct(): boolean {
    return this.state === 'normal' || this.state === 'shoot';
  }

  private play(name: string): void {
    this.sprite.play(`${PHOTOGRAPHER_KEY}:${name}`, true);
  }

  update(dt: number, ix: number, iy: number, world: World, stats: PlayerStats): void {
    this.invuln = Math.max(0, this.invuln - dt);
    if (this.state === 'shoot' || this.state === 'hurt') {
      this.stateTime -= dt;
      if (this.stateTime <= 0) this.state = 'normal';
    }

    let moving = false;
    if (this.canAct && (ix !== 0 || iy !== 0)) {
      const len = Math.hypot(ix, iy);
      const speed = PLAYER.speed * stats.speedMul * (this.state === 'shoot' ? PLAYER.shootSlow : 1);
      const before = { x: this.x, y: this.y };
      moveBody(this, (ix / len) * speed * dt, (iy / len) * speed * PLAYER.depthFactor * dt, PLAYER.footW, PLAYER.footH, world.obstacles, world.bounds);
      this.pushOutOf(world, before);
      moving = this.x !== before.x || this.y !== before.y;
      if (ix !== 0 && this.state !== 'shoot') this.facing = ix > 0 ? 1 : -1;
    }

    if (this.state === 'normal') this.play(moving ? 'walk' : 'idle');

    this.blink += dt;
    this.sprite.setPosition(this.x, this.y).setDepth(this.y).setFlipX(this.facing < 0);
    this.sprite.setAlpha(this.invuln > 0 && Math.floor(this.blink * 14) % 2 === 0 ? 0.35 : 1);
    this.marker.setPosition(this.x + 4, this.y - 60 + Math.sin(this.blink * 6) * 1.5);
  }

  /** Evita atravesar a los invitados: si el empujón deja al fotógrafo en un lugar inválido, se deshace el paso. */
  private pushOutOf(world: World, before: { x: number; y: number }): void {
    const min = PLAYER.bodyRadius + GUEST.radius;
    for (const b of world.blockers) {
      const dx = this.x - b.x;
      const dy = (this.y - b.y) * GUEST.depthSquash;
      const dist = Math.hypot(dx, dy);
      if (dist >= min) continue;
      const beforeDist = Math.hypot(before.x - b.x, (before.y - b.y) * GUEST.depthSquash);
      if (dist >= beforeDist) continue; // ya estaba encima: se lo deja salir
      const nx = dist < 0.01 ? 1 : dx / dist;
      const ny = dist < 0.01 ? 0 : dy / dist;
      const px = b.x + nx * min;
      const py = b.y + (ny * min) / GUEST.depthSquash;
      if (isBlocked(px, py, PLAYER.footW, PLAYER.footH, world.obstacles, world.bounds)) {
        this.x = before.x;
        this.y = before.y;
      } else {
        this.x = px;
        this.y = py;
      }
    }
  }

  shoot(): void {
    this.state = 'shoot';
    this.stateTime = PLAYER.shootTime;
    this.play('shoot');
  }

  hurt(): void {
    this.state = 'hurt';
    this.stateTime = PLAYER.hurtTime;
    this.invuln = PLAYER.invulnTime;
    this.play('hurt');
  }

  moveTo(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  cheer(): void {
    this.state = 'cheer';
    this.invuln = 0;
    this.sprite.setAlpha(1);
    this.play('cheer');
  }

  /**
   * Tarjeta llena y fotos insuficientes: mira la cámara, saca la tarjeta y llora.
   * `onCry` avisa cuando empieza el llanto.
   */
  mourn(scene: Phaser.Scene, onCry: () => void): void {
    this.state = 'down';
    this.invuln = 0;
    this.sprite.setAlpha(1);
    ensureCharacterAnims(scene, PHOTOGRAPHER_SAD);
    const frame = (name: string) => {
      this.sprite.anims.stop();
      this.sprite.setTexture(PHOTOGRAPHER_SAD, name);
    };
    scene.time.delayedCall(900, () => this.sprite.play(`${PHOTOGRAPHER_SAD}:idle`));
    scene.time.delayedCall(2100, () => frame('pose0'));
    scene.time.delayedCall(2600, () => frame('pose1'));
    scene.time.delayedCall(3700, () => {
      this.sprite.play(`${PHOTOGRAPHER_SAD}:cheer`);
      onCry();
    });
  }

  defeat(): void {
    this.state = 'down';
    this.invuln = 0;
    this.sprite.setAlpha(1);
    this.play('hurt');
  }
}
