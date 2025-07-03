// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    init() {
        // Game variables
        this.gridSize = 3;
        this.cardSize = 120;
        this.cardPadding = 20;
        this.images = ['image1', 'image2', 'image3', 'image4'];
        this.grid = [];
        this.currentTarget = null;
        this.foundImages = [];
        this.gameTime = 10000; // 10 seconds
        this.timer = null;
        this.timeText = null;
        this.batchIndex = 0;
        this.maxBatches = 4;
        this.showingBatches = true;
        this.batchDelay = 1000; // 1.5 seconds per batch
        this.instructionText = null;
        this.audioEnabled = false;
        this.firstUserInteraction = false;
    }

    preload() {
        // Assets already loaded in Preload scene
    }

    create() {
        // Add background
        this.add.rectangle(300, 360, 600, 800, 0x1e1e2e);

        // Add title
        this.add.text(300, 30, 'MEMORY PICK', {
            fontFamily: 'Arial',
            fontSize: '42px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Create grid layout (moved up slightly)
        this.createGrid();

        // Add timer display
        this.timeText = this.add.text(100, 80, `Time: ${this.gameTime / 1000}s`, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        });

        // Add target image display area (positioned below grid with proper spacing)
        this.targetImageContainer = this.add.container(300, 650);
        this.add.text(300, 750, 'Target Image', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add found images counter
        this.foundText = this.add.text(500, 80, 'Found: 0/0', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(1, 0);

        // Add global click listener to enable audio on first interaction
        this.input.on('pointerdown', this.enableAudioOnFirstClick, this);

        // Select and show target image first
        this.selectRandomTarget();

        // Start the batch showing sequence
        this.startBatchSequence();
    }

    enableAudioOnFirstClick() {
        if (!this.firstUserInteraction) {
            this.firstUserInteraction = true;
            this.initializeAudio();
            // Remove the global listener after first interaction
            this.input.off('pointerdown', this.enableAudioOnFirstClick, this);
        }
    }

    initializeAudio() {
        if (!this.audioEnabled) {
            try {
                // Initialize background music
                if (!this.game.backgroundMusic || !this.game.backgroundMusic.isPlaying) {
                    this.game.backgroundMusic = this.sound.add('background-music', {
                        volume: 0.5,
                        loop: true
                    });
                    this.game.backgroundMusic.play();
                }
                this.audioEnabled = true;
            } catch (error) {
                console.warn('Failed to initialize audio:', error);
            }
        }
    }

    playSound(soundKey) {
        if (this.audioEnabled) {
            try {
                this.sound.play(soundKey);
            } catch (error) {
                console.warn('Failed to play sound:', soundKey, error);
            }
        }
    }

    createGrid() {
        this.grid = [];
        const startX = 350 - (this.gridSize * (this.cardSize + this.cardPadding) - this.cardPadding) / 2;
        const startY = 220; // Moved up to create more space

        // Create a shuffled array of image assignments for the 3x3 grid
        const imageAssignments = [];
        for (let i = 0; i < 9; i++) {
            imageAssignments.push(this.images[i % this.images.length]);
        }
        Phaser.Utils.Array.Shuffle(imageAssignments);

        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                const x = startX + col * (this.cardSize + this.cardPadding);
                const y = startY + row * (this.cardSize + this.cardPadding);

                const imageKey = imageAssignments[row * this.gridSize + col];

                // Create card container
                const cardContainer = this.add.container(x, y);

                // Create card back
                const cardBack = this.add.rectangle(0, 0, this.cardSize, this.cardSize, 0x2c3e50)
                    .setStrokeStyle(2, 0x34495e);

                // Create card front (image)
                const cardFront = this.add.image(0, 0, imageKey)
                    .setDisplaySize(this.cardSize - 10, this.cardSize - 10)
                    .setVisible(false);

                cardContainer.add([cardBack, cardFront]);

                // Make card interactive
                cardBack.setInteractive({ useHandCursor: true })
                    .on('pointerdown', () => this.onCardClick(row, col))
                    .on('pointerover', () => cardBack.setFillStyle(0x3498db))
                    .on('pointerout', () => cardBack.setFillStyle(0x2c3e50));

                this.grid[row][col] = {
                    container: cardContainer,
                    cardBack: cardBack,
                    cardFront: cardFront,
                    imageKey: imageKey,
                    revealed: false,
                    found: false
                };
            }
        }
    }

    startBatchSequence() {
        this.showingBatches = true;
        this.batchIndex = 0;
        this.instructionText = this.add.text(300, 130, 'Watch and Remember the target image positions!', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#f39c12'
        }).setOrigin(0.5);

        // Start showing batches
        this.time.delayedCall(500, () => {
            this.showNextBatch();
        });
    }

    showNextBatch() {
        // Calculate which cards to show in this batch
        const cardsPerBatch = Math.ceil(9 / this.maxBatches);
        const startIndex = this.batchIndex * cardsPerBatch;
        const endIndex = Math.min(startIndex + cardsPerBatch, 9);

        // Show cards in this batch with staggered animation
        let cardIndex = 0;
        let delay = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (cardIndex >= startIndex && cardIndex < endIndex) {
                    this.time.delayedCall(delay, () => {
                        this.revealCardWithAnimation(row, col);
                    });
                    delay += 100; // 100ms delay between each card reveal
                }
                cardIndex++;
            }
        }

        this.batchIndex++;
        if (this.batchIndex >= this.maxBatches) {
            // Hide current batch
            this.hideAllCards();

            this.endBatchSequence();
            return;
        }

        // Schedule next batch or end sequence
        this.time.delayedCall(this.batchDelay, () => {
            // Hide current batch
            this.hideAllCards();

            this.time.delayedCall(800, () => {
                this.showNextBatch();
            });
        });
    }

    endBatchSequence() {
        this.showingBatches = false;

        // Clear instruction text
        if (this.instructionText) {
            this.instructionText.destroy();
        }

        // Target is already selected and displayed
        // Start game timer
        this.startGameTimer();

        // Add game instruction (positioned properly between timer and grid)
        this.instructionText = this.add.text(300, 130, 'Find all instances of the target image!', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#27ae60'
        }).setOrigin(0.5);
    }

    revealCard(row, col) {
        const card = this.grid[row][col];
        // Direct reveal without animation
        card.cardBack.setVisible(false);
        card.cardFront.setVisible(true);
        card.revealed = true;
    }

    revealCardWithAnimation(row, col) {
        const card = this.grid[row][col];

        // Create flip animation
        this.tweens.add({
            targets: card.container,
            scaleX: 0,
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
                // Switch to front face at the middle of animation
                card.cardBack.setVisible(false);
                card.cardFront.setVisible(true);
                card.revealed = true;

                // Flip back to normal scale
                this.tweens.add({
                    targets: card.container,
                    scaleX: 1,
                    duration: 150,
                    ease: 'Power2'
                });
            }
        });
    }

    hideCard(row, col) {
        const card = this.grid[row][col];
        if (card.revealed && !card.found) {
            // Create flip animation only for cards that are currently revealed
            this.tweens.add({
                targets: card.container,
                scaleX: 0,
                duration: 150,
                ease: 'Power2',
                onComplete: () => {
                    // Switch to back face at the middle of animation
                    card.cardBack.setVisible(true);
                    card.cardFront.setVisible(false);
                    card.revealed = false;

                    // Flip back to normal scale
                    this.tweens.add({
                        targets: card.container,
                        scaleX: 1,
                        duration: 150,
                        ease: 'Power2'
                    });
                }
            });
        }
    }

    hideCardDirect(row, col) {
        const card = this.grid[row][col];
        if (card.revealed && !card.found) {
            // Direct hide without animation
            card.cardBack.setVisible(true);
            card.cardFront.setVisible(false);
            card.revealed = false;
        }
    }

    hideAllCards() {
        // Hide all revealed cards with staggered animation
        let delay = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                this.time.delayedCall(delay, () => {
                    this.hideCard(row, col);
                });
                delay += 50; // 50ms delay between each card flip
            }
        }
    }

    selectRandomTarget() {
        // Find all unique images in the grid
        const availableImages = [...new Set(this.grid.flat().map(card => card.imageKey))];
        this.currentTarget = Phaser.Utils.Array.GetRandom(availableImages);

        // Display target image
        this.targetImageContainer.removeAll(true);
        const targetImage = this.add.image(0, 0, this.currentTarget)
            .setDisplaySize(150, 150);
        this.targetImageContainer.add(targetImage);

        // Update counter display
        this.updateCounterDisplay();
    }

    onCardClick(row, col) {
        if (this.showingBatches) return;

        const card = this.grid[row][col];
        if (card.found || card.revealed) return;

        // Add flip animation for user clicks too
        this.tweens.add({
            targets: card.container,
            scaleX: 0,
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
                // Reveal the card at middle of flip
                card.cardBack.setVisible(false);
                card.cardFront.setVisible(true);
                card.revealed = true;

                // Complete the flip
                this.tweens.add({
                    targets: card.container,
                    scaleX: 1,
                    duration: 150,
                    ease: 'Power2',
                    onComplete: () => {
                        // Check match after animation completes
                        this.checkCardMatch(card, row, col);
                    }
                });
            }
        });
    }

    checkCardMatch(card, row, col) {
        if (card.imageKey === this.currentTarget) {
            // Correct match
            card.found = true;
            card.cardBack.setFillStyle(0x27ae60); // Green for found
            this.foundImages.push(card);

            // Play correct match sound
            this.playSound('match-right-sound');

            // Add success pulse animation
            this.tweens.add({
                targets: card.container,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 200,
                ease: 'Back.out',
                yoyo: true,
                onComplete: () => {
                    card.container.setScale(1, 1);
                }
            });

            // Update found counter
            this.updateCounterDisplay();

            // Check if all target images are found
            const totalTargets = this.grid.flat().filter(c => c.imageKey === this.currentTarget).length;
            const foundTargets = this.foundImages.filter(c => c.imageKey === this.currentTarget).length;

            if (foundTargets === totalTargets) {
                // All instances of current target found, game win!
                this.gameWin();
            }
        } else {
            // Wrong match - game over
            card.cardBack.setFillStyle(0xe74c3c); // Red for wrong

            // Play wrong match sound
            this.playSound('match-wrong-sound');

            // Add error shake animation
            this.tweens.add({
                targets: card.container,
                x: card.container.x - 10,
                duration: 100,
                ease: 'Power2',
                yoyo: true,
                repeat: 3,
                onComplete: () => {
                    this.time.delayedCall(300, () => {
                        this.gameOver();
                    });
                }
            });
        }
    }

    selectNewTarget() {
        // Find remaining unfound images
        const unfoundImages = [...new Set(
            this.grid.flat()
                .filter(card => !card.found)
                .map(card => card.imageKey)
        )];

        if (unfoundImages.length > 0) {
            this.currentTarget = Phaser.Utils.Array.GetRandom(unfoundImages);

            // Update target display
            this.targetImageContainer.removeAll(true);
            const targetImage = this.add.image(0, 0, this.currentTarget)
                .setDisplaySize(80, 80);
            this.targetImageContainer.add(targetImage);

            // Update counter display
            this.updateCounterDisplay();
        }
    }

    updateCounterDisplay() {
        if (this.currentTarget) {
            const totalTargets = this.grid.flat().filter(c => c.imageKey === this.currentTarget).length;
            const foundTargets = this.foundImages.filter(c => c.imageKey === this.currentTarget).length;
            this.foundText.setText(`Found: ${foundTargets}/${totalTargets}`);
        }
    }

    startGameTimer() {
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    updateTimer() {
        this.gameTime -= 1000;
        this.timeText.setText(`Time: ${this.gameTime / 1000}s`);

        if (this.gameTime <= 0) {
            this.gameOver();
        }

        // Change color when time is running low
        if (this.gameTime <= 10000) {
            this.timeText.setColor('#e74c3c');
        } else if (this.gameTime <= 20000) {
            this.timeText.setColor('#f39c12');
        }
    }

    gameWin() {
        if (this.timer) {
            this.timer.remove();
        }
        this.scene.start('GameSuccess');
    }

    gameOver() {
        if (this.timer) {
            this.timer.remove();
        }
        this.scene.start('GameOver');
    }
}
