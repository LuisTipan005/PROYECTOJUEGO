import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }
  create() {
    this.createPlayerAnimations();

    this.player = this.physics.add.sprite(400, 300, 'astronaut', 0);
    this.player.setScale(5);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(24, 24, true);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.playerSpeed = 170;
    this.lastFacing = { anim: 'walk-down', flipX: false };

    this.add.text(12, 12, 'F: pantalla completa', {
      fontSize: '14px',
      color: '#ffffff'
    }).setDepth(1000).setScrollFactor(0);

    this.input.keyboard.on('keydown-F', this.toggleFullscreen, this);
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-F', this.toggleFullscreen, this);
    });
  }
  update() {
    const body = this.player.body;
    body.setVelocity(0, 0);

    if (this.cursors.left.isDown) {
      body.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      body.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      body.setVelocityY(this.playerSpeed);
    }

    if (body.velocity.lengthSq() > 0) {
      body.velocity.normalize().scale(this.playerSpeed);
      this.playMovementAnimation(body.velocity.x, body.velocity.y);
    } else {
      this.player.anims.stop();
      this.player.setFlipX(this.lastFacing.flipX);
      this.player.setFrame(this.getIdleFrame(this.lastFacing.anim));
    }
  }

  createPlayerAnimations() {
    if (!this.anims.exists('walk-down')) {
      this.anims.create({
        key: 'walk-down',
        frames: this.anims.generateFrameNumbers('astronaut', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
      });
    }

    if (!this.anims.exists('walk-side')) {
      this.anims.create({
        key: 'walk-side',
        frames: this.anims.generateFrameNumbers('astronaut', { start: 4, end: 7 }),
        frameRate: 8,
        repeat: -1
      });
    }

    if (!this.anims.exists('walk-up')) {
      this.anims.create({
        key: 'walk-up',
        frames: this.anims.generateFrameNumbers('astronaut', { start: 8, end: 11 }),
        frameRate: 8,
        repeat: -1
      });
    }
  }

  playMovementAnimation(vx, vy) {
    if (Math.abs(vx) >= Math.abs(vy)) {
      const flipX = vx < 0;
      this.player.setFlipX(flipX);
      this.player.anims.play('walk-side', true);
      this.lastFacing = { anim: 'walk-side', flipX };
      return;
    }

    if (vy < 0) {
      this.player.setFlipX(false);
      this.player.anims.play('walk-up', true);
      this.lastFacing = { anim: 'walk-up', flipX: false };
    } else {
      this.player.setFlipX(false);
      this.player.anims.play('walk-down', true);
      this.lastFacing = { anim: 'walk-down', flipX: false };
    }
  }

  getIdleFrame(animKey) {
    if (animKey === 'walk-up') return 8;
    if (animKey === 'walk-side') return 4;
    return 0;
  }

  toggleFullscreen() {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
      return;
    }

    this.scale.startFullscreen();
  }
}
