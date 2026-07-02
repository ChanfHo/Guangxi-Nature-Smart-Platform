from fastapi import Request
from app.models.base import AccessLog

async def write_access_log(req: Request, user_id: int, note: str = None):
    data = {
        "user_id": user_id,
        "target_url": req.url.path,  # 获取路径
        "user_agent": req.headers.get('user-agent'),
        "request_params": {
            "method": req.method,
            "params": dict(req.query_params),
            "body": bytes(await req.body()).decode()  # 获取请求体内容并解码
        },
        "ip": req.headers.get('x-forwarded-for'),
        "note": note
    }
    
    # 使用 Tortoise ORM 写入 PostgreSQL 数据库
    await AccessLog.create(**data)
