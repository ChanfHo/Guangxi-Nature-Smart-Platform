/**
 * 在地图上添加指北针控件
 * @param {Object} map - 已初始化的Mapbox地图对象
 * @param {Object} options - 配置选项对象
 * @param {string} [options.position='top-right'] - 指北针的位置，可选值为 'top-left', 'top-right', 'bottom-left', 'bottom-right'
 */
function addCompassToMap(map, options = {}) {
    const config = {
        position: options.position || 'top-right'
    };

    // 创建导航控件（包含指北针和缩放按钮）
    const navigationControl = new mapboxgl.NavigationControl({
        showCompass: true, // 显示指北针
        showZoom: false    // 不显示缩放按钮
    });

    // 添加指北针控件到地图
    map.addControl(navigationControl, config.position);
}

// 使用示例
// 在地图上添加指北针
// addCompassToMap(map, { position: 'top-right' });