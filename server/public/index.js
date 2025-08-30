// 连接到服务器
const socket = io();

// DOM元素
const loginScreen = document.getElementById('loginScreen');
const chatScreen = document.getElementById('chatScreen');
const usernameInput = document.getElementById('username');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messages = document.getElementById('messages');
const userList = document.getElementById('userList');
const onlineCount = document.getElementById('onlineCount');

// 登录处理
loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        socket.emit('login', username);
        loginScreen.style.display = 'none';
        chatScreen.style.display = 'flex';
        messageInput.focus();
    } else {
        alert('请输入昵称');
    }
});

// 支持按Enter登录
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
});

// 登出处理
logoutBtn.addEventListener('click', () => {
    if (confirm('确定要退出聊天室吗？')) {
        socket.disconnect();
        window.location.reload();
    }
});

// 发送消息
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chatMessage', message);
        messageInput.value = '';
        // 自动调整输入框高度
        adjustTextareaHeight();
    }
});

// 自动调整输入框高度
messageInput.addEventListener('input', adjustTextareaHeight);

function adjustTextareaHeight() {
    // 重置高度以正确计算滚动高度
    messageInput.style.height = 'auto';
    // 设置高度为内容高度，最大4行
    const scrollHeight = messageInput.scrollHeight;
    messageInput.style.height = `${Math.min(scrollHeight, 120)}px`;
}

// 接收消息并显示
socket.on('message', (data) => {
    addMessage(data.username, data.text, data.time, false);
});

// 接收系统消息
socket.on('systemMessage', (message) => {
    const messageElement = document.createElement('div');
    messageElement.className = 'system-message';
    messageElement.innerHTML = `
                <div class="system-message-content">
                    ${message}
                </div>
            `;
    messages.appendChild(messageElement);
    scrollToBottom();
});

// 更新在线用户列表
socket.on('userList', (users) => {
    userList.innerHTML = '';
    users.forEach(user => {
        const userElement = document.createElement('li');
        userElement.className = 'user-item';
        userElement.innerHTML = `
                    <div class="user-status"></div>
                    <span>${user}</span>
                `;
        userList.appendChild(userElement);
    });

    // 更新在线人数
    onlineCount.innerHTML = `<i class="fa fa-users"></i> ${users.length}人在线`;
});

// 添加消息到界面
function addMessage(username, text, time, isOwn = false) {
    const messageElement = document.createElement('div');
    messageElement.className = isOwn ? 'message message-right' : 'message message-left';

    const messageInfoClass = isOwn ? 'message-info message-info-right' : 'message-info message-info-left';
    const messageContentClass = isOwn ? 'message-content message-content-right' : 'message-content message-content-left';
    const infoText = isOwn ? `发送于 ${time}` : `${username} ${time}`;

    messageElement.innerHTML = `
                <div class="${messageInfoClass}">
                    ${infoText}
                </div>
                <div class="${messageContentClass}">
                    ${text}
                </div>
            `;

    messages.appendChild(messageElement);
    scrollToBottom();
}

// 滚动到最新消息
function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
}

// 初始化输入框高度
adjustTextareaHeight();