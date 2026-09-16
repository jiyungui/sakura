/**
 * SakuraTvT · 左侧靠上悬浮 Dock 栏切换逻辑
 */

(function () {
  'use strict';

  const dock = document.getElementById('floatingDock');
  if (!dock) return;

  const dockButtons = dock.querySelectorAll('.dock-item');
  const tabViews = document.querySelectorAll('.tab-view');

  function switchDockTab(tabId) {
    if (!tabId) return;

    // 1. 更新 Dock 按钮激活高亮态
    dockButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 2. 切换主视口 Tab 内容
    tabViews.forEach(view => {
      if (view.id === `view-${tabId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });
  }

  // 挂载至全局 window 供抽屉目录栏跨组件联动调用
  window.switchDockTab = switchDockTab;

  // 监听 Dock 栏点击事件
  dock.addEventListener('click', function (e) {
    const btn = e.target.closest('.dock-item');
    if (!btn) return;

    const tabId = btn.getAttribute('data-tab');
    if (tabId) {
      switchDockTab(tabId);
    }
  });
})();
