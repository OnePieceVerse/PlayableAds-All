// 页面状态管理
let currentPage = 'home';

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    showHome();
    initializeLanguageSelector();
    initializeAnimations();
});

// 显示首页
function showHome() {
    hideAllSections();
    document.getElementById('home').style.display = 'block';
    currentPage = 'home';
    updateActiveNavigation();
}

// 显示作品页面
function showWorks() {
    hideAllSections();
    document.getElementById('works').style.display = 'block';
    currentPage = 'works';
    updateActiveNavigation();
    animateWorksCards();
}

// 显示学习页面
function showLearning() {
    hideAllSections();
    document.getElementById('learning').style.display = 'block';
    currentPage = 'learning';
    updateActiveNavigation();
    animateLearningCards();
}

// 显示互动游戏制作页面
function showInteractiveGames() {
    hideAllSections();
    document.getElementById('interactive-games').style.display = 'block';
    currentPage = 'interactive-games';
    updateActiveNavigation();
    animateProductCards();
}

// 显示互动视频制作页面
function showInteractiveVideos() {
    hideAllSections();
    document.getElementById('interactive-videos').style.display = 'block';
    currentPage = 'interactive-videos';
    updateActiveNavigation();
    animateProductCards();
}

// 显示互动图片制作页面
function showInteractiveImages() {
    hideAllSections();
    document.getElementById('interactive-images').style.display = 'block';
    currentPage = 'interactive-images';
    updateActiveNavigation();
    animateProductCards();
}

// 显示开发中页面
function showComingSoon(productName) {
    hideAllSections();
    document.getElementById('coming-soon').style.display = 'block';
    const currentLang = document.getElementById('languageSelect').value;
    const translations = getTranslations();
    document.getElementById('coming-soon-title').textContent = productName + ' - ' + (currentLang === 'zh' ? '开发中...' : 'Coming Soon...');
    currentPage = 'coming-soon';
    updateActiveNavigation();
}

// 隐藏所有页面
function hideAllSections() {
    const sections = ['home', 'works', 'learning', 'interactive-games', 'interactive-videos', 'interactive-images', 'coming-soon'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.style.display = 'none';
        }
    });
}

// 标签页切换功能
function showTab(tabName) {
    // 隐藏所有标签内容
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // 移除所有标签按钮的活跃状态
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // 显示选中的标签内容
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // 激活选中的标签按钮
    const selectedButton = event.target;
    selectedButton.classList.add('active');

    // 重新应用卡片动画
    setTimeout(() => {
        animateWorksCards();
    }, 100);
}

// 更新导航栏活跃状态
function updateActiveNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
}

// 初始化语言选择器
function initializeLanguageSelector() {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            const selectedLanguage = this.value;
            switchLanguage(selectedLanguage);
        });
    }
}

// 获取翻译文本
function getTranslations() {
    return {
        'zh': {
            // 导航栏
            'works': '作品 (demo)',
            'products': '产品 (开发中)',
            'learning': '学习',
            'login': '登录',
            'gamesMaker': '互动游戏制作',
            'videoMaker': '互动视频制作',
            'imageMaker': '互动图片制作',
            'creativeMaker': '互动创意推荐',
            
            // Hero区域
            'heroTitle': '创造无限可能的互动体验',
            'heroDescription': 'PLAYABLE ALL 是一个全方位的互动内容创作平台，帮助您轻松制作互动游戏、视频、图片和创意内容',
            'heroGameTitle': '互动游戏',
            'heroGameDesc': '轻松创建引人入胜的互动游戏体验',
            'heroVideoTitle': '互动视频',
            'heroVideoDesc': '制作具有交互元素的动态视频内容',
            'heroImageTitle': '互动图片',
            'heroImageDesc': '创建可点击、可交互的图片体验',
            'heroCreativeTitle': '互动创意',
            'heroCreativeDesc': '获得AI驱动的创意推荐和灵感',
            
            // 作品页面
            'worksTitle': '我们的作品',
            'gamesTab': '互动游戏',
            'videosTab': '互动视频',
            'imagesTab': '互动图片',
            'creativeTab': '互动创意',
            
            // 学习页面
            'learningTitle': '学习',
            'tutorialsTitle': '教程指南',
            'tutorialsDesc': '从基础到高级的完整制作教程',
            'casesTitle': '案例研究',
            'casesDesc': '优秀作品案例分析和制作心得',
            'communityTitle': '社区交流',
            'communityDesc': '与其他创作者分享经验和灵感',
            'certificateTitle': '认证课程',
            'certificateDesc': '获得官方认证的专业课程',
            'learnMore': '了解更多',
            
            // 互动游戏制作页面
            'gamesMakerTitle': '互动游戏制作',
            'gamesMakerDesc': '创建引人入胜的互动游戏体验，无需编程知识。我们的直观界面让您能够快速原型设计、测试和发布您的游戏创意。',
            'easyToUseTitle': '易于使用的界面',
            'easyToUseDesc': '拖拽式设计，无需编程经验',
            'fastIterationTitle': '快速迭代测试',
            'fastIterationDesc': '实时预览和A/B测试功能',
            'highPerformanceTitle': '高性能表现',
            'highPerformanceDesc': '优化的引擎确保流畅体验',
            'crossPlatformTitle': '跨平台发布',
            'crossPlatformDesc': '支持所有主要广告网络',
            'whatCanYouDoTitle': '您能做什么？',
            'levelEditorTitle': '关卡编辑器',
            'levelEditorDesc': '设计复杂的游戏关卡',
            'visualsTitle': '视觉效果',
            'visualsDesc': '丰富的视觉和动画效果',
            'cameraTitle': '摄像机控制',
            'cameraDesc': '灵活的摄像机角度设置',
            'mockupTitle': '设备模拟',
            'mockupDesc': '在不同设备上预览效果',
            'textsTitle': '文本编辑',
            'textsDesc': '自定义文本和字体样式',
            'graphicsTitle': '图形编辑',
            'graphicsDesc': '内置图形编辑工具',
            'benefitsTitle': '为什么选择我们的互动游戏制作工具？',
            'noCodingTitle': '无需编程知识',
            'noCodingDesc': '简单、快速、易于使用的界面',
            'highEngagementTitle': '高参与度',
            'highEngagementDesc': '互动游戏广告具有更强的IPM和ROAS表现',
            'unlimitedVersionsTitle': '无限版本',
            'unlimitedVersionsDesc': '创建无限数量的游戏版本',
            'allNetworksTitle': '全网络支持',
            'allNetworksDesc': '支持在所有主要广告网络发布',
            
            // 互动视频制作页面
            'videoMakerTitle': '互动视频制作',
            'videoMakerDesc': '创建具有交互元素的动态视频内容，提供沉浸式观看体验。支持多种交互形式，让观众成为故事的参与者。',
            'flexibleFormatTitle': '灵活格式',
            'flexibleFormatDesc': '支持多种视频格式和分辨率',
            'interactiveElementsTitle': '交互元素',
            'interactiveElementsDesc': '热点、选择分支、表单等丰富交互',
            'analyticsTitle': '深度分析',
            'analyticsDesc': '详细的观看和交互数据分析',
            'instantDeployTitle': '即时部署',
            'instantDeployDesc': '一键发布到各大平台',
            'useCasesTitle': '应用场景',
            'interactiveMovieTitle': '互动电影',
            'interactiveMovieDesc': '观众可以选择剧情走向的电影体验',
            'educationalVideoTitle': '教育视频',
            'educationalVideoDesc': '互动式学习内容提高参与度',
            'productShowcaseTitle': '产品展示',
            'productShowcaseDesc': '360度产品展示和交互演示',
            'corporateTrainingTitle': '企业培训',
            'corporateTrainingDesc': '互动式培训视频提升效果',
            
            // 互动图片制作页面
            'imageMakerTitle': '互动图片制作',
            'imageMakerDesc': '将静态图片转化为引人入胜的互动体验。通过热点、动画和交互元素，让每张图片都能讲述独特的故事。',
            'smartHotspotsTitle': '智能热点',
            'smartHotspotsDesc': '自动识别图片重要区域',
            'animationEffectsTitle': '动画效果',
            'animationEffectsDesc': '丰富的过渡和动画效果',
            'responsiveDesignTitle': '响应式设计',
            'responsiveDesignDesc': '自适应各种屏幕尺寸',
            'advancedEditingTitle': '高级编辑',
            'advancedEditingDesc': '专业级图片编辑工具',
            'interactiveFeaturesTitle': '交互功能',
            'clickableHotspotsTitle': '可点击热点',
            'clickableHotspotsDesc': '在图片任意位置添加可点击区域，触发弹窗、链接或其他交互',
            'zoomPanTitle': '缩放平移',
            'zoomPanDesc': '支持图片缩放和平移，让用户探索图片的每个细节',
            'smartTagsTitle': '智能标签',
            'smartTagsDesc': 'AI驱动的内容标签，自动识别和标注图片内容',
            'heatmapAnalyticsTitle': '热力图分析',
            'heatmapAnalyticsDesc': '查看用户在图片上的点击热力图，优化交互设计',
            'applicationsTitle': '应用领域',
            'ecommerceTitle': '电商展示',
            'ecommerceDesc': '产品详情互动展示',
            'realEstateTitle': '房地产',
            'realEstateDesc': '虚拟看房体验',
            'educationTitle': '教育培训',
            'educationDesc': '互动式教学内容',
            'artGalleryTitle': '艺术展览',
            'artGalleryDesc': '在线艺术品展示',
            'manufacturingTitle': '制造业',
            'manufacturingDesc': '设备操作指南',
            'eventsTitle': '活动展示',
            'eventsDesc': '活动现场互动',
            
            // 通用按钮
            'requestDemo': '申请演示',
            'tryNow': '立即体验',
            
            // 开发中页面
            'comingSoonTitle': '功能开发中...',
            'comingSoonDesc': '我们正在努力开发这个功能，敬请期待！',
            'comingSoonNotify': '想第一时间了解产品上线信息？',
            'feature1': '直观易用的设计界面',
            'feature2': '强大的互动功能',
            'feature3': '跨平台兼容性',
            'feature4': '即将推出更多功能',
            'emailPlaceholder': '输入您的邮箱地址',
            'notifyMe': '通知我',
            'backHome': '返回首页'
        },
        'en': {
            // Navigation
            'works': 'Works (demo)',
            'products': 'Products (Coming Soon)',
            'learning': 'Learning',
            'login': 'Login',
            'gamesMaker': 'Interactive Game Creator',
            'videoMaker': 'Interactive Video Creator',
            'imageMaker': 'Interactive Image Creator',
            'creativeMaker': 'Creative AI Assistant',
            
            // Hero Section
            'heroTitle': 'Create Infinite Interactive Experiences',
            'heroDescription': 'PLAYABLE ALL is a comprehensive interactive content creation platform that helps you easily create interactive games, videos, images and creative content',
            'heroGameTitle': 'Interactive Games',
            'heroGameDesc': 'Easily create engaging interactive gaming experiences',
            'heroVideoTitle': 'Interactive Videos',
            'heroVideoDesc': 'Produce dynamic video content with interactive elements',
            'heroImageTitle': 'Interactive Images',
            'heroImageDesc': 'Create clickable, interactive image experiences',
            'heroCreativeTitle': 'Interactive Creative',
            'heroCreativeDesc': 'Get AI-driven creative recommendations and inspiration',
            
            // Works Page
            'worksTitle': 'Our Works',
            'gamesTab': 'Interactive Games',
            'videosTab': 'Interactive Videos',
            'imagesTab': 'Interactive Images',
            'creativeTab': 'Interactive Creative',
            
            // Learning Page
            'learningTitle': 'Learning',
            'tutorialsTitle': 'Tutorial Guides',
            'tutorialsDesc': 'Complete tutorials from basic to advanced levels',
            'casesTitle': 'Case Studies',
            'casesDesc': 'Analysis of excellent works and creation insights',
            'communityTitle': 'Community Exchange',
            'communityDesc': 'Share experiences and inspiration with other creators',
            'certificateTitle': 'Certification Courses',
            'certificateDesc': 'Get officially certified professional courses',
            'learnMore': 'Learn More',
            
            // Interactive Game Creator Page
            'gamesMakerTitle': 'Interactive Game Creator',
            'gamesMakerDesc': 'Create engaging interactive gaming experiences without programming knowledge. Our intuitive interface allows you to quickly prototype, test, and publish your game ideas.',
            'easyToUseTitle': 'Easy-to-Use Interface',
            'easyToUseDesc': 'Drag-and-drop design, no programming experience required',
            'fastIterationTitle': 'Fast Iteration Testing',
            'fastIterationDesc': 'Real-time preview and A/B testing features',
            'highPerformanceTitle': 'High Performance',
            'highPerformanceDesc': 'Optimized engine ensures smooth experience',
            'crossPlatformTitle': 'Cross-Platform Publishing',
            'crossPlatformDesc': 'Support for all major advertising networks',
            'whatCanYouDoTitle': 'What Can You Do?',
            'levelEditorTitle': 'Level Editor',
            'levelEditorDesc': 'Design complex game levels',
            'visualsTitle': 'Visual Effects',
            'visualsDesc': 'Rich visual and animation effects',
            'cameraTitle': 'Camera Control',
            'cameraDesc': 'Flexible camera angle settings',
            'mockupTitle': 'Device Mockup',
            'mockupDesc': 'Preview effects on different devices',
            'textsTitle': 'Text Editing',
            'textsDesc': 'Custom text and font styles',
            'graphicsTitle': 'Graphics Editing',
            'graphicsDesc': 'Built-in graphics editing tools',
            'benefitsTitle': 'Why Choose Our Interactive Game Creation Tool?',
            'noCodingTitle': 'No Programming Knowledge Required',
            'noCodingDesc': 'Simple, fast, easy-to-use interface',
            'highEngagementTitle': 'High Engagement',
            'highEngagementDesc': 'Interactive game ads have stronger IPM and ROAS performance',
            'unlimitedVersionsTitle': 'Unlimited Versions',
            'unlimitedVersionsDesc': 'Create unlimited number of game versions',
            'allNetworksTitle': 'All Networks Support',
            'allNetworksDesc': 'Support publishing on all major advertising networks',
            
            // Interactive Video Creator Page
            'videoMakerTitle': 'Interactive Video Creator',
            'videoMakerDesc': 'Create dynamic video content with interactive elements, providing immersive viewing experiences. Support multiple forms of interaction, making viewers participants in the story.',
            'flexibleFormatTitle': 'Flexible Formats',
            'flexibleFormatDesc': 'Support for multiple video formats and resolutions',
            'interactiveElementsTitle': 'Interactive Elements',
            'interactiveElementsDesc': 'Rich interactions including hotspots, branching choices, forms',
            'analyticsTitle': 'Deep Analytics',
            'analyticsDesc': 'Detailed viewing and interaction data analysis',
            'instantDeployTitle': 'Instant Deployment',
            'instantDeployDesc': 'One-click publishing to major platforms',
            'useCasesTitle': 'Use Cases',
            'interactiveMovieTitle': 'Interactive Movies',
            'interactiveMovieDesc': 'Movie experiences where viewers can choose plot directions',
            'educationalVideoTitle': 'Educational Videos',
            'educationalVideoDesc': 'Interactive learning content to improve engagement',
            'productShowcaseTitle': 'Product Showcase',
            'productShowcaseDesc': '360-degree product display and interactive demonstrations',
            'corporateTrainingTitle': 'Corporate Training',
            'corporateTrainingDesc': 'Interactive training videos enhance effectiveness',
            
            // Interactive Image Creator Page
            'imageMakerTitle': 'Interactive Image Creator',
            'imageMakerDesc': 'Transform static images into captivating interactive experiences. Through hotspots, animations, and interactive elements, let every image tell a unique story.',
            'smartHotspotsTitle': 'Smart Hotspots',
            'smartHotspotsDesc': 'Automatically identify important areas in images',
            'animationEffectsTitle': 'Animation Effects',
            'animationEffectsDesc': 'Rich transition and animation effects',
            'responsiveDesignTitle': 'Responsive Design',
            'responsiveDesignDesc': 'Adaptive to various screen sizes',
            'advancedEditingTitle': 'Advanced Editing',
            'advancedEditingDesc': 'Professional-grade image editing tools',
            'interactiveFeaturesTitle': 'Interactive Features',
            'clickableHotspotsTitle': 'Clickable Hotspots',
            'clickableHotspotsDesc': 'Add clickable areas anywhere on images, triggering popups, links, or other interactions',
            'zoomPanTitle': 'Zoom & Pan',
            'zoomPanDesc': 'Support image zooming and panning for users to explore every detail',
            'smartTagsTitle': 'Smart Tags',
            'smartTagsDesc': 'AI-driven content tags, automatically recognize and annotate image content',
            'heatmapAnalyticsTitle': 'Heatmap Analytics',
            'heatmapAnalyticsDesc': 'View user click heatmaps on images to optimize interactive design',
            'applicationsTitle': 'Applications',
            'ecommerceTitle': 'E-commerce',
            'ecommerceDesc': 'Interactive product detail display',
            'realEstateTitle': 'Real Estate',
            'realEstateDesc': 'Virtual property viewing experiences',
            'educationTitle': 'Education & Training',
            'educationDesc': 'Interactive teaching content',
            'artGalleryTitle': 'Art Gallery',
            'artGalleryDesc': 'Online artwork exhibitions',
            'manufacturingTitle': 'Manufacturing',
            'manufacturingDesc': 'Equipment operation guides',
            'eventsTitle': 'Events',
            'eventsDesc': 'Live event interactions',
            
            // Common Buttons
            'requestDemo': 'Request Demo',
            'tryNow': 'Try Now',
            
            // Coming Soon Page
            'comingSoonTitle': 'Feature Coming Soon...',
            'comingSoonDesc': 'We are working hard to develop this feature, stay tuned!',
            'comingSoonNotify': 'Want to be the first to know when the product launches?',
            'feature1': 'Intuitive and easy-to-use design interface',
            'feature2': 'Powerful interactive features',
            'feature3': 'Cross-platform compatibility',
            'feature4': 'More features coming soon',
            'emailPlaceholder': 'Enter your email address',
            'notifyMe': 'Notify Me',
            'backHome': 'Back Home'
        }
    };
}

// 语言切换功能
function switchLanguage(language) {
    const translations = getTranslations();
    
    if (translations[language]) {
        // 更新所有带有 data-translate 属性的元素
        const elementsToTranslate = document.querySelectorAll('[data-translate]');
        elementsToTranslate.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[language][key]) {
                if (element.tagName === 'INPUT' && element.type === 'email') {
                    element.placeholder = translations[language][key];
                } else if (element.innerHTML.includes('<i class="fas fa-chevron-down"></i>')) {
                    // 特殊处理带有图标的导航项
                    element.innerHTML = translations[language][key] + ' <i class="fas fa-chevron-down"></i>';
                } else {
                    element.textContent = translations[language][key];
                }
            }
        });

        // 更新带有 data-translate-placeholder 属性的元素
        const elementsWithPlaceholder = document.querySelectorAll('[data-translate-placeholder]');
        elementsWithPlaceholder.forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            if (translations[language][key]) {
                element.placeholder = translations[language][key];
            }
        });

        // 更新 HTML lang 属性
        document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
        
        // 更新页面标题
        if (language === 'zh') {
            document.title = 'PLAYABLE ALL - 互动内容创作平台';
        } else {
            document.title = 'PLAYABLE ALL - Interactive Content Creation Platform';
        }
    }
}

// 初始化动画
function initializeAnimations() {
    // 添加滚动监听，实现元素进入视窗时的动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, observerOptions);

    // 观察所有需要动画的元素
    const animatedElements = document.querySelectorAll('.feature-card, .work-card, .learning-card');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// 作品卡片动画
function animateWorksCards() {
    const workCards = document.querySelectorAll('.work-card');
    workCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// 学习卡片动画
function animateLearningCards() {
    const learningCards = document.querySelectorAll('.learning-card');
    learningCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });
}

// 产品页面卡片动画
function animateProductCards() {
    const productCards = document.querySelectorAll('.feature-item, .case-item, .feature-showcase-item, .application-item');
    productCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// 平滑滚动到顶部
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 通知功能（开发中页面）
function notifyWhenReady() {
    const email = prompt('请输入您的邮箱地址，我们会在功能上线时通知您：');
    if (email && validateEmail(email)) {
        alert('感谢您的关注！我们会在功能上线时第一时间通知您。');
        // 这里可以添加实际的邮箱收集逻辑
    } else if (email) {
        alert('请输入有效的邮箱地址。');
    }
}

// 邮箱验证
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// 添加键盘快捷键支持
document.addEventListener('keydown', function(e) {
    // ESC键返回首页
    if (e.key === 'Escape') {
        showHome();
    }
    
    // 数字键快速切换
    if (e.key >= '1' && e.key <= '4' && currentPage === 'works') {
        const tabs = ['games', 'videos', 'images', 'creative'];
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
            // 模拟点击对应的标签按钮
            const tabButtons = document.querySelectorAll('.tab-btn');
            if (tabButtons[tabIndex]) {
                tabButtons[tabIndex].click();
            }
        }
    }
});

// 添加鼠标右键菜单禁用（可选）
document.addEventListener('contextmenu', function(e) {
    // 在生产环境中可以取消注释以下行
    // e.preventDefault();
});

// 添加触摸设备支持
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (currentPage === 'works') {
            const activeTab = document.querySelector('.tab-content.active');
            const tabs = ['games', 'videos', 'images', 'creative'];
            const currentIndex = tabs.indexOf(activeTab.id);
            
            if (diff > 0 && currentIndex < tabs.length - 1) {
                // 向左滑动，切换到下一个标签
                const nextButton = document.querySelectorAll('.tab-btn')[currentIndex + 1];
                nextButton.click();
            } else if (diff < 0 && currentIndex > 0) {
                // 向右滑动，切换到上一个标签
                const prevButton = document.querySelectorAll('.tab-btn')[currentIndex - 1];
                prevButton.click();
            }
        }
    }
}

// 添加页面加载完成后的初始化
window.addEventListener('load', function() {
    // 添加页面加载动画
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// 工具函数：防抖
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 工具函数：节流
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 响应式导航菜单切换（移动端）
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('mobile-active');
}

// 监听窗口大小变化
window.addEventListener('resize', debounce(function() {
    if (window.innerWidth > 768) {
        // 桌面端时确保移动菜单状态正确
        const navMenu = document.querySelector('.nav-menu');
        navMenu.classList.remove('mobile-active');
    }
}, 250));

/**
 * 带参数导航到指定页面
 * @param {string} url - 目标页面URL
 * @param {Object} params - URL参数对象
 */
function navigateWithParams(url, params) {
    // 创建URL对象
    const targetUrl = new URL(url, window.location.origin);
    
    // 添加参数到URL
    Object.keys(params).forEach(key => {
        targetUrl.searchParams.append(key, params[key]);
    });
    
    // 导航到目标页面
    window.location.href = targetUrl.toString();
}

// 在页面加载时获取URL参数的辅助函数
function getUrlParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams) {
        params[key] = value;
    }
    return params;
}

// 页面加载时处理URL参数
document.addEventListener('DOMContentLoaded', () => {
    const params = getUrlParams();
    // 可以根据参数执行相应的操作
    if (params.source === 'demo') {
        console.log('从示例页面跳转而来');
    }
    if (params.category) {
        console.log('类别:', params.category);
    }
}); 