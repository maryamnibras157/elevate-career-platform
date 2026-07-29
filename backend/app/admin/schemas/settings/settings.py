from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from datetime import datetime

class SystemSettingBase(BaseModel):
    key: str
    category: str
    description: Optional[str] = None
    is_secret: bool = False

class SystemSettingOut(SystemSettingBase):
    value: Any
    updated_by: Optional[str] = None
    updated_at: datetime
    
    class Config:
        from_attributes = True

class SystemSettingUpdate(BaseModel):
    key: str
    value: Any

class SystemSettingUpdateBatch(BaseModel):
    settings: List[SystemSettingUpdate]

class SystemInfoOut(BaseModel):
    environment: str
    python_version: str
    fastapi_version: str
    database_version: str
    database_status: str
    redis_version: str
    redis_status: str
    nextjs_version: str
    app_version: str
