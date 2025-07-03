// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class GameoverScene extends Phaser.Scene {
    constructor() {
        super('GameoverScene');
    }

    init() {
        // Initialize scene
    }

    preload() {
        // Load assets
    }

    create() {
        // Create game objects
        this.add.image(300, 400, 'background');

        this.add.text(300, 200, 'Game Over', {
            fontSize: '64px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);
    }

}
