// Cinemáticas: el fotógrafo preparándose antes del primer evento y el desenlace
// después de vencer al DJ. Las dos se pueden saltar.

import Phaser from 'phaser';
import { CUTSCENE_DJ, CUTSCENE_PHOTOGRAPHER, useCharacters } from '../art';
import { ROOM_DOOR } from '../art/scenes';
import { playMusic } from '../audio/Music';
import { playSfx, playVoice } from '../audio/Sfx';
import { COLORS, GAME_H, GAME_W, RS } from '../config/constants';
import { makeCharacterSprite } from '../game/Player';
import { t } from '../i18n';
import { burn, label, onTap, setupCamera } from '../ui/widgets';
import type { LevelResult } from './GameScene';

/** Los personajes de las cinemáticas se dibujan al doble de tamaño. */
const FLOOR_Y = 236;
const TYPE_DELAY = 38;
/** Tono de la voz en morse de cada personaje. */
const VOICE = { photographer: 640, dj: 210 };

abstract class Cutscene extends Phaser.Scene {
  private over = false;

  /** Escena a la que se pasa al terminar o al saltar la cinemática. */
  protected abstract next(): void;
  protected abstract build(): void;

  create(): void {
    setupCamera(this);
    this.over = false;
    const hint = label(this, GAME_W - 6, GAME_H - 14, t('cs.skip'), 6, { align: 'right', color: '#ffd23f' }).setDepth(9000);
    this.tweens.add({ targets: hint, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 });

    const kb = this.input.keyboard!;
    for (const key of ['SPACE', 'ENTER', 'ESC']) kb.on(`keydown-${key}`, () => this.finish());
    onTap(this, () => this.finish());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => kb.removeAllListeners());

    void useCharacters(this, [CUTSCENE_PHOTOGRAPHER, CUTSCENE_DJ]).then(() => {
      if (!this.over && this.scene.isActive()) this.build();
    });
  }

  protected finish(): void {
    if (this.over) return;
    this.over = true;
    this.cameras.main.fadeOut(260, 13, 10, 20);
    this.time.delayedCall(280, () => this.next());
  }

  protected actor(key: string, x: number, facing: 1 | -1): Phaser.GameObjects.Sprite {
    return makeCharacterSprite(this, key, x, FLOOR_Y).setFlipX(facing < 0);
  }

  /** Humo que sube desde un punto, mientras dure la escena. */
  protected smoke(x: number, y: number, spread: number, depth: number): Phaser.Time.TimerEvent {
    return this.time.addEvent({
      delay: 170,
      loop: true,
      callback: () => {
        const puff = this.add.circle(x + (Math.random() - 0.5) * spread, y, 2.5 + Math.random() * 3, 0xb9b3cf, 0.6).setDepth(depth);
        this.tweens.add({ targets: puff, y: y - 34 - Math.random() * 16, x: puff.x + 10, scale: 2.6, alpha: 0, duration: 1300, onComplete: () => puff.destroy() });
      },
    });
  }

  /**
   * Globo de diálogo que se escribe letra por letra, con una voz en código morse.
   * `tailX` es la posición horizontal de quien habla.
   */
  protected say(x: number, y: number, w: number, text: string, pitch: number, tailX: number, onDone?: () => void): Phaser.GameObjects.Container {
    const body = label(this, x + 7, y + 4, text, 7.5, { color: '#120e1c', stroke: 0, wrap: w - 14 });
    const h = body.height + 8;
    body.setText('');
    const g = this.add.graphics();
    g.fillStyle(COLORS.ink, 1).fillRoundedRect(x - 2, y - 2, w + 4, h + 4, 8);
    g.fillStyle(COLORS.ink, 1).fillTriangle(tailX - 8, y + h, tailX + 8, y + h, tailX - 1, y + h + 14);
    g.fillStyle(0xffffff, 1).fillRoundedRect(x, y, w, h, 6.5);
    g.fillStyle(0xffffff, 1).fillTriangle(tailX - 5, y + h - 1, tailX + 5, y + h - 1, tailX - 1, y + h + 9.5);
    const bubble = this.add.container(0, 0, [g, body]).setDepth(8000).setAlpha(0);
    this.tweens.add({ targets: bubble, alpha: 1, duration: 140 });

    let shown = 0;
    const typing = this.time.addEvent({
      delay: TYPE_DELAY,
      loop: true,
      callback: () => {
        shown += 1;
        body.setText(text.slice(0, shown));
        const ch = text[shown - 1];
        if (shown % 2 === 0 && ch !== ' ') playVoice(pitch);
        if (shown >= text.length) {
          typing.remove();
          onDone?.();
        }
      },
    });
    return bubble;
  }
}

/** Antes del primer evento: el fotógrafo se prepara, recuerda la cámara quemada y sale. */
export class PrologueScene extends Cutscene {
  constructor() {
    super('Prologue');
  }

  protected next(): void {
    this.scene.start('Intro');
  }

  protected build(): void {
    playMusic('prep');
    const key = CUTSCENE_PHOTOGRAPHER;
    this.add.image(0, 0, 'cs_room').setOrigin(0).setScale(1 / RS);
    const door = this.add.image(ROOM_DOOR.x, ROOM_DOOR.y, 'cs_door_open').setOrigin(0).setScale(1 / RS).setVisible(false);
    const flash = this.add.image(0, 0, 'fx_flash').setDepth(4000).setVisible(false);
    const white = this.add.rectangle(0, 0, GAME_W, GAME_H, COLORS.white, 0).setOrigin(0).setDepth(7000);
    const p = this.actor(key, 92, 1);

    // Camina hasta el centro del estudio y prueba el flash.
    p.play(`${key}:walk`);
    this.tweens.add({
      targets: p, x: 212, duration: 1500,
      onComplete: () => {
        p.play(`${key}:idle`);
        this.time.delayedCall(350, () => {
          p.play(`${key}:shoot`);
          playSfx('shutter');
          flash.setPosition(p.x + 30, p.y - 92).setVisible(true).setAlpha(1).setScale(0.6 / RS);
          this.tweens.add({ targets: flash, scale: 2.4 / RS, alpha: 0, angle: 40, duration: 320 });
          white.setAlpha(0.45);
          this.tweens.add({ targets: white, alpha: 0, duration: 320 });
        });
        this.time.delayedCall(1000, () => {
          p.play(`${key}:idle`);
          this.remember();
          const bubble = this.say(92, 58, 206, t('cs.intro'), VOICE.photographer, p.x + 4, () => this.time.delayedCall(2300, () => leave(bubble)));
        });
      },
    });

    const leave = (bubble: Phaser.GameObjects.Container) => {
      this.memoryFx.forEach((fx) => fx.remove());
      this.tweens.add({ targets: [bubble, ...this.memory], alpha: 0, duration: 200 });
      p.play(`${key}:walk`);
      this.tweens.add({
        targets: p, x: ROOM_DOOR.x + 14, duration: 1900,
        onComplete: () => {
          door.setVisible(true);
          playSfx('door');
          this.tweens.add({ targets: p, x: ROOM_DOOR.x + 30, alpha: 0, duration: 520, onComplete: () => this.finish() });
        },
      });
    };
  }

  private memory: Phaser.GameObjects.GameObject[] = [];
  private memoryFx: Phaser.Time.TimerEvent[] = [];

  /** Recuadro con el recuerdo: él con la cámara colgada y un láser que se la prende fuego. */
  private remember(): void {
    const x = 316;
    const y = 22;
    const w = 142;
    const h = 108;
    const key = CUTSCENE_PHOTOGRAPHER;
    const g = this.add.graphics().setDepth(7500);
    g.fillStyle(COLORS.ink, 1).fillRoundedRect(x - 2, y - 2, w + 4, h + 4, 7);
    g.fillStyle(COLORS.yellow, 1).fillRoundedRect(x, y, w, h, 6);
    g.fillStyle(0x1a1030, 1).fillRoundedRect(x + 2, y + 2, w - 4, h - 4, 4.5);
    g.fillStyle(0x3a2a5e, 1).fillRect(x + 2, y + h - 22, w - 4, 20);

    // El fotógrafo del recuerdo, a 1,5 veces el tamaño del juego.
    const k = 1.5;
    const feet = { x: x + 58, y: y + h - 10 };
    const me = makeCharacterSprite(this, key, feet.x, feet.y).setScale(k / (RS * 2)).setDepth(7501).setFrame('cheer0');
    const cam = { x: feet.x + 4.5 * k, y: feet.y - 20 * k };
    const beam = this.add.graphics().setDepth(7503).setBlendMode(Phaser.BlendModes.ADD);
    this.memory = [g, me, beam];
    this.memoryFx = [];
    for (const o of [g, me]) o.setAlpha(0);
    this.tweens.add({ targets: [g, me], alpha: 1, duration: 220 });

    // El láser baja barriendo hasta dar en la cámara.
    const from = { x: x + w - 8, y: y + 8 };
    const start = { x: x + w - 12, y: y + h - 12 };
    const draw = (tx: number, ty: number, alpha: number) => {
      beam.clear();
      beam.lineStyle(5, 0x39ff6a, 0.25 * alpha).lineBetween(from.x, from.y, tx, ty);
      beam.lineStyle(1.8, 0x39ff6a, alpha).lineBetween(from.x, from.y, tx, ty);
      beam.lineStyle(0.7, 0xffffff, alpha).lineBetween(from.x, from.y, tx, ty);
    };
    const sweep = { t: 0 };
    this.tweens.add({
      targets: sweep, t: 1, delay: 500, duration: 800, ease: 'Sine.easeIn',
      onUpdate: () => draw(start.x + (cam.x - start.x) * sweep.t, start.y + (cam.y - start.y) * sweep.t, 1),
      onComplete: () => {
        if (this.memory[0] !== g) return;
        me.setFrame('hurt');
        const burnt = { x: feet.x + 2 * k, y: feet.y - 19 * k };
        playSfx('hit');
        playSfx('fizz');
        this.memoryFx = [
          burn(this, burnt.x, burnt.y, 7504, 2.1),
          this.smoke(burnt.x, burnt.y - 14, 10, 7502),
          this.time.addEvent({ delay: 70, loop: true, callback: () => draw(burnt.x, burnt.y, 0.55 + Math.random() * 0.45) }),
        ];
      },
    });
  }
}

/** Después del jefe: la máquina de láseres fundida, el DJ furioso y el fotógrafo riéndose. */
export class EndingScene extends Cutscene {
  private result: LevelResult | null = null;

  constructor() {
    super('Ending');
  }

  init(data: LevelResult): void {
    this.result = data && 'win' in data ? data : null;
  }

  protected next(): void {
    if (this.result) this.scene.start('Result', this.result);
    else this.scene.start('Menu');
  }

  protected build(): void {
    playMusic('win');
    this.add.image(0, 0, 'boss_bg').setOrigin(0).setScale(1 / RS);
    this.add.rectangle(0, 0, GAME_W, GAME_H, COLORS.ink, 0.5).setOrigin(0);

    // La máquina quemada, en el medio de la pista.
    const machine = this.add.image(246, FLOOR_Y + 4, 'cs_machine').setOrigin(0.5, 74 / 80).setScale(1.7 / (RS * 2)).setDepth(FLOOR_Y - 2);
    this.tweens.add({ targets: machine, angle: { from: -1.2, to: 1.2 }, duration: 120, yoyo: true, repeat: -1 });
    this.smoke(246, FLOOR_Y - 96, 60, FLOOR_Y + 1);
    playSfx('fizz');
    this.time.addEvent({
      delay: 900,
      loop: true,
      callback: () => {
        const spark = this.add.star(216 + Math.random() * 60, FLOOR_Y - 70 - Math.random() * 30, 4, 1.5, 5, 0xffe03b).setDepth(FLOOR_Y + 2);
        this.tweens.add({ targets: spark, scale: 0, angle: 90, y: spark.y + 14, duration: 420, onComplete: () => spark.destroy() });
        if (Math.random() < 0.4) playSfx('fizz');
      },
    });

    const dj = this.actor(CUTSCENE_DJ, 366, -1);
    dj.play(`${CUTSCENE_DJ}:cheer`);
    const p = this.actor(CUTSCENE_PHOTOGRAPHER, 118, 1);
    p.play(`${CUTSCENE_PHOTOGRAPHER}:idle`);

    this.time.delayedCall(500, () => {
      this.say(34, 60, 208, t('cs.ending'), VOICE.photographer, p.x + 4, () => {
        p.play(`${CUTSCENE_PHOTOGRAPHER}:cheer`);
        const laugh = () => {
          playSfx('laugh');
          const ha = label(this, p.x + 30 + Math.random() * 30, p.y - 96, t('cs.haha'), 9, { color: '#ffd23f', align: 'center' }).setDepth(8100);
          this.tweens.add({ targets: ha, y: ha.y - 22, alpha: 0, duration: 1000, onComplete: () => ha.destroy() });
        };
        laugh();
        this.time.addEvent({ delay: 1100, repeat: 2, callback: laugh });
        this.time.delayedCall(5200, () => this.finish());
      });
    });
    this.time.delayedCall(1700, () => this.say(326, 92, 76, t('cs.grr'), VOICE.dj, dj.x - 4));
  }
}
