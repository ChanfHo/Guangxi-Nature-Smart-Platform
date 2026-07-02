
from datetime import timedelta, datetime, timezone
from fastapi import HTTPException, Request, Depends
from fastapi.security import SecurityScopes, OAuth2PasswordBearer
from jose import ExpiredSignatureError
import jwt
from pytz import InvalidTimeError
from starlette import status
from app.config import settings
from typing import Dict
from app.models.base import User, Access

# OAuth2 configuration
oauth2_scheme = OAuth2PasswordBearer(
    settings.SWAGGER_UI_OAUTH2_REDIRECT_URL, scheme_name="User", scopes={"isAdmin": "Admin", "notAdmin": "notAdmin"}
)


def create_access_token(data: dict):
    """Create JWT access token."""
    token_data = data.copy()
    expire = datetime.now(
        timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data.update({"exp": expire})
    jwt_token = jwt.encode(
        token_data, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return jwt_token


async def check_permissions(req: Request, security_scopes: SecurityScopes, token: str = Depends(oauth2_scheme)):
    """Check the permissions and validity of the JWT token."""
    try:
        # Decode the JWT token
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM],options={"verify_aud": False}
        )

        if payload:
            user_id = payload.get("user_id", None)
            # print("user_id:", user_id)
            user_type = payload.get("user_type", None)

            if user_id is None or user_type is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials",
                    headers={"WWW-Authenticate": f"Bearer {token}"},
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": f"Bearer {token}"},
            )

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": f"Bearer {token}"},
        )

    except InvalidTimeError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": f"Bearer {token}"},
        )

    # Check user status
    user = await User.get_or_none(pk=user_id)
    if not user or user.userStatus != 1:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User does not exist or has been disabled",
            headers={"WWW-Authenticate": f"Bearer {token}"},
        )

    # Check permissions
    if security_scopes.scopes:
        if not user_type and security_scopes.scopes:
            has_permission = await Access.filter(
                role__user__id=user_id, is_check=True, scopes__in=set(security_scopes.scopes)
            ).all()
            if not has_permission:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No permissions",
                    headers={"scopes": security_scopes.scope_str},
                )

    # Cache user info
    req.state.user_id = user_id
    req.state.user_type = user_type


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    从 JWT token 获取当前用户信息并返回。
    """
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )

        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": f"Bearer {token}"},
            )
        for key, value in payload.items():
            print(f"{key}: {value}")

        user_id = payload.get("user_id", None)  # 与 create_access_token 使用同样的键名
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": f"Bearer {token}"},
            )

        user = await User.get_or_none(pk=user_id)
        if not user or user.userStatus != 1:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User does not exist or has been disabled",
                headers={"WWW-Authenticate": f"Bearer {token}"},
            )

        return user

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": f"Bearer {token}"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": f"Bearer {token}"},
        )
