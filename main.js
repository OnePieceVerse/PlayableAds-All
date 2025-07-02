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

// 获取翻译配置
let translations = null;

async function getTranslations() {
    if (translations) {
        return translations;
    }

    try {
        const response = await fetch('./config/translations.json');
        translations = await response.json();
        return translations;
    } catch (error) {
        console.error('Error loading translations:', error);
        return null;
    }
}

// 语言切换功能
async function switchLanguage(language) {
    const translations = await getTranslations();
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

        // 更新带有 data-translate-title 属性的元素
        document.querySelectorAll('[data-translate-title]').forEach(element => {
            const key = element.getAttribute('data-translate-title');
            if (translations[language][key]) {
                element.title = translations[language][key];
            }
        });

        // 更新带有 data-translate-alt 属性的元素
        document.querySelectorAll('[data-translate-alt]').forEach(element => {
            const key = element.getAttribute('data-translate-alt');
            if (translations[language][key]) {
                element.alt = translations[language][key];
            }
        });

        // 更新语言选择器的显示
        const languageSelector = document.querySelector('.language-selector .current-lang');
        if (languageSelector) {
            languageSelector.textContent = language.toUpperCase();
        }

        // 保存语言选择
        localStorage.setItem('language', language);

        // 触发自定义语言变化事件
        document.dispatchEvent(new CustomEvent('myCustomLanguageChangedEvent', {
            detail: {
                language: language
            }
        }));
    }
}

// 获取当前语言
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'zh';
}

// 初始化页面
async function initializePage() {
    try {
        // 加载header和footer
        await Promise.all([
            loadComponent('header', './components/header.html'),
            loadComponent('footer', './components/footer.html')
        ]);

        // 组件加载完成后初始化语言选择器并应用当前语言
        initializeLanguageSelector();
        const currentLanguage = getCurrentLanguage();
        await switchLanguage(currentLanguage);
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
            window.location.href = 'works.html';
        });
    });

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePage);