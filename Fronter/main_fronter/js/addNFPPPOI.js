import { addPoiHoverEffect } from './poiHoverEffect.js';

/**
 * 添加国家森林公园POI数据到指定的Mapbox地图实例
 * @param {mapboxgl.Map} map - Mapbox地图实例
 * @param {string} geojsonPath - GeoJSON数据文件路径
 */
export function addNFPPpoi(map, geojsonPath) {
  // 检查地图是否已加载
  if (map.loaded()) {
    addLayerToMap();
  } else {
    map.once('load', addLayerToMap);
  }

  function addLayerToMap() {
    // 1. 清理：先检查并移除已存在的图层和数据源
    if (map.getLayer('nfpp-layer')) {
      map.removeLayer('nfpp-layer');
    }
    if (map.getSource('nfpp-source')) {
      map.removeSource('nfpp-source');
    }

    // 2. 添加数据源
    map.addSource('nfpp-source', {
      type: 'geojson',
      data: geojsonPath,
      generateId: true
    });

    // 3. 添加自定义图标图层
    map.loadImage('./icons/NFPPOnMap.png', (error, image) => {
      if (error) {
        console.error('无法加载森林公园图标:', error);
        return;
      }

      // 检查图标是否已存在
      if (!map.hasImage('nfpp-icon')) {
        map.addImage('nfpp-icon', image);
      }

      // 添加图标图层
      map.addLayer({
        id: 'nfpp-layer',
        type: 'symbol',
        source: 'nfpp-source',
        layout: {
          'icon-image': 'nfpp-icon',
          'icon-size': 0.15,
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
          'text-color': '#3B5F21', // 森林公园使用绿色
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 1,
          'icon-opacity': 1
        }
      });

      // 添加悬停效果
      addPoiHoverEffect(map, 'nfpp-layer', {
        nameProperty: 'NAME',
        defaultSize: 0.15,
        hoverSize: 0.2
      });
    });

    // 添加点击事件
    map.off('click', 'nfpp-layer');
    map.on('click', 'nfpp-layer', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const name = e.features[0].properties.NAME;

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <div style="text-align: center;">
            <strong>${name}</strong><br>
            <img src="./geojson/images/nfpp/default.png" alt="${name}" style="width: 220px; height: 150px; margin: 10px 0;" />
            <div>
              <span style="color: #2ecc71; font-weight: bold;">国家森林公园</span><br>
              <p>国家森林公园是以森林景观为主，具有特殊保护与游憩价值的自然区域，集生态保护、科学研究与旅游观光功能于一体。</p>
            </div>
          </div>
        `)
        .addTo(map);
    });
  }
}