const config = window.PLAYABLE_CONFIG;
const images = window.PLAYABLE_IMAGES;
const videos = window.PLAYABLE_VIDEOS;
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
const videoSource = videos ? videos[videoUrl] : videoUrl;
const videoType = config.type;

// DOM元素
const video = document.getElementById('ad-video');
const videoContainer = document.querySelector('.video-container');
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

// 创建引导元素
function createGuideElements(point) {
  // 获取当前屏幕方向的配置
  const orientation = isPortrait ? 'portrait' : 'landscape';

  // 清除现有引导元素，但保留CTA按钮
  const existingGuides = guideLayer.querySelectorAll('.button-image, .guide-image');
  existingGuides.forEach(el => el.remove());

  // 创建按钮
  const buttonImage = document.createElement('img');
  buttonImage.src = images ? images[point.buttonImage] : point.buttonImage;
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
    // 只移除引导元素，保留CTA按钮
    const guides = guideLayer.querySelectorAll('.button-image, .guide-image');
    guides.forEach(el => el.remove());
    if (video.currentTime < point.time + point.duration) {
      console.log('button click video.currentTime', video.currentTime, point.time, point.duration);
      video.currentTime = point.time + point.duration;
    }
    // 确保取消静音
    video.muted = false;
    playVideo();
  });

  // 创建引导图片
  const guideImage = document.createElement('img');
  guideImage.src = images ? images[point.guideImage] || point.guideImage : point.guideImage;
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
  handleVideoRotation();
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
  ctaButton.src = images ? images[ctaConfig.buttonImage] : ctaConfig.buttonImage;

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
    ctaClick();
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
  ctaButton.src = images ? images[ctaConfig.buttonImage] : ctaConfig.buttonImage;

  // 设置尺寸和位置
  const buttonSize = ctaConfig.buttonSize[orientation];
  const buttonPosition = ctaConfig.buttonPosition[orientation];
  setButtonSizeAndPosition(ctaButton, buttonSize, buttonPosition);

  ctaButton.addEventListener('click', (e) => {
    e.preventDefault();
    ctaClick();
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

function ctaClick() {
  window.location.href = config.cta_start_button.url;
}

// 修改现有的setButtonSizeAndPosition函数
function setButtonSizeAndPosition(btn, sizePercent, posPercent) {
  // 获取视频的实际尺寸和内容区域
  const videoEl = video;
  const videoNaturalWidth = videoEl.videoWidth;
  const videoNaturalHeight = videoEl.videoHeight;
  
  if (!videoNaturalWidth || !videoNaturalHeight) {
    // 视频尺寸还未加载，下一帧再试
    requestAnimationFrame(() => setButtonSizeAndPosition(btn, sizePercent, posPercent));
    return;
  }
  
  // 获取视频元素的当前显示尺寸
  const videoRect = videoEl.getBoundingClientRect();
  
  // 计算视频内容区域的实际尺寸（考虑letterbox/pillarbox）
  let contentWidth = videoRect.width;
  let contentHeight = videoRect.height;
  
  // 计算视频的原始宽高比
  const videoRatio = videoNaturalWidth / videoNaturalHeight;
  
  // 计算当前视频元素的宽高比
  const elementRatio = videoRect.width / videoRect.height;
  
  // 根据宽高比差异计算实际内容区域
  if (elementRatio > videoRatio) {
    // 视频元素比原始视频更宽，有letterbox
    contentWidth = videoRect.height * videoRatio;
    // 计算内容区域的左边界偏移
    const contentLeft = (videoRect.width - contentWidth) / 2;
    
    // 计算按钮尺寸基于视频内容的实际尺寸
    let targetWidth = contentWidth * sizePercent.width;
    const img = new window.Image();
    img.src = btn.src;
    img.onload = function () {
      const imgRatio = img.width / img.height;
      let targetHeight = targetWidth / imgRatio;
      btn.style.width = targetWidth + 'px';
      btn.style.height = targetHeight + 'px';
      
      // 图片加载好后设置位置，考虑内容区域的偏移
      const leftPos = contentLeft + contentWidth * posPercent.x;
      const leftPercentage = (leftPos / videoRect.width) * 100;
      btn.style.left = leftPercentage + '%';
      btn.style.top = (posPercent.y * 100) + '%';
      btn.style.transform = 'translate(-50%, -50%)';
      btn.classList.add('visible');
    };
  } else {
    // 视频元素比原始视频更高，有pillarbox
    contentHeight = videoRect.width / videoRatio;
    // 计算内容区域的顶部边界偏移
    const contentTop = (videoRect.height - contentHeight) / 2;
    
    // 计算按钮尺寸基于视频内容的实际尺寸
    let targetWidth = contentWidth * sizePercent.width;
    const img = new window.Image();
    img.src = btn.src;
    img.onload = function () {
      const imgRatio = img.width / img.height;
      let targetHeight = targetWidth / imgRatio;
      btn.style.width = targetWidth + 'px';
      btn.style.height = targetHeight + 'px';
      
      // 图片加载好后设置位置，考虑内容区域的偏移
      const topPos = contentTop + contentHeight * posPercent.y;
      const topPercentage = (topPos / videoRect.height) * 100;
      btn.style.left = (posPercent.x * 100) + '%';
      btn.style.top = topPercentage + '%';
      btn.style.transform = 'translate(-50%, -50%)';
      btn.classList.add('visible');
    };
  }
}

// 处理视频旋转时，同步旋转video-container
function handleVideoRotation() {
  if (isPortrait && isLandscapeVideo()) {
    video.classList.add('rotated');
    videoContainer.classList.add('rotated');
    guideLayer.classList.add('rotated');
    
    // 在旋转时调整视频容器尺寸
    if (video.videoWidth && video.videoHeight) {
      // 横屏视频在竖屏设备上，需要交换宽高比
      const videoRatio = video.videoHeight / video.videoWidth; // 反转比例
      videoContainer.style.width = 'auto';
      videoContainer.style.height = '100%';
      // 确保旋转后的视频容器不会超出屏幕
      const maxWidth = window.innerHeight * videoRatio;
      videoContainer.style.maxWidth = maxWidth + 'px';
    }
  } else {
    video.classList.remove('rotated');
    videoContainer.classList.remove('rotated');
    guideLayer.classList.remove('rotated');
    
    // 恢复正常尺寸
    updateVideoContainerSize();
  }
}

// 确保在屏幕方向变化时更新旋转状态
function checkOrientation() {
  const wasPortrait = isPortrait;
  isPortrait = window.innerHeight > window.innerWidth;
  
  // 处理视频旋转
  handleVideoRotation();

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
}

// 更新视频容器尺寸以匹配视频的实际比例
function updateVideoContainerSize() {
  if (!video.videoWidth || !video.videoHeight) return;
  
  const videoRatio = video.videoWidth / video.videoHeight;
  const isPortraitVideo = video.videoHeight > video.videoWidth;
  
  // 获取可用空间
  const containerWidth = window.innerWidth;
  const containerHeight = window.innerHeight;
  const containerRatio = containerWidth / containerHeight;
  
  // 根据视频和容器的比例关系调整video-container尺寸
  if (isPortrait) {
    // 竖屏设备
    if (isPortraitVideo) {
      // 竖屏视频在竖屏设备上
      videoContainer.style.width = '100%';
      videoContainer.style.height = 'auto';
    } else {
      // 横屏视频在竖屏设备上 - 需要旋转
      if (isLandscapeVideo()) {
        videoContainer.style.width = 'auto';
        videoContainer.style.height = '100%';
      }
    }
  } else {
    // 横屏设备
    if (isPortraitVideo) {
      // 竖屏视频在横屏设备上
      videoContainer.style.width = 'auto';
      videoContainer.style.height = '100%';
    } else {
      // 横屏视频在横屏设备上
      videoContainer.style.width = '100%';
      videoContainer.style.height = 'auto';
    }
  }
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
  startImage.src = images ? images[startConfig.image] : startConfig.image;
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
      // video.currentTime = point.time;
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

// 初始化视频
function initVideo() {
  // 设置视频源
  video.src = videoSource;
  
  // 设置视频属性
  video.playsInline = true;
  // 只有在首次加载时才设置为静音，便于自动播放
  video.muted = true; // 初始静音以符合大多数浏览器的自动播放政策
  video.loop = false;
  video.autoplay = false;
  
  // 设置视频音量
  if (config.volume !== undefined) {
    video.volume = config.volume;
  }
  
  // 视频加载完成后，更新视频容器尺寸
  video.addEventListener('loadedmetadata', function() {
    // 设置视频比例变量
    const videoRatio = video.videoWidth / video.videoHeight;
    document.documentElement.style.setProperty('--video-ratio', videoRatio);
    document.documentElement.style.setProperty('--video-ratio-inverse', 1 / videoRatio);
    
    // 调整video-container尺寸以匹配视频的实际比例
    updateVideoContainerSize();
    
    // 处理视频旋转
    handleVideoRotation();
  });
}

// 播放控制
function playVideo() {
  lastTime = video.currentTime;
  // 设置音量并取消静音
  video.volume = config.volume;
  video.muted = false; // 取消静音状态
  
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
    // 如果播放失败，可能是由于浏览器政策限制，尝试静音播放
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

// 视频时间更新事件
video.addEventListener('timeupdate', checkInteractionPoints);

// 添加窗口大小变化事件监听器
window.addEventListener('resize', function() {
  checkOrientation();
  updateVideoContainerSize();
});

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

// 添加直接点击屏幕播放
document.addEventListener('click', () => {
  // 检查配置是否启用第一次点击屏幕事件
  const enableFirstClick = config.enableFirstClick !== false; // 默认为true
  
  if (!hasStarted && enableFirstClick) {
    // 移除引导元素
    const guides = guideLayer.querySelectorAll('.button-image, .guide-image');
    guides.forEach(el => el.remove());
    // 确保取消静音
    video.muted = false;
    playVideo();
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
updatePageText();
initVideo();

// apple设备上需要主动调用一次，否则无法触发timeupdate事件
checkInteractionPoints();