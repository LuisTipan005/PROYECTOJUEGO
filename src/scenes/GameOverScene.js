import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }
  create({ score } = {}) {
    const { width, height } = this.scale;

    // ── MÚSICA DE GAME OVER ──────────────────────────────────────────────────
    // Para un jingle corto (≤ 10 s) se puede dejar loop: false.
    // Si prefieres un loop de ambiente más largo, cambia a loop: true.
    this.sound.stopAll();
    this.bgm = this.sound.add('bgm-gameover', { loop: false, volume: 0.6 });
    this.bgm.play();
    // ─────────────────────────────────────────────────────────────────────────

    this.add
      .text(width / 2, height / 2 - 20, 'Game Over', { fontSize: '32px' })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 + 20, `Score: ${score || 0}`, { fontSize: '20px' })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 + 56, 'Pulsa ENTER para volver al menú', { fontSize: '13px', color: '#aaaaaa' })
      .setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('MenuScene'));

    // Limpiar referencia al apagar la escena
    this.events.once('shutdown', () => {
      if (this.bgm && this.bgm.isPlaying) {
        this.bgm.stop();
      }
    });
  }
}