// Arranque: genera todo el arte vectorial antes de mostrar el menú.

import Phaser from 'phaser';
import { buildTextures, scenarioCharacters, useCharacters } from '../art';
import { GAME_H, GAME_W } from '../config/constants';
import { CAMPAIGN } from '../config/scenarios';
import { currentScenario, newRun, run } from '../game/Campaign';
import { t } from '../i18n';
import { label, setupCamera } from '../ui/widgets';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    setupCamera(this);
    label(this, GAME_W / 2, GAME_H / 2 - 8, t('boot.loading'), 12, { align: 'center', color: '#ffd23f', italic: true });
    buildTextures(this)
      .then(async () => {
        // ?scene=Game (o Intro) salta directo a esa escena: útil para probar.
        // ?level=2 elige el evento de la campaña.
        const params = new URLSearchParams(location.search);
        const target = params.get('scene');
        if (target) {
          newRun();
          run.index = Phaser.Math.Clamp(Number(params.get('level') ?? 1) - 1, 0, CAMPAIGN.length - 1);
          if (target === 'Game') await useCharacters(this, scenarioCharacters(currentScenario()));
        }
        this.scene.start(target ?? 'Menu');
      })
      .catch((err: unknown) => {
        console.error(err);
        label(this, GAME_W / 2, GAME_H / 2 + 14, String(err), 6, { align: 'center', color: '#ff3b5c' });
      });
  }
}
