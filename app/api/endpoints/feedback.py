
# routers/feedback.py

from fastapi import APIRouter, HTTPException, Depends, Security
from tortoise.transactions import in_transaction
from app.models.base import Feedback
from app.models.base import User
from app.schemas.feedback import FeedbackIn, FeedbackOut
from app.core.Auth import check_permissions, get_current_user
from app.core.Response import success, fail

router = APIRouter(prefix='', tags=["意见反馈"])


@router.post("", response_model=FeedbackOut)
async def create_feedback(feedback_in: FeedbackIn, user: User = Depends(get_current_user)):

    # 将请求的反馈数据和当前用户 ID 一起保存到数据库
    try:
        feedback = await Feedback.create(
            user_id=int(user.pk),  # 使用当前用户的 ID
            content=feedback_in.content,
            contact=feedback_in.contact
        
        )
        return feedback
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", summary="查看所有反馈（需传入用户ID）")
async def get_feedback(user_id: int):
    """
    查看所有反馈
    """
    # 先检查用户是否存在
    user_obj = await User.get_or_none(id=user_id)

    if not user_obj:
        return fail(msg="用户不存在")

    try:
        # 获取所有反馈并按创建时间降序排列
        feedbacks = await Feedback.all().order_by("-createTime")

        # 将反馈对象转换为可序列化的字典列表
        feedback_list = []
        async for feedback in feedbacks:
            feedback_dict = {
                "id": feedback.id,
                "content": feedback.content,
                "contact": feedback.contact,
                "createTime": feedback.createTime.isoformat() if feedback.createTime else None,
                "user_id": feedback.user_id
            }
            feedback_list.append(feedback_dict)

        # 使用success包装
        return success(data=feedback_list)
    except Exception as e:
        return fail(msg=f"获取反馈失败: {str(e)}")
