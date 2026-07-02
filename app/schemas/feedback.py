
# schemas/feedback.py
from pydantic import BaseModel, Field
from datetime import datetime


class FeedbackIn(BaseModel):
    content: str = Field(..., description="反馈内容")
    contact: str | None = Field(None, description="联系方式")


class FeedbackOut(BaseModel):
    id: int
    user_id: int
    content: str
    contact: str | None
    createTime: datetime

    class Config:
        from_attributes = True
