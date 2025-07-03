export class GameScene extends Phaser.Scene {

    constructor() {
        super('GameScene');
        this.boardSize = 10; // 10x10 grid
        this.tileSize = 60; // Size of each tile
        this.boardOffsetX = 1; // X offset for the board
        this.boardOffsetY = 150; // Y offset for the board
        this.selectedTile = null; // Currently selected tile
        this.canMove = true; // Flag to control if player can make moves
        this.matchTypes = ['crystal', 'heart', 'star']; // Available tile types
    }

    preload() {
        // Assets are preloaded in PreloaderScene
    }

    create() {
        // Add background
        this.add.image(300, 400, 'background');

        // add platfrom
        this.platform = this.physics.add.image(300, 750, 'platform');
        this.platform.setVelocityY(0); // Slow falling speed
        this.platform.setCollideWorldBounds(true);

        // Add falling brickwall
        this.brickwall = this.physics.add.image(300, -460, 'brickwall');
        this.brickwall.setDepth(1);
        this.brickwall.setVelocityY(5); // Slow falling speed

        // Create physics group for blocks
        this.blocksGroup = this.physics.add.group({
            collideWorldBounds: true,
            bounceX: 0,
            bounceY: 0,
        });
        this.blocksGroup.setVelocityY(0);

        // Create game board
        this.board = [];
        this.createBoard();

        // Add player as physics sprite
        // const playerPositionX = Phaser.Math.RND.pick([30, 90, 150, 210, 270, 330, 390, 450, 510, 570]);
        // this.player = this.physics.add.sprite(playerPositionX, 100, 'player');
        // this.player.setVelocityY(100);
        // this.player.setCollideWorldBounds(true);
        // this.player.setImmovable(true);

        // Add physics collision
        //this.physics.add.collider(this.player, this.blocksGroup);
        this.physics.add.collider(this.blocksGroup, this.platform);
        this.physics.add.collider(this.blocksGroup, this.blocksGroup);
        //this.physics.add.collider(this.player, this.brickwall, this.gameOver, null, this);
        //this.physics.add.collider(this.player, this.platform, this.gameSuccess, null, this);

        // Add input event listeners
        this.input.on('gameobjectdown', this.onTileClick, this);
    }

    createBoard() {
        // Create from bottom to top (reverse row order)
        for (let row = this.boardSize - 1; row >= 0; row--) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                const x = this.boardOffsetX + col * this.tileSize + this.tileSize / 2;
                const y = this.boardOffsetY + row * this.tileSize + this.tileSize / 2;

                // Create physics sprite
                const tile = this.blocksGroup.create(x, y, Phaser.Math.RND.pick(this.matchTypes));
                tile.setScale(this.tileSize / tile.width * 0.983);
                tile.setData('row', row);
                tile.setData('col', col);
                tile.setImmovable(true);

                // Enable physics for this tile
                this.enableTilePhysics(tile);

                // Add to board and physics group
                this.board[row][col] = tile;
            }
        }
        this.checkAllMatches(true);
    }

    enableTilePhysics(tile) {
        // Enable physics body and set gravity
        this.physics.world.enable(tile);
        tile.body.setGravityY(1000); // Adjust gravity strength as needed
        tile.body.setAllowGravity(false); // Start with gravity disabled
    }

    onTileClick(pointer, tile) {
        if (!this.canMove) return;

        if (!this.selectedTile) {
            this.selectedTile = tile;
            tile.setTint(0xffff00);
            return;
        }

        // Check if tiles are adjacent
        const tile1 = this.selectedTile;
        const tile2 = tile;
        const row1 = tile1.getData('row');
        const col1 = tile1.getData('col');
        const row2 = tile2.getData('row');
        const col2 = tile2.getData('col');

        const isAdjacent =
            (Math.abs(row1 - row2) === 1 && col1 === col2) ||
            (Math.abs(col1 - col2) === 1 && row1 === row2);

        if (!isAdjacent) {
            this.selectedTile.clearTint();
            this.selectedTile = null;
            return;
        }

        // Swap tiles
        this.swapTiles(tile1, tile2);
    }

    swapTiles(tile1, tile2) {
        this.canMove = false;

        // Get positions
        const row1 = tile1.getData('row');
        const col1 = tile1.getData('col');
        const row2 = tile2.getData('row');
        const col2 = tile2.getData('col');

        // Swap board positions
        this.board[row1][col1] = tile2;
        this.board[row2][col2] = tile1;

        // Update tile data
        tile1.setData('row', row2);
        tile1.setData('col', col2);
        tile2.setData('row', row1);
        tile2.setData('col', col1);

        // Animate swap
        this.tweens.add({
            targets: tile1,
            x: this.boardOffsetX + col2 * this.tileSize + this.tileSize / 2,
            y: this.boardOffsetY + row2 * this.tileSize + this.tileSize / 2,
            duration: 300,
            ease: 'Sine.easeOut'
        });

        this.tweens.add({
            targets: tile2,
            x: this.boardOffsetX + col1 * this.tileSize + this.tileSize / 2,
            y: this.boardOffsetY + row1 * this.tileSize + this.tileSize / 2,
            duration: 300,
            ease: 'Sine.easeOut',
            onComplete: () => {
                // Check for matches after swap
                this.checkAllMatches();
            }
        });

        // Reset selection
        this.selectedTile.clearTint();
        this.selectedTile = null;
    }

    checkAllMatches(isInitialCheck = false) {
        const matches = [];

        // Check horizontal matches
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize - 2; col++) {
                const tile1 = this.board[row][col];
                const tile2 = this.board[row][col+1];
                const tile3 = this.board[row][col+2];

                if (tile1 && tile2 && tile3 &&
                    tile1.texture.key === tile2.texture.key &&
                    tile2.texture.key === tile3.texture.key) {
                    matches.push(tile1, tile2, tile3);

                    // Check for longer matches
                    let nextCol = col + 3;
                    while (nextCol < this.boardSize &&
                           this.board[row][nextCol] &&
                           this.board[row][nextCol].texture.key === tile1.texture.key) {
                        matches.push(this.board[row][nextCol]);
                        nextCol++;
                    }
                }
            }
        }

        // Check vertical matches
        for (let col = 0; col < this.boardSize; col++) {
            for (let row = 0; row < this.boardSize - 2; row++) {
                const tile1 = this.board[row][col];
                const tile2 = this.board[row+1][col];
                const tile3 = this.board[row+2][col];

                if (tile1 && tile2 && tile3 &&
                    tile1.texture.key === tile2.texture.key &&
                    tile2.texture.key === tile3.texture.key) {
                    matches.push(tile1, tile2, tile3);

                    // Check for longer matches
                    let nextRow = row + 3;
                    while (nextRow < this.boardSize &&
                           this.board[nextRow][col] &&
                           this.board[nextRow][col].texture.key === tile1.texture.key) {
                        matches.push(this.board[nextRow][col]);
                        nextRow++;
                    }
                }
            }
        }

        // Process matches if found
        if (matches.length > 0) {
            // Mark matched tiles
            matches.forEach(tile => tile.setData('matched', true));

            if (!isInitialCheck) {
                this.processMatches();
            }
            return true;
        }

        return false;
    }

    processMatches() {
        this.canMove = false;

        // Find all matched tiles
        const matchedTiles = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = this.board[row][col];
                if (tile && tile.getData('matched')) {
                    matchedTiles.push(tile);
                }
            }
        }

        // Remove matched tiles
        matchedTiles.forEach(tile => {
            const row = tile.getData('row');
            const col = tile.getData('col');

            // Animate removal
            this.tweens.add({
                targets: tile,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    // Remove from physics group before destroying
                    this.blocksGroup.remove(tile, true, true);
                    tile.destroy();
                    this.board[row][col] = null;
                }
            });
        });

        // After delay, make tiles fall
        this.time.delayedCall(500, () => this.makeTilesFall());
    }

    makeTilesFall() {
        let hasTilesFallen = false;

        // Process from bottom to top
        for (let col = 0; col < this.boardSize; col++) {
            for (let row = this.boardSize - 1; row >= 0; row--) {
                if (!this.board[row][col]) {
                    // Find first tile above to fall
                    for (let aboveRow = row - 1; aboveRow >= 0; aboveRow--) {
                        const tile = this.board[aboveRow][col];
                        if (tile) {
                            // Update board positions
                            this.board[row][col] = tile;
                            this.board[aboveRow][col] = null;

                            // Update tile data
                            tile.setData('row', row);
                            tile.setData('col', col);

                            // Animate fall
                            this.tweens.add({
                                targets: tile,
                                y: this.boardOffsetY + row * this.tileSize + this.tileSize / 2,
                                duration: 300,
                                ease: 'Bounce',
                                onComplete: () => {
                                    // Re-add to physics group
                                    this.blocksGroup.add(tile);
                                }
                            });

                            hasTilesFallen = true;
                            break;
                        }
                    }
                }
            }
        }

        // Check for new matches after falling
        if (hasTilesFallen) {
            this.time.delayedCall(400, () => {
                const hasMatches = this.checkAllMatches();
                if (hasMatches) {
                    this.processMatches();
                } else {
                    this.canMove = true;
                }
            });
        } else {
            this.canMove = true;
        }
    }

    fallTiles(column) {
        // Enable gravity for all tiles above in this column
        for (let row = 0; row < this.boardSize; row++) {
            const tile = this.board[row][column];
            if (tile && tile.body) {
                tile.body.setAllowGravity(true);
            }
        }
    }

    removeMatch(match) {
        const matchedColumns = new Set();

        // Remove all tiles in the match
        match.forEach(tile => {
            const row = tile.getData('row');
            const col = tile.getData('col');
            matchedColumns.add(col);

            // Remove tile from board
            this.board[row][col] = null;
            tile.destroy();
        });

        // Trigger falling in all affected columns
        matchedColumns.forEach(col => {
            this.fallTiles(col);
        });

        // Wait for animations to complete before refilling
        this.time.delayedCall(500, () => {
            this.fallTiles();
            this.refillBoard();
            this.checkAllMatches();
        }, [], this);
    }

    refillBoard() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (!this.board[row][col]) {
                    const x = this.boardOffsetX + col * this.tileSize + this.tileSize / 2;
                    const y = this.boardOffsetY + row * this.tileSize + this.tileSize / 2;

                    // Create physics sprite
                    const tile = this.blocksGroup.create(x, y, Phaser.Math.RND.pick(this.matchTypes));
                    tile.setScale(this.tileSize / tile.width * 0.983);
                    tile.setData('row', row);
                    tile.setData('col', col);

                    // Enable physics for this tile
                    this.enableTilePhysics(tile);

                    // Add to board and physics group
                    this.board[row][col] = tile;
                }
            }
        }
    }

    update() {
        // Physics updates
        if (this.brickwall && Math.abs(this.brickwall.body.velocity.y) < 10) {
            this.brickwall.setVelocityY(0);
        }

        if (this.player && !this.player.body.blocked.down && this.player.body.velocity.y < 100) {
            this.player.setVelocityY(this.player.body.velocity.y + 10);
        }
    }

    gameOver() {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.time.delayedCall(1000, () => this.scene.start('GameoverScene'));
    }

    gameSuccess() {
        this.physics.pause();
        this.player.setTint(0x00ff00);
        this.time.delayedCall(1000, () => this.scene.start('GamesuccessScene'));
    }
}
