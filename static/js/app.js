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

      // 绑定参考图P1抽屉开启、关闭及14大APP子板块快速跳转
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

              // 1. 手风琴折叠展开交互 (点击 APP 标题行)
        const secTitles = document.querySelectorAll('.p1-drawer .sec-title');
        secTitles.forEach(title => {
            title.addEventListener('click', (e) => {
                e.stopPropagation();
                const parentSec = title.closest('.drawer-section');
                const isExpanded = parentSec.classList.contains('expanded');

                // 手风琴模式：收起其它板块
                document.querySelectorAll('.p1-drawer .drawer-section').forEach(sec => {
                    if (sec !== parentSec) sec.classList.remove('expanded');
                });

                // 切换当前板块展开/折叠
                parentSec.classList.toggle('expanded', !isExpanded);
            });
        });

        // 2. 抽屉子板块快速跳转 & 联动 Dock
        const subLinks = document.querySelectorAll('.p1-drawer .sub-link');
        subLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
                subLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                const jumpTarget = link.getAttribute('data-jump');
                const action = link.getAttribute('data-action');

                // 联动左侧Dock与主面板切换
                this.switchModule(jumpTarget);

                // 若是返回 Chat 对话主页
                if (jumpTarget === 'chat' && action === 'chat-home' && typeof ChatModule !== 'undefined') {
                    ChatModule.closeChatRoom();
                }

                // 自动收起抽屉
                closeDrawer();
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
