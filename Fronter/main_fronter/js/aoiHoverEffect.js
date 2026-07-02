/**
 * 为地图上的多边形 AOI 图层添加悬停效果
 * @param {mapboxgl.Map} map - Mapbox 地图实例
 * @param {string} layerId - 需要添加悬停效果的图层 ID
 * @param {Object} options - 配置选项
 * @param {string} sourceId - 数据源 ID（默认从图层ID中派生）
 */
export function addAOIHoverEffect(map, layerId, options = {}, sourceId = null) {
  // 获取数据源ID - 如果未提供则从图层ID派生
  const actualSourceId = sourceId || layerId.replace('-layer', '');
  
  let hoveredFeatureId = null;

  // 鼠标悬停时设置 feature-state
  map.on('mousemove', layerId, (e) => {
    if (e.features.length > 0) {
      const featureId = e.features[0].id;

      // 如果悬停的要素发生变化，更新 feature-state
      if (hoveredFeatureId !== featureId) {
        if (hoveredFeatureId !== null) {
          map.setFeatureState(
            { source: actualSourceId, id: hoveredFeatureId }, // 修正：使用正确的数据源ID
            { hover: false }
          );
        }
        hoveredFeatureId = featureId;
        map.setFeatureState(
          { source: actualSourceId, id: hoveredFeatureId }, // 修正：使用正确的数据源ID
          { hover: true }
        );
      }

      // 改变鼠标样式
      map.getCanvas().style.cursor = 'pointer';
    }
  });

  // 鼠标移出时清除 feature-state
  map.on('mouseleave', layerId, () => {
    if (hoveredFeatureId !== null) {
      map.setFeatureState(
        { source: actualSourceId, id: hoveredFeatureId }, // 修正：使用正确的数据源ID
        { hover: false }
      );
    }
    hoveredFeatureId = null;

    // 恢复鼠标样式
    map.getCanvas().style.cursor = '';
  });

  console.log(`已为图层 ${layerId} 添加悬停效果，使用数据源 ${actualSourceId}`);
}