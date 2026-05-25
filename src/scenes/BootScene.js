import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }
  preload() {
    this.load.spritesheet('astronaut', '/walk.png', {
      frameWidth: 32,
      frameHeight: 32
    });
  }
  create() {
    const astronautTexture = this.textures.get('astronaut');
    astronautTexture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.scene.start('MenuScene');
  }
}
