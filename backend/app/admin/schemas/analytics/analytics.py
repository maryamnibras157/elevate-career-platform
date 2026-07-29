from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class TimeSeriesDataPoint(BaseModel):
    label: str  # E.g., '2023-01', '2023-01-01'
    count: int
    cumulative: Optional[int] = None

class UserGrowthAnalyticsOut(BaseModel):
    period: str
    data: List[TimeSeriesDataPoint]
    total_new_users: int

class CareerGrowthAnalyticsOut(BaseModel):
    period: str
    data: List[TimeSeriesDataPoint]
    total_new_careers: int

class ResumeTrendAnalyticsOut(BaseModel):
    period: str
    uploads_data: List[TimeSeriesDataPoint]
    total_uploads: int
    average_resume_score: float
    average_ats_score: float

class InterviewAnalyticsOut(BaseModel):
    total_interviews: int
    completed_interviews: int
    in_progress_interviews: int
    average_overall_score: float
    technical_count: int
    behavioral_count: int
    mixed_count: int

class AIMentorUsageAnalyticsOut(BaseModel):
    total_sessions: int
    total_messages: int
    average_messages_per_session: float
    active_users: int

class AnalyticsFilterParams(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    period: str = "day" # day, week, month
    limit: int = 100
