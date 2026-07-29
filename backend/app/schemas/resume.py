from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ResumeAnalysisBase(BaseModel):
    skills: Optional[List[str]] = None
    education: Optional[List[Dict[str, Any]]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    
    resume_score: Optional[float] = None
    ats_score: Optional[float] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    missing_keywords: Optional[List[str]] = None
    suggested_improvements: Optional[List[str]] = None

class ResumeAnalysisCreate(ResumeAnalysisBase):
    pass

class ResumeAnalysisResponse(ResumeAnalysisBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    class Config:
        from_attributes = True
