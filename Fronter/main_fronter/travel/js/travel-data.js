/**
 * 广西旅游路线推荐 - 数据模块
 * 文件路径: /home/ubuntu/ComputerDesign/Fronter/main_fronter/travel/js/travel-data.js
 * 
 * 负责管理路线数据、加载GeoJSON和提供数据访问接口
 */

// 数据模块
const DataModule = (function() {
  // 路线数据存储
  let routeData = {};
  
  // 路线主题配置
  const routeThemes = {
    1: {
      title: "山水画廊·喀斯特奇观之旅",
      theme: "世界级喀斯特地貌与田园诗画",
      color: "#4CAF50", // 绿色
      center: [110.2964, 25.2785], // 桂林市中心
      zoom: 9,
      overview: "这条路线带您领略世界著名的桂林山水风光，游览喀斯特地貌形成的独特景观，感受山水之间的诗意。从漓江两岸的奇峰异石，到阳朔田园风光，再到龙脊梯田的壮丽山景，尽显广西山川之美。",
      distance: "约320公里",
      days: "4-5天"
    },
    2: {
      title: "跨国秘境·瀑布探险之旅",
      theme: "跨国瀑布与边陲自然秘境",
      color: "#2196F3", // 蓝色
      center: [106.9336, 22.8473], // 德天瀑布附近
      zoom: 9,
      overview: "这条路线带您探索中越边境的自然奇观，以亚洲第一跨国瀑布德天瀑布为中心，深入田林、靖西等地，欣赏原始壮美的喀斯特地貌与瀑布群，体验独特的边境民族风情。",
      distance: "约280公里",
      days: "3-4天"
    },
    3: {
      title: "绿城生态·壮乡风情之旅",
      theme: "南宁都市圈自然与民族文化融合",
      color: "#FF9800", // 橙色
      center: [108.3208, 22.8219], // 南宁市中心
      zoom: 10,
      overview: "这条路线以广西首府南宁为中心，探索这座被誉为绿城的现代都市及其周边生态景观。从城市园林到民族村寨，既能感受现代都市的繁华，又能体验浓郁的少数民族文化风情。",
      distance: "约180公里",
      days: "2-3天"
    },
    4: {
      title: "滨海风情·火山海岛之旅",
      theme: "北部湾海滨风光与火山地质奇观",
      color: "#E91E63", // 粉红色
      center: [109.1050, 21.4733], // 北海市中心
      zoom: 9,
      overview: "这条路线带您领略广西北部湾的迷人海岸线与独特的火山地质景观。从北海银滩的细腻沙滩，到涠洲岛的古火山遗迹，再到冠头岭火山群，沿途尽赏热带滨海风光与独特的地质奇观。",
      distance: "约220公里",
      days: "3-4天"
    }
  };
  
  /**
   * 加载所有路线数据
   * @returns {Promise} 所有数据加载完成的Promise
   */
  function loadAllRouteData() {
    const promises = [];
    
    // 加载四条路线的GeoJSON数据
    for (let i = 1; i <= 4; i++) {
      const promise = fetch(`../geojson/TravelRoute/route${i}.geojson`)
        .then(response => response.json())
        .then(data => {
          routeData[i] = data;
          console.log(`路线${i}数据加载完成`);
        })
        .catch(error => console.error(`加载路线${i}数据失败:`, error));
      
      promises.push(promise);
    }
    
    // 返回所有数据加载完成的Promise
    return Promise.all(promises);
  }
  
  /**
   * 获取路线数据
   * @param {number} routeId - 路线ID (1-4)
   * @returns {Object|null} 路线GeoJSON数据或null
   */
  function getRouteData(routeId) {
    return routeData[routeId] || null;
  }
  
  /**
   * 获取路线主题配置
   * @param {number} routeId - 路线ID (1-4)
   * @returns {Object|null} 路线主题配置或null
   */
  function getRouteTheme(routeId) {
    return routeThemes[routeId] || null;
  }
  
  /**
   * 获取所有路线主题配置
   * @returns {Object} 所有路线主题配置
   */
  function getAllRouteThemes() {
    return routeThemes;
  }
  
  /**
   * 获取景点按顺序排序的数组
   * @param {number} routeId - 路线ID (1-4)
   * @returns {Array|null} 排序后的景点数组或null
   */
  function getSortedAttractions(routeId) {
    const data = routeData[routeId];
    if (!data) return null;
    
    return [...data.features].sort(
      (a, b) => parseInt(a.properties.Order) - parseInt(b.properties.Order)
    );
  }
  
  // 公开API
  return {
    loadAllRouteData,
    getRouteData,
    getRouteTheme,
    getAllRouteThemes,
    getSortedAttractions
  };
})();