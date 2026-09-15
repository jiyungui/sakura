/**
 * AA Phone - Application Main Controller
 * 管理 9 个板块调度与 P1 抽屉面板交互
 */
const App = {
    currentModule: 'chat',

    init() {
        this.bindDockNavigation();
        this.bindDrawerControls();
    },

    // 绑定左侧9个板块切换
    bindDockNavigation() {
        const dockItems = document.querySelectorAll('.dock-item');
        dockItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetModule = item.getAttribute('data-module');
                this.switchModule(targetModule);
            });
        });
    },

    // 切换板块
    switchModule(moduleName) {
        this.currentModule = moduleName;

        // 1. 更新Dock选中高亮
        document.querySelectorAll('.dock-item').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-module') === moduleName);
        });

        // 2. 更新板块工作区视图
        const chatView = document.getElementById('module-chat');
        const placeholderView = document.getElementById('module-placeholder');

        if (moduleName === 'chat') {
            chatView.classList.add('active');
            placeholderView.classList.remove('active');
        } else {
            chatView.classList.remove('active');
            placeholderView.classList.add('active');
            
            // 提示当前板块名称
            const targetBtn = document.querySelector(`.dock-item[data-module="${moduleName}"]`);
            const label = targetBtn ? targetBtn.querySelector('.dock-label').textContent : moduleName;
            document.getElementById('placeholderTag').textContent = moduleName.toUpperCase();
            document.getElementById('placeholderName').textContent = `${label} 板块`;
        }
    },

    // 绑定参考图P1抽屉开启与关闭
    bindDrawerControls() {
        const drawerBtn = document.getElementById('dockDrawerBtn');
        const drawerCloseBtn = document.getElementById('drawerCloseBtn');
        const drawerMask = document.getElementById('drawerMask');
        const p1Drawer = document.getElementById('p1Drawer');

        const openDrawer = () => {
            drawerMask.classList.add('active');
            p1Drawer.classList.add('active');
        };

        const closeDrawer = () => {
            drawerMask.classList.remove('active');
            p1Drawer.classList.remove('active');
        };

        drawerBtn.addEventListener('click', openDrawer);
        drawerCloseBtn.addEventListener('click', closeDrawer);
        drawerMask.addEventListener('click', closeDrawer);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
