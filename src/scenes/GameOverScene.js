import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }
  create({ score } = {}) {
    const { width, height } = this.scale;
    this.add.text(width/2, height/2 - 20, 'Game Over', { fontSize: '32px' }).setOrigin(0.5);
    this.add.text(width/2, height/2 + 20, `Score: ${score || 0}`, { fontSize: '20px' }).setOrigin(0.5);
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('MenuScene'));
  }
}
