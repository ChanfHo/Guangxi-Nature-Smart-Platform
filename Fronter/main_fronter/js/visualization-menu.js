import { checkLayersExistence } from './visualization-data.js';

export function initVisualizationMenu() {
  // 获取按钮和菜单元素
  const mapVisMenu = document.getElementById('map-vis-menu');
  const dataVisMenu = document.getElementById('data-vis-menu');
  const mapButtons = document.getElementById('map-buttons');
  const dataButtons = document.getElementById('data-buttons');
  
  // 切换到地图可视化
  function showMapVisualization() {
    mapVisMenu.classList.add('menu-active');
    dataVisMenu.classList.remove('menu-active');
    
    mapButtons.classList.add('visible');
    dataButtons.classList.remove('visible');
  }
  
  // 切换到数据可视化
  function showDataVisualization() {
    dataVisMenu.classList.add('menu-active');
    mapVisMenu.classList.remove('menu-active');
    
    dataButtons.classList.add('visible');
    mapButtons.classList.remove('visible');
    
    // 根据当前地图上已有的图层更新按钮状态
    updateButtonStates();
  }
  
  // 更新按钮状态函数
  function updateButtonStates() {
    // 检查每个数据类型的图层是否存在，并更新对应按钮状态
    const layerExistence = checkLayersExistence();
    
    dataButtons.querySelectorAll('button[data-visual]').forEach(button => {
      const visualType = button.getAttribute('data-visual');
      const dataType = getDataTypeFromVisualType(visualType);
      
      // 根据图层是否存在设置按钮状态
      if (layerExistence[dataType]) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }
  
  // 从可视化类型获取数据类型
  function getDataTypeFromVisualType(visualType) {
    switch (visualType) {
      case '0': return 'mountain';
      case '1': return 'water';
      case '2': return 'forest';
      case '3': return 'cropland';
      case '4': return 'sea';
      default: return null;
    }
  }
  
  // 事件监听器
  mapVisMenu.addEventListener('click', function(e) {
    e.preventDefault();
    showMapVisualization();
  });
  
  dataVisMenu.addEventListener('click', function(e) {
    e.preventDefault();
    showDataVisualization();
  });
  
  // 初始化显示地图可视化
  showMapVisualization();
  
  console.log("菜单切换功能初始化完成");
}

// 导出更新按钮状态函数，以便其他模块调用
export function updateDataButtonStates() {
  const dataButtons = document.getElementById('data-buttons');
  const layerExistence = checkLayersExistence();
  
  dataButtons.querySelectorAll('button[data-visual]').forEach(button => {
    const visualType = button.getAttribute('data-visual');
    const dataType = getDataTypeFromVisualType(visualType);
    
    if (layerExistence[dataType]) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

function getDataTypeFromVisualType(visualType) {
  switch (visualType) {
    case '0': return 'mountain';
    case '1': return 'water';
    case '2': return 'forest';
    case '3': return 'cropland';
    case '4': return 'sea';
    default: return null;
  }
}