// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    init() {
        // Initialize scene
    }

    preload() {
        // Load assets
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        this.load.image('bubble', 'bubble.png');
        this.load.image('gas', 'gas.png');
        this.load.image('background', 'background.png');
        this.load.image('platform', 'platform.png');
        this.load.image('platform-rotten', 'platform-rotten.png');
        this.load.image('star', 'star.png');
        this.load.spritesheet(
            'player',
            'player.png',
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    create() {
        // Create game objects
        this.scene.start('GameScene');
    }

}
