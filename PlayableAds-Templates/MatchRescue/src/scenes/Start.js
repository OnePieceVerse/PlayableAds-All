export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
    }

    create() {
        this.scene.start('Preload');
    }

    update() {
    }

}
