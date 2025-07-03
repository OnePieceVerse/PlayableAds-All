export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    init() {
        // Game configuration
        this.ROWS = 4;            // Number of rows in the puzzle
        this.COLS = 3;            // Number of columns in the puzzle
        this.TIME_LIMIT = 60;     // Seconds to solve the puzzle

        // Mutable state
        this.timeLeft = this.TIME_LIMIT;
        this.solvedPieces = 0;
        this.totalPieces = this.ROWS * this.COLS;
    }

    preload() {
        // Load assets
    }

    create() {
        // Center coordinates of the game canvas (hard-coded in main.js config)
        const centerX = 300;
        const centerY = 260;

        // --------------------------------------------------
        // 1.  Display the full image as a faded background
        // --------------------------------------------------
        const bgMaxSize = 380; // fit inside the canvas nicely and leave room for tray
        const srcImage = this.textures.get('puzzleImage').getSourceImage();
        const srcRatio = srcImage.width / srcImage.height;

        let bgWidth = bgMaxSize;
        let bgHeight = bgMaxSize;
        if (srcRatio > 1) {
            // Image is wider than tall
            bgHeight = bgMaxSize / srcRatio;
        } else {
            // Image is taller than wide
            bgWidth = bgMaxSize * srcRatio;
        }

        this.bgImage = this.add.image(centerX, centerY, 'puzzleImage')
            .setDisplaySize(bgWidth, bgHeight)
            .setAlpha(1);

        // --------------------------------------------------
        // 2.  Generate puzzle pieces (cropped images)
        // --------------------------------------------------
        const pieceW = bgWidth / this.COLS;
        const pieceH = bgHeight / this.ROWS;
        const texW = srcImage.width / this.COLS;
        const texH = srcImage.height / this.ROWS;

        // Scale factor so pieces match the resized background
        const scaleFactor = bgWidth / srcImage.width;

        // Helper arrays for shuffling piece placement
        const allPieces = [];

        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                const cropX = col * texW;
                const cropY = row * texH;

                // Create the image using the full texture but crop to this piece
                const piece = this.add.image(centerX, centerY, 'puzzleImage')
                    .setInteractive({ draggable: true })
                    .setScale(scaleFactor)
                    .setCrop(cropX, cropY, texW, texH);

                // Store the correct destination for snapping
                piece.correctX = centerX - bgWidth / 2 + pieceW / 2 + col * pieceW;
                piece.correctY = centerY - bgHeight / 2 + pieceH / 2 + row * pieceH;
                piece.isPlaced = false;

                allPieces.push(piece);
            }
        }

        // -----------------------------------------------
        // 3.  Create a tray below the puzzle to hold pieces
        //     Pieces are shuffled and placed in a grid.
        // -----------------------------------------------

        const marginBelowPuzzle = 20;
        const trayStartY = centerY + bgHeight / 2 + marginBelowPuzzle + pieceH / 2;

        // Tray grid uses the same configured columns and rows
        const trayCols = this.COLS;
        const trayRows = this.ROWS;

        // Shuffle indices so order is random
        const order = Phaser.Utils.Array.Shuffle([...Array(this.totalPieces).keys()]);

        // Left-edge of the tray so it is centered horizontally relative to the puzzle
        const trayStartX = centerX - (trayCols * pieceW) / 2 + pieceW / 2;

        order.forEach((pieceIdx, orderIdx) => {
            const piece = allPieces[pieceIdx];
            const colIdx = orderIdx % trayCols;
            const rowIdx = Math.floor(orderIdx / trayCols);

            piece.x = trayStartX + colIdx * pieceW;
            piece.y = trayStartY + rowIdx * pieceH;
        });

        // Enable dragging
        this.input.setDraggable(allPieces);

        this.input.on('dragstart', (_pointer, gameObject) => {
            // Bring the piece to the top while dragging
            gameObject.setDepth(1);
        });

        this.input.on('drag', (_pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (_pointer, gameObject) => {
            if (gameObject.isPlaced) return;

            const snapDistance = Math.min(pieceW, pieceH) * 0.4;
            const dist = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, gameObject.correctX, gameObject.correctY);
            if (dist < snapDistance) {
                // Snap into place
                gameObject.x = gameObject.correctX;
                gameObject.y = gameObject.correctY;
                gameObject.isPlaced = true;
                gameObject.input.enabled = false;
                gameObject.setDepth(0);

                this.solvedPieces += 1;
                // Optional subtle scale tween to give feedback
                this.tweens.add({
                    targets: gameObject,
                    scale: { from: 1.1, to: 1 },
                    duration: 200,
                    ease: 'Quad.easeOut'
                });

                if (this.solvedPieces === this.totalPieces) {
                    this.time.delayedCall(300, () => {
                        this.scene.start('GameSuccess');
                    });
                }
            } else {
                // Return depth to normal when not placed
                gameObject.setDepth(0);
            }
        });

        // --------------------------------------------------
        // 4.  Timer & UI
        // --------------------------------------------------
        this.timerText = this.add.text(centerX, 60, `TIME: ${this.timeLeft}`, {
            fontSize: '28px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.timeEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    updateTimer() {
        this.timeLeft -= 1;
        this.timerText.setText(`TIME: ${this.timeLeft}`);

        // Fade out background proportionally
        const alpha = Phaser.Math.Clamp(this.timeLeft / this.TIME_LIMIT, 0, 1);
        this.bgImage.setAlpha(alpha);

        if (this.timeLeft <= 0) {
            this.timeEvent.remove(false);
            this.scene.start('GameOver');
        }
    }
}
