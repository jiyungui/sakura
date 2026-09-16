/**
 * SakuraTvT · 自由拖动悬浮窗与手风琴目录抽屉交互
 * 采用现代 Pointer Events + PointerCapture 技术，彻底杜绝顶部手势卡死
 */

(function () {
  'use strict';

  const container = document.getElementById('sakuraContainer') || document.body;
  const fab = document.getElementById('draggableFab');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerSidebar = document.getElementById('drawerSidebar');
  const btnDrawerClose = document.getElementById('btnDrawerClose');
  const drawerAppList = document.getElementById('drawerAppList');

  if (!fab) return;

  // =========================================================
  // 1. 现代指针锁定拖拽引擎 (Pointer Events + setPointerCapture)
  // =========================================================
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;
  let hasMoved = false;

  // 初始化悬浮窗坐标 (防出界)
  function initFabPosition() {
    const contRect = container.getBoundingClientRect();
    if (!contRect.width || !contRect.height) return;

    const fabWidth = fab.offsetWidth || 44;
    const fabHeight = fab.offsetHeight || 44;

    const defaultLeft = Math.max(10, contRect.width - fabWidth - 18);
    const defaultTop = Math.max(20, contRect.height - fabHeight - 48);

    fab.style.left = `${defaultLeft}px`;
    fab.style.top = `${defaultTop}px`;
    fab.style.right = 'auto';
    fab.style.bottom = 'auto';
  }

  // 指针按下 (鼠标按下 / 手指触摸)
  fab.addEventListener('pointerdown', function (e) {
    // 仅响应鼠标左键或触摸屏
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;

    const fabRect = fab.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();

    initialLeft = fabRect.left - contRect.left;
    initialTop = fabRect.top - contRect.top;

    fab.style.transition = 'none'; // 拖动时关闭 CSS 动画过渡

    // 关键核心：锁定指针，防止顶部下拉被浏览器系统手势劫持
    try {
      fab.setPointerCapture(e.pointerId);
    } catch (_) {}

    e.preventDefault();
  });

  // 指针移动 (全屏拖动)
  fab.addEventListener('pointermove', function (e) {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // 判定微小位移（防误触：位移 > 4px 算拖拽，否则算点击）
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMoved = true;
    }

    const contRect = container.getBoundingClientRect();
    const fabWidth = fab.offsetWidth || 44;
    const fabHeight = fab.offsetHeight || 44;

    // 计算安全边界（顶部留出 14px 安全余量，杜绝滑入系统状态栏死区）
    const minLeft = 8;
    const maxLeft = contRect.width - fabWidth - 8;
    const minTop = 14; 
    const maxTop = contRect.height - fabHeight - 14;

    let newLeft = Math.max(minLeft, Math.min(initialLeft + dx, maxLeft));
    let newTop = Math.max(minTop, Math.min(initialTop + dy, maxTop));

    fab.style.left = `${newLeft}px`;
    fab.style.top = `${newTop}px`;
    fab.style.right = 'auto';
    fab.style.bottom = 'auto';

    e.preventDefault();
  });

  // 指针抬起 / 取消 (安全复位)
  function finishDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    fab.style.transition = 'box-shadow 0.2s ease, transform 0.15s ease, background 0.15s ease';

    try {
      fab.releasePointerCapture(e.pointerId);
    } catch (_) {}

    // 如果几乎没有位移，说明是纯原地轻点，触发抽屉打开
    if (!hasMoved) {
      openDrawer();
    }
  }

  fab.addEventListener('pointerup', finishDrag);
  fab.addEventListener('pointercancel', finishDrag); // 关键：系统手势打断时安全重置

  // 视口尺寸变化重新校准
  window.addEventListener('resize', initFabPosition);
  setTimeout(initFabPosition, 150);

  // =========================================================
  // 2. 抽屉打开 / 关闭逻辑
  // =========================================================
  function openDrawer() {
    if (drawerOverlay && drawerSidebar) {
      drawerOverlay.classList.add('active');
      drawerSidebar.classList.add('active');
    }
  }

  function closeDrawer() {
    if (drawerOverlay && drawerSidebar) {
      drawerOverlay.classList.remove('active');
      drawerSidebar.classList.remove('active');
    }
  }

  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);
  if (btnDrawerClose) btnDrawerClose.addEventListener('click', closeDrawer);

  // =========================================================
  // 3. 手风琴折叠展开与 Dock 栏联动
  // =========================================================
  if (drawerAppList) {
    drawerAppList.addEventListener('click', function (e) {
      // 3.1 手风琴折叠与展开
      const header = e.target.closest('.drawer-app-header');
      if (header) {
        const appItem = header.closest('.drawer-app-item');
        const isExpanded = appItem.classList.contains('expanded');

        // 单手风琴互斥模式（展开一项自动收起其他）
        document.querySelectorAll('.drawer-app-item.expanded').forEach(item => {
          if (item !== appItem) item.classList.remove('expanded');
        });

        if (isExpanded) {
          appItem.classList.remove('expanded');
        } else {
          appItem.classList.add('expanded');
        }
        return;
      }

      // 3.2 Messages & Chat 9大子项联动 Dock
      const subItem = e.target.closest('.drawer-sub-item');
      if (subItem) {
        const dockTab = subItem.getAttribute('data-dock-tab');
        if (dockTab && typeof window.switchDockTab === 'function') {
          window.switchDockTab(dockTab);
          closeDrawer();
        } else {
          closeDrawer();
        }
      }
    });
  }

})();
