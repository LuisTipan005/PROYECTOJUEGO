import Phaser from 'phaser';
import room01 from '../maps/room01.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }
  create() {
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

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.playerSpeed = 170;
    this.lastFacing = { anim: 'walk-down', flipX: false };

    this.add.text(12, 12, 'F: pantalla completa | G: debug tiles', {
      fontSize: '14px',
      color: '#ffffff'
    }).setDepth(1000).setScrollFactor(0);

    // on-screen collision debug text
    this.collisionDebugText = this.add.text(12, 32, '', {
      fontSize: '12px',
      color: '#ffdddd',
      backgroundColor: '#00000088'
    }).setDepth(1000).setScrollFactor(0);

    this.input.keyboard.on('keydown-F', this.toggleFullscreen, this);
    this.input.keyboard.on('keydown-G', this.toggleTileDebugOverlay, this);
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-F', this.toggleFullscreen, this);
      this.input.keyboard.off('keydown-G', this.toggleTileDebugOverlay, this);
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
      const info = [`map:${this.map.width}x${this.map.height}`, `playerTile:${tx},${ty}`];
      this.collisionDebugText.setText(info);
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
