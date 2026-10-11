// Sistema de fotografía: encuadre, detección de sujetos y puntaje.

import { PHOTO } from '../config/constants';
import type { PlayerStats } from './Campaign';
import type { Rect } from './Collision';
import type { Guest } from './Guests';

export interface PhotoResult {
  subjects: Guest[];
  /** Sujetos que no habían sido fotografiados recientemente. */
  fresh: number;
  score: number;
  /** Cuenta para el objetivo del evento. */
  valid: boolean;
}

export class PhotoSystem {
  cooldown = 0;

  get ready(): boolean {
    return this.cooldown <= 0;
  }

  update(dt: number): void {
    this.cooldown = Math.max(0, this.cooldown - dt);
  }

  /** Rectángulo de encuadre en el piso, delante del fotógrafo. */
  frame(x: number, y: number, facing: 1 | -1, stats: PlayerStats): Rect {
    const length = PHOTO.length * stats.frameMul;
    const depth = PHOTO.depth * stats.frameMul;
    return { x: facing > 0 ? x + PHOTO.near : x - PHOTO.near - length, y: y - depth, w: length, h: depth * 2 };
  }

  /**
   * Puntúa una foto. Cada sujeto vale más cuanto más cerca y más centrado está;
   * acercarse a los protagonistas y juntar gente en el cuadro es lo que rinde.
   */
  evaluate(frame: Rect, subjects: Guest[], x: number, y: number, now: number, stats: PlayerStats): PhotoResult {
    const values = subjects.map((g) => {
      const fresh = now - g.lastPhotoAt > PHOTO.repeatTime;
      const far = Math.min(1, Math.max(0, (Math.abs(g.x - x) - PHOTO.near) / frame.w));
      const offCenter = Math.min(1, Math.abs(g.y - y) / (frame.h / 2));
      const value = PHOTO.basePerSubject * (1.5 - 0.9 * far) * (1 - 0.4 * offCenter) * (g.main ? PHOTO.mainMul : 1) * (fresh ? 1 : PHOTO.repeatFactor);
      return { g, fresh, value };
    });
    values.sort((a, b) => b.value - a.value);

    const fresh = values.filter((v) => v.fresh).length;
    let score = values.slice(0, PHOTO.maxSubjects).reduce((sum, v) => sum + v.value, 0);
    if (values.some((v) => v.fresh && v.g.main)) score += PHOTO.mainBonus;
    if (fresh >= 5) score += PHOTO.group5;
    else if (fresh >= 3) score += PHOTO.group3;
    score = Math.round((score * stats.scoreMul) / 5) * 5;

    this.cooldown = PHOTO.cooldown * stats.cooldownMul;
    return { subjects, fresh, score, valid: fresh > 0 };
  }
}
