import themeConfig from '../config/ThemeConfig.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalTime = data.time || 0;
    }

    preload() {
        const assets = themeConfig;
        this.load.image('bg', assets.background.path);
    }

    create() {
        const { width, height } = this.scale;
        this.bg = this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(width, height);
        this.bg.setTint(0x555555);


        // 显示游戏结束文本
        this.add.text(width / 2, height / 2 - height * 0.073, 'Game Over', {
            fontSize: Math.round(width * 0.126) + 'px', // 48/380
            fill: '#fff'
        }).setOrigin(0.5);

        // 显示存活时间，小数点后三位数
        this.add.text(width / 2, height / 2 + height * 0.029, `Survival time: ${(this.finalTime / 1000).toFixed(3)} seconds`, {
            fontSize: Math.round(width * 0.052) + 'px', // 20/380
            fill: '#fff'
        }).setOrigin(0.5);

        // 添加重新开始按钮
        const restartButton = this.add.text(width / 2, height / 2 + height * 0.147, 'Download!', {
            fontSize: Math.round(width * 0.084) + 'px', // 32/380
            fill: '#fff',
            backgroundColor: '#4CAF50',
            padding: { x: Math.round(width * 0.052), y: Math.round(height * 0.015) } // 20/380, 10/680
        })
            .setOrigin(0.5)
            .setInteractive();

        restartButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
} 