// 格式化消息文本
function formatMessage(text) {
    if (!text) return '';
    
    // 处理标题和换行
    let lines = text.split('\n');
    let formattedLines = lines.map(line => {
        // 处理加粗文本（**文本**）
        return line.replace(/\*\*(.*?)\*\*/g, '<span class="bold-text">$1</span>');
    });
    
    // 处理段落分割
    let processedText = formattedLines.join('\n');
    return processedText
        .split('###')
        .filter(section => section.trim())
        .map(section => {
            let lines = section.split('\n').filter(line => line.trim());
            if (!lines.length) return '';

            return lines.map(line => {
                line = line.trim();
                
                // 处理数字标题（如 "1."）
                if (/^\d+\./.test(line)) {
                    return `<p class="section-title">${line}</p >`;
                }
                
                // 处理小标题（以破折号开头）
                if (line.startsWith('-')) {
                    const content = line.substring(1).trim();
                    return `<p class="subsection"><span class="bold-text">${content}</span></p >`;
                }
                
                // 处理带冒号的内容
                const colonIndex = line.indexOf(':');
                if (colonIndex !== -1) {
                    const subtitle = line.substring(0, colonIndex).trim();
                    const content = line.substring(colonIndex + 1).trim();
                    return `<p><span class="subtitle">${subtitle}</span>: ${content}</p >`;
                }
                
                // 普通段落
                return `<p>${line}</p >`;
            }).join('');
        }).join('');
}

// 显示消息（修复XSS漏洞）
function displayMessage(role, message) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;
    
    const avatar = document.createElement('img');
    avatar.src = role === 'user' ? 'user-avatar.png' : 'bot-avatar.png';
    avatar.alt = `${role} avatar`;
    avatar.classList.add('avatar');

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // 安全处理消息内容
    if (role === 'user') {
        messageContent.textContent = message; // 使用textContent防止XSS
    } else {
        messageContent.innerHTML = formatMessage(message);
    }

    messageElement.append(avatar, messageContent);
    messagesContainer.appendChild(messageElement);
    
    // 滚动时保持视口在底部
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// API调用相关改进
function sendMessage() {
    const inputElement = document.getElementById('chat-input');
    const message = inputElement.value.trim();
    if (!message) return;

    displayMessage('user', message);
    inputElement.value = '';
    inputElement.focus();

    // 改进的加载状态处理
    const loadingElement = document.getElementById('loading');
    loadingElement?.classList.add('visible');

    // 安全：API Key应该从安全存储获取
    const apiKey = 'sk-b1d61d37f2a84b72a9323a7c33815d20';
    const endpoint = 'https://api.deepseek.com/chat';

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ${apiKey}'
        },
        body: JSON.stringify({
            model: "deepseek-reasoner",
            messages: [
                { role: "system", content: "You are a helpful assistant" },
                { role: "user", content: "message" }
            ],
            stream: false
        })
    })
    .then(response => {
        if (!response.ok) throw new Error('HTTP error! status: ${response.status}');
        return response.json();
    })
    .then(data => {
        if (data.choices?.[0]?.message?.content) {
            displayMessage('bot', data.choices[0].message.content);
        } else {
            throw new Error('Invalid response structure');
        }
    })
    .catch(error => {
        console.error('API Error:', error);
        displayMessage('bot', '服务暂时不可用，请稍后再试');
    })
    .finally(() => {
        loadingElement?.classList.remove('visible');
    });
}

// 主题切换功能优化
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// 初始化时加载主题设置
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.toggle('dark-mode', localStorage.getItem('darkMode') === 'true');
});

// 事件监听器改进
document.getElementById('chat-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// 下拉菜单改进
document.querySelector('.dropdown').addEventListener('click', function(e) {
    e.stopPropagation();
    this.querySelector('.dropdown-content').classList.toggle('show');
});

// 点击任意位置关闭下拉菜单
document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-content.show').forEach(el => {
        el.classList.remove('show');
    });
});
