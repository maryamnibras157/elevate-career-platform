from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Optional, Any
from uuid import UUID
from datetime import datetime

class ResumeStatisticsOut(BaseModel):
    total_uploads: int
    successful_parses: int
    failed_parses: int
    average_resume_score: float
    average_ats_score: float
    resume_score_distribution: List[Dict[str, Any]]
    ats_score_distribution: List[Dict[str, Any]]
    skill_gap_frequency: List[Dict[str, Any]]
    recommendation_categories: List[Dict[str, Any]]

class AdminResumeStatsFilterParams(BaseModel):
    search: Optional[str] = None
    min_resume_score: Optional[float] = None
    min_ats_score: Optional[float] = None

class AdminResumeAnalysisOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    user_email: Optional[str] = None
    user_name: Optional[str] = None
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
    created_at: datetime
    recommendations: Optional[List[Dict[str, Any]]] = None
    roadmaps: Optional[List[Dict[str, Any]]] = None
