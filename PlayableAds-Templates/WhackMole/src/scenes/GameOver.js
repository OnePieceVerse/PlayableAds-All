// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    init(data) {
        // Get final score from previous scene
        this.finalScore = data.finalScore || 0;
        this.reason = data.reason || 'Time Up!';
    }

    preload() {
        // Assets already loaded
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(width/2, height/2, width, height, 0x8B0000);

        // Game Over title
        this.add.text(width/2, height/4, 'GAME OVER', {
            fontSize: '48px',
            fill: '#ff0000',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Reason
        this.add.text(width/2, height/2 - 50, this.reason, {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        // Final score
        this.add.text(width/2, height/2 + 20, `Final Score: ${this.finalScore}`, {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Try again button
        const tryAgainButton = this.add.rectangle(width/2, height * 0.7, 200, 60, 0xFF6600);
        tryAgainButton.setStrokeStyle(3, 0xFFFFFF);

        const tryAgainText = this.add.text(width/2, height * 0.7, 'TRY AGAIN', {
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
        tryAgainButton.setInteractive();
        tryAgainButton.on('pointerdown', () => {
            this.scene.start('Game');
        });

        tryAgainButton.on('pointerover', () => {
            tryAgainButton.setFillStyle(0xFF8800);
        });

        tryAgainButton.on('pointerout', () => {
            tryAgainButton.setFillStyle(0xFF6600);
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
    }

    update() {
        // Game over logic if needed
    }

}
