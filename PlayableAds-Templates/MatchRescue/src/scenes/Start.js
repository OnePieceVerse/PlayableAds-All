// "Every great rescue mission begins with courage. Let's save them all!"
export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
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
        this.add.rectangle(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 0x1a1a2e);

        // Title - positioned at 20% from top
        this.add.text(gameWidth / 2, gameHeight * 0.2, 'MATCH RESCUE', {
            fontSize: Math.min(gameWidth * 0.08, gameHeight * 0.06) + 'px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Instructions - positioned at center
        const instructions = [
            'Match 3 or more blocks',
            'to clear the path!',
            '',
            'Rescue the character blocked',
            'by the obstacles.',
            '',
            'Think strategically and',
            'clear your way to victory!'
        ];

        this.add.text(gameWidth / 2, gameHeight * 0.5, instructions.join('\n'), {
            fontSize: Math.min(gameWidth * 0.035, gameHeight * 0.025) + 'px',
            fontFamily: 'Arial',
            fill: '#cccccc',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        // Start button - positioned at 75% from top
        const buttonWidth = Math.min(gameWidth * 0.4, 300);
        const buttonHeight = Math.min(gameHeight * 0.08, 80);

        const startButton = this.add.rectangle(gameWidth / 2, gameHeight * 0.75, buttonWidth, buttonHeight, 0x4a4a8a)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('Preload');
            })
            .on('pointerover', () => {
                startButton.setFillStyle(0x6a6aaa);
                this.game.canvas.style.cursor = 'pointer';
            })
            .on('pointerout', () => {
                startButton.setFillStyle(0x4a4a8a);
                this.game.canvas.style.cursor = 'default';
            });

        this.add.text(gameWidth / 2, gameHeight * 0.75, 'START RESCUE', {
            fontSize: Math.min(gameWidth * 0.04, gameHeight * 0.03) + 'px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }

    update() {
    }
}
