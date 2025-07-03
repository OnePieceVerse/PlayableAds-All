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
        // Create background
        this.add.rectangle(300, 400, 600, 800, 0x1a1a2e);

        // Game Over title
        this.add.text(300, 200, 'TIME\'S UP!', {
            fontSize: '48px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#ff4444',
            align: 'center'
        }).setOrigin(0.5);

        // Game over message
        const messages = [
            'The puzzle wasn\'t completed',
            'in time!',
            '',
            'Don\'t give up - try again!'
        ];

        this.add.text(300, 350, messages.join('\n'), {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: '#cccccc',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        // Show the completed image as a hint
        this.add.text(300, 500, 'Complete Image:', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#888888',
            align: 'center'
        }).setOrigin(0.5);

        this.add.image(300, 580, 'puzzleImage')
            .setDisplaySize(200, 200)
            .setAlpha(0.8);

        // Try Again button
        const tryAgainButton = this.add.rectangle(300, 680, 200, 60, 0x4a4a8a)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('Game');
            })
            .on('pointerover', () => {
                tryAgainButton.setFillStyle(0x6a6aaa);
                this.game.canvas.style.cursor = 'pointer';
            })
            .on('pointerout', () => {
                tryAgainButton.setFillStyle(0x4a4a8a);
                this.game.canvas.style.cursor = 'default';
            });

        this.add.text(300, 680, 'TRY AGAIN', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Menu button
        const menuButton = this.add.rectangle(300, 760, 160, 50, 0x666666)
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

        this.add.text(300, 760, 'MAIN MENU', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }
}
