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

    // 2. 移除所有数据图层 - 修改这里，使用更彻底的重置函数
    resetMapLayersComplete();

    console.log("已重置所有数据图层");
  });

  console.log("重置按钮初始化完成");
}

/**
 * 完整的地图图层重置函数
 * 移除所有POI点和AOI面等图层
 */
/**
 * 完整的地图图层重置函数 - 修复版
 * 移除所有POI点和AOI面等图层，但保留底图
 */
function resetMapLayersComplete() {
  const map = getCurrentMap();
  if (!map) return;
  
  // 先尝试手动移除已知的图层类型
  const layerTypesToRemove = ['mountain', 'water', 'forest', 'cropland', 'sea'];
  layerTypesToRemove.forEach(type => {
    try {
      removeDataLayers(type);
    } catch (e) {
      console.warn(`移除${type}图层时出错:`, e);
    }
  });
  
  // 获取当前地图的所有图层和数据源
  if (!map.getStyle()) return;
  
  // 获取并移除所有非基础图层
  const style = map.getStyle();
  const layers = style.layers || [];
  
  // 需要保留的基础图层前缀和关键词
  const preservePrefixes = ['background', 'mapbox', 'admin', 'county', 'state', 'country'];
  const baseMapKeywords = ['land', 'water', 'road', 'building', 'label', 'symbol', 'place', 'hill'];
  
  // 遍历所有图层并仅移除非底图图层
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];
    // 检查是否为保留的基础图层
    const shouldPreserve = 
      preservePrefixes.some(prefix => layer.id.startsWith(prefix)) || 
      baseMapKeywords.some(keyword => layer.id.includes(keyword)) ||
      (layer.id === 'background') || // 背景图层必须保留
      (layer.source === 'composite'); // composite源通常是底图的一部分

    // 只有POI和AOI等自定义图层才需要移除
    const isCustomLayer = 
      layer.id.includes('POI') || 
      layer.id.includes('AOI') || 
      layer.id.includes('Centers') ||
      layerTypesToRemove.some(type => layer.id.includes(type));
    
    // 只移除自定义图层，保留底图图层
    if (isCustomLayer && !shouldPreserve) {
      try {
        if (map.getLayer(layer.id)) {
          console.log(`移除图层: ${layer.id}`);
          map.removeLayer(layer.id);
        }
      } catch (e) {
        console.warn(`移除图层${layer.id}时出错:`, e);
      }
    }
  }
  
  // 移除所有非基础数据源，但保留底图数据源
  const sources = style.sources || {};
  Object.keys(sources).forEach(sourceId => {
    // 检查是否为底图数据源
    const isBaseSource = 
      preservePrefixes.some(prefix => sourceId.startsWith(prefix)) ||
      sourceId === 'composite' || 
      sourceId === 'mapbox' ||
      sourceId.includes('terrain') ||
      sourceId.startsWith('admin');
    
    // 检查是否为自定义数据源
    const isCustomSource = 
      sourceId.includes('POI') || 
      sourceId.includes('AOI') || 
      sourceId.includes('Centers') ||
      layerTypesToRemove.some(type => sourceId.includes(type));
    
    // 只移除自定义数据源，保留底图数据源
    if (isCustomSource && !isBaseSource) {
      try {
        if (map.getSource(sourceId)) {
          console.log(`移除数据源: ${sourceId}`);
          map.removeSource(sourceId);
        }
      } catch (e) {
        console.warn(`移除数据源${sourceId}时出错:`, e);
      }
    }
  });

  // 移除重新加载样式部分，因为这会导致底图被移除
  // if (Object.keys(map.getStyle().sources).length > 2) { // 这一行被注释掉
  //   reloadMapStyle(map); 
  // }

  console.log("已完成地图重置，保留底图");
}

/**
 * 重新加载地图样式的函数
 * 用于彻底重置地图
 */
function reloadMapStyle(map) {
  const currentStyle = map.getStyle().sprite.split('sprites/')[0];
  const currentCenter = map.getCenter();
  const currentZoom = map.getZoom();
  
  // 保存当前视图状态
  const viewState = {
    center: [currentCenter.lng, currentCenter.lat],
    zoom: currentZoom,
    bearing: map.getBearing(),
    pitch: map.getPitch()
  };
  
  // 重新加载样式
  map.setStyle(`${currentStyle}style.json`);
  
  // 样式加载完成后恢复视图并重新添加基础数据
  map.once('styledata', function() {
    map.setCenter(viewState.center);
    map.setZoom(viewState.zoom);
    map.setBearing(viewState.bearing);
    map.setPitch(viewState.pitch);
    
    // 重新添加行政区数据
    if (typeof addAdminCenters === 'function') {
      addAdminCenters(map, `./geojson/point/admininstrationCenter.geojson`);
    }
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