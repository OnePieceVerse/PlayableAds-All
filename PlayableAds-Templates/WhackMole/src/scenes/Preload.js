// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Preload extends Phaser.Scene {
    constructor() {
        super('Preload');
    }

    init() {
        // Initialize scene
    }

    preload() {
        const { width, height } = this.scale;

        // Show loading screen
        this.add.rectangle(width/2, height/2, width, height, 0x000000);
        this.add.text(width/2, height/2, 'Loading...', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Load mole sprites
        this.load.image('mole1', './assets/mole-1.png');
        this.load.image('mole2', './assets/mole-2.png');
        this.load.image('mole3', './assets/mole-3.png');
        this.load.image('mole4', './assets/mole-4.png');

        // Load sound
        this.load.audio('whackSound', './assets/whack-sound.mp3');

        // Create loading bar
        const loadingBar = this.add.rectangle(width/2, height/2 + 50, 300, 20, 0x333333);
        const loadingBarFill = this.add.rectangle(width/2 - 150, height/2 + 50, 0, 16, 0x00ff00);
        loadingBarFill.setOrigin(0, 0.5);

        this.load.on('progress', (progress) => {
            loadingBarFill.width = 300 * progress;
        });
    }

    create() {
        // Start the game after loading
        this.scene.start('Game');
    }

}
