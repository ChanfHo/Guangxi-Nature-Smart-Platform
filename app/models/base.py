from tortoise import fields
from tortoise.models import Model
# TODO:想换一个ORM


class TimestampMixin(Model):
    createTime = fields.DatetimeField(auto_now_add=True, description='创建时间')
    updateTime = fields.DatetimeField(auto_now=True, description="更新时间")

    class Meta:
        abstract = True


class UserWechat(TimestampMixin):
    city = fields.CharField(null=True, max_length=255, description='城市')
    country = fields.CharField(null=True, max_length=255, description='国家')
    headimgurl = fields.CharField(
        null=True, max_length=255, description='微信头像')
    nickname = fields.CharField(null=True, max_length=255, description='微信昵称')
    openid = fields.CharField(
        unique=True, max_length=255, description='openid')
    unionid = fields.CharField(
        unique=True, null=True, max_length=255, description='unionid')
    province = fields.CharField(null=True, max_length=255, description='省份')
    sex = fields.IntField(null=True, description='性别')
    user: fields.OneToOneRelation["UserWechat"] = fields.OneToOneField(
        "base.User", related_name="wechat", on_delete=fields.CASCADE)

    class Meta:
        table_description = "用户微信"
        table = "user_wechat"


class User(TimestampMixin):
    role: fields.ManyToManyRelation["Role"] = fields.ManyToManyField(
        "base.Role", related_name="user", on_delete=fields.CASCADE)
    username = fields.CharField(max_length=20, description="用户名")
    userType = fields.BooleanField(
        default=False, description="用户类型 True:超级管理员 False:普通用户")
    password = fields.CharField(null=True, max_length=255)
    userPhone = fields.CharField(null=True, description="手机号", max_length=11)
    userEmail = fields.CharField(null=True, description='邮箱', max_length=255)
    fullName = fields.CharField(null=True, description='姓名', max_length=255)
    userStatus = fields.IntField(default=1, description='0未激活 1正常 2禁用')
    headerImg = fields.CharField(null=True, max_length=255, description='头像')
    sex = fields.IntField(default=0, null=True, description='0未知 1男 2女')
    remarks = fields.CharField(null=True, max_length=30, description="备注")
    clientHost = fields.CharField(null=True, max_length=19, description="访问IP")
    wechat: fields.OneToOneRelation[UserWechat]

    class Meta:
        table_description = "用户表"
        table = "user"


class Role(TimestampMixin):
    user: fields.ManyToManyRelation[User]
    roleName = fields.CharField(max_length=15, description="角色名称")
    access: fields.ManyToManyRelation["Access"] = fields.ManyToManyField(
        "base.Access", related_name="role", on_delete=fields.CASCADE)
    roleStatus = fields.BooleanField(
        default=False, description="True:启用 False:禁用")
    roleDesc = fields.CharField(null=True, max_length=255, description='角色描述')

    class Meta:
        table_description = "角色表"
        table = "role"


class Access(TimestampMixin):
    role: fields.ManyToManyRelation[Role]
    accessName = fields.CharField(max_length=15, description="权限名称")
    parentId = fields.IntField(default=0, description='父id')
    scopes = fields.CharField(
        unique=True, max_length=255, description='权限范围标识')
    accessDesc = fields.CharField(
        null=True, max_length=255, description='权限描述')
    menuIcon = fields.CharField(null=True, max_length=255, description='菜单图标')
    isCheck = fields.BooleanField(
        default=False, description='是否验证权限 True为验证 False不验证')
    isMenu = fields.BooleanField(
        default=False, description='是否为菜单 True菜单 False不是菜单')

    class Meta:
        table_description = "权限表"
        table = "access"


class AccessLog(TimestampMixin):
    user_id = fields.IntField(description="用户ID")
    targetUrl = fields.CharField(
        null=True, description="访问的url", max_length=255)
    userAgent = fields.CharField(null=True, description="访问UA", max_length=255)
    requestParams = fields.JSONField(null=True, description="请求参数get|post")
    ip = fields.CharField(null=True, max_length=32, description="访问IP")
    note = fields.CharField(null=True, max_length=255, description="备注")

    class Meta:
        table_description = "用户操作记录表"
        table = "access_log"


class SystemParams(TimestampMixin):
    paramsName = fields.CharField(
        unique=True, max_length=255, description="参数名")
    params = fields.JSONField(description="参数")

    class Meta:
        table_description = "系统参数表"
        table = "system_params"


class TouristSpot(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100)
    description = fields.TextField()
    latitude = fields.FloatField()
    longitude = fields.FloatField()
    region = fields.CharField(max_length=50)

    class Meta:
        table = "tourist_spots"


# app/models/feedback.py


class Feedback(Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField(
        "base.User", related_name="feedbacks", on_delete=fields.CASCADE)
    content = fields.TextField(description="反馈内容")
    contact = fields.CharField(max_length=255, null=True, description="联系方式")
    createTime = fields.DatetimeField(
        auto_now_add=True, description="创建时间")

    class Meta:
        table = "feedback"
        table_description = "用户反馈表"
