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

// 状态变量
let isPortrait = window.innerHeight > window.innerWidth;
let hasStarted = false;
let currentInteractionPoint = null;
let lastTime = 0; // 记录上一次的时间

// 检查屏幕方向并显示相应提示
function checkOrientation() {
  isPortrait = window.innerHeight > window.innerWidth;

  if (!hasStarted) {
    clickLayer.style.display = 'flex';
    if (isPortrait) {
      rotateHighlight.style.display = 'block';
    } else {
      rotateHighlight.style.display = 'none';
    }
  }
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
  buttonImage.style.width = buttonSize.width + 'px';
  buttonImage.style.height = buttonSize.height + 'px';

  const buttonPosition = point.buttonPosition[orientation];
  const buttonX = buttonPosition.x * 100 + '%';
  const buttonY = buttonPosition.y * 100 + '%';
  buttonImage.style.left = buttonX;
  buttonImage.style.top = buttonY;

  // 创建引导图片
  const guideImage = document.createElement('img');
  guideImage.src = images[point.guideImage];
  guideImage.className = 'guide-image';

  // 使用对应方向的引导尺寸和位置
  const guideSize = point.guideSize[orientation];
  guideImage.style.width = guideSize.width + 'px';
  guideImage.style.height = guideSize.height + 'px';

  const guidePosition = point.guidePosition[orientation];
  const guideX = guidePosition.x * 100 + '%';
  const guideY = guidePosition.y * 100 + '%';
  guideImage.style.left = guideX;
  guideImage.style.top = guideY;

  // 添加动画
  const swipeConfig = point.swipeDirection;
  if (typeof swipeConfig === 'string' && swipeConfig === 'scale') {
    guideImage.classList.add('scale-animation');
  } else if (typeof swipeConfig === 'object' && swipeConfig.type === 'angle') {
    guideImage.classList.add('angle-animation');
    const angle = swipeConfig.value * Math.PI / 180;
    const distance = parseInt(swipeConfig.distance);
    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;
    guideImage.style.setProperty('--move-x', moveX + 'px');
    guideImage.style.setProperty('--move-y', moveY + 'px');
  }

  // 添加按钮点击事件
  buttonImage.addEventListener('click', () => {
    guideContainer.innerHTML = '';
    playVideo();
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

// 创建CTA按钮
function createCTAButton() {
  // 清除现有的CTA按钮
  const existingCTA = guideContainer.querySelector('.cta-button');
  if (existingCTA) {
    existingCTA.remove();
  }

  // 获取当前屏幕方向的配置
  const orientation = isPortrait ? 'portrait' : 'landscape';
  const ctaConfig = config.cta_button;
  
  // 创建按钮
  const ctaButton = document.createElement('img');
  ctaButton.className = 'cta-button';
  ctaButton.src = images[ctaConfig.buttonImage];
  
  // 设置尺寸
  const buttonSize = ctaConfig.buttonSize[orientation];
  ctaButton.style.width = buttonSize.width + 'px';
  ctaButton.style.height = buttonSize.height + 'px';
  
  // 设置位置
  const buttonPosition = ctaConfig.buttonPosition[orientation];
  ctaButton.style.left = buttonPosition.x * 100 + '%';
  ctaButton.style.top = buttonPosition.y * 100 + '%';
  
  // 添加点击事件
  ctaButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = config.cta_button.url;
  });
  
  // 添加到容器
  guideContainer.appendChild(ctaButton);
  
  // 延迟一帧后添加显示类名，触发动画
  requestAnimationFrame(() => {
    ctaButton.classList.add('visible');
  });
}

// 检查交互点
function checkInteractionPoints() {
  if (!config.interactionPoints) return;
  
  const currentTime = video.currentTime;
  
  // 遍历所有交互点
  for (const point of config.interactionPoints) {
    // 如果当前时间和上一次时间跨过了交互点时间，说明需要暂停
    if (currentTime >= point.time && lastTime < point.time && currentInteractionPoint !== point) {
      // 将视频时间设置到精确的交互点时间
      video.currentTime = point.time;
      video.pause();
      currentInteractionPoint = point;
      createGuideElements(point);
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
        
        // 提前显示引导元素
        setTimeout(() => {
          guideContainer.classList.remove('rotating');
        }, 300); // 提前到300ms显示
      }, 500);
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
  hasStarted = false;
  // 不显示点击重播提示
  // clickLayer.style.display = 'flex';
  // clickTip.textContent = getText('click_to_replay');
  rotateHighlight.style.display = 'none';
  
  // 清除引导层内容
  guideContainer.innerHTML = '';
  currentInteractionPoint = null;
  
  // 显示CTA按钮
  createCTAButton();
});

// 点击事件处理
clickLayer.addEventListener('click', () => {
  if (video.ended) {
    video.currentTime = 0;
    lastTime = 0; // 重置上一次时间
  }
  playVideo();
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
    } else {
      // 横屏：移除旋转
      video.classList.remove('rotated');
      guideLayer.classList.remove('rotated');
    }
    
    // 等待旋转动画完成后再显示引导元素
    setTimeout(() => {
      // 如果视频已结束，显示CTA按钮
      if (video.ended) {
        createCTAButton();
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

