from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List

class SkillBase(BaseModel):
    name: str
    category: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: UUID
    created_at: datetime
    class Config:
        from_attributes = True

class CareerBase(BaseModel):
    title: str
    description: Optional[str] = None
    salary_estimate: Optional[str] = None
    demand_level: Optional[str] = None
    growth_outlook: Optional[str] = None

class CareerCreate(CareerBase):
    pass

class CareerResponse(CareerBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    skills: List[SkillResponse] = []
    class Config:
        from_attributes = True

class SavedCareerBase(BaseModel):
    career_id: UUID
    notes: Optional[str] = None

class SavedCareerCreate(SavedCareerBase):
    pass

class SavedCareerResponse(SavedCareerBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    career: Optional[CareerResponse] = None
    class Config:
        from_attributes = True
