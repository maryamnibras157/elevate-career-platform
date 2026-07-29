from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List

class RoadmapStepBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    estimated_duration: Optional[str] = None
    is_completed: bool = False
    order: int = 0

class RoadmapStepCreate(RoadmapStepBase):
    pass

class RoadmapStepUpdate(BaseModel):
    is_completed: Optional[bool] = None

class RoadmapStepResponse(RoadmapStepBase):
    id: UUID
    roadmap_id: UUID
    created_at: datetime
    class Config:
        from_attributes = True

class RoadmapBase(BaseModel):
    career_id: UUID
    title: str
    current_level: Optional[str] = None

class RoadmapCreate(RoadmapBase):
    pass

class RoadmapResponse(RoadmapBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    steps: List[RoadmapStepResponse] = []
    class Config:
        from_attributes = True
