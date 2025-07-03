import GameScene from './scenes/GameScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const config = {
    type: Phaser.AUTO,
    title: 'Flappy Bird',
    description: 'A flappy bird game built with Phaser 3',
    width: 380,
    height: 680,
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