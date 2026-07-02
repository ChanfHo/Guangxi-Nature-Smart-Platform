import { addAdminCenters } from './js/addAdminCenters.js';
import { addMountainPOI } from './js/addMountainPOI.js';
import { addCropLandPOI } from './js/addCropLandPOI.js';
import { addForestAOI } from './js/addForestAOI.js';
import { addSeaAOI } from './js/addSeaAOI.js';
import { addWaterAOI } from './js/addWaterAOI.js';
import { addWaterPOI } from './js/addWaterPOI.js';
import { updateDataButtonStates } from './js/visualization-menu.js';


// 初始化 Mapbox 地图
mapboxgl.accessToken = 'your_mapbox_access_token_here'; // 请替换为你自己的 MapBox Token

const apiUrl = 'http://140.143.194.176:8000';

// 在travel.js中禁用Mapbox遥测，解决DNS错误
mapboxgl.config.SEND_EVENTS = false;

// 地图配置
const mapConfigs = [
    {
        container: 'map1',
        style: 'mapbox://styles/chanfho/cm6vs7h3300iq01s128dvcdog',
        center: [108.8, 23.66],
        zoom: 6.2,
        minZoom:0,
        maxZoom:8,
        maxBounds: [[100, 20],[120, 30]],
        attributionControl: false,
        logoPosition: 'top-right'
    },
    {
        container: 'map2',
        style: 'mapbox://styles/chanfho/cm7hn4exi00kv01r7gofb017l',
        center: [108.8, 23.66],
        zoom: 6.2,
        minZoom:0,
        maxZoom:8,
        maxBounds: [[100, 20],[120, 30]],
        logoPosition: 'top-right'
    },
    {
        container: 'map3',
        style: 'mapbox://styles/chanfho/cm7mrn4bl00w601s8h6h15qgj',
        center: [108.8, 23.66],
        zoom: 6.2,
        minZoom:0,
        maxZoom:8,
        maxBounds: [[100, 20],[120, 30]],
        logoPosition: 'top-right'
    },
    {
        container: 'map4',
        style: 'mapbox://styles/chanfho/cm7ogo8n8003j01s80tth79mp',
        center: [108.8, 23.66],
        zoom: 6.2,
        minZoom:0,
        maxZoom:8,
        maxBounds: [[100, 20],[120, 30]],
        logoPosition: 'top-right'
    },
    {
        container: 'map5',
        style: 'mapbox://styles/chanfho/cm7oqd4j1001i01s5hwht5itc',
        center: [108.779, 21.20],
        zoom: 9,
        minZoom:0,
        maxZoom:11,
        maxBounds: [[100, 20],[120, 30]],
        attributionControl: false,
        logoPosition: 'top-right',
        bearing: 0,
        pitch: 70,
    }
];

// 创建地图实例
const maps = mapConfigs.map(config => new mapboxgl.Map(config));

// 初始化状态
let currentIndex = 0;

// 全局变量导出
window.maps = maps;
window.mapConfigs = mapConfigs;
window.currentMapIndex = currentIndex;

// DOM 元素缓存
const slides = document.querySelectorAll('.map-slide');
const mapButtons = document.querySelectorAll('#map-buttons button');
const dataButtons = document.getElementById('data-buttons');
const mapVisMenu = document.getElementById('map-vis-menu');
const dataVisMenu = document.getElementById('data-vis-menu');

/**
 * 地图初始化函数 - 在地图加载完成后添加各种数据
 */
function initializeMaps() {
    // 为所有地图都添加行政区数据
/*     maps.forEach((map) => {
        addAdminCenters(map, `./geojson/point/admininstrationCenter.geojson`);
    }); */

    // 广西之山
    addMountainPOI(maps[0], './geojson/point/moutain_IniPOI.geojson');
    // 广西之水
    addWaterPOI(maps[1], './geojson/point/water_IniPOI.geojson');
    // 广西之林
    addForestAOI(maps[2], './geojson/polygon/forest_IniAOI.geojson');
    // 广西之田
    addCropLandPOI(maps[3], './geojson/point/cropLand_IniPOI.geojson');
    // 广西之海
    addSeaAOI(maps[4], './geojson/polygon/Sea_IniAOI.geojson');
}

/**
 * 切换到指定索引的地图
 * @param {number} index - 地图索引
 */
/**
 * 切换到指定索引的地图
 * @param {number} index - 地图索引
 */
function switchToMap(index) {
    // 安全检查：确保索引在有效范围内
    if (index < 0 || index >= maps.length) {
        console.error(`错误：索引 ${index} 超出有效范围(0-${maps.length - 1})`);
        return;
    }

    // 如果当前已是该地图，则不执行任何操作
    if (currentIndex === index) {
        return;
    }

    // 隐藏所有图例
    document.querySelectorAll('.map-legend').forEach(legend => {
        legend.classList.remove('show-legend');
    });

    // 根据地图类型显示相应图例
    if (index === 0) { // 广西之山
        document.getElementById('mountain-legend').classList.add('show-legend');
    } else if (index === 1) { // 广西之水
        document.getElementById('water-legend').classList.add('show-legend');
    } else if (index === 2) { // 广西之林 - 新增
        document.getElementById('forest-legend').classList.add('show-legend');
    } else if (index === 3) { // 广西之田 - 新增
        document.getElementById('cropland-legend').classList.add('show-legend');
    }

    // 更新按钮样式
    mapButtons.forEach(btn => btn.classList.remove('active'));
    mapButtons[index].classList.add('active');

    // 更新地图显示
    slides.forEach((slide, slideIndex) => {
        if (slideIndex === index) {
            slide.classList.add('current');
        } else {
            slide.classList.remove('current');
        }
    });


    // 获取当前以及要切换的地图和配置
    const currentMap = maps[currentIndex];
    const currentConfig = mapConfigs[currentIndex];
    const mapToSwitch = maps[index];
    const config = mapConfigs[index];

    // 执行飞行动画
    // 首先将当前地图缩放至地球页面
    currentMap.flyTo({
        center: currentConfig.center,
        zoom: 0,
        speed: 0.8,       // 飞行速度
        curve: 1.42,      // 飞行曲线
        essential: true   // 强制执行动画
    });
    setTimeout(() => {
        mapToSwitch.flyTo({
            center: config.center,
            zoom: config.zoom,
            speed: 0.8,       // 飞行速度
            curve: 1.42,      // 飞行曲线
            essential: true   // 强制执行动画
        });
    },1000);  //停留1s后再飞行

   

    // 更新全局索引
    currentIndex = index;
    window.currentMapIndex = index;
    console.log(`当前地图索引: ${window.currentMapIndex}`);

    // 如果在数据可视化模式下，更新数据按钮状态
    const dataButtons = document.getElementById('data-buttons');
    if (dataButtons.classList.contains('visible')) {
        // 更新按钮状态以反映新地图上的图层状态
        updateDataButtonStates();
    }
}
/**
 * 设置地图按钮事件监听器
 */
function setupMapButtons() {
    mapButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            switchToMap(index);
        });
    });
}

// 文档加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化地图数据
    //initializeMaps();

    // 设置地图按钮事件
    setupMapButtons();

    //初始化显示地图
    const defultIndex = 0;
    const defultMap = maps[defultIndex];
    const defultConfig = mapConfigs[defultIndex];
   
    switchToMap(defultIndex);

    setTimeout(() => {
        defultMap.flyTo({
            center: defultConfig.center,
            zoom: 0,
            speed: 10,       // 飞行速度
            curve: 1.42,      // 飞行曲线
            essential: true   // 强制执行动画
        });
    },10);
    setTimeout(() => {
        defultMap.flyTo({
            center: defultConfig.center,
            zoom: defultConfig.zoom,
            speed: 0.8,       // 飞行速度
            curve: 1.42,      // 飞行曲线
            essential: true   // 强制执行动画
        });
    },2000);  //停留1s后再飞行

    //初始化显示图例
    document.getElementById('mountain-legend').classList.add('show-legend');


    console.log('地图初始化完成');
});

// 在文件最后的导出部分添加 initializeMaps
export { switchToMap, maps, mapConfigs, initializeMaps };