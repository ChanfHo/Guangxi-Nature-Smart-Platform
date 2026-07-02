from pydantic import BaseModel, Field
from typing import List, Optional
from app.schemas.base import ResAntTable
from datetime import datetime


class CreateRole(BaseModel):
    roleName: str = Field(min_length=3, max_length=10, description="角色名称")
    roleStatus: Optional[bool] = False  # 默认值 False
    roleDesc: Optional[str] = Field(max_length=255, description="角色描述")


class UpdateRole(BaseModel):
    id: int
    roleName: str  
    roleStatus: Optional[bool]
    roleDesc: Optional[str]


class RoleItem(BaseModel):
    id: int
    key: int
    roleName: str
    roleStatus: Optional[bool]
    roleDesc: Optional[str]
    createTime: datetime  
    updateTime: datetime  


class RoleList(ResAntTable):
    data: List[RoleItem]


class SetAccess(BaseModel):
    roleId: int  #


class CreateAccess(BaseModel):
    access_name: str = Field("测试", description="权限名称")
    scopes: str = Field("test", description="权限标识")
    parent_id: int = 0
    is_check: bool = False
    is_menu: bool = False
