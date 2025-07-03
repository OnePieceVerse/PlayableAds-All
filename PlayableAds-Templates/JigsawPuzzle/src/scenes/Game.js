// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    init() {
        // Game configuration - matches the 3x3 puzzle pieces we have
        this.ROWS = 3;            // Number of rows in the puzzle
        this.COLS = 3;            // Number of columns in the puzzle
        this.TIME_LIMIT = 30;     // Seconds to solve the puzzle

        // Mutable state
        this.timeLeft = this.TIME_LIMIT;
        this.solvedPieces = 0;
        this.totalPieces = this.ROWS * this.COLS;
    }

    preload() {
        // Assets are loaded in Preload scene
    }

    create() {
        // add audio
        this.sound.add('background-music', {
            volume: 0.5,
            loop: true
        });
        this.sound.add('place-right', {
            volume: 0.5,
            loop: false
        });

        this.sound.play('background-music');

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
            .setAlpha(0.5);

        // Create puzzle area border (initially invisible)
        this.puzzleBorder = this.add.rectangle(centerX, centerY, bgWidth, bgHeight)
            .setStrokeStyle(4, 0xffffff, 0.8)
            .setFillStyle(0x000000, 0)
            .setAlpha(0);

                // Create grid lines to show piece positions (initially invisible)
        this.gridGraphics = this.add.graphics()
            .setAlpha(0);

        this.gridGraphics.lineStyle(2, 0xffffff, 0.6);

        // Vertical lines
        for (let i = 1; i < this.COLS; i++) {
            const x = centerX - bgWidth / 2 + (bgWidth / this.COLS) * i;
            this.gridGraphics.moveTo(x, centerY - bgHeight / 2);
            this.gridGraphics.lineTo(x, centerY + bgHeight / 2);
        }

        // Horizontal lines
        for (let i = 1; i < this.ROWS; i++) {
            const y = centerY - bgHeight / 2 + (bgHeight / this.ROWS) * i;
            this.gridGraphics.moveTo(centerX - bgWidth / 2, y);
            this.gridGraphics.lineTo(centerX + bgWidth / 2, y);
        }

        this.gridGraphics.strokePath();

        // add a random effect to the image
        this.random = Phaser.Math.Between(1, 10);
        if (this.random > 5) {
            this.tweens.add({
                targets: this.bgImage,
                alpha: { from: 0.5, to: 0 },
                duration: 1000,
                    ease: 'Quad.easeOut',
                    repeat: 3,
                });
        }

        // --------------------------------------------------
        // 2.  Generate puzzle pieces using individual piece images
        // --------------------------------------------------
        const pieceW = bgWidth / this.COLS;
        const pieceH = bgHeight / this.ROWS;

        // Helper arrays for shuffling piece placement
        const allPieces = [];

        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                // Use the individual piece images (1-indexed for the filenames)
                const pieceKey = `piece-${row + 1}-${col + 1}`;

                const piece = this.add.image(centerX, centerY, pieceKey)
                    .setInteractive({ draggable: true });

                // Calculate proper scale to fit the piece size
                const pieceTexture = this.textures.get(pieceKey);
                const scaleX = pieceW / pieceTexture.source[0].width;
                const scaleY = pieceH / pieceTexture.source[0].height;
                const uniformScale = Math.min(scaleX, scaleY);
                piece.setScale(uniformScale);

                // Store the correct destination for snapping
                piece.correctX = centerX - bgWidth / 2 + pieceW / 2 + col * pieceW;
                piece.correctY = centerY - bgHeight / 2 + pieceH / 2 + row * pieceH;
                piece.isPlaced = false;
                piece.row = row;
                piece.col = col;
                piece.originalScale = uniformScale; // Store the original scale

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
            // Bring the piece to the top while dragging and ensure original scale
            gameObject.setDepth(1);
            gameObject.setScale(gameObject.originalScale);
        });

        this.input.on('drag', (_pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
            // Ensure the piece stays at original scale during dragging
            gameObject.setScale(gameObject.originalScale);
        });

        this.input.on('dragend', (_pointer, gameObject) => {
            if (gameObject.isPlaced) return;

            const snapDistance = Math.min(pieceW, pieceH) * 0.4;
            const dist = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, gameObject.correctX, gameObject.correctY);
            if (dist < snapDistance) {
                // play place-right-sound
                this.sound.play('place-right');

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
                    scale: { from: gameObject.originalScale * 1.1, to: gameObject.originalScale },
                    duration: 200,
                    ease: 'Quad.easeOut'
                });

                // Check if puzzle is complete
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

        // Progress text
        this.progressText = this.add.text(centerX, 100, `PIECES: ${this.solvedPieces}/${this.totalPieces}`, {
            fontSize: '20px',
            fontFamily: 'Arial',
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
        this.progressText.setText(`PIECES: ${this.solvedPieces}/${this.totalPieces}`);

        // Fade out background proportionally - as time passes, the complete image disappears
        if (this.random <= 5) {
            const alpha = Phaser.Math.Clamp(this.timeLeft / this.TIME_LIMIT, 0.1, 0.5);
            this.bgImage.setAlpha(alpha);

            // Show border and grid when image becomes very faint
            const borderAlpha = alpha < 0.3 ? Phaser.Math.Clamp(1 - (alpha / 0.3), 0, 1) : 0;
            this.puzzleBorder.setAlpha(borderAlpha);
            this.gridGraphics.setAlpha(borderAlpha * 0.5);
        } else {
            // For the flashing effect case, show border and grid when image alpha is very low
            const currentAlpha = this.bgImage.alpha;
            const borderAlpha = currentAlpha < 0.2 ? Phaser.Math.Clamp(1 - (currentAlpha / 0.2), 0, 1) : 0;
            this.puzzleBorder.setAlpha(borderAlpha);
            this.gridGraphics.setAlpha(borderAlpha * 0.5);
        }

        if (this.timeLeft <= 0) {
            this.timeEvent.remove(false);
            this.scene.start('GameOver');
        }
    }
}
