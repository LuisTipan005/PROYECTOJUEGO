import Phaser from 'phaser';
import room01 from '../maps/room01.js';
import Slime from '../objects/Slime.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }
  create(data = {}) {
    this.roomIndex = data.roomIndex ?? 1;
    this.score = data.score ?? 0;
    this.playerHealth = 3;
    this.playerInvulnerableUntil = 0;
    this.gameOver = false;
    this.roomKey = null;

    this.createGameplayTextures();
    this.createSlimeAnimations();
    this.createSmallMap(room01);
    this.createPlayerAnimations();

    this.player = this.physics.add.sprite(room01.spawn.x, room01.spawn.y, 'astronaut', 0);
    this.player.setScale(3);
    this.player.body.setCollideWorldBounds(true);
    // keep the Arcade body aligned with the scaled sprite so world clamping is exact
    this.player.body.setSize(16, 16);
    this.player.body.setOffset(0, 0);

    // removed tile collisions per request; keep world bounds and track valid positions
    this.player.body.setCollideWorldBounds(true);
    this.lastValidPos = { x: this.player.x, y: this.player.y };

    this.physics.add.collider(this.player, this.wallLayer);

    this.projectiles = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 16,
      runChildUpdate: false
    });
    this.slimeGroup = this.physics.add.group();

    this.spawnRoomSlimes(room01);

    this.physics.add.collider(this.projectiles, this.wallLayer, this.destroyProjectile, null, this);
    this.physics.add.overlap(this.projectiles, this.slimeGroup, this.hitSlime, null, this);

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.playerSpeed = 170;
    this.lastFacing = { anim: 'walk-down', flipX: false };

    this.hudText = this.add.text(12, 12, '', {
      fontSize: '14px',
      color: '#ffffff'
    }).setDepth(1000).setScrollFactor(0);

    this.instructionText = this.add.text(12, 32, 'F: pantalla completa | G: debug tiles | SPACE: disparar', {
      fontSize: '12px',
      color: '#d8f7ff'
    }).setDepth(1000).setScrollFactor(0);

    this.messageText = this.add.text(this.scale.width / 2, 64, '', {
      fontSize: '18px',
      color: '#ffff88',
      backgroundColor: '#00000088',
      padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setDepth(1000).setScrollFactor(0);

    // on-screen collision debug text
    this.collisionDebugText = this.add.text(12, 52, '', {
      fontSize: '12px',
      color: '#ffdddd',
      backgroundColor: '#00000088'
    }).setDepth(1000).setScrollFactor(0);

    this.updateHud();

    this.input.keyboard.on('keydown-SPACE', this.fireProjectile, this);
    this.input.keyboard.on('keydown-F', this.toggleFullscreen, this);
    this.input.keyboard.on('keydown-G', this.toggleTileDebugOverlay, this);
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-SPACE', this.fireProjectile, this);
      this.input.keyboard.off('keydown-F', this.toggleFullscreen, this);
      this.input.keyboard.off('keydown-G', this.toggleTileDebugOverlay, this);
    });
  }
  update(time) {
    if (this.gameOver) {
      return;
    }

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

    if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
      this.fireProjectile();
    }

    this.updateProjectiles(time);
    this.updateSlimes(time);
    this.updateRoomState();

    // Keep the player inside the 24x24 room using a simple pixel clamp.
    if (this.map) {
      const bodyBB = this.player.body;
      const halfBodyW = bodyBB.width / 2;
      const halfBodyH = bodyBB.height / 2;
      const minCenterX = 0 + halfBodyW;
      const minCenterY = 0 + halfBodyH;
      const maxCenterX = this.map.widthInPixels - halfBodyW;
      const maxCenterY = this.map.heightInPixels - halfBodyH;
      const clampedX = Phaser.Math.Clamp(this.player.x, minCenterX, maxCenterX);
      const clampedY = Phaser.Math.Clamp(this.player.y, minCenterY, maxCenterY);
      if (clampedX !== this.player.x || clampedY !== this.player.y) {
        this.player.x = clampedX;
        this.player.y = clampedY;
        bodyBB.reset(this.player.x, this.player.y);
      }

      this.lastValidPos.x = this.player.x;
      this.lastValidPos.y = this.player.y;
    }

    // live debug: show map size and player's tile coords
    if (this.collisionDebugText && this.map) {
      const centerX = this.player.x;
      const centerY = this.player.y;
      const tx = this.map.worldToTileX(centerX);
      const ty = this.map.worldToTileY(centerY);
      const info = [
        `map:${this.map.width}x${this.map.height}`,
        `playerTile:${tx},${ty}`,
        `slimes:${this.slimeGroup.countActive(true)}`,
        `key:${this.roomKey ? 'yes' : 'no'}`
      ];
      this.collisionDebugText.setText(info);
    }
  }

  createGameplayTextures() {
    if (!this.textures.exists('player-bullet')) {
      const bulletGraphics = this.add.graphics();
      bulletGraphics.fillStyle(0xfff176, 1);
      bulletGraphics.fillCircle(8, 8, 5);
      bulletGraphics.generateTexture('player-bullet', 16, 16);
      bulletGraphics.destroy();
    }

    if (!this.textures.exists('room-key')) {
      const keyGraphics = this.add.graphics();
      keyGraphics.fillStyle(0xffd54f, 1);
      keyGraphics.fillRect(2, 7, 12, 4);
      keyGraphics.fillRect(10, 5, 4, 8);
      keyGraphics.fillCircle(4, 9, 2);
      keyGraphics.generateTexture('room-key', 16, 16);
      keyGraphics.destroy();
    }
  }

  createSlimeAnimations() {
    Slime.ensureAnimations(this);
  }

  spawnRoomSlimes(room) {
    const spawnPoints = [
      { x: room.spawn.x - 180, y: room.spawn.y - 120 },
      { x: room.spawn.x + 180, y: room.spawn.y - 120 },
      { x: room.spawn.x, y: room.spawn.y + 160 }
    ];

    spawnPoints.forEach(({ x, y }) => {
      const slime = new Slime(this, x, y, {
        health: 3,
        speed: 70,
        detectionRange: 240,
        attackRange: 42
      });

      this.slimeGroup.add(slime);
      this.physics.add.collider(slime, this.wallLayer);
      this.physics.add.collider(slime, this.player);
    });
  }

  updateSlimes(time) {
    this.slimeGroup.getChildren().forEach((slime) => {
      if (slime.active) {
        slime.update(time, this.player);
      }
    });
  }

  updateRoomState() {
    if (this.roomKey || this.slimeGroup.countActive(true) > 0) {
      this.updateHud();
      return;
    }

    this.spawnRoomKey();
    this.showMessage('Todos los slimes fueron derrotados. Toma la llave.');
    this.updateHud();
  }

  spawnRoomKey() {
    if (this.roomKey) {
      return;
    }

    this.roomKey = this.physics.add.image(this.map.widthInPixels / 2, this.map.heightInPixels / 2, 'room-key');
    this.roomKey.setImmovable(true);
    this.roomKey.body.setAllowGravity(false);
    this.roomKey.setDepth(22);
    this.physics.add.overlap(this.player, this.roomKey, this.collectRoomKey, null, this);
  }

  collectRoomKey() {
    if (!this.roomKey || this.gameOver) {
      return;
    }

    this.roomKey.destroy();
    this.roomKey = null;
    this.score += 100;
    this.updateHud();
    this.showMessage('Room completado');

    this.time.delayedCall(500, () => {
      this.scene.restart({ roomIndex: this.roomIndex + 1, score: this.score });
    });
  }

  fireProjectile() {
    if (this.gameOver) {
      return;
    }

    const projectile = this.projectiles.get(this.player.x, this.player.y, 'player-bullet');
    if (!projectile) {
      return;
    }

    const direction = this.getFacingDirection();
    projectile.setActive(true);
    projectile.setVisible(true);
    projectile.body.reset(this.player.x, this.player.y);
    projectile.body.setAllowGravity(false);
    projectile.body.setSize(8, 8, true);
    projectile.setDepth(24);
    projectile.setVelocity(direction.x * 380, direction.y * 380);
    projectile.damage = 1;
    projectile.expiresAt = this.time.now + 900;

    this.showMessage('');
  }

  updateProjectiles(time) {
    this.projectiles.getChildren().forEach((projectile) => {
      if (!projectile.active) {
        return;
      }

      if (time >= projectile.expiresAt) {
        projectile.destroy();
      }
    });
  }

  destroyProjectile(projectile) {
    if (projectile && projectile.active) {
      projectile.destroy();
    }
  }

  hitSlime(projectile, slime) {
    if (!projectile.active || !slime.active) {
      return;
    }

    projectile.destroy();
    slime.takeDamage(projectile.damage || 1);
    this.score += 10;
    this.updateHud();
  }

  damagePlayer(amount = 1) {
    if (this.gameOver) {
      return;
    }

    if (this.time.now < this.playerInvulnerableUntil) {
      return;
    }

    this.playerHealth -= amount;
    this.playerInvulnerableUntil = this.time.now + 700;
    this.player.setTint(0xff6666);
    this.time.delayedCall(120, () => {
      if (this.player && this.player.active) {
        this.player.clearTint();
      }
    });

    this.updateHud();

    if (this.playerHealth <= 0) {
      this.gameOver = true;
      this.scene.start('GameOverScene', { score: this.score });
    }
  }

  updateHud() {
    if (!this.hudText) {
      return;
    }

    const aliveSlimes = this.slimeGroup ? this.slimeGroup.countActive(true) : 0;
    this.hudText.setText(
      `Nivel: ${this.roomIndex} | Vida: ${Math.max(this.playerHealth, 0)} | Slimes: ${aliveSlimes} | Puntos: ${this.score}`
    );
  }

  getFacingDirection() {
    if (this.lastFacing.anim === 'walk-side') {
      return new Phaser.Math.Vector2(this.lastFacing.flipX ? -1 : 1, 0);
    }

    if (this.lastFacing.anim === 'walk-up') {
      return new Phaser.Math.Vector2(0, -1);
    }

    return new Phaser.Math.Vector2(0, 1);
  }

  showMessage(text) {
    if (!this.messageText) {
      return;
    }

    this.messageText.setText(text);
    if (text) {
      this.time.delayedCall(1200, () => {
        if (this.messageText) {
          this.messageText.setText('');
        }
      });
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

  toggleTileDebugOverlay() {
    if (!this.tileDebugContainer) {
      this.createTileDebugOverlay();
    }

    this.tileDebugContainer.setVisible(!this.tileDebugContainer.visible);
  }

  createSmallMap(room) {
    // keep current room available for debug overlay
    this.currentRoom = room;
    if (room.showTilesetReference) {
      this.createTilesetReferenceMap(room);
      return;
    }

    if (room.tileGrid) {
      this.createTileGridMap(room);
      return;
    }

    const width = room.width;
    const height = room.height;

    this.map = this.make.tilemap({
      width,
      height,
      tileWidth: room.tileSize,
      tileHeight: room.tileSize
    });

    const tileset = this.map.addTilesetImage('tileset');
    const floorLayer = this.map.createBlankLayer('floor', tileset, 0, 0);
    const wallLayer = this.map.createBlankLayer('walls', tileset, 0, 0);
    const decoLayer = this.map.createBlankLayer('deco', tileset, 0, 0);

    this.floorLayer = floorLayer;
    this.wallLayer = wallLayer;
    this.decoLayer = decoLayer;

    const floorTiles = room.floorTiles;
    const wallTile = room.wallTile;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const floorIndex = floorTiles[
          (x * room.floorPattern.xMultiplier + y * room.floorPattern.yMultiplier) % floorTiles.length
        ];
        floorLayer.putTileAt(floorIndex, x, y);
      }
    }

    room.wallRects.forEach((rect) => {
      this.drawRectWalls(wallLayer, rect.x, rect.y, rect.width, rect.height, wallTile);
    });

    room.doors.forEach((door) => {
      this.carveDoor(wallLayer, door.x, door.y, door.length, door.horizontal);
    });

    room.decor.forEach(({ x, y, tile }) => decoLayer.putTileAt(tile, x, y));

    // Only these tile indices should act as blocking collisions
    const blockingIndices = [0, 1, 2, 10, 12, 20, 21, 22];
    wallLayer.setCollision(blockingIndices);

    floorLayer.setDepth(0);
    wallLayer.setDepth(5);
    decoLayer.setDepth(10);

    this.groundLayer = wallLayer;
  }

  createTileGridMap(room) {
    const height = room.tileGrid.length;
    const width = room.tileGrid[0]?.length ?? 0;

    this.map = this.make.tilemap({
      width,
      height,
      tileWidth: room.tileSize,
      tileHeight: room.tileSize
    });

    const tileset = this.map.addTilesetImage('tileset');
    const floorLayer = this.map.createBlankLayer('floor', tileset, 0, 0);
    const wallLayer = this.map.createBlankLayer('walls', tileset, 0, 0);
    const decoLayer = this.map.createBlankLayer('deco', tileset, 0, 0);

    this.floorLayer = floorLayer;
    this.wallLayer = wallLayer;
    this.decoLayer = decoLayer;

    const walkableTiles = new Set(room.walkableTiles || []);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const tileIndex = room.tileGrid[y][x];
        if (walkableTiles.has(tileIndex)) {
          floorLayer.putTileAt(tileIndex, x, y);
        } else {
          wallLayer.putTileAt(tileIndex, x, y);
        }
      }
    }

    wallLayer.setCollisionByExclusion([-1]);

    floorLayer.setDepth(0);
    wallLayer.setDepth(5);
    decoLayer.setDepth(10);

    this.groundLayer = wallLayer;
  }

  createTilesetReferenceMap(room) {
    const tilesetTexture = this.textures.get('tileset').getSourceImage();
    const columns = Math.floor(tilesetTexture.width / room.tileSize);
    const rows = Math.floor(tilesetTexture.height / room.tileSize);

    this.map = this.make.tilemap({
      width: columns,
      height: rows,
      tileWidth: room.tileSize,
      tileHeight: room.tileSize
    });

    const tileset = this.map.addTilesetImage('tileset');
    const floorLayer = this.map.createBlankLayer('floor', tileset, 0, 0);
    const wallLayer = this.map.createBlankLayer('walls', tileset, 0, 0);
    const decoLayer = this.map.createBlankLayer('deco', tileset, 0, 0);

    this.floorLayer = floorLayer;
    this.wallLayer = wallLayer;
    this.decoLayer = decoLayer;

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        floorLayer.putTileAt(y * columns + x, x, y);
      }
    }

    floorLayer.setDepth(0);
    wallLayer.setDepth(5);
    decoLayer.setDepth(10);

    this.groundLayer = wallLayer;
  }

  createTileDebugOverlay() {
    this.tileDebugContainer = this.add.container(0, 0).setDepth(900).setVisible(false);

    const room = this.currentRoom || {};
    const walkable = new Set(room.walkableTiles || []);
    const blockingLogical = new Set([0, 1, 2, 10, 12, 20, 21, 22]);

    for (let y = 0; y < this.map.height; y += 1) {
      for (let x = 0; x < this.map.width; x += 1) {
        const decoTile = this.decoLayer.getTileAt(x, y);
        const wallTile = this.wallLayer.getTileAt(x, y);
        const floorTile = this.floorLayer.getTileAt(x, y);

        const topTile = decoTile || wallTile || floorTile;
        const logicalIndex = topTile && topTile.index !== -1 ? topTile.index : -1;

        // background rectangle to show blocking (red) / walkable (green) / empty (transparent)
        const gfx = this.add.rectangle(
          x * this.map.tileWidth + this.map.tileWidth / 2,
          y * this.map.tileHeight + this.map.tileHeight / 2,
          this.map.tileWidth,
          this.map.tileHeight,
          0x000000,
          0
        );

        if (logicalIndex !== -1) {
          if (walkable.has(logicalIndex)) {
            gfx.setFillStyle(0x00ff00, 0.15);
          } else if (blockingLogical.has(logicalIndex)) {
            gfx.setFillStyle(0xff0000, 0.2);
          } else {
            gfx.setFillStyle(0xffff00, 0.08);
          }
        }

        const label = this.add.text(
          x * this.map.tileWidth + 2,
          y * this.map.tileHeight + 2,
          `${logicalIndex}`,
          {
            fontSize: '10px',
            color: '#00ff8a'
          }
        );

        this.tileDebugContainer.add(gfx);
        this.tileDebugContainer.add(label);
      }
    }
  }

  drawRectWalls(layer, x, y, width, height, tileIndex) {
    for (let tx = x; tx < x + width; tx += 1) {
      layer.putTileAt(tileIndex, tx, y);
      layer.putTileAt(tileIndex, tx, y + height - 1);
    }

    for (let ty = y; ty < y + height; ty += 1) {
      layer.putTileAt(tileIndex, x, ty);
      layer.putTileAt(tileIndex, x + width - 1, ty);
    }
  }

  carveDoor(layer, x, y, length, horizontal) {
    for (let i = 0; i < length; i += 1) {
      const tx = horizontal ? x + i : x;
      const ty = horizontal ? y : y + i;
      layer.removeTileAt(tx, ty);
    }
  }

  onPlayerTileCollision(player, tile) {
    try {
      // tile may be a Tile object when colliding with a TilemapLayer
      const idx = tile && tile.index !== undefined ? tile.index : -1;
      const tx = tile && tile.x !== undefined ? tile.x : null;
      const ty = tile && tile.y !== undefined ? tile.y : null;
      // get what each layer has at that coord
      const floorT = tx !== null ? this.floorLayer.getTileAt(tx, ty) : null;
      const wallT = tx !== null ? this.wallLayer.getTileAt(tx, ty) : null;
      const decoT = tx !== null ? this.decoLayer.getTileAt(tx, ty) : null;

      console.log('--- Player collision debug ---');
      console.log('collided tile.index:', idx, 'tile coords:', tx, ty);
      console.log('floorLayer tile.index:', floorT && floorT.index, 'wallLayer tile.index:', wallT && wallT.index, 'decoLayer tile.index:', decoT && decoT.index);
      console.log('room.walkableTiles:', this.currentRoom && this.currentRoom.walkableTiles);

      // highlight the tile briefly
      const worldX = tile.pixelX + this.map.tileWidth / 2;
      const worldY = tile.pixelY + this.map.tileHeight / 2;
      const rect = this.add.rectangle(worldX, worldY, this.map.tileWidth, this.map.tileHeight, 0xff0000, 0.4).setDepth(2000);
      this.time.delayedCall(200, () => rect.destroy());
      if (this.collisionDebugText) {
        this.collisionDebugText.setText([
          `collided: idx=${idx} @(${tx},${ty})`,
          `floor=${floorT && floorT.index} wall=${wallT && wallT.index} deco=${decoT && decoT.index}`,
          `walkable=${JSON.stringify(this.currentRoom && this.currentRoom.walkableTiles)}`
        ]);
      }
    } catch (e) {
      // ignore if tile is undefined
      // console.error(e);
    }
  }
}
