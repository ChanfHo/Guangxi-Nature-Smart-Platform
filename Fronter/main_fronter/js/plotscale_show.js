/**
 * 在地图上添加比例尺
 * @param {Object} map - 已初始化的Mapbox地图对象
 * @param {Object} options - 配置选项对象
 * @param {string} [options.position='bottom-left'] - 比例尺的位置，可选值为 'top-left', 'top-right', 'bottom-left', 'bottom-right'
 */
function addScaleToMap(map, options = {}) {
    const config = {
        position: options.position || 'bottom-left'
    };

    // 创建比例尺控件
    const scaleControl = new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric' // 使用公制单位（米/公里）
    });

    // 添加比例尺到地图
    map.addControl(scaleControl, config.position);
}

// 使用示例
// 在地图上添加比例尺
// addScaleToMap(map, { position: 'bottom-left' });