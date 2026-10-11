// Selección de accesorio entre niveles: tres opciones al azar, se elige una.

import Phaser from 'phaser';
import { playSfx } from '../audio/Sfx';
import { COLORS, GAME_W } from '../config/constants';
import { advanceScenario } from '../game/Campaign';
import { applyUpgrade, rollUpgrades, type UpgradeDef } from '../game/Upgrades';
import { t } from '../i18n';
import { label, setupCamera, stripedBackdrop, tapZone } from '../ui/widgets';

const CARD_W = 128;
const CARD_H = 142;
const GAP = 14;
const TOP = 58;

export class UpgradeScene extends Phaser.Scene {
  private options: UpgradeDef[] = [];
  private frames: Phaser.GameObjects.Graphics[] = [];
  private selected = 0;

  constructor() {
    super('Upgrade');
  }

  create(): void {
    setupCamera(this);
    stripedBackdrop(this, 0x120e1c, 0x1a1530);
    this.options = rollUpgrades();
    this.frames = [];
    this.selected = 0;

    label(this, GAME_W / 2, 12, t('up.title'), 17, { align: 'center', color: '#fff7d6', italic: true, stroke: 5 });
    label(this, GAME_W / 2, 37, t('up.subtitle'), 7, { align: 'center', color: '#b9b3cf' });

    const left = (GAME_W - (this.options.length * CARD_W + (this.options.length - 1) * GAP)) / 2;
    this.options.forEach((def, i) => {
      const x = left + i * (CARD_W + GAP);
      this.frames.push(this.add.graphics({ x, y: TOP }));
      this.add.image(x + CARD_W / 2, TOP + 38, def.icon).setDisplaySize(52, 52);
      label(this, x + CARD_W / 2, TOP + 70, t(`up.${def.id}.name`).toUpperCase(), 8.5, { align: 'center', color: '#ffd23f', wrap: CARD_W - 10 });
      label(this, x + CARD_W / 2, TOP + 94, t(`up.${def.id}.desc`), 6, { align: 'center', wrap: CARD_W - 14, stroke: 1.5 });
    });
    this.refresh();

    const hint = label(this, GAME_W / 2, 246, t('up.hint'), 8, { align: 'center', color: '#ffd23f', italic: true });
    this.tweens.add({ targets: hint, alpha: 0.4, duration: 520, yoyo: true, repeat: -1 });

    const kb = this.input.keyboard!;
    const move = (delta: number) => {
      this.selected = Phaser.Math.Clamp(this.selected + delta, 0, this.options.length - 1);
      playSfx('ui');
      this.refresh();
    };
    for (const key of ['LEFT', 'A']) kb.on(`keydown-${key}`, () => move(-1));
    for (const key of ['RIGHT', 'D']) kb.on(`keydown-${key}`, () => move(1));
    const choose = () => {
      playSfx('pickup');
      applyUpgrade(this.options[this.selected]);
      advanceScenario();
      this.scene.start('Intro');
    };
    this.options.forEach((_def, i) => {
      tapZone(this, left + i * (CARD_W + GAP), TOP, CARD_W, CARD_H, () => {
        this.selected = i;
        choose();
      });
    });
    kb.on('keydown-SPACE', choose);
    kb.on('keydown-ENTER', choose);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => kb.removeAllListeners());
  }

  private refresh(): void {
    this.frames.forEach((g, i) => {
      const on = i === this.selected;
      g.clear();
      g.fillStyle(COLORS.ink, 1).fillRoundedRect(-2, -2, CARD_W + 4, CARD_H + 4, 7);
      g.fillStyle(on ? COLORS.yellow : 0x3a3350, 1).fillRoundedRect(0, 0, CARD_W, CARD_H, 6);
      g.fillStyle(on ? 0x2a2550 : COLORS.panel, 1).fillRoundedRect(on ? 2.5 : 1.5, on ? 2.5 : 1.5, CARD_W - (on ? 5 : 3), CARD_H - (on ? 5 : 3), 5);
      g.setAlpha(on ? 1 : 0.8);
    });
  }
}
