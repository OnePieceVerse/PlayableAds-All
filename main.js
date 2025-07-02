// 加载组件的函数
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const content = await response.text();
        document.getElementById(elementId).innerHTML = content;
        return true;
    } catch (error) {
        console.error('Error loading component:', error);
        return false;
    }
}

// 初始化页面
async function initializePage() {
    try {
        // 加载header和footer
        await Promise.all([
            loadComponent('header', '/components/header.html'),
            loadComponent('footer', '/components/footer.html')
        ]);

        // 组件加载完成后初始化语言选择器并应用当前语言
        const currentLanguage = localStorage.getItem('language') || 'zh';
        initializeLanguageSelector();
        switchLanguage(currentLanguage);

        // 如果在产品页面，初始化标签页
        // if (window.location.pathname.includes('products.html')) {
        //     initializeTabs();
        // }
        initializeAnimations();
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

// 初始化语言选择器
function initializeLanguageSelector() {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        // 设置初始语言
        const currentLanguage = localStorage.getItem('language') || 'zh';
        languageSelect.value = currentLanguage;

        // 添加语言切换事件监听
        languageSelect.addEventListener('change', function () {
            const selectedLanguage = this.value;
            switchLanguage(selectedLanguage);
            localStorage.setItem('language', selectedLanguage);
        });
    }
}

// 获取翻译文本
function getTranslations() {
    return {
        'zh': {
            // 导航栏
            'products': '产品',
            'login': '登录',

            // Hero区域
            'heroTitle': '让创意自动化，让互动更简单',
            'heroDescription': 'PLAYABLE ALL 是一个创意自动化平台，帮助您轻松制作互动游戏、视频和图片广告，无需编程知识即可创建优质广告素材',
            'tryNow': '立即体验',
            'contactUs': '联系我们',
            'platformTitle': '支持主流广告平台',

            // 核心优势区域
            'featuresTitle': '让 AI 助力您的创意',
            'noProgramming': '无需编程',
            'noProgrammingDesc': '通过直观的界面轻松创建和优化广告',
            'aiDriven': 'AI 驱动',
            'aiDrivenDesc': 'AI 自动完成复杂任务，提升工作效率',
            'multiPlatform': '多平台兼容',
            'multiPlatformDesc': '支持批量生产并对接主流广告网络',
            'readyTemplates': '现成模板',
            'readyTemplatesDesc': '丰富的模板库，快速部署，降低制作成本',
            'flexibleExtension': '灵活扩展',
            'flexibleExtensionDesc': '适用于各类机构、DSP和应用开发者',
            'professionalSupport': '专业支持',
            'professionalSupportDesc': '创意顾问提供活动支持和诊断服务',

            // 产品展示区域
            'productsTitle': '主流广告形式，一站式解决',
            'interactiveGames': '互动游戏广告',
            'interactiveVideos': '互动视频广告',
            'interactiveImages': '互动图片广告',
            'creativeRecommendation': '自动化创意推荐',
            'learnMore': '了解更多',

            // 产品特性
            'noCodeCreation': '无代码创建',
            'templateLibrary': '丰富模板库',
            'mainChannelDelivery': '主流渠道投放',
            'commercialMaterialSupport': '商业素材支持',
            'batchEditingProduction': '批量剪辑制作',
            'aiVoiceSubtitles': 'AI配音字幕',
            'multiLanguageTranslation': '多语言翻译',
            'autoSizeAdjustment': '自动尺寸调整',
            'aiAutoGeneration': 'AI自动生成',

            // 客户案例区域
            'casesTitle': '客户成功案例',
            'improveGameDownloads': '提升游戏下载量',
            'globalDownloads': '全球下载',
            'viewCase': '查看案例',

            // 页脚区域
            'footerDescription': '让创意自动化，让互动更简单。我们致力于为广告主提供最佳的互动广告解决方案。',
            'productsSection': '产品',
            'resourcesSection': '资源',
            'companySection': '公司',
            'contactSection': '联系我们',
            'tutorialGuides': '教程指南',
            'caseStudies': '案例研究',
            'apiDocs': 'API 文档',
            'helpCenter': '帮助中心',
            'aboutUs': '关于我们',
            'joinUs': '加入我们',
            'news': '新闻动态',
            'address': '广东省深圳市南山区科兴科学园D1栋',
            'privacyPolicy': '隐私政策',
            'termsOfService': '服务条款',
            'cookiePolicy': 'Cookie 政策',

            // 产品页面
            'pageTitle': '产品展示 - PLAYABLE ALL',
            'worksTitle': '各种有趣吸睛的素材应有尽有',
            'gamesTab': '互动游戏',
            'videosTab': '互动视频',
            'imagesTab': '互动图片',
            'creativeTab': '互动创意',

            // 游戏卡片
            'multiPlayerRacing': '金铲铲之战-多人竞速游戏',
            'multiPlayerRacingDesc': '紧张刺激的沉浸式多人竞速体验',
            'dodgeGhost': '躲避幽灵游戏',
            'dodgeGhostDesc': '考验智慧的躲避挑战',
            'flappyBird': '飞鸟小游戏',
            'flappyBirdDesc': '考验智慧的躲避挑战',
            'jigsawPuzzle': '拼图游戏',
            'jigsawPuzzleDesc': '考验智慧的拼图挑战',
            'jumpEscape': '跳跃逃生游戏',
            'jumpEscapeDesc': '考验智慧的跳跃挑战',
            'matchRescue': '匹配救援游戏',
            'matchRescueDesc': '考验智慧的匹配挑战',
            'memoryPick': '记忆选择游戏',
            'memoryPickDesc': '考验智慧的记忆挑战',
            'whackMole': '打地鼠游戏',
            'whackMoleDesc': '考验智慧的打地鼠挑战',

            // 视频卡片
            'interactiveVideoVertical': '金铲铲之战-互动视频',
            'interactiveVideoVerticalDesc': '可试玩游戏的视频体验（竖屏）',
            'interactiveVideoHorizontal': '金铲铲之战-互动视频',
            'interactiveVideoHorizontalDesc': '可试玩游戏的视频体验',

            // 图片卡片
            'interactiveImageTitle': '金铲铲之战-互动图片',
            'interactiveImageDesc': '可点击探索的互动图片',

            // Footer translations
            footerAboutTitle: "关于我们",
            footerAboutDesc: "PLAYABLE ALL 是一个创意自动化平台，帮助您轻松制作互动游戏、视频和图片广告，无需编程知识即可创建优质广告素材",
            footerProductsTitle: "产品服务",
            footerInteractiveGames: "互动游戏广告",
            footerInteractiveVideos: "互动视频广告",
            footerInteractiveImages: "互动图片广告",
            footerCreativeRecommendation: "自动化创意推荐",
            footerContactTitle: "联系我们",
            footerAddress: "地址：深圳市南山区科技园科兴科学园",
            footerEmail: "邮箱：contact@playableall.com",
            footerPhone: "电话：+86 755-86969696",
            footerCopyright: "© 2025 PLAYABLE ALL. 保留所有权利",

            // Products page translations
            productsPageTitle: "产品展示 - PLAYABLE ALL",
            worksTitle: "各种有趣吸睛的素材应有尽有",
            gamesTab: "互动游戏",
            videosTab: "互动视频",
            imagesTab: "互动图片",
            creativeTab: "互动创意",

            // Game cards
            multiPlayerRacing: "金铲铲之战-多人竞速游戏",
            multiPlayerRacingDesc: "紧张刺激的沉浸式多人竞速体验",
            dodgeGhost: "躲避幽灵游戏",
            dodgeGhostDesc: "考验智慧的躲避挑战",
            flappyBird: "飞鸟小游戏",
            flappyBirdDesc: "考验智慧的躲避挑战",
            jigsawPuzzle: "拼图游戏",
            jigsawPuzzleDesc: "考验智慧的拼图挑战",
            jumpEscape: "跳跃逃生游戏",
            jumpEscapeDesc: "考验智慧的跳跃挑战",
            matchRescue: "匹配救援游戏",
            matchRescueDesc: "考验智慧的匹配挑战",
            memoryPick: "记忆选择游戏",
            memoryPickDesc: "考验智慧的记忆挑战",
            whackMole: "打地鼠游戏",
            whackMoleDesc: "考验智慧的打地鼠挑战",

            // Video cards
            interactiveVideoVertical: "金铲铲之战-互动视频",
            interactiveVideoVerticalDesc: "可试玩游戏的视频体验（竖屏）",
            interactiveVideoHorizontal: "金铲铲之战-互动视频",
            interactiveVideoHorizontalDesc: "可试玩游戏的视频体验"
        },
        'en': {
            // Navigation
            'products': 'Products',
            'login': 'Login',

            // Hero Section
            'heroTitle': 'Automate Creativity, Simplify Interaction',
            'heroDescription': 'PLAYABLE ALL is a creative automation platform that helps you easily create interactive games, videos, and image ads without programming knowledge',
            'tryNow': 'Try Now',
            'contactUs': 'Contact Us',
            'platformTitle': 'Supporting Major Ad Platforms',

            // Core Features Section
            'featuresTitle': 'Let AI Power Your Creativity',
            'noProgramming': 'No Programming',
            'noProgrammingDesc': 'Create and optimize ads through an intuitive interface',
            'aiDriven': 'AI-Driven',
            'aiDrivenDesc': 'AI automatically completes complex tasks, improving efficiency',
            'multiPlatform': 'Multi-Platform Compatible',
            'multiPlatformDesc': 'Support batch production and integration with major ad networks',
            'readyTemplates': 'Ready Templates',
            'readyTemplatesDesc': 'Rich template library, quick deployment, reduced production costs',
            'flexibleExtension': 'Flexible Extension',
            'flexibleExtensionDesc': 'Suitable for various institutions, DSPs, and app developers',
            'professionalSupport': 'Professional Support',
            'professionalSupportDesc': 'Creative consultants provide campaign support and diagnostic services',

            // Products Section
            'productsTitle': 'One-Stop Solution for Mainstream Ad Formats',
            'interactiveGames': 'Interactive Game Ads',
            'interactiveVideos': 'Interactive Video Ads',
            'interactiveImages': 'Interactive Image Ads',
            'creativeRecommendation': 'Automated Creative Recommendations',
            'learnMore': 'Learn More',

            // Product Features
            'noCodeCreation': 'No-Code Creation',
            'templateLibrary': 'Rich Template Library',
            'mainChannelDelivery': 'Major Channel Distribution',
            'commercialMaterialSupport': 'Commercial Material Support',
            'batchEditingProduction': 'Batch Editing & Production',
            'aiVoiceSubtitles': 'AI Voice & Subtitles',
            'multiLanguageTranslation': 'Multi-Language Translation',
            'autoSizeAdjustment': 'Auto Size Adjustment',
            'aiAutoGeneration': 'AI Auto Generation',

            // Case Studies Section
            'casesTitle': 'Customer Success Stories',
            'improveGameDownloads': 'Improve Game Downloads',
            'globalDownloads': 'Global Downloads',
            'viewCase': 'View Case Study',

            // Footer Section
            'footerDescription': 'Automate creativity, simplify interaction. We are committed to providing advertisers with the best interactive advertising solutions.',
            'productsSection': 'Products',
            'resourcesSection': 'Resources',
            'companySection': 'Company',
            'contactSection': 'Contact Us',
            'tutorialGuides': 'Tutorial Guides',
            'caseStudies': 'Case Studies',
            'apiDocs': 'API Documentation',
            'helpCenter': 'Help Center',
            'aboutUs': 'About Us',
            'joinUs': 'Join Us',
            'news': 'News',
            'address': 'Building D1, Keyuan Science Park, Nanshan District, Shenzhen, Guangdong',
            'privacyPolicy': 'Privacy Policy',
            'termsOfService': 'Terms of Service',
            'cookiePolicy': 'Cookie Policy',

            // Products Page
            'pageTitle': 'Products - PLAYABLE ALL',
            'worksTitle': 'Explore Our Engaging Interactive Materials',
            'gamesTab': 'Interactive Games',
            'videosTab': 'Interactive Videos',
            'imagesTab': 'Interactive Images',
            'creativeTab': 'Interactive Creative',

            // Game Cards
            'multiPlayerRacing': 'TFT - Multiplayer Racing Game',
            'multiPlayerRacingDesc': 'Immersive multiplayer racing experience',
            'dodgeGhost': 'Ghost Dodge Game',
            'dodgeGhostDesc': 'A challenging dodge adventure',
            'flappyBird': 'Flappy Bird Game',
            'flappyBirdDesc': 'Test your reflexes in this classic challenge',
            'jigsawPuzzle': 'Jigsaw Puzzle Game',
            'jigsawPuzzleDesc': 'Exercise your mind with puzzles',
            'jumpEscape': 'Jump Escape Game',
            'jumpEscapeDesc': 'Exciting jumping challenge',
            'matchRescue': 'Match Rescue Game',
            'matchRescueDesc': 'Strategic matching challenge',
            'memoryPick': 'Memory Pick Game',
            'memoryPickDesc': 'Test your memory skills',
            'whackMole': 'Whack-a-Mole Game',
            'whackMoleDesc': 'Classic arcade challenge',

            // Video Cards
            'interactiveVideoVertical': 'TFT - Interactive Video',
            'interactiveVideoVerticalDesc': 'Playable game experience (vertical)',
            'interactiveVideoHorizontal': 'TFT - Interactive Video',
            'interactiveVideoHorizontalDesc': 'Playable game experience',

            // Image Cards
            'interactiveImageTitle': 'TFT - Interactive Image',
            'interactiveImageDesc': 'Clickable and explorable interactive image',

            // Footer translations
            footerAboutTitle: "About Us",
            footerAboutDesc: "PLAYABLE ALL is a creative automation platform that helps you easily create interactive games, videos, and image ads without programming knowledge",
            footerProductsTitle: "Products & Services",
            footerInteractiveGames: "Interactive Game Ads",
            footerInteractiveVideos: "Interactive Video Ads",
            footerInteractiveImages: "Interactive Image Ads",
            footerCreativeRecommendation: "Creative Automation",
            footerContactTitle: "Contact Us",
            footerAddress: "Address: Science Park, Nanshan District, Shenzhen",
            footerEmail: "Email: contact@playableall.com",
            footerPhone: "Phone: +86 755-86969696",
            footerCopyright: "© 2025 PLAYABLE ALL. All rights reserved",

            // Products page translations
            productsPageTitle: "Products - PLAYABLE ALL",
            worksTitle: "Explore Our Engaging Interactive Materials",
            gamesTab: "Interactive Games",
            videosTab: "Interactive Videos",
            imagesTab: "Interactive Images",
            creativeTab: "Interactive Creative",

            // Game cards
            multiPlayerRacing: "TFT - Multiplayer Racing Game",
            multiPlayerRacingDesc: "Immersive multiplayer racing experience",
            dodgeGhost: "Ghost Dodge Game",
            dodgeGhostDesc: "A challenging dodge adventure",
            flappyBird: "Flappy Bird Game",
            flappyBirdDesc: "Test your reflexes in this classic challenge",
            jigsawPuzzle: "Jigsaw Puzzle Game",
            jigsawPuzzleDesc: "Exercise your mind with puzzles",
            jumpEscape: "Jump Escape Game",
            jumpEscapeDesc: "Exciting jumping challenge",
            matchRescue: "Match Rescue Game",
            matchRescueDesc: "Strategic matching challenge",
            memoryPick: "Memory Pick Game",
            memoryPickDesc: "Test your memory skills",
            whackMole: "Whack-a-Mole Game",
            whackMoleDesc: "Classic arcade challenge",

            // Video cards
            interactiveVideoVertical: "TFT - Interactive Video",
            interactiveVideoVerticalDesc: "Playable game experience (vertical)",
            interactiveVideoHorizontal: "TFT - Interactive Video",
            interactiveVideoHorizontalDesc: "Playable game experience"
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
                } else if (element.tagName === 'TITLE') {
                    element.textContent = translations[language][key];
                    document.title = translations[language][key];
                } else {
                    // 检查是否包含特殊图标
                    if (element.innerHTML.includes('<i class="fas fa-chevron-down"></i>')) {
                        element.innerHTML = translations[language][key] + ' <i class="fas fa-chevron-down"></i>';
                    } else {
                        element.textContent = translations[language][key];
                    }
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
        document.dispatchEvent(new CustomEvent('myCustomLanguageChangedEvent', {
            detail: {
                language: language
            }
        }));
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
    const animatedElements = document.querySelectorAll('.work-card');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// 添加触摸设备支持
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function (e) {
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
window.addEventListener('load', function () {
    // 添加页面加载动画
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// 工具函数：节流
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 移动端菜单切换
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// 移动端下拉菜单切换
document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const link = dropdown.querySelector('.nav-link');
    link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            dropdown.classList.toggle('active');
        }
    });
});

// 点击页面其他地方关闭移动端菜单
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-menu') && !e.target.closest('.mobile-menu-btn')) {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    }
});

// 监听窗口大小变化，在大屏幕时重置菜单状态
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const navMenu = document.querySelector('.nav-menu');
        const dropdowns = document.querySelectorAll('.nav-dropdown');
        navMenu.classList.remove('active');
        dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
    }
});

// 立即体验按钮跳转到产品页面
document.querySelectorAll('[data-translate="tryNow"]')
    .forEach(btn => {
        btn.addEventListener('click', function (e) {
            window.location.href = 'products.html';
        });
    });

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePage);