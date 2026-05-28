import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }
  create() {
    const { width, height } = this.scale;
    this.portada = this.add.image(0, 0, 'portada').setOrigin(0, 0);
    this.portada.setDisplaySize(width, height);

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
