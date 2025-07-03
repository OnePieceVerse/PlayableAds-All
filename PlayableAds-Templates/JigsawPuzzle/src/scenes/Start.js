// "Every great game begins with a single scene. Let's make this one unforgettable!"
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
        // Create background
        this.add.rectangle(300, 400, 600, 800, 0x1a1a2e);

        // Title
        this.add.text(300, 150, 'JIGSAW PUZZLE', {
            fontSize: '48px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Instructions
        const instructions = [
            'Drag and drop puzzle pieces',
            'to complete the image!',
            '',
            'As time passes, the background',
            'image will fade away.',
            '',
            'Complete the puzzle',
            'before time runs out!'
        ];

        this.add.text(300, 350, instructions.join('\n'), {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#cccccc',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        // Start button
        const startButton = this.add.rectangle(300, 600, 200, 60, 0x4a4a8a)
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

        this.add.text(300, 600, 'START GAME', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }
}
