export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    create() {
        // Add background
        this.add.rectangle(300, 360, 600, 800, 0x1e1e2e);

        // Add title
        const title = this.add.text(300, 200, 'MEMORY PICK', {
            fontFamily: 'Arial',
            fontSize: '64px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Add instructions
        const instructions = this.add.text(300, 320,
            'Remember the positions of images shown in batches.\n' +
            'Then find the matching image shown below the grid.\n' +
            'Find all images within the time limit to win!', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#cccccc',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5);

        // Add start button
        const startButton = this.add.rectangle(300, 500, 200, 60, 0x4a90e2)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('Preload');
            })
            .on('pointerover', () => {
                startButton.setFillStyle(0x357abd);
            })
            .on('pointerout', () => {
                startButton.setFillStyle(0x4a90e2);
            });

        this.add.text(300, 500, 'START GAME', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add controls info
        this.add.text(300, 600, 'Click on grid cells to select matching images', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#888888'
        }).setOrigin(0.5);

        // Add animation to title
        this.tweens.add({
            targets: title,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
    }

    update() {
    }

}
