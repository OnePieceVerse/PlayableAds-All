const config = window.PLAYABLE_CONFIG;
const images = window.PLAYABLE_IMAGES;

// 合并公共语言和合作伙伴特定语言
const publicLang = window.PLAYABLE_LANG || {};
const partnerLang = window.PARTNER_LANG || {};

// 合并语言配置，合作伙伴配置优先
const lang = {};
for (const langKey in publicLang) {
  lang[langKey] = { ...publicLang[langKey] };
  // 如果合作伙伴有该语言的配置，则覆盖公共配置
  if (partnerLang[langKey]) {
    lang[langKey] = { ...lang[langKey], ...partnerLang[langKey] };
  }
}

// 添加合作伙伴独有的语言
for (const langKey in partnerLang) {
  if (!lang[langKey]) {
    lang[langKey] = { ...partnerLang[langKey] };
  }
}

// 当前语言，可以根据需要切换
let currentLang = config.lang || 'en';

// 获取视频源
const videoUrl = config.videoUrl;
const base64Video = window.PLAYABLE_VIDEOS[videoUrl];
const videoType = config.type;

// DOM元素
const video = document.getElementById('ad-video');
const clickLayer = document.getElementById('clickLayer');
const clickTip = clickLayer.querySelector('.click-tip');
const rotateHighlight = clickTip.querySelector('.highlight');
const guideLayer = document.getElementById('guideLayer');
const guideContainer = document.getElementById('guideContainer');

// 状态变量
let isPortrait = window.innerHeight > window.innerWidth;
let hasStarted = false;
let currentInteractionPoint = null;
let lastTime = 0; // 记录上一次的时间

let ctaStartButtonVisible = false;
let ctaEndButtonVisible = false;

function isPortraitVideo() {
  return videoType === 'portrait';
}

function isLandscapeVideo() {
  return videoType === 'landscape';
}

function isDisplayStartScreen() {
  return config.start_screen && config.start_screen.enable;
}

// 显示开始屏幕
function showStartScreen() {
  // 清除现有内容
  guideLayer.innerHTML = '';

  // 获取当前屏幕方向的配置
  const orientation = isPortrait ? 'portrait' : 'landscape';
  const startConfig = config.start_screen[orientation];

  // 创建开始屏幕图片
  const startImage = document.createElement('img');
  startImage.src = images[startConfig.image];
  startImage.className = 'start-screen-image';
  // 设置图片尺寸和位置
  setButtonSizeAndPosition(startImage, startConfig.size, startConfig.position);

  // 添加到引导层
  guideLayer.appendChild(startImage);

  // 显示点击层
  clickLayer.style.display = 'flex';

  // 如果是竖屏，显示旋转提示
  if (isPortrait && isLandscapeVideo()) {
    rotateHighlight.style.display = 'block';
  } else {
    rotateHighlight.style.display = 'none';
  }
}

// 检查屏幕方向并显示相应提示
function checkOrientation() {
  isPortrait = window.innerHeight > window.innerWidth;

  if (!hasStarted && isDisplayStartScreen() === true) {
    showStartScreen();
  }
}

function setButtonSizeAndPosition(btn, sizePercent, posPercent) {
  // 获取guide-layer的尺寸
  const containerRect = guideLayer.getBoundingClientRect();
  if (containerRect.width === 0 || containerRect.height === 0) {
    // 容器还没准备好，下一帧再试
    requestAnimationFrame(() => setButtonSizeAndPosition(btn, sizePercent, posPercent));
    return;
  }
  // 计算按钮尺寸
  let targetWidth = containerRect.width * sizePercent.width;
  const img = new window.Image();
  img.src = btn.src;
  img.onload = function () {
    const imgRatio = img.width / img.height;
    let targetHeight = targetWidth / imgRatio;
    btn.style.width = targetWidth + 'px';
    btn.style.height = targetHeight + 'px';
    // 图片加载好后再设置位置
    btn.style.left = (posPercent.x * 100) + '%';
    btn.style.top = (posPercent.y * 100) + '%';
    btn.style.transform = 'translate(-50%, -50%)';
    btn.classList.add('visible');
  };
}

// 创建引导元素
function createGuideElements(point) {
  // 检查资源是否存在
  if (point.type === 'slider') {
    // 清除现有引导元素
    const existingGuides = guideLayer.querySelectorAll('.button-image, .guide-image, .slider-guide-container, .sound-wave-container');
    existingGuides.forEach(el => el.remove());

    // 获取滑块配置
    const sliderConfig = point.sliderConfig || {};
    const direction = sliderConfig.direction || 'horizontal';
    const trackLength = sliderConfig.trackLength || 0.7; // 默认轨道长度为屏幕宽度的70%
    const holdTime = sliderConfig.holdTime || 0; // 默认不需要维持时间
    const showMarkers = sliderConfig.showStartEndMarkers !== false; // 默认显示起始和结束标记
    
    // 获取文本配置，使用配置的语言键或默认键
    const labelTextKey = sliderConfig.labelTextKey || 'slider_drag_to_end';
    const notEnoughTextKey = sliderConfig.notEnoughTextKey || 'slider_not_enough';
    const holdRequiredTextKey = sliderConfig.holdRequiredTextKey || 'slider_hold_required';
    
    // 使用语言键获取对应语言的文本
    const labelText = getText(labelTextKey);
    const notEnoughText = getText(notEnoughTextKey);
    const holdRequiredText = getText(holdRequiredTextKey);
    
    // 获取当前屏幕方向的配置
    const orientation = isPortrait ? 'portrait' : 'landscape';
    const posY = sliderConfig.position && sliderConfig.position[orientation] ? 
                 sliderConfig.position[orientation].y : 0.85; // 默认在屏幕85%位置

    // 创建声音波纹容器
    const soundContainer = document.createElement('div');
    soundContainer.className = 'sound-wave-container';
    soundContainer.style.top = (posY * 100) + '%';
    soundContainer.style.transform = 'translateY(-50%)';

    // 提示文本
    const label = document.createElement('div');
    label.className = 'sound-label';
    label.textContent = labelText;
    soundContainer.appendChild(label);
    
    // 3秒后自动淡出提示文字
    setTimeout(() => {
      label.style.opacity = '0';
    }, 3000);

    // 声波小球容器
    const waveContainer = document.createElement('div');
    waveContainer.className = 'wave-container';
    soundContainer.appendChild(waveContainer);

    // 滑动轨道
    const track = document.createElement('div');
    track.className = 'slider-track';
    track.style.width = (trackLength * 100) + '%';
    waveContainer.appendChild(track);
    
    // 滑动进度条
    const progress = document.createElement('div');
    progress.className = 'slider-progress';
    track.appendChild(progress);
    
    // 起始和结束标记
    if (showMarkers) {
      const startMarker = document.createElement('div');
      startMarker.className = 'slider-start-marker';
      track.appendChild(startMarker);
      
      const endMarker = document.createElement('div');
      endMarker.className = 'slider-end-marker';
      track.appendChild(endMarker);
    }

    // 小球
    const soundBall = document.createElement('div');
    soundBall.className = 'sound-ball';
    soundBall.style.left = '0';
    track.appendChild(soundBall);
    
    // 成功状态指示器
    const successIndicator = document.createElement('div');
    successIndicator.className = 'success-indicator';
    track.appendChild(successIndicator);
    
    // 计时器
    const holdTimer = document.createElement('div');
    holdTimer.className = 'hold-timer';
    track.appendChild(holdTimer);

    // 错误提示
    const tip = document.createElement('div');
    tip.className = 'sound-tip';
    soundContainer.appendChild(tip);

    // 拖动逻辑
    let dragging = false;
    let startX = 0;
    let trackRect = null;
    let ballPos = 0;
    let maxPos = 0;
    let holdStartTime = 0;
    let holdTimerId = null;
    let holdComplete = false;
    let videoStarted = false;
    let videoPlaying = false;
    
    function updateBall(pos) {
      // 更新小球位置
      soundBall.style.left = pos + 'px';
      
      // 更新进度条
      const progressPercent = (pos / maxPos) * 100;
      progress.style.width = progressPercent + '%';
    }
    
    function startHoldTimer() {
      if (holdTime <= 0) {
        // 不需要维持时间，直接完成
        completeInteraction();
        return;
      }
      
      // 显示计时器
      holdStartTime = Date.now();
      successIndicator.classList.add('active');
      holdTimer.classList.add('active');
      
      // 更新计时器显示
      updateHoldTimer();
      
      // 设置定时器
      holdTimerId = setInterval(() => {
        const elapsed = (Date.now() - holdStartTime) / 1000;
        if (elapsed >= holdTime) {
          clearInterval(holdTimerId);
          holdComplete = true;
          completeInteraction();
        } else {
          updateHoldTimer();
        }
      }, 100);
    }
    
    function updateHoldTimer() {
      const elapsed = (Date.now() - holdStartTime) / 1000;
      const remaining = Math.max(0, holdTime - elapsed).toFixed(1);
      holdTimer.textContent = remaining + 's';
    }
    
    function cancelHoldTimer() {
      if (holdTimerId) {
        clearInterval(holdTimerId);
        holdTimerId = null;
      }
      successIndicator.classList.remove('active');
      holdTimer.classList.remove('active');
    }
    
    function startVideoPlayback() {
      // 如果视频已经开始播放，则继续播放
      if (!videoStarted) {
        videoStarted = true;
      }
      videoPlaying = true;
      playVideo();
    }
    
    function pauseVideoPlayback() {
      // 如果需要hold并且视频已经开始播放，则暂停视频
      if (holdTime > 0 && videoStarted && videoPlaying) {
        videoPlaying = false;
        pauseVideo();
        console.log('Pausing video playback, holdTime:', holdTime, 'videoStarted:', videoStarted);
      }
    }
    
    function completeInteraction() {
      // 成功，移除引导，继续播放
      soundBall.classList.add('success');
      setTimeout(() => {
        soundContainer.remove();
        if (video.currentTime < point.time + point.duration) {
          video.currentTime = point.time + point.duration;
        }
        playVideo();
      }, 800);
    }
    
    function onDragStart(e) {
      e.preventDefault();
      dragging = true;
      soundBall.classList.add('active');
      // 用户开始操作后立即隐藏提示文字
      label.style.opacity = '0';
      trackRect = track.getBoundingClientRect();
      maxPos = trackRect.width - soundBall.offsetWidth;
      startX = (e.touches ? e.touches[0].clientX : e.clientX) - ballPos;
      
      // 取消之前的计时器
      cancelHoldTimer();
      
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('touchmove', onDragMove, {passive: false});
      document.addEventListener('mouseup', onDragEnd);
      document.addEventListener('touchend', onDragEnd);
    }
    
    function onDragMove(e) {
      if (!dragging) return;
      e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      let pos = clientX - startX;
      pos = Math.max(0, Math.min(pos, maxPos));
      ballPos = pos;
      updateBall(pos);
      
      // 如果已经到达终点
      if (pos >= maxPos - 2) {
        // 在终点位置，开始播放视频
        if (!videoPlaying) {
          startVideoPlayback();
        }
        
        if (!holdTimerId && !holdComplete) {
          // 如果需要hold且尚未开始计时，则开始计时
          startHoldTimer();
        }
      } else {
        // 如果离开终点
        if (holdTimerId) {
          // 取消计时
          cancelHoldTimer();
        }
        
        // 离开终点，暂停视频
        if (videoPlaying) {
          pauseVideoPlayback();
        }
      }
      
      tip.textContent = '';
      tip.style.opacity = '0';
    }
    
    function onDragEnd() {
      if (!dragging) return;
      dragging = false;
      soundBall.classList.remove('active');
      
      console.log('Drag ended, holdComplete:', holdComplete, 'ballPos:', ballPos, 'maxPos:', maxPos);
      
      // 判断是否在终点并且已完成维持时间
      if (ballPos >= maxPos - 2 && holdComplete) {
        // 已经完成，不需要额外操作
        console.log('Hold complete, continuing playback');
      } else {
        // 松开时，无论在哪个位置都暂停视频
        pauseVideoPlayback();
        
        if (holdTime > 0) {
          // 取消计时器
          cancelHoldTimer();
          
          // 无论在哪个位置松开，只要未完成hold时间，都回到起点
          if (ballPos >= maxPos - 2) {
            tip.textContent = holdRequiredText;
            tip.style.opacity = '1';
            
            // 回到起点
            ballPos = 0;
            updateBall(ballPos);
            
            // 3秒后隐藏提示
            setTimeout(() => {
              tip.style.opacity = '0';
            }, 3000);
          } else {
            // 未到终点，回弹并提示
            tip.textContent = notEnoughText;
            tip.style.opacity = '1';
            ballPos = 0;
            updateBall(ballPos);
            
            // 3秒后隐藏提示
            setTimeout(() => {
              tip.style.opacity = '0';
            }, 3000);
          }
        } else {
          // 不需要维持时间，如果在终点则完成交互
          if (ballPos >= maxPos - 2) {
            completeInteraction();
          } else {
            // 未到终点，回弹并提示
            tip.textContent = notEnoughText;
            tip.style.opacity = '1';
            ballPos = 0;
            updateBall(ballPos);
            
            // 3秒后隐藏提示
            setTimeout(() => {
              tip.style.opacity = '0';
            }, 3000);
          }
        }
      }
      
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('touchmove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
      document.removeEventListener('touchend', onDragEnd);
    }
    
    // 添加事件监听
    soundBall.addEventListener('mousedown', onDragStart);
    soundBall.addEventListener('touchstart', onDragStart, {passive: false});
    
    // 初始化位置
    setTimeout(() => {
      trackRect = track.getBoundingClientRect();
      maxPos = trackRect.width - soundBall.offsetWidth;
      updateBall(0);
    }, 0);
    
    guideLayer.appendChild(soundContainer);
    return;
  }
  if (!images || !images[point.buttonImage] || !images[point.guideImage]) {
    console.error(getText('resource_not_found'), point.buttonImage, point.guideImage);
    return;
  }

  // 获取当前屏幕方向的配置
  const orientation = isPortrait ? 'portrait' : 'landscape';

  // 清除现有引导元素，但保留CTA按钮
  const existingGuides = guideLayer.querySelectorAll('.button-image, .guide-image');
  existingGuides.forEach(el => el.remove());

  // 创建按钮
  const buttonImage = document.createElement('img');
  buttonImage.src = images[point.buttonImage];
  buttonImage.className = 'button-image';

  // 使用对应方向的按钮尺寸和位置
  let buttonSize = point.buttonSize[orientation];
  let buttonPosition = point.buttonPosition[orientation];
  // 为了适配横屏视频，竖屏时，没有首页图片时，CTA按钮的位置
  if (isPortrait && isLandscapeVideo() && !hasStarted && isDisplayStartScreen() === false) {
    buttonSize = point.buttonSize['landscape'];
    buttonPosition = point.buttonPosition['landscape'];
  }
  setButtonSizeAndPosition(buttonImage, buttonSize, buttonPosition);

  if (point.buttonEffect === 'scale') {
    buttonImage.classList.add('scale-animation');
  }

  // 添加按钮点击事件
  buttonImage.addEventListener('click', (e) => {
    if (point.clickEffectImage) {
      // playClickSparkEffect(point);
      setTimeout(() => {
        // 只移除引导元素，保留CTA按钮
        const guides = guideLayer.querySelectorAll('.button-image, .guide-image');
        guides.forEach(el => el.remove());
        if (video.currentTime < point.time + point.duration) {
          video.currentTime = point.time + point.duration;
        }
        playVideo();
      }, 1000);
    } else {
      // 只移除引导元素，保留CTA按钮
      const guides = guideLayer.querySelectorAll('.button-image, .guide-image');
      guides.forEach(el => el.remove());
      if (video.currentTime < point.time + point.duration) {
        video.currentTime = point.time + point.duration;
      }
      playVideo();
    }
  });

  // 创建引导图片
  const guideImage = document.createElement('img');
  guideImage.src = images[point.guideImage];
  guideImage.className = 'guide-image';

  // 使用对应方向的引导尺寸和位置
  let guideSize = point.guideSize[orientation];
  let guidePosition = point.guidePosition[orientation];
  // 为了适配横屏视频，竖屏时，没有首页图片时，CTA按钮的位置
  if (isPortrait && isLandscapeVideo() && !hasStarted && isDisplayStartScreen() === false) {
    guideSize = point.guideSize['landscape'];
    guidePosition = point.guidePosition['landscape'];
  }
  setButtonSizeAndPosition(guideImage, guideSize, guidePosition);

  // 添加动画
  const swipeConfig = point.swipeDirection;
  if (typeof swipeConfig === 'string' && swipeConfig === 'scale') {
    guideImage.classList.add('scale-animation');
  } else if (typeof swipeConfig === 'string' && swipeConfig === 'bounce') {
    guideImage.classList.add('bounce-y');
  } else if (typeof swipeConfig === 'string' && swipeConfig === 'slide-bounce') {
    guideImage.classList.add('slide-in-right');
    // 动画结束后加上 bounce-y
    guideImage.addEventListener('animationend', function handler(e) {
      if (e.animationName === 'slideInRight') {
        guideImage.classList.remove('slide-in-right');
        guideImage.classList.add('bounce-y');
        guideImage.removeEventListener('animationend', handler);
      }
    });
  }
  else if (typeof swipeConfig === 'object' && swipeConfig.type === 'angle') {
    guideImage.classList.add('angle-animation');
    const angle = swipeConfig.value * Math.PI / 180;
    const distance = parseInt(swipeConfig.distance);
    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;
    guideImage.style.setProperty('--move-x', moveX + 'px');
    guideImage.style.setProperty('--move-y', moveY + 'px');
  }

  // 添加到引导容器
  guideLayer.appendChild(buttonImage);
  guideLayer.appendChild(guideImage);

  // 处理竖屏旋转
  if (isPortrait && isLandscapeVideo() && video.classList.contains('rotated')) {
    guideLayer.classList.add('rotated');
  } else {
    guideLayer.classList.remove('rotated');
  }
}

// 创建CTA开始按钮，在视频开始时显示
function createCTAStartButton() {
  // 如果已经存在CTA按钮，先移除
  hideCTAStartButton();

  // 获取当前屏幕方向的配置
  const orientation = isPortrait ? 'portrait' : 'landscape';
  const ctaConfig = config.cta_start_button;
  if (!ctaConfig) return;

  // 创建按钮
  const ctaButton = document.createElement('img');
  ctaButton.className = 'cta-button cta-start-button';
  ctaButton.src = images[ctaConfig.buttonImage];

  // 设置尺寸和位置
  let buttonSize = ctaConfig.buttonSize[orientation];
  let buttonPosition = ctaConfig.buttonPosition[orientation];
  // 为了适配竖屏时，没有首页图片时，CTA按钮的位置
  if (isPortrait && isLandscapeVideo() && !hasStarted && isDisplayStartScreen() === false) {
    buttonSize = ctaConfig.buttonSize['landscape'];
    buttonPosition = ctaConfig.buttonPosition['landscape'];
  }
  setButtonSizeAndPosition(ctaButton, buttonSize, buttonPosition);

  ctaButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.mraid && typeof window.mraid.open === 'function') {
      window.mraid.open(ctaConfig.url);
    } else if (ctaConfig.url) {
      const win = window.open(ctaConfig.url, '_blank');
      if (!win) {
        window.location.href = ctaConfig.url;
      }
    }
  });

  guideLayer.appendChild(ctaButton);
  ctaStartButtonVisible = true;
}

// 隐藏CTA开始按钮
function hideCTAStartButton() {
  const existingCTA = guideLayer.querySelector('.cta-start-button');
  if (existingCTA) {
    existingCTA.remove();
  }
  ctaStartButtonVisible = false;
}

// 创建CTA结束按钮，在视频结束时显示
function createCTAEndButton() {
  // 如果已经存在CTA按钮，先移除
  hideCTAEndButton();
  hideCTAStartButton(); // 出现end按钮时自动隐藏start按钮

  // 获取当前屏幕方向的配置
  const orientation = isPortrait ? 'portrait' : 'landscape';
  const ctaConfig = config.cta_end_button;
  if (!ctaConfig) return;

  // 创建按钮
  const ctaButton = document.createElement('img');
  ctaButton.className = 'cta-button cta-end-button scale-bounce';
  ctaButton.src = images[ctaConfig.buttonImage];

  // 设置尺寸和位置
  const buttonSize = ctaConfig.buttonSize[orientation];
  const buttonPosition = ctaConfig.buttonPosition[orientation];
  setButtonSizeAndPosition(ctaButton, buttonSize, buttonPosition);

  ctaButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.mraid && typeof window.mraid.open === 'function') {
      window.mraid.open(ctaConfig.url);
    } else if (ctaConfig.url) {
      const win = window.open(ctaConfig.url, '_blank');
      if (!win) {
        window.location.href = ctaConfig.url;
      }
    }
  });

  guideLayer.appendChild(ctaButton);
  requestAnimationFrame(() => {
    ctaButton.classList.add('visible');
  });
  ctaEndButtonVisible = true;
}
// 隐藏CTA结束按钮
function hideCTAEndButton() {
  const existingCTA = guideLayer.querySelector('.cta-end-button');
  if (existingCTA) {
    existingCTA.remove();
  }
  ctaEndButtonVisible = false;
}

// 检查交互点
function checkInteractionPoints() {
  // 适配checkDisplayStartScreen() === false 时，CTA 按钮的lastTime < 改为 <= 没有关系, 因为视频开始时，lastTime为0，所以需要<=
  if (video.currentTime >= config.cta_start_button.displayTime && lastTime <= config.cta_start_button.displayTime) {
    createCTAStartButton();
  }
  // 适配checkDisplayStartScreen() === false 时，CTA 按钮的lastTime < 改为 <= 没有关系, 因为视频开始时，lastTime为0，所以需要<=
  if (video.currentTime >= config.cta_end_button.displayTime && lastTime <= config.cta_end_button.displayTime) {
    createCTAEndButton();
  }
  
  if (!config.interactionPoints) return;

  const currentTime = video.currentTime;
  // 遍历所有交互点
  for (const point of config.interactionPoints) {
    // 如果当前时间大于等于交互点时间，并且上一次时间小于交互点时间，说明需要显示引导元素
    // 适配checkDisplayStartScreen() === false 时，lastTime < point.time的条件修改增加不需要首页图片时的判断(checkDisplayStartScreen() === false && currentTime === 0 && lastTime <= point.time))
    if (currentTime >= point.time && (lastTime < point.time || (currentTime === 0 && lastTime <= point.time)) && currentInteractionPoint !== point) {
      currentInteractionPoint = point;
      video.currentTime = point.time;
      createGuideElements(point);
    }
    // 如果当前时间和上一次时间跨过了交互点时间，说明需要暂停
    if (currentTime >= (point.time + point.duration) && lastTime < (point.time + point.duration) && currentInteractionPoint == point) {
      video.pause();
      break;
    }
  }

  lastTime = currentTime;
}

// 播放控制
function playVideo() {
  lastTime = video.currentTime;
  video.volume = config.volume;
  // 移除开始屏幕图片
  const startImage = guideLayer.querySelector('.start-screen-image');
  if (startImage) {
    startImage.remove();
  }

  video.play().then(() => {
    hasStarted = true;
    clickLayer.style.display = 'none';
    currentInteractionPoint = null;

    if (isPortrait && isLandscapeVideo()) {
      // 先隐藏引导元素
      guideLayer.classList.add('rotating');

      if (config.rotateTime >= 0) {
        setTimeout(() => {
          video.classList.add('rotated');
          guideLayer.classList.add('rotated');

          // 提前显示引导元素
          setTimeout(() => {
            guideLayer.classList.remove('rotating');
          }, 300);
        }, config.rotateTime * 1000);
      }
    }
  }).catch(error => {
    console.error(getText('play_failed'), error);
    video.muted = true;
    video.play().catch(e => {
      console.error(getText('play_failed'), e);
      clickTip.textContent = getText('play_failed');
      rotateHighlight.style.display = 'none';
    });
  });
}

// 暂停视频
function pauseVideo() {
  if (video && !video.paused) {
    video.pause();
    console.log('Video paused');
  }
}

// 获取翻译文本
function getText(key) {
  const keys = key.split('.');
  let text = lang[currentLang];
  for (const k of keys) {
    text = text[k];
    if (!text) return key; // 如果找不到翻译，返回key
  }
  return text;
}

// 更新页面文本
function updatePageText() {
  // 更新所有带data-lang属性的元素
  document.querySelectorAll('[data-lang]').forEach(el => {
    const key = el.getAttribute('data-lang');
    el.textContent = getText(key);
  });

  // 更新document title
  document.title = getText('title');
}

// 切换语言
function switchLanguage(newLang) {
  if (lang[newLang]) {
    currentLang = newLang;
    updatePageText();
  }
}

// 初始化语言
updatePageText();

// 初始化视频
video.src = base64Video;
video.load();

// 视频时间更新事件
video.addEventListener('timeupdate', checkInteractionPoints);

// apple设备上需要主动调用一次，否则无法触发timeupdate事件
checkInteractionPoints();

// 视频结束处理
video.addEventListener('ended', () => {
  rotateHighlight.style.display = 'none';

  // 清除引导层内容，但保留CTA按钮
  const guides = guideLayer.querySelectorAll('.button-image, .guide-image');
  guides.forEach(el => el.remove());
  currentInteractionPoint = null;
});

// 在指定时间点显示ctaEndButton
video.addEventListener('timeupdate', () => {
  if (
    config.cta_end_time !== undefined &&
    video.currentTime >= config.cta_end_time &&
    !guideLayer.querySelector('.cta-end-button')
  ) {
    createCTAEndButton();
  }
});

function startVideoDirectly() {
  if (hasStarted) return true;
  const point = config.interactionPoints[0];
  if (point.time === 0) {
    return true;
  }
  return false;
}

// 添加直接点击屏幕播放
document.addEventListener('click', () => {
  // if (!hasStarted && !startVideoDirectly()) {
  if (!hasStarted) {
    playVideo();
  }
});

// 屏幕旋转处理
window.addEventListener('resize', () => {
  const wasPortrait = isPortrait;
  isPortrait = window.innerHeight > window.innerWidth;
  // 如果方向确实发生了变化
  if (wasPortrait !== isPortrait) {
    // 如果还没开始播放，更新开始屏幕
    if (!hasStarted && isDisplayStartScreen() === true) {
      showStartScreen();
      return;
    }

    // 先隐藏引导元素
    guideLayer.classList.add('rotating');

    if (!hasStarted && isDisplayStartScreen() === false && currentInteractionPoint) {
      createGuideElements(currentInteractionPoint);
    }
    if (isPortrait && isLandscapeVideo() && hasStarted) {
      // 竖屏：添加旋转
      video.classList.add('rotated');
      guideLayer.classList.add('rotated');
    } else {
      // 横屏：移除旋转
      video.classList.remove('rotated');
      guideLayer.classList.remove('rotated');
    }

    // 等待旋转动画完成后再显示引导元素
    setTimeout(() => {
      // 如果视频已结束，显示CTA按钮
      if (video.ended) {
        createCTAEndButton();
      }
      // 如果视频正在播放且有交互点，显示引导元素
      else if (hasStarted && currentInteractionPoint) {
        createGuideElements(currentInteractionPoint);
      }
      // 移除旋转中状态
      guideLayer.classList.remove('rotating');
    }, 300);
  }

  if (ctaStartButtonVisible) {
    createCTAStartButton();
  }
  if (ctaEndButtonVisible) {
    createCTAEndButton();
  }
});

// 视频错误处理
video.addEventListener('error', (e) => {
  console.error(getText('loading_failed'), e.target.error);
  clickLayer.style.display = 'flex';
  clickTip.textContent = getText('loading_failed');
  rotateHighlight.style.display = 'none';
});

// 初始化
checkOrientation();
