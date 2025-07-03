// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    init() {
        // Initialize scene
    }

    preload() {
        // Assets already loaded
    }

    create() {
        // Add background
        this.add.rectangle(300, 360, 600, 800, 0x1e1e2e);

        // Add game over title
        const title = this.add.text(300, 200, 'GAME OVER', {
            fontFamily: 'Arial',
            fontSize: '64px',
            color: '#e74c3c',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Add game over message
        this.add.text(300, 300, 'Time ran out or wrong image selected!\nBetter luck next time!', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5);

        // Add try again button
        const tryAgainButton = this.add.rectangle(400, 450, 150, 60, 0xe74c3c)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('Game');
            })
            .on('pointerover', () => {
                tryAgainButton.setFillStyle(0xc0392b);
            })
            .on('pointerout', () => {
                tryAgainButton.setFillStyle(0xe74c3c);
            });

        this.add.text(400, 450, 'TRY AGAIN', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add main menu button
        const mainMenuButton = this.add.rectangle(200, 450, 150, 60, 0x3498db)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('Start');
            })
            .on('pointerover', () => {
                mainMenuButton.setFillStyle(0x5dade2);
            })
            .on('pointerout', () => {
                mainMenuButton.setFillStyle(0x3498db);
            });

        this.add.text(200, 450, 'MAIN MENU', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add tips
        this.add.text(300, 550, 'Tip: Pay close attention during the batch display phase!', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#95a5a6',
            align: 'center'
        }).setOrigin(0.5);

        // Add pulsing animation to title
        this.tweens.add({
            targets: title,
            alpha: 0.5,
            duration: 1000,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
    }
}
