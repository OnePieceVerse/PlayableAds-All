// "Every great escape begins with courage. Jump high, jump far!"
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
        this.add.rectangle(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 0x040218);

        // Title - positioned at 20% from top
        this.add.text(gameWidth / 2, gameHeight * 0.2, 'JUMP ESCAPE', {
            fontSize: Math.min(gameWidth * 0.08, gameHeight * 0.06) + 'px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Instructions - positioned at center
        const instructions = [
            'The water is rising fast!',
            'Jump on moving platforms',
            'to reach higher ground.',
            '',
            'Use arrow keys to move',
            'and UP key to jump.',
            '',
            'Collect the star to escape,',
            'but don\'t fall into the water!'
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

        const startButton = this.add.rectangle(gameWidth / 2, gameHeight * 0.75, buttonWidth, buttonHeight, 0x55ff77)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('Preload');
            })
            .on('pointerover', () => {
                startButton.setFillStyle(0x77ffaa);
                this.game.canvas.style.cursor = 'pointer';
            })
            .on('pointerout', () => {
                startButton.setFillStyle(0x55ff77);
                this.game.canvas.style.cursor = 'default';
            });

        this.add.text(gameWidth / 2, gameHeight * 0.75, 'START ESCAPE', {
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
