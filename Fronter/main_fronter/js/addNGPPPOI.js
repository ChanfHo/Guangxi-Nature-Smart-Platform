import { addPoiHoverEffect } from './poiHoverEffect.js';

/**
 * 添加国家地质公园POI数据到指定的Mapbox地图实例
 * @param {mapboxgl.Map} map - Mapbox地图实例
 * @param {string} geojsonPath - GeoJSON数据文件路径
 */
export function addNGPPpoi(map, geojsonPath) {
  // 检查地图是否已加载
  if (map.loaded()) {
    addLayerToMap();
  } else {
    map.once('load', addLayerToMap);
  }

  function addLayerToMap() {
    // 1. 清理：先检查并移除已存在的图层和数据源
    if (map.getLayer('ngpp-layer')) {
      map.removeLayer('ngpp-layer');
    }
    if (map.getSource('ngpp-source')) {
      map.removeSource('ngpp-source');
    }

    // 2. 添加数据源
    map.addSource('ngpp-source', {
      type: 'geojson',
      data: geojsonPath,
      generateId: true
    });

    // 3. 添加自定义图标图层
    map.loadImage('./geojson/icons/地质.png', (error, image) => {
      if (error) {
        console.error('无法加载地质公园图标:', error);
        return;
      }

      // 检查图标是否已存在
      if (!map.hasImage('ngpp-icon')) {
        map.addImage('ngpp-icon', image);
      }

      // 添加图标图层
      map.addLayer({
        id: 'ngpp-layer',
        type: 'symbol',
        source: 'ngpp-source',
        layout: {
          'icon-image': 'ngpp-icon',
          'icon-size': 0.1,
          'icon-padding': 10,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'icon-optional': false,
          'text-allow-overlap': true,
          'text-ignore-placement': true,
          'text-optional': true,
          'symbol-z-order': 'source',
          
          'text-field': ['get', 'NAME'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-offset': [0, 1],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#9b59b6', // 地质公园使用紫色
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 1,
          'icon-opacity': 1
        }
      });

      // 添加悬停效果
      addPoiHoverEffect(map, 'ngpp-layer', {
        nameProperty: 'NAME',
        defaultSize: 0.1,
        hoverSize: 0.15
      });
    });

    // 添加点击事件
    map.off('click', 'ngpp-layer');
    map.on('click', 'ngpp-layer', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const name = e.features[0].properties.NAME;

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <div style="text-align: center;">
            <strong>${name}</strong><br>
            <img src="./geojson/images/ngpp/default.png" alt="${name}" style="width: 220px; height: 150px; margin: 10px 0;" />
            <div>
              <span style="color: #9b59b6; font-weight: bold;">国家地质公园</span><br>
              <p>国家地质公园是以特殊地质遗迹为主要保护对象的自然保护地，具有重要科学研究、科普教育和美学观赏价值，是中国地质遗产保护体系的重要组成部分。</p>
            </div>
          </div>
        `)
        .addTo(map);
    });
  }
}