// 弹窗功能
let modal = null;
let modalTitle = null;
let modalIframe = null;

// 初始化弹窗
document.addEventListener('DOMContentLoaded', function() {
    // 加载弹窗组件
    loadComponent('modal-container', '/components/modal.html').then(() => {
        modal = document.getElementById('modal');
        modalTitle = document.getElementById('modal-title');
        modalIframe = document.getElementById('modal-iframe');
        
        // 点击弹窗外部关闭弹窗
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });

        // 初始化所有可点击卡片
        initializeCards();
    });
});

// 初始化所有卡片的点击事件
function initializeCards() {
    // 处理带有data-navigate-url属性的卡片
    document.querySelectorAll('[data-navigate-url]').forEach(card => {
        card.addEventListener('click', function() {
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
            card.addEventListener('click', function() {
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