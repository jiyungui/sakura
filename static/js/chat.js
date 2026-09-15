/**
 * AA Phone - IndexedDB 大容量无损存储系统
 * 采用原生数据库存储原始图片 Blob 与组件资料，彻底杜绝 localStorage 爆满黑屏
 */
const AAStorage = {
    dbName: 'AAPhoneDB',
    version: 1,
    storeName: 'widgetStore',
    db: null,

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this.db);
            };
            request.onerror = (e) => reject(e);
        });
    },

    async set(key, value) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([this.storeName], 'readwrite');
            const store = tx.objectStore(this.storeName);
            const req = store.put(value, key);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },

    async get(key) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([this.storeName], 'readonly');
            const store = tx.objectStore(this.storeName);
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }
};

/**
 * 顶部 P1 小组件控制器
 */
const ProfileWidget = {
    defaultData: {
        name: 'Sakura',
        handle: '@Sakura003',
        bio: 'Complete loneliness means waking up',
        followers: '13.14K',
        posts: '10'
    },

    async init() {
        await AAStorage.init();
        await this.loadData();
        this.bindEvents();
    },

    async loadData() {
        // 读取文字信息
        const savedText = await AAStorage.get('profile_text');
        const textData = Object.assign({}, this.defaultData, savedText || {});
        this.applyText(textData);

             // 读取 Banner 原图 (无损 Blob) 与 位置偏移
        const bannerBlob = await AAStorage.get('profile_banner_blob');
        const bannerPos = (await AAStorage.get('profile_banner_pos')) || { x: 50, y: 50 };
        if (bannerBlob) {
            const url = URL.createObjectURL(bannerBlob);
            const bannerEl = document.getElementById('bannerImg');
            bannerEl.style.backgroundImage = `url("${url}")`;
            bannerEl.style.backgroundPosition = `${bannerPos.x}% ${bannerPos.y}%`;
        }

        // 读取 头像 原图 (无损 Blob)
        const avatarBlob = await AAStorage.get('profile_avatar_blob');
        if (avatarBlob) {
            const url = URL.createObjectURL(avatarBlob);
            document.getElementById('avatarImg').style.backgroundImage = `url("${url}")`;
        }
    },

    applyText(data) {
        document.getElementById('pwName').textContent = data.name;
        document.getElementById('pwHandle').textContent = data.handle;
        document.getElementById('pwBio').textContent = data.bio;
        document.getElementById('pwFollowers').textContent = data.followers;
        document.getElementById('pwPosts').textContent = data.posts;
    },

    bindEvents() {
        const bannerBox = document.getElementById('bannerBox');
        const bannerInput = document.getElementById('bannerInput');
        const avatarBox = document.getElementById('avatarBox');
        const avatarInput = document.getElementById('avatarInput');

        // 点击更换 Banner (原图无损存入 IndexedDB)
              // 点击更换 Banner -> 选图后唤起位置微调弹窗
        let pendingBannerFile = null;
        const cropMask = document.getElementById('bannerCropModalMask');
        const cropImg = document.getElementById('cropPreviewImg');
        const sliderY = document.getElementById('bannerPosY');
        const sliderX = document.getElementById('bannerPosX');
        const cropCloseBtn = document.getElementById('cropCloseBtn');
        const saveCropBtn = document.getElementById('saveBannerCropBtn');

        bannerBox.addEventListener('click', () => bannerInput.click());
        bannerInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            pendingBannerFile = file;

            // 打开微调弹窗并装载预览
            const tempUrl = URL.createObjectURL(file);
            cropImg.style.backgroundImage = `url("${tempUrl}")`;
            sliderX.value = 50;
            sliderY.value = 50;
            cropImg.style.backgroundPosition = `50% 50%`;
            cropMask.classList.add('open');
            bannerInput.value = ''; // 重置以允许重复选同张图
        });

        // 滑块实时调节预览
        const updateCropPos = () => {
            cropImg.style.backgroundPosition = `${sliderX.value}% ${sliderY.value}%`;
        };
        sliderX.addEventListener('input', updateCropPos);
        sliderY.addEventListener('input', updateCropPos);

        // 关闭弹窗
        cropCloseBtn.addEventListener('click', () => {
            cropMask.classList.remove('open');
            pendingBannerFile = null;
        });

        // 确认保存原图与位置
        saveCropBtn.addEventListener('click', async () => {
            if (!pendingBannerFile) return;
            const pos = { x: sliderX.value, y: sliderY.value };
            
            // 无损存入 IndexedDB
            await AAStorage.set('profile_banner_blob', pendingBannerFile);
            await AAStorage.set('profile_banner_pos', pos);

            // 应用到页面
            const url = URL.createObjectURL(pendingBannerFile);
            const bannerEl = document.getElementById('bannerImg');
            bannerEl.style.backgroundImage = `url("${url}")`;
            bannerEl.style.backgroundPosition = `${pos.x}% ${pos.y}%`;

            cropMask.classList.remove('open');
            pendingBannerFile = null;
        });

        // 点击更换 头像 (原图无损存入 IndexedDB)
        avatarBox.addEventListener('click', () => avatarInput.click());
        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            await AAStorage.set('profile_avatar_blob', file);
            const url = URL.createObjectURL(file);
            document.getElementById('avatarImg').style.backgroundImage = `url("${url}")`;
        });

        // 资料弹窗逻辑
        const editBtn = document.getElementById('editProfileBtn');
        const mask = document.getElementById('profileModalMask');
        const closeBtn = document.getElementById('modalCloseBtn');
        const saveBtn = document.getElementById('modalSaveBtn');

              editBtn.addEventListener('click', async () => {
            const current = (await AAStorage.get('profile_text')) || this.defaultData;
            document.getElementById('editInputName').value = current.name || '';
            document.getElementById('editInputHandle').value = current.handle || '';
            document.getElementById('editInputBio').value = current.bio || '';
            document.getElementById('editInputFollowers').value = current.followers || '';
            document.getElementById('editInputPosts').value = current.posts || '';
            mask.classList.add('open');
        });

        const closeModal = () => mask.classList.remove('open');
        closeBtn.addEventListener('click', closeModal);
        mask.addEventListener('click', (e) => {
            if (e.target === mask) closeModal();
        });

              saveBtn.addEventListener('click', async () => {
            const updated = {
                name: document.getElementById('editInputName').value.trim() || 'Sakura',
                handle: document.getElementById('editInputHandle').value.trim() || '@Sakura003',
                bio: document.getElementById('editInputBio').value.trim() || 'Complete loneliness means waking up',
                followers: document.getElementById('editInputFollowers').value.trim() || '0',
                posts: document.getElementById('editInputPosts').value.trim() || '0'
            };
            await AAStorage.set('profile_text', updated);
            this.applyText(updated);
            closeModal();
        });
    }
};

/**
 * 聊天会话列表与对话流总控 (默认纯灰头像，不请求外部网络图片)
 */
const ChatModule = {
    activeChatId: null,

    init() {
        ProfileWidget.init();
        this.loadChatList();
        this.bindEvents();
    },

      bindEvents() {
        const backBtn = document.getElementById('roomBackBtn');
        const sendBtn = document.getElementById('sendBtn');
        const chatInput = document.getElementById('chatInput');
        const addCharBtn = document.getElementById('addCharacterBtn');

        // 新增角色按钮事件监听
        if (addCharBtn) {
            addCharBtn.addEventListener('click', () => {
                console.log('点击了新增角色');
                // 后续将直接在此唤起创建角色的抽屉或弹窗
            });
        }

        backBtn.addEventListener('click', () => {
            this.closeChatRoom();
        });

        sendBtn.addEventListener('click', () => {
            this.handleSendMessage();
        });

        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSendMessage();
            }
        });
    },

    async loadChatList() {
        try {
            const res = await fetch('/api/chat/list');
            const result = await res.json();
            if (result.code === 0) {
                this.renderChatList(result.data);
            }
        } catch (err) {
            console.error('Failed to load chat list:', err);
        }
    },

    renderChatList(list) {
        const container = document.getElementById('chatListContainer');
        container.innerHTML = '';

        list.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'chat-item';
            itemEl.setAttribute('data-id', item.id);

            // 纯灰默认头像占位，严禁外部网络图
            itemEl.innerHTML = `
                <div class="item-avatar-placeholder"></div>
                <div class="item-content" style="margin-left: 12px;">
                    <div class="item-top">
                        <span class="item-name">${item.title}</span>
                        <span class="item-time">${item.time}</span>
                    </div>
                    <div class="item-bottom">
                        <span class="item-msg">${item.last_message}</span>
                    </div>
                </div>
            `;

            itemEl.addEventListener('click', () => {
                this.openChatRoom(item.id);
            });

            container.appendChild(itemEl);
        });
    },

    async openChatRoom(chatId) {
        this.activeChatId = chatId;
        try {
            const res = await fetch(`/api/chat/detail/${chatId}`);
            const result = await res.json();
            if (result.code === 0) {
                const data = result.data;
                document.getElementById('roomTitle').textContent = data.title;
                document.getElementById('roomSubtitle').textContent = data.sub_title;

                this.renderMessages(data.history);
                document.getElementById('chatListView').classList.add('slide-left');
                document.getElementById('chatRoomView').classList.add('open');
                this.scrollToBottom();
            }
        } catch (err) {
            console.error('Failed to open chat room:', err);
        }
    },

    closeChatRoom() {
        this.activeChatId = null;
        document.getElementById('chatListView').classList.remove('slide-left');
        document.getElementById('chatRoomView').classList.remove('open');
    },

    renderMessages(history) {
        const container = document.getElementById('roomMessages');
        container.innerHTML = '';

        (history || []).forEach(msg => {
            const row = document.createElement('div');
            row.className = `bubble-row ${msg.sender}`;
            row.innerHTML = `
                <div class="bubble-box">${this.escapeHtml(msg.text)}</div>
                ${msg.time ? `<span class="bubble-time">${msg.time}</span>` : ''}
            `;
            container.appendChild(row);
        });
    },

    async handleSendMessage() {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        if (!text || !this.activeChatId) return;

        input.value = '';
        const container = document.getElementById('roomMessages');
        const tempRow = document.createElement('div');
        tempRow.className = 'bubble-row me';
        tempRow.innerHTML = `
            <div class="bubble-box">${this.escapeHtml(text)}</div>
            <span class="bubble-time">刚刚</span>
        `;
        container.appendChild(tempRow);
        this.scrollToBottom();

        try {
            await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: this.activeChatId,
                    text: text
                })
            });
            this.loadChatList();
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    },

    scrollToBottom() {
        const container = document.getElementById('roomMessages');
        container.scrollTop = container.scrollHeight;
    },

    escapeHtml(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ChatModule.init();
});
