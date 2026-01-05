// 弹窗功能
let modal = null;
let modalTitle = null;
let modalIframe = null;

// WebGL游戏相关变量
let allWebGLGames = [];
let currentFilterTag = 'all';
let currentFilterPlatform = 'all';
let translationsCache = null;

// 加载产品配置
async function loadProducts() {
    try {
        const response = await fetch('config/works.json');
        const products = await response.json();
        return products;
    } catch (error) {
        console.error('Error loading products:', error);
        return null;
    }
}

// 加载WebGL游戏配置
async function loadWebGLGames() {
    try {
        const response = await fetch('config/games.json');
        const games = await response.json();
        return games;
    } catch (error) {
        console.error('Error loading webgl games:', error);
        return [];
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
    document.querySelectorAll('.work-card').forEach(card => {
        const cardData = card._data; // 存储的原始数据
        if (cardData) {
            const title = card.querySelector('h3');
            const desc = card.querySelector('p');
            title.textContent = cardData.title[language];
            desc.textContent = cardData.description[language];
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

    // 如果是webgl-games标签页，确保游戏已加载并应用当前过滤
    if (tabName === 'webgl-games' && allWebGLGames.length > 0) {
        applyFilters();
    }

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

// 获取所有唯一的标签
function getAllTags(games) {
    const tagsMap = new Map();
    games.forEach(game => {
        if (game.tags && Array.isArray(game.tags)) {
            game.tags.forEach(tag => {
                // 支持多语言tag对象或字符串（向后兼容）
                if (typeof tag === 'object' && tag.zh) {
                    // 使用中文作为唯一标识
                    if (!tagsMap.has(tag.zh)) {
                        tagsMap.set(tag.zh, tag);
                    }
                } else if (typeof tag === 'string') {
                    // 向后兼容：如果是字符串，转换为对象
                    if (!tagsMap.has(tag)) {
                        tagsMap.set(tag, { zh: tag, en: tag });
                    }
                }
            });
        }
    });
    return Array.from(tagsMap.values()).sort((a, b) => {
        // 按中文排序
        const aKey = typeof a === 'object' ? a.zh : a;
        const bKey = typeof b === 'object' ? b.zh : b;
        return aKey.localeCompare(bKey, 'zh');
    });
}

// 获取所有唯一的平台
function getAllPlatforms(games) {
    const platforms = new Set();
    games.forEach(game => {
        if (game.platform) {
            platforms.add(game.platform);
        }
    });
    return Array.from(platforms).sort();
}

// 获取翻译文本
async function getTranslation(key) {
    try {
        if (!translationsCache) {
            const response = await fetch('config/translations.json');
            translationsCache = await response.json();
        }
        const language = getCurrentLanguage();
        return translationsCache[language] && translationsCache[language][key] ? translationsCache[language][key] : key;
    } catch (error) {
        console.error('Error loading translation:', error);
        return key;
    }
}

// 同步获取翻译（需要先确保翻译已加载）
function getTranslationSync(key) {
    if (!translationsCache) {
        const language = getCurrentLanguage();
        // 根据key返回默认值
        if (key === 'allTags' || key === 'allPlatforms') {
            return language === 'zh' ? '全部' : 'All';
        }
        return key;
    }
    const language = getCurrentLanguage();
    return translationsCache[language] && translationsCache[language][key] ? translationsCache[language][key] : key;
}

// 渲染平台过滤器
async function renderPlatformFilter(platforms) {
    const filterContainer = document.getElementById('webgl-platform-filter');
    if (!filterContainer) return;

    filterContainer.innerHTML = '';

    // 添加"全部"平台
    const allPlatformBtn = document.createElement('button');
    allPlatformBtn.className = 'platform-btn active';
    const allText = await getTranslation('allPlatforms');
    allPlatformBtn.textContent = allText;
    allPlatformBtn.onclick = () => filterGamesByPlatform('all');
    filterContainer.appendChild(allPlatformBtn);

    // 添加其他平台
    platforms.forEach(platform => {
        const platformBtn = document.createElement('button');
        platformBtn.className = 'platform-btn';
        platformBtn.textContent = platform;
        platformBtn.onclick = () => filterGamesByPlatform(platform);
        filterContainer.appendChild(platformBtn);
    });
}

// 渲染标签过滤器
async function renderTagFilter(tags) {
    const filterContainer = document.getElementById('webgl-tag-filter');
    if (!filterContainer) return;

    filterContainer.innerHTML = '';

    // 添加"全部"标签
    const allTagBtn = document.createElement('button');
    allTagBtn.className = 'tag-btn active';
    const allText = await getTranslation('allTags');
    allTagBtn.textContent = allText;
    allTagBtn.onclick = () => filterGamesByTag('all');
    filterContainer.appendChild(allTagBtn);

    // 添加其他标签
    const language = getCurrentLanguage();
    tags.forEach(tag => {
        const tagBtn = document.createElement('button');
        tagBtn.className = 'tag-btn';
        // 支持多语言tag对象或字符串（向后兼容）
        const tagText = typeof tag === 'object' && tag[language] ? tag[language] : (typeof tag === 'object' ? tag.zh : tag);
        const tagKey = typeof tag === 'object' && tag.zh ? tag.zh : tag;
        tagBtn.textContent = tagText;
        tagBtn.setAttribute('data-tag-key', tagKey); // 存储用于匹配的key
        tagBtn.onclick = () => filterGamesByTag(tagKey);
        filterContainer.appendChild(tagBtn);
    });
}

// 根据平台过滤游戏
function filterGamesByPlatform(platform) {
    currentFilterPlatform = platform;

    // 更新平台按钮状态
    const allText = getTranslationSync('allPlatforms');
    document.querySelectorAll('#webgl-platform-filter .platform-btn').forEach((btn) => {
        btn.classList.remove('active');
        if (platform === 'all' && btn.textContent === allText) {
            btn.classList.add('active');
        } else if (btn.textContent === platform) {
            btn.classList.add('active');
        }
    });

    // 应用过滤
    applyFilters();
}

// 根据标签过滤游戏
function filterGamesByTag(tag) {
    currentFilterTag = tag;

    // 更新标签按钮状态
    const allText = getTranslationSync('allTags');
    document.querySelectorAll('#webgl-tag-filter .tag-btn').forEach((btn) => {
        btn.classList.remove('active');
        if (tag === 'all' && btn.textContent === allText) {
            btn.classList.add('active');
        } else if (btn.getAttribute('data-tag-key') === tag) {
            btn.classList.add('active');
        }
    });

    // 应用过滤
    applyFilters();
}

// 应用所有过滤器（平台+标签）
function applyFilters() {
    let filteredGames = allWebGLGames;

    // 先按平台过滤
    if (currentFilterPlatform !== 'all') {
        filteredGames = filteredGames.filter(game => game.platform === currentFilterPlatform);
    }

    // 再按标签过滤
    if (currentFilterTag !== 'all') {
        filteredGames = filteredGames.filter(game => {
            if (!game.tags || !Array.isArray(game.tags)) return false;
            return game.tags.some(tag => {
                // 支持多语言tag对象或字符串（向后兼容）
                if (typeof tag === 'object' && tag.zh) {
                    return tag.zh === currentFilterTag;
                } else if (typeof tag === 'string') {
                    return tag === currentFilterTag;
                }
                return false;
            });
        });
    }

    // 渲染过滤后的游戏
    renderWebGLGames(filteredGames);
}

// 渲染WebGL游戏列表
function renderWebGLGames(games) {
    const grid = document.getElementById('webgl-games-grid');
    if (!grid) return;

    grid.innerHTML = '';

    games.forEach(item => {
        const card = createWorkCard(item);
        card._data = item; // 存储原始数据用于语言切换
        grid.appendChild(card);
    });

    // 重新初始化卡片点击事件
    initializeCards();
    
    // 应用动画
    setTimeout(() => {
        animateWorksCards();
    }, 100);
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

    // 加载并渲染WebGL游戏
    allWebGLGames = await loadWebGLGames();
    if (allWebGLGames && allWebGLGames.length > 0) {
        // 预加载翻译
        await getTranslation('allTags');
        await getTranslation('allPlatforms');
        
        // 渲染平台过滤器
        const allPlatforms = getAllPlatforms(allWebGLGames);
        await renderPlatformFilter(allPlatforms);
        
        // 渲染标签过滤器
        const allTags = getAllTags(allWebGLGames);
        await renderTagFilter(allTags);
        
        // 初始显示所有游戏
        currentFilterPlatform = 'all';
        currentFilterTag = 'all';
        applyFilters();
    }

    loadComponent('modal-container', '/components/modal.html').then(() => {
        modal = document.getElementById('modal');
        modalTitle = document.getElementById('modal-title');
        modalIframe = document.getElementById('modal-iframe');

        // 初始化iframe样式
        if (modalIframe) {
            modalIframe.style.width = '100%';
            modalIframe.style.height = '100%';
            modalIframe.style.overflow = 'hidden';
            modalIframe.style.border = 'none';
            modalIframe.setAttribute('scrolling', 'no');
        }

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
    document.addEventListener('myCustomLanguageChangedEvent', async function(event) {
        updateCardTexts(event.detail.language);
        // 清除翻译缓存，强制重新加载
        translationsCache = null;
        // 重新渲染平台和标签过滤器（更新"全部"按钮文本）
        if (allWebGLGames && allWebGLGames.length > 0) {
            const allPlatforms = getAllPlatforms(allWebGLGames);
            const allTags = getAllTags(allWebGLGames);
            await renderPlatformFilter(allPlatforms);
            await renderTagFilter(allTags);
            // 重新应用过滤
            applyFilters();
        }
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

    // 重置iframe和modal样式
    modalIframe.src = '';
    
    // 显示模态框
    modal.style.display = 'flex';
    
    // 延迟加载iframe内容
    setTimeout(() => {
        modalIframe.src = fullUrl;
        
        // iframe加载完成后调整尺寸
        modalIframe.onload = function() {
            // 防止iframe内部产生滚动条
            try {
                const iframeDoc = modalIframe.contentDocument || modalIframe.contentWindow.document;
                iframeDoc.body.style.overflow = 'hidden';
                iframeDoc.documentElement.style.overflow = 'hidden';
                iframeDoc.body.style.margin = '0';
                iframeDoc.body.style.padding = '0';
                
                // 获取iframe内容的实际尺寸
                const canvas = iframeDoc.querySelector('canvas');
                let contentWidth, contentHeight;
                
                if (canvas) {
                    // 如果有canvas，优先使用offsetWidth/offsetHeight（显示尺寸）
                    contentWidth = canvas.offsetWidth || canvas.width;
                    contentHeight = canvas.offsetHeight || canvas.height;
                    
                    // 如果canvas没有设置CSS尺寸，使用其内部分辨率
                    if (!contentWidth || !contentHeight) {
                        contentWidth = canvas.width;
                        contentHeight = canvas.height;
                    }
                } else {
                    // 否则使用文档尺寸
                    contentWidth = iframeDoc.documentElement.scrollWidth;
                    contentHeight = iframeDoc.documentElement.scrollHeight;
                }
                
                // 调整modal尺寸以适应内容
                adjustModalSize(contentWidth, contentHeight);
                
            } catch (e) {
                // 跨域限制，使用默认尺寸
                console.log('Cross-origin iframe, using default size');
                ensureIframeFit();
            }
        };
    }, 100);

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

// 确保iframe内容适应容器
function ensureIframeFit() {
    if (!modalIframe) return;
    
    const modalBody = document.querySelector('.modal-body');
    const mobileFrame = document.querySelector('.simple-mobile-frame');
    
    if (modalBody && mobileFrame) {
        // 确保所有容器都设置为overflow: hidden，防止出现滚动条
        modalBody.style.overflow = 'hidden';
        mobileFrame.style.overflow = 'hidden';
        modalIframe.style.overflow = 'hidden';
        
        // 让CSS的flex布局自动处理尺寸，不手动设置高度
        // modal-body已经设置了flex: 1，会自动填充剩余空间
    }
}

// 根据内容尺寸调整modal大小（不再动态设置尺寸，由CSS控制）
function adjustModalSize(contentWidth, contentHeight) {
    // 不再动态设置modal-content的尺寸，让CSS控制
    // 确保iframe填充整个容器
    ensureIframeFit();
}

// 窗口大小变化时重新调整iframe尺寸
window.addEventListener('resize', function() {
    if (modal && modal.style.display === 'flex') {
        try {
            const iframeDoc = modalIframe.contentDocument || modalIframe.contentWindow.document;
            const canvas = iframeDoc.querySelector('canvas');
            let contentWidth, contentHeight;
            
            if (canvas) {
                contentWidth = canvas.offsetWidth || canvas.width;
                contentHeight = canvas.offsetHeight || canvas.height;
                
                if (!contentWidth || !contentHeight) {
                    contentWidth = canvas.width;
                    contentHeight = canvas.height;
                }
            } else {
                contentWidth = iframeDoc.documentElement.scrollWidth;
                contentHeight = iframeDoc.documentElement.scrollHeight;
            }
            
            adjustModalSize(contentWidth, contentHeight);
        } catch (e) {
            // 跨域情况，使用默认处理
            ensureIframeFit();
        }
    }
});