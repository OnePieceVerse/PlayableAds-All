export class GameOver extends Phaser.Scene {

    constructor() {
        super('GameOver');
    }

    preload() {
    }

    create() {
        this.text = this.add.text(200, 400, 'Game Over', { fontSize: '32px', fill: '#FFF' });
    }

    update() {
    }

}
