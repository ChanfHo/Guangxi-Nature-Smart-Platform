/**
 * 广西旅游路线推荐 - 地图模块
 * 文件路径: /home/ubuntu/ComputerDesign/Fronter/main_fronter/travel/js/travel-map.js
 * 
 * 负责地图初始化、地图图层管理和地图交互功能
 */

// 地图模块
const MapModule = (function () {
  // 地图实例
  let mainMap = null;
  let detailMap = null;
  let currentRoute = 1;
  let routeLayers = [];

  /**
   * 初始化主地图
   */
  function initMainMap() {
    mainMap = new mapboxgl.Map({
      container: 'main-map',
      style: 'mapbox://styles/chanfho/cm6vs7h3300iq01s128dvcdog', // 使用与主站相同的地图样式
      center: DataModule.getRouteTheme(1).center,
      zoom: 7.5,
      minZoom: 6,
      maxZoom: 15,
      pitch: 50, // 倾斜视角增加立体感
      bearing: -10 // 稍微旋转地图增加视觉效果
    });

    // 添加地图控件
    mainMap.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    mainMap.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    // 设置地图加载事件
    mainMap.on('load', () => {
      console.log('主地图加载完成');
      // 添加广西省边界
      // addGuangxiBoundary();
    });
  }

  // /**
  //  * 添加广西省边界
  //  */
  // function addGuangxiBoundary() {
  //   fetch('../geojson/guangxi_boundary.geojson')
  //     .then(response => response.json())
  //     .then(data => {
  //       // 添加广西边界数据源
  //       mainMap.addSource('guangxi-boundary', {
  //         type: 'geojson',
  //         data: data
  //       });

  //       // 添加广西边界线
  //       mainMap.addLayer({
  //         id: 'guangxi-boundary-line',
  //         type: 'line',
  //         source: 'guangxi-boundary',
  //         layout: {},
  //         paint: {
  //           'line-color': '#333',
  //           'line-width': 2,
  //           'line-opacity': 0.7
  //         }
  //       });
  //     })
  //     .catch(error => console.error('加载广西边界数据失败:', error));
  // }

  /**
   * 在地图上显示指定路线
   * @param {number} routeId - 路线ID (1-4)
   */
  function showRouteOnMap(routeId) {
    // 确保地图已加载
    if (!mainMap || !mainMap.loaded()) {
      setTimeout(() => showRouteOnMap(routeId), 100);
      return;
    }

    // 获取路线数据
    const data = DataModule.getRouteData(routeId);
    if (!data) {
      console.error(`路线${routeId}数据不存在`);
      return;
    }

    // 更新当前路线
    currentRoute = routeId;

    // 清除现有路线
    clearRouteLayers();

    // 获取路线主题
    const theme = DataModule.getRouteTheme(routeId);

    // 设置地图中心点和缩放级别
    mainMap.flyTo({
      center: theme.center,
      zoom: theme.zoom,
      pitch: 50,
      bearing: -10,
      essential: true,
      duration: 1500
    });

    // 更新UI
    UIModule.updateRouteSelectors(routeId);

    // 添加景点标记
    const sourceId = `route-${routeId}-source`;

    // 添加数据源
    mainMap.addSource(sourceId, {
      type: 'geojson',
      data: data
    });

    // 添加连接线层
    try {
      // 获取排序后的景点
      const sortedFeatures = DataModule.getSortedAttractions(routeId);

      // 创建LineString连接所有点
      if (sortedFeatures.length > 1) {
        const lineCoordinates = sortedFeatures.map(f => f.geometry.coordinates);

        // 添加线路数据源
        mainMap.addSource(`route-${routeId}-line-source`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: lineCoordinates
            }
          }
        });

        // 添加线路图层
        const lineId = `route-${routeId}-line-layer`;
        mainMap.addLayer({
          id: lineId,
          type: 'line',
          source: `route-${routeId}-line-source`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': theme.color,
            'line-width': 3,
            'line-opacity': 0.7,
            'line-dasharray': [1, 2]
          }
        });
        routeLayers.push(lineId);
      }
    } catch (error) {
      console.error('创建线路连接失败:', error);
    }

    // 添加景点标记图层
    const circleId = `route-${routeId}-circle`;
    mainMap.addLayer({
      id: circleId,
      type: 'circle',
      source: sourceId,
      paint: {
        'circle-radius': 8,
        'circle-color': theme.color,
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });
    routeLayers.push(circleId);

    // 添加景点标签
    const symbolId = `route-${routeId}-symbol`;
    mainMap.addLayer({
      id: symbolId,
      type: 'symbol',
      source: sourceId,
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 12,
        'text-offset': [0, -1.5],
        'text-anchor': 'bottom',
        'text-allow-overlap': false,
        'text-ignore-placement': false
      },
      paint: {
        'text-color': '#333',
        'text-halo-color': '#fff',
        'text-halo-width': 1.5
      }
    });
    routeLayers.push(symbolId);

    // 添加景点点击交互
    mainMap.on('click', circleId, (e) => {
      const features = mainMap.queryRenderedFeatures(e.point, { layers: [circleId] });
      if (!features.length) return;

      const feature = features[0];
      const properties = feature.properties;

      // 创建弹出窗口
      new mapboxgl.Popup()
        .setLngLat(feature.geometry.coordinates)
        .setHTML(`
          <div class="popup-content">
            <h3>${properties.name}</h3>
            <p class="popup-type">${properties.type || '景点'} ${properties.level ? '| ' + properties.level + '景区' : ''}</p>
            <p>${properties.info || '暂无详细信息'}</p>
            <p class="popup-city">${properties.city || '广西'}</p>
            <a class="view-detail-btn" href="#" onclick="UIModule.showRouteDetail(${routeId}); return false;">查看完整路线</a>
          </div>
        `)
        .addTo(mainMap);
    });

    // 鼠标悬停效果
    mainMap.on('mouseenter', circleId, () => {
      mainMap.getCanvas().style.cursor = 'pointer';
    });

    mainMap.on('mouseleave', circleId, () => {
      mainMap.getCanvas().style.cursor = '';
    });
  }

  /**
   * 清除地图上的路线图层
   */
  function clearRouteLayers() {
    // 移除所有路线图层
    routeLayers.forEach(layerId => {
      if (mainMap.getLayer(layerId)) {
        mainMap.removeLayer(layerId);
      }
    });

    // 移除所有路线源
    for (let i = 1; i <= 4; i++) {
      // 移除点数据源
      const sourceId = `route-${i}-source`;
      if (mainMap.getSource(sourceId)) {
        mainMap.removeSource(sourceId);
      }

      // 移除线数据源
      const lineSourceId = `route-${i}-line-source`;
      if (mainMap.getSource(lineSourceId)) {
        mainMap.removeSource(lineSourceId);
      }
    }

    // 清空图层记录
    routeLayers = [];
  }

  /**
   * 初始化详情页地图
   * @param {number} routeId - 路线ID (1-4)
   * @param {object} data - 路线GeoJSON数据
   */
  function initDetailMap(routeId) {
    const data = DataModule.getRouteData(routeId);
    if (!data) return;

    const theme = DataModule.getRouteTheme(routeId);

    // 如果已经存在详情地图，先销毁它
    if (detailMap) {
      detailMap.remove();
      detailMap = null;
    }

    // 创建详情地图
    detailMap = new mapboxgl.Map({
      container: 'detail-map',
      style: 'mapbox://styles/chanfho/cm6vs7h3300iq01s128dvcdog',
      center: theme.center,
      zoom: theme.zoom - 0.5,
      pitch: 45,
      interactive: true
    });

    // 添加导航控件
    detailMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // 添加地图数据来源和审图号信息
    const mapSourceInfo = document.createElement('div');
    mapSourceInfo.className = 'map-source-info';
    mapSourceInfo.innerHTML = `
    <p>地图数据来源：1：100万公众版基础地理信息数据（2021）</p>
    <p>审图号：GS（2016）2556号，底图未修改</p>
  `;

    // 创建自定义控件并添加到地图
    class MapSourceControl {
      onAdd(map) {
        this._map = map;
        this._container = mapSourceInfo;
        return this._container;
      }

      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }
    }

    // 将自定义控件添加到地图左下角
    detailMap.addControl(new MapSourceControl(), 'bottom-left');



    // 设置地图加载事件
    detailMap.on('load', () => {
      // 添加景点数据源
      detailMap.addSource('attractions', {
        type: 'geojson',
        data: data
      });

      // 添加景点标记
      detailMap.addLayer({
        id: 'attractions-points',
        type: 'circle',
        source: 'attractions',
        paint: {
          'circle-radius': 8,
          'circle-color': theme.color,
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // 添加景点数字标记
      detailMap.addLayer({
        id: 'attractions-numbers',
        type: 'symbol',
        source: 'attractions',
        layout: {
          'text-field': ['get', 'Order'],
          'text-size': 11,
          'text-allow-overlap': true
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // 尝试创建线路连接
      try {
        // 获取排序后的景点
        const sortedFeatures = DataModule.getSortedAttractions(routeId);

        // 创建LineString连接所有点
        if (sortedFeatures.length > 1) {
          const lineCoordinates = sortedFeatures.map(f => f.geometry.coordinates);

          detailMap.addSource('route-line', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: lineCoordinates
              }
            }
          });

          detailMap.addLayer({
            id: 'route-line-layer',
            type: 'line',
            source: 'route-line',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': theme.color,
              'line-opacity': 0.7,
              'line-width': 3,
              'line-dasharray': [1, 1]
            }
          });
        }
      } catch (error) {
        console.error('创建路线连接失败:', error);
      }

      // 添加详情页地图交互
      detailMap.on('click', 'attractions-points', (e) => {
        const features = detailMap.queryRenderedFeatures(e.point, { layers: ['attractions-points'] });
        if (!features.length) return;

        const feature = features[0];
        const properties = feature.properties;

        // 创建弹出窗口
        new mapboxgl.Popup()
          .setLngLat(feature.geometry.coordinates)
          .setHTML(`
            <div class="popup-content">
              <h3>${properties.name}</h3>
              <p class="popup-type">${properties.type || '景点'} ${properties.level ? '| ' + properties.level + '景区' : ''}</p>
              <p>${properties.info || '暂无详细信息'}</p>
              <p class="popup-city">${properties.city || '广西'}</p>
            </div>
          `)
          .addTo(detailMap);
      });

      // 鼠标悬停效果
      detailMap.on('mouseenter', 'attractions-points', () => {
        detailMap.getCanvas().style.cursor = 'pointer';
      });

      detailMap.on('mouseleave', 'attractions-points', () => {
        detailMap.getCanvas().style.cursor = '';
      });
    });
  }

  /**
   * 获取主地图实例
   * @returns {Object|null} 主地图实例
   */
  function getMainMap() {
    return mainMap;
  }

  /**
   * 获取详情地图实例
   * @returns {Object|null} 详情地图实例
   */
  function getDetailMap() {
    return detailMap;
  }

  /**
   * 调整地图大小
   */
  function resizeMaps() {
    if (mainMap) mainMap.resize();
    if (detailMap) detailMap.resize();
  }

  // 公开API
  return {
    initMainMap,
    showRouteOnMap,
    initDetailMap,
    getMainMap,
    getDetailMap,
    resizeMaps
  };
})();