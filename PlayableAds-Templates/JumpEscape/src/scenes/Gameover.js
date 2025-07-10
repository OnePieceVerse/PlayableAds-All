// "Even heroes sometimes sink, but courage helps them rise again!"
export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    init() {
        // Initialize scene
    }

    preload() {
        // Load assets
    }

    create() {
        // Get screen dimensions
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        // Create background with water overlay
        this.add.image(gameWidth / 2, gameHeight / 2, 'background');

        // Add water overlay for drowning atmosphere
        const waterOverlay = this.add.rectangle(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 0x0066BB, 0.7);

        // Create bubble effects rising from bottom
        this.createBubbleEffect(gameWidth, gameHeight);

        // Create sinking debris effect
        this.createSinkingEffect(gameWidth, gameHeight);

        // Create animated title text with water theme colors
        const titleText = this.add.text(gameWidth / 2, gameHeight * 0.3, 'GAME OVER', {
            fontSize: '50px',
            fontFamily: 'Arial Black',
            color: '#4488DD',
            stroke: '#001144',
            strokeThickness: 8,
            align: 'center',
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000000',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5);

        // Add slow sinking animation to title
        this.tweens.add({
            targets: titleText,
            y: { from: gameHeight * 0.3, to: gameHeight * 0.32 },
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Add water ripple effect to title
        this.tweens.add({
            targets: titleText,
            alpha: { from: 1, to: 0.6 },
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Create encouragement message
        const encourageText = this.add.text(gameWidth / 2, gameHeight * 0.45, 'The water got you this time!\nBut every escape artist learns from failure.', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#CCDDFF',
            stroke: '#000033',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        // Add gentle floating animation to encouragement
        this.tweens.add({
            targets: encourageText,
            y: { from: gameHeight * 0.45, to: gameHeight * 0.43 },
            duration: 2500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Create Try Again and Main Menu buttons side by side
        this.createGameButtons(gameWidth, gameHeight);

        // Add water wave effect
        this.createWaveEffect(gameWidth, gameHeight);

        // Add drowning gas effects
        this.createGasEffect(gameWidth, gameHeight);
    }

    createBubbleEffect(gameWidth, gameHeight) {
        // Create bubbles rising from bottom using bubble sprite
        const bubbleEmitter = this.add.particles(0, 0, 'bubble', {
            x: { min: gameWidth * 0.1, max: gameWidth * 0.9 },
            y: { min: gameHeight + 50, max: gameHeight + 100 },
            scale: { start: 0.1, end: 0.3 },
            speedY: { min: -80, max: -40 },
            speedX: { min: -20, max: 20 },
            lifespan: 4000,
            frequency: 150,
            alpha: { start: 0.8, end: 0.2 },
            tint: 0x88CCFF
        });
    }

    createSinkingEffect(gameWidth, gameHeight) {
        // Create sinking stars effect (representing lost hopes)
        const sinkingEmitter = this.add.particles(0, 0, 'star', {
            x: { min: 0, max: gameWidth },
            y: { min: -50, max: 0 },
            scale: { start: 0.3, end: 0.1 },
            speedY: { min: 100, max: 200 },
            speedX: { min: -30, max: 30 },
            lifespan: 6000,
            frequency: 300,
            rotate: { min: 0, max: 360 },
            tint: 0x336699,
            alpha: { start: 0.9, end: 0 }
        });
    }

    createGameButtons(gameWidth, gameHeight) {
        const buttonWidth = Math.min(gameWidth * 0.35, 220);
        const buttonHeight = Math.min(gameHeight * 0.08, 70);
        const buttonSpacing = gameWidth * 0.05;

        // Try Again button (left)
        const tryAgainButton = this.add.graphics();
        tryAgainButton.fillStyle(0x2277BB);
        tryAgainButton.lineStyle(4, 0x88CCFF);
        const tryAgainX = gameWidth / 2 - buttonWidth / 2 - buttonSpacing;
        tryAgainButton.fillRoundedRect(tryAgainX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
        tryAgainButton.strokeRoundedRect(tryAgainX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
        tryAgainButton.setInteractive(new Phaser.Geom.Rectangle(tryAgainX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        tryAgainButton.input.cursor = 'pointer';

        const tryAgainText = this.add.text(tryAgainX, gameHeight * 0.7, 'TRY ESCAPE', {
            fontSize: Math.min(gameWidth * 0.04, gameHeight * 0.03) + 'px',
            fontFamily: 'Arial Bold',
            color: '#FFFFFF',
            stroke: '#000033',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Main Menu button (right)
        const mainMenuButton = this.add.graphics();
        mainMenuButton.fillStyle(0x4a4a8a);
        mainMenuButton.lineStyle(4, 0x88CCFF);
        const mainMenuX = gameWidth / 2 + buttonWidth / 2 + buttonSpacing;
        mainMenuButton.fillRoundedRect(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
        mainMenuButton.strokeRoundedRect(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
        mainMenuButton.setInteractive(new Phaser.Geom.Rectangle(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        mainMenuButton.input.cursor = 'pointer';

        const mainMenuText = this.add.text(mainMenuX, gameHeight * 0.7, 'MAIN MENU', {
            fontSize: Math.min(gameWidth * 0.04, gameHeight * 0.03) + 'px',
            fontFamily: 'Arial Bold',
            color: '#FFFFFF',
            stroke: '#000033',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Try Again button hover effects
        tryAgainButton.on('pointerover', () => {
            tryAgainButton.clear();
            tryAgainButton.fillStyle(0x3388CC);
            tryAgainButton.lineStyle(4, 0xAADDFF);
            tryAgainButton.fillRoundedRect(tryAgainX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
            tryAgainButton.strokeRoundedRect(tryAgainX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
        });

        tryAgainButton.on('pointerout', () => {
            tryAgainButton.clear();
            tryAgainButton.fillStyle(0x2277BB);
            tryAgainButton.lineStyle(4, 0x88CCFF);
            tryAgainButton.fillRoundedRect(tryAgainX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
            tryAgainButton.strokeRoundedRect(tryAgainX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
        });

        // Main Menu button hover effects
        mainMenuButton.on('pointerover', () => {
            mainMenuButton.clear();
            mainMenuButton.fillStyle(0x6a6aaa);
            mainMenuButton.lineStyle(4, 0xAADDFF);
            mainMenuButton.fillRoundedRect(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
            mainMenuButton.strokeRoundedRect(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
        });

        mainMenuButton.on('pointerout', () => {
            mainMenuButton.clear();
            mainMenuButton.fillStyle(0x4a4a8a);
            mainMenuButton.lineStyle(4, 0x88CCFF);
            mainMenuButton.fillRoundedRect(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
            mainMenuButton.strokeRoundedRect(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
        });

        // Button click handlers
        tryAgainButton.on('pointerdown', () => {
            this.scene.start('Game');
        });

        mainMenuButton.on('pointerdown', () => {
            this.scene.start('Start');
        });

        // Add pulsing glow effects to buttons
        this.tweens.add({
            targets: tryAgainButton,
            alpha: { from: 1, to: 0.7 },
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        this.tweens.add({
            targets: mainMenuButton,
            alpha: { from: 1, to: 0.7 },
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    createWaveEffect(gameWidth, gameHeight) {
        // Create occasional wave flash effect
        this.time.addEvent({
            delay: Phaser.Math.Between(2000, 4000),
            callback: () => {
                // Create blue wave overlay
                const wave = this.add.rectangle(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 0x0088FF, 0.3);

                // Quickly fade out the wave
                this.tweens.add({
                    targets: wave,
                    alpha: 0,
                    duration: 800,
                    ease: 'Sine.easeOut',
                    onComplete: () => wave.destroy()
                });

                // Schedule next wave
                this.time.delayedCall(Phaser.Math.Between(2000, 4000), () => {
                    if (this.scene.isActive()) {
                        this.createWaveEffect(gameWidth, gameHeight);
                    }
                });
            }
        });
    }

    createGasEffect(gameWidth, gameHeight) {
        // Create gas particles using gas sprite (representing air bubbles escaping)
        const gasEmitter = this.add.particles(0, 0, 'gas', {
            x: { min: gameWidth * 0.3, max: gameWidth * 0.7 },
            y: { min: gameHeight + 50, max: gameHeight + 100 },
            scale: { start: 0.2, end: 0.5 },
            speedY: { min: -60, max: -30 },
            speedX: { min: -15, max: 15 },
            lifespan: 3000,
            frequency: 400,
            rotate: { min: 0, max: 360 },
            tint: 0x66AADD,
            alpha: { start: 0.6, end: 0 }
        });
    }

    update() {
    }
}
