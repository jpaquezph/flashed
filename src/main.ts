import Phaser from 'phaser';
import { GAME_H, GAME_W, RS } from './config/constants';
import { enterFullscreenLandscape, keepFitted } from './device';
import { watchGamepads } from './gamepad';
import { run } from './game/Campaign';
import { BootScene } from './scenes/BootScene';
import { EndingScene, PrologueScene } from './scenes/Cutscenes';
import { GameScene } from './scenes/GameScene';
import { IntroScene } from './scenes/IntroScene';
import { LevelsScene } from './scenes/LevelsScene';
import { MenuScene } from './scenes/MenuScene';
import { ResultScene } from './scenes/ResultScene';
import { UpgradeScene } from './scenes/UpgradeScene';

const game = new Phaser.Game({
  // ?canvas fuerza el renderizador Canvas 2D (para equipos sin WebGL).
  type: new URLSearchParams(location.search).has('canvas') ? Phaser.CANVAS : Phaser.AUTO,
  parent: 'game',
  width: GAME_W * RS,
  height: GAME_H * RS,
  backgroundColor: '#120e1c',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true },
  // Varios dedos a la vez: palanca y botones.
  input: { activePointers: 3 },
  scene: [BootScene, MenuScene, LevelsScene, PrologueScene, IntroScene, GameScene, ResultScene, UpgradeScene, EndingScene],
});

enterFullscreenLandscape();
watchGamepads();
keepFitted(() => game.scale.refresh());

// Acceso desde la consola del navegador para depurar.
Object.assign(window, { __flashed: game, __flashedRun: () => run });
