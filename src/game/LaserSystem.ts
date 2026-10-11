// Sistema de láseres: haces que barren el piso desde la parrilla de luces.
// Cada patrón avisa antes de activarse, dura un intervalo definido y deja un descanso.
// Un haz que toca los pies del fotógrafo le quema el sensor de la cámara.

import Phaser from 'phaser';
import { LASER } from '../config/constants';
import type { LaserConfig, LaserPattern, LaserWave } from '../config/scenarios/types';

/** Segmento sobre el piso: x1, y1, x2, y2. */
type Seg = [number, number, number, number];
/** Un haz se mueve en línea recta de `from` a `to` mientras está activo. */
interface Beam { from: Seg; to: Seg; color: number }
type Path = Omit<Beam, 'color'>;

export type LaserEvent = 'warn' | 'fire' | null;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export class LaserSystem {
  state: 'idle' | 'warn' | 'active' = 'idle';
  private timer = 0;
  private duration = 1;
  private beams: Beam[] = [];
  private fired = 0;
  private wave: LaserWave | null = null;
  private started = false;
  /** Tramo impuesto desde afuera (fases del jefe): reemplaza al que tocaría por tiempo. */
  override: LaserWave | null = null;
  private blink = 0;
  private readonly floor: Phaser.GameObjects.Graphics;
  private readonly glow: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, private readonly cfg: LaserConfig) {
    // El trazo en el piso queda por debajo de los personajes; el resplandor, por encima.
    this.floor = scene.add.graphics().setDepth(100);
    this.glow = scene.add.graphics().setDepth(3900).setBlendMode(Phaser.BlendModes.ADD);
  }

  // ---------- Patrones ----------

  private hSweep(k: number): Path[] {
    const { area: a, lane } = this.cfg;
    const mid = lane.y + lane.h / 2;
    const top = k % 2 === 0;
    const y0 = top ? a.y : a.y + a.h;
    const y1 = top ? mid - 5 : mid + 5;
    return [{ from: [a.x, y0, a.x + a.w, y0], to: [a.x, y1, a.x + a.w, y1] }];
  }

  /** Barrido de pared a pared con un hueco a la altura del corredor. */
  private vSweep(k: number): Path[] {
    const { area: a, lane } = this.cfg;
    const x0 = k % 2 === 0 ? a.x : a.x + a.w;
    const x1 = k % 2 === 0 ? a.x + a.w : a.x;
    const gapTop = lane.y + 5;
    const gapBottom = lane.y + lane.h - 5;
    return [
      { from: [x0, a.y, x0, gapTop], to: [x1, a.y, x1, gapTop] },
      { from: [x0, gapBottom, x0, a.y + a.h], to: [x1, gapBottom, x1, a.y + a.h] },
    ];
  }

  private diag(k: number): Path[] {
    const { area: a } = this.cfg;
    const r = a.x + a.w;
    const b = a.y + a.h;
    const half = a.x + a.w / 2;
    const segs: Seg[] = k % 2 === 0 ? [[a.x, a.y, r, b], [a.x, b, r, a.y]] : [[a.x, a.y, half, b], [half, a.y, r, b]];
    return segs.map((s) => ({ from: s, to: s }));
  }

  private build(pattern: LaserPattern, k: number): { beams: Path[]; time: number } {
    switch (pattern) {
      case 'hSweep': return { beams: this.hSweep(k), time: LASER.hSweepTime };
      case 'vSweep': return { beams: this.vSweep(k), time: LASER.vSweepTime };
      case 'diag': return { beams: this.diag(k), time: LASER.diagTime };
      case 'combo': return { beams: [...this.hSweep(k), ...this.diag(k + 1)], time: LASER.hSweepTime };
    }
  }

  // ---------- Ciclo ----------

  update(dt: number, elapsed: number): LaserEvent {
    let event: LaserEvent = null;
    const timed = [...this.cfg.waves].reverse().find((w) => elapsed >= w.from) ?? null;
    const wave = timed && (this.override ?? timed);
    this.blink += dt;
    this.timer -= dt;

    if (this.state === 'idle' && wave && (this.timer <= 0 || !this.started)) {
      this.started = true;
      this.wave = wave;
      const built = this.build(wave.patterns[this.fired % wave.patterns.length], Math.floor(this.fired / wave.patterns.length));
      // Cada haz toma un color distinto de la paleta, que rota con cada patrón.
      this.beams = built.beams.map((b, i) => ({ ...b, color: LASER.colors[(this.fired * 2 + i) % LASER.colors.length] }));
      this.fired += 1;
      this.duration = built.time * wave.pace;
      this.state = 'warn';
      this.timer = wave.warn;
      event = 'warn';
    } else if (this.state === 'warn' && this.timer <= 0) {
      this.state = 'active';
      this.timer = this.duration;
      event = 'fire';
    } else if (this.state === 'active' && this.timer <= 0) {
      this.state = 'idle';
      this.timer = this.wave?.rest ?? 0;
    }
    this.draw();
    return event;
  }

  /** Color del patrón en curso, para los avisos. */
  get color(): number {
    return this.beams[0]?.color ?? LASER.colors[0];
  }

  /** Apaga los láseres durante unos segundos (bebida para el DJ). */
  pause(seconds: number): void {
    this.started = true;
    this.state = 'idle';
    this.timer = seconds;
  }

  /** Corta el patrón en curso y pasa al descanso (un flash encandiló a quien maneja las luces). */
  cancel(): boolean {
    if (this.state === 'idle') return false;
    this.state = 'idle';
    this.timer = (this.wave?.rest ?? 2) + 1;
    this.draw();
    return true;
  }

  /** Apaga todo (fin del evento). */
  stop(): void {
    this.state = 'idle';
    this.timer = Infinity;
    this.draw();
  }

  private current(beam: Beam): Seg {
    const t = this.state === 'active' ? 1 - this.timer / this.duration : 0;
    return beam.from.map((v, i) => lerp(v, beam.to[i], t)) as Seg;
  }

  /** ¿Hay un haz activo pasando por este punto del piso? */
  hits(x: number, y: number): boolean {
    if (this.state !== 'active') return false;
    return this.beams.some((beam) => {
      const [x1, y1, x2, y2] = this.current(beam);
      const dx = x2 - x1;
      const dy = y2 - y1;
      const t = Phaser.Math.Clamp(((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy || 1), 0, 1);
      return Math.hypot(x - (x1 + dx * t), y - (y1 + dy * t)) < LASER.hitRadius;
    });
  }

  // ---------- Dibujo ----------

  private draw(): void {
    const floor = this.floor.clear();
    const glow = this.glow.clear();
    if (this.state === 'idle') return;

    for (const beam of this.beams) {
      const color = beam.color;
      const [x1, y1, x2, y2] = this.current(beam);
      if (this.state === 'warn') {
        // Advertencia: recorrido sombreado y línea punteada que parpadea donde va a aparecer el haz.
        const pulse = 0.45 + 0.4 * Math.sin(this.blink * 16);
        const [tx1, ty1, tx2, ty2] = beam.to;
        if (tx1 !== x1 || ty1 !== y1) {
          glow.fillStyle(color, 0.1);
          glow.fillPoints([{ x: x1, y: y1 }, { x: x2, y: y2 }, { x: tx2, y: ty2 }, { x: tx1, y: ty1 }], true);
        }
        const len = Math.hypot(x2 - x1, y2 - y1);
        const ux = (x2 - x1) / len;
        const uy = (y2 - y1) / len;
        glow.lineStyle(1.6, color, pulse);
        for (let d = 0; d < len; d += 10) {
          const e = Math.min(d + 5, len);
          glow.lineBetween(x1 + ux * d, y1 + uy * d, x1 + ux * e, y1 + uy * e);
        }
        continue;
      }
      // Haz activo: trazo brillante en el piso y abanico de luz desde el emisor.
      floor.lineStyle(10, color, 0.25).lineBetween(x1, y1, x2, y2);
      floor.lineStyle(4.4, color, 0.9).lineBetween(x1, y1, x2, y2);
      floor.lineStyle(1.6, 0xffffff, 1).lineBetween(x1, y1, x2, y2);
      const mid = (x1 + x2) / 2;
      const emitter = this.cfg.emitters.reduce((best, e) => (Math.abs(e.x - mid) < Math.abs(best.x - mid) ? e : best));
      glow.fillStyle(color, 0.1 + 0.03 * Math.sin(this.blink * 30));
      glow.fillTriangle(emitter.x, emitter.y, x1, y1, x2, y2);
      glow.lineStyle(3.2, color, 0.6).lineBetween(x1, y1, x2, y2);
      glow.lineStyle(0.8, color, 0.5).lineBetween(emitter.x, emitter.y, x1, y1).lineBetween(emitter.x, emitter.y, x2, y2);
    }
  }
}
