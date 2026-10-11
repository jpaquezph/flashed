// Progresión de campaña: estado de la partida en curso.

import { PLAYER } from '../config/constants';
import { CAMPAIGN } from '../config/scenarios';
import type { ScenarioConfig } from '../config/scenarios/types';

/** Valores que los accesorios modifican durante la partida. */
export interface PlayerStats {
  speedMul: number;
  frameMul: number;
  cooldownMul: number;
  scoreMul: number;
  /** Disparos extra en la tarjeta de memoria. */
  cardBonus: number;
  /** Daño extra de cada foto al jefe. */
  flashPower: number;
}

export interface RunState {
  index: number;
  score: number;
  /** Estado del sensor de la cámara: cada impacto de láser quema una parte. */
  sensor: number;
  maxSensor: number;
  /** Accesorios elegidos en esta partida. */
  upgrades: string[];
  /** Objeto consumible equipado (se usa con E). */
  item: string | null;
  /** Cotillones protectores: cada uno absorbe un impacto de láser. */
  shield: number;
  stats: PlayerStats;
}

function freshRun(): RunState {
  return {
    index: 0,
    score: 0,
    sensor: PLAYER.sensor,
    maxSensor: PLAYER.sensor,
    upgrades: [],
    item: null,
    shield: 0,
    stats: { speedMul: 1, frameMul: 1, cooldownMul: 1, scoreMul: 1, cardBonus: 0, flashPower: 0 },
  };
}

export let run: RunState = freshRun();

export function newRun(): void {
  run = freshRun();
}

export const currentScenario = (): ScenarioConfig => CAMPAIGN[run.index];
export const hasNextScenario = (): boolean => run.index + 1 < CAMPAIGN.length;

export function advanceScenario(): void {
  run.index += 1;
}

/** El sensor se cambia por uno nuevo al empezar cada evento. */
export function startScenario(): void {
  run.maxSensor = currentScenario().difficulty.sensor ?? PLAYER.sensor;
  run.sensor = run.maxSensor;
}
