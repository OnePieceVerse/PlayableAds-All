export class GameSuccess extends Phaser.Scene {

    constructor() {
        super('GameSuccess');
    }

    preload() {
    }

    create() {
        this.text = this.add.text(200, 400, 'Game Success', { fontSize: '32px', fill: '#FFF' });
    }

    update() {
    }

}
