import { BootScene } from './scenes/Boot.js';
import { PreloaderScene } from './scenes/Preloader.js';
import { GameScene } from './scenes/Game.js';
import { GameoverScene } from './scenes/Gameover.js';
import { GamesuccessScene } from './scenes/Gamesuccess.js';

const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    width: 600,
    height: 800,
    backgroundColor: '#000000',
    pixelArt: false,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 500 }
        }
    },
    scene: [
        BootScene,
        PreloaderScene,
        GameScene,
        GameoverScene,
        GamesuccessScene
    ],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
