// Introducción del escenario: tipo de evento y objetivos.

import Phaser from 'phaser';
import { scenarioCharacters, useCharacters } from '../art';
import { playSfx } from '../audio/Sfx';
import { COLORS, GAME_H, GAME_W, RS } from '../config/constants';
import { currentScenario, run } from '../game/Campaign';
import { t } from '../i18n';
import { label, onTap, panel, setupCamera } from '../ui/widgets';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super('Intro');
  }

  create(): void {
    setupCamera(this);
    const cfg = currentScenario();
    this.add.image(0, 0, cfg.background).setOrigin(0).setScale(1 / RS);
    this.add.rectangle(0, 0, GAME_W, GAME_H, COLORS.ink, 0.62).setOrigin(0);

    panel(this, 80, 28, 320, 206);
    label(this, GAME_W / 2, 34, t('intro.job', { n: run.index + 1 }), 8, { align: 'center', color: '#4fe0ff' });
    label(this, GAME_W / 2, 45, t(cfg.nameKey).toUpperCase(), 20, { align: 'center', color: '#fff7d6', italic: true, stroke: 5 });
    label(this, GAME_W / 2, 74, t(cfg.descKey), 7, { align: 'center', wrap: 290, stroke: 2 });

    label(this, 98, 106, t('intro.objectives'), 7, { color: '#ffd23f' });
    this.add.image(98, 119, 'ui_camera').setOrigin(0).setScale(1 / RS);
    label(this, 119, 119, t(cfg.objectives.requiredKey ?? 'intro.required', { n: cfg.objectives.requiredPhotos }), 8);

    this.add.image(100, 131, 'ui_card').setOrigin(0).setScale(0.8 / (RS * 4));
    label(this, 119, 132, t('intro.card', { n: cfg.objectives.cardCapacity + run.stats.cardBonus }), 6.5, { color: '#b9b3cf' });

    if (cfg.objectives.specials.length > 0) label(this, 98, 147, t('intro.optional'), 6, { color: '#ffd23f' });
    cfg.objectives.specials.forEach((sp, i) => {
      const y = 158 + i * 14;
      this.add.image(98, y, 'ui_star').setOrigin(0).setScale(1 / RS);
      label(this, 114, y, t(sp.textKey, { n: sp.type === 'group' ? sp.count : 0 }), 6.5, { wrap: 270 });
    });

    const start = label(this, GAME_W / 2, 208, t('intro.start'), 11, { align: 'center', color: '#ffd23f', italic: true });
    this.tweens.add({ targets: start, alpha: 0.35, duration: 520, yoyo: true, repeat: -1 });

    // Los personajes del evento se generan mientras se leen los objetivos.
    let ready = false;
    void useCharacters(this, scenarioCharacters(cfg)).then(() => (ready = true));

    const kb = this.input.keyboard!;
    const begin = () => {
      if (!ready) return;
      playSfx('ui');
      this.scene.start('Game');
    };
    kb.on('keydown-SPACE', begin);
    kb.on('keydown-ENTER', begin);
    onTap(this, begin);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => kb.removeAllListeners());
  }
}
