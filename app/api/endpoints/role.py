from typing import List
from fastapi import Query, APIRouter, Security
from app.core.Auth import check_permissions
from app.core.Response import res_antd, success, fail
from app.schemas.role import CreateRole, UpdateRole, RoleList
from app.models.base import Role

router = APIRouter(prefix='/role')


@router.get("/all", summary="所有角色下拉选项专用", dependencies=[Security(check_permissions, scopes=["user_role"])])
async def all_roles_options(user_id: int = Query(None)):
    roles = await Role.annotate(label="role_name", value="id").filter(role_status=True).values('label', 'value')
    user_roles = []
    if user_id:
        user_role = await Role.filter(user__id=user_id, role_status=True).values_list('id')
        user_roles = [i[0] for i in user_role]
    return success(msg="所有角色下拉选项专用", data={
        "all_role": roles,
        "user_roles": user_roles
    })


@router.post("", summary="角色添加", dependencies=[Security(check_permissions, scopes=["role_add"])])
async def create_role(post: CreateRole):
    result = await Role.create(**post.dict())
    if not result:
        return fail(msg="创建失败!")
    return success(msg="创建成功!")


@router.delete("", summary="角色删除", dependencies=[Security(check_permissions, scopes=["role_delete"])])
async def delete_role(role_id: int):
    role = await Role.get_or_none(pk=role_id)
    if not role:
        return fail(msg="角色不存在!")
    result = await Role.filter(pk=role_id).delete()
    if not result:
        return fail(msg="删除失败!")
    return success(msg="删除成功!")


@router.put("", summary="角色修改", dependencies=[Security(check_permissions, scopes=["role_update"])])
async def update_role(post: UpdateRole):
    data = post.dict()
    data.pop("id")
    result = await Role.filter(pk=post.id).update(**data)
    if not result:
        return fail(msg="更新失败!")
    return success(msg="更新成功!")


@router.get('', summary="角色列表", response_model=RoleList,
            dependencies=[Security(check_permissions, scopes=["role_query"])])
async def get_all_role(
        pageSize: int = 10,
        current: int = 1,
        role_name: str = Query(None),
        role_status: bool = Query(None),
        create_time: List[str] = Query(None)
) -> RoleList:
    query = {}
    if role_name:
        query["role_name"] = role_name
    if role_status is not None:
        query["role_status"] = role_status
    if create_time:
        query["create_time__range"] = create_time

    role_query = Role.annotate(key="id").filter(**query)
    total = await role_query.count()
    data = await role_query.limit(pageSize).offset(pageSize * (current - 1)).order_by("-create_time").values(
        "key", "id", "role_name", "role_status", "role_desc", "create_time", "update_time"
    )
    return res_antd(code=True, data=data, total=total)
