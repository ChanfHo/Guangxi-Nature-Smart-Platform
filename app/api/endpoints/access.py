
from fastapi import APIRouter, Security

from app.core.Auth import check_permissions
from app.core.Response import fail, success
from app.schemas import role, base
from app.models.base import Role, Access

router = APIRouter(prefix='/access')


@router.post('', summary="权限创建", response_model=base.BaseResp)
async def create_access(post: role.CreateAccess):
    check = await Access.get_or_none(scopes=post.scopes)
    if check:
        return fail(msg=f"scopes:{post.scopes} 已经存在!")

    result = await Access.create(**post.dict())
    if not result:
        return fail(msg="创建失败!")

    return success(msg=f"权限 {result.pk} 创建成功!")


@router.get('', summary="权限查询", dependencies=[Security(check_permissions, scopes=["role_access"])])
async def get_all_access(role_id: int):
    result = await Access.annotate(key="id", title="access_name").all() \
        .values("key", "title", "parent_id")

    # 当前角色权限
    role_access = await Access.filter(role__id=role_id).values_list('id')
    role_access = [i[0] for i in role_access]

    # 系统权限树
    tree_data = access_tree(result, 0)

    return success(msg="当前用户可以下发的权限", data={
        "all_access": tree_data,
        "role_access": role_access
    })


@router.put('', summary="权限设置",
            dependencies=[Security(check_permissions, scopes=["role_access"])], response_model=base.BaseResp)
async def set_role_access(post: role.SetAccess):
    # 获取当前角色
    role_data = await Role.get_or_none(id=post.role_id)

    # 清空权限
    await role_data.access.clear()

    # 无设置权限
    if not post.access:
        return success(msg="已清空当前角色所有权限!")

    # 获取分配的权限集合
    access = await Access.filter(id__in=post.access, is_check=True).all()

    # 添加权限
    await role_data.access.add(*access)

    return success(msg="保存成功!")


def access_tree(data, pid):
    result = []
    for item in data:
        if pid == item["parent_id"]:
            children = access_tree(data, item["key"])
            if children:
                item["children"] = children
            result.append(item)
    return result
