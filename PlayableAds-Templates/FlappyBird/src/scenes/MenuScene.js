import themeConfig from '../config/ThemeConfig.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image(themeConfig.background.key, themeConfig.background.path);
        this.load.image(themeConfig.player.key, themeConfig.player.path);
    }

    create() {
        this.add.image(190, 340, themeConfig.background.key)
            .setDisplaySize(380, 680);

        // 添加半透明蒙版
        const mask = this.add.rectangle(190, 340, 380, 680, 0x000000, 0.4);
        mask.setDepth(1);

        // 添加标题
        this.add.text(190, 200, 'Flappy Bird', {
            fontSize: '40px',
            fill: '#fff'
        }).setOrigin(0.5).setDepth(2);


        // 添加开始按钮
        const startButton = this.add.text(190, 340, 'Start Game', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#4CAF50',
            fontStyle: 'bold',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive().setDepth(2);

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // 添加说明
        this.add.text(190, 440, 'Click to start\nAvoid obstacles and bombs', {
            fontSize: '20px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5).setDepth(2);
    }
}