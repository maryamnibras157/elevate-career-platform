from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
from datetime import datetime
from uuid import UUID
from app.models.notification import NotificationType, NotificationPriority, NotificationStatus, NotificationAudience

class NotificationCreate(BaseModel):
    title: str = Field(..., max_length=255)
    message: str
    type: NotificationType = NotificationType.INFORMATION
    priority: NotificationPriority = NotificationPriority.NORMAL
    target_audience: NotificationAudience = NotificationAudience.ALL_USERS
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class NotificationUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    message: Optional[str] = None
    type: Optional[NotificationType] = None
    priority: Optional[NotificationPriority] = None
    target_audience: Optional[NotificationAudience] = None
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class NotificationOut(BaseModel):
    id: UUID
    title: str
    message: str
    type: NotificationType
    priority: NotificationPriority
    status: NotificationStatus
    target_audience: NotificationAudience
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    scheduled_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    
    # Computed stats
    read_count: int = 0
    total_recipients: int = 0
    read_percentage: float = 0.0

    class Config:
        from_attributes = True
        populate_by_name = True

class NotificationStatisticsOut(BaseModel):
    total_notifications: int
    active_notifications: int
    scheduled_notifications: int
    draft_notifications: int
    expired_notifications: int
    
    notifications_over_time: List[Dict[str, Any]]
    types_distribution: List[Dict[str, Any]]
    priority_distribution: List[Dict[str, Any]]
    audience_distribution: List[Dict[str, Any]]

class NotificationFilterParams(BaseModel):
    page: int = 1
    page_size: int = 20
    search: Optional[str] = None
    status: Optional[str] = None
    type: Optional[str] = None
    priority: Optional[str] = None
    target_audience: Optional[str] = None
    sort_by: Optional[str] = "created_at"
    sort_desc: bool = True
