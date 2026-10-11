// Pantalla de fin de evento: victoria con estadísticas, o derrota.

import Phaser from 'phaser';
import { playSfx } from '../audio/Sfx';
import { COLORS, GAME_W, RS } from '../config/constants';
import { hasNextScenario, run } from '../game/Campaign';
import { t } from '../i18n';
import { TOUCH } from '../device';
import { label, onTap, panel, setupCamera, stripedBackdrop, tapButton } from '../ui/widgets';
import type { LevelResult } from './GameScene';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  create(result: LevelResult): void {
    setupCamera(this);
    const win = result.win;
    stripedBackdrop(this, win ? 0x1b1630 : 0x2a1020, win ? 0x241d40 : 0x381528);
    panel(this, 90, 24, 300, 222, win ? COLORS.yellow : COLORS.red);

    label(this, GAME_W / 2, 30, t(win ? 'result.win' : 'result.lose'), 17, {
      align: 'center', color: win ? '#ffd23f' : '#ff3b5c', italic: true, stroke: 5,
    });

    const sprite = this.add.sprite(124, 232, 'photog', win ? 'cheer0' : 'hurt').setOrigin(0.5, 60 / 64).setScale(1.6 / RS);
    if (win) sprite.play('photog:cheer');

    const rows: [string, string][] = [
      [t('result.valid'), `${result.photos}/${result.required}`],
      [t('result.best'), String(result.best)],
      [t('result.specials'), `${result.specials}/${result.specialsTotal}`],
    ];
    if (win) rows.push([t('result.timeBonus'), `+${result.timeBonus}`], [t('result.sensorBonus'), `+${result.sensorBonus}`]);
    else label(this, GAME_W / 2, 56, t(`result.lose.${result.reason ?? 'time'}`), 7.5, { align: 'center' });

    const top = win ? 62 : 82;
    rows.forEach(([name, value], i) => {
      label(this, 170, top + i * 15, name, 7.5);
      label(this, 370, top + i * 15, value, 8, { align: 'right', color: '#4fe0ff' });
    });
    if (win) {
      label(this, 170, 144, t('result.score'), 11, { color: '#ffd23f', italic: true });
      label(this, 370, 143, String(run.score), 13, { align: 'right', color: '#ffd23f' });
    }

    const last = !hasNextScenario();
    if (win && last) label(this, 270, 170, t('result.campaignEnd'), 6.5, { align: 'center', wrap: 210, color: '#b9b3cf' });

    if (win || !TOUCH) {
      const prompt = win ? t('result.continue') : `${t('result.retry')}   ·   ${t('result.menu')}`;
      const cta = label(this, 270, 214, prompt, 9.5, { align: 'center', color: '#ffffff', italic: true });
      this.tweens.add({ targets: cta, alpha: 0.35, duration: 520, yoyo: true, repeat: -1 });
    }

    const kb = this.input.keyboard!;
    const go = (scene: string) => {
      playSfx('ui');
      this.scene.start(scene);
    };
    if (win) {
      const next = () => {
        if (last) return go('Menu');
        go('Upgrade');
      };
      kb.once('keydown-SPACE', next);
      kb.once('keydown-ENTER', next);
      onTap(this, next);
    } else {
      kb.once('keydown-R', () => go('Game'));
      kb.once('keydown-ESC', () => go('Menu'));
      if (TOUCH) {
        tapButton(this, 216, 212, t('result.retry'), 9, () => go('Game'));
        tapButton(this, 324, 212, t('result.menu'), 9, () => go('Menu'));
      }
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => kb.removeAllListeners());
  }
}
