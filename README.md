# “广”阔山河，生生不“西”——广西自然风光智慧服务平台

![广西自然风光智慧服务平台](Fronter/main_fronter/login/background.jpeg)

## 📖 项目简介
本项目为“广西自然风光智慧服务平台”，致力于整合广西山水林田海五大类自然资源信息。通过引入GIS（地理信息系统）技术与AI交互，将传统的纸质自然风光图集进行数字化升级，旨在为游客、政府及科研人员提供多尺度、多风格的地图可视化体验，以及智能化旅游路线规划和AI互动服务。

### 🌟 核心特色
1. **智慧地图引擎**：基于MapBox技术，保留原有艺术化底图风格，实现纸质地图的“电子重生”。
2. **空间数据个性化交互**：构建专属空间数据库，支持点、线、面等多种自然风光数据交互，突破纸质限制。
3. **AI交互新维度**：集成 DeepSeek 大语言模型，推出智能助手“小桂”。不仅能实现自然语言问答，更支持“对话生成地图”功能，针对用户问题自动在地图上进行打点标记。
4. **公众评价与反馈**：搭建UGC（用户生成内容）生态，游客可对各个保护区、景点提交反馈或纠错信息，实现智慧管理。

## ⚙️ 系统架构与技术栈
* **前端展示**：HTML5 / CSS3 / JavaScript，使用 **MapBox GL JS** 进行地图渲染和交互，呈现山、水、林、田、海五种不同主题的底图。
* **后端服务**：基于 **FastAPI (Python)** 构建的高性能RESTful API接口，集成深度学习大模型进行语义理解与问答。
* **数据库**：
  * **PostgreSQL** + PostGIS：存储海量地理空间数据（如GeoJSON、Shapefile信息）和业务数据。
  * **Redis**：作为高速缓存系统，优化并发查询效率。
  * **Tortoise ORM**：Python的异步对象关系映射工具，负责数据持久化操作。

## 📂 核心模块与文件结构
* `Fronter/`：前端项目源码。
  * `main_fronter/`：核心地图与交互页面，包含HTML入口、样式表(CSS)、前端逻辑脚本(JS)、地理数据资源(geojson、shapefile)、地图图标素材。
  * `login/` & `register/`：用户认证、登录、注册界面。
  * `travel/`：行旅壮乡（旅游路线推荐与展示）模块。
* `app/`：后端FastAPI应用源码。
  * `api/`：API路由定义（如用户管理、DeepSeek对话接口、反馈系统等）。
  * `core/`：核心配置文件（异常处理、中间件、事件监听）。
  * `database/`：PostgreSQL与Redis的连接配置。
  * `models/`：Tortoise ORM数据模型定义。
  * `schemas/`：Pydantic数据验证与序列化模型。
  * `main.py`：后端服务启动入口。
* `migrations/`：数据库迁移脚本，用于管理和更新数据库表结构。

## 🚀 部署与运行

### 1. 环境准备
确保您的计算机已安装：
* Python 3.10+
* PostgreSQL (建议安装PostGIS插件)
* Redis

### 2. 后端部署
```bash
# 1. 安装依赖
pip install -r requirement.txt

# 2. 配置环境变量
# 请在 app/config.py 或使用 .env 文件配置你的数据库连接信息与 DeepSeek API Key
# 示例:
# DB_USER = 'postgres'
# DB_PASSWORD = 'your_password'
# DEEPSEEK_API_KEY = 'your_deepseek_api_key'

# 3. 运行服务
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. 前端部署
由于前端直接采用了原生HTML/CSS/JS结构，并请求本地或远程API：
* 直接使用 VSCode 的 `Live Server` 插件打开 `Fronter/main_fronter/index.html` 即可预览。
* 如部署至服务器，可使用 Nginx 将静态资源目录指向 `Fronter/main_fronter`。

## 🤝 贡献与反馈
如果你对本项目感兴趣，欢迎提交 Pull Request，或者在 Issues 中提出你的宝贵意见！
同时感谢您体验广西自然风光智慧服务平台！

---
**致谢**：感谢中国大学生计算机设计大赛及所有指导老师的悉心指导。
