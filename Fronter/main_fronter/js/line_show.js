/**
 * 在现有的Mapbox地图对象上添加线数据
 * @param {Object} map - 已初始化的Mapbox地图对象
 * @param {Object} options - 配置选项对象
 * @param {string} options.sourceId - 数据源ID
 * @param {string} options.dataUrl - GeoJSON数据源URL
 * @param {string} options.layerId - 图层ID
 * @param {Object} options.lineStyle - 线样式配置
 */
function addLinesToMap(map, options = {}) {
    const config = {
        sourceId: options.sourceId || 'lineSource',
        dataUrl: options.dataUrl || 'lineData.geojson',
        layerId: options.layerId || 'lineLayer',
        lineStyle: options.lineStyle || {
            color: '#0074D9',
            width: 2,
            opacity: 0.8
        }
    };

    // 添加GeoJSON数据源
    map.addSource(config.sourceId, {
        type: 'geojson',
        data: config.dataUrl
    });

    // 添加线图层
    map.addLayer({
        id: config.layerId,
        type: 'line',
        source: config.sourceId,
        paint: {
            'line-color': config.lineStyle.color,
            'line-width': config.lineStyle.width,
            'line-opacity': config.lineStyle.opacity
        }
    });
}

// 使用示例
// 在现有地图对象上添加线数据
// addLinesToMap(map, {
//     sourceId: 'roadNetwork',
//     dataUrl: 'roadNetwork.geojson',
//     layerId: 'roadNetwork-layer',
//     lineStyle: {
//         color: '#FF0000',
//         width: 4,
//         opacity: 0.9
//     }
// });