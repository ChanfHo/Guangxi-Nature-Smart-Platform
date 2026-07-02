import { addPoiHoverEffect } from './poiHoverEffect.js';

/**
 * 添加广西4A级景区POI数据到指定的Mapbox地图实例
 * @param {mapboxgl.Map} map - Mapbox地图实例
 * @param {string} geojsonPath - GeoJSON数据文件路径
 */
export function addSALP4Apoi(map, geojsonPath) {
  // 检查地图是否已加载
  if (map.loaded()) {
    addLayerToMap();
  } else {
    map.once('load', addLayerToMap);
  }

  function addLayerToMap() {
    // 1. 清理：先检查并移除已存在的图层和数据源
    if (map.getLayer('salp4a-layer')) {
      map.removeLayer('salp4a-layer');
    }
    if (map.getSource('salp4a-source')) {
      map.removeSource('salp4a-source');
    }

    // 2. 添加数据源
    map.addSource('salp4a-source', {
      type: 'geojson',
      data: geojsonPath,
      generateId: true
    });

    // 3. 添加自定义图标图层
    map.loadImage('./geojson/icons/4A.png', (error, image) => {
      if (error) {
        console.error('无法加载4A级景区图标:', error);
        return;
      }

      // 检查图标是否已存在
      if (!map.hasImage('salp4a-icon')) {
        map.addImage('salp4a-icon', image);
      }

      // 添加图标图层
      map.addLayer({
        id: 'salp4a-layer',
        type: 'circle',
        source: 'salp4a-source',
        layout: {
          'text-allow-overlap': true,
          'text-ignore-placement': true,
          'text-optional': true,
          'symbol-z-order': 'source',
          
          'text-field': [
            'format',
            ['get', 'Name'], // 显示景区名字
            '\n', // 换行
            ['get', 'Level'], // 显示景区等级
            {
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 9,
              'text-color': '#e74c3c'
            }
          ],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 9, // 比5A级稍小
          'text-offset': [0, 2],
          'text-anchor': 'top'
        },
        paint: {
          'circle-radius': 4,
          'circle-color': '#e74c3c',
          'circle-opacity': 1,
          'text-color': '#e74c3c', // 文字颜色 - 红色
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 1,
        },
        // 过滤掉没有坐标的点
        filter: ['has', 'Name']
      });

      // 添加悬停效果
      addPoiHoverEffect(map, 'salp4a-layer', {
        nameProperty: 'Name',
        defaultSize: 0.018,
        hoverSize: 0.027
      });
    });

    // 添加点击事件
    map.off('click', 'salp4a-layer');
    map.on('click', 'salp4a-layer', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const { Name, Type, City, Level } = e.features[0].properties;

      if (!Name || !coordinates || coordinates.length < 2) {
        return; // 如果数据不完整，跳过弹窗
      }

      // 准备图片路径，可以使用基于景区名称的命名约定
      const imagePath = `./geojson/images/salp4a/${Name ? Name.replace(/\s+/g, '_') : 'default'}.jpg`;

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <div style="text-align: center;">
            <strong style="font-size: 16px; color: #e74c3c;">${Name || '未命名景区'}</strong><br>
            <img src="${imagePath}" alt="${Name || '未命名景区'}" style="width: 220px; height: 150px; margin: 10px 0;" onerror="this.src='./geojson/images/salp4a/default.png'" />
            <div>
              <p><strong>等级:</strong> <span style="color: #e74c3c; font-weight: bold;">${Level || '4A'}</span></p>
              <p><strong>类型:</strong> ${Type || '综合景区'}</p>
              <p><strong>所在城市:</strong> ${City || '广西'}</p>
              <p style="font-size: 12px; color: #666;">4A级景区是国家旅游局评定的重要旅游景区，代表区域内较高水准的旅游资源，具有一定的知名度和游览价值。</p>
            </div>
          </div>
        `)
        .addTo(map);
    });
  }
}