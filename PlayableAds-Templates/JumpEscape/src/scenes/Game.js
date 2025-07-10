import { Player } from '../gameObjects/Player.js';

export class Game extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  preload() {
  }

  create() {
    // 获取屏幕尺寸
    this.gameWidth = this.cameras.main.width;
    this.gameHeight = this.cameras.main.height;

    this.backgroundSound = this.sound.add('background', { volume: 1.0 });
    this.backgroundSound.play();

    this.gameOverSound = this.sound.add('game-over', { volume: 0.8 });
    this.gameSuccessSound = this.sound.add('game-success', { volume: 0.8 });

    // 背景图片居中显示
    this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'background');

    this.waterHeight = 0; // Start with 0 and increase over time
    this.waveOffset = 0;
    this.waterColor = 0x55ff77;

    // 水面图形
    this.waterGraphics = this.add.graphics();

    // 泡泡发射器
    this.bubbleEmitter = this.add.particles(0, 0, 'bubble', {
      x: 0, y: 0,
      lifespan: 15000,
      speedY: { min: -60, max: -100 },
      scale: { start: 0.1, end: 0.2 },
      alpha: { start: 1, end:  0.5},
      tint: 0x99ff99,
      emitting: false // 需要手动触发
    });

    // 毒气发射器（泡泡破裂时触发）
    this.gasEmitter = this.add.particles(0, 0, 'gas', {
      lifespan: 800,
      speedY: { min: -30, max: -50 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.1, end: 0.3 },
      alpha: { start: 0.5, end: 0 },
      tint: 0x88ff88,
      quantity: 5,
      emitting: false
    });

    // 创建玩家 - 水平居中，垂直位置约为屏幕高度的80%
    this.player = new Player(this, this.gameWidth / 2, this.gameHeight * 0.8);
    this.trackPlayer();

    // 玩家输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 移动端控制状态
    this.mobileControls = {
      leftPressed: false,
      rightPressed: false,
      jumpPressed: false
    };

    // 创建移动端虚拟控制按钮
    this.createMobileControls();

    // 创建静态平台组
    this.staticPlatforms = this.physics.add.staticGroup();
    // 顶部平台 - 水平居中，垂直位置约为屏幕高度的12.5%
    this.staticPlatforms.create(this.gameWidth / 2, this.gameHeight * 0.125, 'platform');
    // 底部平台 - 水平居中，垂直位置约为屏幕高度的87.5%
    this.staticPlatforms.create(this.gameWidth / 2, this.gameHeight * 0.875, 'platform');
    // 碰撞检测
    this.physics.add.collider(this.player, this.staticPlatforms);

    // 创建收集目标 - 星星，水平居中，垂直位置约为屏幕高度的6.25%
    this.star = this.physics.add.image(this.gameWidth / 2, this.gameHeight * 0.0625, 'star');
    this.physics.add.collider(this.staticPlatforms, this.star);
    this.physics.add.overlap(this.player, this.star, this.collectStar, null, this);

    // 创建动态平台组
    this.platforms = this.physics.add.group();
    // 平台生成配置
    this.platformConfig = {
      minSpeed: 100,  // 最小移动速度
      maxSpeed: 200,  // 最大移动速度
      spawnInterval: 800,  // 生成间隔（毫秒）
      types: ['platform', 'platform-rotten']  // 平台类型
    };
    // 定期生成平台
    this.platformTimer = this.time.addEvent({
      delay: this.platformConfig.spawnInterval,
      loop: true,
      callback: this.spawnPlatform,
      callbackScope: this
    });
    // 碰撞检测
    this.physics.add.collider(this.player, this.platforms);

    // 定期生成泡泡
    this.time.addEvent({
      delay: 300,
      loop: true,
      callback: () => {
        // 泡泡在屏幕宽度范围内随机生成，留出左右边距
        const x = Phaser.Math.Between(this.gameWidth * 0.08, this.gameWidth * 0.92);
        const particle = this.bubbleEmitter.emitParticleAt(x, this.gameHeight - 5);
        if (particle) this.trackBubble(particle, x);
      }
    });
  }

  // 创建移动端虚拟控制按钮
  createMobileControls() {
    const buttonSize = Math.min(this.gameWidth, this.gameHeight) * 0.1;
    const buttonAlpha = 0.6;
    const buttonColor = 0x333333;
    const buttonPressedColor = 0x666666;

    // 左移按钮
    this.leftButton = this.add.circle(buttonSize * 1.2, this.gameHeight - buttonSize * 1.2, buttonSize, buttonColor, buttonAlpha);
    this.leftButton.setInteractive();
    this.leftButton.setScrollFactor(0); // 固定在屏幕上
    this.leftButton.setDepth(1000);

    // 左箭头图标
    this.leftArrow = this.add.graphics();
    this.leftArrow.fillStyle(0xffffff);
    this.leftArrow.fillTriangle(
      this.leftButton.x - buttonSize * 0.3, this.leftButton.y,
      this.leftButton.x + buttonSize * 0.3, this.leftButton.y - buttonSize * 0.3,
      this.leftButton.x + buttonSize * 0.3, this.leftButton.y + buttonSize * 0.3
    );
    this.leftArrow.setScrollFactor(0);
    this.leftArrow.setDepth(1001);

    // 右移按钮
    this.rightButton = this.add.circle(buttonSize * 3, this.gameHeight - buttonSize * 1.2, buttonSize, buttonColor, buttonAlpha);
    this.rightButton.setInteractive();
    this.rightButton.setScrollFactor(0);
    this.rightButton.setDepth(1000);

    // 右箭头图标
    this.rightArrow = this.add.graphics();
    this.rightArrow.fillStyle(0xffffff);
    this.rightArrow.fillTriangle(
      this.rightButton.x + buttonSize * 0.3, this.rightButton.y,
      this.rightButton.x - buttonSize * 0.3, this.rightButton.y - buttonSize * 0.3,
      this.rightButton.x - buttonSize * 0.3, this.rightButton.y + buttonSize * 0.3
    );
    this.rightArrow.setScrollFactor(0);
    this.rightArrow.setDepth(1001);

    // 跳跃按钮
    this.jumpButton = this.add.circle(this.gameWidth - buttonSize * 1.2, this.gameHeight - buttonSize * 1.2, buttonSize, buttonColor, buttonAlpha);
    this.jumpButton.setInteractive();
    this.jumpButton.setScrollFactor(0);
    this.jumpButton.setDepth(1000);

    // 跳跃图标
    this.jumpArrow = this.add.graphics();
    this.jumpArrow.fillStyle(0xffffff);
    this.jumpArrow.fillTriangle(
      this.jumpButton.x, this.jumpButton.y - buttonSize * 0.3,
      this.jumpButton.x - buttonSize * 0.3, this.jumpButton.y + buttonSize * 0.3,
      this.jumpButton.x + buttonSize * 0.3, this.jumpButton.y + buttonSize * 0.3
    );
    this.jumpArrow.setScrollFactor(0);
    this.jumpArrow.setDepth(1001);

    // 左移按钮事件
    this.leftButton.on('pointerdown', () => {
      this.mobileControls.leftPressed = true;
      this.leftButton.setFillStyle(buttonPressedColor, buttonAlpha);
    });

    this.leftButton.on('pointerup', () => {
      this.mobileControls.leftPressed = false;
      this.leftButton.setFillStyle(buttonColor, buttonAlpha);
    });

    this.leftButton.on('pointerout', () => {
      this.mobileControls.leftPressed = false;
      this.leftButton.setFillStyle(buttonColor, buttonAlpha);
    });

    // 右移按钮事件
    this.rightButton.on('pointerdown', () => {
      this.mobileControls.rightPressed = true;
      this.rightButton.setFillStyle(buttonPressedColor, buttonAlpha);
    });

    this.rightButton.on('pointerup', () => {
      this.mobileControls.rightPressed = false;
      this.rightButton.setFillStyle(buttonColor, buttonAlpha);
    });

    this.rightButton.on('pointerout', () => {
      this.mobileControls.rightPressed = false;
      this.rightButton.setFillStyle(buttonColor, buttonAlpha);
    });

    // 跳跃按钮事件
    this.jumpButton.on('pointerdown', () => {
      this.mobileControls.jumpPressed = true;
      this.jumpButton.setFillStyle(buttonPressedColor, buttonAlpha);
    });

    this.jumpButton.on('pointerup', () => {
      this.mobileControls.jumpPressed = false;
      this.jumpButton.setFillStyle(buttonColor, buttonAlpha);
    });

    this.jumpButton.on('pointerout', () => {
      this.mobileControls.jumpPressed = false;
      this.jumpButton.setFillStyle(buttonColor, buttonAlpha);
    });
  }

  // 获取当前水面 Y 值（包含波动）
  getWaveY(x) {
    // In Phaser, (0,0) is at top-left, Y increases downward
    // So gameHeight - waterHeight means water rises from bottom upward as waterHeight increases
    return this.gameHeight - this.waterHeight + Math.sin((x + this.waveOffset) * 0.05) * 5;
  }

  trackPlayer() {
    const timer = this.time.addEvent({
      delay: 300,
      loop: true,
      callback: () => {
        const waveY = this.getWaveY(this.player.x);

        // 检测玩家是否掉入水中
        if (this.player.y >= waveY) {
          this.physics.pause();
          this.player.setTint(0xff0000);
          this.player.anims.play('turn');

          this.time.delayedCall(100, () => {
            this.gameOver();
          })
        }
      }
    });
  }

  collectStar(player, star) {
    star.destroy();
    this.physics.pause();
    this.player.setTint(0x00ff00);
    this.player.anims.play('turn');

    this.time.delayedCall(100, () => {
      this.gameSuccess();
    })
  }

  gameOver() {
    this.gameOverSound.play();
    this.backgroundSound.stop();
    this.scene.start('GameOver');
  }

  gameSuccess() {
    this.gameSuccessSound.play();
    this.backgroundSound.stop();
    this.scene.start('GameSuccess');
  }

  // 跟踪泡泡是否碰到水面
  trackBubble(particle, x) {
    // 创建一个定时器来跟踪泡泡
    const timer = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        const waveY = this.getWaveY(x);

        // 检查泡泡是否到达或穿过水面
        if (particle.y <= waveY) {
          // 泡泡破裂
          particle.life = 0;
          particle.alpha = 0;

          // 在水面位置释放毒气
          this.gasEmitter.emitParticleAt(x, waveY - 20);

          // 清理定时器
          timer.remove();
        }

        if (!particle || particle.life <= 0) {
          timer.remove(); // 清理定时器
          return;
        }
      }
    });
  }

  drawWater() {
    const g = this.waterGraphics;
    g.clear();
    g.fillStyle(this.waterColor, 0.8);

    // 绘制波纹水面
    g.beginPath();
    g.moveTo(0, this.gameHeight); // Start at bottom-left
    for (let x = 0; x <= this.gameWidth; x++) {
      const y = this.getWaveY(x);
      g.lineTo(x, y);
    }
    g.lineTo(this.gameWidth, this.gameHeight); // End at bottom-right
    g.closePath();
    g.fillPath();
  }

  // 生成从右往左或从左往右移动的平台
  spawnPlatform() {
    // 只有当水面高度接近游戏区域底部时才停止生成平台
    const maxWaterHeight = this.gameHeight * 0.875; // 最大水位高度为屏幕高度的87.5%
    if (this.waterHeight >= maxWaterHeight) return;

    // 随机选择平台类型
    const platformType = Phaser.Math.RND.pick(this.platformConfig.types);

    // 随机生成y坐标，范围为屏幕高度的12.5%到当前水面高度
    const maxY = this.gameHeight - this.waterHeight - 100; // 水面当前高度（从底部算起）
    const minY = this.gameHeight * 0.125; // 最小Y坐标为屏幕高度的12.5%
    const y = Phaser.Math.Between(minY, maxY); // 确保平台在水面上方

    // 从屏幕右侧或左侧生成平台
    const direction = Phaser.Math.RND.pick([-1, 1]);
    let platform;
    if (direction === -1) {
      platform = this.platforms.create(this.gameWidth + 50, y, platformType);
    } else {
      platform = this.platforms.create(-50, y, platformType);
    }

    // 设置平台物理属性
    platform.setImmovable(true);
    platform.setVelocityX(direction * Phaser.Math.Between(
      this.platformConfig.minSpeed,
      this.platformConfig.maxSpeed
    ));

    // 关键：禁用重力影响，防止平台下落
    platform.body.allowGravity = false;
    platform.setVelocityY(0); // 确保没有垂直方向的速度

    // 设置平台大小和碰撞边界 - 基于屏幕宽度调整
    const platformWidth = this.gameWidth * 0.25; // 平台宽度为屏幕宽度的25%
    const platformHeight = 22;
    platform.setDisplaySize(platformWidth, platformHeight);
    platform.body.setSize(platformWidth, platformHeight);

    // 当平台离开屏幕时销毁
    platform.checkWorldBounds = true;
    platform.outOfBoundsKill = true;
  }

  update() {
    this.waveOffset += 1;
    this.waterHeight += 0.3; // Increased the rate for more visible rising effect
    const maxWaterHeight = this.gameHeight * 0.875; // 最大水位高度为屏幕高度的87.5%
    if (this.waterHeight >= maxWaterHeight) this.waterHeight = maxWaterHeight; // 限制最大水位
    this.drawWater();

    // 清理离开屏幕的平台
    this.cleanupOffscreenPlatforms();

    // 更新平台生成间隔（随着水位上升，平台生成更频繁）
    const newInterval = Math.max(500, this.platformConfig.spawnInterval - this.waterHeight / 2);
    if (this.platformTimer.delay !== newInterval) {
      this.platformTimer.delay = newInterval;
    }

    // 玩家输入 - 支持键盘和触摸控制
    const isLeftPressed = this.cursors.left.isDown || this.mobileControls.leftPressed;
    const isRightPressed = this.cursors.right.isDown || this.mobileControls.rightPressed;
    const isJumpPressed = this.cursors.up.isDown || this.mobileControls.jumpPressed;

    if (isLeftPressed) {
      this.player.moveLeft();
    }
    else if (isRightPressed) {
      this.player.moveRight();
    }
    else {
      this.player.idle();
    }

    if (isJumpPressed) {
      this.player.jump();
    }
  }

  // 清理离开屏幕的平台
  cleanupOffscreenPlatforms() {
    this.platforms.children.entries.forEach(platform => {
      // 检查平台是否完全离开屏幕边界
      if (platform.x < -100 || platform.x > this.gameWidth + 100) {
        platform.destroy();
      }
    });
  }
}
