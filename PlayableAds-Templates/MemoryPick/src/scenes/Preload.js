// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Preload extends Phaser.Scene {
    constructor() {
        super('Preload');
    }

    init() {
        // Initialize loading screen
    }

    preload() {
        // Create loading screen
        this.add.rectangle(640, 360, 1280, 720, 0x1e1e2e);

        const loadingText = this.add.text(640, 300, 'Loading...', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Create loading bar
        const loadingBar = this.add.rectangle(640, 360, 400, 20, 0x333333);
        const loadingFill = this.add.rectangle(640, 360, 0, 16, 0x4a90e2);

        // Update loading bar
        this.load.on('progress', (value) => {
            loadingFill.width = 400 * value;
        });

        this.load.setPath('assets/clash-of-cats');
        // Load game images
        this.load.image('image1', 'image/image-1.png');
        this.load.image('image2', 'image/image-2.png');
        this.load.image('image3', 'image/image-3.png');
        this.load.image('image4', 'image/image-4.png');

        // Create card back image as rectangle
        this.load.image('cardBack', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');

        // load audios
        this.load.audio('background-music', 'audio/background.mp3');
        this.load.audio('card-turn-sound', 'audio/card-turn.mp3');
        this.load.audio('match-right-sound', 'audio/match-right.mp3');
        this.load.audio('match-wrong-sound', 'audio/match-wrong.mp3');
    }

    create() {
        // Create card back texture
        this.add.graphics()
            .fillStyle(0x2c3e50)
            .fillRect(0, 0, 120, 120)
            .generateTexture('cardBack', 120, 120)
            .destroy();

        this.scene.start('Game');
    }
}
