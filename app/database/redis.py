
import redis.asyncio as aioredis
import asyncpg
import os
from redis.asyncio import Redis


async def sysCache() -> Redis:
    # 从URL方式创建 redis 连接池
    sysCachePool = aioredis.ConnectionPool.from_url(
        f"redis://{os.getenv('CACHE_HOST', '127.0.0.1')}:{os.getenv('CACHE_PORT', 6379)}",
        db=os.getenv('CACHE_DB', 0),
        encoding='utf-8',
        decode_responses=True
    )
    return aioredis.Redis(connection_pool=sysCachePool)


async def codeCache() -> Redis:

    # 从URL方式创建 redis 连接池
    codeCachePool = aioredis.ConnectionPool.from_url(
        f"redis://{os.getenv('CACHE_HOST', '127.0.0.1')}:{os.getenv('CACHE_PORT', 6379)}",
        db=os.getenv('CACHE_DB', 1),
        encoding='utf-8',
        decode_responses=True
    )
    return aioredis.Redis(connection_pool=codeCachePool)


async def connectPostgreSQL() -> asyncpg.Connection:

    connection = await asyncpg.connect(
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'your_db_password_here'),
        database=os.getenv('DB_NAME', 'my_db'),
        host=os.getenv('DB_HOST', '127.0.0.1'),
        port=os.getenv('DB_PORT', 5432)
    )
    return connection


async def closePostgreSQL(connection: asyncpg.Connection):
    await connection.close()
