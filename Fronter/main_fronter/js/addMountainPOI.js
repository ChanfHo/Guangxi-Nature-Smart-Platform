import { addPoiHoverEffect } from './poiHoverEffect.js';

/**
 * 添加山的 POI 数据到指定的 Mapbox 地图实例
 * @param {mapboxgl.Map} map - Mapbox 地图实例
 * @param {string} geojsonPath - GeoJSON 数据文件路径
 */
export function addMountainPOI(map, geojsonPath) {
  // 检查地图是否已加载
  if (map.loaded()) {
    addLayerToMap();
  } else {
    map.once('load', addLayerToMap);
  }

  function addLayerToMap() {
    // 1. 清理：先检查并移除已存在的图层和数据源
    if (map.getLayer('mountainPOI-layer')) {
      map.removeLayer('mountainPOI-layer');
    }
    if (map.getSource('mountainPOI')) {
      map.removeSource('mountainPOI');
    }

    // 2. 添加数据源
    map.addSource('mountainPOI', {
      type: 'geojson',
      data: geojsonPath,
      generateId: true
    });

    // 3. 添加自定义图标图层
    map.loadImage('./icons/mountainsOnMap.png', (error, image) => {
      if (error) {
        console.error('无法加载山区图标:', error);
        return;
      }

      // 检查图标是否已存在
      if (!map.hasImage('mountain-icon')) {
        map.addImage('mountain-icon', image);
      }


      // 添加图标图层
      map.addLayer({
        id: 'mountainPOI-layer',
        type: 'symbol',
        source: 'mountainPOI',
        layout: {
          'icon-image': 'mountain-icon', // 使用自定义图标
          'icon-size': 0.08, // 图标默认大小
          'icon-padding': 10, // 添加点击缓冲区，增大可点击范围
          'icon-allow-overlap': true,        // 允许图标重叠
          'icon-ignore-placement': true,     // 忽略图标放置规则
          'icon-optional': false,            // 图标必须显示(即使文本被裁剪)
          'text-allow-overlap': true,        // 允许文本重叠
          'text-ignore-placement': true,     // 忽略文本放置规则
          'text-optional': true,             // 文本可选(图标优先级高于文本)
          'symbol-z-order': 'source',        // 根据数据源顺序渲染符号


          'text-field': [
            'format',
            ['get', '景区名'], // 显示景区名字
            '\n', // 换行
            ['get', '等级'], // 显示景区等级
            {
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 10,
              'text-color': '#FF5733'
            }
          ],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], // 字体
          'text-size': 10, // 字体大小
          'text-offset': [0, 1], // 文字相对于图标的偏移
          'text-anchor': 'top' // 文字显示在图标上方
        },
        paint: {
          'text-color': '#FF5733', // 文字颜色
          'text-halo-color': '#FFFFFF', // 文字描边颜色
          'text-halo-width': 1, // 文字描边宽度
          'icon-opacity': 0.8 // 设置透明度
        }
      });

      // 添加悬停效果
      addPoiHoverEffect(map, 'mountainPOI-layer', {
        nameProperty: '景区名',
        defaultSize: 0.08,
        hoverSize: 0.1
      });
    });

    // console.log("test");

    // 添加点击事件
    map.off('click', 'mountainPOI-layer'); // 移除之前的点击事件
    map.on('click', 'mountainPOI-layer', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const { 景区名, 所在地, 等级, 介绍, 图片路径 } = e.features[0].properties;

      // 如果图片路径为空，则显示默认图片
      const imagePath = 图片路径 || './geojson/images/mountain/default.png';

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <div style="text-align: center;">
            <strong>${景区名}</strong><br>
            <img src="${imagePath}" alt="${景区名}" style="width: 220px; height: 180; margin: 10px 0;" />
            <div>
              所在地: ${所在地}<br>
              等级: ${等级 || '暂无等级'}<br>
              介绍: ${介绍}
            </div>
          </div>
        `)
        .addTo(map);
    });
  };
}
