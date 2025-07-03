import { Start } from './scenes/Start.js';
import { Preload } from './scenes/Preload.js';
import { Game } from './scenes/Game.js';
import { GameSuccess } from './scenes/GameSuccess.js';
import { GameOver } from './scenes/GameOver.js';

const config = {
    type: Phaser.AUTO,
    title: 'Memory Pick',
    description: 'A memory game where you need to find matching images',
    parent: 'game-container',
    width: 600,
    height: 800,
    backgroundColor: '#1e1e2e',
    pixelArt: false,
    scene: [
        Start,
        Preload,
        Game,
        GameSuccess,
        GameOver
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
