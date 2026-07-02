from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "feedback" ADD "user_id" INT NOT NULL;
        ALTER TABLE "feedback" ADD CONSTRAINT "fk_feedback_user_3669089f" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE;"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "feedback" DROP CONSTRAINT IF EXISTS "fk_feedback_user_3669089f";
        ALTER TABLE "feedback" DROP COLUMN "user_id";"""
