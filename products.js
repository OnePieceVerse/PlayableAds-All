// 弹窗功能
let modal = null;
let modalTitle = null;
let modalIframe = null;

// 加载产品配置
async function loadProducts() {
    try {
        const response = await fetch('/config/products.json');
        const products = await response.json();
        return products;
    } catch (error) {
        console.error('Error loading products:', error);
        return null;
    }
}

// 创建作品卡片
function createWorkCard(item) {
    const card = document.createElement('div');
    card.className = 'work-card';
    card.setAttribute('data-navigate-url', item.url);

    if (item.params) {
        card.setAttribute('data-navigate-params', JSON.stringify(item.params));
    }

    const imageDiv = document.createElement('div');
    imageDiv.className = 'work-image';
    if (item.image) {
        imageDiv.style.backgroundImage = `url(${item.image})`;
    }

    const title = document.createElement('h3');
    title.textContent = item.title[getCurrentLanguage()];

    const desc = document.createElement('p');
    desc.textContent = item.description[getCurrentLanguage()];

    card.appendChild(imageDiv);
    card.appendChild(title);
    card.appendChild(desc);

    return card;
}

// 获取当前语言
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'zh';
}

// 更新卡片文本
function updateCardTexts(language) {
    const currentLang = language;
    console.log('currentLang', currentLang);
    document.querySelectorAll('.work-card').forEach(card => {
        const cardData = card._data; // 存储的原始数据
        if (cardData) {
            const title = card.querySelector('h3');
            const desc = card.querySelector('p');
            title.textContent = cardData.title[currentLang];
            desc.textContent = cardData.description[currentLang];
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

// 渲染产品列表
async function renderProducts() {
    const products = await loadProducts();
    if (!products) return;

    // 渲染每个类别的产品
    ['games', 'videos', 'images', 'creative'].forEach(category => {
        const grid = document.getElementById(`${category}-grid`);
        if (grid && products[category]) {
            products[category].forEach(item => {
                const card = createWorkCard(item);
                card._data = item; // 存储原始数据用于语言切换
                grid.appendChild(card);
            });
        }
    });

    loadComponent('modal-container', '/components/modal.html').then(() => {
        modal = document.getElementById('modal');
        modalTitle = document.getElementById('modal-title');
        modalIframe = document.getElementById('modal-iframe');

        // 点击弹窗外部关闭弹窗
        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                closeModal();
            }
        });

        // 初始化所有可点击卡片
        initializeCards();
    });

    // 注册语言变化事件
    document.addEventListener('myCustomLanguageChangedEvent', function(event) {
        updateCardTexts(event.detail.language);
    });
}

// 页面加载完成后渲染产品
document.addEventListener('DOMContentLoaded', renderProducts);

// 初始化所有卡片的点击事件
function initializeCards() {
    // 处理带有data-navigate-url属性的卡片
    document.querySelectorAll('[data-navigate-url]').forEach(card => {
        card.addEventListener('click', function () {
            const url = this.getAttribute('data-navigate-url');
            const params = this.getAttribute('data-navigate-params');
            const title = this.querySelector('h3').textContent;
            openModal(url, title, params ? JSON.parse(params) : null);
        });
    });

    // 处理带有onclick属性的卡片
    document.querySelectorAll('.work-card[onclick]').forEach(card => {
        const onclickAttr = card.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes('navigateWithParams')) {
            // 移除原有的onclick属性
            card.removeAttribute('onclick');

            // 添加新的点击事件监听器
            card.addEventListener('click', function () {
                const match = onclickAttr.match(/navigateWithParams\('([^']+)',\s*({[^}]+})\)/);
                if (match) {
                    const url = match[1];
                    const params = JSON.parse(match[2]);
                    const title = this.querySelector('h3').textContent;
                    openModal(url, title, params);
                }
            });
        }
    });
}

// 打开弹窗
function openModal(url, title, params = null) {
    if (!modal) return;

    modalTitle.textContent = title;

    // 构建完整的URL（包含参数）
    let fullUrl = url;
    if (params) {
        const queryString = Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        fullUrl += (url.includes('?') ? '&' : '?') + queryString;
    }

    modalIframe.src = fullUrl;
    modal.style.display = 'block';

    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
}

// 关闭弹窗
function closeModal() {
    if (!modal) return;

    modal.style.display = 'none';
    modalIframe.src = '';

    // 恢复背景滚动
    document.body.style.overflow = '';
} 