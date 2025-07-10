// "Every great game begins with a single scene. Let's make this one unforgettable!"
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

        // Create background with dark overlay
        this.add.image(gameWidth / 2, gameHeight / 2, 'background');

        // Add dark overlay for somber mood
        const darkOverlay = this.add.rectangle(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 0x000000, 0.6);

        // Create rain effect
        this.createRainEffect(gameWidth, gameHeight);

        // Create falling debris effect
        this.createDebrisEffect(gameWidth, gameHeight);

        // Create animated title text with sad colors
        const titleText = this.add.text(gameWidth / 2, gameHeight * 0.3, 'Game Over', {
            fontSize: '72px',
            fontFamily: 'Arial Black',
            color: '#FF4444',
            stroke: '#8B0000',
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

        // Add shaking animation to title
        this.tweens.add({
            targets: titleText,
            x: { from: gameWidth / 2 - 2, to: gameWidth / 2 + 2 },
            duration: 100,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        });

        // Add fade in/out effect to title
        this.tweens.add({
            targets: titleText,
            alpha: { from: 1, to: 0.7 },
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Create encouragement message
        const encourageText = this.add.text(gameWidth / 2, gameHeight * 0.45, 'Don\'t give up!\nTry again and succeed!', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#CCCCCC',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        // Add slow floating animation to encouragement
        this.tweens.add({
            targets: encourageText,
            y: { from: gameHeight * 0.45, to: gameHeight * 0.43 },
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Create Try Again button with different color scheme
        this.createTryAgainButton(gameWidth, gameHeight);

        // Add lightning flash effect
        this.createLightningEffect(gameWidth, gameHeight);

        // Add smoke effects
        this.createSmokeEffect(gameWidth, gameHeight);
    }

    createRainEffect(gameWidth, gameHeight) {
        // Create rain drops using crystals as rain drops
        const rainEmitter = this.add.particles(0, 0, 'crystal', {
            x: { min: -50, max: gameWidth + 50 },
            y: { min: -50, max: 0 },
            scale: { start: 0.1, end: 0 },
            speedY: { min: 400, max: 600 },
            speedX: { min: -20, max: 20 },
            lifespan: 2000,
            frequency: 50,
            tint: 0x6699CC,
            alpha: { start: 0.8, end: 0.3 }
        });
    }

    createDebrisEffect(gameWidth, gameHeight) {
        // Create falling debris using stars as dark particles
        const debrisEmitter = this.add.particles(0, 0, 'star', {
            x: { min: 0, max: gameWidth },
            y: { min: -50, max: 0 },
            scale: { start: 0.2, end: 0 },
            speedY: { min: 150, max: 300 },
            speedX: { min: -30, max: 30 },
            lifespan: 4000,
            frequency: 200,
            rotate: { min: 0, max: 360 },
            tint: 0x333333,
            alpha: { start: 0.9, end: 0 }
        });
    }

    createTryAgainButton(gameWidth, gameHeight) {
        // Create button background using Graphics - red theme for game over
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0xCC3333);
        buttonBg.lineStyle(4, 0x888888);
        buttonBg.fillRoundedRect(gameWidth / 2 - 150, gameHeight * 0.7 - 40, 300, 80, 10);
        buttonBg.strokeRoundedRect(gameWidth / 2 - 150, gameHeight * 0.7 - 40, 300, 80, 10);
        buttonBg.setInteractive(new Phaser.Geom.Rectangle(gameWidth / 2 - 150, gameHeight * 0.7 - 40, 300, 80), Phaser.Geom.Rectangle.Contains);
        buttonBg.input.cursor = 'pointer';

        // Create button text
        const buttonText = this.add.text(gameWidth / 2, gameHeight * 0.7, 'Try Again', {
            fontSize: '36px',
            fontFamily: 'Arial Bold',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Button hover effects
        buttonBg.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0xDD4444);
            buttonBg.lineStyle(4, 0xAAAAAA);
            buttonBg.fillRoundedRect(gameWidth / 2 - 150, gameHeight * 0.7 - 40, 300, 80, 10);
            buttonBg.strokeRoundedRect(gameWidth / 2 - 150, gameHeight * 0.7 - 40, 300, 80, 10);
            this.tweens.add({
                targets: [buttonBg, buttonText],
                scale: 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });

        buttonBg.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0xCC3333);
            buttonBg.lineStyle(4, 0x888888);
            buttonBg.fillRoundedRect(gameWidth / 2 - 150, gameHeight * 0.7 - 40, 300, 80, 10);
            buttonBg.strokeRoundedRect(gameWidth / 2 - 150, gameHeight * 0.7 - 40, 300, 80, 10);
            this.tweens.add({
                targets: [buttonBg, buttonText],
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
        });

        // Button click handler
        buttonBg.on('pointerdown', () => {
            // Restart the game directly
            this.scene.start('Game');
        });

        // Add subtle pulsing glow effect to button
        this.tweens.add({
            targets: buttonBg,
            alpha: { from: 1, to: 0.8 },
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    createLightningEffect(gameWidth, gameHeight) {
        // Create occasional lightning flash
        this.time.addEvent({
            delay: Phaser.Math.Between(3000, 6000),
            callback: () => {
                // Create white flash overlay
                const flash = this.add.rectangle(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 0xFFFFFF, 0.8);

                // Quickly fade out the flash
                this.tweens.add({
                    targets: flash,
                    alpha: 0,
                    duration: 200,
                    ease: 'Power2',
                    onComplete: () => flash.destroy()
                });

                // Schedule next lightning
                this.time.delayedCall(Phaser.Math.Between(3000, 6000), () => {
                    if (this.scene.isActive()) {
                        this.createLightningEffect(gameWidth, gameHeight);
                    }
                });
            }
        });
    }

    createSmokeEffect(gameWidth, gameHeight) {
        // Create smoke particles using hearts as smoke clouds
        const smokeEmitter = this.add.particles(0, 0, 'heart', {
            x: { min: gameWidth * 0.2, max: gameWidth * 0.8 },
            y: { min: gameHeight + 50, max: gameHeight + 100 },
            scale: { start: 0.3, end: 0.8 },
            speedY: { min: -80, max: -40 },
            speedX: { min: -20, max: 20 },
            lifespan: 3000,
            frequency: 300,
            rotate: { min: 0, max: 360 },
            tint: 0x555555,
            alpha: { start: 0.6, end: 0 }
        });
    }
}
