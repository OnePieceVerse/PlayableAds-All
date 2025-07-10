import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const width = window.innerWidth;
const height = window.innerHeight;
const config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
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