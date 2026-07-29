from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from app.admin.constants.enums import AdminRole, Permission

class AdminPermissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime

class AdminProfileBase(BaseModel):
    role: AdminRole
    is_active: bool = True

class AdminProfileCreate(AdminProfileBase):
    user_id: UUID
    permission_ids: Optional[List[int]] = None

class AdminProfileUpdate(BaseModel):
    role: Optional[AdminRole] = None
    is_active: Optional[bool] = None
    permission_ids: Optional[List[int]] = None

class AdminProfileOut(AdminProfileBase):
    model_config = ConfigDict(from_attributes=True)
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    permissions: List[AdminPermissionOut] = []

class AdminPermissionAssignment(BaseModel):
    admin_id: UUID
    permission_id: int

class AdminRoleAssignment(BaseModel):
    admin_id: UUID
    role: AdminRole
