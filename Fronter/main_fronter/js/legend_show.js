/**
 * 在地图容器中添加图例
 * @param {string} containerId - 地图容器的DOM ID
 * @param {Array} legendItems - 图例项数组，每项包含颜色和标签
 * @example
 * addLegendToMap('map', [
 *     { color: '#ff5200', label: '行政中心' },
 *     { color: '#0074D9', label: '道路网络' },
 *     { color: '#00FF00', label: '土地用途' }
 * ]);
 */
function addLegendToMap(containerId, legendItems = []) {
    // 获取地图容器
    const mapContainer = document.getElementById(containerId);
    if (!mapContainer) {
        console.error(`地图容器ID "${containerId}" 不存在`);
        return;
    }

    // 创建图例容器
    const legendContainer = document.createElement('div');
    legendContainer.className = 'map-legend';
    legendContainer.style.position = 'absolute';
    legendContainer.style.bottom = '10px';
    legendContainer.style.right = '10px';
    legendContainer.style.backgroundColor = 'white';
    legendContainer.style.padding = '10px';
    legendContainer.style.borderRadius = '5px';
    legendContainer.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
    legendContainer.style.fontSize = '12px';
    legendContainer.style.zIndex = '1';

    // 添加图例项
    legendItems.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.style.display = 'flex';
        legendItem.style.alignItems = 'center';
        legendItem.style.marginBottom = '5px';

        const colorBox = document.createElement('span');
        colorBox.style.display = 'inline-block';
        colorBox.style.width = '12px';
        colorBox.style.height = '12px';
        colorBox.style.backgroundColor = item.color;
        colorBox.style.marginRight = '8px';
        colorBox.style.border = '1px solid #000';

        const label = document.createElement('span');
        label.textContent = item.label;

        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legendContainer.appendChild(legendItem);
    });

    // 将图例容器添加到地图容器中
    mapContainer.appendChild(legendContainer);
}

// 使用示例
// addLegendToMap('map', [
//     { color: '#ff5200', label: '行政中心' },
//     { color: '#0074D9', label: '道路网络' },
//     { color: '#00FF00', label: '土地用途' }
// ]);