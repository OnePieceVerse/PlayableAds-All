const config = window.PLAYABLE_CONFIG;
const images = window.PLAYABLE_IMAGES;
const lang = window.PLAYABLE_LANG;

// 当前语言，可以根据需要切换
let currentLang = config.lang || 'en';

// 获取视频源
const videoUrl = config.videoUrl;
const base64Video = window.PLAYABLE_VIDEOS[videoUrl];

// DOM元素
const video = document.getElementById('ad-video');
const clickLayer = document.getElementById('clickLayer');
const clickTip = clickLayer.querySelector('.click-tip');
const rotateHighlight = clickTip.querySelector('.highlight');
const guideLayer = document.getElementById('guideLayer');
const guideContainer = document.getElementById('guideContainer');

// 新增获取ctaStartContainer
const ctaStartContainer = document.getElementById('ctaStartContainer');

// 新增获取ctaEndContainer
const ctaEndContainer = document.getElementById('ctaEndContainer');

// 状态变量
let isPortrait = window.innerHeight > window.innerWidth;
let hasStarted = false;
let currentInteractionPoint = null;
let lastTime = 0; // 记录上一次的时间

let ctaStartButtonVisible = false;
let ctaEndButtonVisible = false;

// 检查屏幕方向并显示相应提示
function checkOrientation() {
  isPortrait = window.innerHeight > window.innerWidth;

  // 暂时注释，因为视频播放时，会自动显示引导元素
  // if (!hasStarted) {
  //   clickLayer.style.display = 'flex';
  //   if (isPortrait) {
  //     rotateHighlight.style.display = 'block';
  //   } else {
  //     rotateHighlight.style.display = 'none';
  //   }
  // }
}

// 创建引导元素
function createGuideElements(point) {
  // 检查资源是否存在
  if (!images || !images[point.buttonImage] || !images[point.guideImage]) {
    console.error(getText('resource_not_found'), point.buttonImage, point.guideImage);
    return;
  }

  // 获取当前屏幕方向的配置
  const orientation = isPortrait ? 'portrait' : 'landscape';

  // 清除现有引导
  guideContainer.innerHTML = '';

  // 创建按钮
  const buttonImage = document.createElement('img');
  buttonImage.src = images[point.buttonImage];
  buttonImage.className = 'button-image';

  // 使用对应方向的按钮尺寸和位置
  const buttonSize = point.buttonSize[orientation];
  const buttonPosition = point.buttonPosition[orientation];

  setButtonSizeAndPosition(buttonImage, buttonSize, buttonPosition, video);

  if (point.buttonEffect === 'scale') {
    buttonImage.classList.add('scale-animation');
  }

  // 创建引导图片
  const guideImage = document.createElement('img');
  guideImage.src = images[point.guideImage];
  guideImage.className = 'guide-image';

  // 使用对应方向的引导尺寸和位置
  const guideSize = point.guideSize[orientation];

  const guidePosition = point.guidePosition[orientation];
  setButtonSizeAndPosition(guideImage, guideSize, guidePosition, video);
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

  // 添加按钮点击事件
  buttonImage.addEventListener('click', (e) => {
    if (point.clickEffectImage) {
      // playClickSparkEffect(point);
      setTimeout(() => {
        guideContainer.innerHTML = '';
        if (video.currentTime < point.time + point.duration) {
          video.currentTime = point.time + point.duration;
        }
        playVideo();
      }, 1000);
    } else {
      guideContainer.innerHTML = '';
      if (video.currentTime < point.time + point.duration) {
        video.currentTime = point.time + point.duration;
      }
      playVideo();
    }
  });

  // 添加到引导容器
  guideContainer.appendChild(buttonImage);
  guideContainer.appendChild(guideImage);

  // 处理竖屏旋转
  if (isPortrait && video.classList.contains('rotated')) {
    guideLayer.classList.add('rotated');
  } else {
    guideLayer.classList.remove('rotated');
  }
}

function setButtonSizeAndPosition(btn, sizePercent, posPercent, container) {
  const containerRect = container.getBoundingClientRect();
  let targetWidth = containerRect.width * sizePercent.width;
  const img = new window.Image();
  img.src = btn.src;
  img.onload = function() {
    const imgRatio = img.width / img.height;
    let targetHeight = targetWidth / imgRatio;
    btn.style.width = targetWidth + 'px';
    btn.style.height = targetHeight + 'px';
  };
  btn.style.position = 'absolute';
  btn.style.left = (posPercent.x * 100) + '%';
  btn.style.top = (posPercent.y * 100) + '%';
  // 不再设置transform，交由CSS控制
}

// 创建CTA开始按钮
function createCTAStartButton() {
  ctaStartButtonVisible = true;
  // 清除现有的CTA按钮
  const existingCTA = ctaStartContainer.querySelector('.cta-start-button');
  if (existingCTA) {
    existingCTA.remove();
  }

  // 获取当前屏幕方向的配置
  const orientation = isPortrait ? 'portrait' : 'landscape';
  const ctaConfig = config.cta_start_button;
  if (!ctaConfig) return;

  // 创建按钮
  const ctaButton = document.createElement('img');
  ctaButton.className = 'cta-start-button';
  ctaButton.src = images[ctaConfig.buttonImage];

  // 设置尺寸和位置
  const buttonSize = ctaConfig.buttonSize[orientation];
  const buttonPosition = ctaConfig.buttonPosition[orientation];
  setButtonSizeAndPosition(ctaButton, buttonSize, buttonPosition, video);
  ctaButton.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('cta click', ctaConfig.url);
    if (window.mraid && typeof window.mraid.open === 'function') {
      window.mraid.open(ctaConfig.url);
    } else if (ctaConfig.url) {
      const win = window.open(ctaConfig.url, '_blank');
      if (!win) {
        window.location.href = ctaConfig.url;
      }
    }
  });
  ctaStartContainer.appendChild(ctaButton);
  requestAnimationFrame(() => {
    ctaButton.classList.add('visible');
  });
}

function hideCTAStartButton() {
  ctaStartButtonVisible = false;
  const existingCTA = ctaStartContainer.querySelector('.cta-start-button');
  if (existingCTA) existingCTA.remove();
}

// 创建CTA结束按钮
function createCTAEndButton() {
  ctaEndButtonVisible = true;
  hideCTAStartButton(); // 出现end按钮时自动隐藏start按钮
  const existingCTA = ctaEndContainer.querySelector('.cta-end-button');
  if (existingCTA) {
    existingCTA.remove();
  }

  // 获取当前屏幕方向的配置
  const orientation = isPortrait ? 'portrait' : 'landscape';
  const ctaConfig = config.cta_end_button;
  if (!ctaConfig) return;

  // 创建按钮
  const ctaButton = document.createElement('img');
  ctaButton.className = 'cta-end-button scale-bounce';
  ctaButton.src = images[ctaConfig.buttonImage];

  // 设置尺寸
  const buttonSize = ctaConfig.buttonSize[orientation];

  // 设置位置
  const buttonPosition = ctaConfig.buttonPosition[orientation];
  setButtonSizeAndPosition(ctaButton, buttonSize, buttonPosition, video);
  // 添加点击事件
  ctaButton.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('cta end click', ctaConfig.url);
    if (window.mraid && typeof window.mraid.open === 'function') {
      window.mraid.open(ctaConfig.url);
    } else if (ctaConfig.url) {
      const win = window.open(ctaConfig.url, '_blank');
      if (!win) {
        window.location.href = ctaConfig.url;
      }
    }
  });

  // 添加到独立容器
  ctaEndContainer.appendChild(ctaButton);

  // 延迟一帧后添加显示类名，触发动画
  requestAnimationFrame(() => {
    ctaButton.classList.add('visible');
  });
}

function hideCTAEndButton() {
  ctaEndButtonVisible = false;
  const existingCTA = ctaEndContainer.querySelector('.cta-end-button');
  if (existingCTA) existingCTA.remove();
}

// 检查交互点
function checkInteractionPoints() {
  if (video.currentTime >= config.cta_start_button.displayTime && lastTime < config.cta_start_button.displayTime) {
    createCTAStartButton();
  }
  if (video.currentTime >= config.cta_end_button.displayTime && lastTime < config.cta_end_button.displayTime) {
    createCTAEndButton();
  }
  if (!config.interactionPoints) return;

  const currentTime = video.currentTime;

  // 遍历所有交互点
  for (const point of config.interactionPoints) {
    // 如果当前时间大于等于交互点时间，并且上一次时间小于交互点时间，说明需要显示引导元素
    if (currentTime >= point.time && lastTime < point.time && currentInteractionPoint !== point) {
      currentInteractionPoint = point;
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

  video.play().then(() => {
    hasStarted = true;
    clickLayer.style.display = 'none';
    currentInteractionPoint = null;

    if (isPortrait) {
      // 先隐藏引导元素
      guideContainer.classList.add('rotating');

      setTimeout(() => {
        video.classList.add('rotated');
        guideLayer.classList.add('rotated');
        syncCTAContainersRotation();

        // 提前显示引导元素
        setTimeout(() => {
          guideContainer.classList.remove('rotating');
        }, 300); // 提前到300ms显示
      }, config.rotateTime * 1000);
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

// 播放点击特效
function playClickSparkEffect(point) {
  const orientation = isPortrait ? 'portrait' : 'landscape';
  const spark = document.createElement('img');
  spark.src = images[point.clickEffectImage];
  spark.style.position = 'absolute';
  spark.style.pointerEvents = 'none';
  spark.style.zIndex = 1;

  // 计算位置
  spark.style.width = point.clickEffectSize[orientation].width + 'px';
  spark.style.height = point.clickEffectSize[orientation].height + 'px';
  spark.style.left = point.clickEffectPosition[orientation].x * 100 + '%';
  spark.style.top = point.clickEffectPosition[orientation].y * 100 + '%';
  guideContainer.appendChild(spark);
  setTimeout(() => spark.remove(), 500);
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

// 视频结束处理
video.addEventListener('ended', () => {
  rotateHighlight.style.display = 'none';

  // 清除引导层内容
  guideContainer.innerHTML = '';
  currentInteractionPoint = null;
});

// 在指定时间点显示ctaEndButton
video.addEventListener('timeupdate', () => {
  if (
    config.cta_end_time !== undefined &&
    video.currentTime >= config.cta_end_time &&
    !ctaEndContainer.querySelector('.cta-end-button')
  ) {
    createCTAEndButton();
  }
});

// 点击事件处理，暂时未使用，因为视频播放时，会自动显示引导元素
// clickLayer.addEventListener('click', () => {
//   if (video.ended) {
//     video.currentTime = 0;
//     lastTime = 0; // 重置上一次时间
//   }
//   playVideo();
// });

// 添加直接点击屏幕播放
document.addEventListener('click', () => {
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
    // 先隐藏引导元素
    guideContainer.classList.add('rotating');

    if (isPortrait) {
      // 竖屏：添加旋转
      video.classList.add('rotated');
      guideLayer.classList.add('rotated');
      syncCTAContainersRotation();
    } else {
      // 横屏：移除旋转
      video.classList.remove('rotated');
      guideLayer.classList.remove('rotated');
      syncCTAContainersRotation();
    }

    // 等待旋转动画完成后再显示引导元素
    setTimeout(() => {
      // 如果视频已结束，显示CTA按钮
      if (video.ended) {
        createCTAEndButton(); // 确保ctaEndButton也显示
      }
      // 如果视频正在播放且有交互点，显示引导元素
      else if (hasStarted && currentInteractionPoint) {
        createGuideElements(currentInteractionPoint);
      }
      // 如果视频还未开始，显示开始提示
      else if (!hasStarted) {
        checkOrientation();
      }
      // 移除旋转中状态
      guideContainer.classList.remove('rotating');
    }, 300);
  }
  // 屏幕旋转时也保持显示cta_start_button
  // createCTAStartButton(); // 移除此行，因为cta_start_button已移至playVideo

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

function syncCTAContainersRotation() {
  if (isPortrait && video.classList.contains('rotated')) {
    ctaStartContainer.classList.add('rotated');
    ctaEndContainer.classList.add('rotated');
  } else {
    ctaStartContainer.classList.remove('rotated');
    ctaEndContainer.classList.remove('rotated');
  }
}

// 在所有video/guideLayer加/去rotated的地方同步调用
// 1. 竖屏旋转时
function rotatePortrait() {
  video.classList.add('rotated');
  guideLayer.classList.add('rotated');
  syncCTAContainersRotation();
}
function unrotatePortrait() {
  video.classList.remove('rotated');
  guideLayer.classList.remove('rotated');
  syncCTAContainersRotation();
}

function syncCTAContainerToGuide(container) {
  const guideRect = guideContainer.getBoundingClientRect();
  if (guideRect.width === 0 || guideRect.height === 0) {
    setTimeout(() => syncCTAContainerToGuide(container), 50);
    return;
  }
  container.style.position = 'fixed';
  container.style.left = guideRect.left + 'px';
  container.style.top = guideRect.top + 'px';
  container.style.width = guideRect.width + 'px';
  container.style.height = guideRect.height + 'px';
  container.style.pointerEvents = 'none'; // 只让按钮本身可点
}

function syncAllCTAContainers() {
  syncCTAContainerToGuide(ctaStartContainer);
  syncCTAContainerToGuide(ctaEndContainer);
}

window.addEventListener('resize', syncAllCTAContainers);
video.addEventListener('loadedmetadata', syncAllCTAContainers);
syncAllCTAContainers();

