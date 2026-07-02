from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "feedback" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "contact" VARCHAR(255),
    "createTime" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN "feedback"."content" IS '反馈内容';
COMMENT ON COLUMN "feedback"."contact" IS '联系方式';
COMMENT ON COLUMN "feedback"."createTime" IS '创建时间';
COMMENT ON TABLE "feedback" IS '用户反馈表';"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS "feedback";"""
