export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        // Create simple colored rectangles for buttons since we don't have button assets
        this.load.image('button', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(width/2, height/2, width, height, 0x228B22);

        // Title
        this.add.text(width/2, height/3, 'WHACK-A-MOLE', {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Instructions
        this.add.text(width/2, height/2, 'Click on moles to whack them!\nEarn 100 points to win!', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        // Start button
        const startButton = this.add.rectangle(width/2, height * 0.7, 200, 60, 0x8B4513);
        startButton.setStrokeStyle(3, 0xFFFFFF);

        const startText = this.add.text(width/2, height * 0.7, 'START GAME', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Make button interactive
        startButton.setInteractive();
        startButton.on('pointerdown', () => {
            this.scene.start('Preload');
        });

        startButton.on('pointerover', () => {
            startButton.setFillStyle(0xA0522D);
        });

        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x8B4513);
        });
    }

    update() {
    }

}
