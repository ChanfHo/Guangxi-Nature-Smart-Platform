/**
 * 在现有的Mapbox地图对象上添加POI点
 * @param {Object} map - 已初始化的Mapbox地图对象
 * @param {Object} options - 配置选项对象
 * @param {string} options.sourceId - 数据源ID
 * @param {string} options.dataUrl - GeoJSON数据源URL
 * @param {string} options.layerId - 图层ID
 * @param {Object} options.poiStyle - POI点样式配置
 */
function addPOIsToMap(map, options = {}) {
    const config = {
        sourceId: options.sourceId || 'poiSource',
        dataUrl: options.dataUrl || 'admininstrationCenter.geojson',
        layerId: options.layerId || 'poiLayer',
        poiStyle: options.poiStyle || {
            radius: 8,
            color: '#ff5200',
            opacity: 0
        },
        popupConfig: options.popupConfig || {
            closeButton: false,
            closeOnClick: false
        }
    };

    // 添加GeoJSON数据源
    map.addSource(config.sourceId, {
        type: 'geojson',
        data: config.dataUrl
    });

    // 添加点图层
    map.addLayer({
        id: config.layerId,
        type: 'circle',
        source: config.sourceId,
        paint: {
            'circle-radius': config.poiStyle.radius,
            'circle-color': config.poiStyle.color,
            'circle-opacity': config.poiStyle.opacity
        }
    });

    // 创建弹出框
    const popup = new mapboxgl.Popup(config.popupConfig);

    // 监听鼠标悬停事件
    map.on('mouseenter', config.layerId, function(e) {
        const features = map.queryRenderedFeatures(e.point, { layers: [config.layerId] });
        if (features.length > 0) {
            const feature = features[0];

            // 设置弹出框内容，使用 "介绍" 字段
            const description = feature.properties.介绍 || '暂无介绍信息';
            popup.setLngLat(feature.geometry.coordinates)
                .setHTML('<strong>' + feature.properties.name + '</strong><br>' + description)
                .addTo(map);
        }
    });

    // 监听鼠标离开事件
    map.on('mouseleave', config.layerId, function() {
        popup.remove();
    });
}

// 使用示例
// 在现有地图对象上添加POI
// addPOIsToMap(map, {
//     sourceId: 'admininstrationCenters',
//     dataUrl: 'admininstrationCenter.geojson',
//     layerId: 'admininstrationCenter-layer',
//     poiStyle: {
//         radius: 10,
//         color: '#00ff00',
//         opacity: 0.8
//     }
// });