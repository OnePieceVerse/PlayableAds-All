import themeConfig from '../config/ThemeConfig.js';

// Block图片组件，直接用图片素材，每个block有独立血量和文本
class Block extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, size, columnRef, specialType = null) {
        super(scene, x, y, 'block');
        this.scene = scene;
        this.hp = 1;
        this.columnRef = columnRef; // 引用所属column
        this.specialType = specialType; // '2X' 或 'speedup' 或 null
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDisplaySize(size, size);
        this.setOrigin(0.5, 0.5);
        this.body.allowGravity = false;
        let fontSize = Math.floor(size * 0.45);
        if (specialType === 'speedup') fontSize = Math.floor(size * 0.2); // speedup字体缩小
        // 血量文本，默认不显示
        this.hpText = scene.add.text(x, y, '', {
            fontSize: fontSize + 'px', fill: '#222', fontStyle: 'bold', stroke: '#fff', strokeThickness: 2
        }).setOrigin(0.5).setDepth(5);
        this.hpText.setVisible(false);
        this.updateSpecialStyle();
    }
    updateSpecialStyle() {
        if (!this.hpText || !this.hpText.scene) return;
        if (this.specialType === '2X') {
            this.setTint(0x8ecae6);
            this.hpText.setColor('#1976d2');
        } else if (this.specialType === 'speedup') {
            this.setTint(0xfbb4b9);
            this.hpText.setColor('#c62828');
        } else {
            this.clearTint();
            this.hpText.setColor('#222');
        }
    }
    showHpText(hp) {
        if (this.hpText) {
            if (this.specialType === '2X') {
                this.hpText.setText('2X');
            } else if (this.specialType === 'speedup') {
                this.hpText.setText('SpeedUp');
            } else {
                this.hpText.setText(hp);
            }
            this.hpText.x = this.x;
            this.hpText.y = this.y;
            this.hpText.setVisible(true);
        }
    }
    hideHpText() {
        if (this.hpText) {
            this.hpText.setVisible(false);
        }
    }
    destroyBlock() {
        if (this.hpText) this.hpText.destroy();
        this.destroy();
    }
    highlightOnHit(onComplete) {
        const curW = this.displayWidth;
        const curH = this.displayHeight;
        this.scene.tweens.add({
            targets: this,
            displayWidth: curW * 1.15,
            displayHeight: curH * 1.15,
            duration: 80,
            yoyo: true,
            // 改成低饱和度的浅黄色
            onStart: () => this.setTint(0xfff000),
            onYoyo: () => this.updateSpecialStyle(),
            onComplete: () => {
                this.displayWidth = curW;
                this.displayHeight = curH;
                if (onComplete) onComplete();
            }
        });
    }
}

// BlockColumn组件，管理一列blocks和血量和文本
class BlockColumn {
    constructor(scene, colIndex, x, y, stackCount, blockSize, specialType = null) {
        this.scene = scene;
        this.colIndex = colIndex;
        this.x = x;
        this.y = y;
        this.stackCount = stackCount;
        this.blockSize = blockSize;
        this.blocks = [];
        this.specialType = specialType; // '2X' 或 'speedup' 或 null
        this.createBlocks();
    }
    createBlocks() {
        const offset = this.scene.blockStackOffset || 0;
        for (let i = 0; i < this.stackCount; i++) {
            const block = new Block(this.scene, this.x, this.y - i * offset, this.blockSize, this, this.specialType);
            this.blocks.push(block);
        }
        this.updateHpTextDisplay();
    }
    move(dy) {
        this.y += dy;
        this.blocks.forEach((block) => {
            block.y += dy;
            block.setPosition(block.x, block.y);
            if (block.hpText) {
                block.hpText.x = block.x;
                block.hpText.y = block.y;
            }
        });
    }
    setSpecialType(type) {
        this.specialType = type;
        this.blocks.forEach(block => {
            block.specialType = type;
            block.updateSpecialStyle();
        });
        this.updateHpTextDisplay();
    }
    destroyBlock(block) {
        const idx = this.blocks.indexOf(block);
        if (idx !== -1) {
            block.destroyBlock();
            this.blocks.splice(idx, 1);
            this.updateHpTextDisplay();
            // 特殊列被全部击破
            if (this.blocks.length === 0 && this.specialType) {
                this.scene.handleSpecialColumnClear(this.specialType);
                this.specialType = null;
            }
        }
    }
    updateHpTextDisplay() {
        // 只有最顶层block显示血量（y最小的block）
        if (this.blocks.length === 0) return;
        let topBlock = this.blocks[0];
        for (const block of this.blocks) {
            if (block.y < topBlock.y) topBlock = block;
        }
        this.blocks.forEach((block) => {
            if (block === topBlock) {
                block.showHpText(this.blocks.length);
                if (block.hpText) {
                    block.hpText.setScale(1.2);
                    this.scene.tweens.add({
                        targets: block.hpText,
                        scale: 1,
                        duration: 120,
                        ease: 'Bounce'
                    });
                }
            } else {
                block.hideHpText();
            }
        });
    }
    getTopBlock() {
        if (this.blocks.length === 0) return null;
        let topBlock = this.blocks[0];
        for (const block of this.blocks) {
            if (block.y < topBlock.y) topBlock = block;
        }
        return topBlock;
    }
    isEmpty() {
        return this.blocks.length === 0;
    }
}

// BlockWall组件，管理一行BlockColumn
class BlockWall {
    constructor(scene, y, blockCount, blockRowsMin, blockRowsMax, blockSize, wallIndex = 0, specialTypeForThisWall = null) {
        this.scene = scene;
        this.y = y;
        this.blockCount = blockCount;
        this.blockRowsMin = blockRowsMin;
        this.blockRowsMax = blockRowsMax;
        this.blockSize = blockSize;
        this.wallIndex = wallIndex;
        this.specialTypeForThisWall = specialTypeForThisWall;
        this.columns = [];
        this.createColumns();
        this.setDepth(1000 - wallIndex);
    }
    createColumns() {
        const xOffset = this.wallIndex % 2 === 1 ? -this.blockSize / 2 : 0;
        let specialColIdx = -1;
        let specialType = null;
        if (this.specialTypeForThisWall) {
            specialColIdx = Phaser.Math.Between(0, this.blockCount - 1);
            specialType = this.specialTypeForThisWall;
        }
        for (let col = 0; col < this.blockCount; col++) {
            const stack = Phaser.Math.Between(this.blockRowsMin, this.blockRowsMax);
            const x = col * this.blockSize + this.blockSize / 2 + xOffset;
            const colType = (col === specialColIdx) ? specialType : null;
            const column = new BlockColumn(this.scene, col, x, this.y, stack, this.blockSize, colType);
            this.columns.push(column);
        }
    }
    setDepth(depth) {
        this.columns.forEach(col => {
            col.blocks.forEach(block => {
                block.setDepth(depth);
                if (block.hpText) block.hpText.setDepth(depth);
            });
        });
    }
    move(dy) {
        this.y += dy;
        this.columns.forEach(col => col.move(dy));
    }
}

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.blocks = null;
        this.bullets = null;
        this.score = 0;
        this.scoreText = null;
        this.blockCount = 8; // 每行block数量
        this.blockWidth = 60; // block宽度（像素）
        this.blockHeight = 60; // block高度（像素）
        this.bulletWidth = 18; // 子弹宽度（像素）
        this.bulletHeight = 18; // 子弹高度（像素）
        this.blockStartY = -this.blockHeight; // 新生成block行的起始y坐标
        this.blockMoveSpeed = 20; // block墙体整体下移速度（像素/秒）
        this.rowGapRatio = 0.7; // 行间距系数（0.7表示每行有30%重叠）
        this.blockGenInterval = this.blockHeight * this.rowGapRatio / this.blockMoveSpeed * 1000; // 新block行生成间隔（ms）
        this.isGameOver = false;
        this.playerSpeed = 350; // 玩家左右移动速度
        this.blockStackOffset = 5; // 堆叠层y轴偏移（像素）
        this.blockRowsMin = 1; // 每列最小堆叠层数
        this.blockRowsMax = 3; // 每列最大堆叠层数
        this.difficultyStep = 0; // 难度递增步长
        this.difficultyInterval = 6000; // 难度递增间隔（ms）
        this.rowIndex = 0; // 当前生成到第几行
        this.blockGenTimer = null;
        this.bulletTimer = null;
        this.difficultyTimer = null;
        this.blockWalls = [];
        this.bulletsPerShot = 1; // 每次发射子弹数
        this.shootInterval = 400; // 射击间隔（ms）
        this.pendingSpecialType = null; // 下一个新行要生成的特殊类型
        this.specialType2XProb = 0.2; // 2X概率(1-speedup概率)
        this.bulletsPerShotMax = 16; // 每次发射子弹数最大值
        this.shootIntervalMin = 100; // 射击间隔最小值
        this.specialTypeInterval = 6000; // 特殊类型生成间隔（ms）
        this.isGamePaused = true;
        // fire技能相关
        this.fireCooldown = 0;
        this.fireCooldownMax = 10000; // 10秒
        this.isFireActive = false;
        this.fireButton = null;
        this.fireCooldownText = null;
        this._oldBulletsPerShot = null;
        this._oldShootInterval = null;
        this.fireTime = 3000; // 狂暴射击持续时间
    }

    preload() {
        this.load.image('background', themeConfig.background.path);
        this.load.image('player', themeConfig.player.path);
        this.load.image('block', themeConfig.block.path);
        this.load.image('bullet', themeConfig.bullet.path);
        this.load.image('fire', themeConfig.fire.path); // fire技能图片
        // 加载音效
        this.load.audio('blockBreak', themeConfig.blockBreak.path);
        this.load.audio('specialBuff', themeConfig.specialBuff.path);
        this.load.audio('lose', themeConfig.lose.path);
    }

    create() {
        // 游戏开始前的蒙版和说明
        this.isGamePaused = true;
        this.isGameOver = false;
        this.score = 0;
        this.difficultyStep = 0;
        this.bulletsPerShot = 1;
        this.shootInterval = 400;
        this.pendingSpecialType = null;
        this.blockWalls = [];
        this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(380, 680);

        // --- 游戏说明蒙版 ---
        this.startMask = this.add.rectangle(190, 340, 380, 680, 0x000000, 0.78).setDepth(99999);
        const introText =
            '拖动角色左右移动，击碎下落的方块\n' +
            '别让方块压到你！\n' +
            '\n特殊道具：\n' +
            '2X：击破后子弹数量翻倍\n' +
            'SpeedUp：击破后射击速度提升\n' +
            '\n狂暴射击：\n' +
            '按下狂暴射击按钮，持续3秒，期间子弹数量和射击速度翻倍!\n'
        this.startText = this.add.text(190, 250, introText, {
            fontSize: '20px',
            fill: '#fff',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#222',
            strokeThickness: 4,
            wordWrap: { width: 320, useAdvancedWrap: true }
        }).setOrigin(0.5).setDepth(99999);
        this.startTip = this.add.text(190, 540, '点击屏幕开始游戏', {
            fontSize: '24px',
            fill: '#ffe066',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#222',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(99999);
        // 添加闪烁渐变效果
        this.tweens.add({
            targets: this.startTip,
            alpha: { from: 1, to: 0.3 },
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        this.input.once('pointerdown', () => {
            this.startMask.destroy();
            this.startText.destroy();
            this.startTip.destroy();
            this.isGamePaused = false;
            this.startGameLogic();
        });
        // --- 游戏说明蒙版结束 ---

        // 玩家
        this.player = this.physics.add.sprite(190, 600, 'player').setDisplaySize(48, 48);
        this.player.body.setSize(themeConfig.player.width * 0.9, themeConfig.player.height * 0.9);
        this.player.setCollideWorldBounds(true);
        this.player.body.allowGravity = false;

        // 拖动控制
        this.input.on('pointermove', pointer => {
            if (this.isGameOver || this.isGamePaused) return;
            this.player.x = Phaser.Math.Clamp(pointer.x, 24, 380 - 24);
        });

        // 子弹组
        this.bullets = this.physics.add.group();

        // 分数文本
        this.scoreText = this.add.text(12, 12, 'score: 0', { fontSize: '22px', fill: '#000', fontStyle: 'bold', stroke: '#fff', strokeThickness: 3 });
        this.scoreText.setDepth(9999); // 始终最上层
        // 初始的blockwall
        for (let i = 0; i < 6; i++) {
            let specialType = null;
            if (i === 5) {
                specialType = '2X';
            }
            const y = this.blockStartY + i * this.blockHeight * this.rowGapRatio;
            const wall = new BlockWall(
                this,
                y,
                this.blockCount,
                this.blockRowsMin + this.difficultyStep,
                this.blockRowsMax + this.difficultyStep,
                this.blockWidth,
                5 - i, // depth: i=0最上层，i=5最下层
                specialType
            );
            this.blockWalls.push(wall);
        }
        // 定时生成障碍墙、发射子弹、难度递增、特殊道具定时器等逻辑，全部放到startGameLogic里
        this.fireCooldown = 0;
        this.isFireActive = false;
        this.fireButton = this.add.image(340, 620, 'fire').setDisplaySize(60, 60).setInteractive().setDepth(9999);
        this.fireCooldownText = this.add.text(340, 620, '', {
            fontSize: '24px', fill: '#fff', fontStyle: 'bold', stroke: '#222', strokeThickness: 4
        }).setOrigin(0.5).setDepth(10000);
        this.fireCooldownText.setVisible(false);
        this.fireButton.on('pointerdown', () => {
            if (this.fireCooldown <= 0 && !this.isFireActive && !this.isGameOver && !this.isGamePaused) {
                this.activateFireSkill();
            }
        });
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.fireCooldown <= 0 && !this.isFireActive && !this.isGameOver && !this.isGamePaused) {
                this.activateFireSkill();
            }
        });
    }

    startGameLogic() {
        // 定时生成障碍墙
        this.blockGenTimer = this.time.addEvent({
            delay: this.blockGenInterval,
            callback: () => {
                this.generateBlockWall();
                this.scoreText.setDepth(9999); // 保证每次生成后分数都在最上层
            },
            callbackScope: this,
            loop: true
        });
        // 定时发射子弹
        this.bulletTimer = this.time.addEvent({
            delay: this.shootInterval,
            callback: this.shootBullet,
            callbackScope: this,
            loop: true
        });
        // 难度递增定时器
        this.difficultyTimer = this.time.addEvent({
            delay: this.difficultyInterval,
            callback: this.increaseDifficulty,
            callbackScope: this,
            loop: true
        });
        // 子弹与block碰撞
        this.physics.add.overlap(this.bullets, this.blocks, this.handleBulletBlock, null, this);
        // 玩家与block碰撞
        this.physics.add.overlap(this.player, this.blocks, this.handlePlayerBlock, null, this);
        // 定时设置下一个新行的特殊类型x
        this.time.addEvent({
            delay: this.specialTypeInterval,
            callback: this.setNextSpecialType,
            callbackScope: this,
            loop: true
        });
    }

    setNextSpecialType() {
        // 随机2X或speedup
        this.pendingSpecialType = Math.random() < this.specialType2XProb ? '2X' : 'speedup';
    }

    generateBlockWall() {
        if (this.isGameOver) return;
        const y = this.blockStartY;
        // 传递pendingSpecialType给BlockWall
        const wall = new BlockWall(
            this,
            y,
            this.blockCount,
            this.blockRowsMin + this.difficultyStep,
            this.blockRowsMax + this.difficultyStep,
            this.blockWidth,
            this.blockWalls.length,
            this.pendingSpecialType // 新增参数
        );
        this.blockWalls.push(wall);
        // 用掉pendingSpecialType
        this.pendingSpecialType = null;
    }

    shootBullet() {
        if (this.isGameOver) return;
        for (let i = 0; i < this.bulletsPerShot; i++) {
            // 随机角度（-15~15度）
            const angle = Phaser.Math.DegToRad(Phaser.Math.Between(-15, 15));
            const speed = 400;
            const vx = speed * Math.sin(angle);
            const vy = -speed * Math.cos(angle);
            const bullet = this.bullets.create(this.player.x, this.player.y - 30, 'bullet');
            bullet.setDisplaySize(this.bulletWidth, this.bulletHeight);
            bullet.body.allowGravity = false;
            bullet.setVelocity(vx, vy);

            // 添加拖尾效果
            this.addBulletTrail(bullet);
        }
    }

    addBulletTrail(bullet) {
        // 创建拖尾效果组
        bullet.trailSprites = [];
        bullet.trailTimer = this.time.addEvent({
            delay: 50,
            callback: () => {
                if (bullet.active) {
                    this.createTrailSprite(bullet);
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    createTrailSprite(bullet) {
        // 创建拖尾精灵
        const trailSprite = this.add.sprite(bullet.x, bullet.y, 'bullet');
        trailSprite.setDisplaySize(this.bulletWidth, this.bulletHeight);
        trailSprite.setAlpha(0.6);

        // 添加到拖尾组
        bullet.trailSprites.push(trailSprite);

        // 限制拖尾数量
        if (bullet.trailSprites.length > 5) {
            const oldTrail = bullet.trailSprites.shift();
            if (oldTrail) oldTrail.destroy();
        }

        // 渐隐效果
        this.tweens.add({
            targets: trailSprite,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                trailSprite.destroy();
            }
        });
    }

    destroyBulletWithTrail(bullet) {
        // 销毁子弹时同时销毁拖尾效果
        if (bullet.trailTimer) {
            bullet.trailTimer.remove();
            bullet.trailTimer = null;
        }
        if (bullet.trailSprites) {
            bullet.trailSprites.forEach(sprite => {
                if (sprite && sprite.active) {
                    sprite.destroy();
                }
            });
            bullet.trailSprites = [];
        }
        bullet.destroy();
    }

    handleBulletBlock(bullet, block) {
        this.destroyBulletWithTrail(bullet);
        block.hp -= 1;
        if (block.hp <= 0) {
            block.highlightOnHit(() => {
                // 只处理当前螺（同一列且x坐标相同的block）
                const colBlocks = this.blocks.getChildren().filter(b => Math.abs(b.x - block.x) < 1e-2 && b.hp > 0);
                // 找到该螺中y最大且小于当前block.y的block（即紧挨着的下一个）
                let nextBlock = null;
                let maxY = -Infinity;
                colBlocks.forEach(b => {
                    if (b.y > maxY && b.y < block.y) {
                        maxY = b.y;
                        nextBlock = b;
                    }
                });
                const remainCount = colBlocks.length - 1;
                if (block.hpText) {
                    if (nextBlock) {
                        nextBlock.hpText = block.hpText;
                        nextBlock.hpText.blockRef = nextBlock;
                        nextBlock.hpText.setText(remainCount);
                        nextBlock.hpText.x = nextBlock.x;
                        nextBlock.hpText.y = nextBlock.y;
                    } else {
                        block.hpText.destroy();
                    }
                }
                block.destroyBlock();
                this.score++;
                this.scoreText.setText('score: ' + this.score);
            });
        } else {
            block.highlightOnHit();
            block.updateHpTextDisplay();
        }
    }

    handlePlayerBlock(player, block) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.physics.pause();
        player.setTint(0xff0000);

        // 清理所有子弹的拖尾效果
        this.bullets.getChildren().forEach(bullet => {
            this.destroyBulletWithTrail(bullet);
        });
        this.sound.play('lose');
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', { score: this.score });
        });
    }

    increaseDifficulty() {
        this.difficultyStep++;
    }

    update() {
        if (this.isGameOver || this.isGamePaused) return;
        // 所有障碍墙整体下移
        const dy = this.blockMoveSpeed * (this.game.loop.delta / 1000);
        this.blockWalls.forEach(wall => wall.move(dy));
        // 子弹超出顶部销毁
        this.bullets.getChildren().forEach(bullet => {
            if (bullet.y < -20) this.destroyBulletWithTrail(bullet);
        });
        // 检查碰撞
        this.checkBulletBlockCollision();
        this.checkPlayerBlockCollision();
        // fire技能冷却逻辑
        if (this.fireCooldown > 0) {
            this.fireCooldown -= this.game.loop.delta;
            if (this.fireCooldown < 0) this.fireCooldown = 0;
        }
        if (this.fireButton && this.fireCooldownText) {
            if (this.fireCooldown > 0) {
                this.fireButton.setTint(0x888888);
                this.fireCooldownText.setText(Math.ceil(this.fireCooldown / 1000));
                this.fireCooldownText.setVisible(true);
            } else {
                this.fireButton.clearTint();
                this.fireCooldownText.setVisible(false);
            }
        }
    }

    checkBulletBlockCollision() {
        this.bullets.getChildren().forEach(bullet => {
            for (const wall of this.blockWalls) {
                for (const column of wall.columns) {
                    // 只检测最顶层block（y最小）
                    const block = column.getTopBlock();
                    if (block && Phaser.Geom.Intersects.CircleToRectangle(
                        new Phaser.Geom.Circle(bullet.x, bullet.y, 9),
                        new Phaser.Geom.Rectangle(block.x - block.displayWidth / 2, block.y - block.displayHeight / 2, block.displayWidth, block.displayHeight)
                    )) {
                        this.destroyBulletWithTrail(bullet);
                        block.hp -= 1;
                        if (block.hp <= 0) {
                            // 播放blockBreak音效（支持重叠播放）
                            this.sound.play('blockBreak');
                            block.highlightOnHit(() => {
                                column.destroyBlock(block);
                                this.score++;
                                this.scoreText.setText('score: ' + this.score);
                            });
                        } else {
                            block.highlightOnHit();
                            column.updateHpTextDisplay();
                        }
                        break;
                    }
                }
            }
        });
    }

    checkPlayerBlockCollision() {
        // 检查所有block与玩家的碰撞
        for (const wall of this.blockWalls) {
            for (const column of wall.columns) {
                for (const block of column.blocks) {
                    if (
                        Phaser.Geom.Intersects.RectangleToRectangle(
                            this.player.getBounds(),
                            new Phaser.Geom.Rectangle(block.x - block.displayWidth / 2, block.y - block.displayHeight / 2, block.displayWidth, block.displayHeight)
                        )
                    ) {
                        this.handlePlayerBlock(this.player, block);
                        return;
                    }
                }
            }
        }
    }

    handleSpecialColumnClear(type) {
        if (type === '2X') {
            // 2X：每次发射子弹数翻倍
            if (this.isFireActive) {
                this._oldBulletsPerShot = Math.min(this.bulletsPerShotMax, this._oldBulletsPerShot * 2);
            } else {
                this.bulletsPerShot = Math.min(this.bulletsPerShotMax, this.bulletsPerShot * 2);
            }
        } else if (type === 'speedup') {
            // speedup：射击间隔提升0.5倍
            if (this.isFireActive) {
                this._oldShootInterval = Math.max(this.shootIntervalMin, this._oldShootInterval * 2 / 3);
            } else {
                this.shootInterval = Math.max(this.shootIntervalMin, this.shootInterval * 2 / 3);
            }
        }
        // 播放specialBuff音效
        this.sound.play('specialBuff');
        // 重启定时器
        if (this.bulletTimer) this.bulletTimer.remove();
        this.bulletTimer = this.time.addEvent({
            delay: this.shootInterval,
            callback: this.shootBullet,
            callbackScope: this,
            loop: true
        });
    }

    activateFireSkill() {
        this.isFireActive = true;
        this.fireCooldown = this.fireCooldownMax;
        this._oldBulletsPerShot = this.bulletsPerShot;
        this._oldShootInterval = this.shootInterval;
        this.bulletsPerShot = this.bulletsPerShot * 2;
        this.shootInterval = this.shootInterval * 2 / 3;
        // 立即重启射击定时器
        if (this.bulletTimer) this.bulletTimer.remove();
        this.bulletTimer = this.time.addEvent({
            delay: this.shootInterval,
            callback: this.shootBullet,
            callbackScope: this,
            loop: true
        });
        // 3秒后恢复
        this.time.delayedCall(this.fireTime, () => {
            this.isFireActive = false;
            this.bulletsPerShot = this._oldBulletsPerShot;
            this.shootInterval = this._oldShootInterval;
            if (this.bulletTimer) this.bulletTimer.remove();
            this.bulletTimer = this.time.addEvent({
                delay: this.shootInterval,
                callback: this.shootBullet,
                callbackScope: this,
                loop: true
            });
        });
    }
} 