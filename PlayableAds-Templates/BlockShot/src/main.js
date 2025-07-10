import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';

// 获取设备屏幕尺寸，限定最大最小范围
const getGameSize = () => {
    let w = window.innerWidth;
    let h = window.innerHeight;
    // 限定最大最小宽高，防止极端拉伸
    const minW = 320, maxW = 540, minH = 480, maxH = 960;
    w = Math.max(minW, Math.min(maxW, w));
    h = Math.max(minH, Math.min(maxH, h));
    return { width: w, height: h };
};
const { width, height } = getGameSize();

const config = {
    type: Phaser.AUTO,
    width,
    height,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [GameScene, GameOverScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config); 