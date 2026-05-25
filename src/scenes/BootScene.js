import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }
  preload() {
    const walkSpritePath = new URL('../assets/walk.png', import.meta.url).href;
    const tilesetPath = new URL('../assets/TileSet v1.0.png', import.meta.url).href;

    this.load.spritesheet('astronaut', walkSpritePath, {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.image('tileset', tilesetPath);
  }
  create() {
    const astronautTexture = this.textures.get('astronaut');
    astronautTexture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    const tilesetTexture = this.textures.get('tileset');
    tilesetTexture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    this.scene.start('MenuScene');
  }
}
