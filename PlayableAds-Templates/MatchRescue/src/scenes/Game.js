import Player from '../gameObjects/Player.js';

export class Game extends Phaser.Scene {

    constructor() {
        super('Game');
        // 移除固定的棋盘大小，在create方法中根据屏幕尺寸动态计算
        this.selectedTile = null; // Currently selected tile
        this.canMove = true; // Flag to control if player can make moves
        this.matchTypes = ['crystal', 'heart', 'star']; // Available tile types
    }

    preload() {
        // Assets are preloaded in PreloaderScene
    }

    create() {
        // 获取屏幕尺寸
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        // 根据屏幕比例动态计算合适的棋盘行列数
        const aspectRatio = gameWidth / gameHeight;

        if (aspectRatio > 1.5) {
            // 宽屏设备（如横屏手机、平板）
            this.boardCols = 10;
            this.boardRows = 8;
        } else if (aspectRatio > 0.8) {
            // 接近正方形或略宽（如iPad）
            this.boardCols = 8;
            this.boardRows = 10;
        } else {
            // 竖屏设备（如竖屏手机）
            this.boardCols = 8;
            this.boardRows = 12;
        }

        // 根据屏幕尺寸和棋盘大小计算合适的瓦片尺寸
        const availableWidth = gameWidth * 0.9; // 预留10%边距
        const availableHeight = gameHeight * 0.6; // 棋盘占屏幕高度60%

        const maxTileWidth = availableWidth / this.boardCols;
        const maxTileHeight = availableHeight / this.boardRows;

        // 选择较小的尺寸以确保棋盘完全可见，并设置合理的最小最大值
        this.tileSize = Math.max(30, Math.min(60, Math.min(maxTileWidth, maxTileHeight)));

        // 计算棋盘偏移量（居中对齐）
        this.boardOffsetX = (gameWidth - this.boardCols * this.tileSize) / 2;
        this.boardOffsetY = gameHeight * 0.2; // 从屏幕高度的20%开始

        // Add background - 居中显示
        this.add.image(gameWidth / 2, gameHeight / 2, 'background');

        // Add sound
        this.backgroundSound = this.sound.add('background', { volume: 0.5 });
        this.backgroundSound.play();

        this.matchSound = this.sound.add('match-sound', { volume: 0.5 });
        this.gameOverSound = this.sound.add('game-over', { volume: 0.8 });
        this.gameSuccessSound = this.sound.add('game-success', { volume: 0.8 });

        // Add physics group for tiles
        this.blocksGroup = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // Create game board
        this.board = [];
        this.createBoard();

        // Add player - 计算可能的X位置（基于棋盘列）
        const possibleXPositions = [];
        for (let i = 0; i < this.boardCols; i++) {
            possibleXPositions.push(this.boardOffsetX + i * this.tileSize + this.tileSize / 2);
        }
        const playerPositionX = Phaser.Math.RND.pick(possibleXPositions);
        const playerPositionY = this.boardOffsetY - gameHeight * 0.06; // 在棋盘上方

        this.player = new Player(this, playerPositionX, playerPositionY);
        this.player.setVelocityY(100);
        this.player.anxiety();

        // Add physics collision
        this.physics.add.collider(this.player, this.blocksGroup);

        // Add Platform - 在屏幕底部
        this.platform = this.physics.add.sprite(gameWidth / 2, gameHeight * 0.95, 'platform');
        this.platform.setImmovable(true); // can not move
        this.platform.body.allowGravity = false; // disable gravity

        this.physics.add.collider(this.player, this.platform, this.gameSuccess, null, this);

        // Add falling brickwall - 从屏幕顶部上方开始
        this.brickwall = this.physics.add.sprite(gameWidth / 2, -gameHeight * 0.5, 'brickwall');
        this.brickwall.setDepth(1);
        this.brickwall.body.allowGravity = false; // Disable gravity to maintain constant speed
        this.brickwall.setVelocityY(20); // Very slow falling speed

        this.physics.add.collider(this.player, this.brickwall, this.gameOver, null, this);

        // Add input event listeners
        this.input.on('gameobjectdown', this.onTileClick, this);
    }

    createBoard() {
        // Create a 2D array to represent the board
        for (let row = 0; row < this.boardRows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardCols; col++) {
                const tile = this.createTile(row, col);
                this.blocksGroup.add(tile);
            }
        }

        // Check for initial matches and replace them
        this.checkAllMatches(true);
    }

    createTile(row, col) {
        // Randomly select a tile type
        const randomType = Phaser.Math.RND.pick(this.matchTypes);

        // Calculate the position
        const x = this.boardOffsetX + col * this.tileSize + this.tileSize / 2;
        const y = this.boardOffsetY + row * this.tileSize + this.tileSize / 2;

        // Create the tile sprite
        const tile = this.physics.add.sprite(x, y, randomType);
        tile.setScale(this.tileSize / tile.width * 0.98); // Scale to fit the tile size with some padding
        tile.setInteractive(); // Make it interactive for input events

        // Configure physics
        tile.body.setImmovable(true);
        tile.body.allowGravity = false;

        // Store the tile properties
        tile.setData({
            row: row,
            col: col,
            type: randomType,
            matched: false
        });

        // Add to the board array
        this.board[row][col] = tile;

        return tile;
    }

    onTileClick(pointer, tile) {
        if (!this.canMove) return;

        // If no tile is selected, select this one
        if (!this.selectedTile) {
            this.selectedTile = tile;
            // Enhanced visual indication of selection
            tile.setTint(0xffff00);

            // Add a pulsing scale effect for better visibility
            this.tweens.add({
                targets: tile,
                scale: tile.scale * 1.1,
                duration: 300,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Store the tween reference to stop it later
            tile.highlightTween = this.tweens.getTweensOf(tile)[0];
            return;
        }

        // If the same tile is clicked again, deselect it
        if (this.selectedTile === tile) {
            this.clearTileSelection();
            return;
        }

        // Check if the tiles are adjacent
        const row1 = this.selectedTile.getData('row');
        const col1 = this.selectedTile.getData('col');
        const row2 = tile.getData('row');
        const col2 = tile.getData('col');

        const isAdjacent = (
            (Math.abs(row1 - row2) === 1 && col1 === col2) ||
            (Math.abs(col1 - col2) === 1 && row1 === row2)
        );

        if (isAdjacent) {
            // Swap the tiles
            this.swapTiles(this.selectedTile, tile);
        } else {
            // Not adjacent, deselect first tile and select the new one
            this.clearTileSelection();
            this.selectedTile = tile;
            this.highlightTile(tile);
        }
    }

    clearTileSelection() {
        if (this.selectedTile) {
            this.selectedTile.clearTint();
            if (this.selectedTile.highlightTween) {
                this.selectedTile.highlightTween.stop();
                this.selectedTile.setScale(this.tileSize / this.selectedTile.width * 0.98);
            }
            this.selectedTile = null;
        }
    }

    highlightTile(tile) {
        tile.setTint(0xffff00);
        this.tweens.add({
            targets: tile,
            scale: tile.scale * 1.1,
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        tile.highlightTween = this.tweens.getTweensOf(tile)[0];
    }

    swapTiles(tile1, tile2) {
        this.canMove = false;
        this.clearTileSelection();

        // Store the original positions
        const tile1Pos = { x: tile1.x, y: tile1.y };
        const tile2Pos = { x: tile2.x, y: tile2.y };

        // Swap the data in the board array
        const tempRow = tile1.getData('row');
        const tempCol = tile1.getData('col');

        this.board[tile2.getData('row')][tile2.getData('col')] = tile1;
        this.board[tempRow][tempCol] = tile2;

        // Update the data objects
        const tempData = { row: tile1.getData('row'), col: tile1.getData('col') };
        tile1.setData('row', tile2.getData('row'));
        tile1.setData('col', tile2.getData('col'));
        tile2.setData('row', tempData.row);
        tile2.setData('col', tempData.col);

        // Animate the swap
        this.tweens.add({
            targets: tile1,
            x: tile2Pos.x,
            y: tile2Pos.y,
            duration: 200,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: tile2,
            x: tile1Pos.x,
            y: tile1Pos.y,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                // Check for matches after the swap
                const hasMatches = this.checkAllMatches();

                if (!hasMatches) {
                    // If no matches, swap back
                    this.swapTilesBack(tile1, tile2, tile1Pos, tile2Pos);
                } else {
                    this.processMatches();
                }
            }
        });
    }

    swapTilesBack(tile1, tile2, tile1Pos, tile2Pos) {
        // Swap the data in the board array back
        const tempRow = tile1.getData('row');
        const tempCol = tile1.getData('col');

        this.board[tile2.getData('row')][tile2.getData('col')] = tile1;
        this.board[tempRow][tempCol] = tile2;

        // Update the data objects back
        const tempData = { row: tile1.getData('row'), col: tile1.getData('col') };
        tile1.setData('row', tile2.getData('row'));
        tile1.setData('col', tile2.getData('col'));
        tile2.setData('row', tempData.row);
        tile2.setData('col', tempData.col);

        // Animate the swap back
        this.tweens.add({
            targets: tile1,
            x: tile1Pos.x,
            y: tile1Pos.y,
            duration: 200,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: tile2,
            x: tile2Pos.x,
            y: tile2Pos.y,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                this.canMove = true;
            }
        });
    }

    checkAllMatches(isInitialCheck = false) {
        let hasMatches = false;

        // Reset all matched flags first
        if (!isInitialCheck) {
            for (let row = 0; row < this.boardRows; row++) {
                for (let col = 0; col < this.boardCols; col++) {
                    const tile = this.board[row][col];
                    if (tile) {
                        tile.setData('matched', false);
                    }
                }
            }
        }

        // Track all matched positions - use Set to avoid duplicates
        const matchedPositions = new Set();

        // Check horizontal matches
        for (let row = 0; row < this.boardRows; row++) {
            for (let col = 0; col <= this.boardCols - 3; col++) {
                const tile1 = this.board[row][col];
                const tile2 = this.board[row][col + 1];
                const tile3 = this.board[row][col + 2];

                if (tile1 && tile2 && tile3 &&
                    tile1.getData('type') === tile2.getData('type') &&
                    tile2.getData('type') === tile3.getData('type')) {

                    hasMatches = true;

                    if (isInitialCheck) {
                        // For initial board setup, just replace the tile
                        const newType = this.getNewTileType(tile1.getData('type'));
                        tile3.setTexture(newType);
                        tile3.setData('type', newType);
                    } else {
                        // Store matched positions using unique keys
                        matchedPositions.add(`${row},${col}`);
                        matchedPositions.add(`${row},${col+1}`);
                        matchedPositions.add(`${row},${col+2}`);

                        // Check for longer matches
                        let extendCol = col + 3;
                        while (extendCol < this.boardCols && this.board[row][extendCol] &&
                               this.board[row][extendCol].getData('type') === tile1.getData('type')) {
                            matchedPositions.add(`${row},${extendCol}`);
                            extendCol++;
                        }
                    }
                }
            }
        }

        // Check vertical matches
        for (let col = 0; col < this.boardCols; col++) {
            for (let row = 0; row <= this.boardRows - 3; row++) {
                const tile1 = this.board[row][col];
                const tile2 = this.board[row + 1][col];
                const tile3 = this.board[row + 2][col];

                if (tile1 && tile2 && tile3 &&
                    tile1.getData('type') === tile2.getData('type') &&
                    tile2.getData('type') === tile3.getData('type')) {

                    hasMatches = true;

                    if (isInitialCheck) {
                        // For initial board setup, just replace the tile
                        const newType = this.getNewTileType(tile1.getData('type'));
                        tile3.setTexture(newType);
                        tile3.setData('type', newType);
                    } else {
                        // Store matched positions using unique keys
                        matchedPositions.add(`${row},${col}`);
                        matchedPositions.add(`${row+1},${col}`);
                        matchedPositions.add(`${row+2},${col}`);

                        // Check for longer matches
                        let extendRow = row + 3;
                        while (extendRow < this.boardRows && this.board[extendRow][col] &&
                               this.board[extendRow][col].getData('type') === tile1.getData('type')) {
                            matchedPositions.add(`${extendRow},${col}`);
                            extendRow++;
                        }
                    }
                }
            }
        }

        // Mark matched tiles after all checks
        if (!isInitialCheck && matchedPositions.size > 0) {
            // Set matched flag for all matched positions
            for (const posKey of matchedPositions) {
                const [row, col] = posKey.split(',').map(Number);
                const tile = this.board[row][col];
                if (tile) {
                    tile.setData('matched', true);
                }
            }
        }

        return hasMatches;
    }

    getNewTileType(currentType) {
        // Get a different tile type than the current one
        const availableTypes = this.matchTypes.filter(type => type !== currentType);
        return Phaser.Math.RND.pick(availableTypes);
    }

    processMatches() {
        this.matchSound.play();

        let matchCount = 0;

        // First, remove all matched tiles
        for (let row = 0; row < this.boardRows; row++) {
            for (let col = 0; col < this.boardCols; col++) {
                const tile = this.board[row][col];
                if (tile && tile.getData('matched') === true) {
                    matchCount++;

                    // Remove from physics group immediately
                    this.blocksGroup.remove(tile, true, false);

                    // Animate the tile removal
                    this.tweens.add({
                        targets: tile,
                        alpha: 0,
                        scale: 0.5,
                        duration: 300,
                        ease: 'Power2',
                        onComplete: () => {
                            // Destroy the tile
                            tile.destroy();
                        }
                    });

                    // Clear the reference in the board array immediately
                    this.board[row][col] = null;
                }
            }
        }

        // After a delay, make the tiles fall and create new ones
        this.time.delayedCall(350, () => {
            this.makeTilesFall();
        });
    }

    makeTilesFall() {
        let hasTilesFallen = false;

        // Process from bottom to top
        for (let col = 0; col < this.boardCols; col++) {
            for (let row = this.boardRows - 1; row >= 0; row--) {
                // If this position is empty, look for a tile above to fall down
                if (!this.board[row][col]) {
                    // Find the closest tile above
                    for (let aboveRow = row - 1; aboveRow >= 0; aboveRow--) {
                        if (this.board[aboveRow][col]) {
                            // Move this tile down
                            const tile = this.board[aboveRow][col];

                            // Update board references first
                            this.board[row][col] = tile;
                            this.board[aboveRow][col] = null;

                            // Update the tile's row data
                            tile.setData('row', row);

                            // Calculate new position
                            const newY = this.boardOffsetY + row * this.tileSize + this.tileSize / 2;

                            // Animate the fall
                            this.tweens.add({
                                targets: tile,
                                y: newY,
                                duration: 300,
                                ease: 'Bounce.easeOut',
                                onUpdate: () => {
                                    // Update physics body during animation
                                    if (tile.body) {
                                        tile.body.updateFromGameObject();
                                    }
                                },
                                onComplete: () => {
                                    // Ensure the tile is in the physics group
                                    if (!this.blocksGroup.contains(tile)) {
                                        this.blocksGroup.add(tile);
                                    }
                                    // Final physics body update
                                    if (tile.body) {
                                        tile.body.updateFromGameObject();
                                    }
                                }
                            });

                            hasTilesFallen = true;
                            break;
                        }
                    }
                }
            }
        }

        // Fill empty spaces at the top with new tiles
        /*
        for (let col = 0; col < this.boardCols; col++) {
            for (let row = 0; row < this.boardRows; row++) {
                if (!this.board[row][col]) {
                    const tile = this.createTile(row, col);

                    // Start the tile above the board and animate it falling - 使用自适应位置
                    tile.y = this.boardOffsetY - this.tileSize;

                    this.tweens.add({
                        targets: tile,
                        y: this.boardOffsetY + row * this.tileSize + this.tileSize / 2,
                        duration: 400,
                        ease: 'Bounce.easeOut',
                        onComplete: () => {
                            this.blocksGroup.add(tile);
                        }
                    });

                    hasTilesFallen = true;
                }
            }
        }
        */

        // After tiles have settled, check for new matches
        if (hasTilesFallen) {
            this.time.delayedCall(400, () => {
                const hasNewMatches = this.checkAllMatches();
                if (hasNewMatches) {
                    this.processMatches();
                } else {
                    this.canMove = true;
                }
            });
        } else {
            this.canMove = true;
        }
    }

    update() {
        // Ensure player physics are working correctly
        if (this.player && this.player.body) {
            // If player is not touching any solid ground and not already falling fast
            if (!this.player.body.blocked.down && Math.abs(this.player.body.velocity.y) < 50) {
                // Make sure gravity is applied
                this.player.body.allowGravity = true;
                // Give a small push if completely stuck
                if (this.player.body.velocity.y === 0) {
                    this.player.setVelocityY(50);
                }
            }
        }
    }

    gameOver() {
        this.gameOverSound.play();
        this.backgroundSound.stop();

        console.log('Game Over!');
        this.physics.pause();
        this.player.idle();
        this.player.setTint(0xff0000);
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOver');
        });
    }

    gameSuccess() {
        this.gameSuccessSound.play();
        this.backgroundSound.stop();

        console.log('Game Success!');
        this.physics.pause();
        this.player.idle();
        this.player.setTint(0x00ff00);
        this.time.delayedCall(1000, () => {
            this.scene.start('GameSuccess');
        });
    }
}
