// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    init() {
        // Game variables
        this.score = 0;
        this.targetScore = 100;
        this.moles = [];
        this.molePositions = [];
        this.whackSound = null;
        this.gameWidth = 600;
        this.gameHeight = 800;
        this.gameTime = 15; // 15 seconds time limit
        this.timeRemaining = 15;
        this.gameTimer = null;
        this.timerText = null;
    }

    preload() {
        // Assets are already loaded in Preload scene
    }

    create() {
        this.backgroundSound = this.sound.add('background', { volume: 0.3 });
        this.backgroundSound.play();

        const { width, height } = this.scale;

        // Background
        this.add.rectangle(width/2, height/2, width, height, 0x654321);

        // Game title
        this.add.text(width/2, 50, 'WHACK-A-MOLE', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Score display
        this.scoreText = this.add.text(width/2 - 100, 100, `Score: ${this.score}/${this.targetScore}`, {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Timer display
        this.timerText = this.add.text(width/2 + 100, 100, `Time: ${this.timeRemaining}s`, {
            fontSize: '24px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Setup mole positions (3x3 grid)
        const startX = 160;
        const startY = 200;
        const spacingX = 140;
        const spacingY = 120;

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                this.molePositions.push({
                    x: startX + col * spacingX,
                    y: startY + row * spacingY,
                    occupied: false
                });
            }
        }

        // Draw mole holes
        this.molePositions.forEach(pos => {
            this.add.circle(pos.x, pos.y, 50, 0x8B4513);
            this.add.circle(pos.x, pos.y, 40, 0x000000);
        });

        // Setup sound
        this.whackSound = this.sound.add('whackSound', { volume: 0.5 });

        // Start spawning moles
        this.startMoleSpawning();

        // Start game timer
        this.startGameTimer();

        // Add instructions
        this.add.text(width/2, height - 80, 'Click on moles to whack them!', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(width/2, height - 50, 'Reach 100 points in 15 seconds!', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    startMoleSpawning() {
        // Spawn a mole every 1-2 seconds
        this.moleSpawnTimer = this.time.addEvent({
            delay: Phaser.Math.Between(1000, 2000),
            callback: this.spawnMole,
            callbackScope: this,
            loop: true
        });
    }

    startGameTimer() {
        // Start countdown timer - update every second
        this.gameTimer = this.time.addEvent({
            delay: 1000, // 1 second
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    updateTimer() {
        this.timeRemaining--;
        this.timerText.setText(`Time: ${this.timeRemaining}s`);

        // Change timer color when time is running out
        if (this.timeRemaining <= 5) {
            this.timerText.setFill('#ff0000'); // Red color for last 5 seconds
        } else if (this.timeRemaining <= 10) {
            this.timerText.setFill('#ff8800'); // Orange color for last 10 seconds
        }

        // Game over when time runs out
        if (this.timeRemaining <= 0) {
            this.gameOver();
        }
    }

    spawnMole() {
        // Find available positions
        const availablePositions = this.molePositions.filter(pos => !pos.occupied);

        if (availablePositions.length === 0) return;

        // Pick random position
        const randomIndex = Phaser.Math.Between(0, availablePositions.length - 1);
        const position = availablePositions[randomIndex];
        position.occupied = true;

                // Create mole sprite
        const moleTypes = ['mole1', 'mole2', 'mole3', 'mole4'];
        const randomMole = moleTypes[Phaser.Math.Between(0, moleTypes.length - 1)];

        const mole = this.add.image(position.x, position.y, randomMole);
        mole.setScale(0.15); // Make moles smaller to fit completely in holes
        mole.setInteractive();
        mole.position = position;

        // Add to moles array
        this.moles.push(mole);

        // Mole click handler
        mole.on('pointerdown', () => {
            this.whackMole(mole);
        });

        // Make mole disappear after 2-3 seconds if not whacked
        this.time.delayedCall(Phaser.Math.Between(2000, 3000), () => {
            this.removeMole(mole);
        });

        // Add hover effect
        mole.on('pointerover', () => {
            mole.setTint(0xff6666);
        });

        mole.on('pointerout', () => {
            mole.clearTint();
        });
    }

    whackMole(mole) {
        // Play sound
        this.whackSound.play();

        // Add points
        this.score += 10;
        this.updateScore();

        // Show points gained
        const pointsText = this.add.text(mole.x, mole.y - 30, '+10', {
            fontSize: '20px',
            fill: '#00ff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Animate points text
        this.tweens.add({
            targets: pointsText,
            y: pointsText.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                pointsText.destroy();
            }
        });

        // Remove mole
        this.removeMole(mole);

        // Check for win condition
        if (this.score >= this.targetScore) {
            this.gameWon();
        }
    }

    removeMole(mole) {
        if (mole && mole.position) {
            mole.position.occupied = false;
        }

        // Remove from array
        const index = this.moles.indexOf(mole);
        if (index > -1) {
            this.moles.splice(index, 1);
        }

        // Destroy sprite
        if (mole && mole.active) {
            mole.destroy();
        }
    }

    updateScore() {
        this.scoreText.setText(`Score: ${this.score}/${this.targetScore}`);
    }

    gameWon() {
        // Stop background music
        if (this.backgroundSound) {
            this.backgroundSound.stop();
        }

        // Stop spawning moles
        if (this.moleSpawnTimer) {
            this.moleSpawnTimer.destroy();
        }

        // Stop game timer
        if (this.gameTimer) {
            this.gameTimer.destroy();
        }

        // Remove all existing moles
        this.moles.forEach(mole => {
            if (mole && mole.active) {
                mole.destroy();
            }
        });
        this.moles = [];

        // Go to success scene
        this.scene.start('GameSuccess', { finalScore: this.score });
    }

    gameOver() {
        // Stop background music
        if (this.backgroundSound) {
            this.backgroundSound.stop();
        }

        // Stop spawning moles
        if (this.moleSpawnTimer) {
            this.moleSpawnTimer.destroy();
        }

        // Stop game timer
        if (this.gameTimer) {
            this.gameTimer.destroy();
        }

        // Remove all existing moles
        this.moles.forEach(mole => {
            if (mole && mole.active) {
                mole.destroy();
            }
        });
        this.moles = [];

        // Go to game over scene
        this.scene.start('GameOver', {
            finalScore: this.score,
            reason: 'Time\'s Up!\nYou didn\'t reach 100 points in 15 seconds.'
        });
    }

    update() {
        // Game update logic if needed
    }

    shutdown() {
        // Cleanup method called when scene is destroyed
        // Stop background music if it's still playing
        if (this.backgroundSound) {
            this.backgroundSound.stop();
        }

        // Clean up timers
        if (this.moleSpawnTimer) {
            this.moleSpawnTimer.destroy();
            this.moleSpawnTimer = null;
        }

        if (this.gameTimer) {
            this.gameTimer.destroy();
            this.gameTimer = null;
        }

        // Clean up moles array
        this.moles = [];
        this.molePositions = [];
    }

}
