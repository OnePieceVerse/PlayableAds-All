export class GameoverScene extends Phaser.Scene {

    constructor() {
        super('GameoverScene');
    }

    preload() {
    }

    create() {
        this.text = this.add.text(200, 400, 'Game Over', { fontSize: '32px', fill: '#FFF' });
    }

    update() {
    }

}
