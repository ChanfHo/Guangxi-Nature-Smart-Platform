function checkUserLogin() {
    document.addEventListener('DOMContentLoaded', function () {
        try {
            const userInfoStr = localStorage.getItem('userInfo');
            console.log('原始用户信息字符串:', userInfoStr);

            if (!userInfoStr) {
                return { isLoggedIn: false, userInfo: null, token: null, username: null };
            }

            const userInfo = JSON.parse(userInfoStr);
            console.log('解析后的用户信息:', userInfo);

            // 增强token查找逻辑
            let token = null;
            if (userInfo.token) {
                token = userInfo.token;
            } else if (userInfo.data && userInfo.data.token) {
                token = userInfo.data.token;
            } else if (userInfo.access_token) {
                token = userInfo.access_token;
            } else if (typeof userInfo === 'string' && userInfo.length > 10) {
                // 如果整个userInfo就是token字符串
                token = userInfo;
            }

            console.log('找到的token:', token);

            // 更详细的登录状态判断
            const isLoggedIn = !!token;

            return {
                isLoggedIn: isLoggedIn,
                userInfo: userInfo,
                token: token,
                username: userInfo.username || (userInfo.data && userInfo.data.username) || null
            };
        } catch (error) {
            console.error('检查登录状态时出错:', error);
            return { isLoggedIn: false, userInfo: null, token: null, username: null };
        }
    })


}