from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        COMMENT ON COLUMN "user"."userType" IS '用户类型 True:超级管理员 False:普通用户';"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        COMMENT ON COLUMN "user"."userType" IS '用户类型 True:超级管理员 False:普通管理员';"""
