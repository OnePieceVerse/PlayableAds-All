// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Preload extends Phaser.Scene {
    constructor() {
        super('Preload');
    }

    init() {
        // Initialize scene
    }

    preload() {
        // Load assets
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets/demo');
        this.load.image('bubble', 'image/bubble.png');
        this.load.image('gas', 'image/gas.png');
        this.load.image('background', 'image/background.png');
        this.load.image('platform', 'image/platform.png');
        this.load.image('platform-rotten', 'image/platform-rotten.png');
        this.load.image('star', 'image/star.png');
        this.load.spritesheet(
            'player',
            'image/player.png',
            { frameWidth: 32, frameHeight: 48 }
        );

        // load audio
        this.load.audio('background', 'audio/background.mp3');
        this.load.audio('game-over', 'audio/game-over.mp3');
        this.load.audio('game-success', 'audio/game-success.mp3');
    }

    create() {
        // Create game objects
        this.scene.start('Game');
    }

}
