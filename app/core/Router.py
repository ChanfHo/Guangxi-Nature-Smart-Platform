from app.api.api import api_router
from fastapi import APIRouter


router = APIRouter()
router.include_router(api_router)
