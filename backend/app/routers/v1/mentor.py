from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database import get_async_session
from app.models.user import User
from app.middleware.auth import get_current_user
from app.schemas.mentor import ChatConversationCreate, ChatConversationUpdate, ChatConversationResponse, ChatConversationDetailResponse, ChatMessageCreate, ChatMessageResponse
from app.schemas.common import APIResponse
from app.services.mentor_service import MentorService

router = APIRouter(prefix="/mentor", tags=["Career Mentor"])

@router.post("/conversations", response_model=APIResponse[ChatConversationResponse], status_code=status.HTTP_201_CREATED)
async def create_conversation(
    data: ChatConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    service = MentorService(db)
    conversation = await service.create_conversation(current_user.id, data)
    return APIResponse(success=True, message="Conversation created", data=conversation)

@router.get("/conversations", response_model=APIResponse[List[ChatConversationResponse]])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    service = MentorService(db)
    conversations = await service.get_conversations(current_user.id)
    return APIResponse(success=True, message="Conversations retrieved", data=conversations)

@router.get("/conversations/{conversation_id}", response_model=APIResponse[ChatConversationDetailResponse])
async def get_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    service = MentorService(db)
    conversation = await service.get_conversation(conversation_id, current_user.id)
    return APIResponse(success=True, message="Conversation retrieved", data=conversation)

@router.delete("/conversations/{conversation_id}", response_model=APIResponse[None])
async def delete_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    service = MentorService(db)
    await service.delete_conversation(conversation_id, current_user.id)
    return APIResponse(success=True, message="Conversation deleted", data=None)

@router.patch("/conversations/{conversation_id}", response_model=APIResponse[ChatConversationResponse])
async def update_conversation(
    conversation_id: UUID,
    data: ChatConversationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    service = MentorService(db)
    conversation = await service.update_conversation(conversation_id, current_user.id, data)
    return APIResponse(success=True, message="Conversation updated", data=conversation)

@router.post("/conversations/{conversation_id}/messages", response_model=APIResponse[ChatMessageResponse])
async def send_message(
    conversation_id: UUID,
    data: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    service = MentorService(db)
    message = await service.send_message(conversation_id, current_user.id, data)
    return APIResponse(success=True, message="Message sent", data=message)
