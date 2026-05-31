import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }
  create() {
    const { width, height } = this.scale;
    this.portada = this.add.image(0, 0, 'portada').setOrigin(0, 0);
    this.portada.setDisplaySize(width, height);

    // ── MÚSICA DE MENÚ ───────────────────────────────────────────────────────
    // stopAll() garantiza que no quede música solapada si se vuelve al menú
    // desde GameOverScene.
    this.sound.stopAll();
    this.bgm = this.sound.add('bgm-menu', { loop: true, volume: 0.5 });
    this.bgm.play();
    // ─────────────────────────────────────────────────────────────────────────

    // Texto de indicación en la esquina inferior derecha
    this.add
      .text(width - 12, height - 12, 'M: silenciar', {
        fontSize: '11px',
        color: '#aaffff'
      })
      .setOrigin(1, 1)
      .setDepth(1000)
      .setAlpha(0.75);

    // Atajo F: pantalla completa
    this.input.keyboard.on('keydown-F', this.toggleFullscreen, this);

    // Atajo M: silenciar / activar todo el audio del juego
    this.input.keyboard.on('keydown-M', this.toggleMute, this);

    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-F', this.toggleFullscreen, this);
      this.input.keyboard.off('keydown-M', this.toggleMute, this);
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

  // Silencia / activa todo el audio de Phaser de forma global.
  // El estado de `this.sound.mute` persiste entre escenas porque el
  // SoundManager vive en el objeto Game, no en la escena.
  toggleMute() {
    this.sound.mute = !this.sound.mute;
  }
}