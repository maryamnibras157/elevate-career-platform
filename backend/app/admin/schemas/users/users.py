from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class AdminUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    email: str
    full_name: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None

class AdminUserFilterParams(BaseModel):
    search: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None
    is_verified: Optional[bool] = None
    sort_by: Optional[str] = None
    sort_order: Optional[str] = None

class AdminUserActivityOut(BaseModel):
    total_resumes: int
    total_interviews: int
    total_mentor_sessions: int
    total_saved_careers: int
