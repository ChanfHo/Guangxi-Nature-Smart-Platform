
from typing import Callable
from fastapi import FastAPI
from app.database.postgre import init_tortoise, register_postgresql
from app.database.redis import sysCache, codeCache
from redis.asyncio import Redis


async def startup_handler(app: FastAPI) -> None:
    """启动处理逻辑"""
    print("FastAPI正在启动...")

    # 先初始化Tortoise
    await init_tortoise()

    # 然后注册到FastAPI
    await register_postgresql(app)

    # 初始化Redis
    app.state.cache = await sysCache()
    app.state.codeCache = await codeCache()

    print("数据库和缓存已初始化完成")


async def shutdown_handler(app: FastAPI) -> None:
    """关闭处理逻辑"""
    print("FastAPI正在关闭...")

    # 关闭Redis连接
    cache: Redis = app.state.cache
    code: Redis = app.state.codeCache
    await cache.close()
    await code.close()

    # 关闭Tortoise连接
    await Tortoise.close_connections()

    print("所有连接已关闭")


def create_startup_handler(app: FastAPI) -> Callable:
    async def startup() -> None:
        await startup_handler(app)
    return startup


def create_shutdown_handler(app: FastAPI) -> Callable:
    async def shutdown() -> None:
        await shutdown_handler(app)
    return shutdown
