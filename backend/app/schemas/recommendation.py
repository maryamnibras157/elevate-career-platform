from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class CareerRecommendationBase(BaseModel):
    career_id: UUID
    match_percentage: float
    confidence_score: float
    why_matches: Optional[str] = None
    missing_skills: Optional[List[str]] = None
    learning_roadmap_summary: Optional[str] = None

class CareerRecommendationCreate(CareerRecommendationBase):
    pass

from app.schemas.career import CareerResponse

class CareerRecommendationResponse(CareerRecommendationBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    career: Optional[CareerResponse] = None
    class Config:
        from_attributes = True

class SkillGapBase(BaseModel):
    career_id: UUID
    gap_percentage: float
    missing_technologies: Optional[List[str]] = None
    priority_skills: Optional[List[str]] = None
    learning_difficulty: Optional[str] = None
    estimated_learning_time: Optional[str] = None

class SkillGapCreate(SkillGapBase):
    pass

class SkillGapResponse(SkillGapBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    career: Optional[CareerResponse] = None
    class Config:
        from_attributes = True

class RecommendationHistoryBase(BaseModel):
    recommendations_data: Optional[Dict[str, Any]] = None

class RecommendationHistoryCreate(RecommendationHistoryBase):
    pass

class RecommendationHistoryResponse(RecommendationHistoryBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    class Config:
        from_attributes = True
