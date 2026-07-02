
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from tortoise.exceptions import OperationalError, DoesNotExist, IntegrityError, ValidationError

from app.config import settings
from app.core import Exception, Router, Middleware
from app.core.Events import create_startup_handler, create_shutdown_handler

application = FastAPI(
    debug=settings.APP_DEBUG,
)

# 注册事件处理器
application.add_event_handler("startup", create_startup_handler(application))
application.add_event_handler("shutdown", create_shutdown_handler(application))

# 添加其他中间件和路由...

# 异常错误处理
application.add_exception_handler(HTTPException, Exception.httpErrorHandler)
application.add_exception_handler(
    RequestValidationError, Exception.http422ErrorHandler)
application.add_exception_handler(
    Exception.UnicornException, Exception.unicornExceptionHandler)
application.add_exception_handler(DoesNotExist, Exception.postgresDoesNotExist)
application.add_exception_handler(
    IntegrityError, Exception.postgresIntegrityError)
application.add_exception_handler(
    ValidationError, Exception.postgresValidationError)
application.add_exception_handler(
    OperationalError, Exception.postgresOperationalError)

# 中间件
application.add_middleware(Middleware.BaseMiddleware)
application.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)
application.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    session_cookie=settings.SESSION_COOKIE,
    max_age=settings.SESSION_MAX_AGE
)

# 路由
application.include_router(Router.router)

app = application
