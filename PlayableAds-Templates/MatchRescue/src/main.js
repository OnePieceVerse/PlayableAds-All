import { Start } from './scenes/Start.js';
import { Preload } from './scenes/Preload.js';
import { Game } from './scenes/Game.js';
import { GameOver } from './scenes/GameOver.js';
import { GameSuccess } from './scenes/GameSuccess.js';

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
        Start,
        Preload,
        Game,
        GameOver,
        GameSuccess
    ],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
