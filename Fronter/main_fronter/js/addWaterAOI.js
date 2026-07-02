/**
 * 添加水域自然保护区的多边形数据到指定的 Mapbox 地图实例
 * @param {mapboxgl.Map} map - Mapbox 地图实例
 * @param {string} geojsonPath - GeoJSON 数据文件路径
 */
export function addWaterAOI(map, geojsonPath) {
  map.on('load', () => {
    map.addSource('waterAOI', {
      type: 'geojson',
      data: geojsonPath
    });

    map.addLayer({
      id: 'waterAOI-layer',
      type: 'fill',
      source: 'waterAOI',
      paint: {
        'fill-color': '#00CED1', // 使用青色表示水域
        'fill-opacity': 1
      }
    });

    map.addLayer({
      id: 'waterAOI-outline',
      type: 'line',
      source: 'waterAOI',
      paint: {
        'line-color': '#008B8B', // 深青色边框
        'line-width': 2
      }
    });

    map.on('click', 'waterAOI-layer', (e) => {
      const coordinates = e.lngLat;
      const name = e.features[0].properties.name || '未知水域';

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`<strong>水域保护区</strong><br>名称: ${name}`)
        .addTo(map);
    });

    map.on('mouseenter', 'waterAOI-layer', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'waterAOI-layer', () => {
      map.getCanvas().style.cursor = '';
    });
  });
}