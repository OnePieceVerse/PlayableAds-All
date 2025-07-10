import GameScene from './scenes/GameScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameOverScene from './scenes/GameOverScene.js';

// 获取设备屏幕宽高，限定最大最小值
function getGameSize() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    return { width, height };
}

const { width, height } = getGameSize();

const config = {
    type: Phaser.AUTO,
    title: 'Flappy Bird',
    description: 'A flappy bird game built with Phaser 3',
    width: width,
    height: height,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 850 },
            debug: false
        }
    },
    scene: [
        MenuScene,
        GameScene,
        GameOverScene
    ],
};

const game = new Phaser.Game(config);

// 监听窗口变化，动态调整游戏大小
window.addEventListener('resize', () => {
    const { width, height } = getGameSize();
    game.scale.resize(width, height);
}); 