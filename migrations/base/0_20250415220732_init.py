from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "access" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "createTime" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessName" VARCHAR(15) NOT NULL,
    "parentId" INT NOT NULL DEFAULT 0,
    "scopes" VARCHAR(255) NOT NULL UNIQUE,
    "accessDesc" VARCHAR(255),
    "menuIcon" VARCHAR(255),
    "isCheck" BOOL NOT NULL DEFAULT False,
    "isMenu" BOOL NOT NULL DEFAULT False
);
COMMENT ON COLUMN "access"."createTime" IS '创建时间';
COMMENT ON COLUMN "access"."updateTime" IS '更新时间';
COMMENT ON COLUMN "access"."accessName" IS '权限名称';
COMMENT ON COLUMN "access"."parentId" IS '父id';
COMMENT ON COLUMN "access"."scopes" IS '权限范围标识';
COMMENT ON COLUMN "access"."accessDesc" IS '权限描述';
COMMENT ON COLUMN "access"."menuIcon" IS '菜单图标';
COMMENT ON COLUMN "access"."isCheck" IS '是否验证权限 True为验证 False不验证';
COMMENT ON COLUMN "access"."isMenu" IS '是否为菜单 True菜单 False不是菜单';
COMMENT ON TABLE "access" IS '权限表';
CREATE TABLE IF NOT EXISTS "access_log" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "createTime" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INT NOT NULL,
    "targetUrl" VARCHAR(255),
    "userAgent" VARCHAR(255),
    "requestParams" JSONB,
    "ip" VARCHAR(32),
    "note" VARCHAR(255)
);
COMMENT ON COLUMN "access_log"."createTime" IS '创建时间';
COMMENT ON COLUMN "access_log"."updateTime" IS '更新时间';
COMMENT ON COLUMN "access_log"."userId" IS '用户ID';
COMMENT ON COLUMN "access_log"."targetUrl" IS '访问的url';
COMMENT ON COLUMN "access_log"."userAgent" IS '访问UA';
COMMENT ON COLUMN "access_log"."requestParams" IS '请求参数get|post';
COMMENT ON COLUMN "access_log"."ip" IS '访问IP';
COMMENT ON COLUMN "access_log"."note" IS '备注';
COMMENT ON TABLE "access_log" IS '用户操作记录表';
CREATE TABLE IF NOT EXISTS "role" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "createTime" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roleName" VARCHAR(15) NOT NULL,
    "roleStatus" BOOL NOT NULL DEFAULT False,
    "roleDesc" VARCHAR(255)
);
COMMENT ON COLUMN "role"."createTime" IS '创建时间';
COMMENT ON COLUMN "role"."updateTime" IS '更新时间';
COMMENT ON COLUMN "role"."roleName" IS '角色名称';
COMMENT ON COLUMN "role"."roleStatus" IS 'True:启用 False:禁用';
COMMENT ON COLUMN "role"."roleDesc" IS '角色描述';
COMMENT ON TABLE "role" IS '角色表';
CREATE TABLE IF NOT EXISTS "system_params" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "createTime" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paramsName" VARCHAR(255) NOT NULL UNIQUE,
    "params" JSONB NOT NULL
);
COMMENT ON COLUMN "system_params"."createTime" IS '创建时间';
COMMENT ON COLUMN "system_params"."updateTime" IS '更新时间';
COMMENT ON COLUMN "system_params"."paramsName" IS '参数名';
COMMENT ON COLUMN "system_params"."params" IS '参数';
COMMENT ON TABLE "system_params" IS '系统参数表';
CREATE TABLE IF NOT EXISTS "tourist_spots" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "region" VARCHAR(50) NOT NULL
);
CREATE TABLE IF NOT EXISTS "user" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "createTime" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" VARCHAR(20),
    "userType" BOOL NOT NULL DEFAULT False,
    "password" VARCHAR(255),
    "nickname" VARCHAR(255) NOT NULL DEFAULT 'binkuolo',
    "userPhone" VARCHAR(11),
    "userEmail" VARCHAR(255),
    "fullName" VARCHAR(255),
    "userStatus" INT NOT NULL DEFAULT 0,
    "headerImg" VARCHAR(255),
    "sex" INT DEFAULT 0,
    "remarks" VARCHAR(30),
    "clientHost" VARCHAR(19)
);
COMMENT ON COLUMN "user"."createTime" IS '创建时间';
COMMENT ON COLUMN "user"."updateTime" IS '更新时间';
COMMENT ON COLUMN "user"."username" IS '用户名';
COMMENT ON COLUMN "user"."userType" IS '用户类型 True:超级管理员 False:普通管理员';
COMMENT ON COLUMN "user"."nickname" IS '昵称';
COMMENT ON COLUMN "user"."userPhone" IS '手机号';
COMMENT ON COLUMN "user"."userEmail" IS '邮箱';
COMMENT ON COLUMN "user"."fullName" IS '姓名';
COMMENT ON COLUMN "user"."userStatus" IS '0未激活 1正常 2禁用';
COMMENT ON COLUMN "user"."headerImg" IS '头像';
COMMENT ON COLUMN "user"."sex" IS '0未知 1男 2女';
COMMENT ON COLUMN "user"."remarks" IS '备注';
COMMENT ON COLUMN "user"."clientHost" IS '访问IP';
COMMENT ON TABLE "user" IS '用户表';
CREATE TABLE IF NOT EXISTS "user_wechat" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "createTime" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "city" VARCHAR(255),
    "country" VARCHAR(255),
    "headimgurl" VARCHAR(255),
    "nickname" VARCHAR(255),
    "openid" VARCHAR(255) NOT NULL UNIQUE,
    "unionid" VARCHAR(255) UNIQUE,
    "province" VARCHAR(255),
    "sex" INT,
    "user_id" INT NOT NULL UNIQUE REFERENCES "user" ("id") ON DELETE CASCADE
);
COMMENT ON COLUMN "user_wechat"."createTime" IS '创建时间';
COMMENT ON COLUMN "user_wechat"."updateTime" IS '更新时间';
COMMENT ON COLUMN "user_wechat"."city" IS '城市';
COMMENT ON COLUMN "user_wechat"."country" IS '国家';
COMMENT ON COLUMN "user_wechat"."headimgurl" IS '微信头像';
COMMENT ON COLUMN "user_wechat"."nickname" IS '微信昵称';
COMMENT ON COLUMN "user_wechat"."openid" IS 'openid';
COMMENT ON COLUMN "user_wechat"."unionid" IS 'unionid';
COMMENT ON COLUMN "user_wechat"."province" IS '省份';
COMMENT ON COLUMN "user_wechat"."sex" IS '性别';
COMMENT ON TABLE "user_wechat" IS '用户微信';
CREATE TABLE IF NOT EXISTS "aerich" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "version" VARCHAR(255) NOT NULL,
    "app" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS "role_access" (
    "role_id" INT NOT NULL REFERENCES "role" ("id") ON DELETE CASCADE,
    "access_id" INT NOT NULL REFERENCES "access" ("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_role_access_role_id_279853" ON "role_access" ("role_id", "access_id");
CREATE TABLE IF NOT EXISTS "user_role" (
    "user_id" INT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
    "role_id" INT NOT NULL REFERENCES "role" ("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_user_role_user_id_d0bad3" ON "user_role" ("user_id", "role_id");"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
