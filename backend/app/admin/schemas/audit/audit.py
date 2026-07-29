from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
from datetime import datetime
from uuid import UUID
from app.admin.utils.pagination import PaginatedResponse

class AuditLogOut(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    action: str
    resource: Optional[str] = None
    resource_id: Optional[str] = None
    status: Optional[str] = None
    metadata_: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

class AuditStatisticsOut(BaseModel):
    total_events: int
    events_today: int
    successful_operations: int
    failed_operations: int
    activity_over_time: List[Dict[str, Any]] # e.g. {"date": "2023-01-01", "count": 5}
    actions_by_category: List[Dict[str, Any]] # e.g. {"category": "user_management", "count": 10}
    success_vs_failure: List[Dict[str, Any]] # e.g. {"status": "SUCCESS", "count": 20}
    top_administrators: List[Dict[str, Any]] # e.g. {"admin": "Alice", "count": 15}

class AuditFilterParams(BaseModel):
    page: int = 1
    page_size: int = 20
    search: Optional[str] = None
    action: Optional[str] = None
    status: Optional[str] = None
    user_id: Optional[UUID] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    sort_by: Optional[str] = "created_at"
    sort_desc: bool = True
