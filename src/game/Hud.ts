// Interfaz durante la partida: una franja superior compacta, avisos y resultado de cada foto.

import Phaser from 'phaser';
import { COLORS, GAME_H, GAME_W, RS } from '../config/constants';
import { t } from '../i18n';
import { formatTime, label } from '../ui/widgets';

const DEPTH = 5000;

export interface HudState {
  photos: number;
  required: number;
  sensor: number;
  /** Disparos usados y capacidad de la tarjeta de memoria. */
  shots: number;
  capacity: number;
  /** Consumible equipado y cotillones protectores. */
  item: string | null;
  shield: number;
  /** Barras de vida de la pelea final (0 a 1). */
  duel: { player: number; boss: number } | null;
  timeLeft: number;
  phase: string;
  specials: boolean[];
  /** Fracción de recarga pendiente de la cámara (0 = lista). */
  cooldown: number;
  banner: string | null;
  bannerColor: string;
  hint: string | null;
  /** Medidor de zona restringida (0 a 1) y posición donde mostrarlo. */
  zone: number;
  x: number;
  y: number;
}

export class Hud {
  private readonly phase: Phaser.GameObjects.Text;
  private readonly counter: Phaser.GameObjects.Text;
  private readonly timer: Phaser.GameObjects.Text;
  private readonly banner: Phaser.GameObjects.Text;
  private readonly hint: Phaser.GameObjects.Text;
  private readonly sensor: Phaser.GameObjects.Image[] = [];
  private readonly stars: Phaser.GameObjects.Image[] = [];
  private readonly bars: Phaser.GameObjects.Graphics;
  private readonly card: Phaser.GameObjects.Image;
  private readonly cardText: Phaser.GameObjects.Text;
  private readonly required: Phaser.GameObjects.Text;
  private readonly itemIcon: Phaser.GameObjects.Image;
  private readonly shieldIcon: Phaser.GameObjects.Image;
  private readonly shieldText: Phaser.GameObjects.Text;
  private readonly duelLabels: Phaser.GameObjects.Text[];
  private readonly specialTexts: Phaser.GameObjects.Text[] = [];

  constructor(private readonly scene: Phaser.Scene, title: string, maxSensor: number, specials: string[], private readonly counterLabel: string) {
    const bar = scene.add.graphics().setDepth(DEPTH);
    bar.fillStyle(COLORS.ink, 0.82).fillRect(0, 0, GAME_W, 19);
    bar.fillStyle(COLORS.yellow, 1).fillRect(0, 19, GAME_W, 1);
    bar.fillStyle(COLORS.ink, 1).fillRect(0, 20, GAME_W, 0.8);

    label(scene, 5, 0.5, title, 7, { color: '#ffd23f' }).setDepth(DEPTH);
    this.phase = label(scene, 5, 9, '', 5.5).setDepth(DEPTH);

    // Objeto equipado (las mejoras llegan en una etapa posterior).
    label(scene, 150, 6, t('hud.item'), 4.5, { color: '#b9b3cf', align: 'right' }).setDepth(DEPTH);
    bar.fillStyle(COLORS.yellow, 1).fillRoundedRect(153, 2.5, 14, 14, 2.5);
    bar.fillStyle(COLORS.panel, 1).fillRoundedRect(154, 3.5, 12, 12, 2);

    this.itemIcon = scene.add.image(160, 9.5, 'up_drink').setDisplaySize(11, 11).setDepth(DEPTH).setVisible(false);
    label(scene, 160, 21, 'E', 5, { color: '#ffd23f', align: 'center' }).setDepth(DEPTH).setName('itemKey').setVisible(false);
    this.shieldIcon = scene.add.image(352, 9.5, 'up_shield').setDisplaySize(11, 11).setDepth(DEPTH).setVisible(false);
    this.shieldText = label(scene, 357, 9, '', 5, { color: '#ffd23f' }).setDepth(DEPTH);
    this.duelLabels = [label(scene, 20, 247, t('hud.sensor'), 6, { color: '#5be37a' }), label(scene, GAME_W - 20, 247, 'DJ', 6, { color: '#ff3bd4', align: 'right' })];
    this.duelLabels.forEach((l) => l.setDepth(DEPTH).setVisible(false));

    scene.add.image(196, 3.5, 'ui_camera').setOrigin(0).setScale(1 / RS).setDepth(DEPTH);
    this.counter = label(scene, 215, -0.5, '', 11).setDepth(DEPTH);

    // Tarjeta de memoria: disparos usados sobre la capacidad.
    this.card = scene.add.image(302, 2.5, 'ui_card').setOrigin(0).setScale(1 / (RS * 4)).setDepth(DEPTH);
    this.cardText = label(scene, 318, 3.5, '', 7.5).setDepth(DEPTH);

    // Estado del sensor de la cámara.
    label(scene, 386, 6, t('hud.sensor'), 4.5, { color: '#b9b3cf', align: 'right' }).setDepth(DEPTH);
    for (let i = 0; i < maxSensor; i++) {
      this.sensor.push(scene.add.image(388 + i * (maxSensor > 3 ? 11 : 15), 2.5, 'ui_sensor').setOrigin(0).setScale(1 / RS).setDepth(DEPTH));
    }
    this.timer = label(scene, GAME_W - 4, 0, '', 10, { align: 'right' }).setDepth(DEPTH);

    this.banner = label(scene, GAME_W / 2, 24, '', 9, { align: 'center' }).setDepth(DEPTH);
    this.hint = label(scene, GAME_W / 2, 254, '', 6.5, { align: 'center' }).setDepth(DEPTH);
    this.bars = scene.add.graphics().setDepth(DEPTH);

    // Objetivos, siempre a la vista en la esquina superior derecha.
    const ox = 340;
    const oy = 24;
    bar.fillStyle(COLORS.ink, 0.74).fillRoundedRect(ox, oy, GAME_W - ox - 3, 21 + specials.length * 9, 3);
    label(scene, ox + 4, oy + 1, t('intro.objectives'), 5, { color: '#ffd23f' }).setDepth(DEPTH);
    scene.add.image(ox + 4, oy + 10, 'ui_camera').setOrigin(0).setScale(0.6 / RS).setDepth(DEPTH);
    this.required = label(scene, ox + 16, oy + 9, '', 5.5).setDepth(DEPTH);
    specials.forEach((text, i) => {
      const y = oy + 19 + i * 9;
      this.stars.push(scene.add.image(ox + 4.5, y + 0.5, 'ui_star_empty').setOrigin(0).setScale(0.7 / RS).setDepth(DEPTH));
      this.specialTexts.push(label(scene, ox + 16, y, text, 5, { stroke: 1.5 }).setDepth(DEPTH));
    });
  }

  private set(obj: Phaser.GameObjects.Text, text: string): void {
    if (obj.text !== text) obj.setText(text);
  }

  update(s: HudState): void {
    this.set(this.phase, s.phase);
    this.set(this.counter, `${s.photos}/${s.required}`);
    this.counter.setColor(s.photos >= s.required ? '#5be37a' : '#ffffff');
    this.set(this.timer, formatTime(s.timeLeft));
    this.timer.setColor(s.timeLeft <= 20 ? '#ff3b5c' : '#ffffff');
    this.sensor.forEach((img, i) => img.setTexture(i < s.sensor ? 'ui_sensor' : 'ui_sensor_burnt'));
    this.stars.forEach((star, i) => star.setTexture(s.specials[i] ? 'ui_star' : 'ui_star_empty'));
    this.specialTexts.forEach((text, i) => text.setColor(s.specials[i] ? '#5be37a' : '#ffffff'));
    this.set(this.required, `${this.counterLabel}: ${s.photos}/${s.required}`);
    this.itemIcon.setVisible(s.item !== null);
    (this.scene.children.getByName('itemKey') as Phaser.GameObjects.Text | null)?.setVisible(s.item !== null);
    this.shieldIcon.setVisible(s.shield > 0);
    this.set(this.shieldText, s.shield > 1 ? `x${s.shield}` : '');
    this.required.setColor(s.photos >= s.required ? '#5be37a' : '#ffffff');

    const full = s.shots >= s.capacity;
    const nearFull = s.capacity - s.shots <= 3;
    this.set(this.cardText, `${s.shots}/${s.capacity}`);
    this.cardText.setColor(full ? '#ff3b5c' : nearFull ? '#ffd23f' : '#ffffff');
    this.card.setTexture(full ? 'ui_card_full' : 'ui_card').setAlpha(full && Math.floor(this.scene.time.now / 250) % 2 === 0 ? 0.45 : 1);

    this.set(this.banner, s.banner ?? '');
    this.banner.setColor(s.bannerColor).setScale(1 + 0.04 * Math.sin(this.scene.time.now / 110));
    this.set(this.hint, s.hint ?? '');

    this.bars.clear();
    // Recarga de la cámara.
    this.bars.fillStyle(COLORS.ink, 1).fillRect(196, 16, 60, 2);
    this.bars.fillStyle(s.cooldown > 0 ? COLORS.pink : COLORS.green, 1).fillRect(196, 16, 60 * (1 - s.cooldown), 2);
    // Pelea final: barras de vida enfrentadas, sensor contra DJ.
    this.duelLabels.forEach((l) => l.setVisible(s.duel !== null));
    if (s.duel) {
      const w = 190;
      const draw = (x: number, frac: number, color: number, fromRight: boolean) => {
        this.bars.fillStyle(COLORS.ink, 1).fillRoundedRect(x - 2, 256, w + 4, 10, 3);
        this.bars.fillStyle(0x3a3350, 1).fillRect(x, 258, w, 6);
        const fill = w * Phaser.Math.Clamp(frac, 0, 1);
        this.bars.fillStyle(color, 1).fillRect(fromRight ? x + w - fill : x, 258, fill, 6);
        this.bars.fillStyle(COLORS.white, 0.35).fillRect(fromRight ? x + w - fill : x, 258, fill, 2);
      };
      draw(20, s.duel.player, COLORS.green, false);
      draw(GAME_W - 20 - w, s.duel.boss, 0xff3bd4, true);
    }
    // Medidor de zona restringida, sobre la cabeza del fotógrafo.
    if (s.zone > 0) {
      this.bars.fillStyle(COLORS.ink, 1).fillRect(s.x - 12, s.y - 60, 24, 5);
      this.bars.fillStyle(COLORS.red, 1).fillRect(s.x - 11, s.y - 59, 22 * Math.min(1, s.zone), 3);
    }
  }

  /** Animación de tarjeta llena: la tarjeta salta al centro, tiembla y queda sellada. */
  cardFull(text: string): void {
    const tweens = this.scene.tweens;
    const cx = GAME_W / 2;
    const cy = GAME_H / 2 - 6;
    const big = this.scene.add.image(302 + 7, 10, 'ui_card').setScale(1 / (RS * 4)).setDepth(DEPTH + 2);
    const stamp = label(this.scene, cx, cy + 34, text, 15, { color: '#ff3b5c', align: 'center', italic: true, stroke: 5 }).setDepth(DEPTH + 3).setAlpha(0).setAngle(-6);
    tweens.add({
      targets: big, x: cx, y: cy, scale: 4.2 / (RS * 4), duration: 320, ease: 'Back.easeOut',
      onComplete: () => {
        big.setTexture('ui_card_full');
        tweens.add({ targets: big, x: cx + 3, duration: 45, yoyo: true, repeat: 7 });
        stamp.setAlpha(1).setScale(2.2);
        tweens.add({ targets: stamp, scale: 1, duration: 200, ease: 'Cubic.easeIn' });
        tweens.add({ targets: [big, stamp], alpha: 0, delay: 1300, duration: 300, onComplete: () => { big.destroy(); stamp.destroy(); } });
      },
    });
  }

  /** Texto flotante con el resultado de una foto. */
  popup(x: number, y: number, text: string, color: string, size: number): void {
    const cx = Phaser.Math.Clamp(x, 60, GAME_W - 60);
    const obj = label(this.scene, cx, Math.max(26, y), text, size, { color, align: 'center' }).setDepth(DEPTH + 1);
    this.scene.tweens.add({ targets: obj, y: obj.y - 16, alpha: { from: 1, to: 0 }, duration: 1100, ease: 'Cubic.easeIn', onComplete: () => obj.destroy() });
  }
}
