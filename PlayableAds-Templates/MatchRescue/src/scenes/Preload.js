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
        this.load.setPath('assets/demo');

        // load images
        this.load.image('background', 'image/background.png');
        this.load.image('crystal', 'image/crystal.png');
        this.load.image('heart', 'image/heart.png');
        this.load.image('star', 'image/star.png');
        this.load.image('brickwall', 'image/brickwall.png');
        this.load.image('platform', 'image/platform.png')

        // load spritesheets
        this.load.spritesheet('player', 'image/player.png', { frameWidth: 32, frameHeight: 48 });

        // load audio
        this.load.audio('background', 'audio/background.mp3');
        this.load.audio('match-sound', 'audio/match.mp3');
        this.load.audio('game-over', 'audio/game-over.mp3');
        this.load.audio('game-success', 'audio/game-success.mp3');

    }

    create() {
        this.scene.start('Game');
    }

}
