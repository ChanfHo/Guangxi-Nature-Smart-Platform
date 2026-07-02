
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.core.Auth import create_access_token
from app.models.base import User

router = APIRouter()


@router.post("/test/oauth2", tags=["测试oauth2授权"])
async def test_oauth2(data: OAuth2PasswordRequestForm = Depends()):
    user_type = False
    if not data.scopes:
        raise HTTPException(status_code=401, detail="请选择作用域!")
    if "is_admin" in data.scopes:
        user_type = True
        # 根据 username 查找用户
    user = await User.get_or_none(username=data.username)  # 查找用户名
    if not user:
        raise HTTPException(status_code=404, detail="用户未找到")
    for key, value in vars(data).items():
        print(f"{key}: {value}")
    print("dataend")

    jwt_data = {
        "user_id": user.pk,
        "user_type": user_type
    }
    print(f"user_id111: {user.pk}")
    jwt_token = create_access_token(data=jwt_data)
    return {"access_token": jwt_token, "token_type": "bearer"}
