// Accesorios roguelite: al pasar de nivel se ofrecen tres al azar y se elige uno.
// Duran toda la partida. Nombre y descripción: claves `up.<id>.name` y `up.<id>.desc`.

import { run, type RunState } from './Campaign';

export interface UpgradeDef {
  id: string;
  /** Clave de textura del ícono. */
  icon: string;
  apply(r: RunState): void;
  /** No se ofrece mientras esto sea falso (por ejemplo, si ya llevás el consumible). */
  available?(r: RunState): boolean;
}

/** Segundos que la bebida mantiene apagados los láseres. */
export const DRINK_TIME = 9;

export const UPGRADES: UpgradeDef[] = [
  { id: 'shield', icon: 'up_shield', apply: (r) => (r.shield += 1) },
  { id: 'drink', icon: 'up_drink', apply: (r) => (r.item = 'drink'), available: (r) => r.item === null },
  { id: 'flash', icon: 'up_flash', apply: (r) => { r.stats.scoreMul *= 1.3; r.stats.flashPower += 1; } },
  { id: 'wide', icon: 'up_wide', apply: (r) => (r.stats.frameMul *= 1.25) },
  { id: 'shoes', icon: 'up_shoes', apply: (r) => (r.stats.speedMul *= 1.18) },
  { id: 'strap', icon: 'up_strap', apply: (r) => (r.stats.cooldownMul *= 0.7) },
  { id: 'card', icon: 'up_card', apply: (r) => (r.stats.cardBonus += 5) },
];

/** Elige accesorios distintos al azar entre los disponibles. */
export function rollUpgrades(count = 3): UpgradeDef[] {
  const pool = UPGRADES.filter((u) => u.available?.(run) ?? true);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function applyUpgrade(def: UpgradeDef): void {
  def.apply(run);
  run.upgrades.push(def.id);
}
