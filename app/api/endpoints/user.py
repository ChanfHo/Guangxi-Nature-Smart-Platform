
import os
from typing import List

from fastapi import HTTPException, Request, Query, APIRouter, Security, File, UploadFile

from app.api.endpoints.common import write_access_log
from app.core.Response import success, fail, res_antd
from app.models.base import User, Role, Access, AccessLog
from app.schemas import user
from app.schemas.user import UpdateUserInfo, ModifyMobile, RegisterUser
from app.core.Utils import en_password, check_password, random_str
from app.core.Auth import create_access_token, check_permissions
from app.config import settings


router = APIRouter(prefix='/user')


@router.post("/add", summary="用户添加", dependencies=[Security(check_permissions, scopes=["user_add"])])
async def user_add(post: user.CreateUser):
    get_user = await User.get_or_none(username=post.username)
    if get_user:
        return fail(msg=f"用户名 {post.username} 已经存在!")

    post.password = en_password(post.password)
    create_user = await User.create(**post.dict())
    if not create_user:
        return fail(msg=f"用户 {post.username} 创建失败!")

    if post.roles:
        roles = await Role.filter(id__in=post.roles, role_status=True)
        await create_user.role.add(*roles)

    return success(msg=f"用户 {create_user.username} 创建成功")


@router.delete("/delete", summary="用户删除", dependencies=[Security(check_permissions, scopes=["user_delete"])])
async def user_del(req: Request, user_id: int):
    if req.state.user_id == user_id:
        return fail(msg="你不能把自己踢出局吧?")

    deleted = await User.filter(pk=user_id).delete()
    if not deleted:
        return fail(msg=f"用户 {user_id} 删除失败!")
    return success(msg="删除成功")


@router.put("/change", summary="用户修改", dependencies=[Security(check_permissions, scopes=["user_update"])])
async def user_update(post: user.UpdateUser):
    user_check = await User.get_or_none(pk=post.id)
    if not user_check or user_check.pk == 1:
        return fail(msg="用户不存在")

    if user_check.username != post.username:
        if await User.get_or_none(username=post.username):
            return fail(msg=f"用户名 {post.username} 已存在")

    data = post.dict()
    if post.password:
        data["password"] = en_password(post.password)
    else:
        data.pop("password")
    data.pop("id")

    await User.filter(pk=post.id).update(**data)
    return success(msg="更新成功!")


@router.put("/set/role", summary="角色分配", dependencies=[Security(check_permissions, scopes=["user_role"])])
async def set_role(post: user.SetRole):
    user_obj = await User.get_or_none(pk=post.user_id)
    if not user_obj:
        return fail(msg="用户不存在!")

    await user_obj.role.clear()

    if post.roles:
        roles = await Role.filter(id__in=post.roles, role_status=True)
        await user_obj.role.add(*roles)

    return success(msg="角色分配成功!")


@router.get("/list", summary="用户列表", response_model=user.UserListData,
            dependencies=[Security(check_permissions, scopes=["user_query"])])
async def user_list(
    page_size: int = 10,
    current: int = 1,
    username: str = Query(None),
    user_phone: str = Query(None),
    userStatus: bool = Query(None),
    create_time: List[str] = Query(None)
):
    filters = {}
    if username:
        filters["username"] = username
    if user_phone:
        filters["user_phone"] = user_phone
    if userStatus is not None:
        filters["userStatus"] = userStatus
    if create_time:
        filters["create_time__range"] = create_time

    user_data = User.filter(**filters).filter(id__not=1)
    total = await user_data.count()
    data = await user_data.limit(page_size).offset(page_size * (current - 1)).order_by("-create_time").values(
        "id",  "username", "userType", "user_phone", "user_email",
        "userStatus", "header_img", "sex", "remarks", "create_time", "update_time"
    )

    # 兼容 antd key 字段
    for item in data:
        item["key"] = item["id"]

    return res_antd(code=True, data=data, total=total)


@router.get("/info", summary="获取当前用户信息", response_model=user.CurrentUser,
            dependencies=[Security(check_permissions)])
async def user_info(req: Request):
    user_data = await User.get_or_none(pk=req.state.user_id)
    if not user_data:
        return fail(msg=f"用户 ID {req.state.user_id} 不存在!")

    access = []
    if not req.state.user_type:
        two_level_access = await Access.filter(role__user__id=req.state.user_id, is_check=True).values_list("parent_id", flat=True)
        one_level_access = await Access.filter(id__in=two_level_access).values_list("parent_id", flat=True)
        all_access = list(set(one_level_access + two_level_access))
        access = await Access.filter(id__in=all_access).values_list("scopes", flat=True)

    if user_data.userPhone:
        user_data.userPhone = user_data.userPhone[:3] + \
            "****" + user_data.userPhone[7:]

    user_data.__setattr__("scopes", access)
    return success(msg="用户信息", data=user_data.__dict__)


@router.post("/account/login", response_model=user.UserLogin, summary="用户登录")
async def login_account(request: Request, credentials: user.AccountLogin):
    """
    用户登录接口：通过用户名和密码验证，返回 JWT token。
    """
    if not (credentials.username and credentials.password):
        return fail(msg="用户名和密码不能为空！")

    user_obj = await User.get_or_none(username=credentials.username)
    if not user_obj:
        return fail(msg=f"用户 {credentials.username} 不存在！")

    if not user_obj.password or not check_password(credentials.password, user_obj.password):
        return fail(msg="密码错误，请重新输入！")

    if not user_obj.userStatus:
        return fail(msg="该账户已被管理员禁用！")

    token_payload = {
        "user_id": user_obj.pk,
        "user_type": user_obj.userType
    }
    # print(user_obj.pk)
    token = create_access_token(data=token_payload)

    response_data = {
        "token": token,
        "expiresIn": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

    await write_access_log(request, user_obj.pk, "登录系统成功")

    return success(msg="登录成功 🎉", data=response_data)


@router.post("/account/register", summary="用户注册")
async def register_user(data: RegisterUser):
    existing = await User.get_or_none(userEmail=data.userEmail)
    if existing:
        return fail(msg="该邮箱已被注册")

    hashed = en_password(data.password)
    await User.create(username=data.username, password=hashed, userEmail=data.userEmail)

    return success(msg=f"用户 {data.username} 注册成功")


@router.get("/access/log", dependencies=[Security(check_permissions)], summary="用户访问记录")
async def get_access_log(req: Request):
    log = await AccessLog.filter(user_id=req.state.user_id).limit(10).order_by("-create_time").values(
        "create_time", "ip", "note", "id"
    )
    return success(msg="access log", data=log)


@router.put("/info", dependencies=[Security(check_permissions)], summary="用户基本信息修改")
async def update_user_info(req: Request, post: UpdateUserInfo):
    await User.filter(id=req.state.user_id).update(**post.dict(exclude_none=True))
    return success(msg="更新成功!")


@router.put("/modify/mobile", dependencies=[Security(check_permissions)], summary="用户手机号修改")
async def update_mobile(req: Request, post: ModifyMobile):
    from app.extends.sms import check_code  # 延迟导入避免循环引用

    is_check = await check_code(req, post.captcha, post.mobile)
    if not is_check:
        return fail(msg="无效验证码或验证失败!")

    await User.filter(id=req.state.user_id).update(user_phone=post.mobile)
    return success(msg="手机号更新成功!")


@router.post("/upload/avatar", summary="上传用户头像")
async def upload_avatar(req: Request, file: UploadFile = File(...)):
    img_dir = os.path.join(settings.UPLOAD_DIR, "avatar",
                           str(req.state.user_id))
    os.makedirs(img_dir, exist_ok=True)

    suffix = os.path.splitext(file.filename)[-1]
    img_name = f"{random_str(16)}{suffix}"
    file_path = os.path.join(img_dir, img_name)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    await User.filter(id=req.state.user_id).update(header_img=file_path)
    return success(msg="头像上传成功!", data={"avatar": file_path})
