/**
 * 添加行政区数据到指定的 Mapbox 地图实例
 * @param {mapboxgl.Map} map - Mapbox 地图实例
 * @param {string} geojsonPath - GeoJSON 数据文件路径
 */
export function addAdminCenters(map, geojsonPath) {
  map.on('load', () => {
    // 添加 GeoJSON 数据源
    map.addSource('adminCenters', {
      type: 'geojson',
      data: geojsonPath
    });

    // 添加点图层
    map.addLayer({
      id: 'adminCenters-layer',
      type: 'circle',
      source: 'adminCenters',
      paint: {
        'circle-radius': 10,
        'circle-color': '#007cbf',
        'circle-opacity': 0 // 设置透明度
      }
    });

    // 添加点击事件
    map.on('click', 'adminCenters-layer', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const name = e.features[0].properties.name;

      // 弹窗内容
      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`<strong>${name}</strong>`)
        .addTo(map);
    });

    // 鼠标悬停效果
    map.on('mouseenter', 'adminCenters-layer', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'adminCenters-layer', () => {
      map.getCanvas().style.cursor = '';
    });
  });
}