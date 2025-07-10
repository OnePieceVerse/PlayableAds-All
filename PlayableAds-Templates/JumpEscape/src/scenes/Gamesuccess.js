// "Every great escape ends with triumph! You've mastered the art of survival!"
export class GameSuccess extends Phaser.Scene {
    constructor() {
        super('GameSuccess');
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

        // Create background
        this.add.image(gameWidth / 2, gameHeight / 2, 'background');

        // Create celebratory particle effects
        this.createStarRainEffect(gameWidth, gameHeight);

        // Create rising bubble effects (representing rising to freedom)
        this.createRisingBubbleEffect(gameWidth, gameHeight);

        // Create animated title text
        const titleText = this.add.text(gameWidth / 2, gameHeight * 0.3, 'ESCAPE SUCCESS!', {
            fontSize: '50px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#FF6B35',
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

        // Add pulsing animation to title
        this.tweens.add({
            targets: titleText,
            scale: { from: 1, to: 1.2 },
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Add rainbow color effect to title
        this.tweens.add({
            targets: titleText,
            angle: { from: 0, to: 360 },
            duration: 3000,
            repeat: -1,
            onUpdate: () => {
                const hue = (titleText.angle * 2) % 360;
                titleText.setTint(Phaser.Display.Color.HSVToRGB(hue / 360, 1, 1).color);
            }
        });

        // Create congratulations message
        const congratsText = this.add.text(gameWidth / 2, gameHeight * 0.45, 'Outstanding!\nYou escaped the rising waters!', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Add floating animation to congratulations
        this.tweens.add({
            targets: congratsText,
            y: { from: gameHeight * 0.45, to: gameHeight * 0.42 },
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Create Try Again and Main Menu buttons side by side
        this.createGameButtons(gameWidth, gameHeight);

        // Add sparkle effects
        this.createSparkleEffects(gameWidth, gameHeight);

        // Add star burst effect
        this.createStarBurstEffect(gameWidth, gameHeight);
    }

    createStarRainEffect(gameWidth, gameHeight) {
        // Create stars falling from top as celebration
        const starEmitter = this.add.particles(0, 0, 'star', {
            x: { min: 0, max: gameWidth },
            y: { min: -50, max: 0 },
            scale: { start: 0.3, end: 0 },
            speedY: { min: 100, max: 300 },
            speedX: { min: -50, max: 50 },
            lifespan: 3000,
            frequency: 100,
            rotate: { min: 0, max: 360 },
            tint: 0xFFD700,
            alpha: { start: 1, end: 0.3 }
        });
    }

    createRisingBubbleEffect(gameWidth, gameHeight) {
        // Create bubbles rising upward (representing escape and freedom)
        const bubbleEmitter = this.add.particles(0, 0, 'bubble', {
            x: { min: 0, max: gameWidth },
            y: { min: gameHeight + 50, max: gameHeight + 100 },
            scale: { start: 0.2, end: 0 },
            speedY: { min: -200, max: -100 },
            speedX: { min: -30, max: 30 },
            lifespan: 4000,
            frequency: 150,
            rotate: { min: 0, max: 360 },
            tint: 0x55ff77,
            alpha: { start: 0.8, end: 0.2 }
        });
    }

    createGameButtons(gameWidth, gameHeight) {
        const buttonWidth = Math.min(gameWidth * 0.35, 220);
        const buttonHeight = Math.min(gameHeight * 0.08, 70);
        const buttonSpacing = gameWidth * 0.05;

        // Try Again button (left)
        const tryAgainButton = this.add.graphics();
        tryAgainButton.fillStyle(0x4CAF50);
        tryAgainButton.lineStyle(4, 0xFFFFFF);
        const tryAgainX = gameWidth / 2 - buttonWidth / 2 - buttonSpacing;
        tryAgainButton.fillRoundedRect(tryAgainX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
        tryAgainButton.strokeRoundedRect(tryAgainX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
        tryAgainButton.setInteractive(new Phaser.Geom.Rectangle(tryAgainX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        tryAgainButton.input.cursor = 'pointer';

        const tryAgainText = this.add.text(tryAgainX, gameHeight * 0.7, 'ESCAPE AGAIN', {
            fontSize: Math.min(gameWidth * 0.04, gameHeight * 0.03) + 'px',
            fontFamily: 'Arial Bold',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Main Menu button (right)
        const mainMenuButton = this.add.graphics();
        mainMenuButton.fillStyle(0xFF8C00);
        mainMenuButton.lineStyle(4, 0xFFFFFF);
        const mainMenuX = gameWidth / 2 + buttonWidth / 2 + buttonSpacing;
        mainMenuButton.fillRoundedRect(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
        mainMenuButton.strokeRoundedRect(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
        mainMenuButton.setInteractive(new Phaser.Geom.Rectangle(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        mainMenuButton.input.cursor = 'pointer';

        const mainMenuText = this.add.text(mainMenuX, gameHeight * 0.7, 'MAIN MENU', {
            fontSize: Math.min(gameWidth * 0.04, gameHeight * 0.03) + 'px',
            fontFamily: 'Arial Bold',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Try Again button hover effects
        tryAgainButton.on('pointerover', () => {
            tryAgainButton.clear();
            tryAgainButton.fillStyle(0x66BB6A);
            tryAgainButton.lineStyle(4, 0xFFFFFF);
            tryAgainButton.fillRoundedRect(tryAgainX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
            tryAgainButton.strokeRoundedRect(tryAgainX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
        });

        tryAgainButton.on('pointerout', () => {
            tryAgainButton.clear();
            tryAgainButton.fillStyle(0x4CAF50);
            tryAgainButton.lineStyle(4, 0xFFFFFF);
            tryAgainButton.fillRoundedRect(tryAgainX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
            tryAgainButton.strokeRoundedRect(tryAgainX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
        });

        // Main Menu button hover effects
        mainMenuButton.on('pointerover', () => {
            mainMenuButton.clear();
            mainMenuButton.fillStyle(0xFFA500);
            mainMenuButton.lineStyle(4, 0xFFFFFF);
            mainMenuButton.fillRoundedRect(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
            mainMenuButton.strokeRoundedRect(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
        });

        mainMenuButton.on('pointerout', () => {
            mainMenuButton.clear();
            mainMenuButton.fillStyle(0xFF8C00);
            mainMenuButton.lineStyle(4, 0xFFFFFF);
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
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        this.tweens.add({
            targets: mainMenuButton,
            alpha: { from: 1, to: 0.7 },
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    createSparkleEffects(gameWidth, gameHeight) {
        // Create sparkle points around the screen
        for (let i = 0; i < 20; i++) {
            const sparkle = this.add.circle(
                Phaser.Math.Between(50, gameWidth - 50),
                Phaser.Math.Between(50, gameHeight - 50),
                Phaser.Math.Between(2, 6),
                0xFFD700
            );

            // Add twinkling effect
            this.tweens.add({
                targets: sparkle,
                alpha: { from: 0, to: 1 },
                scale: { from: 0.5, to: 1.5 },
                duration: Phaser.Math.Between(500, 1500),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }

    createStarBurstEffect(gameWidth, gameHeight) {
        // Create periodic star bursts
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                const x = Phaser.Math.Between(gameWidth * 0.2, gameWidth * 0.8);
                const y = Phaser.Math.Between(gameHeight * 0.2, gameHeight * 0.6);

                // Create burst of star particles
                const colors = [0xFFD700, 0x55ff77, 0x4CAF50, 0xFF8C00, 0xFFFF00];
                const color = Phaser.Math.RND.pick(colors);

                for (let i = 0; i < 12; i++) {
                    const particle = this.add.circle(x, y, 4, color);
                    const angle = (i / 12) * Math.PI * 2;
                    const speed = Phaser.Math.Between(100, 200);

                    this.tweens.add({
                        targets: particle,
                        x: x + Math.cos(angle) * speed,
                        y: y + Math.sin(angle) * speed,
                        alpha: { from: 1, to: 0 },
                        scale: { from: 1, to: 0 },
                        duration: 1000,
                        ease: 'Power2',
                        onComplete: () => particle.destroy()
                    });
                }
            },
            loop: true
        });
    }

    update() {
    }
}
