import { BootScene } from './scenes/Boot.js';
import { PreloaderScene } from './scenes/Preloader.js';
import { GameScene } from './scenes/Game.js';
import { GameoverScene } from './scenes/Gameover.js';
import { GamesuccessScene } from './scenes/Gamesuccess.js';

const config = {
    type: Phaser.AUTO,
    title: 'Jump Escape',
    description: '',
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    pixelArt: false,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 500 }
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        BootScene,
        PreloaderScene,
        GameScene,
        GameoverScene,
        GamesuccessScene
    ],
}

new Phaser.Game(config);
