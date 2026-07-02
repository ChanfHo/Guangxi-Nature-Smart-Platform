/**
 * 广西旅游路线推荐 - UI模块
 * 文件路径: /home/ubuntu/ComputerDesign/Fronter/main_fronter/travel/js/travel-ui.js
 * 
 * 负责处理用户界面交互、DOM操作和动画效果
 */

// UI模块
const UIModule = (function () {
  // 标记详情模态框状态
  let isDetailOpen = false;

  /**
   * 更新路线选择器状态
   * @param {number} routeId - 路线ID (1-4)
   */
  function updateRouteSelectors(routeId) {
    // 更新顶部选择器
    document.querySelectorAll('.selector-option').forEach(option => {
      option.classList.remove('active');
    });
    document.querySelector(`.selector-option[data-route="${routeId}"]`).classList.add('active');

    // 更新背景图
    document.querySelectorAll('.bg-image').forEach(bg => {
      bg.classList.remove('active');
    });
    document.getElementById(`bg-route${routeId}`).classList.add('active');
  }

  /**
   * 显示路线详情
   * @param {number} routeId - 路线ID (1-4)
   */
  function showRouteDetail(routeId) {
    // 更新URL参数，方便分享
    window.history.replaceState(null, null, `?route=${routeId}`);

    // 添加data-route属性以支持自定义样式
    document.querySelector('.detail-content-section').setAttribute('data-route', routeId);


    // 获取路线数据
    const data = DataModule.getRouteData(routeId);
    if (!data) {
      console.error(`路线${routeId}数据不存在`);
      return;
    }

    // 获取路线主题
    const theme = DataModule.getRouteTheme(routeId);

    // 填充详情内容
    // 设置标题和主题
    document.getElementById('detail-title').textContent = theme.title;
    document.getElementById('detail-theme').textContent = theme.theme;
    document.getElementById('detail-brief').textContent = theme.overview.substring(0, 100) + '...';

    document.getElementById('detail-content-title').textContent = theme.title;
    document.getElementById('detail-content-theme').textContent = theme.theme;
    document.getElementById('route-overview').textContent = theme.overview;

    // 设置统计信息
    document.getElementById('stat-attractions').textContent = data.features.length;
    document.getElementById('stat-distance').textContent = theme.distance.replace('约', '');
    document.getElementById('stat-days').textContent = theme.days;

    // 生成景点列表
    // generateAttractionsList(routeId);

    // 显示模态框
    document.getElementById('route-detail').style.display = 'flex';
    isDetailOpen = true;


    // 使用更可靠的延时确保DOM已完全加载
    setTimeout(() => {
      generateAttractionsList(routeId);

      // 创建详情地图
      MapModule.initDetailMap(routeId);
    }, 300); // 增加延时确保DOM已更新
  }


  /**
   * 生成景点列表
   * @param {number} routeId - 路线ID (1-4)
   */
  /**
  * 生成景点列表
  * @param {number} routeId - 路线ID (1-4)
  */
  function generateAttractionsList(routeId) {
    // 获取排序后的景点
    const sortedAttractions = DataModule.getSortedAttractions(routeId);
    if (!sortedAttractions || sortedAttractions.length === 0) {
      console.error(`路线${routeId}没有景点数据或数据为空`);
      return;
    }

    // 获取景点列表容器
    const attractionsList = document.getElementById('attractions-list');
    if (!attractionsList) {
      console.error('找不到景点列表容器元素');
      return;
    }
    console.log('景点数据:', sortedAttractions.length, '个景点');

    // 清空容器
    attractionsList.innerHTML = '';

    // 强制设置容器样式确保可见
    attractionsList.style.display = 'flex';
    attractionsList.style.flexDirection = 'column';
    attractionsList.style.gap = '20px';
    attractionsList.style.width = '100%';
    attractionsList.style.marginTop = '30px';

    // 添加标题元素增强可见性
    const heading = document.createElement('h3');
    heading.className = 'attractions-heading';
    heading.textContent = '路线景点';
    attractionsList.appendChild(heading);

    // 添加景点项
    sortedAttractions.forEach(attraction => {
      try {
        const props = attraction.properties;

        // 获取景点属性的辅助函数
        const getName = () => props?.name || props?.Name || '未命名景点';
        const getOrder = () => props?.Order || props?.order || '0';
        const getType = () => props?.type || props?.Type || '景点';
        const getLevel = () => props?.level || props?.Level || '';
        const getInfo = () => props?.info || props?.Info || '暂无详细信息';
        const getCity = () => props?.city || props?.City || '广西';

        // 创建景点项元素
        const attractionItem = document.createElement('div');
        attractionItem.className = 'attraction-item';
        attractionItem.setAttribute('data-route', routeId);

        // 构建景点HTML内容
        attractionItem.innerHTML = `
        <div class="attraction-header">
          <div class="attraction-order">${getOrder()}</div>
          <h4>${getName()}</h4>
        </div>
        <div class="attraction-content">
          <p>${getInfo()}</p>
          <div class="attraction-meta">
            <span class="attraction-type">${getType()}</span>
            <span class="attraction-city">${getCity()}</span>
            ${getLevel() ? `<span class="attraction-level">${getLevel()}</span>` : ''}
          </div>
        </div>
      `;
        console.log('创建景点项:', attractionItem); // 调试日志
        attractionsList.appendChild(attractionItem);
      } catch (error) {
        console.error('创建景点项时出错:', error, attraction);
      }
    });

    // 确保父容器可滚动查看全部内容
    const contentSection = document.querySelector('.detail-content-section');
    if (contentSection) {
      contentSection.style.overflowY = 'auto';
    }
  }

  /**
   * 关闭路线详情模态框
   */
  function closeRouteDetail() {
    document.getElementById('route-detail').style.display = 'none';
    isDetailOpen = false;

    // 移除URL参数
    window.history.replaceState(null, null, window.location.pathname);
  }

  /**
   * 设置事件监听器
   */
  function setupEventListeners() {
    // 路线选择器点击事件
    document.querySelectorAll('.selector-option').forEach(option => {
      option.addEventListener('click', () => {
        const routeId = parseInt(option.getAttribute('data-route'));
        MapModule.showRouteOnMap(routeId);
      });
    });

    // 地图切换按钮点击事件
    document.getElementById('toggle-map').addEventListener('click', (e) => {
      e.preventDefault();

      // 如果已经在地图视图，滚动到路线卡片区域
      const routeCards = document.getElementById('route-cards');
      routeCards.scrollIntoView({ behavior: 'smooth' });
    });

    // 滚动到路线卡片区域的链接
    document.querySelector('.js-scroll').addEventListener('click', (e) => {
      e.preventDefault();
      const routeCards = document.getElementById('route-cards');
      routeCards.scrollIntoView({ behavior: 'smooth' });
    });

    // 路线卡片悬停切换背景
    // 路线卡片悬停切换背景
    document.querySelectorAll('.route-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        console.log('卡片悬停事件触发'); // 调试日志
        const routeId = card.getAttribute('data-route-id');
        console.log('切换到背景:', routeId); // 添加显式日志

        // 先移除所有活动状态
        document.querySelectorAll('.bg-image').forEach(bg => {
          bg.classList.remove('active');
          bg.style.opacity = '0'; // 重置所有背景的不透明度
        });

        // 再激活目标背景
        const newBg = document.getElementById(`bg-route${routeId}`);
        if (newBg) {
          newBg.classList.add('active');
          newBg.style.opacity = '0.9'; // 直接设置更高的不透明度
        }
      });
    });

    // 路线卡片点击事件
    document.querySelectorAll('.view-route-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const routeId = parseInt(btn.closest('.route-card').getAttribute('data-route-id'));
        showRouteDetail(routeId);
      });
    });

    // 关闭模态框按钮
    document.querySelector('.close-modal').addEventListener('click', closeRouteDetail);

    // 点击模态框外部关闭
    document.getElementById('route-detail').addEventListener('click', (e) => {
      if (e.target === document.getElementById('route-detail')) {
        closeRouteDetail();
      }
    });

    // 键盘ESC键关闭模态框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isDetailOpen) {
        closeRouteDetail();
      }
    });

    // 窗口大小改变时重新调整地图
    window.addEventListener('resize', () => {
      MapModule.resizeMaps();
    });
  }

  /**
   * 初始化滚动效果
   */
  function initScrollEffects() {
    // 监听滚动事件
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      // 滚动指示器淡出效果
      const scrollIndicator = document.querySelector('.scroll-down-indicator');
      if (scrollIndicator) {
        if (scrollPosition > 100) {
          scrollIndicator.style.opacity = '0';
        } else {
          scrollIndicator.style.opacity = '1';
        }
      }

      // 路线卡片出现动画
      const routeCards = document.querySelectorAll('.route-card');
      routeCards.forEach((card, index) => {
        const cardTop = card.getBoundingClientRect().top;
        if (cardTop < windowHeight * 0.9) {
          setTimeout(() => {
            card.classList.add('visible');
          }, index * 120); // 依次显示卡片
        }
      });
    });

    // 触发一次滚动事件以初始化效果
    window.dispatchEvent(new Event('scroll'));
  }

  // 公开API
  return {
    updateRouteSelectors,
    showRouteDetail,
    closeRouteDetail,
    setupEventListeners,
    initScrollEffects,
    generateAttractionsList
  };
})();