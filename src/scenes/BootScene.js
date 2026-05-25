import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }
  preload() {
    this.load.spritesheet('astronaut', '/wa.png', {
      frameWidth: 32,
      frameHeight: 32
    });
  }
  create() {
    this.scene.start('MenuScene');
  }
}
