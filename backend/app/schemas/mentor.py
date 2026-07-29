from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# -----------------------------
# Requests
# -----------------------------

class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


class ChatConversationCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    context_type: str = "general"
    target_career_id: Optional[UUID] = None


class ChatConversationUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)


# -----------------------------
# Responses
# -----------------------------

class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    conversation_id: UUID
    role: str
    content: str
    provider: Optional[str] = None
    created_at: datetime


class ChatConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    title: str
    context_type: str
    target_career_id: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class ChatConversationDetailResponse(ChatConversationResponse):
    messages: List[ChatMessageResponse] = Field(default_factory=list)