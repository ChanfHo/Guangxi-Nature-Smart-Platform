// 定义路由表，映射路径到对应的页面内容
const routes = {
  './main_interface/test/index.html': '<h1>欢迎来到广西自然资源地理信息公共服务平台</h1>',
  '/map-visualization': '<h1>地图可视化</h1>',
  '/data-visualization': '<h1>数据可视化</h1>',
  '/resources': '<h1>开发资源</h1>',
  '/results': '<h1>成果目录</h1>',
  '/standards': '<h1>标准规范</h1>',
  '/tools': '<h1>工具应用</h1>',
  '/login': '/login/index.html',
  '/register': '<h1>注册页面</h1>',
};

// 初始化路由
function initRouting() {
  // 绑定导航栏链接的点击事件
  document.querySelectorAll('.menu a, .auth a').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault(); // 阻止默认跳转行为
      const path = event.target.getAttribute('href'); // 获取目标路径
      navigateTo(path); // 调用导航函数
    });
  });

  // 监听浏览器的前进/后退按钮
  window.addEventListener('popstate', () => {
    const path = window.location.pathname; // 获取当前路径
    renderContent(path); // 根据路径渲染内容
  });

  // 初始加载时渲染内容
  renderContent(window.location.pathname);
}

// 导航到指定路径
function navigateTo(path) {
  if (!routes[path]) {
    path = '/'; // 如果路径不存在，导航到首页
  }
  window.history.pushState({}, '', path); // 更新浏览器地址栏
  renderContent(path); // 渲染对应的内容
}

// 根据路径渲染内容
function renderContent(path) {
  const content = routes[path] || '<h1>404 页面未找到</h1>'; // 根据路径加载内容
  document.querySelector('main').innerHTML = content; // 替换主内容区域
}

// 初始化路由
initRouting();