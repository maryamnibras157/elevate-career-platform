from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List

class AdminCareerCreate(BaseModel):
    title: str
    description: Optional[str] = None
    salary_estimate: Optional[str] = None
    demand_level: Optional[str] = None
    growth_outlook: Optional[str] = None

class AdminCareerUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    salary_estimate: Optional[str] = None
    demand_level: Optional[str] = None
    growth_outlook: Optional[str] = None

class AdminCareerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    description: Optional[str]
    salary_estimate: Optional[str]
    demand_level: Optional[str]
    growth_outlook: Optional[str]
    created_at: datetime
    updated_at: datetime

class AdminCareerFilterParams(BaseModel):
    search: Optional[str] = None
    demand_level: Optional[str] = None
