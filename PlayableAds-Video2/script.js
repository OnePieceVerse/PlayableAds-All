const config = window.PLAYABLE_CONFIG;
if (config.title) document.title = config.title;
const images = window.PLAYABLE_IMAGES;

// 检查视频格式并获取URL
let videoUrl = config.videoUrl;
const videoExt = videoUrl.split('.').pop().toLowerCase();
if (videoExt === 'mov') {
  // 如果是MOV格式，使用转换后的MP4文件名
  videoUrl = videoUrl.replace(/\.mov$/, '.mp4');
}
const base64Video = window.PLAYABLE_VIDEOS[videoUrl];

if (!base64Video) {
  console.error('视频文件未找到:', videoUrl);
  // 显示错误信息给用户
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:white;background:rgba(0,0,0,0.8);padding:20px;border-radius:10px;text-align:center;';
  errorDiv.textContent = '视频加载失败，请检查文件格式或重试';
  document.body.appendChild(errorDiv);
}

// DOM元素
const canvas = document.getElementById('ad-canvas');
const ctx = canvas.getContext('2d');
const playPauseBtn = document.getElementById('playPauseBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');

// 状态变量
let playing = false;
let rafId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
}

// 创建隐藏video
const video = document.createElement('video');
video.src = base64Video;
video.crossOrigin = 'anonymous';
video.playsInline = true;
video.muted = true;
video.style.display = 'none';
document.body.appendChild(video);

// 视频错误处理
video.addEventListener('error', (e) => {
  console.error('视频加载错误:', e.target.error);
  let errorMessage = '视频加载失败: ';
  switch (e.target.error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      errorMessage += '加载被中断';
      break;
    case MediaError.MEDIA_ERR_NETWORK:
      errorMessage += '网络错误';
      break;
    case MediaError.MEDIA_ERR_DECODE:
      errorMessage += '解码失败';
      break;
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      errorMessage += '视频格式不支持';
      break;
    default:
      errorMessage += '未知错误';
  }
  
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:white;background:rgba(0,0,0,0.8);padding:20px;border-radius:10px;text-align:center;';
  errorDiv.textContent = errorMessage;
  document.body.appendChild(errorDiv);
});

function drawFrame() {
  if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
    resizeCanvas();
  }
  
  const isPortrait = window.innerHeight > window.innerWidth;
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (vw && vh) {
    if (isPortrait) {
      // 竖屏：旋转+cover
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      // 目标宽高互换
      const targetW = canvas.height;
      const targetH = canvas.width;
      const scale = Math.max(targetW / vw, targetH / vh);
      const drawW = vw * scale;
      const drawH = vh * scale;
      ctx.drawImage(
        video,
        -drawW / 2,
        -drawH / 2,
        drawW,
        drawH
      );
    } else {
      // 横屏：正常cover
      const targetW = canvas.width;
      const targetH = canvas.height;
      const scale = Math.max(targetW / vw, targetH / vh);
      const drawW = vw * scale;
      const drawH = vh * scale;
      ctx.drawImage(
        video,
        (canvas.width - drawW) / 2,
        (canvas.height - drawH) / 2,
        drawW,
        drawH
      );
    }
  }
  ctx.restore();
  
  if (playing && !video.paused && !video.ended) {
    rafId = requestAnimationFrame(drawFrame);
  }
}

function playVideo() {
  video.play().then(() => {
    playing = true;
    playPauseBtn.textContent = '暂停';
    drawFrame();
  }).catch(error => {
    console.error('播放失败:', error);
  });
}

function pauseVideo() {
  video.pause();
  playing = false;
  playPauseBtn.textContent = '播放';
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function resetVideo() {
  video.currentTime = 0;
  if (!playing) {
    playVideo();
  }
}

// 事件监听
playPauseBtn.addEventListener('click', () => {
  if (video.paused) {
    playVideo();
  } else {
    pauseVideo();
  }
});

tryAgainBtn.addEventListener('click', resetVideo);

// 屏幕旋转时重新计算尺寸
window.addEventListener('resize', () => {
  resizeCanvas();
  drawFrame();
});

// 视频加载完成后自动播放
video.addEventListener('canplay', playVideo);

// 视频结束时重置按钮状态
video.addEventListener('ended', () => {
  pauseVideo();
  playPauseBtn.textContent = '重新播放';
});

// 初始化
resizeCanvas();

