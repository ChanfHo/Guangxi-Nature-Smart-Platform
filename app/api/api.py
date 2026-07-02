from fastapi import APIRouter
from app.api.endpoints import test
from app.api.endpoints import user, role, access, websocket, feedback, deepseek
# from app.api.extends import sms, wechat

api_router = APIRouter(prefix="/api")
api_router.include_router(test.router, prefix='', tags=["测试"])
api_router.include_router(user.router, prefix='', tags=["用户管理"])
api_router.include_router(role.router, prefix='/admin', tags=["角色管理"])
api_router.include_router(access.router, prefix='/admin', tags=["权限管理"])
api_router.include_router(websocket.router, prefix='/ws', tags=["WebSocket"])
api_router.include_router(feedback.router, prefix='/feedback', tags=["意见反馈"])
api_router.include_router(deepseek.router, prefix='/deepseek', tags=["AI"])
# api_router.include_router(wechat.router, prefix='/wechat', tags=["微信授权"])
# api_router.include_router(sms.router, prefix='/sms', tags=["短信接口"])
# api_router.include_router(cos.router, prefix='/cos', tags=["对象存储接口"])
