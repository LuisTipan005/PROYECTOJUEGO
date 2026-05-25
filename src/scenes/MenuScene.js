import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }
  create() {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 20, 'Presiona ENTER para jugar', { fontSize: '24px' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 20, 'Presiona F para pantalla completa', { fontSize: '16px' }).setOrigin(0.5);

    this.input.keyboard.on('keydown-F', this.toggleFullscreen, this);
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-F', this.toggleFullscreen, this);
    });

    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('GameScene'));
  }

  toggleFullscreen() {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
      return;
    }

    this.scale.startFullscreen();
  }
}
