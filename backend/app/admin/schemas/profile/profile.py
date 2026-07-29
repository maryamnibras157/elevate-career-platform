from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID

class AdminAccountUpdate(BaseModel):
    full_name: str = Field(..., max_length=255)
    # email is typically read-only if verified, but we'll include it here if they want to try changing it
    email: Optional[EmailStr] = None

class AdminPasswordChange(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8)

class AdminPreferencesUpdate(BaseModel):
    theme: str = "system"
    language: str = "en"
    notifications_enabled: bool = True
    email_notifications: bool = True

class SessionOut(BaseModel):
    id: UUID
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    expires_at: datetime
    is_current: bool = False

    class Config:
        from_attributes = True

class ActivityFilterParams(BaseModel):
    page: int = 1
    page_size: int = 20
    action: Optional[str] = None
    sort_by: Optional[str] = "created_at"
    sort_desc: bool = True

class SessionFilterParams(BaseModel):
    page: int = 1
    page_size: int = 20
