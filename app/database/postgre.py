
from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise
import os
from tortoise import Tortoise

# 构建数据库连接 URL
db_url = (
    f"postgres://{os.getenv('DB_USER', 'postgres')}:"
    f"{os.getenv('DB_PASSWORD', 'your_db_password_here')}@"
    f"{os.getenv('DB_HOST', '127.0.0.1')}:"
    f"{int(os.getenv('DB_PORT', 5432))}/"
    f"{os.getenv('DB_NAME', 'my_db')}"
)

# 使用 URL 的配置
dbOrmConfig = {
    "connections": {
        "default": db_url
    },
    "apps": {
        "base": {  # 改为"models"作为key，这是Tortoise推荐的方式
            "models": ["app.models.base",  "aerich.models"],
            "default_connection": "default",
        },
    },
    "use_tz": False,
    "timezone": "UTC",
}


async def init_tortoise():
    """单独初始化Tortoise的函数"""
    await Tortoise.init(config=dbOrmConfig)


async def register_postgresql(app: FastAPI):
    """注册Tortoise到FastAPI"""
    register_tortoise(
        app,
        config=dbOrmConfig,
        generate_schemas=False,  # 设为True如果你需要自动生成表
        add_exception_handlers=True,  # 建议开启以处理ORM异常
    )
