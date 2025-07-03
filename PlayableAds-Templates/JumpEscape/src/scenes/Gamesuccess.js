export class GamesuccessScene extends Phaser.Scene {

    constructor() {
        super('GamesuccessScene');
    }

    preload() {
    }

    create() {
        this.text = this.add.text(200, 400, 'Game Success', { fontSize: '32px', fill: '#FFF' });
    }

    update() {
    }

}
