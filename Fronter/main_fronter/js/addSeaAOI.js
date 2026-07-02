import { addAOIHoverEffect } from './aoiHoverEffect.js';

/**
 * 添加海洋自然保护区的多边形数据到指定的 Mapbox 地图实例
 * @param {mapboxgl.Map} map - Mapbox 地图实例
 * @param {string} geojsonPath - GeoJSON 数据文件路径
 */
export function addSeaAOI(map, geojsonPath) {
  // 检查地图是否已加载
  if (map.loaded()) {
    addLayerToMap();
  } else {
    map.once('load', addLayerToMap);
  }
  
  function addLayerToMap() {
    // 1. 清理：检查并移除已存在的图层和数据源
    ['seaAOI-layer', 'seaAOI-outline', 'seaAOI-labels', 'seaCenters-layer'].forEach(layerId => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
    });
    
    ['seaAOI', 'seaCenters'].forEach(sourceId => {
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    });
    
    // 2. 加载数据
    fetch(geojsonPath)
      .then(response => response.json())
      .then(data => {
        // 添加原始多边形数据源
        map.addSource('seaAOI', {
          type: 'geojson',
          data: data,
          generateId: true
        });

        // 计算每个多边形的中心点并创建新的GeoJSON
        const centerPoints = {
          type: 'FeatureCollection',
          features: data.features.map(feature => {
            // 计算多边形的重心或边界框中心
            const center = turf.center(feature);
            return {
              type: 'Feature',
              properties: feature.properties,
              geometry: {
                type: 'Point',
                coordinates: center.geometry.coordinates
              },
              id: feature.id
            };
          })
        };

        // 添加中心点数据源
        map.addSource('seaCenters', {
          type: 'geojson',
          data: centerPoints
        });

        // 添加中心点图层（可以设置为不可见但可点击）
        map.addLayer({
          id: 'seaCenters-layer',
          type: 'circle',
          source: 'seaCenters',
          paint: {
            'circle-radius': 10,
            'circle-color': 'rgba(0,0,0,0)', // 透明圆点
            'circle-stroke-width': 0
          }
        });

        // 添加填充图层
        map.addLayer({
          id: 'seaAOI-layer',
          type: 'fill',
          source: 'seaAOI',
          minzoom: 0,  // 确保在所有缩放级别可见
          maxzoom: 24,
          paint: {
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              '#0066CC', // 悬停时更深的蓝色
              '#1E90FF'  // 默认浅蓝色
            ],
            'fill-opacity': 0.6
          }
        });

        // 添加边界图层
        map.addLayer({
          id: 'seaAOI-outline',
          type: 'line',
          source: 'seaAOI',
          minzoom: 0,
          maxzoom: 24,
          paint: {
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              '#00BFFF', // 悬停时亮蓝色边界
              '#00008B'  // 默认深蓝色边界
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              3, // 悬停时边界更粗
              1  // 默认边界宽度
            ]
          }
        });
        
        // 添加名称标识图层
        map.addLayer({
          id: 'seaAOI-labels',
          type: 'symbol',
          source: 'seaCenters', // 使用已有的中心点数据源
          layout: {
            'text-field': ['get', 'Name'], // 只显示海域名称
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-anchor': 'center',
            'text-offset': [0, 0.5], // 稍微下移文本
            'text-allow-overlap': true,        // 允许文本重叠
            'text-ignore-placement': true,     // 忽略文本放置规则
          },
          paint: {
            'text-color': '#00008B', // 深蓝色文字
            'text-halo-color': '#ffffff', // 白色描边
            'text-halo-width': 2 // 描边宽度，提高可读性
          }
        });

        // 添加悬停效果
        addAOIHoverEffect(map, 'seaAOI-layer', {
          defaultFillColor: '#1E90FF',
          hoverFillColor: '#0066CC',
          defaultOutlineColor: '#00008B',
          hoverOutlineColor: '#00BFFF'
        }, 'seaAOI');
        
        // 添加点击事件
        setupClickEvents();
      });
  }
  
  // 设置所有点击事件
  function setupClickEvents() {
    // 移除之前的点击事件
    map.off('click', 'seaAOI-layer');
    map.off('click', 'seaCenters-layer'); 
    map.off('click', 'seaAOI-labels');
    
    // 添加多边形点击事件
    map.on('click', 'seaAOI-layer', (e) => {
      showPopup(e);
    });

    // 添加中心点点击事件
    map.on('click', 'seaCenters-layer', (e) => {
      showPopup(e);
    });
    
    // 添加标签点击事件
    map.on('click', 'seaAOI-labels', (e) => {
      showPopup(e);
    });
  }
  
  // 显示弹窗函数
  function showPopup(e) {
    const coordinates = e.lngLat;
    const name = e.features[0].properties.Name || '未知海域';
    const Type = e.features[0].properties.Type || '未知级别';
    const Info = e.features[0].properties.Info || '无信息';
    const imagePath = e.features[0].properties.imagePath || './geojson/images/sea/default.png';
    
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(`
        <div style="text-align: center;">
          <strong>${name}</strong><br>
          <img src="${imagePath}" alt="${name}" style="width: 220px; height: auto; margin: 10px 0;" />
          <div>
            等级: ${Type}<br>
            介绍: ${Info}
          </div>
        </div>
      `)
      .addTo(map);
  }
}