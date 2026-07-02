
import time
from fastapi import APIRouter
from starlette.endpoints import WebSocketEndpoint
from starlette.websockets import WebSocket, WebSocketDisconnect
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError, PyJWTError

from app.config import settings
from app.models.base import User
from app.schemas.base import WebsocketMessage
from typing import Any

router = APIRouter()

def check_token(token: str):
    """
    Validate the user token and return the user ID if valid.
    :param token: JWT token.
    :return: User ID or False if invalid.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_aud": False}  # 兼容不带 aud 字段的 token
        )
        uid = payload.get("user_id")
        if not uid:
            return False
        return uid
    except ExpiredSignatureError:
        print("Token has expired")
    except InvalidTokenError:
        print("Invalid token")
    except PyJWTError as e:
        print(f"Token decode error: {str(e)}")
    return False

class Echo(WebSocketEndpoint):
    encoding = "json"
    active_connections = []

    async def on_connect(self, web_socket: WebSocket):
        u_type = web_socket.query_params.get("u_type")
        token = web_socket.headers.get("sec-websocket-protocol")
        real_ip = web_socket.headers.get('x-forwarded-for')
        real_host = web_socket.headers.get("host")

        try:
            if not u_type or not token:
                raise WebSocketDisconnect

            u_id = check_token(token)
            if not u_id:
                raise WebSocketDisconnect

            await web_socket.accept(subprotocol=token)

            # Remove existing connection for this user
            self.active_connections = [
                con for con in self.active_connections
                if con["u_id"] != u_id or con["u_type"] != u_type
            ]

            print(f"Client IP: {real_ip}, Host: {real_host}, Type: {int(u_type)}, ID: {int(u_id)}")

            self.active_connections.append({
                "u_type": int(u_type),
                "u_id": int(u_id),
                "con": web_socket
            })

            online_user = await User.filter(id__in=[i['u_id'] for i in self.active_connections]) \
                .values("id", "username")
            data = {
                "action": 'refresh_online_user',
                "data": online_user
            }

            time.sleep(1)  # 模拟延迟，生产可去掉

            for con in self.active_connections:
                await con['con'].send_json(data)

        except WebSocketDisconnect:
            await web_socket.close()
            print("Disconnected")

    async def on_receive(self, web_socket: WebSocket, msg: Any):
        try:
            token = web_socket.headers.get("Sec-Websocket-Protocol")
            user = check_token(token)
            if user:
                msg = WebsocketMessage(**msg)
                if msg.action == 'push_msg':
                    msg.action = 'pull_msg'
                    msg.user = user
                    for con in self.active_connections:
                        await con['con'].send_json(msg.dict())
            else:
                raise WebSocketDisconnect
        except Exception as e:
            print(f"Error receiving message: {e}")

    async def on_disconnect(self, web_socket: WebSocket, close_code):
        for con in self.active_connections:
            if con["con"] == web_socket:
                self.active_connections.remove(con)

        online_user = await User.filter(id__in=[i['u_id'] for i in self.active_connections]) \
            .values("id", "username", "header_img")
        data = {
            "action": 'refresh_online_user',
            "data": online_user
        }
        for con in self.active_connections:
            await con['con'].send_json(data)

# 添加 WebSocket 路由
router.add_websocket_route('/test', Echo)
