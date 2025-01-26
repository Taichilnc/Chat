// 获取 DOM 元素
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

// DeepSeek API 配置
const apiKey = "sk-b1d61d37f2a84b72a9323a7c33815d20"; // 替换为实际 API 密钥
const apiEndpoint = "https://api.deepseek.com/v1/chat"; // DeepSeek API 端点

// 当前主题状态
let isDarkMode = false;

// 切换主题
themeToggle.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    body.classList.toggle("dark-mode", isDarkMode);
    themeToggle.textContent = isDarkMode ? "切换到浅色" : "切换到深色";
});

// 添加用户消息到聊天框
function addUserMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message user-message";

    const avatar = document.createElement("img");
    avatar.src = "user-avatar.png";
    avatar.alt = "User Avatar";
    avatar.className = "avatar";

    const text = document.createElement("div");
    text.textContent = message;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(text);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 添加 AI 消息到聊天框
function addBotMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message bot-message";

    const avatar = document.createElement("img");
    avatar.src = "bot-avatar.png";
    avatar.alt = "Bot Avatar";
    avatar.className = "avatar";

    const text = document.createElement("div");
    text.textContent = message;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(text);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 发送用户消息到 DeepSeek API
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // 显示用户消息
    addUserMessage(message);
    userInput.value = "";

    // 显示加载状态
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "chat-message bot-message";

    const loadingAvatar = document.createElement("img");
    loadingAvatar.src = "bot-avatar.png";
    loadingAvatar.alt = "Bot Avatar";
    loadingAvatar.className = "avatar";

    const loadingText = document.createElement("div");
    loadingText.textContent = "正在思考...";

    loadingMessage.appendChild(loadingAvatar);
    loadingMessage.appendChild(loadingText);
    chatBox.appendChild(loadingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                prompt: message,
                max_tokens: 100,
            }),
        });

        const data = await response.json();
        chatBox.removeChild(loadingMessage);

        if (data.response) {
            addBotMessage(data.response);
        } else {
            addBotMessage("抱歉，我无法理解您的问题。");
        }
    } catch (error) {
        chatBox.removeChild(loadingMessage);
        addBotMessage("网络错误，请稍后再试。");
        console.error("Error:", error);
    }
}

// 按钮点击事件
sendBtn.addEventListener("click", sendMessage);

// 输入框按下 Enter 键事件
userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});
