import { addPoiHoverEffect } from './js/poiHoverEffect.js';
import { getCurrentMap }  from './js/visualization-data.js';

/**
 * 添加AI对话生成的点到指定的Mapbox地图实例
 * @param {string} geojson - GeoJSON字符串
 */
export function chatToMap(geojson) {

    const geojsonStr = JSON.parse(geojson);
    const map = getCurrentMap();
    
    if (!geojsonStr) {
      console.error('GeoJSON文本为空');
      return;
    }

    // 检查地图是否已加载
    if (map.loaded()) {
      addLayerToMap();
    } else {
      map.once('load', addLayerToMap);
    }
  
    function addLayerToMap() {
      // 1. 清理：先检查并移除已存在的图层和数据源
      if (map.getLayer('chatToMap-layer')) {
        map.removeLayer('chatToMap-layer');
      }
      if (map.getSource('chatToMap-source')) {
        map.removeSource('chatToMap-source');
      }
  
      // 2. 添加数据源
      map.addSource('chatToMap-source', {
        type: 'geojson',
        data: geojsonStr,
        generateId: true
      });
  
      // 3. 添加自定义图标图层
      map.loadImage('./icons/chatToMap.png', (error, image) => {
        if (error) {
          console.error('无法加载图标:', error);
          return;
        }
  
        // 检查图标是否已存在
        if (!map.hasImage('chatToMap-icon')) {
          map.addImage('chatToMap-icon', image);
        }
  
        // 添加图标图层
        map.addLayer({
          id: 'chatToMap-layer',
          type: 'symbol',
          source: 'chatToMap-source',
          layout: {
            'icon-image': 'chatToMap-icon',
            'icon-size': 0.15,
            'icon-padding': 10,
            'icon-offset' : [0, -10],  //  图标向上偏移
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-optional': false,
            'text-allow-overlap': true,
            'text-ignore-placement': true,
            'text-optional': true,
            'symbol-z-order': 'source',
            
            'text-field': [
              'format',
              ['get', 'name'], // 显示景区名字
              {
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                'text-size': 9,
                'text-color': '#e74c3c'
              }
            ],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 10,
            'text-offset': [0, 1],
            'text-anchor': 'top'
          },
          paint: {
            'text-color': '#e74c3c', // 文字颜色 - 红色
            'text-halo-color': '#FFFFFF',
            'text-halo-width': 1,
            'icon-opacity': 0.85
          },
          // 过滤掉没有坐标的点
          filter: ['has', 'name']
        });
  
        // 添加悬停效果
        addPoiHoverEffect(map, 'chatToMap-layer', {
          nameProperty: 'name',
          defaultSize: 0.15,
          hoverSize: 0.2
        });
      });

      // 添加点击事件
      map.off('click', 'chatToMap-layer');
      map.on('click', 'chatToMap-layer', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { name, city, info } = e.features[0].properties;

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div style="text-align: center;">
              <strong style="font-size: 16px; color:rgb(0, 0, 0);">${name}</strong><br>
              <div>
                <p><strong>所在地区:</strong> ${city} </p>
                <p style="font-size: 12px; color: rgb(0, 0, 0);"> ${info} </p>
              </div>
            </div>
          `)
          .addTo(map);
      });
    }
  }