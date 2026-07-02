from dotenv import load_dotenv, find_dotenv
from pydantic_settings import BaseSettings
from typing import List


class Config(BaseSettings):
    # 加载环境变量
    load_dotenv(find_dotenv(), override=True)
    
    # 调试模式
    APP_DEBUG: bool = True
    # 项目信息
    VERSION: str = "0.0.1"
    PROJECT_NAME: str = "fasdapi"
    
    # 跨域请求
    CORS_ORIGINS: List[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]
    
    # Session
    SECRET_KEY: str = "session"
    SESSION_COOKIE: str = "session_id"
    SESSION_MAX_AGE: int = 14 * 24 * 60 * 60  # 设置为整数类型
    
    # Jwt
    JWT_SECRET_KEY: str = "your_jwt_secret_key_here"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 24 * 60  # 设置为整数类型
    
    SWAGGER_UI_OAUTH2_REDIRECT_URL: str = "/api/test/oauth2"
    
    # 二维码过期时间
    QRCODE_EXPIRE: int = 60 * 1  # 设置为整数类型

        # DeepSeek API 配置
    DEEPSEEK_API_URL: str = "https://api.deepseek.com"
    DEEPSEEK_API_KEY: str = "sk-b488f564e87d47ffbb897e9169adb20a"




settings = Config()
