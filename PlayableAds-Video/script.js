// 获取当前URL的查询参数
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// 加载配置
async function loadConfig(configPath) {
    const response = await fetch(configPath);
    return await response.json();
}

// 初始化广告
async function initPlayableAd(configPath) {
    const config = await loadConfig(configPath);
    const video = document.getElementById('game-video');
    const guideOverlay = document.getElementById('guide-overlay');
    const guideImage = document.getElementById('guide-image');
    const fingerIcon = document.querySelector('.finger-icon');
    const clickOverlay = document.getElementById('click-to-play');
    const guideTip = document.getElementById('guide-tip');
    const ctaButton = document.getElementById('cta-button');
    const container = document.querySelector('.ad-container');
    const displayMode = config.displayMode !== undefined ? config.displayMode : 'portrait';
    const topImage = document.getElementById('top-image');
    const bottomImage = document.getElementById('bottom-image');

    // 设置视频时间间隔，用于检查时间
    let interval = 0.05;
    // 获取容器尺寸
    let containerRect = container.getBoundingClientRect();
    // 滑动检测变量
    let startX, startY, isInteracting = false;
    let requiredDirection = '';
    let interactionArea = null;
    let interactionTimeout;
    // 定义结尾检测
    let checkEndTimeInterval = null;
    let lastPointIndex = config.interactionPoints.length - 1;
    let currentPointIndex = -1;
    // 定义旋转检测
    let rotateCheckInterval = null;
    // 设置视频源
    video.src = config.videoUrl;

    function isPortraitRotateMode() {
        return displayMode === 'rotate';
    }

    function hasPortraitRotate() {
        return container.getAttribute('data-rotate') === 'true'
    }

    if (isPortraitRotateMode()) {
        startCheckRotate();
    }
    // 触摸事件
    guideOverlay.addEventListener('touchstart', (e) => {
        if (handleStart(e.touches[0].clientX, e.touches[0].clientY)) {
            e.preventDefault();
        }
    }, {passive: false});

    guideOverlay.addEventListener('touchmove', (e) => {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
    }, {passive: false});

    guideOverlay.addEventListener('touchend', (e) => {
        handleScaleClick(e);
        startX = startY = undefined;
    });

    // 鼠标事件
    guideOverlay.addEventListener('mousedown', (e) => {
        if (handleStart(e.clientX, e.clientY)) {
            e.preventDefault();
        }
    });

    guideOverlay.addEventListener('mousemove', (e) => {
        if (e.buttons === 1) {
            handleMove(e.clientX, e.clientY);
            e.preventDefault();
        }
    });

    guideOverlay.addEventListener('mouseup', (e) => {
        handleScaleClick(e);
        startX = startY = undefined;
    });

    // CTA按钮点击
    ctaButton.addEventListener('click', function () {
        window.location.href = config.cat_button.url;
    });

    // 判断操作是否在有一定角度旋转的矩形区域内
    function isPointInRotatedRect(point, rect, angle) {
        containerRect = container.getBoundingClientRect(); // 确保获取最新的容器尺寸
        let rectCenterX, rectCenterY, rectWidth, rectHeight;

        if (hasPortraitRotate()) {
            // 竖屏旋转模式
            // 中心点坐标：rect.x 和 rect.y 是相对于原始视频/容器的百分比
            // 竖屏时，容器的宽变成了高，高变成了宽
            rectCenterX = (1-rect.y-rect.height) * containerRect.width + (rect.height * containerRect.width) / 2;
            rectCenterY = rect.x * containerRect.height + (rect.width * containerRect.height) / 2;
            rectHeight = rect.width * containerRect.height;
            rectWidth = rect.height * containerRect.width;
        } else {
            rectCenterX = rect.x * containerRect.width + (rect.width * containerRect.width) / 2;
            rectCenterY = rect.y * containerRect.height + (rect.height * containerRect.height) / 2;
            rectWidth = rect.width * containerRect.width;
            rectHeight = rect.height * containerRect.height;
        }

        const rad = -angle * Math.PI / 180; // 角度转弧度，反向旋转
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // 将触摸点坐标转换到以矩形中心为原点的坐标系
        const translatedX = point.x - rectCenterX;
        const translatedY = point.y - rectCenterY;

        // 对转换后的触摸点进行反向旋转
        const rotatedX = translatedX * cos - translatedY * sin;
        const rotatedY = translatedX * sin + translatedY * cos;

        // 检查旋转后的点是否在未旋转的矩形内（中心点为0,0）
        return Math.abs(rotatedX) <= rectWidth / 2 && Math.abs(rotatedY) <= rectHeight / 2;
    }

    // 判断操作是否在区域内
    function isInInteractionArea(clientX, clientY) {
        if (!interactionArea) return true;

        let x, y;
        // 获取最新的容器尺寸，因为屏幕可能旋转
        containerRect = container.getBoundingClientRect();
        x = clientX - containerRect.left;
        y = clientY - containerRect.top;

        // 对于旋转区域的判断逻辑
        if (requiredDirection && requiredDirection.type === 'angle') {
            return isPointInRotatedRect({x, y}, interactionArea, requiredDirection.value);
        }

        // 对于非旋转区域的判断逻辑 (这部分也需要确保坐标系正确)
        let areaLeft, areaRight, areaTop, areaBottom;
        if (hasPortraitRotate()) {
          areaLeft = (1-interactionArea.y-interactionArea.height) * containerRect.width;
          areaRight = areaLeft + interactionArea.height * containerRect.width;
          areaTop = interactionArea.x * containerRect.height; // y轴对应的是横屏时的宽度
          areaBottom = areaTop + interactionArea.width * containerRect.height;
        } else {
          areaLeft = interactionArea.x * containerRect.width;
          areaRight = areaLeft + interactionArea.width * containerRect.width;
          areaTop = interactionArea.y * containerRect.height;
          areaBottom = areaTop + interactionArea.height * containerRect.height;
        }

        return x >= areaLeft && x <= areaRight && y >= areaTop && y <= areaBottom;
    }

    // 事件处理开始函数，判断是否在区域内
    function handleStart(clientX, clientY) {
        if (!isInteracting || !isInInteractionArea(clientX, clientY)) return false;
        startX = clientX;
        startY = clientY;
        return true;
    }

    // 处理区域滑动事件，正数为顺时针，负数为逆时针
    function handleMove(clientX, clientY) {
        if (!isInteracting || startX === undefined) return;

        const dx = clientX - startX;
        const dy = clientY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // 检查滑动方向匹配
        let isDirectionMatch = false;

        if (typeof requiredDirection === 'string') {
            // 原有方向判断逻辑
            let actualDirection = '';
            if (Math.abs(dx) > Math.abs(dy)) {
                actualDirection = dx > 0 ? 'right' : 'left';
            } else {
                actualDirection = dy > 0 ? 'down' : 'up';
            }
            isDirectionMatch = actualDirection === requiredDirection;
        } else if (requiredDirection.type === 'angle') {
            // 角度判断逻辑
            let angle = Math.atan2(dy, dx) * 180 / Math.PI;
            const targetAngle = requiredDirection.value;
            // 允许±30度的误差范围
            // 旋转时，角度需要转换, 以竖屏为标准
            if (hasPortraitRotate()) {
              angle = angle - 90;
            }
            isDirectionMatch = Math.abs(((angle - targetAngle + 180) % 360) - 180) <= 30;
        }

        // 检查距离阈值(至少滑动20px)
        if (isDirectionMatch && distance > 20) {
            clearTimeout(interactionTimeout);
            guideOverlay.style.display = 'none';
            if (guideTip) guideTip.style.display = 'none';
            video.play();
            isInteracting = false;
            // 如果是最后一个交互点，启动结尾检测
            if (currentPointIndex === lastPointIndex && typeof startCheckEndTime === 'function') {
                startCheckEndTime();
            }
        }
    }

    // 处理区域点击事件
    function handleScaleClick(e) {
        if (requiredDirection === 'scale' && startX !== undefined) {
            // 获取坐标点，兼容触摸和鼠标事件
            let clientX, clientY;
            if (e.changedTouches) {
                // 触摸事件
                const touch = e.changedTouches[0];
                clientX = touch.clientX;
                clientY = touch.clientY;
            } else {
                // 鼠标事件
                clientX = e.clientX;
                clientY = e.clientY;
            }

            // 计算移动距离
            const distance = Math.sqrt(Math.pow(clientX - startX, 2) + Math.pow(clientY - startY, 2));

            // 移动距离小于5px视为点击，对所有类型的交互都允许点击完成
            if (distance < 5) {
                clearTimeout(interactionTimeout);
                guideOverlay.style.display = 'none';
                if (guideTip) guideTip.style.display = 'none';
                video.play();
                isInteracting = false;
                // 如果是最后一个交互点，启动结尾检测
                if (currentPointIndex === lastPointIndex && typeof startCheckEndTime === 'function') {
                    startCheckEndTime();
                }
            }
        }
    }

    function startCheckRotate() {
        if (rotateCheckInterval) return;
        const checkRotate = () => {
            if (video.currentTime >= config.rotateConfig.time - interval &&
                video.currentTime < config.rotateConfig.time + interval) {
                clearInterval(rotateCheckInterval);
                container.setAttribute('data-rotate', isPortraitRotateMode());
                removeBanners();
            }
        }
        rotateCheckInterval = setInterval(checkRotate, 50);
    }

    // 启动结尾检测的函数
    function startCheckEndTime() {
        if (checkEndTimeInterval) return;
        const checkEndTime = () => {
            if (video.currentTime >= config.completionTime - interval &&
                video.currentTime < config.completionTime + interval) {
                clearInterval(checkEndTimeInterval);
                ctaButton.style.left = config.cat_button.x * 100 + '%';
                ctaButton.style.top = config.cat_button.y * 100 + '%';
                ctaButton.style.width = config.cat_button.width * 100 + '%';
                ctaButton.style.height = config.cat_button.height * 100 + '%';
                ctaButton.style.display = 'block';
            }
        }
        checkEndTimeInterval = setInterval(checkEndTime, 50);
    }

    // 绘制交互区域（调试用）
    function drawInteractionArea() {
        // 移除旧的调试区域
        const oldDebug = document.getElementById('debug-interaction-area');
        if (oldDebug) oldDebug.remove();

        if (!interactionArea) return;

        const debugArea = document.createElement('div');
        debugArea.id = 'debug-interaction-area';
        debugArea.style.position = 'absolute';
        debugArea.style.left = `${interactionArea.x * 100}%`;
        debugArea.style.top = `${interactionArea.y * 100}%`;
        debugArea.style.width = `${interactionArea.width * 100}%`;
        debugArea.style.height = `${interactionArea.height * 100}%`;
        debugArea.style.border = '2px dashed rgba(255, 0, 0, 0.5)';
        debugArea.style.pointerEvents = 'none';
        debugArea.style.zIndex = '30';

        // 计算旋转角度（如果有）
        const angle = requiredDirection && requiredDirection.type === 'angle'
            ? requiredDirection.value
            : 0;
        debugArea.style.transform = `rotate(${angle}deg)`;
        container.appendChild(debugArea);
    }

    function handleRotation(rotationAngle) {
        if(!topImage || !bottomImage) {
            return;
        }
        if (rotationAngle === 90 || rotationAngle === 270) {
            // 旋转时隐藏图片
            topImage.style.display = 'none';
            bottomImage.style.display = 'none';
        } else {
            // 恢复显示
            topImage.style.display = 'block';
            bottomImage.style.display = 'block';
        }
    }

    function removeBanners() {
        if(!topImage || !bottomImage) {
            return;
        }
        topImage.remove();
        bottomImage.remove();
    }

    function playVideo() {
        video.play().then(() => {
            video.muted = false;   // 取消静音
            video.play();          // 再播放
            clickOverlay.style.display = 'none';
            // 设置交互点监听
            config.interactionPoints.forEach((point, index) => {
                let checkTimeInterval = null;
                const checkTime = () => {
                    if (video.currentTime >= point.time - interval &&
                        video.currentTime < point.time + interval &&
                        !isInteracting) {
                        clearInterval(checkTimeInterval);

                        video.pause();

                        // 设置引导内容
                        guideImage.src = point.guideImage;
                        guideImage.style.width = `${point.guideSize.width}px`;
                        guideImage.style.height = `${point.guideSize.height}px`;
                        fingerIcon.style.left = `${point.guidePosition.x * 100}%`;
                        fingerIcon.style.top = `${point.guidePosition.y * 100}%`;

                        // 确保手指图标在视口内
                        const maxX = 0.9; // 防止图标滑出右侧
                        const maxY = 0.9; // 防止图标滑出底部
                        const posX = Math.min(point.guidePosition.x, maxX);
                        const posY = Math.min(point.guidePosition.y, maxY);
                        fingerIcon.style.left = `${posX * 100}%`;
                        fingerIcon.style.top = `${posY * 100}%`;

                        // 设置动画方向
                        fingerIcon.style.animation = 'none'; // 先清除现有动画
                        setTimeout(() => { // 确保动画重置生效
                            if (typeof point.swipeDirection === 'string') {
                                if (point.swipeDirection === 'right') {
                                    fingerIcon.style.animation = 'swipeRight 1.5s infinite';
                                } else if (point.swipeDirection === 'up') {
                                    fingerIcon.style.animation = 'swipeUp 1.5s infinite';
                                } else if (point.swipeDirection === 'scale') {
                                    fingerIcon.style.animation = 'pulseScale 1s infinite ease-in-out';
                                }
                            } else if (point.swipeDirection.type === 'angle') {
                                fingerIcon.style.setProperty('--swipe-angle', `${point.swipeDirection.value}deg`);
                                fingerIcon.style.setProperty('--swipe-distance', `${point.swipeDirection.distance}px`);
                                fingerIcon.style.animation = 'swipeVarAngle 1.5s infinite ease-in-out';
                            }
                        }, 10);

                        // 设置交互区域
                        interactionArea = point.interactionArea;
                        requiredDirection = point.swipeDirection;
                        // 设置guideTip内容和位置
                        if (guideTip) {
                            guideTip.style.display = 'block';
                            guideTip.textContent = point.guideTip;
                            if (point.guideTipPosition) {
                                guideTip.style.position = 'absolute';
                                guideTip.style.left = (point.guideTipPosition.x * 100) + '%';
                                guideTip.style.top = (point.guideTipPosition.y * 100) + '%';
                                guideTip.style.fontSize = point.guideTipFont.size + 'em';
                                guideTip.style.color = point.guideTipFont.color;
                                guideTip.style.transform = 'translate(-50%, 0)';
                            } else {
                                guideTip.style.position = '';
                                guideTip.style.left = '';
                                guideTip.style.top = '';
                                guideTip.style.transform = '';
                            }
                        }

                        // 显示交互区域（调试用，正式发布时可移除）
                        // drawInteractionArea();

                        guideOverlay.style.display = 'flex';
                        if (guideTip) guideTip.style.display = 'block';
                        isInteracting = true;
                        currentPointIndex = index;

                        // 设置超时自动继续
                        // interactionTimeout = setTimeout(() => {
                        //   guideOverlay.style.display = 'none';
                        //   video.play();
                        //   isInteracting = false;
                        //    // 如果是最后一个交互点，启动结尾检测
                        //   if (currentPointIndex === lastPointIndex && typeof startCheckEndTime === 'function') {
                        //     startCheckEndTime();
                        //   }
                        // }, point.duration * 1000);
                    }
                };
                // 用 setInterval 替代 timeupdate 事件
                checkTimeInterval = setInterval(checkTime, 50); // 50ms 检查一次
            });
        }).catch(error => {
            console.error('播放失败:', error);
        });
    }

    clickOverlay.addEventListener('click', playVideo);

    if(config.banner) {
        const topImgElement = document.createElement('img');
        topImgElement.src = config.banner.topBanner;
        topImgElement.alt = 'Top Banner';
        topImage.appendChild(topImgElement);
        const bottomImgElement = document.createElement('img');
        bottomImgElement.src = config.banner.bottomBanner;
        bottomImgElement.alt = 'Bottom Banner';
        bottomImage.appendChild(bottomImgElement);
    }

    window.addEventListener('orientationchange', () => {
        handleRotation(screen.orientation.angle);
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', function () {
    initPlayableAd('config/' + getQueryParam('config'));
});

