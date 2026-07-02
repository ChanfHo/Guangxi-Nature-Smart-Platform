from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from typing import Union
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from tortoise.exceptions import OperationalError, DoesNotExist, IntegrityError, ValidationError as PostgresValidationError


async def postgresValidationError(_: Request, exc: PostgresValidationError):
    print("ValidationError", exc)
    return JSONResponse({
        "code": -1,
        "message": str(exc),
        "data": []
    }, status_code=422)


async def postgresIntegrityError(_: Request, exc: IntegrityError):
    print("IntegrityError", exc)
    return JSONResponse({
        "code": -1,
        "message": str(exc),
        "data": []
    }, status_code=422)


async def postgresDoesNotExist(_: Request, exc: DoesNotExist):
    print("DoesNotExist", exc)
    return JSONResponse({
        "code": -1,
        "message": "发出的请求针对的是不存在的记录，服务器没有进行操作。",
        "data": []
    }, status_code=404)


async def postgresOperationalError(_: Request, exc: OperationalError):
    print("OperationalError", exc)
    return JSONResponse({
        "code": -1,
        "message": "数据操作失败",
        "data": []
    }, status_code=500)


async def httpErrorHandler(_: Request, exc: HTTPException):
    if exc.status_code == 401:
        return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)

    return JSONResponse({
        "code": exc.status_code,
        "message": exc.detail,
        "data": exc.detail
    }, status_code=exc.status_code, headers=exc.headers)


class UnicornException(Exception):
    def __init__(self, code, errmsg, data=None):
        if data is None:
            data = {}
        self.code = code
        self.errmsg = errmsg
        self.data = data


async def unicornExceptionHandler(_: Request, exc: UnicornException):
    return JSONResponse({
        "code": exc.code,
        "message": exc.errmsg,
        "data": exc.data,
    })


async def http422ErrorHandler(_: Request, exc: Union[RequestValidationError, ValidationError]) -> JSONResponse:
    print("[422]", exc.errors())
    return JSONResponse(
        {
            "code": status.HTTP_422_UNPROCESSABLE_ENTITY,
            "message": f"数据校验错误 {exc.errors()}",
            "data": exc.errors(),
        },
        status_code=422,
    )
