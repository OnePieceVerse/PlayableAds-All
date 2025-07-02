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

// 更新导航栏活跃状态
function updateActiveNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
}

// 隐藏所有页面
function hideAllSections() {
    const sections = ['home', 'works', 'learning', 'interactive-games', 'interactive-videos', 'interactive-images', 'interactive-creative'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.style.display = 'none';
        }
    });
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('p');

    // 隐藏所有页面
    hideAllSections();

    // 根据参数显示对应页面
    if (pageParam) {
        showSection(pageParam);
    } else {
        // 默认显示游戏页面
        showSection('interactive-games');
    }
});

// 显示指定页面
function showSection(sectionId) {
    hideAllSections();
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = sectionId.includes('creative') ? 'flex' : 'block';
    } else {
        console.error('Section not found:', sectionId);
    }
}

// 返回首页
function showHome() {
    window.location.href = 'index.html';
}

// 订阅通知
function notifyWhenReady() {
    const emailInput = document.querySelector('.notify-form input');
    const email = emailInput.value.trim();
    
    if (!email) {
        alert('请输入有效的邮箱地址');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('请输入正确的邮箱格式');
        return;
    }
    
    // TODO: 实现订阅逻辑
    alert('感谢您的订阅！产品上线后我们会第一时间通知您。');
    emailInput.value = '';
}

// 验证邮箱格式
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}