import time
from starlette.datastructures import MutableHeaders  # 用于操作响应头
from starlette.types import ASGIApp, Receive, Scope, Send, Message  # 类型注解：ASGI应用标准接口
from fastapi import Request  # FastAPI 封装后的请求对象
from app.core.Utils import random_str  # 自定义的随机字符串生成工具


class BaseMiddleware:

    def __init__(self, app: ASGIApp) -> None:
        # 保存 ASGI 应用的引用
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        # 只处理 HTTP 请求，跳过 WebSocket 或其它协议
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        start_time = time.time()  # 记录请求处理开始时间
        # 构建 FastAPI 的 Request 对象（封装 scope）
        req = Request(scope, receive, send)

        # 如果 session 不存在，就为其设置一个随机 session（简单模拟登录或状态）
        if not req.session.get("session"):
            req.session.setdefault("session", random_str())

        async def send_wrapper(message: Message) -> None:
            # 响应发送前插入自定义头部：处理耗时
            process_time = time.time() - start_time
            if message["type"] == "http.response.start":
                headers = MutableHeaders(scope=message)  # 修改响应头
                headers.append("X-Process-Time", str(process_time))  # 加上耗时
            await send(message)  # 发送响应

        # 调用下一个中间件或应用，同时注入 send_wrapper
        await self.app(scope, receive, send_wrapper)
