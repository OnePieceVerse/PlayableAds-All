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
        this.fenceConfig = null; // 初始化为null，create时赋值
        this.canTeleport = true; // 穿墙冷却标志
        // 技能相关属性
        this.isInvincible = false; // 是否处于无敌状态
        this.skillButton = null; // 技能按钮
        this.skillCooldown = 0; // 技能冷却时间
        this.skillButtonText = null; // 冷却倒计时文本
        this.invincibleTimer = null; // 无敌状态计时器
        // 拖动相关
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.lastPlayerPos = undefined; // 记录上一次玩家位置
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
        const width = this.scale.width;
        const height = this.scale.height;
        // fenceConfig按比例
        this.fenceConfig = {
            width: width,
            height: height,
            x: 0,
            y: 0,
            wallHeight: Math.round(height * 0.036) // 25/680
        };
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
        this.bg = this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(width, height);

        // 创建围栏
        this.platforms = this.physics.add.staticGroup();
        this.createFence(this.fenceConfig);

        // 创建玩家
        const playerSize = Math.round(width * 0.168); // 64/380
        this.player = this.physics.add.sprite(
            width / 2,
            height / 2,
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
        this.player.setDisplaySize(playerSize, playerSize);
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
        this.timeText = this.add.text(width * 0.02, height * 0.01, 'Survival time: 0s', { fontSize: Math.round(width * 0.068) + 'px', fill: '#ff0000' }); // 26/380

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

        // 允许玩家被点击
        this.player.setInteractive();
        // 监听pointerdown，拖动起点为角色当前位置
        this.input.on('pointerdown', (pointer) => {
            if (this.isGameOver || !this.isGameStarted) return;
            this.isDragging = true;
            this.dragOffset.x = this.player.x - pointer.x;
            this.dragOffset.y = this.player.y - pointer.y;
        });
        // 监听pointermove，拖动时移动玩家
        this.input.on('pointermove', (pointer) => {
            if (this.isDragging && this.isGameStarted && !this.isGameOver) {
                const { width, height, x, y, wallHeight } = this.fenceConfig;
                const minX = x + wallHeight + this.player.displayWidth / 2;
                const maxX = x + width - wallHeight - this.player.displayWidth / 2;
                const minY = y + wallHeight + this.player.displayHeight / 2;
                const maxY = y + height - wallHeight - this.player.displayHeight / 2;
                let newX = Phaser.Math.Clamp(pointer.x + this.dragOffset.x, minX, maxX);
                let newY = Phaser.Math.Clamp(pointer.y + this.dragOffset.y, minY, maxY);
                // 记录上一次位置
                if (this.lastPlayerPos === undefined) {
                    this.lastPlayerPos = { x: this.player.x, y: this.player.y };
                }
                // 判断是否移动
                const moved = (Math.abs(newX - this.player.x) > 0.5) || (Math.abs(newY - this.player.y) > 0.5);
                if (moved) {
                    // 切换为动画
                    if (this.player.texture.key !== 'playerSpritesheet') {
                        this.player.setTexture('playerSpritesheet');
                    }
                    this.player.play('fly', true);
                    // 判断左右朝向
                    if (newX < this.player.x) {
                        this.player.setFlipX(true);
                    } else if (newX > this.player.x) {
                        this.player.setFlipX(false);
                    }
                } else {
                    if (this.player.texture.key !== 'player') {
                        this.player.setTexture('player');
                    }
                    this.player.anims.stop();
                }
                // 穿墙逻辑
                let teleported = false;
                if (this.canTeleport && !this.isInvincible) {
                    // 左边界
                    if (newX <= minX) {
                        newX = maxX;
                        this.canTeleport = false;
                        this.time.delayedCall(800, () => { this.canTeleport = true; });
                        teleported = true;
                    }
                    // 右边界
                    else if (newX >= maxX) {
                        newX = minX;
                        this.canTeleport = false;
                        this.time.delayedCall(800, () => { this.canTeleport = true; });
                        teleported = true;
                    }
                    // 上边界
                    if (newY <= minY) {
                        newY = maxY;
                        this.canTeleport = false;
                        this.time.delayedCall(800, () => { this.canTeleport = true; });
                        teleported = true;
                    }
                    // 下边界
                    else if (newY >= maxY) {
                        newY = minY;
                        this.canTeleport = false;
                        this.time.delayedCall(800, () => { this.canTeleport = true; });
                        teleported = true;
                    }
                    // 穿墙后同步dragOffset，防止闪回
                    if (teleported) {
                        this.dragOffset.x = newX - pointer.x;
                        this.dragOffset.y = newY - pointer.y;
                        // 穿墙后1秒无敌，半透明
                        this.isInvincible = true;
                        this.player.setAlpha(0.6);
                        if (this.invincibleTimer) {
                            this.invincibleTimer.remove(false);
                        }
                        this.invincibleTimer = this.time.delayedCall(1000, () => {
                            this.isInvincible = false;
                            this.player.setAlpha(1);
                        });
                    }
                }
                this.player.setPosition(newX, newY);
                this.lastPlayerPos = { x: newX, y: newY };
            }
        });
        // 监听pointerup，取消拖动
        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

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
        const width = this.scale.width;
        const height = this.scale.height;
        // 创建半透明黑色蒙版
        this.startOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        this.startOverlay.setOrigin(0, 0);

        // 游戏标题
        this.startTitle = this.add.text(width / 2, height * 0.294, 'Dodge Ghosts', {
            fontSize: Math.round(width * 0.105) + 'px', // 40/380
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.startTitle.setOrigin(0.5);

        // 游戏说明
        this.startInstruction = this.add.text(width / 2, height * 0.412, 'Survive as long as possible \n and dodge the ghosts!', {
            fontSize: Math.round(width * 0.052) + 'px', // 20/380
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.startInstruction.setOrigin(0.5);

        // 点击开始提示
        this.startText = this.add.text(width / 2, height * 0.588, 'Click to start game', {
            fontSize: Math.round(width * 0.066) + 'px', // 25/380
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

    update() {
        if (this.isGameOver || !this.isGameStarted) return;

        // 空格键触发技能
        // if (Phaser.Input.Keyboard.JustDown(this.keys.space)) {
        //     this.activateSkill();
        // }

        // 更新游戏时间
        this.gameTime += this.game.loop.delta;
        this.timeText.setText('Survival time: ' + (this.gameTime / 1000).toFixed(3) + 's');

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
        const fenceConfig = this.fenceConfig;
        const width = this.scale.width;
        const height = this.scale.height;
        let x, y;
        do {
            x = Phaser.Math.Between(fenceConfig.x + fenceConfig.wallHeight + Math.round(width * 0.13), fenceConfig.x + fenceConfig.width - fenceConfig.wallHeight - Math.round(width * 0.13)); // 50/380
            y = Phaser.Math.Between(fenceConfig.y + fenceConfig.wallHeight + Math.round(height * 0.073), fenceConfig.y + fenceConfig.height - fenceConfig.wallHeight - Math.round(height * 0.073)); // 50/680
        } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < Math.max(width, height) * 0.294); // 200/680
        const ghostSize = Math.round(width * 0.066); // 25/380
        const ghost = this.ghosts.create(x, y, 'ghost');
        ghost.setBounce(0.2);
        ghost.setCollideWorldBounds(false);
        ghost.setDisplaySize(ghostSize, ghostSize);
    }

    createSkillButton() {
        const width = this.scale.width;
        const height = this.scale.height;
        if (this.skillButton) this.skillButton.destroy();
        if (this.skillButtonText) this.skillButtonText.destroy();
        if (this.skillButtonIcon) this.skillButtonIcon.destroy();
        const btnX = width * 0.842; // 320/380
        const btnY = height * 0.912; // 620/680
        const btnRadius = Math.round(width * 0.066); // 25/380
        this.skillButton = this.add.circle(btnX, btnY, btnRadius, 0x4e8cff, 1);
        this.skillButton.setInteractive();
        this.skillButton.setStrokeStyle(3, 0xffffff);
        this.skillButtonIcon = this.add.image(btnX, btnY, 'stealth');
        this.skillButtonIcon.setDisplaySize(Math.round(width * 0.084), Math.round(width * 0.084)); // 32/380
        this.skillButtonIcon.setDepth(1);
        this.skillButtonText = this.add.text(btnX, btnY, '', {
            fontSize: Math.round(width * 0.052) + 'px', // 20/380
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