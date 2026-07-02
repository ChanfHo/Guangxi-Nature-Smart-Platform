import { addAdminCenters } from './addAdminCenters.js';

/**
 * 初始化地图到基础状态，移除所有POI和AOI图层，只保留行政区数据
 * @param {mapboxgl.Map} map - 要初始化的地图实例
 * @param {Object} config - 地图配置，包含center, zoom等参数
 * @param {string} adminDataPath - 行政区数据的GeoJSON文件路径
 * @returns {Promise} - 返回Promise，初始化完成后resolved
 */
export function initializeMap(map, config, adminDataPath = './geojson/point/admininstrationCenter.geojson') {
  return new Promise((resolve, reject) => {
    // 确保地图已加载
    if (map.loaded()) {
      resetMap();
    } else {
      map.on('load', resetMap);
    }

    function resetMap() {
      try {
        // 1. 移除所有已添加的图层和数据源
        removeAllCustomLayers();

        // 2. 重置地图视角
        resetMapView();

        // 3. 重新添加行政区数据
        addAdminCenters(map, adminDataPath);

        resolve(map);
      } catch (error) {
        console.error('初始化地图时发生错误:', error);
        reject(error);
      }
    }

    /**
     * 移除所有自定义图层和数据源
     */
    function removeAllCustomLayers() {
      // 已知的数据图层ID前缀
      const layerPrefixes = [
        'mountain', 'water', 'forest', 'cropLand', 'sea',
        'POI', 'AOI', 'Centers'
      ];

      // 获取所有地图图层
      const layers = map.getStyle().layers;

      // 首先移除图层
      layers.forEach(layer => {
        const id = layer.id;
        
        // 检查是否是自定义图层
        const isCustomLayer = layerPrefixes.some(prefix => id.includes(prefix)) || 
                           (id !== 'background' && !id.startsWith('mapbox'));
        
        if (isCustomLayer && map.getLayer(id)) {
          map.removeLayer(id);
        }
      });

      // 然后移除数据源
      const sources = Object.keys(map.getStyle().sources);
      
      sources.forEach(sourceId => {
        // 检查是否是自定义数据源
        const isCustomSource = layerPrefixes.some(prefix => sourceId.includes(prefix)) || 
                            (!sourceId.startsWith('mapbox') && sourceId !== 'composite');
        
        if (isCustomSource && map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      });

      // 移除所有使用Feature State的状态
      map.removeFeatureState({
        source: '*'
      });

      // 删除所有自定义图像
      const images = map.listImages();
      images.forEach(imageName => {
        if (!imageName.startsWith('mapbox') && imageName !== 'background') {
          map.removeImage(imageName);
        }
      });
    }

    /**
     * 重置地图视角到初始配置
     */
    function resetMapView() {
      if (config) {
        // 使用配置中的参数设置视角
        map.jumpTo({
          center: config.center || [109.279, 23.90],
          zoom: config.zoom || 6.8,
          bearing: config.bearing || 0,
          pitch: config.pitch || 0
        });
      } else {
        // 使用默认视角
        map.jumpTo({
          center: [109.279, 23.90],
          zoom: 6.8,
          bearing: 0,
          pitch: 0
        });
      }
    }
  });
}

/**
 * 初始化所有地图实例
 * @param {Array<mapboxgl.Map>} maps - 地图实例数组
 * @param {Array<Object>} configs - 地图配置数组
 * @param {string} adminDataPath - 行政区数据的GeoJSON文件路径
 * @returns {Promise} - 返回Promise，所有地图初始化完成后resolved
 */
export function initializeAllMaps(maps, configs, adminDataPath = './geojson/point/admininstrationCenter.geojson') {
  const promises = maps.map((map, index) => {
    const config = configs[index] || null;
    return initializeMap(map, config, adminDataPath);
  });
  
  return Promise.all(promises);
}