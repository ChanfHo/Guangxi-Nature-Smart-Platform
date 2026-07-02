from typing import Any, List, Optional


def res_antd(data: Optional[List] = None, total: int = 0, code: bool = True):
    if data is None:
        data = []
    result = {
        "success": code,
        "data": data,
        "total": total
    }
    return result


def baseResponse(code: int, msg: str, data: Any = None):
    if data is None:
        data = {}
    result = {
        "code": code,
        "message": msg,
        "data": data
    }
    return result


def success(data: Any = None, msg: str = ''):
    return baseResponse(200, msg, data)


def fail(code: int = -1, msg: str = '', data: Any = None):
    if data is None:
        # 默认提供空的必要字段
        data = {"token": "", "expiresIn": 0}
    return baseResponse(code, msg, data)
