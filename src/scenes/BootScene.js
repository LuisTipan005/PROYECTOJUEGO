import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }
  preload() {
    const walkSpritePath = new URL('../assets/walk.png', import.meta.url).href;
    const tilesetPath = new URL('../assets/TileSet v1.0.png', import.meta.url).href;
    const slimeFolder = '../assets/slime';

    this.load.spritesheet('astronaut', walkSpritePath, {
      frameWidth: 32,
      frameHeight: 32
    });
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
    const astronautTexture = this.textures.get('astronaut');
    astronautTexture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    const tilesetTexture = this.textures.get('tileset');
    tilesetTexture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    ['slime-idle', 'slime-run', 'slime-attack', 'slime-hurt', 'slime-death'].forEach((key) => {
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    });

    this.scene.start('MenuScene');
  }
}
