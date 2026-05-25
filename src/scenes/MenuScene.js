import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }
  create() {
    const { width, height } = this.scale;
    this.add.text(width/2, height/2, 'Presiona ENTER para jugar', { fontSize: '24px' }).setOrigin(0.5);
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('GameScene'));
  }
}
