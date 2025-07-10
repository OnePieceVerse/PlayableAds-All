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
        const sw = this.scale.width;
        const sh = this.scale.height;
        this.add.image(sw / 2, sh / 2, themeConfig.background.key)
            .setDisplaySize(sw, sh);

        // 添加半透明蒙版
        const mask = this.add.rectangle(sw / 2, sh / 2, sw, sh, 0x000000, 0.4);
        mask.setDepth(1);

        // 添加标题
        this.add.text(sw / 2, sh * 0.29, 'Flappy Bird', {
            fontSize: Math.round(sw * 0.11) + 'px',
            fill: '#fff'
        }).setOrigin(0.5).setDepth(2);

        // 添加开始按钮
        const startButton = this.add.text(sw / 2, sh / 2, 'Start Game', {
            fontSize: Math.round(sw * 0.085) + 'px',
            fill: '#fff',
            backgroundColor: '#4CAF50',
            fontStyle: 'bold',
            padding: { x: Math.round(sw * 0.053), y: Math.round(sw * 0.026) }
        }).setOrigin(0.5).setInteractive().setDepth(2);

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // 添加说明
        this.add.text(sw / 2, sh * 0.65, 'Click to start\nAvoid obstacles and bombs', {
            fontSize: Math.round(sw * 0.053) + 'px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5).setDepth(2);
    }
}