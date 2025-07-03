// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class GameSuccess extends Phaser.Scene {
    constructor() {
        super('GameSuccess');
    }

    init(data) {
        // Get final score from previous scene
        this.finalScore = data.finalScore || 100;
    }

    preload() {
        // Assets already loaded
    }

    create() {
        const { width, height } = this.scale;

        // Background with celebration colors
        this.add.rectangle(width/2, height/2, width, height, 0x00AA00);

        // Success title
        this.add.text(width/2, height/4, 'CONGRATULATIONS!', {
            fontSize: '42px',
            fill: '#FFFF00',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Success message
        this.add.text(width/2, height/2 - 50, 'You successfully whacked\nall the moles!', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        // Final score
        this.add.text(width/2, height/2 + 20, `Final Score: ${this.finalScore}`, {
            fontSize: '28px',
            fill: '#FFFF00',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Play again button
        const playAgainButton = this.add.rectangle(width/2, height * 0.7, 200, 60, 0x0066CC);
        playAgainButton.setStrokeStyle(3, 0xFFFFFF);

        const playAgainText = this.add.text(width/2, height * 0.7, 'PLAY AGAIN', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Main menu button
        const menuButton = this.add.rectangle(width/2, height * 0.85, 200, 60, 0x666666);
        menuButton.setStrokeStyle(3, 0xFFFFFF);

        const menuText = this.add.text(width/2, height * 0.85, 'MAIN MENU', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Make buttons interactive
        playAgainButton.setInteractive();
        playAgainButton.on('pointerdown', () => {
            this.scene.start('Game');
        });

        playAgainButton.on('pointerover', () => {
            playAgainButton.setFillStyle(0x0088FF);
        });

        playAgainButton.on('pointerout', () => {
            playAgainButton.setFillStyle(0x0066CC);
        });

        menuButton.setInteractive();
        menuButton.on('pointerdown', () => {
            this.scene.start('Start');
        });

        menuButton.on('pointerover', () => {
            menuButton.setFillStyle(0x888888);
        });

        menuButton.on('pointerout', () => {
            menuButton.setFillStyle(0x666666);
        });

        // Add some celebration animation
        this.createCelebrationEffects();
    }

    createCelebrationEffects() {
        const { width, height } = this.scale;

        // Create falling stars/confetti
        for (let i = 0; i < 20; i++) {
            const star = this.add.text(Phaser.Math.Between(0, width), -20, '★', {
                fontSize: '24px',
                fill: Phaser.Display.Color.GetColor32(
                    Phaser.Math.Between(100, 255),
                    Phaser.Math.Between(100, 255),
                    Phaser.Math.Between(100, 255),
                    255
                )
            });

            this.tweens.add({
                targets: star,
                y: height + 50,
                duration: Phaser.Math.Between(3000, 6000),
                ease: 'Linear',
                delay: Phaser.Math.Between(0, 2000),
                repeat: -1,
                onComplete: () => {
                    star.y = -20;
                    star.x = Phaser.Math.Between(0, width);
                }
            });

            // Add rotation
            this.tweens.add({
                targets: star,
                rotation: Math.PI * 2,
                duration: 2000,
                repeat: -1,
                ease: 'Linear'
            });
        }
    }

    update() {
        // Animation updates if needed
    }

}
