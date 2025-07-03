// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class GameSuccess extends Phaser.Scene {
    constructor() {
        super('GameSuccess');
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

        // Add success title
        const title = this.add.text(300, 200, 'CONGRATULATIONS!', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#27ae60',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Add success message
        this.add.text(300, 300, 'You found all the images!\nYour memory skills are amazing!', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5);

        // Add play again button
        const playAgainButton = this.add.rectangle(400, 450, 150, 60, 0x27ae60)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('Game');
            })
            .on('pointerover', () => {
                playAgainButton.setFillStyle(0x2ecc71);
            })
            .on('pointerout', () => {
                playAgainButton.setFillStyle(0x27ae60);
            });

        this.add.text(400, 450, 'PLAY AGAIN', {
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

        // Add celebration animation
        this.tweens.add({
            targets: title,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 800,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });

        // Add stars animation
        this.createStars();
    }

    createStars() {
        for (let i = 0; i < 20; i++) {
            const star = this.add.text(
                Phaser.Math.Between(100, 1180),
                Phaser.Math.Between(100, 600),
                '★',
                {
                    fontSize: Phaser.Math.Between(20, 40) + 'px',
                    color: '#f1c40f'
                }
            );

            this.tweens.add({
                targets: star,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: Phaser.Math.Between(1000, 2000),
                delay: Phaser.Math.Between(0, 1000),
                repeat: -1,
                yoyo: true
            });
        }
    }
}
