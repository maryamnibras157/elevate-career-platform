from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
from datetime import datetime
from uuid import UUID
from app.models.report import ReportCategory, ReportFormat, ReportScheduleFrequency

class ReportScheduleBase(BaseModel):
    frequency: ReportScheduleFrequency
    is_active: bool = True

class ReportScheduleOut(ReportScheduleBase):
    id: UUID
    report_config_id: UUID
    next_run_at: datetime
    
    class Config:
        from_attributes = True

class ReportConfigCreate(BaseModel):
    name: str = Field(..., max_length=255)
    category: ReportCategory
    format: ReportFormat = ReportFormat.CSV
    filters: Dict[str, Any] = Field(default_factory=dict)
    schedule: Optional[ReportScheduleBase] = None

class ReportConfigOut(BaseModel):
    id: UUID
    name: str
    category: ReportCategory
    format: ReportFormat
    filters: Dict[str, Any]
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    schedule: Optional[ReportScheduleOut] = None

    class Config:
        from_attributes = True

class ReportHistoryOut(BaseModel):
    id: UUID
    report_config_id: UUID
    generated_by: Optional[UUID] = None
    generated_at: datetime
    status: str
    record_count: int
    filters_snapshot: Dict[str, Any]
    
    config_name: Optional[str] = None
    config_category: Optional[ReportCategory] = None
    generator_name: Optional[str] = None

    class Config:
        from_attributes = True

class ReportFilterParams(BaseModel):
    page: int = 1
    page_size: int = 20
    search: Optional[str] = None
    category: Optional[str] = None
    format: Optional[str] = None
    status: Optional[str] = None
    sort_by: Optional[str] = "created_at"
    sort_desc: bool = True

class ExecutiveMetricsOut(BaseModel):
    total_users: int
    total_careers: int
    total_resumes: int
    total_interviews: int
    
    user_growth: List[Dict[str, Any]]
    career_distribution: List[Dict[str, Any]]
    resume_scores: List[Dict[str, Any]]
    platform_activity: List[Dict[str, Any]]
