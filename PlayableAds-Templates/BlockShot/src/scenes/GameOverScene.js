import themeConfig from '../config/ThemeConfig.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
    }

    preload() {
        this.load.image('background', themeConfig.background.path);
    }

    create() {
        const { width, height } = this.scale;
        // 以设计稿380x680为基准
        const baseW = 380, baseH = 680;
        const scaleW = width / baseW;
        const scaleH = height / baseH;
        const scale = Math.min(scaleW, scaleH);

        this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(width, height).setTint(0x555555);

        this.add.text(width / 2, height / 2 - 80 * scale, '游戏结束', {
            fontSize: (48 * scale) + 'px',
            fill: '#fff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4 * scale
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2, `最终分数: ${this.finalScore}`, {
            fontSize: (32 * scale) + 'px',
            fill: '#fff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 3 * scale
        }).setOrigin(0.5);

        const restartButton = this.add.text(width / 2, height / 2 + 100 * scale, '再来一局', {
            fontSize: (32 * scale) + 'px',
            fill: '#fff',
            backgroundColor: '#4CAF50',
            padding: { x: 20 * scale, y: 10 * scale },
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 2 * scale
        })
            .setOrigin(0.5)
            .setInteractive();

        restartButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
} 