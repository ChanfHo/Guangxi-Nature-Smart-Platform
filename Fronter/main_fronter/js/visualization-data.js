/**
 * visualization-data.js
 * 处理数据可视化按钮的交互和数据图层的添加/删除
 */
import { addMountainPOI } from './addMountainPOI.js';
import { addWaterPOI } from './addWaterPOI.js';
import { addForestAOI } from './addForestAOI.js';
import { addCropLandPOI } from './addCropLandPOI.js';
import { addSeaAOI } from './addSeaAOI.js';
import { addNFPPpoi } from './addNFPPPOI.js';
import { addNGPPpoi } from './addNGPPPOI.js';
import { addSALP5Apoi } from './add5APOI.js';
import { addSALP4Apoi } from './add4APOI.js';
// 定义图层ID和源ID，便于管理
const layerIds = {
  mountain: ['mountainPOI-layer'],
  water: ['waterPOI-layer'],
  forest: ['forestAOI-layer', 'forestAOI-outline', 'forestAOI-labels', 'forestCenters-layer'],
  cropland: ['cropLandPOI-layer'],
  sea: ['seaAOI-layer', 'seaAOI-outline', 'seaAOI-labels', 'seaCenters-layer'],
  nfpp: ['nfpp-layer'],
  ngpp: ['ngpp-layer'],
  salp5a: ['salp5a-layer'],
  salp4a: ['salp4a-layer']
};

const sourceIds = {
  mountain: ['mountainPOI'],
  water: ['waterPOI'],
  forest: ['forestAOI', 'forestCenters'],
  cropland: ['cropLandPOI'],
  sea: ['seaAOI', 'seaCenters'],
  nfpp: ['nfpp-source'],
  ngpp: ['ngpp-source'],
  salp5a: ['salp5a-source'],
  salp4a: ['salp4a-source']
};

/**
 * 初始化数据可视化功能
 */
export function initDataVisualization() {
  const dataButtons = document.getElementById('data-buttons');

  // 处理数据可视化按钮的点击事件
  dataButtons.querySelectorAll('button[data-visual]').forEach(button => {
    button.addEventListener('click', function () {
      const visualType = this.getAttribute('data-visual');
      const dataType = getDataTypeFromVisualType(visualType);

      // 根据图层是否存在决定添加或移除
      const layerExists = checkLayerExists(dataType);

      if (layerExists) {
        // 如果图层已存在，则移除图层并取消激活按钮
        this.classList.remove('active');
        removeDataLayers(dataType);
        console.log(`已移除 ${dataType} 数据图层`);
      } else {
        // 图层不存在，则添加图层并激活按钮
        this.classList.add('active');
        addDataLayers(visualType);
        console.log(`已添加 ${dataType} 数据图层`);
      }
    });
  });

  console.log("数据可视化按钮初始化完成");
}

/**
 * 检查指定数据类型的图层是否存在
 */
function checkLayerExists(dataType) {
  const map = getCurrentMap();
  if (!map || !layerIds[dataType]) return false;

  // 只要有一个图层存在，就认为该数据类型存在
  return layerIds[dataType].some(layerId => map.getLayer(layerId));
}
/**
 * 获取当前活动的地图，DOM与Javascript执行顺序问题
 * 需要在地图加载完成后才能获取到地图实例
 * @returns {mapboxgl.Map} 当前活动的地图实例
 */
/**
 * 获取当前活动的地图
 */
export function getCurrentMap() {
  const mapIndex = window.currentMapIndex || 0;
  const map = window.maps[mapIndex]
  console.log(`当前地图索引: ${mapIndex}`);
  return map;
}
/**
 * 从可视化类型获取数据类型
 */
function getDataTypeFromVisualType(visualType) {
  switch (visualType) {
    case '0': return 'mountain';
    case '1': return 'water';
    case '2': return 'forest';
    case '3': return 'cropland';
    case '4': return 'sea';
    case "5": return 'nfpp';
    case "6": return 'ngpp';
    case "7": return 'salp5a';
    case "8": return 'salp4a';

    default: return null;
  }
}

function addDataLayers(visualType) {
  const map = getCurrentMap();
  if (!map) {
    console.error('无法获取当前地图实例');
    return;
  }



  // 检查地图是否已加载完成
  function addLayer() {
    switch (visualType) {
      case '0':
        console.log(`正在添加数据图层类型: ${visualType}，山`);
        addMountainPOI(map, './geojson/point/moutain_IniPOI.geojson');
        break;
      case '1':
        console.log(`正在添加数据图层类型: ${visualType}，水`);
        addWaterPOI(map, './geojson/point/water_IniPOI.geojson');
        break;
      case '2':
        console.log(`正在添加数据图层类型: ${visualType}，林`);
        addForestAOI(map, './geojson/polygon/forest_IniAOI.geojson');
        break;
      case '3':
        console.log(`正在添加数据图层类型: ${visualType}，田`);
        addCropLandPOI(map, './geojson/point/cropLand_IniPOI.geojson');
        break;
      case '4':
        console.log(`正在添加数据图层类型: ${visualType}，海`);
        addSeaAOI(map, './geojson/polygon/Sea_IniAOI.geojson');
        break;
      case '5': // 国家森林公园
        addNFPPpoi(map, './geojson/point/NFPP.geojson');
        break;
      case '6': // 国家地质公园
        addNGPPpoi(map, './geojson/point/NGPP.geojson');
        break;
      case '7': // 5A级景区
        addSALP5Apoi(map, './geojson/point/SALP_5A.geojson');
        break;
      case '8': // 4A级景区
        addSALP4Apoi(map, './geojson/point/SALP_4A.geojson');
        break;
    }
  }

  if (map.loaded()) {
    addLayer();
  } else {
    map.once('load', addLayer);
  }
}

/**
 * 移除数据图层
 */
export function removeDataLayers(dataType) {
  const map = getCurrentMap();
  if (!map || !dataType) return;

  // 移除图层
  if (layerIds[dataType]) {
    layerIds[dataType].forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
    });
  }

  // 移除数据源
  if (sourceIds[dataType]) {
    sourceIds[dataType].forEach(sourceId => {
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    });
  }
}

/**
 * 检查各数据类型的图层是否存在
 * @returns {Object} 包含各数据类型图层存在状态的对象
 */
export function checkLayersExistence() {
  const map = getCurrentMap();
  if (!map) return {};

  const result = {
    mountain: false,
    water: false,
    forest: false,
    cropland: false,
    sea: false
  };

  // 检查每种数据类型的图层是否存在
  Object.keys(layerIds).forEach(dataType => {
    // 只要有一个图层存在，就认为该数据类型存在
    const exists = layerIds[dataType].some(layerId => map.getLayer(layerId));
    result[dataType] = exists;
  });

  return result;
}

/**
 * 重置所有数据可视化按钮的状态
 */
export function resetDataButtons() {
  const dataButtons = document.getElementById('data-buttons');
  dataButtons.querySelectorAll('button[data-visual]').forEach(btn => {
    btn.classList.remove('active');
  });
}

/**
 * 获取图层ID和源ID
 */
export function getLayerAndSourceIds() {
  return { layerIds, sourceIds };
}