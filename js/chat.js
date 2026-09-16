/**
 * SakuraTvT - Chat 模块 & IndexedDB 大容量无损存储引擎
 * 严禁任何网络外链默认图，默认纯灰色块；
 * 采用原生 IndexedDB 无损存储原图二进制 Blob，杜绝 localStorage 爆满黑屏。
 */

const DB_NAME = 'SakuraTvT_DB';
const DB_VERSION = 1;
const STORE_NAME = 'widget_store';

// 1. 初始化 IndexedDB 本地大容量数据库
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

// 2. 从数据库读取字段
async function getDBItem(key) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// 3. 写入数据库（支持无损存储超大图片 Blob / Text）
async function setDBItem(key, value) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ id: key, value: value });
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('IndexedDB 存储失败:', err);
  }
}

// ==========================================
// P1 小组件数据绑定与持久化逻辑 (带全面安全防护)
// ==========================================
async function initP1Widget() {
  const coverBox = document.getElementById('widgetCoverBox');
  const coverBg = document.getElementById('widgetCoverBg');
  const fileInput = document.getElementById('coverFileInput');
  const quoteJp = document.getElementById('quoteJpText');
  const quoteCn = document.getElementById('quoteCnText');
  const btnTranslate = document.getElementById('btnTranslateQuote');
  const timeBadge = document.getElementById('widgetTimeBadge');

  // 1. 加载本地保存的无损原图 (安全判空)
  if (coverBg) {
    const savedCover = await getDBItem('p1_cover_blob');
    if (savedCover instanceof Blob) {
      const url = URL.createObjectURL(savedCover);
      coverBg.style.backgroundImage = `url("${url}")`;
      coverBg.style.backgroundSize = 'cover';
      coverBg.style.backgroundPosition = 'center';
    } else {
      coverBg.style.backgroundColor = '#E5E7EB';
    }
  }

  // 2. 绑定图片上传事件
  if (coverBox && fileInput) {
    coverBox.addEventListener('click', (e) => {
      if (e.target.id === 'widgetTimeBadge') return;
      fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        await setDBItem('p1_cover_blob', file);
        if (coverBg) {
          const url = URL.createObjectURL(file);
          coverBg.style.backgroundImage = `url("${url}")`;
          coverBg.style.backgroundSize = 'cover';
          coverBg.style.backgroundPosition = 'center';
        }
      }
    });
  }

  // 3. 恢复日文语录与持久化
  if (quoteJp) {
    const savedJp = await getDBItem('p1_quote_jp');
    if (savedJp) quoteJp.innerText = savedJp;
    quoteJp.addEventListener('blur', () => {
      setDBItem('p1_quote_jp', quoteJp.innerText.trim());
    });
  }

  // 4. 恢复中文翻译与持久化
  if (quoteCn) {
    const savedCn = await getDBItem('p1_quote_cn');
    if (savedCn) quoteCn.innerText = savedCn;
    quoteCn.addEventListener('blur', () => {
      setDBItem('p1_quote_cn', quoteCn.innerText.trim());
    });
  }

  // 5. 翻译展开/收起切换
  if (btnTranslate && quoteCn) {
    btnTranslate.addEventListener('click', () => {
      quoteCn.style.display = quoteCn.style.display === 'none' ? 'block' : 'none';
    });
  }

  // 6. 时间徽章实时时钟
  function updateLiveTime() {
    if (!timeBadge) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    timeBadge.textContent = `${h}:${m}:${s}`;
  }
  updateLiveTime();
  setInterval(updateLiveTime, 1000);
}

// 页面加载完成后安全启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initP1Widget);
} else {
  initP1Widget();
}
