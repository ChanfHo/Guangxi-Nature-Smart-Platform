from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "access_log" RENAME COLUMN "userId" TO "user_id";
        ALTER TABLE "user" RENAME COLUMN "id" TO "user_id";
        ALTER TABLE "user" ALTER COLUMN "userStatus" SET DEFAULT 1;"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "user" RENAME COLUMN "user_id" TO "id";
        ALTER TABLE "user" ALTER COLUMN "userStatus" SET DEFAULT 0;
        ALTER TABLE "access_log" RENAME COLUMN "user_id" TO "userId";"""
