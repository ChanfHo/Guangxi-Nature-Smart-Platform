/**
 * visualization-controls.js
 * 可视化控制主文件，整合各功能模块
 */
import { initVisualizationMenu } from './visualization-menu.js';
import { initDataVisualization } from './visualization-data.js';
import { initMapResetButton } from './visualization-map-reset.js';

// 在文档加载完成后初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
  // 初始化菜单切换功能
  initVisualizationMenu();
  
  // 初始化数据可视化功能
  initDataVisualization();
  
  // 初始化地图重置按钮
  initMapResetButton();
  
});