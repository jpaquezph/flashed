// Selección de evento: una tarjeta por evento de la campaña, con el mismo fondo
// de láseres y el mismo acabado de cámara que el menú principal.

import Phaser from 'phaser';
import { playSfx } from '../audio/Sfx';
import { GAME_W, RS } from '../config/constants';
import { CAMPAIGN } from '../config/scenarios';
import { newRun, run } from '../game/Campaign';
import { t } from '../i18n';
import { TOUCH } from '../device';
import { label, setupCamera, tapButton, tapZone } from '../ui/widgets';

const PER_ROW = 4;
const CARD_W = 104;
const CARD_H = 78;
const GAP = 10;
/** Miniatura: el fondo del escenario reducido. */
const THUMB = 0.2;
const ORANGE = 0xff8a2f;

export class LevelsScene extends Phaser.Scene {
  private selected = 0;
  private frames: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super('Levels');
  }

  create(): void {
    setupCamera(this);
    this.add.image(0, 0, 'menu_bg').setOrigin(0).setScale(1 / RS);
    this.add.rectangle(0, 0, GAME_W, 270, 0x0a0f1e, 0.45).setOrigin(0);
    this.frames = [];
    this.selected = Phaser.Math.Clamp(this.selected, 0, CAMPAIGN.length - 1);

    label(this, GAME_W / 2 + 2, 13, t('levels.title'), 22, { align: 'center', color: '#0d0a14', italic: true, stroke: 7 });
    label(this, GAME_W / 2, 11, t('levels.title'), 22, { align: 'center', color: '#ffffff', italic: true, stroke: 7 });

    const cards: [number, number][] = [];
    const rows = Math.ceil(CAMPAIGN.length / PER_ROW);
    const top = rows === 1 ? 90 : 52;
    CAMPAIGN.forEach((cfg, i) => {
      const row = Math.floor(i / PER_ROW);
      const inRow = Math.min(PER_ROW, CAMPAIGN.length - row * PER_ROW);
      const x = (GAME_W - (inRow * CARD_W + (inRow - 1) * GAP)) / 2 + (i % PER_ROW) * (CARD_W + GAP);
      const y = top + row * (CARD_H + GAP);

      cards.push([x, y]);
      this.frames.push(this.add.graphics({ x, y }));
      this.add.image(x + 4, y + 4, cfg.background).setOrigin(0).setScale(THUMB / RS);
      // Número del evento, como una tecla de la cámara.
      const chip = this.add.graphics();
      chip.fillStyle(0x08080a, 1).fillRoundedRect(x + 6, y + 6, 15, 15, 3);
      chip.fillStyle(0x55555f, 1).fillRoundedRect(x + 7, y + 7, 13, 13, 2.4);
      chip.fillStyle(0x2a2a30, 1).fillRoundedRect(x + 7.8, y + 7.8, 11.4, 11.4, 2);
      label(this, x + 13.5, y + 8, String(i + 1), 7, { align: 'center', stroke: 0 });
      label(this, x + CARD_W / 2, y + 61.5, t(cfg.nameKey), 6.2, { align: 'center', wrap: CARD_W - 8, stroke: 0 });
    });
    this.refresh();

    const hint = label(this, GAME_W / 2, 248, t('levels.hint'), 7.5, { align: 'center', color: '#ffffff', italic: true });
    this.tweens.add({ targets: hint, alpha: 0.4, duration: 560, yoyo: true, repeat: -1 });

    const kb = this.input.keyboard!;
    const move = (delta: number) => {
      const next = this.selected + delta;
      if (next < 0 || next >= CAMPAIGN.length) return;
      this.selected = next;
      playSfx('ui');
      this.refresh();
    };
    for (const key of ['LEFT', 'A']) kb.on(`keydown-${key}`, () => move(-1));
    for (const key of ['RIGHT', 'D']) kb.on(`keydown-${key}`, () => move(1));
    for (const key of ['UP', 'W']) kb.on(`keydown-${key}`, () => move(-PER_ROW));
    for (const key of ['DOWN', 'S']) kb.on(`keydown-${key}`, () => move(PER_ROW));
    const begin = () => {
      playSfx('great');
      newRun();
      run.index = this.selected;
      // El primer evento arranca con la cinemática del fotógrafo preparándose.
      this.scene.start(this.selected === 0 ? 'Prologue' : 'Intro');
    };
    cards.forEach(([x, y], i) => {
      tapZone(this, x, y, CARD_W, CARD_H, () => {
        this.selected = i;
        begin();
      });
    });
    if (TOUCH) {
      tapButton(this, 40, 16, t('levels.back'), 7, () => {
        playSfx('ui');
        this.scene.start('Menu');
      });
    }
    kb.on('keydown-SPACE', begin);
    kb.on('keydown-ENTER', begin);
    kb.on('keydown-ESC', () => {
      playSfx('ui');
      this.scene.start('Menu');
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => kb.removeAllListeners());
  }

  /** Redibuja los marcos: el elegido resalta con el naranja del menú. */
  private refresh(): void {
    this.frames.forEach((g, i) => {
      const on = i === this.selected;
      g.clear();
      if (on) g.fillStyle(ORANGE, 0.25).fillRoundedRect(-5, -5, CARD_W + 10, CARD_H + 10, 9);
      g.fillStyle(0x08080a, 1).fillRoundedRect(-2, -2, CARD_W + 4, CARD_H + 4, 6);
      g.fillStyle(on ? ORANGE : 0x3a3a42, 1).fillRoundedRect(0, 0, CARD_W, CARD_H, 5);
      g.fillStyle(0x1c1c21, 1).fillRoundedRect(on ? 2 : 1.2, on ? 2 : 1.2, CARD_W - (on ? 4 : 2.4), CARD_H - (on ? 4 : 2.4), 4);
    });
  }
}
