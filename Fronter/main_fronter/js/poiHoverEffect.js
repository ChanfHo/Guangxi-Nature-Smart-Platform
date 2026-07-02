/**
 * 为地图 POI 图层添加悬停效果
 * @param {mapboxgl.Map} map - Mapbox 地图实例
 * @param {string} layerId - 需要添加悬停效果的图层 ID
 * @param {Object} options - 配置选项
 * @param {string} options.nameProperty - 用于识别 POI 点的属性名（默认为 '景区名'）
 * @param {number} options.defaultSize - 图标默认大小（默认为 0.2）
 * @param {number} options.hoverSize - 图标悬停时的大小（默认为 0.3）
 */
export function addPoiHoverEffect(map, layerId, options = {}) {
  // 默认配置
  const {
    nameProperty = '景区名',
    defaultSize = 0.2,
    hoverSize = 0.3
  } = options;

  // 确保地图和图层ID有效
  if (!map || !layerId) {
    console.error('地图实例或图层ID无效');
    return;
  }

  // 鼠标悬停效果
  map.on('mouseenter', layerId, (e) => {
    if (!e.features || !e.features[0]) return;
    
    map.getCanvas().style.cursor = 'pointer';
    
    // 获取悬停的图标的名称
    const feature = e.features[0];
    const poiName = feature.properties[nameProperty];
    
    if (!poiName) return;
    
    // 动态更新图层布局属性，改变指定POI名称的图标大小
    map.setLayoutProperty(layerId, 'icon-size', [
      'case',
      ['==', ['get', nameProperty], poiName],
      hoverSize, // 悬停时的大小
      defaultSize  // 默认大小
    ]);
  });

  // 鼠标移出效果
  map.on('mouseleave', layerId, () => {
    map.getCanvas().style.cursor = '';
    
    // 恢复所有图标到默认大小
    map.setLayoutProperty(layerId, 'icon-size', defaultSize);
  });
  
  console.log(`已为图层 ${layerId} 添加悬停效果`);
}