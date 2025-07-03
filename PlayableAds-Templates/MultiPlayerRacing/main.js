// ==== 配置区 ====
const CHARACTERS = [
  { id: 'c1', name: '阿利斯塔', img: 'assets/characters/1.png', width: 48, height: 48 },
  { id: 'c2', name: '格雷福斯', img: 'assets/characters/2.png', width: 48, height: 48 },
  { id: 'c3', name: '波比', img: 'assets/characters/11.png', width: 48, height: 48 },
  { id: 'c4', name: '维迦', img: 'assets/characters/12.png', width: 48, height: 48 }
];
const NPCS = [
  { id: 'n1', name: '嘉文四世', img: 'assets/npcs/3.png', effect: 'positive', speedBoost: 1.2, x: window.innerWidth * 0.2, y: window.innerHeight * 0.6 },
  { id: 'n2', name: '安妮', img: 'assets/npcs/4.png', effect: 'negative', speedBoost: 0.7, x: window.innerWidth * 0.4, y: window.innerHeight * 0.5 },
  { id: 'n3', name: '厄斐琉斯', img: 'assets/npcs/5.png', effect: 'positive', speedBoost: 1.2, x: window.innerWidth * 0.6, y: window.innerHeight * 0.4 },
  { id: 'n4', name: '佛耶戈', img: 'assets/npcs/6.png', effect: 'negative', speedBoost: 0.7, x: window.innerWidth * 0.8, y: window.innerHeight * 0.3 },
  { id: 'n5', name: '吉格斯', img: 'assets/npcs/13.png', effect: 'positive', speedBoost: 1.2, x: window.innerWidth * 0.3, y: window.innerHeight * 0.7 },
  { id: 'n6', name: '可酷伯', img: 'assets/npcs/14.png', effect: 'positive', speedBoost: 1.2, x: window.innerWidth * 0.7, y: window.innerHeight * 0.2 },
  // 添加特殊NPC - 提供更高的加速效果
  { id: 'n7', name: '金铲铲', img: 'assets/npcs/s1.png', effect: 'positive', speedBoost: 1.5, x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, isSpecial: true },
  { id: 'n8', name: '金铲铲', img: 'assets/npcs/s2.png', effect: 'positive', speedBoost: 1.5, x: window.innerWidth * 0.4, y: window.innerHeight * 0.4, isSpecial: true }
];
const OBSTACLES = [
  { id: 'o1', img: 'assets/obstacles/tree.png', width: 78, height: 100 },
  { id: 'o2', img: 'assets/obstacles/stone.png', width: 100, height: 100 },
  { id: 'o3', img: 'assets/obstacles/cave.png', width: 78, height: 100 },
  { id: 'o4', img: 'assets/obstacles/house.png', width: 78, height: 100 },
  { id: 'o5', img: 'assets/obstacles/signpost.png', width: 78, height: 100 },
  { id: 'o6', img: 'assets/obstacles/tree2.png', width: 78, height: 100 },
  { id: 'o10', img: 'assets/obstacles/tree3.png', width: 78, height: 100 },
];
// 羁绊关系
const BONDS = {
  c1: { n1: 'positive', n2: 'positive', n3: 'positive', n4: 'positive', n5: 'negative', n6: 'negative', n7: 'positive', n8: 'positive' },
  c2: { n1: 'positive', n2: 'positive', n3: 'positive', n4: 'positive', n5: 'negative', n6: 'negative', n7: 'positive', n8: 'positive' },
  c3: { n1: 'negative', n2: 'negative', n3: 'negative', n4: 'negative', n5: 'positive', n6: 'positive', n7: 'positive', n8: 'positive' },
  c4: { n1: 'negative', n2: 'negative', n3: 'negative', n4: 'negative', n5: 'positive', n6: 'positive', n7: 'positive', n8: 'positive' }
};

// ==== 调试变量 ====
let DEBUG_SHOW_HITBOX = false;

// ==== 常量区 ====
const TRACK_LENGTH = 10000;  // 赛道总长度
const CHARACTER_SIZE = 48;
const NPC_SIZE = 40;
const BASE_SPEED = 4;
const ACCELERATE = 1.2;
const DECELERATE = 0.7;
const EFFECT_DURATION = 120;
const AI_DIFFICULTY = [1, 2, 3, 4];
const NPC_COUNT_PER_PLAYER = 5;
const PLAYER_INDEX = 0;
const COUNTDOWN_START = 3;
const BACKGROUD_IMAGE = 'assets/background4.png';
const BACKGROUND_HEIGHT = Math.floor(window.innerHeight * 0.5625); // 16:9比例
const BACKGROUND_REPEAT = Math.ceil(TRACK_LENGTH / BACKGROUND_HEIGHT); // 计算背景图片的合适高度（基于屏幕宽度的比例）

// ==== 音频元素 ====
let index_bgm = new Audio('assets/index_bgm.mp3');
let play_bgm = new Audio('assets/play_bgm.mp3');
index_bgm.loop = true;
play_bgm.loop = true;

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const resultModal = document.getElementById('result-modal');
const finalRanking = document.getElementById('final-ranking');
const closeModalX = document.getElementById('close-modal-x');

// ==== 变量区 ====
// 创建一个容器来包裹背景和游戏元素，创建两个背景元素用于无限循环
let gameContainer = null;
let background1 = null;
let background2 = null;
let characters = [];
let obstacles = [];
let npcs = [];
let finished = [];
let running = false;
let animationId = null;
let gameStarted = false;
let startTime = null;
let countdownStarted = false;
let currentCountdown = COUNTDOWN_START;
let lastCountdownUpdate = 0;
let playerMovingLeft = false, playerMovingRight = false, playerMovingBack = false;

// 页面加载时，初始只显示标题和按钮，赛道隐藏
track.style.display = 'none';
startBtn.style.display = 'block';
document.querySelector('.race-container').classList.remove('home'); // 首页不加蒙版

// ==== 初始化游戏界面 ====
function initGameContainer() {
  // 获取赛道元素
  track = document.getElementById('track');
  track.innerHTML = '';

  // 创建游戏容器
  if (!gameContainer) {
    gameContainer = document.createElement('div');
  }
  gameContainer.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  `;
  track.appendChild(gameContainer);

  // 创建背景元素
  if (!background1) {
    background1 = document.createElement('div');
  }
  if (!background2) {
    background2 = document.createElement('div');
  }
  setupBackground(background1);
  setupBackground(background2);

  // 初始化背景位置：背景1在视野内，背景2在其下方
  background1.style.transform = 'translateY(0)';
  background2.style.transform = `translateY(${TRACK_LENGTH}px)`;
  gameContainer.appendChild(background1);
  gameContainer.appendChild(background2);
}

// ==== 游戏重置 ====
function resetGame() {
  // 预加载背景图
  preloadBackground().then(() => {
  }).catch(err => {
    console.error('Error loading background in resetGame:', err);
  });

  // 初始化游戏容器和背景
  initGameContainer();

  // 起跑线
  const startLine = document.createElement('div');
  startLine.className = 'start-line';
  gameContainer.appendChild(startLine);
  // 终点线
  const finishLine = document.createElement('div');
  finishLine.className = 'finish-line';
  // 终点旗帜
  const flag = document.createElement('div');
  flag.className = 'finish-flag';
  finishLine.appendChild(flag);
  // 终点提示文字
  const finishText = document.createElement('div');
  finishText.className = 'finish-text';
  finishText.textContent = '终点';
  finishText.style.cssText = `
    position: absolute;
    left: 50%;
    transform: translate(-50%, -220%);
    color: #000;
    font-weight: bold;
    font-size: 28px;
    text-shadow: 2px 2px 4px rgba(255,255,255,0.8);
    z-index: 25;
  `;
  finishLine.appendChild(finishText);
  gameContainer.appendChild(finishLine);

  // 角色
  characters = CHARACTERS.map((c, i) => ({
    ...c,
    isAI: i !== PLAYER_INDEX,
    x: window.innerWidth * 0.2 + (window.innerWidth * 0.6 / (CHARACTERS.length - 1)) * i,
    y: window.innerHeight * 0.8 + 250,
    speed: BASE_SPEED,
    effect: null,
    effectTimer: 0,
    finished: false,
    finishTime: null,
    startTime: null,
    difficulty: 1,
    aiDodgeDir: 0,
    tip: '',
    tipTimer: 0,
    el: null
  }));

  characters.forEach(c => {
    c.el = createDiv('character', null, CHARACTER_SIZE, CHARACTER_SIZE, c.img);
    c.el.innerHTML += `<div class="tip"></div><div class="name">${c.name}(${c.isAI ? 'AI' : '玩家'})</div>`;
    gameContainer.appendChild(c.el);
  });

  // 障碍物
  obstacles = [];
  const LANE_COUNT = 6;
  const OBSTACLE_COUNT = 3;
  const SEGMENT_HEIGHT = 300;
  const laneWidth = window.innerWidth / LANE_COUNT;
  const segmentCount = Math.floor(TRACK_LENGTH / SEGMENT_HEIGHT);

  for (let seg = 0; seg < segmentCount; seg++) {
    let lanes = Array.from({ length: LANE_COUNT }, (_, i) => i);
    let blockCount = Math.floor(Math.random() * OBSTACLE_COUNT);
    let blockedLanes = [];
    while (blockedLanes.length < blockCount) {
      let idx = Math.floor(Math.random() * lanes.length);
      blockedLanes.push(lanes.splice(idx, 1)[0]);
    }
    blockedLanes.forEach(laneIdx => {
      const oType = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
      const ox = laneIdx * laneWidth + laneWidth / 2;
      const oy = window.innerHeight - 200 - seg * SEGMENT_HEIGHT;
      const obs = {
        ...oType,
        x: ox,
        y: oy,
        el: createDiv('obstacle', null, oType.width, oType.height, oType.img)
      };
      obstacles.push(obs);
      gameContainer.appendChild(obs.el);
    });
  }

  // NPC
  npcs = [];
  for (let i = 0; i < CHARACTERS.length * NPC_COUNT_PER_PLAYER; i++) {
    const npcType = NPCS[Math.floor(Math.random() * NPCS.length)];
    let nx, ny, tryCount = 0, overlap;
    do {
      nx = Math.random() * (window.innerWidth - NPC_SIZE);
      ny = window.innerHeight - 300 - Math.random() * (TRACK_LENGTH - 400);
      overlap = npcs.some(n =>
        Math.abs(nx - n.x) < NPC_SIZE &&
        Math.abs(ny - n.y) < NPC_SIZE
      ) || obstacles.some(o =>
        Math.abs(nx - o.x) < (NPC_SIZE + o.width) / 2 &&
        Math.abs(ny - o.y) < (NPC_SIZE + o.height) / 2
      );
      tryCount++;
    } while (overlap && tryCount < 60);

    if (!overlap) {
      const playerBond = BONDS[characters[PLAYER_INDEX].id] && BONDS[characters[PLAYER_INDEX].id][npcType.id];
      const npc = {
        ...npcType,
        x: nx,
        y: ny,
        touched: false,
        el: createDiv('npc' + (playerBond ? ' ' + playerBond + (npcType.isSpecial ? ' special' : '') : ''), null, NPC_SIZE, NPC_SIZE, npcType.img)
      };
      npcs.push(npc);
      gameContainer.appendChild(npc.el);

      if (!npc.el.querySelector('.name')) {
        const nameDiv = document.createElement('div');
        nameDiv.className = 'name';
        nameDiv.textContent = npc.name || npc.npcId || '';
        npc.el.appendChild(nameDiv);

        const playerBond = BONDS[characters[PLAYER_INDEX].id] && BONDS[characters[PLAYER_INDEX].id][npc.id];
        if (playerBond) {
          const tipDiv = document.createElement('div');
          tipDiv.className = `npc-tip ${playerBond}${npc.isSpecial ? ' special' : ''}`;
          tipDiv.textContent = playerBond === 'positive' 
            ? (npc.isSpecial ? '✨ 超级加速 ✨' : '✨ 加速助力 ✨') 
            : '⚠️ 减速陷阱 ⚠️';
          npc.el.appendChild(tipDiv);
        }
      }
    }
  }

  finished = [];
  running = false;
  gameStarted = false;
  updateDOM();
}

// ==== 绘制与逻辑 ====
function updateDOM() {
  // 纵向滚动：玩家始终在屏幕中间
  const player = characters[PLAYER_INDEX];
  const centerY = player.y;

  // 更新背景位置，实现真正的无限循环
  const scrollY = -centerY + window.innerHeight / 2;

  // 计算背景1的位置
  let bg1Y = scrollY % (TRACK_LENGTH * 2);
  let bg2Y = bg1Y + TRACK_LENGTH;

  // 确保背景1始终在视野范围内或其上方
  if (bg1Y > 0) {
    bg1Y -= TRACK_LENGTH * 2;
    bg2Y -= TRACK_LENGTH * 2;
  }

  // 如果背景2移出视野太远，将其移到背景1上方
  if (bg2Y < -TRACK_LENGTH * 1.5) {
    bg2Y += TRACK_LENGTH * 2;
  }
  // 如果背景1移出视野太远，将其移到背景2上方
  if (bg1Y < -TRACK_LENGTH * 1.5) {
    bg1Y += TRACK_LENGTH * 2;
  }

  background1.style.transform = `translateY(${bg1Y}px)`;
  background2.style.transform = `translateY(${bg2Y}px)`;

  // 角色
  characters.forEach((c, idx) => {
    const sx = c.x;
    const sy = c.y - centerY + window.innerHeight / 2;

    // 更新位置
    c.el.style.left = (sx - CHARACTER_SIZE / 2) + 'px';
    c.el.style.top = (sy - CHARACTER_SIZE / 2) + 'px';

    // tip（最上方）
    const tipDiv = c.el.querySelector('.tip');
    tipDiv.textContent = c.tip && c.tipTimer > 0 ? c.tip : '';
    tipDiv.className = 'tip' + (c.tip === '减速！' ? ' negative' : '');
    tipDiv.style.position = 'absolute';
    tipDiv.style.left = '50%';
    tipDiv.style.transform = 'translateX(-50%)';
    tipDiv.style.bottom = 'calc(100% + 5px)'; // 上方
    tipDiv.style.paddingLeft = '15px';
    
    // 显示碰撞盒
    if (DEBUG_SHOW_HITBOX) {
      c.el.style.border = idx === PLAYER_INDEX ? '2px solid #ff00c8' : '2px solid #FFD700';

      // 添加调试信息div
      let debugDiv = c.el.querySelector('.debug-info');
      if (!debugDiv) {
        debugDiv = document.createElement('div');
        debugDiv.className = 'debug-info';
        c.el.appendChild(debugDiv);
      }
      debugDiv.style.cssText = `
        position: absolute;
        left: 0;
        top: -40px;
        font-size: 12px;
        color: ${idx === PLAYER_INDEX ? '#ff00c8' : '#00ff00'};
        text-shadow: 0 0 2px #000;
        white-space: nowrap;
        pointer-events: none;
      `;
      debugDiv.textContent = `x:${Math.round(sx)}, y:${Math.round(c.y)}, w:${CHARACTER_SIZE}, h:${CHARACTER_SIZE}`;
    } else {
      c.el.style.border = '';
      const debugDiv = c.el.querySelector('.debug-info');
      if (debugDiv) {
        debugDiv.remove();
      }
    }
    // 透明度
    c.el.style.opacity = c.finished ? 0.5 : 1;
    // 名称下方加"玩家"或"AI"字样
    const nameDiv = c.el.querySelector('.name');
    if (nameDiv) {
      nameDiv.style.color = (!c.isAI) ? '#ffd700' : 'white';
      nameDiv.style.fontWeight = (!c.isAI) ? 'bold' : 'normal';
    }
  });
  // 障碍物
  obstacles.forEach(o => {
    const sy = o.y - centerY + window.innerHeight / 2;
    o.el.style.left = (o.x - o.width / 2) + 'px';
    o.el.style.top = (sy - o.height / 2) + 'px';
    // 显示碰撞盒
    if (DEBUG_SHOW_HITBOX) {
      o.el.style.border = '2px solid #00c8ff';

      // 添加调试信息div
      let debugDiv = o.el.querySelector('.debug-info');
      if (!debugDiv) {
        debugDiv = document.createElement('div');
        debugDiv.className = 'debug-info';
        o.el.appendChild(debugDiv);
      }
      debugDiv.style.cssText = `
        position: absolute;
        left: 0;
        top: -40px;
        font-size: 12px;
        color: #00c8ff;
        text-shadow: 0 0 2px #000;
        white-space: nowrap;
        pointer-events: none;
      `;
      debugDiv.textContent = `x:${Math.round(o.x)}, y:${Math.round(o.y)}, w:${o.width}, h:${o.height}`;
    } else {
      o.el.style.border = '';
      const debugDiv = o.el.querySelector('.debug-info');
      if (debugDiv) {
        debugDiv.remove();
      }
    }
  });
  // NPC
  npcs.forEach(n => {
    const sy = n.y - centerY + window.innerHeight / 2;
    n.el.style.left = (n.x - NPC_SIZE / 2) + 'px';
    n.el.style.top = (sy - NPC_SIZE / 2) + 'px';
    n.el.style.display = n.touched ? 'none' : 'block';
    const nameDiv = n.el.querySelector('.name');
    if (nameDiv) {
      nameDiv.textContent = n.name || n.npcId || '';
      nameDiv.style.textAlign = 'center';
      nameDiv.style.left = '50%';
      nameDiv.style.transform = 'translateX(-50%)';
      nameDiv.style.top = '100%';
      nameDiv.style.position = 'absolute';
      nameDiv.style.fontSize = '14px';
      nameDiv.style.color = '#333';
      nameDiv.style.fontWeight = 'bold';
      nameDiv.style.textShadow = '0 2px 8px #fff';
      nameDiv.style.whiteSpace = 'nowrap';
    }
  });
  // 终点线位置
  const finishLine = track.querySelector('.finish-line');
  if (finishLine) {
    const endY = window.innerHeight - CHARACTER_SIZE / 2 - TRACK_LENGTH;
    const finishLineScreenY = endY - player.y + window.innerHeight / 2;
    finishLine.style.top = finishLineScreenY + 'px';
  }
  // 起跑线位置
  const startLineEl = track.querySelector('.start-line');
  if (startLineEl) {
    const startY = window.innerHeight - CHARACTER_SIZE / 2;
    const startLineScreenY = startY - player.y + window.innerHeight / 2;
    startLineEl.style.top = startLineScreenY + 'px';
  }
}

// ==== 碰撞检测 ====
function isCollide(a, b) {
  const r1 = { 
    left: a.x - a.width / 2, 
    right: a.x + a.width / 2, 
    top: a.y - a.height / 2, 
    bottom: a.y + a.height / 2 
  };
  const r2 = { 
    left: b.x - b.width / 2, 
    right: b.x + b.width / 2, 
    top: b.y - b.height / 2, 
    bottom: b.y + b.height / 2 
  };
  return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
}

// ==== 主循环 ====
function gameLoop() {
  // 游戏未开始时，保持所有角色静止
  if (!gameStarted) {
    animationId = requestAnimationFrame(gameLoop);
    return;
  }

  // 标记所有角色是否都已完成比赛
  let allFinished = true;
  // 计算终点线的纵坐标
  const endY = window.innerHeight - CHARACTER_SIZE / 2 - TRACK_LENGTH;
  // === 玩家角色逻辑 ===
  let player = characters[PLAYER_INDEX];
  if (!player.finished) {
    allFinished = false;
    // 检查玩家前进方向是否会撞到障碍物
    let hitObstacleY = false;
    obstacles.forEach(o => {
      let nextY = player.y - Math.max(0.5, player.speed);
      if (isCollide(
        { ...player, y: nextY },
        { ...o, width: o.width, height: o.height }
      )) hitObstacleY = true;
    });
    // 检查玩家后退方向是否会撞到障碍物
    let canMoveBack = true;
    obstacles.forEach(o => {
      let backY = player.y + Math.max(0.5, player.speed);
      if (isCollide(
        { ...player, y: backY },
        { ...o, width: o.width, height: o.height }
      )) canMoveBack = false;
    });
    // 检查玩家左右移动时是否会撞到障碍物（只在y轴重叠时阻止）
    let canMoveLeft = true, canMoveRight = true;
    obstacles.forEach(o => {
      // 预测左移
      const predictedLeft = {
        x: player.x - 6,
        y: player.y,
        width: CHARACTER_SIZE,
        height: CHARACTER_SIZE
      };
      
      // 预测右移
      const predictedRight = {
        x: player.x + 6,
        y: player.y,
        width: CHARACTER_SIZE,
        height: CHARACTER_SIZE
      };

      // 只有当玩家与障碍物在同一水平线上时才检查左右移动的碰撞
      const verticalOverlap = Math.abs(player.y - o.y) < (CHARACTER_SIZE + o.height) / 2;
      
      if (verticalOverlap) {
        if (isCollide(predictedLeft, o)) {
          canMoveLeft = false;
        }
        if (isCollide(predictedRight, o)) {
          canMoveRight = false;
        }
      }
    });
    // 根据玩家输入移动角色
    if (playerMovingLeft && canMoveLeft && player.x > CHARACTER_SIZE/2) {
      player.x -= 6;
    }
    if (playerMovingRight && canMoveRight && player.x < window.innerWidth - CHARACTER_SIZE/2) {
      player.x += 6;
    }
    let speed = player.speed;
    if (player.effect === 'positive' && player.effectTimer > 0) {
      speed *= player.speedBoost || ACCELERATE;  // 使用speedBoost，如果没有则使用默认值
    }
    if (player.effect === 'negative' && player.effectTimer > 0) {
      speed *= player.speedBoost || DECELERATE;  // 使用speedBoost，如果没有则使用默认值
    }
    let actualSpeed = speed;

    if (playerMovingBack && canMoveBack) {
      player.y += actualSpeed;
    } else if (!hitObstacleY) {
      player.y -= actualSpeed;
    }
    // 边界限制
    player.x = Math.max(CHARACTER_SIZE / 2, Math.min(window.innerWidth - CHARACTER_SIZE / 2, player.x));
    player.y = Math.min(window.innerHeight - CHARACTER_SIZE / 2, player.y);
    // 检查玩家是否碰到NPC
    npcs.forEach(n => {
      if (!n.touched && isCollide(player, { ...n, width: NPC_SIZE, height: NPC_SIZE })) {
        n.touched = true;
        const bond = BONDS[player.id] && BONDS[player.id][n.id];
        if (bond === 'positive') {
          player.effect = 'positive';
          player.effectTimer = EFFECT_DURATION;
          player.speedBoost = n.speedBoost || ACCELERATE;
          player.tip = n.isSpecial ? '超级加速！' : '加速！';
          player.tipTimer = 60;
        } else if (bond === 'negative') {
          player.effect = 'negative';
          player.effectTimer = EFFECT_DURATION;
          player.speedBoost = n.speedBoost || DECELERATE;
          player.tip = '减速！';
          player.tipTimer = 60;
        }
      }
    });
    if (player.tipTimer > 0) player.tipTimer--;
    if (player.effectTimer > 0) player.effectTimer--;
    if (player.effectTimer === 0) player.effect = null;
    // 检查玩家是否到达终点
    if (player.y <= endY && !player.finished) {
      player.finished = true;
      player.finishTime = Date.now();
      finished.push(player);
      showResult();
    }
  }
  // === AI（NPC）角色逻辑 ===
  for (let i = 1; i < characters.length; i++) {
    let c = characters[i];
    if (c.finished) continue;
    allFinished = false;

    // 1. 检查附近的NPC，寻找最近的加速道具
    let nearestPositiveNPC = null;
    let minDistance = Infinity;
    npcs.forEach(n => {
      if (!n.touched) {
        const bond = BONDS[c.id] && BONDS[c.id][n.id];
        if (bond === 'positive') {
          const dx = n.x - c.x;
          const dy = n.y - c.y;
          // 只考虑前方200px范围内的NPC
          if (dy < 0 && dy > -200) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
              minDistance = distance;
              nearestPositiveNPC = n;
            }
          }
        }
      }
    });

    // 2. 检查AI前进方向是否会撞到障碍物
    let hitObstacleY = false;
    // 3. 检查AI前方lookAhead距离内是否有障碍物（提前预判）
    let willHitObstacle = false;
    let lookAhead = 60; // 预判距离
    let moveStep = 6;   // AI每步移动距离
    let obstacle = null;
    obstacles.forEach(o => {
      let nextY = c.y - Math.max(0.5, c.speed);
      // 1. 直接前进会撞到障碍物
      if (isCollide(
        { ...c, y: nextY },
        { ...o, width: o.width, height: o.height }
      )) {
        hitObstacleY = true;
        obstacle = o;
      }
      // 2. 前方lookAhead范围内有障碍物
      if (
        Math.abs(c.x - o.x) < (c.width + o.width) / 2 &&
        c.y - o.y > 0 && c.y - o.y < lookAhead
      ) {
        willHitObstacle = true;
        obstacle = o;
      }
    });

    // === AI移动决策逻辑 ===
    let targetX = c.x;

    // 首先检查是否靠近屏幕边缘，如果是则立即向中心移动
    const SCREEN_MARGIN = CHARACTER_SIZE * 1.5; // 屏幕边缘安全距离
    if (c.x < SCREEN_MARGIN) {
      targetX = SCREEN_MARGIN;
    } else if (c.x > window.innerWidth - SCREEN_MARGIN) {
      targetX = window.innerWidth - SCREEN_MARGIN;
    }

    // 如果发现附近有加速道具，且不在边缘位置，优先移动过去
    if (nearestPositiveNPC && !hitObstacleY &&
      c.x > SCREEN_MARGIN && c.x < window.innerWidth - SCREEN_MARGIN) {
      const dx = nearestPositiveNPC.x - c.x;
      const moveSpeed = Math.min(6, Math.abs(dx) / 10);
      if (dx > 5) {
        targetX = c.x + moveSpeed;
      } else if (dx < -5) {
        targetX = c.x - moveSpeed;
      }
    }

    // 如果AI前方有障碍物或即将撞上障碍物
    if (willHitObstacle || hitObstacleY) {
      // 找出正前方最近的障碍物
      let frontObstacle = null;
      let minDistance = Infinity;

      obstacles.forEach(o => {
        const dx = o.x - c.x;
        const dy = o.y - c.y;
        // 只考虑正前方较窄范围内的障碍物
        if (dy < 0 && dy > -200 && Math.abs(dx) < CHARACTER_SIZE * 2) {
          const distance = Math.abs(dy);
          if (distance < minDistance) {
            minDistance = distance;
            frontObstacle = o;
          }
        }
      });

      if (frontObstacle) {
        // 如果障碍物在正前方，选择向左或向右移动
        const moveDistance = 60;
        const centerX = window.innerWidth / 2;

        // 根据屏幕中心位置选择移动方向
        if (c.x < centerX) {
          targetX = Math.min(window.innerWidth - SCREEN_MARGIN, c.x + moveDistance);
        } else {
          targetX = Math.max(SCREEN_MARGIN, c.x - moveDistance);
        }
      }

      let maxBackSteps = 10; // 最多后退步数，避免死循环
      let backSteps = 0;
      let moved = false;
      let lastTryDirection = 'left';
      // 死局规避：后退多步+全范围左右尝试
      while (backSteps <= maxBackSteps && !moved) {
        let maxTryStep = Math.floor(window.innerWidth / 2);
        for (let tryStep = moveStep; tryStep <= maxTryStep; tryStep += moveStep) {
          // 尝试向左大幅度移动，判断是否能避开所有障碍物且不越界
          let testLeftX = c.x - tryStep;
          let canLeft = testLeftX >= c.width / 2;
          obstacles.forEach(o => {
            if (isCollide({ ...c, x: testLeftX }, { ...o, width: o.width, height: o.height })) canLeft = false;
          });
          let overlapLeft = obstacles.some(o => isCollide({ ...c, x: testLeftX }, { ...o, width: o.width, height: o.height }));
          if (canLeft && !overlapLeft) {
            c.x = testLeftX;
            moved = true;
            break;
          }
          // 尝试向右大幅度移动，判断是否能避开所有障碍物且不越界
          let testRightX = c.x + tryStep;
          let canRight = testRightX <= window.innerWidth - c.width / 2;
          obstacles.forEach(o => {
            if (isCollide({ ...c, x: testRightX }, { ...o, width: o.width, height: o.height })) canRight = false;
          });
          let overlapRight = obstacles.some(o => isCollide({ ...c, x: testRightX }, { ...o, width: o.width, height: o.height }));
          if (canRight && !overlapRight) {
            c.x = testRightX;
            moved = true;
            break;
          }
        }
        if (moved) {
          break; // 只要本轮移动成功，跳出while，避免AI左右摇晃
        }
        // 如果左右都无法避开，则后退一步再尝试
        let canBack = true;
        obstacles.forEach(o => {
          if (isCollide({ ...c, y: c.y + moveStep }, { ...o, width: o.width, height: o.height })) canBack = false;
        });
        if (canBack) {
          c.y += moveStep;
          backSteps++;
        } else {
          break; // 后退也被挡，彻底卡死
        }
      }
      if (!moved && backSteps === 0) {
        // 如果一开始就能前进，正常前进
        let speed = c.speed;
        if (c.effect === 'positive' && c.effectTimer > 0) {
          speed *= c.speedBoost || ACCELERATE;  // 使用speedBoost，如果没有则使用默认值
        }
        if (c.effect === 'negative' && c.effectTimer > 0) {
          speed *= c.speedBoost || DECELERATE;  // 使用speedBoost，如果没有则使用默认值
        }
        c.y -= Math.max(0.5, speed);
      }
    } else {
      // 没有障碍物，正常前进
      c.aiDodgeDir = 0;

      // 如果有目标位置，平滑移动到目标位置
      if (targetX !== c.x) {
        const dx = targetX - c.x;
        if (Math.abs(dx) > 0.1) {
          // 固定的移动速度，避免速度变化导致晃动
          const moveSpeed = 4;
          // 确保不会超出屏幕边界
          const newX = c.x + Math.sign(dx) * moveSpeed;
          c.x = Math.max(CHARACTER_SIZE * 1.5, Math.min(window.innerWidth - CHARACTER_SIZE * 1.5, newX));
        }
      }

      // 如果角色已经靠近屏幕边缘，向中心移动
      if (c.x < CHARACTER_SIZE * 1.5) {
        c.x = CHARACTER_SIZE * 1.5;
      } else if (c.x > window.innerWidth - CHARACTER_SIZE * 1.5) {
        c.x = window.innerWidth - CHARACTER_SIZE * 1.5;
      }

      let speed = c.speed;
      if (c.effect === 'positive' && c.effectTimer > 0) {
        speed *= c.speedBoost || ACCELERATE;  // 使用speedBoost，如果没有则使用默认值
      }
      if (c.effect === 'negative' && c.effectTimer > 0) {
        speed *= c.speedBoost || DECELERATE;  // 使用speedBoost，如果没有则使用默认值
      }
      let actualSpeed = Math.min(Math.max(0.5, speed), BASE_SPEED * 1.5);

      c.y -= actualSpeed;
    }
    // 检查AI是否碰到NPC
    npcs.forEach(n => {
      if (!n.touched && isCollide(c, { ...n, width: NPC_SIZE, height: NPC_SIZE })) {
        n.touched = true;
        const bond = BONDS[c.id] && BONDS[c.id][n.id];
        if (bond === 'positive') {
          c.effect = 'positive';
          c.effectTimer = EFFECT_DURATION;
          c.speedBoost = n.speedBoost || ACCELERATE;
          c.tip = '加速！';
          c.tipTimer = 60;
        } else if (bond === 'negative') {
          c.effect = 'negative';
          c.effectTimer = EFFECT_DURATION;
          c.speedBoost = n.speedBoost || DECELERATE;
          c.tip = '减速！';
          c.tipTimer = 60;
        }
      }
    });
    if (c.tipTimer > 0) c.tipTimer--;
    if (c.effectTimer > 0) c.effectTimer--;
    if (c.effectTimer === 0) c.effect = null;
    // 检查AI是否到达终点
    if (c.y <= endY && !c.finished) {
      c.finished = true;
      c.finishTime = Date.now();
      finished.push(c);
      if (!resultModal.classList.contains('hidden')) {
        showResult();
      }
    }
  }
  // 刷新DOM显示
  updateDOM();
  // 如果还有角色未完成，继续下一帧
  if (!allFinished) {
    animationId = requestAnimationFrame(gameLoop);
  }

  // 更新排行榜
  updateLeaderboard();
}

// ==== 倒计时函数 ====
function startCountdown() {
  let count = 3;
  // 倒计时文本
  let countdownText = document.createElement('div');
  countdownText.style.position = 'fixed';
  countdownText.style.left = '50%';
  countdownText.style.bottom = '30%';
  countdownText.style.fontSize = '5rem';
  countdownText.style.fontWeight = '900';
  countdownText.style.color = '#ffffff';
  countdownText.style.zIndex = '100';
  countdownText.style.fontFamily = "'Arial Black', sans-serif";
  countdownText.style.letterSpacing = '-4px';
  countdownText.textContent = count;
  countdownText.style.opacity = '1';
  countdownText.style.transform = 'translate(-50%, 0) scale(1.2)';
  countdownText.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
  document.body.appendChild(countdownText);
  // 重置所有角色的起始时间
  characters.forEach(c => {
    c.startTime = null;
  });

  const timer = setInterval(() => {
    count--;
    if (count > 0) {
      countdownText.textContent = count;
      // 添加动画效果
      countdownText.style.transform = 'translate(-50%, 0) scale(1.2)';
      setTimeout(() => {
        countdownText.style.transform = 'translate(-50%, 0) scale(1)';
      }, 100);
    } else if (count === 0) {
      countdownText.textContent = 'GO!';
      countdownText.style.transform = 'translate(-50%, 0) scale(1.5)';
      countdownText.style.color = 'white';
      setTimeout(() => {
        countdownText.style.transform = 'translate(-50%, 0) scale(1)';
        countdownText.style.opacity = '0';
        // 在GO!动画结束后才开始游戏
        countdownText.style.display = 'none';
        countdownText.style.color = '#ffffff';
        // 设置所有角色的起始时间为同一时刻
        const startTime = Date.now();
        characters.forEach(c => {
          c.startTime = startTime;
        });
        gameStarted = true;
        // 确保在设置gameStarted后再开始游戏循环
        animationId = requestAnimationFrame(gameLoop);
        // 创建并添加排行榜
        const leaderboard = createLeaderboard();
        document.body.appendChild(leaderboard);
      }, 100);
    }
    if (count < 0) {
      clearInterval(timer);
    }
  }, 1000);
}

// ==== 启动 ====
function startRace() {
  // 确保取消之前的动画帧
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  resetGame();
  resultModal.classList.add('hidden');
  startBtn.style.display = 'none';
  gameStarted = false;
  document.querySelector('.race-container').classList.remove('home');
  document.querySelector('.race-container').classList.add('playing');

  // 开始倒计时
  startCountdown();
}

function createDiv(cls, id, w, h, img) {
  const el = document.createElement('div');
  el.className = cls;
  if (id) el.id = id;
  el.style.width = w + 'px';
  el.style.height = h + 'px';
  if (img) {
    const im = document.createElement('img');
    im.src = img;
    el.appendChild(im);
  }
  return el;
}

function setupBackground(bg) {
  bg.className = 'game-background';
  // 使用内联样式设置背景图
  bg.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: ${BACKGROUND_HEIGHT * BACKGROUND_REPEAT}px;
    background-image: url('${BACKGROUD_IMAGE}');
    background-size: 100% ${BACKGROUND_HEIGHT}px;
    background-position: center top;
    background-repeat: repeat-y;
    z-index: -1;
    opacity: 1;
    pointer-events: none;
    will-change: transform;
  `;
}

// ==== 弹窗 ====
function showResult() {
  resultModal.classList.remove('hidden');
  finalRanking.innerHTML = '';
  // 排名
  const finishedChars = characters.filter(c => c.finishTime).sort((a, b) => a.finishTime - b.finishTime);
  const unfinishedChars = characters.filter(c => !c.finishTime);
  const sorted = finishedChars.concat(unfinishedChars);
  sorted.forEach((c, i) => {
    const li = document.createElement('p');
    let timeStr = c.finishTime ? ((c.finishTime - (c.startTime || 0)) / 1000).toFixed(2) + 's' : '未完成';
    li.textContent = `${i + 1}. ${c.name}  ${timeStr}`;
    if (c === characters[PLAYER_INDEX]) {
      li.classList.add('player-rank-me');
    }
    finalRanking.appendChild(li);
  });
}

// 添加一个函数来预加载背景图
function preloadBackground() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      background1.style.opacity = '1';
      background2.style.opacity = '1';
      resolve(img);
    };
    img.onerror = (err) => {
      console.error('Failed to load background image:', err);
      // 尝试打印完整的图片URL
      console.error('Attempted image URL:', new URL(BACKGROUD_IMAGE, window.location.href).href);
      reject(err);
    };
    img.src = BACKGROUD_IMAGE;
  });
}

// ==== 调试函数 ====
function drawDebugInfo(ctx, x, y, width, height, color = '#ff0000') {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // 绘制中心点
  ctx.beginPath();
  ctx.arc(x + width / 2, y + height / 2, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // 显示坐标信息
  ctx.fillStyle = color;
  ctx.font = '12px Arial';
  ctx.fillText(`x:${Math.round(x)}, y:${Math.round(y)}`, x, y - 5);
  ctx.fillText(`w:${Math.round(width)}, h:${Math.round(height)}`, x, y - 20);
}

// ==== 键盘控制 ====
window.addEventListener('keydown', e => {
  if (!gameStarted) {
    playerMovingLeft = false;
    playerMovingRight = false;
    playerMovingBack = false;
    return;
  }
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') playerMovingLeft = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') playerMovingRight = true;
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') playerMovingBack = true;
});
window.addEventListener('keyup', e => {
  if (!gameStarted) return;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') playerMovingLeft = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') playerMovingRight = false;
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') playerMovingBack = false;
});

// ==== 移动端触摸操控 ====
let touchStartX = 0, touchStartY = 0, touchMoved = false;
track.addEventListener('touchstart', function (e) {
  if (!gameStarted) return;
  e.preventDefault();
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
  touchMoved = false;
}, { passive: false });
track.addEventListener('touchmove', function (e) {
  if (!gameStarted) return;
  e.preventDefault();
  const t = e.touches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  touchMoved = true;
  // 左右滑动
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
    if (dx > 0) {
      playerMovingLeft = false;
      playerMovingRight = true;
    } else {
      playerMovingLeft = true;
      playerMovingRight = false;
    }
    playerMovingBack = false;
  } else if (Math.abs(dy) > 10 && dy > 0) {
    // 向下滑动
    playerMovingBack = true;
    playerMovingLeft = false;
    playerMovingRight = false;
  } else {
    // 未滑动到阈值，全部停止
    playerMovingLeft = false;
    playerMovingRight = false;
    playerMovingBack = false;
  }
}, { passive: false });
track.addEventListener('touchend', function (e) {
  if (!gameStarted) return;
  e.preventDefault();
  // 松开后停止移动
  playerMovingLeft = false;
  playerMovingRight = false;
  playerMovingBack = false;
}, { passive: false });


closeModalX.addEventListener('click', () => {
  resultModal.classList.add('hidden');
});
restartBtn.addEventListener('click', () => {
  resultModal.classList.add('hidden');
  startRace();
});

// 点击开始游戏时，显示赛道并初始化
startBtn.addEventListener('click', async () => {
  track.style.display = 'block';
  // gameTitle.style.display = 'none';
  startBtn.style.display = 'none';

  try {
    await preloadBackground();
  } catch (err) {
    console.error('Error loading background:', err);
  }

  resetGame();
  gameStarted = false;
  document.querySelector('.race-container').classList.remove('home');
  document.querySelector('.race-container').classList.add('playing');

  // 切换背景音乐
  index_bgm.pause();
  index_bgm.currentTime = 0;
  play_bgm.play().catch(err => {
    console.warn('Auto-play was prevented:', err);
  });

  // 开始倒计时
  startCountdown();
});

// 在游戏加载完成后初始化角色
window.addEventListener('load', () => {
  initGameContainer();
  // 播放index_bgm
  index_bgm.play().catch(err => {
    console.warn('Auto-play was prevented:', err);
  });
});

// 添加键盘快捷键来切换调试模式
document.addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'H') {
    DEBUG_SHOW_HITBOX = !DEBUG_SHOW_HITBOX;
  }
});

// 添加排行榜看板
function createLeaderboard() {
  const leaderboard = document.createElement('div');
  leaderboard.className = 'leaderboard';
  leaderboard.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.5);
    padding: 10px 20px;
    border-radius: 10px;
    color: white;
    font-family: Arial, sans-serif;
    z-index: 1000;
    min-width: 300px;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  `;
  return leaderboard;
}

// 更新排行榜显示
function updateLeaderboard() {
  const leaderboard = document.querySelector('.leaderboard');
  if (!leaderboard) return;

  // 计算排名和信息
  const currentTime = Date.now();
  // 根据y坐标排序，y值越小表示越靠前
  const sorted = [...characters].sort((a, b) => {
    if (a.y === b.y) return 0;
    return a.y - b.y;
  });

  // 找出当前领先的玩家
  const leader = sorted[0];

  // 生成排行榜HTML
  let html = '<table style="width: 100%; border-collapse: collapse;">';
  html += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.2); color: #aaa;">';
  html += '<th style="text-align: left; padding: 2px 5px;">排名</th>';
  html += '<th style="text-align: left; padding: 2px 5px;">选手</th>';
  html += '<th style="text-align: right; padding: 2px 5px;">速度</th>';
  html += '<th style="text-align: right; padding: 2px 5px;">耗时</th>';
  html += '<th style="text-align: right; padding: 2px 5px;">状态</th>';
  html += '</tr>';
  
  sorted.forEach((c, index) => {
    const isPlayer = !c.isAI;
    const rowStyle = isPlayer ? 'color: #ffd700; font-weight: bold;' : '';
    const speed = c.speed + (c.effect === 'positive' && c.effectTimer > 0 ? ACCELERATE : 0) - (c.effect === 'negative' && c.effectTimer > 0 ? DECELERATE : 0);
    let timeDisplay;
    
    // 计算状态
    let status = '进行中';
    let statusStyle = 'color: #1890ff;'; // 蓝色表示进行中
    
    if (c.finishTime) {
      // 已到达终点
      status = '已完成';
      statusStyle = 'color: #52c41a;'; // 绿色表示完成
      timeDisplay = ((c.finishTime - c.startTime) / 1000).toFixed(1);
    } else if (c === leader && !c.finishTime && gameStarted) {
      // 未完成但当前领先
      status = '领先';
      statusStyle = 'color:rgb(206, 223, 110);'; // 金色表示领先
      timeDisplay = ((currentTime - (c.startTime || currentTime)) / 1000).toFixed(1);
    } else {
      // 正在比赛中
      status = '进行中';
      statusStyle = 'color: #1890ff;';
      timeDisplay = ((currentTime - (c.startTime || currentTime)) / 1000).toFixed(1);
    }
    
    html += `
      <tr style="${rowStyle}">
        <td style="padding: 2px 5px;">${index + 1}</td>
        <td style="padding: 2px 5px;">${c.name}</td>
        <td style="text-align: right; padding: 2px 5px;">${speed.toFixed(1)}</td>
        <td style="text-align: right; padding: 2px 5px;">${timeDisplay}s</td>
        <td style="text-align: right; padding: 2px 5px;"><span style="${statusStyle}">${status}</span></td>
      </tr>
    `;
  });
  
  html += '</table>';
  leaderboard.innerHTML = html;
}

// 在游戏循环中更新 NPC 位置
function updateNPCs() {
  npcs.forEach(n => {
    if (!n.el) return;
    
    // 计算 NPC 在屏幕上的位置
    const sx = n.x;
    const sy = n.y - centerY + window.innerHeight / 2;
    
    // 确保 NPC 不会超出屏幕边界
    const minX = NPC_SIZE / 2;
    const maxX = window.innerWidth - NPC_SIZE / 2;
    
    // 如果超出边界，调整位置
    if (sx < minX) {
      n.x = minX;
    } else if (sx > maxX) {
      n.x = maxX;
    }
    
    // 更新 NPC 元素位置
    n.el.style.left = (n.x - NPC_SIZE / 2) + 'px';
    n.el.style.top = (sy - NPC_SIZE / 2) + 'px';
  });
}

// 在游戏初始化时设置 NPC 的初始位置
function initNPCs() {
  // 确保 NPC 的初始位置在屏幕内
  const minX = NPC_SIZE / 2;
  const maxX = window.innerWidth - NPC_SIZE / 2;
  
  npcs = NPCS.map(n => ({
    ...n,
    x: Math.min(Math.max(n.x, minX), maxX), // 确保初始 x 位置在边界内
    y: n.y,
    width: NPC_SIZE,
    height: NPC_SIZE,
    touched: false,
    el: null
  }));
}