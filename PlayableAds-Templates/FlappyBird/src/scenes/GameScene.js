import themeConfig from '../config/ThemeConfig.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image(themeConfig.background.key, themeConfig.background.path);
        this.load.image(themeConfig.bomb.key, themeConfig.bomb.path);
        this.load.spritesheet(themeConfig.playerSpritesheet.key, themeConfig.playerSpritesheet.path, {
            frameWidth: themeConfig.playerSpritesheet.frameWidth,
            frameHeight: themeConfig.playerSpritesheet.frameHeight
        });
        this.load.image(themeConfig.obstacleTop.key, themeConfig.obstacleTop.path);
        this.load.image(themeConfig.obstacleBottom.key, themeConfig.obstacleBottom.path);
        // 加载音效
        this.load.audio(themeConfig.clickSound.key, themeConfig.clickSound.path);
        this.load.audio(themeConfig.loseSound.key, themeConfig.loseSound.path);
    }

    create() {
        // 清理可能存在的旧定时器
        this.time.removeAllEvents();

        // 游戏状态
        this.gameOver = false;
        this.score = 0;
        this.difficulty = 1;  // 初始难度系数
        this.gameTime = 0;    // 游戏时间
        this.passedObstacles = new Set();  // 用于记录已经通过的障碍物
        this.obstaclePairs = new Map();    // 用于记录障碍物对

        // 添加背景
        this.background = this.add.image(190, 340, themeConfig.background.key)
            .setDisplaySize(380, 680);

        // 创建玩家
        this.player = this.physics.add.sprite(100, 340, themeConfig.playerSpritesheet.key);
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        // 设置玩家显示尺寸
        this.player.setDisplaySize(64, 64);
        this.player.body.setSize(themeConfig.playerSpritesheet.frameWidth * 0.6, themeConfig.playerSpritesheet.frameHeight * 0.6);

        // 创建动画
        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers(themeConfig.playerSpritesheet.key, {
                start: 0,
                end: themeConfig.playerSpritesheet.totalFrames - 1
            }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'fall',
            frames: this.anims.generateFrameNumbers(themeConfig.playerSpritesheet.key, {
                start: 0,
                end: themeConfig.playerSpritesheet.totalFrames - 1
            }),
            frameRate: 24,
            repeat: -1
        });

        // 创建障碍物组
        this.obstacles = this.physics.add.group();
        this.createObstacle();

        // 创建炸弹组
        this.bombs = this.physics.add.group();
        this.bombTimer = this.time.addEvent({
            delay: 2000,
            callback: this.createBomb,
            callbackScope: this,
            loop: true
        });

        // 设置碰撞
        this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

        // 设置鼠标点击事件
        this.input.on('pointerdown', this.handleClick, this);

        // 分数显示
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#fff' });
        this.scoreText.setDepth(1000);

        // 难度显示
        this.difficultyText = this.add.text(16, 50, 'Difficulty: 1', { fontSize: '24px', fill: '#fff' });
        this.difficultyText.setDepth(1000);

        // 游戏结束文本
        this.gameOverText = this.add.text(190, 340, 'Game Over\nClick to restart', {
            fontSize: '24px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5).setVisible(false);
        this.gameOverText.setDepth(1000);

        // 创建计时器
        this.time.addEvent({
            delay: 1000,
            callback: this.updateDifficulty,
            callbackScope: this,
            loop: true
        });

        // 添加音效对象
        this.clickSound = this.sound.add(themeConfig.clickSound.key);
        this.loseSound = this.sound.add(themeConfig.loseSound.key);
    }

    handleClick() {
        if (this.gameOver) {
            // 游戏结束后忽略所有点击输入
            return;
        }
        // 播放点击音效
        this.clickSound.play();

        this.player.setVelocityY(-300);
        this.player.anims.play('fly', true);
    }

    updateDifficulty() {
        if (this.gameOver) return;

        this.gameTime += 1;
        // 每5秒增加一次难度
        if (this.gameTime % 5 === 0) {
            this.difficulty += 0.2;
            this.difficultyText.setText('Difficulty: ' + this.difficulty.toFixed(1));

            // 更新炸弹生成频率
            this.bombTimer.delay = Math.max(500, 2000 / this.difficulty);
        }
    }

    createObstacle() {
        if (this.gameOver) return;

        // 先计算理想的位置和大小参数
        const screenWidth = 380;
        const screenHeight = 680;

        // 设置障碍物间隙
        const minGap = 140;
        const maxGap = 180;
        const gap = Phaser.Math.Between(minGap, maxGap);

        // 素材高度和宽度
        const mountainWidth = 1025;
        const mountainHeight = 1536;

        // 设置障碍物宽度
        const obstacleWidth = 60;  // 固定的障碍物宽度

        // 计算顶部障碍物的理想高度
        const minTopHeight = 80;
        const maxTopHeight = 450;
        const topHeight = Phaser.Math.Between(minTopHeight, maxTopHeight);

        // 计算底部障碍物的理想高度
        let bottomHeight = screenHeight - topHeight - gap;

        // 确保底部障碍物有足够的高度
        if (bottomHeight < 80) {
            bottomHeight = 90;
        }

        // 创建顶部障碍物
        const topObstacle = this.obstacles.create(screenWidth, 0, themeConfig.obstacleTop.key);
        // 设置顶部障碍物显示尺寸
        topObstacle.setDisplaySize(obstacleWidth, topHeight);
        topObstacle.setOrigin(0, 0);
        topObstacle.setImmovable(true);
        topObstacle.body.allowGravity = false;
        topObstacle.setVelocityX(-200 * this.difficulty);
        const obstaclePairId = Date.now() + Math.random();  // 确保唯一性
        topObstacle.obstacleId = obstaclePairId;
        topObstacle.isTop = true;

        // 创建底部障碍物
        const bottomObstacle = this.obstacles.create(screenWidth, screenHeight - bottomHeight, themeConfig.obstacleBottom.key);
        // 设置底部障碍物显示尺寸
        bottomObstacle.setDisplaySize(obstacleWidth, bottomHeight);
        bottomObstacle.setOrigin(0, 0);
        bottomObstacle.setImmovable(true);
        bottomObstacle.body.allowGravity = false;
        bottomObstacle.setVelocityX(-200 * this.difficulty);
        bottomObstacle.obstacleId = obstaclePairId;
        bottomObstacle.isTop = false;

        // 记录障碍物对信息
        this.obstaclePairs.set(obstaclePairId, {
            top: topObstacle,
            bottom: bottomObstacle,
            passed: false
        });

        // 设置定时器创建新障碍物，间隔随难度减少
        this.time.delayedCall(Math.max(500, 1500 / this.difficulty), this.createObstacle, [], this);
    }

    createBomb() {
        if (this.gameOver) return;

        const bomb = this.bombs.create(380, Phaser.Math.Between(100, 580), themeConfig.bomb.key);
        bomb.setVelocityX(-300 * this.difficulty);  // 速度随难度增加
        bomb.setDisplaySize(25, 25);
        bomb.body.allowGravity = false;
        bomb.setCollideWorldBounds(false);
    }

    hitObstacle(player, obstacle) {
        this.gameOver = true;
        this.physics.pause();
        player.setTint(0xff0000);
        // 播放失败音效
        this.loseSound.play();

        // 移除点击事件监听器，防止在死亡期间意外重启
        this.input.off('pointerdown', this.handleClick, this);
        // 延迟0.5秒后切换到游戏结束场景
        this.time.delayedCall(500, () => {
            this.scene.start('GameOverScene', { score: this.score });
        });
    }

    hitBomb(player, bomb) {
        this.gameOver = true;
        this.physics.pause();
        player.setTint(0xff0000);
        // 播放失败音效
        this.loseSound.play();

        // 移除点击事件监听器，防止在死亡期间意外重启
        this.input.off('pointerdown', this.handleClick, this);
        // 延迟0.5秒后切换到游戏结束场景
        this.time.delayedCall(500, () => {
            this.scene.start('GameOverScene', { score: this.score });
        });
    }

    update() {
        if (this.gameOver) {
            return;
        }

        // 根据速度播放动画
        if (this.player.body.velocity.y > 0) {
            this.player.anims.play('fall', true);
        }

        // 检查是否通过障碍物对并计分
        this.obstaclePairs.forEach((pair, pairId) => {
            if (pair.passed) return; // 已经计过分的障碍物对

            // 获取障碍物的实际碰撞体位置（考虑offset）
            const topObstacle = pair.top;
            const bottomObstacle = pair.bottom;

            // 计算障碍物的实际右边界（考虑offset和size）
            const topRightEdge = topObstacle.x + topObstacle.body.width + topObstacle.body.offset.x;
            const bottomRightEdge = bottomObstacle.x + bottomObstacle.body.width + bottomObstacle.body.offset.x;

            // 取两个障碍物中更靠右的边界作为通过判定点
            const rightmostEdge = Math.max(topRightEdge, bottomRightEdge);

            // 计算玩家的实际左边界（考虑碰撞体大小和位置）
            const playerLeftEdge = this.player.x + this.player.body.offset.x + this.player.body.width;

            // 如果玩家的左边界已经通过了障碍物的右边界
            if (playerLeftEdge > rightmostEdge) {
                pair.passed = true;
                this.score += 10;
                this.scoreText.setText('Score: ' + this.score);
            }
        });

        // 移除超出屏幕的障碍物和清理障碍物对记录
        this.obstacles.getChildren().forEach(obstacle => {
            if (obstacle.x < -obstacle.width) {
                // 清理障碍物对记录
                if (this.obstaclePairs.has(obstacle.obstacleId)) {
                    this.obstaclePairs.delete(obstacle.obstacleId);
                }
                obstacle.destroy();
            }
        });

        // 移除超出屏幕的炸弹
        this.bombs.getChildren().forEach(bomb => {
            if (bomb.x < -bomb.width) {
                bomb.destroy();
            }
        });
    }
} 