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
        this.load.setPath('assets');
        this.load.image('background', 'background.png');
        this.load.image('crystal', 'crystal.png');
        this.load.image('heart', 'heart.png');
        this.load.image('star', 'star.png');
        this.load.image('brickwall', 'brickwall.png');
        this.load.image('platform', 'platform.png')

        this.load.spritesheet('player', 'player.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        this.scene.start('GameScene');
    }

}
