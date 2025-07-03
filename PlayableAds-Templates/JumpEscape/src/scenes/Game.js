import { Player } from '../gameObjects/Player.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
  }

  create() {
    this.add.image(300, 400, 'background');

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

    // 创建玩家
    this.player = new Player(this, 300, 650);
    this.trackPlayer();

    // 玩家输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建静态平台组
    this.staticPlatforms = this.physics.add.staticGroup();
    this.staticPlatforms.create(300, 100, 'platform');
    this.staticPlatforms.create(300, 700, 'platform');
    // 碰撞检测
    this.physics.add.collider(this.player, this.staticPlatforms);

    // 创建收集目标 - 星星
    this.star = this.physics.add.image(300, 50, 'star');
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
        const x = Phaser.Math.Between(50, 750);
        const particle = this.bubbleEmitter.emitParticleAt(x, 795);
        if (particle) this.trackBubble(particle, x);
      }
    });
  }

  // 获取当前水面 Y 值（包含波动）
  getWaveY(x) {
    // In Phaser, (0,0) is at top-left, Y increases downward
    // So 800 - waterHeight means water rises from bottom (800) upward as waterHeight increases
    return 800 - this.waterHeight + Math.sin((x + this.waveOffset) * 0.05) * 5;
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

          this.time.delayedCall(1000, () => {
            this.scene.start('GameoverScene');
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

    this.time.delayedCall(1000, () => {
      this.scene.start('GamesuccessScene');
    })
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
    g.moveTo(0, 800); // Start at bottom-left (y=800 is bottom)
    for (let x = 0; x <= 600; x++) {
      const y = this.getWaveY(x);
      g.lineTo(x, y);
    }
    g.lineTo(600, 800); // End at bottom-right
    g.closePath();
    g.fillPath();
  }

  // 生成从右往左或从左往右移动的平台
  spawnPlatform() {
    // 只有当水面高度接近0时才生成平台
    if (this.waterHeight >= 700) return;

    // 随机选择平台类型
    const platformType = Phaser.Math.RND.pick(this.platformConfig.types);

    // 随机生成y坐标，范围为0到waterHeight
    const maxY = 800 - this.waterHeight - 100; // 水面当前高度（从底部算起）
    const y = Phaser.Math.Between(100, maxY); // 确保平台在水面上方

    // 从屏幕右侧或左侧生成平台
    const direction = Phaser.Math.RND.pick([-1, 1]);
    let platform;
    if (direction === -1) {
      platform = this.platforms.create(800, y, platformType);
    } else {
      platform = this.platforms.create(0, y, platformType);
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

    // 设置平台大小和碰撞边界
    platform.setDisplaySize(150, 22);
    platform.body.setSize(150, 22);

    // 当平台离开屏幕时销毁
    platform.checkWorldBounds = true;
    platform.outOfBoundsKill = true;
  }

  update() {
    this.waveOffset += 1;
    this.waterHeight += 0.3; // Increased the rate for more visible rising effect
    if (this.waterHeight >= 700) this.waterHeight = 700; // Limit to 800 to keep some playable area
    this.drawWater();

    // 更新平台生成间隔（随着水位上升，平台生成更频繁）
    const newInterval = Math.max(500, this.platformConfig.spawnInterval - this.waterHeight / 2);
    if (this.platformTimer.delay !== newInterval) {
      this.platformTimer.delay = newInterval;
    }

    // 玩家输入
    if (this.cursors.left.isDown) {
      this.player.moveLeft();
    }
    else if (this.cursors.right.isDown) {
      this.player.moveRight();
    }
    else {
      this.player.idle();
    }

    if (this.cursors.up.isDown) {
      this.player.jump();
    }
  }
}
