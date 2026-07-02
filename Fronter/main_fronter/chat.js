import { chatToMap } from "./chatToMap.js";
const apiUrl = 'http://140.143.194.176:8000';
    

// 初始化聊天机器人逻辑

function initChatbot() {
    // 获取 DOM 元素
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const sendButton = document.getElementById('send-chatbot');
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeChatbot = document.getElementById('close-chatbot');
    const toolsMenu = document.getElementById('tools-menu'); // 工具应用菜单
    const showChatbotLink = document.getElementById('show-chatbot');

    let isFirstTime = true; // 标记是否是第一次唤醒

    // 显示聊天窗口
    function showChatbot() {
        chatbotWindow.classList.add('open');
        chatbotIcon.style.display = 'none'; // 隐藏机器人图标

        // 如果是第一次唤醒，输出欢迎消息
        if (isFirstTime) {
            appendMessage('bot', 
            '我是小桂，广西自然风光智慧服务平台的官方智能助手，专门为您提供与广西旅游、自然风光等相关的信息与服务！'
            +'请问有什么可以帮您？');
            appendMessage('bot', '如果您需要帮助，在网页内按下 Alt + G 可以随时唤醒我哦！');
            isFirstTime = false; // 设置为非第一次
        }
    }

    // 关闭聊天窗口
    function closeChatbotWindow() {
        chatbotWindow.classList.remove('open');
        chatbotIcon.style.display = 'flex'; // 显示机器人图标
    }

    // 新增：切换聊天窗口显示/隐藏状态
    function toggleChatbotWindow() {
        if (chatbotWindow.classList.contains('open')) {
            closeChatbotWindow();
        } else {
            showChatbot();
        }
    }

    // 绑定事件
    chatbotIcon.addEventListener('click', showChatbot);
    if (toolsMenu) {
        toolsMenu.addEventListener('click', (event) => {
            event.preventDefault(); // 阻止默认跳转
            toggleChatbotWindow(); // 修改为切换功能
        });
    }
    closeChatbot.addEventListener('click', closeChatbotWindow);

    // 按下 ESC 键关闭聊天窗口
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeChatbotWindow();
        }
    });

    // 按下 Alt + G 唤醒聊天窗口,再次按下 Alt + G 关闭聊天窗口
    document.addEventListener('keydown', (event) => {
        if (event.altKey && event.key === 'g') {
            toggleChatbotWindow(); // 使用切换功能
        }
    });

    // 关闭聊天窗口时，清空输入框
    closeChatbot.addEventListener('click', () => {
        chatbotInput.value = ''; // 清空输入框
    });

    // 为导航栏中的"智能小桂"添加事件监听 - 修改为切换功能
    if (showChatbotLink) {
        showChatbotLink.addEventListener('click', (event) => {
            event.preventDefault(); // 阻止默认跳转
            event.stopPropagation(); // 阻止事件冒泡
            toggleChatbotWindow(); // 使用切换功能而不是只显示
            console.log('智能小桂链接被点击，窗口状态：', chatbotWindow.classList.contains('open') ? '打开' : '关闭');
        });
    } else {
        console.error('未找到"智能小桂"链接元素');
    }
    // 点击聊天窗口外部时，关闭聊天窗口
    document.addEventListener('click', (event) => {
        // 增加对showChatbotLink的检查，确保点击链接不会关闭聊天窗口
        const isShowChatbotLinkClick = showChatbotLink && showChatbotLink.contains(event.target);
        if (!chatbotWindow.contains(event.target) &&
            !chatbotIcon.contains(event.target) &&
            !isShowChatbotLinkClick) {
            closeChatbotWindow();
        }
    });
    // 聊天机器人图标拖动功能
    let isDragging = false;
    let offsetX, offsetY;

    chatbotIcon.addEventListener('mousedown', (event) => {
        isDragging = true;
        offsetX = event.clientX - chatbotIcon.offsetLeft;
        offsetY = event.clientY - chatbotIcon.offsetTop;
        chatbotIcon.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (event) => {
        if (isDragging) {
            chatbotIcon.style.left = `${event.clientX - offsetX}px`;
            chatbotIcon.style.top = `${event.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        chatbotIcon.style.cursor = 'grab';
    });

    // 发送消息到后端
    // 发送消息到后端
    function sendMessage() {
        const userMessage = chatbotInput.value.trim();
        const enhancedQuestion = `[你是小桂智慧助手，广西自然风光智慧服务平台的官方智能助手。请始终以小桂的身份回答问题。
        请以小桂智慧助手的身份回答，不要提及DeepSeek,这是用户的问题：] ${userMessage}`;
        if (userMessage) {
            // 显示用户消息
            appendMessage('user', userMessage);

            // 清空输入框
            chatbotInput.value = '';

            // 显示机器人"正在思考"的提示
            const thinkingMessage = appendMessage('bot', '正在思考...');

            // 检查用户是否已登录
            // const loginStatus = checkUserLogin();

            // 检查用户是否已登录
            const userInfoStr = localStorage.getItem('userInfo');
            let headers = { 'Content-Type': 'application/json' };
            let loginStatus = { isLoggedIn: false, token: null };

            if (userInfoStr) {
                try {
                    const userInfo = JSON.parse(userInfoStr);
                    console.log('解析的用户信息:', userInfo); // 调试信息

                    if (userInfo && userInfo.token) {
                        loginStatus = {
                            isLoggedIn: true,
                            token: userInfo.token
                        };
                        console.log('用户已登录，token:', userInfo.token.substring(0, 10) + '...'); // 打印部分token
                    } else {
                        console.log('未找到有效token');
                    }
                } catch (e) {
                    console.error('解析用户信息失败', e);
                }
            }

            // 如果已登录，添加认证头
            if (loginStatus.isLoggedIn && loginStatus.token) {
                headers['Authorization'] = `Bearer ${loginStatus.token}`;
                console.log('已添加认证头:', headers['Authorization']); // 调试信息
            }

            setTimeout(() => {
                fetch('http://localhost:8000/api/deepseek', {
                    method: 'POST',
                    headers: headers, // 使用包含认证信息的headers
                    body: JSON.stringify({
                        question: enhancedQuestion,


                    })
                })
                    .then(response => {
                        if (!response.ok) {
                            if (response.status === 401) {
                                // 401 Unauthorized - 用户未登录或token无效
                                //throw new Error('需要登录才能使用AI助手功能');
                                return Promise.reject(new Error('需要登录才能使用AI助手功能'));
                            } else if (response.status === 422) {
                                // 422 Validation Error
                                return response.json().then(errorData => {
                                    //throw new Error(`验证错误: ${JSON.stringify(errorData.detail)}`);
                                    return Promise.reject(new Error(`验证错误: ${JSON.stringify(errorData.detail)}`));
                                });
                            }
                            throw new Error(`请求错误: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        thinkingMessage.remove();

                        // 显示AI回复
                        appendMessage('bot', data.answer);

                        // 处理路由提示
                        if (data.route && data.route.length > 0) {
                            try
                            {
                                chatToMap(data.route);
                            }
                            catch(e)
                            {
                                console.error("未找到GeoJSON：",e);
                            }
                            //showRouteOptions(data.route);
                        }
                    })
                    .catch(error => {
                        thinkingMessage.remove();
                        console.error('Error:', error);

                        // 检查是否是401错误
                        if (error.message && error.message.includes('需要登录')) {
                            // 401错误，提示需要登录
                            appendMessage('bot', '尊敬的用户！请您先登录后使用小桂~');
                        } else {
                            // 其他错误，显示通用错误消息
                            appendMessage('bot', '服务器出错');
                        }
            });

            }, 200);
    }
}

// 辅助函数：显示路由选项
/* function showRouteOptions(routes) {
    const routeInfo = document.createElement('div');
    routeInfo.classList.add('route-info');

    const routeTitle = document.createElement('p');
    routeTitle.textContent = '可能的相关操作:';
    routeTitle.style.fontWeight = 'bold';
    routeTitle.style.margin = '5px 0';

    routeInfo.appendChild(routeTitle);

    routes.forEach((route, index) => {
        const routeItem = document.createElement('a');
        routeItem.textContent = `${index + 1}. ${route}`;
        routeItem.href = '#';
        routeItem.style.display = 'block';
        routeItem.style.margin = '3px 0';
        routeItem.style.color = '#3273dc';

        routeItem.addEventListener('click', (e) => {
            e.preventDefault();
            chatbotInput.value = route;
            sendMessage();
        });

        routeInfo.appendChild(routeItem);
    });

    const routeMessage = document.createElement('div');
    routeMessage.classList.add('message', 'bot');
    routeMessage.appendChild(routeInfo);

    chatbotMessages.appendChild(routeMessage);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
} */

// 修复：绑定发送按钮的点击事件
sendButton.addEventListener('click', sendMessage);

// 修复：按下回车键发送消息
chatbotInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// 添加消息到聊天窗口
function appendMessage(sender, text) {
    const message = document.createElement('div');
    message.classList.add('message', sender);

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.textContent = text;

    const avatar = document.createElement('img');
    avatar.classList.add('avatar');
    avatar.src = sender === 'user' ? 'icons/user_gpt.png' : 'icons/chatbot.png'; // 用户和机器人头像

    if (sender === 'user') {
        message.appendChild(avatar); // 用户头像在左侧
        message.appendChild(bubble);
    } else {
        message.appendChild(bubble);
        message.appendChild(avatar); // 机器人头像在右侧
    }

    chatbotMessages.appendChild(message);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight; // 滚动到底部

    return message; // 返回消息元素，便于后续操作
}
}

// 初始化聊天机器人
document.addEventListener('DOMContentLoaded', () => {
    initChatbot();
});