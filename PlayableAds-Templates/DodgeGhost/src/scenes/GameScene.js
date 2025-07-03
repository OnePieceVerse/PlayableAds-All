import themeConfig from '../config/ThemeConfig.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.ghosts = null;
        this.platforms = null;
        this.cursors = null;
        this.gameTime = 0;
        this.timeText = null;
        this.spawnTimer = null;
        this.isGameOver = false;
        this.isGameStarted = false;
        this.playerSpeed = 250; // 玩家移动速度
        this.fenceConfig = {
            width: 380, // 游戏屏幕宽度
            height: 680, // 游戏屏幕高度
            x: 0, // 从屏幕左上角开始
            y: 0, // 从屏幕左上角开始
            wallHeight: 25 // 边界高度参数
        };
        this.canTeleport = true; // 穿墙冷却标志
        // 技能相关属性
        this.isInvincible = false; // 是否处于无敌状态
        this.skillButton = null; // 技能按钮
        this.skillCooldown = 0; // 技能冷却时间
        this.skillButtonText = null; // 冷却倒计时文本
        this.invincibleTimer = null; // 无敌状态计时器
    }

    preload() {
        // 动态加载资源
        this.load.image('borderRow', themeConfig.borderRow.path);
        this.load.image('borderColumn', themeConfig.borderColumn.path);
        this.load.image('bg', themeConfig.background.path);
        this.load.image('ghost', themeConfig.ghost.path);
        this.load.spritesheet('playerSpritesheet', themeConfig.playerSpritesheet.path, { frameWidth: themeConfig.playerSpritesheet.frameWidth, frameHeight: themeConfig.playerSpritesheet.frameHeight });
        this.load.image('player', themeConfig.player.path);
        this.load.image('stealth', themeConfig.stealth.path);
        // 加载音频
        this.load.audio('bgm', themeConfig.bgm.path);
        this.load.audio('stealthSound', themeConfig.stealthSound.path);
        this.load.audio('loseSound', themeConfig.loseSound.path);
    }

    create() {
        this.gameTime = 0;
        this.isGameOver = false;
        this.isGameStarted = false; // 游戏开始时设置为未开始状态

        // 技能相关重置
        this.isInvincible = false;
        this.skillCooldown = 0;
        if (this.skillCooldownEvent) {
            this.skillCooldownEvent.remove(false);
            this.skillCooldownEvent = null;
        }
        if (this.invincibleTimer) {
            this.invincibleTimer.remove(false);
            this.invincibleTimer = null;
        }

        // 添加背景
        this.bg = this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(380, 680);

        // 创建围栏
        this.platforms = this.physics.add.staticGroup();
        this.createFence(this.fenceConfig);

        // 创建玩家
        this.player = this.physics.add.sprite(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'playerSpritesheet'
        );
        // 创建动画
        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('playerSpritesheet', { start: 0, end: themeConfig.playerSpritesheet.totalFrames - 1 }),
            frameRate: 24,
            repeat: -1
        });
        this.player.setCollideWorldBounds(false);
        this.player.setBounce(0);
        this.player.setDamping(false);
        this.player.setDrag(0);
        this.player.setGravity(0);
        this.player.setVelocity(0, 0);
        // 设置玩家显示尺寸
        this.player.setDisplaySize(64, 64);
        this.player.body.setSize(themeConfig.playerSpritesheet.frameWidth * 0.6, themeConfig.playerSpritesheet.frameHeight * 0.6);
        // 设置默认朝向（向右）
        this.player.setFlipX(false);

        // 创建鬼群组
        this.ghosts = this.physics.add.group();

        // 添加第一个鬼
        this.spawnGhost();

        // 设置碰撞
        this.physics.add.collider(this.player, this.platforms, this.handleWallCollision, null, this);
        this.physics.add.collider(this.ghosts, this.platforms);

        // 添加鬼和玩家的碰撞检测
        this.physics.add.overlap(this.player, this.ghosts, this.handleCollision, null, this);

        // 添加计时器文本 
        this.timeText = this.add.text(0, 0, 'Survival time: 0s', { fontSize: '26px', fill: '#ff0000' });

        // 创建技能按钮
        this.createSkillButton();

        // 设置定时生成鬼（但先不启动）
        this.spawnTimer = this.time.addEvent({
            delay: 1000,
            callback: this.spawnGhost,
            callbackScope: this,
            loop: true,
            paused: true // 初始时暂停
        });

        // 设置键盘控制
        this.keys = {
            w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        };

        // 音频对象
        this.bgmSound = this.sound.add('bgm', { loop: true, volume: 0.5 });
        this.stealthSound = this.sound.add('stealthSound', { volume: 1 });
        this.loseSound = this.sound.add('loseSound', { volume: 1 });

        // 开始时播放背景音乐
        this.bgmSound.play();

        // 创建开始游戏蒙版
        this.createStartOverlay();
    }

    createStartOverlay() {
        // 创建半透明黑色蒙版
        this.startOverlay = this.add.rectangle(0, 0, 380, 680, 0x000000, 0.7);
        this.startOverlay.setOrigin(0, 0);

        // 游戏标题
        this.startTitle = this.add.text(190, 200, 'Dodge Ghosts', {
            fontSize: '40px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.startTitle.setOrigin(0.5);

        // 游戏说明
        this.startInstruction = this.add.text(190, 280, 'Survive as long as possible \n and dodge the ghosts!', {
            fontSize: '20px',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.startInstruction.setOrigin(0.5);

        // 点击开始提示
        this.startText = this.add.text(190, 400, 'Click to start game', {
            fontSize: '25px',
            fill: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.startText.setOrigin(0.5);

        // 添加闪烁动画效果
        this.tweens.add({
            targets: this.startText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // 添加点击事件监听器
        this.input.on('pointerdown', this.startGame, this);

        // 添加键盘事件监听器（按任意键开始）
        this.input.keyboard.on('keydown', this.startGame, this);
    }

    startGame() {
        if (this.isGameStarted) return; // 防止重复启动

        this.isGameStarted = true;

        // 技能相关重置（防止按钮状态异常）
        this.isInvincible = false;
        this.skillCooldown = 0;
        if (this.skillCooldownEvent) {
            this.skillCooldownEvent.remove(false);
            this.skillCooldownEvent = null;
        }
        if (this.invincibleTimer) {
            this.invincibleTimer.remove(false);
            this.invincibleTimer = null;
        }
        if (this.skillButton) {
            this.skillButton.setFillStyle(0x4e8cff, 1);
            this.skillButton.setStrokeStyle(3, 0xffffff);
        }
        if (this.skillButtonText) {
            this.skillButtonText.setText('');
        }

        // 游戏开始后调低背景亮度
        if (this.bg) {
            this.bg.setTint(0x555555);
        }

        // 移除开始蒙版
        this.startOverlay.destroy();
        this.startTitle.destroy();
        this.startInstruction.destroy();
        this.startText.destroy();

        // 移除事件监听器
        this.input.off('pointerdown', this.startGame, this);
        this.input.keyboard.off('keydown', this.startGame, this);

        // 启动游戏计时器和鬼魂生成
        this.spawnTimer.paused = false;
    }

    createFence(config) {
        const { width, height, x, y, wallHeight } = config;

        // 创建四个边的围栏
        // 上边 - 使用屏幕宽度，高度为wallHeight
        const topWall = this.platforms.create(x + width / 2, y + wallHeight / 2, 'borderRow');
        topWall.setDisplaySize(width, wallHeight);
        topWall.refreshBody();

        // 下边 - 使用屏幕宽度，高度为wallHeight
        const bottomWall = this.platforms.create(x + width / 2, y + height - wallHeight / 2, 'borderRow');
        bottomWall.setDisplaySize(width, wallHeight);
        bottomWall.refreshBody();

        // 左边 - 使用wallHeight宽度，高度为屏幕高度
        const leftWall = this.platforms.create(x + wallHeight / 2, y + height / 2, 'borderColumn');
        leftWall.setDisplaySize(wallHeight, height);
        leftWall.refreshBody();

        // 右边 - 使用wallHeight宽度，高度为屏幕高度
        const rightWall = this.platforms.create(x + width - wallHeight / 2, y + height / 2, 'borderColumn');
        rightWall.setDisplaySize(wallHeight, height);
        rightWall.refreshBody();
    }

    handleCollision(player, ghost) {
        if (this.isGameOver || this.isInvincible) return; // 无敌状态下不触发碰撞

        this.isGameOver = true;
        // 立即暂停物理引擎，停止所有运动
        this.physics.pause();
        // 玩家变红
        player.setTint(0xff0000);
        // 停止背景音乐，播放lose音效
        if (this.bgmSound && this.bgmSound.isPlaying) {
            this.bgmSound.stop();
        }
        if (this.loseSound) {
            this.loseSound.play();
        }
        // 0.5秒后跳转到游戏结束场景
        this.time.delayedCall(500, () => {
            this.scene.start('GameOverScene', { time: this.gameTime });
        });
    }

    handleWallCollision(player, wall) {
        if (!this.canTeleport && !this.isInvincible) return; // 无敌状态下可以穿墙

        const { width, height, x, y, wallHeight } = this.fenceConfig;

        // 获取碰撞的墙的位置
        const wallX = wall.x;
        const wallY = wall.y;

        // 判断是哪个方向的墙
        if (Math.abs(wallX - x) < wallHeight) {
            // 左墙
            player.x = x + width - wallHeight - player.displayWidth / 2 - 1;
        } else if (Math.abs(wallX - (x + width)) < wallHeight) {
            // 右墙
            player.x = x + wallHeight + player.displayWidth / 2 + 1;
        } else if (Math.abs(wallY - y) < wallHeight) {
            // 上墙
            player.y = y + height - wallHeight - player.displayHeight / 2 - 1;
        } else if (Math.abs(wallY - (y + height)) < wallHeight) {
            // 下墙
            player.y = y + wallHeight + player.displayHeight / 2 + 1;
        }

        // 限制玩家在围栏内
        player.x = Phaser.Math.Clamp(player.x, x + wallHeight + player.displayWidth / 2, x + width - wallHeight - player.displayWidth / 2);
        player.y = Phaser.Math.Clamp(player.y, y + wallHeight + player.displayHeight / 2, y + height - wallHeight - player.displayHeight / 2);

        // 只在非无敌状态下设置穿墙冷却
        if (!this.isInvincible) {
            this.canTeleport = false;
            this.time.delayedCall(800, () => {
                this.canTeleport = true;
            });
        }
    }

    handlePlayerMovement() {
        if (this.isGameOver || !this.isGameStarted) return;

        // 计算水平和垂直方向的移动
        let moveX = 0;
        let moveY = 0;

        // 处理WASD移动
        if (this.keys.w.isDown) {
            moveY -= 1;
        }
        if (this.keys.s.isDown) {
            moveY += 1;
        }
        if (this.keys.a.isDown) {
            moveX -= 1;
        }
        if (this.keys.d.isDown) {
            moveX += 1;
        }

        // 如果有对角线移动，标准化移动向量
        if (moveX !== 0 && moveY !== 0) {
            const length = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= length;
            moveY /= length;
        }

        // 只有在没有移动输入时才重置速度，避免与穿墙逻辑冲突
        if (moveX === 0 && moveY === 0) {
            this.player.setVelocity(0, 0);
        } else {
            // 应用移动速度
            this.player.setVelocity(
                moveX * this.playerSpeed,
                moveY * this.playerSpeed
            );
        }

        // 更新动画和方向
        if (moveX !== 0 || moveY !== 0) {
            if (this.player.texture.key !== 'playerSpritesheet') {
                this.player.setTexture('playerSpritesheet');
            }
            this.player.play('fly', true);
            // 根据水平移动方向翻转玩家
            if (moveX < 0) {
                this.player.setFlipX(true);
            } else if (moveX > 0) {
                this.player.setFlipX(false);
            }
        } else {
            if (this.player.texture.key !== 'player') {
                this.player.setTexture('player');
                // this.player.setDisplaySize(64, 64);
                // this.player.body.setSize(themeConfig.playerSpritesheet.frameWidth * 0.8, themeConfig.playerSpritesheet.frameHeight * 0.7);
            }
            this.player.anims.stop();
        }
    }

    update() {
        if (this.isGameOver || !this.isGameStarted) return;

        // 空格键触发技能
        if (Phaser.Input.Keyboard.JustDown(this.keys.space)) {
            this.activateSkill();
        }

        // 更新游戏时间
        this.gameTime += this.game.loop.delta;
        this.timeText.setText('Survival time: ' + (this.gameTime / 1000).toFixed(3) + 's');

        // 处理玩家移动
        this.handlePlayerMovement();

        // 更新鬼的移动和朝向
        this.ghosts.getChildren().forEach(ghost => {
            const angle = Phaser.Math.Angle.Between(ghost.x, ghost.y, this.player.x, this.player.y);
            const speed = 150;
            ghost.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            // 让shovel顶部朝向主角
            ghost.setRotation(angle + Math.PI / 2);
        });

        // 处理穿墙
        this.handleWrapping();
    }

    handleWrapping() {
        const { width, height, x, y, wallHeight } = this.fenceConfig;

        // 处理鬼穿墙
        this.ghosts.getChildren().forEach(ghost => {
            if (ghost.x < x + wallHeight) {
                ghost.x = x + width - wallHeight;
            } else if (ghost.x > x + width - wallHeight) {
                ghost.x = x + wallHeight;
            }

            if (ghost.y < y + wallHeight) {
                ghost.y = y + height - wallHeight;
            } else if (ghost.y > y + height - wallHeight) {
                ghost.y = y + wallHeight;
            }
        });
    }

    spawnGhost() {
        // 使用与构造函数相同的fenceConfig
        const fenceConfig = this.fenceConfig;

        // 计算安全生成位置（远离玩家）
        let x, y;
        do {
            // 在围栏内随机生成x坐标（避开边界50像素）
            x = Phaser.Math.Between(fenceConfig.x + fenceConfig.wallHeight + 50, fenceConfig.x + fenceConfig.width - fenceConfig.wallHeight - 50);
            // 在围栏内随机生成y坐标（避开边界50像素）
            y = Phaser.Math.Between(fenceConfig.y + fenceConfig.wallHeight + 50, fenceConfig.y + fenceConfig.height - fenceConfig.wallHeight - 50);
        } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 200); // 确保生成位置与玩家距离不小于200像素

        const ghost = this.ghosts.create(x, y, 'ghost');
        ghost.setBounce(0.2);
        ghost.setCollideWorldBounds(false);
        ghost.setDisplaySize(25, 25);
    }

    createSkillButton() {
        // 用图片替换圆形技能按钮
        if (this.skillButton) this.skillButton.destroy();
        if (this.skillButtonText) this.skillButtonText.destroy();
        if (this.skillButtonIcon) this.skillButtonIcon.destroy();

        // 按钮底色圆形（用于冷却变灰等效果）
        this.skillButton = this.add.circle(320, 620, 25, 0x4e8cff, 1);
        this.skillButton.setInteractive();
        this.skillButton.setStrokeStyle(3, 0xffffff);

        // 技能图标
        this.skillButtonIcon = this.add.image(320, 620, 'stealth');
        this.skillButtonIcon.setDisplaySize(32, 32);
        this.skillButtonIcon.setDepth(1);

        // 添加技能冷却倒计时文本
        this.skillButtonText = this.add.text(320, 620, '', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.skillButtonText.setDepth(2);

        // 按钮交互
        this.skillButton.on('pointerdown', this.activateSkill, this);
        this.skillButton.on('pointerover', () => {
            if (this.skillCooldown <= 0) {
                this.skillButton.setFillStyle(0x3a7bd5);
            }
        });
        this.skillButton.on('pointerout', () => {
            if (this.skillCooldown <= 0) {
                this.skillButton.setFillStyle(0x4e8cff);
            }
        });

        this.skillCooldownEvent = null;
    }

    activateSkill() {
        if (this.skillCooldown > 0 || this.isInvincible || !this.isGameStarted) return;

        // 播放隐身音效
        if (this.stealthSound) {
            this.stealthSound.play();
        }
        // 激活无敌状态
        this.isInvincible = true;
        this.player.setAlpha(0.6); // 变透明

        // 3秒后结束无敌状态
        this.invincibleTimer = this.time.delayedCall(3000, () => {
            this.isInvincible = false;
            this.player.setAlpha(1);
        });

        // 冷却
        this.skillCooldown = 8;
        this.skillButton.setFillStyle(0x666666, 0.5); // 变灰
        this.skillButton.setStrokeStyle(3, 0x999999);
        this.skillButtonText.setText('8'); // 显示初始冷却时间

        // 冷却倒计时
        if (this.skillCooldownEvent) {
            this.skillCooldownEvent.remove(false);
        }
        this.skillCooldownEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateSkillCooldown,
            callbackScope: this,
            loop: true
        });
    }

    updateSkillCooldown() {
        this.skillCooldown--;
        this.skillButtonText.setText(this.skillCooldown.toString()); // 在按钮上显示倒计时

        if (this.skillCooldown <= 0) {
            // 冷却结束，恢复按钮
            this.skillButton.setFillStyle(0x4e8cff, 1);
            this.skillButton.setStrokeStyle(3, 0xffffff);
            if (this.skillCooldownEvent) {
                this.skillCooldownEvent.remove(false);
                this.skillCooldownEvent = null;
            }
            this.skillButtonText.setText('');
        }
    }
} 