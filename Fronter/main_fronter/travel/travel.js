/**
 * 广西旅游路线推荐 - 主JavaScript文件
 * 文件路径: /home/ubuntu/ComputerDesign/Fronter/main_fronter/travel/travel.js
 * 
 * 负责初始化应用程序、加载资源和协调各个模块
 */

// 全局变量和配置
const MAPBOX_TOKEN = 'your_mapbox_access_token_here'; // 请替换为你自己的 MapBox Token
mapboxgl.accessToken = MAPBOX_TOKEN;


// 在travel.js中禁用Mapbox遥测，解决DNS错误
mapboxgl.config.SEND_EVENTS = false;


// 加载地图模块、路线数据和UI模块
document.addEventListener('DOMContentLoaded', () => {
  // 初始化地图
  MapModule.initMainMap();
  
  // 加载路线数据
  DataModule.loadAllRouteData().then(() => {
    // 默认显示第一条路线
    MapModule.showRouteOnMap(1);
    
    // 检查URL参数是否需要显示特定路线的详情
    const urlParams = new URLSearchParams(window.location.search);
    const routeParam = urlParams.get('route');
    if (routeParam && routeParam >= 1 && routeParam <= 4) {
      setTimeout(() => UIModule.showRouteDetail(parseInt(routeParam)), 500);
    }
  });
  
  // 设置UI交互
  UIModule.setupEventListeners();
  UIModule.initScrollEffects();
});