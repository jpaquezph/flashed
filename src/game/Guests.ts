// Gestión de invitados y actores del evento: personas que participan de la fiesta
// y que, sin querer, le complican el trabajo al fotógrafo.

import Phaser from 'phaser';
import { rng } from '../art/svg';
import { GUEST, PLAYER } from '../config/constants';
import type { CrowdAnim, Point, ScenarioConfig } from '../config/scenarios/types';
import { isBlocked, pointInRect, type Rect } from './Collision';
import { makeCharacterSprite } from './Player';

type Mode = 'seated' | 'standing' | 'wander' | 'actor';
type Anim = 'idle' | 'walk' | 'sit' | 'pose' | 'up' | 'cheer' | 'hurt';

export class Guest {
  readonly sprite: Phaser.GameObjects.Sprite;
  x: number;
  y: number;
  facing: 1 | -1;
  /** Momento del evento en que fue fotografiado por última vez. */
  lastPhotoAt = -999;
  poseTime = 0;
  /** Recorrido pendiente (deambular o movimiento guionado). */
  path: Point[] = [];
  wait = 0;
  stuck = 0;
  /** Animación forzada por un momento del evento. */
  scriptAnim: Anim | null = null;
  /** Animación de reposo (los que bailan no se quedan quietos). */
  baseAnim: Anim = 'idle';
  /** Tiempo que le queda encandilado por un flash (jefe). */
  hurtTime = 0;
  /** Multiplicadores propios de velocidad y de pausa (los que corren). */
  speedMul = 1;
  pauseMul = 1;
  /** Áreas propias por las que deambula; si no tiene, usa las del escenario. */
  roam: Rect[] | null = null;
  /** Convocado por un momento del evento: deja de deambular hasta que lo liberan. */
  held = false;
  readonly home: Point;
  private current = '';

  constructor(
    scene: Phaser.Scene,
    readonly key: string,
    x: number,
    y: number,
    facing: 1 | -1,
    readonly mode: Mode,
    readonly id: string | null = null,
    readonly main = false,
  ) {
    this.x = x;
    this.y = y;
    this.facing = facing;
    this.home = { x, y };
    this.sprite = makeCharacterSprite(scene, key, x, y);
    this.sprite.anims.timeScale = 0.8 + Math.random() * 0.4;
    this.play(this.restAnim);
    this.sync();
  }

  get restAnim(): Anim {
    return this.mode === 'seated' ? 'sit' : (this.scriptAnim ?? this.baseAnim);
  }

  play(anim: Anim): void {
    if (this.current === anim) return;
    this.current = anim;
    this.sprite.play(`${this.key}:${anim}`, true);
  }

  sync(): void {
    this.sprite.setPosition(this.x, this.y).setDepth(this.y).setFlipX(this.facing < 0);
  }
}

export class GuestManager {
  readonly guests: Guest[] = [];
  private readonly random: () => number;
  private readonly speed: number;

  constructor(scene: Phaser.Scene, private readonly cfg: ScenarioConfig, private readonly obstacles: Rect[]) {
    const g = cfg.guests;
    this.random = rng(g.seed);
    this.speed = GUEST.speed * cfg.difficulty.guestSpeedMul;
    // Cada vestuario se reparte como un mazo con dos copias de cada personaje:
    // en una misma escena nadie aparece más de dos veces.
    const deck = (pool: string[]) => {
      let cards: string[] = [];
      return () => {
        if (cards.length === 0) {
          cards = [...pool, ...pool];
          for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
          }
        }
        return cards.pop()!;
      };
    };
    const look = deck(g.wardrobe);

    for (const s of g.seats) {
      if (this.random() < g.seatOccupancy) this.guests.push(new Guest(scene, look(), s.x, s.y, s.facing, 'seated'));
    }
    for (const s of g.standing) this.guests.push(new Guest(scene, look(), s.x, s.y, s.facing, 'standing'));
    for (let i = 0; i < g.wanderers; i++) {
      const p = this.randomPoint(g.roam[i % g.roam.length]);
      const w = new Guest(scene, look(), p.x, p.y, this.random() < 0.5 ? 1 : -1, 'wander');
      w.wait = 0.5 + this.random() * 3;
      this.guests.push(w);
    }
    (g.dancing ?? []).forEach((s, i) => {
      const dancer = new Guest(scene, look(), s.x, s.y, s.facing, 'standing');
      dancer.baseAnim = i % 2 ? 'cheer' : 'up';
      dancer.play(dancer.baseAnim);
      this.guests.push(dancer);
    });
    const run = g.runners;
    const makeRunner = (guest: Guest) => {
      if (!run) return;
      guest.speedMul = run.speedMul;
      guest.pauseMul = run.pauseMul;
      guest.roam = run.roam;
      guest.wait = this.random() * 2;
    };
    const runnerLook = deck(run?.wardrobe ?? []);
    for (let i = 0; i < (run?.count ?? 0); i++) {
      const p = this.randomPoint(run!.roam[i % run!.roam.length]);
      const kid = new Guest(scene, runnerLook(), p.x, p.y, 1, 'wander');
      makeRunner(kid);
      this.guests.push(kid);
    }
    for (const a of cfg.actors) {
      const mode = a.seated ? 'seated' : a.runner ? 'wander' : 'actor';
      const actor = new Guest(scene, a.look, a.x, a.y, a.facing, mode, a.id, a.main ?? false);
      if (a.runner) makeRunner(actor);
      this.guests.push(actor);
    }
  }

  byId(id: string): Guest | undefined {
    return this.guests.find((g) => g.id === id);
  }

  /** Invitados que ocupan lugar en el piso (los sentados ya están dentro de un banco). */
  blockers(): Guest[] {
    return this.guests.filter((g) => g.mode !== 'seated');
  }

  inRect(r: Rect): Guest[] {
    return this.guests.filter((g) => pointInRect(r, g.x, g.y));
  }

  private randomPoint(r: Rect): Point {
    return { x: r.x + this.random() * r.w, y: r.y + this.random() * r.h };
  }

  /** Elige un destino y arma el recorrido; si cambia de área, cruza por el área de paso. */
  private plan(g: Guest): void {
    const hub = g.roam ? undefined : this.cfg.guests.hub;
    const roam = g.roam ?? this.cfg.guests.roam;
    const from = roam.findIndex((r) => pointInRect(r, g.x, g.y));
    const to = Math.floor(this.random() * roam.length);
    const target = this.randomPoint(roam[to]);
    g.path = [];
    if (hub && from !== to) {
      const laneY = hub.y + this.random() * hub.h;
      g.path.push({ x: g.x, y: laneY }, { x: target.x, y: laneY });
    }
    g.path.push(target);
  }

  update(dt: number, player: Point): void {
    for (const g of this.guests) {
      if (g.hurtTime > 0) {
        g.hurtTime -= dt;
        g.play('hurt');
        continue;
      }
      if (g.poseTime > 0) {
        g.poseTime -= dt;
        g.play(g.mode === 'seated' ? 'sit' : 'pose');
        continue;
      }
      if (g.mode === 'wander' && g.path.length === 0 && !g.held) {
        if (g.wait > 0) {
          g.wait -= dt;
          g.play('idle');
          continue;
        }
        this.plan(g);
      }
      if (g.path.length > 0) this.walk(g, dt, player);
      else g.play(g.restAnim);
      g.sync();
    }
  }

  private walk(g: Guest, dt: number, player: Point): void {
    const target = g.path[0];
    const dx = target.x - g.x;
    const dy = target.y - g.y;
    const dist = Math.hypot(dx, dy);
    const scripted = g.mode === 'actor' || g.held;
    const step = this.speed * (scripted ? 1.5 : 1) * g.speedMul * dt;
    if (dist <= step) {
      g.x = target.x;
      g.y = target.y;
      g.path.shift();
      if (g.path.length === 0 && !scripted) g.wait = (GUEST.pauseMin + this.random() * (GUEST.pauseMax - GUEST.pauseMin)) * g.pauseMul;
      return;
    }
    const nx = g.x + (dx / dist) * step;
    const ny = g.y + (dy / dist) * step * PLAYER.depthFactor;

    // No empujan al fotógrafo: si está en el camino, esperan y después cambian de rumbo.
    const min = PLAYER.bodyRadius + GUEST.radius + 1;
    const near = (x: number, y: number) => Math.hypot(player.x - x, (player.y - y) * GUEST.depthSquash);
    const crowding = near(nx, ny) < min && near(nx, ny) < near(g.x, g.y);
    const wall = !scripted && isBlocked(nx, ny, PLAYER.footW, PLAYER.footH, this.obstacles, this.cfg.bounds);
    if (crowding || wall) {
      g.stuck += dt;
      g.play('idle');
      if (g.stuck > GUEST.stuckTime && !scripted) {
        g.stuck = 0;
        g.path = [];
        g.wait = 0.4 + this.random();
      }
      return;
    }
    g.stuck = 0;
    g.x = nx;
    g.y = ny;
    if (Math.abs(dx) > 0.5) g.facing = dx > 0 ? 1 : -1;
    g.play('walk');
  }

  /** Los fotografiados posan un momento. */
  photographed(subjects: Guest[], now: number): void {
    for (const g of subjects) {
      g.lastPhotoAt = now;
      // Los actores en plena escena no interrumpen lo que están haciendo.
      if (!g.scriptAnim && !(g.mode === 'actor' && g.path.length > 0)) g.poseTime = GUEST.poseTime;
    }
  }

  /** El público de pie acompaña un momento del evento (brazos en alto, festejo). */
  setCrowdAnim(anim: CrowdAnim | null): void {
    for (const g of this.guests) if (g.mode === 'standing') g.scriptAnim = anim;
  }

  /** Movimiento guionado de un actor hacia un punto. */
  sendTo(id: string, p: Point): void {
    const g = this.byId(id);
    if (!g) return;
    g.path = [{ ...p }];
    g.held = true;
  }

  /** Termina el movimiento guionado: vuelve a su lugar o, si es de los que corren, sigue corriendo. */
  release(id: string): void {
    const g = this.byId(id);
    if (!g) return;
    if (g.mode === 'wander') {
      g.held = false;
      g.path = [];
    } else {
      g.path = [{ ...g.home }];
    }
  }
}
