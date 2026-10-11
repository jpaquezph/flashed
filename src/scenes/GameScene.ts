// Escena de juego: arma el escenario a partir de su configuración y coordina
// jugador, invitados, fotografía, momentos del evento y condiciones de fin.

import Phaser from 'phaser';
import { duckMusic, playMusic } from '../audio/Music';
import { playSfx } from '../audio/Sfx';
import { COLORS, GAME_H, GAME_W, PHOTO, RS, SCORE, ZONE } from '../config/constants';
import type { MomentDef, ScenarioConfig } from '../config/scenarios/types';
import { TOUCH } from '../device';
import { currentScenario, run, startScenario } from '../game/Campaign';
import { pointInRect, type Rect } from '../game/Collision';
import { GuestManager, type Guest } from '../game/Guests';
import { LaserSystem } from '../game/LaserSystem';
import { Hud } from '../game/Hud';
import { PhotoSystem, type PhotoResult } from '../game/PhotoSystem';
import { Player } from '../game/Player';
import { TouchControls } from '../game/TouchControls';
import { DRINK_TIME } from '../game/Upgrades';
import { t } from '../i18n';
import { saveSettings, settings } from '../settings';
import { burn, label, panel, setupCamera, tapButton } from '../ui/widgets';

/** Pelea final: distancia a la que el DJ alcanza a pegar y pausa que hace después de cada golpe. */
const BOSS = { reach: 16, recover: 1.3 };

/** Pausa entre que termina un momento y vuelve a darse, si su objetivo quedó sin cumplir. */
const MOMENT_RETRY = 9;

export interface LevelResult {
  win: boolean;
  reason: 'time' | 'sensor' | 'card' | null;
  photos: number;
  required: number;
  best: number;
  specials: number;
  specialsTotal: number;
  photoScore: number;
  timeBonus: number;
  sensorBonus: number;
}

type Keys = Record<'W' | 'A' | 'S' | 'D' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'SPACE' | 'ENTER' | 'E' | 'ZERO' | 'NUMPAD_ZERO' | 'ESC' | 'M' | 'N' | 'Q', Phaser.Input.Keyboard.Key>;

const EXIT_RADIUS = 20;
const JustDown = Phaser.Input.Keyboard.JustDown;

export class GameScene extends Phaser.Scene {
  private cfg!: ScenarioConfig;
  private keys!: Keys;
  private obstacles!: Rect[];
  private player!: Player;
  private guests!: GuestManager;
  private photo!: PhotoSystem;
  private hud!: Hud;
  private lasers: LaserSystem | null = null;
  private aim!: Phaser.GameObjects.Graphics;
  private flashLight!: Phaser.GameObjects.Graphics;
  private flashBurst!: Phaser.GameObjects.Image;
  private pauseUi: Phaser.GameObjects.GameObject[] = [];
  private pauseSound: Phaser.GameObjects.Text | null = null;
  private touch: TouchControls | null = null;
  /** Recordatorio de las teclas de sonido, siempre a la vista bajo la barra superior. */
  private soundInfo!: Phaser.GameObjects.Text;

  private elapsed = 0;
  private photos = 0;
  /** Disparos usados de la tarjeta de memoria. */
  private shots = 0;
  private photoScore = 0;
  private best = 0;
  private specialsDone: boolean[] = [];
  private momentState = new Map<string, 'pending' | 'active' | 'done'>();
  /** Segundo en que empieza cada momento (se corre cuando hay que repetirlo). */
  private momentAt = new Map<string, number>();
  private exitGlow!: Phaser.GameObjects.Graphics;
  private exitArrow!: Phaser.GameObjects.Container;
  private zoneMeter = 0;
  private viewfinder = 0;
  private doneHint = 0;
  private paused = false;
  private ended = false;
  private bossPhase = 0;
  private bossMove = 0;

  constructor() {
    super('Game');
  }

  create(): void {
    setupCamera(this);
    startScenario();
    const cfg = (this.cfg = currentScenario());

    this.elapsed = 0;
    this.photos = 0;
    this.shots = 0;
    this.photoScore = 0;
    this.best = 0;
    this.specialsDone = cfg.objectives.specials.map(() => false);
    this.momentState = new Map(cfg.moments.map((m) => [m.id, 'pending']));
    this.momentAt = new Map(cfg.moments.map((m) => [m.id, m.at]));
    this.zoneMeter = 0;
    this.viewfinder = 0;
    this.doneHint = 0;
    this.paused = false;
    this.ended = false;
    this.bossPhase = 0;
    this.bossMove = 0;
    this.pauseUi = [];

    this.add.image(0, 0, cfg.background).setOrigin(0).setScale(1 / RS).setDepth(-1000);
    for (const p of cfg.props) this.add.image(p.x, p.y, p.key).setOrigin(0).setScale(1 / RS).setDepth(p.depth).setFlipX(p.flip ?? false);
    this.obstacles = [...cfg.solids, ...cfg.props.flatMap((p) => (p.collide ? [p.collide] : []))];

    this.guests = new GuestManager(this, cfg, this.obstacles);
    this.player = new Player(this, cfg.playerStart.x, cfg.playerStart.y);
    this.photo = new PhotoSystem();
    this.hud = new Hud(this, `${run.index + 1} · ${t(cfg.nameKey).toUpperCase()}`, run.maxSensor, cfg.objectives.specials.map((sp) => t(sp.textKey, { n: sp.type === 'group' ? sp.count : 0 })), t(cfg.objectives.counterKey ?? 'result.valid'));
    this.lasers = cfg.hazards.lasers ? new LaserSystem(this, cfg.hazards.lasers) : null;
    playMusic(cfg.music);

    // Señal de salida: se enciende cuando ya se puede terminar el trabajo.
    this.exitGlow = this.add.graphics().setDepth(-900).setVisible(false);
    this.exitArrow = this.add
      .container(cfg.exit.x, 0, [
        this.add.triangle(0, 0, -7, 0, 7, 0, 0, 9, COLORS.green).setStrokeStyle(1.4, COLORS.ink),
        label(this, 0, -15, t('hud.exit'), 6.5, { align: 'center', color: '#5be37a' }),
      ])
      .setDepth(4600)
      .setVisible(false);

    this.soundInfo = label(this, 5, 22, this.soundText(), 4.6, { color: '#b9b3cf', stroke: 1.6 }).setDepth(5000).setVisible(!TOUCH);
    this.touch = TOUCH ? new TouchControls(this) : null;
    this.pauseSound = null;

    this.aim = this.add.graphics().setDepth(4000);
    this.flashLight = this.add.graphics().setDepth(4001);
    this.flashBurst = this.add.image(0, 0, 'fx_flash').setScale(1 / RS).setDepth(4002).setVisible(false);

    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,ENTER,E,ZERO,NUMPAD_ZERO,ESC,M,N,Q') as Keys;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.anims.resumeAll();
      this.tweens.resumeAll();
    });
  }

  update(_time: number, delta: number): void {
    const k = this.keys;
    const tc = this.touch?.read();
    if (JustDown(k.M)) {
      settings.sfxMuted = !settings.sfxMuted;
      this.soundChanged(t(settings.sfxMuted ? 'menu.sfxOff' : 'menu.sfxOn'));
    }
    if (JustDown(k.N)) {
      settings.musicMuted = !settings.musicMuted;
      this.soundChanged(t(settings.musicMuted ? 'menu.musicOff' : 'menu.musicOn'));
    }
    if (this.ended) return;
    if (JustDown(k.ESC) || tc?.pause) this.togglePause();
    if (this.paused) {
      if (JustDown(k.Q)) this.scene.start('Menu');
      return;
    }

    const dt = Math.min(delta / 1000, 0.05);
    this.elapsed += dt;
    const timeLeft = this.cfg.difficulty.timeLimit - this.elapsed;

    this.updateMoments();

    const ix = Phaser.Math.Clamp((k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0) + (tc?.ix ?? 0), -1, 1);
    const iy = Phaser.Math.Clamp((k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0) + (tc?.iy ?? 0), -1, 1);
    this.player.update(dt, ix, iy, { obstacles: this.obstacles, bounds: this.cfg.bounds, blockers: this.guests.blockers() }, run.stats);
    this.guests.update(dt, this.player);
    this.photo.update(dt);
    this.updateZones(dt);
    this.updateBoss(dt);
    this.updateLasers(dt);
    if (this.ended) return;

    // Enter también dispara: es el botón central de los controles remotos de TV.
    const enter = JustDown(k.ENTER);
    if (JustDown(k.SPACE) || tc?.photo || (enter && !this.atExitReady())) this.takePhoto();
    if (this.ended) return;

    const required = this.cfg.objectives.requiredPhotos;
    const atExit = !this.cfg.boss && Math.hypot(this.player.x - this.cfg.exit.x, this.player.y - this.cfg.exit.y) < EXIT_RADIUS;
    // Con el trabajo terminado y parado en la puerta, Enter sirve para salir (los controles remotos no tienen E).
    // El 0 hace lo mismo que la E: es la tecla que tienen los controles remotos.
    const zero = JustDown(k.ZERO) || JustDown(k.NUMPAD_ZERO);
    if (JustDown(k.E) || zero || tc?.use || (enter && this.atExitReady())) {
      if (atExit && this.complete) return this.finish(true, null);
      this.useItem();
    }
    if (this.cfg.boss && this.photos >= required) return this.finish(true, null);
    if (timeLeft <= 0) return this.finish(this.complete, 'time');

    this.viewfinder = Math.max(0, this.viewfinder - dt);
    this.doneHint = Math.max(0, this.doneHint - dt);
    this.drawExit(!this.cfg.boss && this.complete);
    this.drawAim();
    this.updateHud(timeLeft, atExit);
  }

  /** Estado del sonido, tal como se muestra en pantalla y en la pausa. */
  private soundText(): string {
    return `M: ${t(settings.sfxMuted ? 'menu.sfxOff' : 'menu.sfxOn')}   ·   N: ${t(settings.musicMuted ? 'menu.musicOff' : 'menu.musicOn')}`;
  }

  /** Se prendieron o apagaron los efectos o la música: se guarda y se avisa en pantalla. */
  private soundChanged(message: string): void {
    saveSettings();
    playSfx('ui');
    this.soundInfo.setText(this.soundText());
    this.pauseSound?.setText(this.soundText());
    // En pantallas táctiles los botones de la pausa muestran el estado: se redibujan.
    if (TOUCH && this.paused) {
      this.clearPause();
      this.drawPause();
    }
    if (!this.paused && !this.ended) this.hud.popup(GAME_W / 2, 44, message.toUpperCase(), '#4fe0ff', 8);
  }

  /** Parado en la puerta de salida con el trabajo terminado. */
  private atExitReady(): boolean {
    const { exit, boss } = this.cfg;
    return !boss && this.complete && Math.hypot(this.player.x - exit.x, this.player.y - exit.y) < EXIT_RADIUS;
  }

  /** Trabajo terminado: mínimo de fotos alcanzado y todos los objetivos cumplidos. */
  private get complete(): boolean {
    return this.photos >= this.cfg.objectives.requiredPhotos && this.specialsDone.every(Boolean);
  }

  // ---------- Momentos del evento ----------

  private activeMoment(): MomentDef | undefined {
    return this.cfg.moments.find((m) => this.momentState.get(m.id) === 'active');
  }

  private updateMoments(): void {
    for (const m of this.cfg.moments) {
      const state = this.momentState.get(m.id);
      const at = this.momentAt.get(m.id)!;
      if (state === 'pending' && this.elapsed >= at) {
        this.momentState.set(m.id, 'active');
        playSfx('pickup');
        if (m.crowd) this.guests.setCrowdAnim(m.crowd);
        for (const a of m.actions) {
          const actor = this.guests.byId(a.actor);
          if (!actor) continue;
          if (a.anim) actor.scriptAnim = a.anim;
          if (a.moveTo) this.guests.sendTo(a.actor, a.moveTo);
        }
      } else if (state === 'active' && this.elapsed >= at + m.duration) {
        this.momentState.set(m.id, 'done');
        if (m.crowd) this.guests.setCrowdAnim(null);
        for (const a of m.actions) {
          const actor = this.guests.byId(a.actor);
          if (!actor) continue;
          actor.scriptAnim = null;
          if (a.moveTo) this.guests.release(a.actor);
        }
      }
    }
    // Segunda oportunidad: cuando ya pasaron todos, los momentos con el objetivo pendiente vuelven a darse.
    if (![...this.momentState.values()].every((s) => s === 'done')) return;
    let next = this.elapsed + MOMENT_RETRY;
    for (const m of this.cfg.moments) {
      const missed = this.cfg.objectives.specials.some((sp, i) => sp.type === 'moment' && sp.moment === m.id && !this.specialsDone[i]);
      if (!missed) continue;
      this.momentState.set(m.id, 'pending');
      this.momentAt.set(m.id, next);
      next += m.duration + MOMENT_RETRY;
    }
  }

  // ---------- Zonas restringidas ----------

  private updateZones(dt: number): void {
    const zone = this.cfg.zones.find((z) => pointInRect(z.rect, this.player.x, this.player.y));
    if (!zone || this.player.invulnerable) {
      this.zoneMeter = Math.max(0, this.zoneMeter - dt * ZONE.decay);
      return;
    }
    if (this.zoneMeter === 0) playSfx('warn');
    this.zoneMeter += dt / ZONE.grace;
    if (this.zoneMeter >= 1) {
      this.zoneMeter = 0;
      this.player.moveTo(zone.eject.x, zone.eject.y);
      this.damage();
    }
  }

  // ---------- Láseres ----------

  private updateLasers(dt: number): void {
    if (!this.lasers) return;
    const event = this.lasers.update(dt, this.elapsed);
    // El iluminador festeja con risa malvada mientras los láseres están en marcha.
    const operator = this.guests.byId(this.cfg.hazards.lasers?.operator ?? '');
    if (operator) operator.scriptAnim = this.lasers.state === 'idle' ? null : 'cheer';
    if (event === 'warn') {
      playSfx('warn');
      playSfx('evil');
      duckMusic(1.3);
      if (operator) this.hud.popup(operator.x + 14, operator.y - 76, t('hud.laugh'), '#' + this.lasers.color.toString(16).padStart(6, '0'), 9);
    }
    if (event === 'fire') playSfx('laser');
    if (!this.player.invulnerable && this.lasers.hits(this.player.x, this.player.y - 1)) {
      if (run.shield === 0) this.hud.popup(this.player.x, this.player.y - 74, t('hud.burn'), '#ff7a2f', 9);
      this.damage();
    }
  }

  /** Un impacto quema parte del sensor de la cámara. */
  private damage(): void {
    if (run.shield > 0) {
      // El cotillón protector absorbe el impacto.
      run.shield -= 1;
      playSfx('pickup');
      this.hud.popup(this.player.x, this.player.y - 84, t('up.shield.used'), '#ffd23f', 9);
      this.player.hurt();
      return;
    }
    run.sensor -= 1;
    playSfx('hit');
    this.cameras.main.shake(180, 0.004);
    if (run.sensor <= 0) this.finish(false, 'sensor');
    else this.player.hurt();
  }

  // ---------- Fotografía ----------

  private takePhoto(): void {
    if (!this.photo.ready || !this.player.canAct) return;
    const p = this.player;
    const capacity = this.capacity;
    if (this.shots >= capacity) {
      this.photo.cooldown = PHOTO.cooldown;
      this.hud.popup(p.x, p.y - 74, t('photo.cardFull'), '#ff3b5c', 8);
      playSfx('card');
      return;
    }
    this.shots += 1;
    p.shoot();
    playSfx('shutter');

    const frame = this.photo.frame(p.x, p.y, p.facing, run.stats);
    const subjects = this.guests.inRect(frame);
    const result = this.photo.evaluate(frame, subjects, p.x, p.y, this.elapsed, run.stats);

    if (this.cfg.boss) this.bossPhoto(subjects, frame);
    else {
      this.blindOperator(subjects);
      this.eventPhoto(subjects, frame, result);
    }

    // Último lugar de la tarjeta: no se puede disparar más.
    if (this.shots >= capacity) {
      this.time.delayedCall(500, () => {
        playSfx('card');
        this.hud.cardFull(t('hud.cardFull'));
      });
      if (!this.complete) this.finish(false, 'card');
    }

    this.viewfinder = PHOTO.viewfinderTime;
    this.flashLight.clear().fillStyle(COLORS.white, 0.5).fillRect(frame.x, frame.y, frame.w, frame.h).setAlpha(1);
    this.tweens.add({ targets: this.flashLight, alpha: 0, duration: 170 });
    this.flashBurst.setPosition(p.x + p.facing * 15, p.y - 46).setVisible(true).setAlpha(1).setScale(0.4 / RS);
    this.tweens.add({ targets: this.flashBurst, scale: 1.1 / RS, alpha: 0, angle: 40, duration: 200, onComplete: () => this.flashBurst.setVisible(false).setAngle(0) });
  }

  /** Un flash a quien maneja las luces mientras están prendidos los láseres lo encandila y los apaga. */
  private blindOperator(subjects: Guest[]): boolean {
    const operator = this.guests.byId(this.cfg.hazards.lasers?.operator ?? '');
    if (!operator || !subjects.includes(operator) || !this.lasers?.cancel()) return false;
    operator.hurtTime = 1;
    this.hud.popup(operator.x, operator.y - 84, t('hud.lasersOff'), '#4fe0ff', 9);
    this.time.delayedCall(200, () => playSfx('pickup'));
    return true;
  }

  /** Foto de un evento común: suma para el trabajo y puede cumplir objetivos especiales. */
  private eventPhoto(subjects: Guest[], frame: Rect, result: PhotoResult): void {
    const moment = this.activeMoment();
    const wasComplete = this.complete;
    let special = false;
    this.cfg.objectives.specials.forEach((sp, i) => {
      if (this.specialsDone[i]) return;
      const inFrame = (ids: string[]) => ids.every((id) => subjects.some((g) => g.id === id));
      const done =
        sp.type === 'moment' ? moment?.id === sp.moment && inFrame(sp.actors)
        : sp.type === 'actor' ? inFrame(sp.actors)
        : result.valid && subjects.length >= sp.count;
      if (!done) return;
      this.specialsDone[i] = true;
      special = true;
      result.score += PHOTO.specialBonus;
    });
    const valid = result.valid || special;
    this.guests.photographed(subjects, this.elapsed);

    if (valid && !this.cfg.boss) {
      this.photos += 1;
      this.photoScore += result.score;
      this.best = Math.max(this.best, result.score);
    }

    if (!wasComplete && this.complete) {
      this.doneHint = 6;
      this.time.delayedCall(450, () => playSfx('pickup'));
    }

    // Respuesta visual y sonora.
    const px = frame.x + frame.w / 2;
    const py = frame.y - 30;
    if (subjects.length === 0) {
      this.hud.popup(px, py, t('photo.empty'), '#b9b3cf', 7);
      playSfx('empty');
    } else if (!valid) {
      this.hud.popup(px, py, t('photo.repeat'), '#b9b3cf', 7);
      playSfx('empty');
    } else if (special) {
      this.hud.popup(px, py, `${t('photo.special')}\n+${result.score}`, '#ffd23f', 10);
      playSfx('great');
    } else if (result.score >= PHOTO.highlightScore) {
      this.hud.popup(px, py, `${t('photo.great')} +${result.score}`, '#ff4f8b', 10);
      playSfx('great');
    } else {
      this.hud.popup(px, py, `${t('photo.ok')} +${result.score}`, '#ffffff', 8);
      playSfx('ok');
    }
  }

  // ---------- Jefe final ----------

  /** Foto durante la pelea: si el DJ sale en cuadro pierde vida. Acá el flash no apaga los láseres. */
  private bossPhoto(subjects: Guest[], frame: Rect): void {
    const boss = this.cfg.boss!;
    const dj = this.guests.byId(boss.actor);
    const px = frame.x + frame.w / 2;
    const py = frame.y - 30;
    if (!dj || !subjects.includes(dj)) {
      this.hud.popup(px, py, t('boss.miss'), '#b9b3cf', 7);
      playSfx('empty');
      return;
    }
    // De cerca el flash pega el doble.
    const close = Math.abs(dj.x - this.player.x) < 52;
    const hit = (close ? 2 : 1) + run.stats.flashPower;
    this.photos = Math.min(boss.hp, this.photos + hit);
    const score = Math.round(hit * 100 * run.stats.scoreMul);
    this.photoScore += score;
    this.best = Math.max(this.best, score);
    dj.hurtTime = 0.6;
    this.cameras.main.shake(120, 0.003);
    this.hud.popup(px, py, `${t(close ? 'photo.great' : 'photo.ok')} -${hit}`, close ? '#ff4f8b' : '#ffffff', close ? 11 : 9);
    playSfx(close ? 'great' : 'ok');
  }

  /** Fases del jefe: al perder cada tercio de vida cambia de patrones y empieza a moverse. */
  private updateBoss(dt: number): void {
    const boss = this.cfg.boss;
    if (!boss || !this.lasers) return;
    const left = 1 - this.photos / boss.hp;
    const phase = left > 2 / 3 ? 0 : left > 1 / 3 ? 1 : 2;
    if (phase !== this.bossPhase) {
      this.bossPhase = phase;
      playSfx('evil');
      this.hud.popup(GAME_W / 2, 96, t(`boss.phase${phase + 1}`).toUpperCase(), '#ff3b5c', 16);
    }
    this.lasers.override = boss.phases[phase];
    const dj = this.guests.byId(boss.actor);
    if (!dj || phase === 0) return;
    this.bossMove -= dt;
    if (phase === 2) return this.bossChase(dj);
    // Segunda fase: se mueve detrás de la cabina.
    if (dj.path.length > 0 || this.bossMove > 0) return;
    this.bossMove = 1.9;
    this.guests.sendTo(boss.actor, { x: boss.patrol[0] + Math.random() * (boss.patrol[1] - boss.patrol[0]), y: dj.home.y });
  }

  /** Última fase: el DJ baja a la pista y persigue al fotógrafo para pegarle. Un flash lo frena un instante. */
  private bossChase(dj: Guest): void {
    const p = this.player;
    // Después de pegar (o de errar) se queda un momento quieto: es la ventana para alejarse.
    if (this.bossMove > 0) {
      dj.path = [];
      return;
    }
    this.guests.sendTo(dj.id!, { x: p.x, y: p.y });
    const reach = Math.hypot(dj.x - p.x, (dj.y - p.y) * 1.5) < BOSS.reach;
    if (!reach || dj.hurtTime > 0 || p.invulnerable) return;
    this.bossMove = BOSS.recover;
    this.hud.popup(p.x, p.y - 74, t('boss.punch'), '#ff3b5c', 11);
    this.damage();
  }

  // ---------- Accesorios ----------

  /** Disparos que entran en la tarjeta, contando la tarjeta extra. */
  private get capacity(): number {
    return this.cfg.objectives.cardCapacity + run.stats.cardBonus;
  }

  /** Usa el consumible equipado. La bebida distrae al DJ y apaga los láseres un rato. */
  private useItem(): void {
    if (run.item !== 'drink' || !this.lasers) return;
    run.item = null;
    this.lasers.pause(DRINK_TIME);
    playSfx('pickup');
    this.hud.popup(this.player.x, this.player.y - 80, t('up.drink.used'), '#4fe0ff', 9);
  }

  /** Puerta de salida: marco luminoso que late y flecha que rebota, cuando ya se cumplió el mínimo. */
  private drawExit(open: boolean): void {
    this.exitGlow.setVisible(open);
    this.exitArrow.setVisible(open);
    if (!open) return;
    const { x, y } = this.cfg.exit;
    const pulse = 0.5 + 0.5 * Math.sin(this.time.now / 180);
    const g = this.exitGlow.clear();
    g.fillStyle(COLORS.green, 0.1 + 0.14 * pulse).fillRect(x - 24, 34, 48, y - 34);
    g.lineStyle(5, COLORS.green, 0.25 + 0.3 * pulse).strokeRect(x - 17, 55, 34, y - 61);
    g.lineStyle(1.6, 0xeafff0, 0.6 + 0.4 * pulse).strokeRect(x - 17, 55, 34, y - 61);
    g.fillStyle(COLORS.green, 0.16 + 0.2 * pulse).fillEllipse(x, y + 5, 46, 13);
    this.exitArrow.setY(y - 82 + Math.sin(this.time.now / 150) * 3);
  }

  /** Marcas del encuadre sobre el piso: tenues siempre, brillantes al disparar (visor). */
  private drawAim(): void {
    const f = this.photo.frame(this.player.x, this.player.y, this.player.facing, run.stats);
    const shot = this.viewfinder > 0;
    const g = this.aim.clear();
    const usable = this.photo.ready && this.shots < this.capacity;
    g.lineStyle(shot ? 2 : 1.2, shot ? COLORS.white : COLORS.yellow, shot ? 1 : usable ? 0.55 : 0.2);
    const c = 9;
    const x2 = f.x + f.w;
    const y2 = f.y + f.h;
    g.beginPath();
    g.moveTo(f.x, f.y + c).lineTo(f.x, f.y).lineTo(f.x + c, f.y);
    g.moveTo(x2 - c, f.y).lineTo(x2, f.y).lineTo(x2, f.y + c);
    g.moveTo(x2, y2 - c).lineTo(x2, y2).lineTo(x2 - c, y2);
    g.moveTo(f.x + c, y2).lineTo(f.x, y2).lineTo(f.x, y2 - c);
    if (shot) {
      const cx = f.x + f.w / 2;
      const cy = f.y + f.h / 2;
      g.moveTo(cx - 4, cy).lineTo(cx + 4, cy).moveTo(cx, cy - 4).lineTo(cx, cy + 4);
    }
    g.strokePath();
  }

  // ---------- Interfaz ----------

  private updateHud(timeLeft: number, atExit: boolean): void {
    const cfg = this.cfg;
    const required = cfg.objectives.requiredPhotos;
    const moment = this.activeMoment();
    const upcoming = cfg.moments.find((m) => this.momentState.get(m.id) === 'pending' && this.elapsed >= this.momentAt.get(m.id)! - m.warn);
    const allDone = cfg.moments.every((m) => this.momentState.get(m.id) === 'done');

    let banner: string | null = null;
    let bannerColor = '#ffd23f';
    if (this.zoneMeter > 0) {
      banner = t('hud.restricted');
      bannerColor = '#ff3b5c';
    } else if (this.lasers?.state === 'warn') {
      banner = t('hud.lasers');
      bannerColor = '#' + this.lasers.color.toString(16).padStart(6, '0');
    } else if (moment) {
      banner = `${t('hud.moment', { name: t(moment.nameKey) })}  ${Math.ceil(this.momentAt.get(moment.id)! + moment.duration - this.elapsed)}`;
    } else if (upcoming) {
      banner = t('hud.soon', { name: t(upcoming.nameKey) });
      bannerColor = '#4fe0ff';
    } else if (timeLeft <= 15 && !this.complete) {
      banner = t('hud.timeLow');
      bannerColor = '#ff3b5c';
    }

    let hint: string | null = null;
    if (atExit) hint = this.complete ? t('hud.exitReady') : this.photos < required ? t('hud.exitNotReady', { n: required - this.photos }) : t('hud.exitNoGoals');
    else if (!cfg.boss && this.shots >= this.capacity && this.complete) hint = t('hud.cardFullExit');
    else if (this.doneHint > 0) hint = t('hud.jobDone');

    this.hud.update({
      photos: this.photos,
      required,
      sensor: run.sensor,
      shots: this.shots,
      capacity: this.capacity,
      item: run.item,
      shield: run.shield,
      duel: cfg.boss ? { player: run.sensor / run.maxSensor, boss: 1 - this.photos / cfg.boss.hp } : null,
      timeLeft,
      phase: t(cfg.boss ? `boss.phase${this.bossPhase + 1}` : moment ? moment.nameKey : allDone ? 'hud.phase.end' : cfg.phaseKey),
      specials: this.specialsDone,
      cooldown: this.photo.cooldown / (PHOTO.cooldown * run.stats.cooldownMul),
      banner,
      bannerColor,
      hint,
      zone: this.zoneMeter,
      x: this.player.x,
      y: this.player.y,
    });
  }

  private clearPause(): void {
    this.pauseUi.forEach((o) => o.destroy());
    this.pauseUi = [];
    this.pauseSound = null;
  }

  private togglePause(): void {
    this.paused = !this.paused;
    if (!this.paused) {
      this.clearPause();
      this.anims.resumeAll();
      this.tweens.resumeAll();
      return;
    }
    this.anims.pauseAll();
    this.tweens.pauseAll();
    playSfx('ui');
    this.drawPause();
  }

  private drawPause(): void {
    const D = 9000;
    const cfg = this.cfg;
    const add = <T extends Phaser.GameObjects.GameObject & { setDepth(d: number): T }>(o: T): T => {
      this.pauseUi.push(o.setDepth(D));
      return o;
    };
    add(this.add.rectangle(0, 0, GAME_W, GAME_H, COLORS.ink, 0.6).setOrigin(0));
    add(panel(this, 110, 60, 260, 150, COLORS.cyan));
    add(label(this, GAME_W / 2, 66, t('pause.title'), 16, { align: 'center', color: '#4fe0ff', italic: true }));
    add(label(this, 124, 92, t('intro.required', { n: cfg.objectives.requiredPhotos }) + `  (${this.photos}/${cfg.objectives.requiredPhotos})`, 7));
    add(label(this, 124, 106, t('intro.optional'), 5.5, { color: '#ffd23f' }));
    cfg.objectives.specials.forEach((sp, i) => {
      const y = 116 + i * 14;
      add(this.add.image(124, y, this.specialsDone[i] ? 'ui_star' : 'ui_star_empty').setOrigin(0).setScale(1 / RS));
      add(label(this, 139, y, t(sp.textKey, { n: sp.type === 'group' ? sp.count : 0 }), 6, { wrap: 220 }));
    });
    if (TOUCH) {
      // Sin teclado: cada opción de la pausa es un botón.
      const buttons: [number, number, string, () => void][] = [
        [186, 166, t('pause.resume'), () => this.togglePause()],
        [296, 166, t('pause.quit'), () => this.scene.start('Menu')],
        [186, 189, t(settings.sfxMuted ? 'menu.sfxOff' : 'menu.sfxOn'), () => {
          settings.sfxMuted = !settings.sfxMuted;
          this.soundChanged('');
        }],
        [296, 189, t(settings.musicMuted ? 'menu.musicOff' : 'menu.musicOn'), () => {
          settings.musicMuted = !settings.musicMuted;
          this.soundChanged('');
        }],
      ];
      for (const [x, y, text, action] of buttons) {
        tapButton(this, x, y, text, 6.5, action).forEach((o, i) => this.pauseUi.push((o as Phaser.GameObjects.Zone).setDepth(D + 1 + i)));
      }
      return;
    }
    add(label(this, GAME_W / 2, 176, `${t('pause.resume')}   ·   ${t('pause.quit')}`, 7, { align: 'center' }));
    this.pauseSound = add(label(this, GAME_W / 2, 190, this.soundText(), 6.5, { align: 'center', color: '#4fe0ff' }));
  }

  // ---------- Fin del evento ----------

  /** Se llenó la tarjeta y faltaron fotos: mira la cámara, saca la tarjeta y se larga a llorar. */
  private cardDrama(): void {
    const p = this.player;
    this.time.delayedCall(900, () => this.hud.popup(p.x, p.y - 74, '?!', '#ffd23f', 12));
    this.time.delayedCall(2600, () => {
      playSfx('card');
      this.hud.popup(p.x, p.y - 80, t('photo.cardFull'), '#ff3b5c', 9);
    });
    p.mourn(this, () => {
      playMusic('lose');
      playSfx('cry');
      this.time.addEvent({ delay: 1300, repeat: 1, callback: () => playSfx('cry') });
      // Lágrimas que saltan para los dos lados.
      this.time.addEvent({
        delay: 110,
        loop: true,
        callback: () => {
          const side = Math.random() < 0.5 ? -1 : 1;
          const tear = this.add.ellipse(p.x + p.facing * 3 + side * 3, p.y - 41, 2, 3, 0x7fd8ff).setStrokeStyle(0.5, COLORS.ink).setDepth(p.y + 2);
          this.tweens.add({
            targets: tear, x: tear.x + side * (6 + Math.random() * 9), duration: 520,
            onComplete: () => tear.destroy(),
          });
          this.tweens.add({ targets: tear, y: { from: tear.y - 6, to: p.y - 2 }, ease: 'Quad.easeIn', duration: 520 });
        },
      });
    });
  }


  private finish(win: boolean, reason: LevelResult['reason']): void {
    this.ended = true;
    this.aim.clear();
    this.lasers?.stop();
    const timeLeft = Math.max(0, Math.ceil(this.cfg.difficulty.timeLimit - this.elapsed));
    const result: LevelResult = {
      win,
      reason: win ? null : reason,
      photos: this.photos,
      required: this.cfg.objectives.requiredPhotos,
      best: this.best,
      specials: this.specialsDone.filter(Boolean).length,
      specialsTotal: this.specialsDone.length,
      photoScore: this.photoScore,
      timeBonus: win ? timeLeft * SCORE.timeBonusPerSec : 0,
      sensorBonus: win ? run.sensor * SCORE.sensorBonus : 0,
    };
    if (win) {
      run.score += result.photoScore + result.timeBonus + result.sensorBonus;
      this.player.cheer();
      playSfx('win');
      playMusic('win');
    } else if (reason === 'card') {
      this.cardDrama();
    } else {
      this.player.defeat();
      playSfx('lose');
      playMusic('lose');
    }
    // Al vencer al jefe, antes del resultado va la cinemática final.
    // Sensor quemado del todo: la cámara, colgada del cuello, se prende fuego.
    if (reason === 'sensor' && !win) {
      const cx = this.player.x + this.player.facing * 2;
      burn(this, cx, this.player.y - 19, this.player.y + 1, 1.6);
      playSfx('fizz');
    }
    this.time.delayedCall(win ? 1700 : reason === 'card' ? 6400 : 2300, () => this.scene.start(win && this.cfg.boss ? 'Ending' : 'Result', result));
  }
}
