// 加载组件的函数
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const content = await response.text();
        document.getElementById(elementId).innerHTML = content;
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

// 当DOM加载完成后加载组件
document.addEventListener('DOMContentLoaded', function () {
    // 加载header
    loadComponent('header', '/components/header.html');

    // 加载footer
    loadComponent('footer', '/components/footer.html');
}); 