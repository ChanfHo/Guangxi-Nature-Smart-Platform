/**
 * map-reset.js
 * 提供地图重置功能，用于清除所有数据图层并重新初始化
 */
import { getCurrentMap, removeDataLayers, resetDataButtons } from './visualization-data.js';
import { initializeMaps } from '../index.js';  // 导入初始化函数

/**
 * 初始化地图重置按钮
 */
export function initMapResetButton() {
  const dataButtons = document.getElementById('data-buttons');

  // 检查是否已经存在重置按钮
  if (document.getElementById('reset-visualization')) {
    return;
  }

  // 创建重置按钮
  const resetButton = document.createElement('button');
  resetButton.id = 'reset-visualization';
  resetButton.innerHTML = '<img src="icons/reset.png" alt="重置" class="button-icon"> 重置地图';
  resetButton.classList.add('reset-button');

  // 添加到数据按钮容器
  dataButtons.appendChild(resetButton);

  // 重置按钮点击事件
  resetButton.addEventListener('click', function () {
    // 1. 取消所有数据按钮的激活状态
    resetDataButtons();

    // 2. 移除所有数据图层
    resetMapLayers();

    console.log("已重置所有数据图层");
  });


  console.log("重置按钮初始化完成");
}

/**
 * 重置地图图层函数
 */

function resetMapLayers() {
  // 获取当前地图
  const map = getCurrentMap();
  if (!map) return;

  // 移除所有数据类型的图层
  Object.keys(layerIds).forEach(dataType => {
    removeDataLayers(dataType);
  });
}

/**
 * 激活与当前地图对应的数据按钮
 */
function activateCurrentDataButton() {
  const currentMapIndex = window.currentMapIndex || 0;
  const dataButtons = document.getElementById('data-buttons');
  const targetDataButton = dataButtons.querySelector(`button[data-visual="${currentMapIndex}"]`);

  // 清除其他按钮的激活状态
  dataButtons.querySelectorAll('button').forEach(btn => {
    btn.classList.remove('active');
  });

  // 激活目标按钮
  if (targetDataButton) {
    targetDataButton.classList.add('active');
  }
}