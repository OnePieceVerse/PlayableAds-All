// "Every great game begins with a single scene. Let's make this one unforgettable!"
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
        this.createParticleEffects(gameWidth, gameHeight);

        // Create animated title text
        const titleText = this.add.text(gameWidth / 2, gameHeight * 0.3, 'Victory!', {
            fontSize: '64px',
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
        const congratsText = this.add.text(gameWidth / 2, gameHeight * 0.45, 'Congratulations!\nYou saved the day!', {
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

        // Add fireworks effect
        this.createFireworksEffect(gameWidth, gameHeight);
    }

    createParticleEffects(gameWidth, gameHeight) {
        // Create stars particle emitter
        const starsEmitter = this.add.particles(0, 0, 'star', {
            x: { min: 0, max: gameWidth },
            y: { min: -50, max: 0 },
            scale: { start: 0.3, end: 0 },
            speedY: { min: 100, max: 300 },
            speedX: { min: -50, max: 50 },
            lifespan: 3000,
            frequency: 100,
            rotate: { min: 0, max: 360 }
        });

        // Create hearts particle emitter
        const heartsEmitter = this.add.particles(0, 0, 'heart', {
            x: { min: 0, max: gameWidth },
            y: { min: -50, max: 0 },
            scale: { start: 0.2, end: 0 },
            speedY: { min: 80, max: 250 },
            speedX: { min: -30, max: 30 },
            lifespan: 4000,
            frequency: 150,
            rotate: { min: 0, max: 360 }
        });

        // Create crystals particle emitter
        const crystalsEmitter = this.add.particles(0, 0, 'crystal', {
            x: { min: 0, max: gameWidth },
            y: { min: -50, max: 0 },
            scale: { start: 0.25, end: 0 },
            speedY: { min: 120, max: 280 },
            speedX: { min: -40, max: 40 },
            lifespan: 3500,
            frequency: 120,
            rotate: { min: 0, max: 360 }
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

        const tryAgainText = this.add.text(tryAgainX, gameHeight * 0.7, 'Try Again', {
            fontSize: Math.min(gameWidth * 0.04, gameHeight * 0.03) + 'px',
            fontFamily: 'Arial Bold',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Main Menu button (right)
        const mainMenuButton = this.add.graphics();
        mainMenuButton.fillStyle(0x4a4a8a);
        mainMenuButton.lineStyle(4, 0xFFFFFF);
        const mainMenuX = gameWidth / 2 + buttonWidth / 2 + buttonSpacing;
        mainMenuButton.fillRoundedRect(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
        mainMenuButton.strokeRoundedRect(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
        mainMenuButton.setInteractive(new Phaser.Geom.Rectangle(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        mainMenuButton.input.cursor = 'pointer';

        const mainMenuText = this.add.text(mainMenuX, gameHeight * 0.7, 'Main Menu', {
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
            this.tweens.add({
                targets: [tryAgainButton, tryAgainText],
                scale: 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });

        tryAgainButton.on('pointerout', () => {
            tryAgainButton.clear();
            tryAgainButton.fillStyle(0x4CAF50);
            tryAgainButton.lineStyle(4, 0xFFFFFF);
            tryAgainButton.fillRoundedRect(tryAgainX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
            tryAgainButton.strokeRoundedRect(tryAgainX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
            this.tweens.add({
                targets: [tryAgainButton, tryAgainText],
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
        });

        // Main Menu button hover effects
        mainMenuButton.on('pointerover', () => {
            mainMenuButton.clear();
            mainMenuButton.fillStyle(0x6a6aaa);
            mainMenuButton.lineStyle(4, 0xFFFFFF);
            mainMenuButton.fillRoundedRect(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
            mainMenuButton.strokeRoundedRect(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
            this.tweens.add({
                targets: [mainMenuButton, mainMenuText],
                scale: 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });

        mainMenuButton.on('pointerout', () => {
            mainMenuButton.clear();
            mainMenuButton.fillStyle(0x4a4a8a);
            mainMenuButton.lineStyle(4, 0xFFFFFF);
            mainMenuButton.fillRoundedRect(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
            mainMenuButton.strokeRoundedRect(mainMenuX - buttonWidth / 2, gameHeight * 0.7 - buttonHeight / 2, buttonWidth, buttonHeight, 10);
            this.tweens.add({
                targets: [mainMenuButton, mainMenuText],
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
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
                0xFFFFFF
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

    createFireworksEffect(gameWidth, gameHeight) {
        // Create periodic fireworks bursts
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                const x = Phaser.Math.Between(gameWidth * 0.2, gameWidth * 0.8);
                const y = Phaser.Math.Between(gameHeight * 0.2, gameHeight * 0.6);

                // Create burst of particles
                const colors = [0xFF6B35, 0xFFD700, 0x4CAF50, 0x2196F3, 0x9C27B0];
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
}
