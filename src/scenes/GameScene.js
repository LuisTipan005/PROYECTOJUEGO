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
    this.player.body.setSize(24, 24, true);

    this.physics.add.collider(this.player, this.groundLayer);

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

    wallLayer.setCollisionByExclusion([-1]);

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

    for (let y = 0; y < this.map.height; y += 1) {
      for (let x = 0; x < this.map.width; x += 1) {
        const decoTile = this.decoLayer.getTileAt(x, y);
        const wallTile = this.wallLayer.getTileAt(x, y);
        const floorTile = this.floorLayer.getTileAt(x, y);

        const topTile = decoTile || wallTile || floorTile;
        const tileIndex = topTile && topTile.index !== -1 ? topTile.index : -1;

        const label = this.add.text(
          x * this.map.tileWidth + 2,
          y * this.map.tileHeight + 2,
          `${tileIndex}`,
          {
            fontSize: '8px',
            color: '#00ff8a',
            backgroundColor: '#000000aa'
          }
        );

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
}
