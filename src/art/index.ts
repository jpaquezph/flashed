// Registro de arte: reúne todas las texturas del juego y las convierte en texturas de Phaser.
// Fondos, utilería e interfaz se generan una sola vez en el arranque. Los personajes de cada
// evento se generan al entrar al evento y se descartan al pasar al siguiente, para no tener
// en memoria el vestuario de toda la campaña a la vez.

import Phaser from 'phaser';
import { RS } from '../config/constants';
import type { ScenarioConfig } from '../config/scenarios/types';
import { ANGRY_POSES, CARD_POSES, GUEST_POSES, GUITAR_POSES, MIC_POSES, OPERATOR_POSES, PHOTOGRAPHER_POSES, VIOLIN_POSES, portraitDef, sheetDef, type Look, type PoseSet } from './character';
import { birthdayTextures } from './birthday';
import { churchTextures } from './church';
import * as L from './looks';
import { sceneTextures } from './scenes';
import type { TexDef } from './svg';
import { uiTextures } from './ui';
import { venueTextures } from './venues';

export const PHOTOGRAPHER_KEY = 'photog';
/** El fotógrafo cuando se queda sin tarjeta: mira la cámara, saca la tarjeta y llora. */
export const PHOTOGRAPHER_SAD = 'photog_sad';
/** Personajes al doble de tamaño para las cinemáticas. */
export const CUTSCENE_PHOTOGRAPHER = 'cs_photog';
export const CUTSCENE_DJ = 'cs_dj';

/** Personajes que se generan a pedido: clave de textura → definición. */
const CHARACTERS = new Map<string, () => TexDef>();

function character(key: string, look: Look, poses: PoseSet = GUEST_POSES, scale?: number): string {
  CHARACTERS.set(key, () => sheetDef(key, look, poses, scale));
  return key;
}

/** Registra los invitados genéricos de un vestuario y devuelve sus claves. */
const wardrobe = (prefix: string, looks: Look[]): string[] => looks.map((look, i) => character(`${prefix}_g${i}`, look));

export const CHURCH_WARDROBE = wardrobe('church', L.CHURCH_GUESTS);
export const BDAY_ADULTS = wardrobe('bday_adult', L.BDAY_ADULT_LOOKS);
export const BDAY_KIDS = wardrobe('bday_child', L.BDAY_KID_LOOKS);
export const QUINCE_GUESTS = wardrobe('quince', L.QUINCE_LOOKS);
export const WEDDING_GUESTS = wardrobe('wedding', L.WEDDING_LOOKS);
export const DISCO_GUESTS = wardrobe('disco', L.DISCO_LOOKS);
export const CONCERT_GUESTS = wardrobe('concert', L.CONCERT_LOOKS);

character('church_pastor', L.CHURCH_PASTOR, MIC_POSES);
character('church_singer', L.CHURCH_SINGER, MIC_POSES);
character('church_guitarist', L.CHURCH_GUITARIST, GUITAR_POSES);
character('church_drummer', L.CHURCH_DRUMMER);
character('church_keys', L.CHURCH_KEYS);
character('church_operator', L.CHURCH_OPERATOR, OPERATOR_POSES);
character('bday_kid', L.BDAY_KID);
character('bday_animator', L.BDAY_ANIMATOR, OPERATOR_POSES);
character('quince_girl', L.QUINCE_GIRL);
character('quince_dj', L.QUINCE_DJ, OPERATOR_POSES);
character('wedding_bride', L.WEDDING_BRIDE);
character('wedding_groom', L.WEDDING_GROOM);
character('wedding_violin_a', L.WEDDING_VIOLIN_A, VIOLIN_POSES);
character('wedding_violin_b', L.WEDDING_VIOLIN_B, VIOLIN_POSES);
character('wedding_dj', L.WEDDING_DJ, OPERATOR_POSES);
character('dj', L.DJ, OPERATOR_POSES);
character('disco_bartender', L.DISCO_BARTENDER);
character('rock_singer', L.ROCK_SINGER, MIC_POSES);
character('rock_guitarist', L.ROCK_GUITARIST, GUITAR_POSES);
character('rock_drummer', L.ROCK_DRUMMER);
character('concert_tech', L.CONCERT_TECH, OPERATOR_POSES);
character(CUTSCENE_PHOTOGRAPHER, L.PHOTOGRAPHER, PHOTOGRAPHER_POSES, 2);
character(CUTSCENE_DJ, L.DJ, ANGRY_POSES, 2);

/** Texturas que viven durante todo el juego. */
function permanentTextureDefs(): TexDef[] {
  return [
    sheetDef(PHOTOGRAPHER_KEY, L.PHOTOGRAPHER, PHOTOGRAPHER_POSES),
    sheetDef(PHOTOGRAPHER_SAD, L.PHOTOGRAPHER, CARD_POSES),
    portraitDef('photog_big', L.PHOTOGRAPHER, PHOTOGRAPHER_POSES.pose0, 3),
    ...churchTextures(),
    ...birthdayTextures(),
    ...venueTextures(),
    ...sceneTextures(),
    ...uiTextures(),
  ];
}

function addSvgTexture(scene: Phaser.Scene, def: TexDef): Promise<void> {
  const px = RS * (def.scale ?? 1);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${def.w * px}" height="${def.h * px}" viewBox="0 0 ${def.w} ${def.h}">` +
    def.body +
    '</svg>';
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Dos pedidos seguidos pueden coincidir en una textura: gana el primero.
      if (!scene.textures.exists(def.key)) {
        const tex = scene.textures.addImage(def.key, img);
        for (const f of def.frames ?? []) tex?.add(f.name, 0, f.x * px, f.y * px, f.w * px, f.h * px);
      }
      resolve();
    };
    img.onerror = () => reject(new Error(`No se pudo generar la textura ${def.key}`));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

/** Genera las texturas permanentes. Se llama una sola vez, desde la escena de arranque. */
export async function buildTextures(scene: Phaser.Scene): Promise<void> {
  await Promise.all(permanentTextureDefs().map((def) => addSvgTexture(scene, def)));
}

const ANIMS: { name: string; frames: string[]; rate: number; repeat: number }[] = [
  { name: 'idle', frames: ['idle0', 'idle1'], rate: 2.2, repeat: -1 },
  { name: 'walk', frames: ['walk0', 'walk1', 'walk2', 'walk3'], rate: 9, repeat: -1 },
  { name: 'sit', frames: ['sit0', 'sit1'], rate: 1.6, repeat: -1 },
  { name: 'pose', frames: ['pose0', 'pose1'], rate: 7, repeat: -1 },
  { name: 'shoot', frames: ['pose0', 'pose1', 'pose1'], rate: 14, repeat: 0 },
  { name: 'hurt', frames: ['hurt'], rate: 1, repeat: 0 },
  { name: 'cheer', frames: ['cheer0', 'cheer1'], rate: 5, repeat: -1 },
  { name: 'up', frames: ['up0', 'up1'], rate: 2.4, repeat: -1 },
];

/** Crea (una sola vez) las animaciones de un spritesheet de personaje: `${clave}:${nombre}`. */
export function ensureCharacterAnims(scene: Phaser.Scene, key: string): void {
  if (scene.anims.exists(`${key}:idle`)) return;
  for (const a of ANIMS) {
    scene.anims.create({
      key: `${key}:${a.name}`,
      frames: a.frames.map((frame) => ({ key, frame })),
      frameRate: a.rate,
      repeat: a.repeat,
    });
  }
}

/** Personajes que necesita un evento: vestuario, chicos que corren y actores. */
export const scenarioCharacters = (cfg: ScenarioConfig): string[] => [
  ...cfg.guests.wardrobe,
  ...(cfg.guests.runners?.wardrobe ?? []),
  ...cfg.actors.map((a) => a.look),
];

const loaded = new Set<string>();
/** Los pedidos se atienden de a uno, en orden. */
let queue: Promise<void> = Promise.resolve();

/**
 * Deja en memoria exactamente los personajes pedidos: descarta los que ya no hacen
 * falta y genera los que faltan. Hay que esperarla antes de crear sus sprites.
 */
export function useCharacters(scene: Phaser.Scene, keys: string[]): Promise<void> {
  queue = queue.catch(() => undefined).then(async () => {
    const wanted = new Set(keys.filter((key) => CHARACTERS.has(key)));
    for (const key of [...loaded]) {
      if (wanted.has(key)) continue;
      for (const a of ANIMS) scene.anims.remove(`${key}:${a.name}`);
      scene.textures.remove(key);
      loaded.delete(key);
    }
    const missing = [...wanted].filter((key) => !loaded.has(key));
    await Promise.all(missing.map((key) => addSvgTexture(scene, CHARACTERS.get(key)!())));
    missing.forEach((key) => loaded.add(key));
  });
  return queue;
}
