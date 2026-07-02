import { addPoiHoverEffect } from './poiHoverEffect.js';

/**
 * 添加广西5A级景区POI数据到指定的Mapbox地图实例
 * @param {mapboxgl.Map} map - Mapbox地图实例
 * @param {string} geojsonPath - GeoJSON数据文件路径
 */
export function addSALP5Apoi(map, geojsonPath) {
  // 检查地图是否已加载
  if (map.loaded()) {
    addLayerToMap();
  } else {
    map.once('load', addLayerToMap);
  }

  function addLayerToMap() {
    // 1. 清理：先检查并移除已存在的图层和数据源
    if (map.getLayer('salp5a-layer')) {
      map.removeLayer('salp5a-layer');
    }
    if (map.getSource('salp5a-source')) {
      map.removeSource('salp5a-source');
    }

    // 2. 添加数据源
    map.addSource('salp5a-source', {
      type: 'geojson',
      data: geojsonPath,
      generateId: true
    });

    // 3. 添加自定义图标图层
    map.loadImage('./geojson/icons/5A.png', (error, image) => {
      if (error) {
        console.error('无法加载5A级景区图标:', error);
        return;
      }

      // 检查图标是否已存在
      if (!map.hasImage('salp5a-icon')) {
        map.addImage('salp5a-icon', image);
      }

      // 添加图标图层
      map.addLayer({
        id: 'salp5a-layer',
        type: 'symbol',
        source: 'salp5a-source',
        layout: {
          'icon-image': 'salp5a-icon',
          'icon-size': 0.02,
          'icon-padding': 2,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'icon-optional': false,
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
              'text-size': 10,
              'text-color': '#f39c12'
            }
          ],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-offset': [0, 2],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#f39c12', // 文字颜色 - 金色
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 1,
          'icon-opacity': 0.9
        }
      });

      // 添加悬停效果
      addPoiHoverEffect(map, 'salp5a-layer', {
        nameProperty: 'Name',
        defaultSize: 0.02,
        hoverSize: 0.03
      });
    });

    // 添加点击事件
    map.off('click', 'salp5a-layer');
    map.on('click', 'salp5a-layer', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const { Name, Type, City, Level } = e.features[0].properties;

      // 准备图片路径，可以使用基于景区名称的命名约定
      const imagePath = `./geojson/images/salp5a/${Name.replace(/\s+/g, '_')}.jpg` || './geojson/images/salp5a/default.jpg';

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <div style="text-align: center;">
            <strong style="font-size: 16px; color: #f39c12;">${Name}</strong><br>
            <img src="${imagePath}" alt="${Name}" style="width: 220px; height: 150px; margin: 10px 0;" onerror="this.src='./geojson/images/salp5a/default.png'" />
            <div>
              <p><strong>等级:</strong> <span style="color: #f39c12; font-weight: bold;">${Level}</span></p>
              <p><strong>类型:</strong> ${Type || '综合景区'}</p>
              <p><strong>所在城市:</strong> ${City}</p>
              <p style="font-size: 12px; color: #666;">广西5A级景区是国家旅游局评定的代表中国旅游最高水准的旅游景区，具有全国影响力和知名度。</p>
            </div>
          </div>
        `)
        .addTo(map);
    });
  }
}