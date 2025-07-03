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
        // Create background
        this.add.rectangle(300, 400, 600, 800, 0x1a1a2e);

        // Success title
        this.add.text(300, 200, 'PUZZLE COMPLETE!', {
            fontSize: '42px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#00ff00',
            align: 'center'
        }).setOrigin(0.5);

        // Congratulations message
        const messages = [
            'Excellent work!',
            'You solved the puzzle',
            'before time ran out!'
        ];

        this.add.text(300, 320, messages.join('\n'), {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        // Show completed puzzle
        this.add.image(300, 480, 'puzzleImage')
            .setDisplaySize(280, 280);

        // Play Again button
        const playAgainButton = this.add.rectangle(300, 650, 200, 60, 0x4a4a8a)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('Game');
            })
            .on('pointerover', () => {
                playAgainButton.setFillStyle(0x6a6aaa);
                this.game.canvas.style.cursor = 'pointer';
            })
            .on('pointerout', () => {
                playAgainButton.setFillStyle(0x4a4a8a);
                this.game.canvas.style.cursor = 'default';
            });

        this.add.text(300, 650, 'PLAY AGAIN', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Menu button
        const menuButton = this.add.rectangle(300, 730, 160, 50, 0x666666)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('Start');
            })
            .on('pointerover', () => {
                menuButton.setFillStyle(0x888888);
                this.game.canvas.style.cursor = 'pointer';
            })
            .on('pointerout', () => {
                menuButton.setFillStyle(0x666666);
                this.game.canvas.style.cursor = 'default';
            });

        this.add.text(300, 730, 'MAIN MENU', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Add some celebration particles
        this.createCelebrationEffect();
    }

    createCelebrationEffect() {
        // Create simple celebration particles
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(50, 550);
            const y = Phaser.Math.Between(100, 300);
            const star = this.add.text(x, y, '⭐', {
                fontSize: '24px'
            });

            this.tweens.add({
                targets: star,
                y: y - 100,
                alpha: 0,
                duration: 2000,
                delay: i * 100,
                ease: 'Power2',
                onComplete: () => {
                    star.destroy();
                }
            });
        }
    }
}
