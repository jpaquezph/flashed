import { TABLET, TOUCH } from '../device';

// Constantes centrales de balance. Todo lo que afecta movimiento, puntaje,
// dificultad y tiempos vive acá para poder ajustarlo sin tocar la lógica.

/** Resolución lógica del área de juego. */
export const GAME_W = 480;
export const GAME_H = 270;
/**
 * Factor de render: el canvas interno mide GAME_W*RS × GAME_H*RS para que el arte vectorial se vea nítido.
 * En teléfonos se usa un factor menor: la pantalla es más chica y así se gasta menos memoria.
 * Las tabletas, con pantalla grande, usan el mismo que una computadora.
 */
export const RS = TOUCH && !TABLET ? 3 : 4;

export const FONT = '"Arial Black", "Segoe UI Black", Impact, "Helvetica Neue", sans-serif';

export const COLORS = {
  ink: 0x120e1c,
  panel: 0x1b1630,
  yellow: 0xffd23f,
  pink: 0xff4f8b,
  cyan: 0x4fe0ff,
  red: 0xff3b5c,
  green: 0x5be37a,
  white: 0xffffff,
};

export const PLAYER = {
  speed: 82, // px/s en horizontal
  depthFactor: 0.72, // el movimiento en profundidad es algo más lento
  footW: 10,
  footH: 5,
  bodyRadius: 5,
  shootTime: 0.24, // duración de la pose de disparo
  shootSlow: 0.4, // multiplicador de velocidad mientras dispara
  hurtTime: 0.4,
  invulnTime: 1.6,
  /** Impactos de láser que aguanta el sensor de la cámara. */
  sensor: 3,
};

export const PHOTO = {
  near: 8, // distancia desde el fotógrafo hasta el inicio del encuadre
  length: 88, // largo del encuadre
  depth: 28, // media altura del encuadre (profundidad)
  cooldown: 0.7,
  viewfinderTime: 0.32,
  repeatTime: 7, // segundos durante los que un sujeto ya fotografiado cuenta como repetido
  repeatFactor: 0.25,
  basePerSubject: 20,
  maxSubjects: 5,
  mainMul: 2,
  mainBonus: 60,
  group3: 40,
  group5: 90,
  specialBonus: 150,
  highlightScore: 170, // a partir de este puntaje la foto es "destacada"
};

export const GUEST = {
  speed: 22,
  radius: 6,
  depthSquash: 1.5, // las distancias en profundidad pesan más (elipse de contacto)
  poseTime: 0.9, // cuánto posa un invitado al ser fotografiado
  pauseMin: 1.5,
  pauseMax: 4,
  stuckTime: 0.8,
};

export const ZONE = {
  grace: 1.4, // segundos dentro de una zona restringida antes de perder resistencia
  decay: 1.2,
};

export const LASER = {
  hitRadius: 3.5, // distancia de los pies al haz a la que quema
  /** Colores entre los que rotan los haces. */
  colors: [0x39ff6a, 0xff3bd4, 0x3bd4ff, 0xff5a3b, 0xffe03b],
  // Duración base de cada patrón activo, en segundos.
  hSweepTime: 3.4,
  vSweepTime: 4.6,
  diagTime: 2.4,
};

export const SCORE = {
  timeBonusPerSec: 5,
  sensorBonus: 100,
};
