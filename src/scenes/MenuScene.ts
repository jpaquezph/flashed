// Menú principal: el fotógrafo disparando el flash entre láseres y los controles
// presentados como el panel superior de una cámara.

import Phaser from 'phaser';
import { playMusic } from '../audio/Music';
import { playSfx } from '../audio/Sfx';
import { COLORS, GAME_H, GAME_W, LASER, RS } from '../config/constants';
import { newRun } from '../game/Campaign';
import { TOUCH } from '../device';
import { t, toggleLang } from '../i18n';
import { saveSettings, settings } from '../settings';
import { label, setupCamera } from '../ui/widgets';

const FOOT = { x: 98, y: 244 };
/** Posición del cabezal del flash en la ilustración del fotógrafo. */
const FLASH = { x: FOOT.x + 45, y: FOOT.y - 139 };
const FLASH_EVERY = 5200;
const PANEL = { x: 197, y: 96 };
const TEXT_RIGHT = 435;

type Action = 'start' | 'levels' | 'L' | 'M' | 'N';

export class MenuScene extends Phaser.Scene {
  private beams!: Phaser.GameObjects.Graphics;
  private actions!: Record<Action, () => void>;

  constructor() {
    super('Menu');
  }

  create(): void {
    setupCamera(this);
    playMusic('menu');
    this.add.image(0, 0, 'menu_bg').setOrigin(0).setScale(1 / RS);
    this.beams = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD);

    // El fotógrafo apuntando, con el destello periódico del flash.
    this.add.ellipse(FOOT.x + 4, FOOT.y + 4, 96, 16, 0x05030a, 0.55);
    this.add.image(FOOT.x, FOOT.y, 'photog_big').setOrigin(0.5, 60 / 64).setScale(1 / RS);
    const glow = this.add.image(FLASH.x, FLASH.y, 'fx_flash').setScale(0.55 / RS).setAlpha(0.85).setDepth(5);
    this.tweens.add({ targets: glow, angle: 360, duration: 9000, repeat: -1 });
    const flash = this.add.image(FLASH.x, FLASH.y, 'fx_flash').setScale(0).setDepth(6);
    const white = this.add.rectangle(0, 0, GAME_W, GAME_H, COLORS.white, 0).setOrigin(0).setDepth(50);
    const fire = () => {
      playSfx('shutter');
      flash.setScale(0.5 / RS).setAlpha(1).setAngle(0);
      this.tweens.add({ targets: flash, scale: 2.8 / RS, alpha: 0, angle: 50, duration: 420, ease: 'Cubic.easeOut' });
      white.setAlpha(0.5);
      this.tweens.add({ targets: white, alpha: 0, duration: 380 });
    };
    this.time.addEvent({ delay: FLASH_EVERY, loop: true, callback: fire });
    this.time.delayedCall(700, fire);

    // Título.
    label(this, 325, 15, 'FLASHED', 50, { align: 'center', color: '#0d0a14', italic: true, stroke: 11 });
    label(this, 322, 12, 'FLASHED', 50, { align: 'center', color: '#ffffff', italic: true, stroke: 11 });

    const toggle = (change: () => void) => () => {
      change();
      saveSettings();
      playSfx('ui');
      this.scene.restart();
    };
    this.actions = {
      start: () => {
        playSfx('ui');
        // La campaña arranca desde el primer evento, con la cinemática inicial.
        newRun();
        this.scene.start('Prologue');
      },
      levels: () => {
        playSfx('ui');
        this.scene.start('Levels');
      },
      L: toggle(toggleLang),
      M: toggle(() => (settings.sfxMuted = !settings.sfxMuted)),
      N: toggle(() => (settings.musicMuted = !settings.musicMuted)),
    };

    this.drawInfoBar();
    this.drawControls();

    const start = label(this, 320, 205, t('menu.start'), 12, { align: 'center', color: '#ffffff', italic: true, stroke: 4.5 });
    this.tweens.add({ targets: start, alpha: 0.4, duration: 560, yoyo: true, repeat: -1 });
    this.clickable(320 - start.width / 2 - 4, 205, start.width + 8, 17, 'start');
    this.drawLevelsButton();
    this.drawSwitches();

    const kb = this.input.keyboard!;
    kb.on('keydown-SPACE', this.actions.start);
    kb.on('keydown-ENTER', this.actions.start);
    // E o 0 (controles remotos) abren la selección de evento.
    for (const key of ['E', 'ZERO', 'NUMPAD_ZERO']) kb.on(`keydown-${key}`, this.actions.levels);
    for (const key of ['L', 'M', 'N'] as const) kb.on(`keydown-${key}`, this.actions[key]);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => kb.removeAllListeners());
  }

  /** Zona que responde al mouse: se ilumina al pasar por encima y ejecuta la acción al hacer clic. */
  private clickable(x: number, y: number, w: number, h: number, action: Action): void {
    const glow = this.add.graphics().setDepth(40).setVisible(false);
    glow.lineStyle(1.2, 0xff8a2f, 1).strokeRoundedRect(x, y, w, h, 4);
    glow.fillStyle(0xff8a2f, 0.12).fillRoundedRect(x, y, w, h, 4);
    this.add
      .zone(x, y, w, h)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => glow.setVisible(true))
      .on('pointerout', () => glow.setVisible(false))
      .on('pointerdown', () => this.actions[action]());
  }

  /** Botón de selección de evento, con el mismo acabado que el panel de la cámara. */
  private drawLevelsButton(): void {
    const text = label(this, 0, 231.2, t('menu.levels'), 6.2, { stroke: 0 });
    const w = text.width + 30;
    const x = 320 - w / 2;
    const y = 228;
    const g = this.add.graphics();
    g.fillStyle(0x08080a, 1).fillRoundedRect(x - 1.5, y - 1.5, w + 3, 16, 4.5);
    g.fillStyle(0x3a3a42, 1).fillRoundedRect(x, y, w, 13, 3.5);
    g.fillStyle(0x1c1c21, 1).fillRoundedRect(x + 1, y + 1, w - 2, 11, 2.8);
    g.fillStyle(0x55555f, 1).fillRoundedRect(x + 4, y + 2, 11, 9, 2);
    g.fillStyle(0x2a2a30, 1).fillRoundedRect(x + 4.7, y + 2.7, 9.6, 7.6, 1.6);
    label(this, x + 9.5, y + 2.2, 'E', 5, { align: 'center', stroke: 0 });
    text.setX(x + 20).setDepth(1);
    this.clickable(x - 1.5, y - 1.5, w + 3, 16, 'levels');
  }

  /** Barra de estado de la cámara: contador de fotos, tarjeta, flash y el lema. */
  private drawInfoBar(): void {
    const g = this.add.graphics();
    const box = (x: number, w: number) => {
      g.fillStyle(0x08080a, 1).fillRoundedRect(x - 1.5, 74.5, w + 3, 22, 4);
      g.fillStyle(0x3a3a42, 1).fillRoundedRect(x, 76, w, 19, 3);
      g.fillStyle(0x1c1c21, 1).fillRoundedRect(x + 1, 77, w - 2, 17, 2.4);
    };
    box(198, 207);
    box(410, 31);
    label(this, 203, 76.5, '2/24', 6.5, { stroke: 0 });
    label(this, 204, 85.5, t('menu.photos'), 4.2, { color: '#8d8d99', stroke: 0 });
    this.add.image(228, 79, 'ui_card').setOrigin(0).setScale(0.8 / (RS * 4)).setTint(0xc9cdd6);
    this.add.image(243, 79.5, 'mi_bolt').setOrigin(0).setScale(1 / (RS * 2));
    const tagline = label(this, 259, 80.5, t('menu.tagline'), 5.8, { color: '#ff8a2f', stroke: 0 });
    if (tagline.width > 142) tagline.setScale(142 / tagline.width);
    this.add.image(425.5, 85.5, 'mi_aperture').setScale(1.25 / (RS * 2));
  }

  /** Tecla oscura, como los botones de la cámara. Devuelve el ancho ocupado. */
  private cap(x: number, y: number, text: string, w = 13): number {
    const g = this.add.graphics();
    g.fillStyle(0x08080a, 1).fillRoundedRect(x - 1, y - 1, w + 2, 15, 3);
    g.fillStyle(0x55555f, 1).fillRoundedRect(x, y, w, 13, 2.4);
    g.fillStyle(0x2a2a30, 1).fillRoundedRect(x + 0.8, y + 0.8, w - 1.6, 11.4, 2);
    label(this, x + w / 2, y + 1, text, 6, { align: 'center', stroke: 0 });
    return w;
  }

  private drawControls(): void {
    this.add.image(PANEL.x, PANEL.y, 'menu_cam').setOrigin(0).setScale(1 / RS);
    const lines = this.add.graphics();
    // En teléfonos se explican los controles táctiles en lugar de las teclas.
    const rows: { caps: string[]; width: number; text: string; icon?: string; iconScale?: number }[] = [
      { caps: TOUCH ? [t('ctrl.stick')] : ['W', 'A', 'S', 'D'], width: TOUCH ? 46 : 13, text: 'ctrl.move', icon: 'mi_shoe', iconScale: 1 / (RS * 2) },
      { caps: [t(TOUCH ? 'ctrl.button' : 'ctrl.space')], width: 46, text: 'ctrl.photo', icon: 'ui_camera', iconScale: 0.8 / RS },
      { caps: ['E'], width: 13, text: 'ctrl.interact', icon: 'mi_hand', iconScale: 1 / (RS * 2) },
      { caps: [TOUCH ? 'II' : 'ESC'], width: 22, text: 'ctrl.pause' },
    ];
    rows.forEach((row, i) => {
      const y = PANEL.y + 27 + i * 19;
      let x = PANEL.x + 13;
      for (const cap of row.caps) x += this.cap(x, y, cap, row.width) + 2;
      if (i === 0 && !TOUCH) {
        label(this, x + 1.5, y + 1.5, '/', 6.5, { color: '#c9cdd6', stroke: 0 });
        x += 9;
        for (const arrow of ['←', '↑', '↓', '→']) x += this.cap(x, y, arrow, 13) + 2;
      }
      const text = label(this, TEXT_RIGHT, y + 1, t(row.text), 7.2, { align: 'right', stroke: 0 });
      let end = TEXT_RIGHT - text.width - 4;
      if (row.icon) {
        this.add.image(end - 7, y + 6.5, row.icon).setScale(row.iconScale!);
        end -= 17;
      }
      if (end > x + 6) lines.lineStyle(1, 0xf4f1ea, 0.9).lineBetween(x + 3, y + 6.5, end, y + 6.5);
    });
  }

  /** Interruptores de idioma, efectos y música; cada uno muestra su tecla en la perilla. */
  private drawSwitches(): void {
    const g = this.add.graphics();
    const y = 249;
    const items: [Action, string, boolean][] = [
      ['L', t('menu.lang'), settings.lang !== 'es'],
      ['M', t(settings.sfxMuted ? 'menu.sfxOff' : 'menu.sfxOn'), !settings.sfxMuted],
      ['N', t(settings.musicMuted ? 'menu.musicOff' : 'menu.musicOn'), !settings.musicMuted],
    ];
    const texts = items.map(([, text]) => label(this, 0, y + 1.5, text.toUpperCase(), 6, { stroke: 2 }));
    const gap = 11;
    const total = texts.reduce((sum, text) => sum + 27 + text.width, 0) + gap * (items.length - 1);
    let x = 320 - total / 2;
    items.forEach(([key, , on], i) => {
      g.fillStyle(0x08080a, 1).fillRoundedRect(x - 1, y - 1, 24, 13, 6.5);
      g.fillStyle(0x3a3a42, 1).fillRoundedRect(x, y, 22, 11, 5.5);
      g.fillStyle(on ? 0x2f6f4a : 0x1c1c21, 1).fillRoundedRect(x + 1, y + 1, 20, 9, 4.5);
      const kx = on ? x + 16.5 : x + 5.5;
      g.fillStyle(0x08080a, 1).fillCircle(kx, y + 5.5, 5.2);
      g.fillStyle(0xc9cdd6, 1).fillCircle(kx, y + 5.5, 4.3);
      g.fillStyle(0xffffff, 0.8).fillCircle(kx - 1.2, y + 4.2, 1.3);
      label(this, kx, y + 1.4, key, 4.6, { align: 'center', color: '#0d0a14', stroke: 0 });
      texts[i].setX(x + 27);
      this.clickable(x - 3, y - 3, 32 + texts[i].width, 17, key);
      x += 27 + texts[i].width + gap;
    });
  }

  /** Un par de haces que se mueven despacio sobre los fijos del fondo. */
  update(time: number): void {
    const g = this.beams.clear();
    [LASER.colors[1], LASER.colors[2], LASER.colors[0]].forEach((color, i) => {
      const ox = 60 + i * 150;
      const tx = ox + Math.sin(time / (2600 + i * 700) + i * 2.1) * 170;
      g.lineStyle(5, color, 0.08).lineBetween(ox, -4, tx, GAME_H + 4);
      g.lineStyle(1.2, color, 0.5).lineBetween(ox, -4, tx, GAME_H + 4);
    });
  }
}
