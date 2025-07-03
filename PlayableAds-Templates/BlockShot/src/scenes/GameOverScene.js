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
        this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(380, 680).setTint(0x555555);

        this.add.text(width / 2, height / 2 - 80, '游戏结束', {
            fontSize: '48px',
            fill: '#fff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2, `最终分数: ${this.finalScore}`, {
            fontSize: '32px',
            fill: '#fff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        const restartButton = this.add.text(width / 2, height / 2 + 100, '再来一局', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 },
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 2
        })
            .setOrigin(0.5)
            .setInteractive();

        restartButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
} 