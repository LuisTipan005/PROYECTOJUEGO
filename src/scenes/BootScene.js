import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }
  preload() {
    const tilesetPath = new URL('../assets/TileSet v1.0.png', import.meta.url).href;

    const michaelFolder = '../assets/Michael';
    const michaelRunGroups = [
      { prefix: 'michael-run-down', start: 1, end: 6 },
      { prefix: 'michael-run-down-side', start: 7, end: 12 },
      { prefix: 'michael-run-side', start: 13, end: 18 },
      { prefix: 'michael-run-up-side', start: 19, end: 24 },
      { prefix: 'michael-run-up', start: 25, end: 30 }
    ];

    michaelRunGroups.forEach(({ prefix, start, end }) => {
      for (let index = start; index <= end; index += 1) {
        this.load.image(
          `michael-run-${index}`,
          new URL(`${michaelFolder}/run/16x32 Run${index}.png`, import.meta.url).href
        );
      }
    });

    const slimeFolder = '../assets/slime';
    this.load.image('tileset', tilesetPath);

    this.load.spritesheet('slime-idle', new URL(`${slimeFolder}/Slime1_Idle_full.png`, import.meta.url).href, {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet('slime-run', new URL(`${slimeFolder}/Slime1_Run_full.png`, import.meta.url).href, {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet('slime-attack', new URL(`${slimeFolder}/Slime1_Attack_full.png`, import.meta.url).href, {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet('slime-hurt', new URL(`${slimeFolder}/Slime1_Hurt_full.png`, import.meta.url).href, {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet('slime-death', new URL(`${slimeFolder}/Slime1_Death_full.png`, import.meta.url).href, {
      frameWidth: 64,
      frameHeight: 64
    });
  }
  create() {
    for (let index = 1; index <= 30; index += 1) {
      this.textures.get(`michael-run-${index}`).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }

    const tilesetTexture = this.textures.get('tileset');
    tilesetTexture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    ['slime-idle', 'slime-run', 'slime-attack', 'slime-hurt', 'slime-death'].forEach((key) => {
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    });

    this.scene.start('MenuScene');
  }
}
