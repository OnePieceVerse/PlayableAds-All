import Player from '../gameObjects/Player.js';

export class GameScene extends Phaser.Scene {

    constructor() {
        super('GameScene');
        this.boardSize = 10; // 10x10 grid
        this.tileSize = 60; // Size of each tile
        this.boardOffsetX = 1; // X offset for the board
        this.boardOffsetY = 200; // Y offset for the board
        this.selectedTile = null; // Currently selected tile
        this.canMove = true; // Flag to control if player can make moves
        this.matchTypes = ['crystal', 'heart', 'star']; // Available tile typess
    }

    preload() {
        // Assets are preloaded in PreloaderScene
    }

    create() {
        // Add background
        this.add.image(300, 400, 'background');

        // add falling brickwall
        this.brickwall = this.physics.add.image(300, -460, 'brickwall');
        this.brickwall.setDepth(1);
        this.brickwall.setVelocityY(5); // Slow falling speed

        // add physics group
        this.blocksGroup = this.physics.add.staticGroup();

        // Create game board
        this.board = [];
        this.createBoard();

        // Add player
        const playerPostionX = Phaser.Math.RND.pick([30, 90, 150, 210, 270, 330, 390, 450, 510, 570]);
        this.player = new Player(this, playerPostionX, 150);
        this.player.setVelocityY(100);
        this.player.anxiety();

        // Add physics collision
        this.physics.add.collider(this.player, this.blocksGroup);

        // Add collision between player and brickwall that triggers game over
        this.physics.add.collider(this.player, this.brickwall, this.gameOver, null, this);

        // Add input event listeners
        this.input.on('gameobjectdown', this.onTileClick, this);
    }

    createBoard() {
        // Create a 2D array to represent the board
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
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
        const tile = this.add.sprite(x, y, randomType);
        tile.setScale(this.tileSize / tile.width * 0.983); // Scale to fit the tile size with some padding
        tile.setInteractive(); // Make it interactive for input events

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
            // Clear tint
            this.selectedTile.clearTint();

            // Stop the pulsing animation
            if (this.selectedTile.highlightTween) {
                this.selectedTile.highlightTween.stop();
                // Reset to original scale
                this.selectedTile.setScale(this.tileSize / this.selectedTile.width * 0.983);
            }

            this.selectedTile = null;
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
            // Clear highlighting effects
            this.selectedTile.clearTint();

            // Stop the pulsing animation
            if (this.selectedTile.highlightTween) {
                this.selectedTile.highlightTween.stop();
                // Reset to original scale
                this.selectedTile.setScale(this.tileSize / this.selectedTile.width * 0.983);
            }

            this.selectedTile = tile;

            // Apply new highlighting
            tile.setTint(0xffff00);

            // Add a pulsing scale effect
            this.tweens.add({
                targets: tile,
                scale: tile.scale * 1.1,
                duration: 300,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Store the tween reference
            tile.highlightTween = this.tweens.getTweensOf(tile)[0];
        }
    }

    swapTiles(tile1, tile2) {
        this.canMove = false;

        // Clear the selection tint and effects
        tile1.clearTint();

        // Stop the pulsing animation if it exists
        if (tile1.highlightTween) {
            tile1.highlightTween.stop();
            // Reset to original scale
            tile1.setScale(this.tileSize / tile1.width);
        }

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
            ease: 'Power2',
            onUpdate: () => {
                // Temporarily disable player physics during swap
                this.player.body.checkCollision.none = true;
            },
            onComplete: () => {
                // Restore player physics after swap
                this.player.body.checkCollision.none = false;
            }
        });

        this.tweens.add({
            targets: tile2,
            x: tile1Pos.x,
            y: tile1Pos.y,
            duration: 200,
            ease: 'Power2',
            onUpdate: () => {
                // Temporarily disable player physics during swap
                this.player.body.checkCollision.none = true;
            },
            onComplete: () => {
                // Restore player physics after swap
                this.player.body.checkCollision.none = false;
                // Check for matches after the swap
                const hasMatches = this.checkAllMatches();

                if (!hasMatches) {
                    // If no matches, swap back
                    this.swapTilesBack(tile1, tile2, tile1Pos, tile2Pos);
                } else {
                    this.selectedTile = null;
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
                this.selectedTile = null;
                this.canMove = true;
            }
        });
    }

    checkAllMatches(isInitialCheck = false) {
        let hasMatches = false;

        // Reset all matched flags first
        if (!isInitialCheck) {
            for (let row = 0; row < this.boardSize; row++) {
                for (let col = 0; col < this.boardSize; col++) {
                    const tile = this.board[row][col];
                    if (tile) {
                        tile.setData('matched', false);
                    }
                }
            }
        }

        // Track all matched positions
        const matchedPositions = [];

        // Check horizontal matches
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize - 2; col++) {
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
                        // Store matched positions
                        matchedPositions.push({row, col});
                        matchedPositions.push({row, col: col+1});
                        matchedPositions.push({row, col: col+2});
                    }
                }
            }
        }

        // Check vertical matches
        for (let col = 0; col < this.boardSize; col++) {
            for (let row = 0; row < this.boardSize - 2; row++) {
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
                        // Store matched positions
                        matchedPositions.push({row, col});
                        matchedPositions.push({row: row+1, col});
                        matchedPositions.push({row: row+2, col});
                    }
                }
            }
        }

        // Mark matched tiles after all checks
        if (!isInitialCheck && matchedPositions.length > 0) {
            // Set matched flag for all matched positions
            for (const pos of matchedPositions) {
                const tile = this.board[pos.row][pos.col];
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
        let matchCount = 0;

        // First, remove all matched tiles
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = this.board[row][col];
                if (tile && tile.getData('matched') === true) {  // Strict equality check
                    matchCount++;

                    // Animate the tile removal
                    this.tweens.add({
                        targets: tile,
                        alpha: 0,
                        scale: 0.5,
                        duration: 300,
                        ease: 'Power2',
                        onComplete: () => {
                            // Remove from physics group before destroying
                            this.blocksGroup.remove(tile, true, true);
                            tile.destroy();
                        }
                    });

                    // Clear the reference in the board array
                    this.board[row][col] = null;
                }
            }
        }

        // After a delay, make the tiles fall and create new ones
        this.time.delayedCall(500, () => {
            this.makeTilesFall();
        });
    }

    makeTilesFall() {
        let hasTilesFallen = false;

        // Process from bottom to top, right to left
        for (let col = 0; col < this.boardSize; col++) {
            for (let row = this.boardSize - 1; row >= 0; row--) {
                // If this position is empty, look for a tile above to fall down
                if (!this.board[row][col]) {
                    // Find the closest tile above
                    let foundTile = false;
                    for (let aboveRow = row - 1; aboveRow >= 0; aboveRow--) {
                        if (this.board[aboveRow][col]) {
                            // Move this tile down
                            const tile = this.board[aboveRow][col];

                            // Remove from physics group before moving
                            this.blocksGroup.remove(tile, true, true);

                            // Update board references
                            this.board[row][col] = tile;
                            this.board[aboveRow][col] = null;

                            // Update the tile's row AND column data
                            tile.setData('row', row);
                            tile.setData('col', col);

                            // Animate the fall
                            this.tweens.add({
                                targets: tile,
                                y: this.boardOffsetY + row * this.tileSize + this.tileSize / 2,
                                duration: 300,
                                ease: 'Bounce',
                                onComplete: () => {
                                    // Re-add to physics group at new position
                                    this.blocksGroup.add(tile);
                                }
                            });

                            hasTilesFallen = true;
                            foundTile = true;
                            break;
                        }
                    }
                    // No new tiles are created - empty spaces remain empty
                }
            }
        }

        // After all tiles have fallen, check for new matches
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

    update() {
        // Check if the brickwall has stopped moving (collided with something)
        if (this.brickwall && Math.abs(this.brickwall.body.velocity.y) < 10) {
            this.brickwall.setVelocityY(0);
        }

        // Ensure player is always affected by gravity
        // This prevents the player from getting stuck in mid-air
        if (this.player && !this.player.body.blocked.down && this.player.body.velocity.y < 100) {
            // Apply a small downward force if player is not on ground and not already falling fast
            this.player.setVelocityY(this.player.body.velocity.y + 10);
        }
    }

    gameOver() {
        // Stop the game
        this.physics.pause();

        // Stop player animations and tint red to indicate game over
        this.player.setTint(0xff0000);
        this.player.anims.stop();

        this.time.delayedCall(1000, () => {
            this.scene.start('GameoverScene');
        })
    }

}
