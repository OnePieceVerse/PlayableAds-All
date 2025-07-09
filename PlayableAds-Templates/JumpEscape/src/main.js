import { Start } from './scenes/Start.js';
import { Preload } from './scenes/Preload.js';
import { Game } from './scenes/Game.js';
import { GameOver } from './scenes/GameOver.js';
import { GameSuccess } from './scenes/GameSuccess.js';

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
        Start,
        Preload,
        Game,
        GameOver,
        GameSuccess
    ],
}

new Phaser.Game(config);
