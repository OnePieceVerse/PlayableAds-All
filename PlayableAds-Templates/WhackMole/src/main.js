import { Start } from './scenes/Start.js';
import { Preload } from './scenes/Preload.js';
import { Game } from './scenes/Game.js';
import { GameOver } from './scenes/GameOver.js';
import { GameSuccess } from './scenes/GameSuccess.js';


const config = {
    type: Phaser.AUTO,
    title: 'Whack-A-Mole',
    description: 'A fun whack-a-mole game built with Phaser 3',
    parent: 'game-container',
    width: 600,
    height: 800,
    backgroundColor: '#000000',
    pixelArt: false,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // No gravity needed for whack-a-mole
            debug: false
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
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
