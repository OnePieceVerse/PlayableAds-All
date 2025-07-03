import themeConfig from '../config/ThemeConfig.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.score = data.score || 0;
    }

    preload() {
        this.load.image(themeConfig.background.key, themeConfig.background.path);
        this.load.image(themeConfig.player.key, themeConfig.player.path);
    }

    create(data) {
        // 添加背景
        this.add.image(190, 340, themeConfig.background.key)
            .setDisplaySize(380, 680);

        // 添加半透明蒙版
        const mask = this.add.rectangle(190, 340, 380, 680, 0x000000, 0.4);
        mask.setDepth(1);

        // 添加Game Over文本
        this.add.text(190, 250, 'Game Over', {
            fontSize: '48px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2);

        // 显示分数
        this.add.text(190, 340, `Score: ${data && data.score ? data.score : 0}`, {
            fontSize: '36px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5).setDepth(2);



        // 添加重新开始按钮
        const restartButton = this.add.text(190, 420, 'Click to download', {
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: '#4CAF50',
            fontStyle: 'bold',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive().setDepth(2);

        restartButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        // 添加按钮悬停效果
        restartButton.on('pointerover', () => {
            restartButton.fillColor = 0x45a049;
        });

        restartButton.on('pointerout', () => {
            restartButton.fillColor = 0x4CAF50;
        });

        // // 添加提示文字
        // this.add.text(190, 500, '点击按钮重新开始游戏', {
        //     fontSize: '20px',
        //     fill: '#fff',
        //     fontStyle: 'italic'
        // }).setOrigin(0.5);
    }
} 