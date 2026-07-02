from pydantic import BaseModel
from typing import List
from typing import Optional

class QuestionRequest(BaseModel):
    question: str

class TouristSpotOut(BaseModel):
    name: str
    description: str
    latitude: float
    longitude: float

class AIResponse(BaseModel):
    answer: str
    #route: List[TouristSpotOut] = []
    route:Optional[str] = None
