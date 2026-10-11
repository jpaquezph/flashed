// Forma de la configuración de un escenario. Cada evento de la campaña es un objeto
// de este tipo: la lógica del juego no cambia de un escenario a otro.

import type { TrackId } from '../../audio/Music';
import type { Rect } from '../../game/Collision';

export interface Point { x: number; y: number }

export interface PropDef {
  /** Clave de textura. */
  key: string;
  /** Esquina superior izquierda de la imagen, en coordenadas lógicas. */
  x: number;
  y: number;
  /** Profundidad de dibujo (coordenada y del piso que ocupa). */
  depth: number;
  /** Zona sólida a nivel del piso. */
  collide?: Rect;
  /** Espeja la imagen horizontalmente. */
  flip?: boolean;
}

export interface SpotDef extends Point {
  facing: 1 | -1;
}

export interface ActorDef extends SpotDef {
  /** Identificador usado por momentos y objetivos. */
  id: string;
  /** Clave de textura del personaje. */
  look: string;
  /** Sujeto principal: vale más en las fotos. */
  main?: boolean;
  seated?: boolean;
  /** No se queda quieto: corre por el salón como los chicos, salvo cuando un momento lo convoca. */
  runner?: boolean;
}

export type CrowdAnim = 'up' | 'cheer';

export interface MomentDef {
  id: string;
  nameKey: string;
  /** Segundo del evento en el que empieza. Si su objetivo queda sin cumplir, el momento se repite más adelante. */
  at: number;
  duration: number;
  /** Segundos de aviso previo. */
  warn: number;
  /** Qué hacen los actores mientras dura. Al terminar vuelven a su lugar. */
  actions: { actor: string; anim?: CrowdAnim; moveTo?: Point }[];
  /** Animación del público de pie mientras dura. */
  crowd?: CrowdAnim;
}

export type SpecialDef =
  | { id: string; textKey: string; type: 'moment'; moment: string; actors: string[] }
  /** Alcanza con que los actores salgan en una foto, en cualquier momento. */
  | { id: string; textKey: string; type: 'actor'; actors: string[] }
  | { id: string; textKey: string; type: 'group'; count: number };

export interface ZoneDef {
  rect: Rect;
  /** Adónde vuelve el fotógrafo cuando lo sacan de la zona. */
  eject: Point;
}

export type LaserPattern = 'hSweep' | 'vSweep' | 'diag' | 'combo';

/** Tramo de dificultad de los láseres: rige desde el segundo `from` hasta el tramo siguiente. */
export interface LaserWave {
  from: number;
  /** Patrones que se repiten en orden. */
  patterns: LaserPattern[];
  /** Descanso entre patrones, en segundos. */
  rest: number;
  /** Duración de la advertencia. */
  warn: number;
  /** Multiplicador de la duración de cada patrón (menor = barridos más rápidos). */
  pace: number;
}

export interface LaserConfig {
  /** Aparatos de la parrilla de luces desde los que salen los haces. */
  emitters: Point[];
  /** Actor que maneja las luces: se ríe cada vez que los prende. */
  operator?: string;
  /** Zona del piso que barren. */
  area: Rect;
  /** Corredor siempre transitable: los huecos de los barridos caen acá. */
  lane: Rect;
  waves: LaserWave[];
}

export interface BossConfig {
  /** Actor que hace de jefe. */
  actor: string;
  hp: number;
  /** Tramo horizontal por el que se mueve a partir de la segunda fase. */
  patrol: [number, number];
  /** Láseres de cada fase; se pasa de fase al perder un tercio de la vida. */
  phases: LaserWave[];
}

export interface ScenarioConfig {
  id: string;
  nameKey: string;
  descKey: string;
  /** Nombre de la fase cuando no hay un momento especial en curso. */
  phaseKey: string;
  background: string;
  music: TrackId;
  /** Límites del piso transitable (posición de los pies). */
  bounds: Rect;
  props: PropDef[];
  /** Zonas sólidas sin utilería propia (tarimas, paredes). */
  solids: Rect[];
  /** Zonas restringidas: permanecer en ellas cuesta resistencia. */
  zones: ZoneDef[];
  playerStart: Point;
  exit: Point;

  guests: {
    /** Texturas de invitados genéricos entre las que se elige. */
    wardrobe: string[];
    seats: SpotDef[];
    /** Proporción de asientos ocupados (0 a 1). */
    seatOccupancy: number;
    standing: SpotDef[];
    wanderers: number;
    /** Áreas por las que deambulan. */
    roam: Rect[];
    /** Área de paso que conecta las demás: los invitados cruzan por acá. */
    hub?: Rect;
    /** Invitados que corren: más rápidos, con pausas cortas y vestuario propio. */
    /** Invitados que bailan en el lugar. */
    dancing?: SpotDef[];
    runners?: { count: number; wardrobe: string[]; speedMul: number; pauseMul: number; roam: Rect[] };
    seed: number;
  };
  actors: ActorDef[];
  moments: MomentDef[];

  objectives: {
    /** Fotos válidas mínimas. Para salir hay que llegar a este mínimo y cumplir todos los objetivos de `specials`. */
    requiredPhotos: number;
    /** Capacidad de la tarjeta de memoria: disparos totales permitidos. */
    cardCapacity: number;
    specials: SpecialDef[];
    /** Textos propios para la intro ({n}) y para el contador, si no son fotos válidas comunes. */
    requiredKey?: string;
    counterKey?: string;
  };
  hazards: {
    lasers: LaserConfig | null;
  };
  /** Pelea contra un jefe: las fotos le sacan vida en lugar de sumar para el evento. */
  boss?: BossConfig;
  difficulty: {
    /** Duración del evento en segundos. */
    timeLimit: number;
    guestSpeedMul: number;
    /** Impactos que aguanta el sensor en este evento (por defecto, el valor general). */
    sensor?: number;
  };
}
