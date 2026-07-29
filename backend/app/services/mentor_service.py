from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from uuid import UUID
from typing import List

from app.models.mentor import ChatConversation, ChatMessage
from app.schemas.mentor import ChatConversationCreate, ChatConversationUpdate, ChatMessageCreate
from app.services.ai.factory import get_ai_provider
from app.services.ai.prompts import MENTOR_SYSTEM_PROMPT
from app.services.ai.context_builder import build_user_context

class MentorService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_provider = get_ai_provider()

    async def create_conversation(self, user_id: UUID, data: ChatConversationCreate) -> ChatConversation:
        conversation = ChatConversation(
            user_id=user_id,
            title=data.title,
            context_type=data.context_type,
            target_career_id=data.target_career_id
        )
        self.db.add(conversation)
        await self.db.commit()
        await self.db.refresh(conversation)
        return conversation

    async def get_conversations(self, user_id: UUID) -> List[ChatConversation]:
        result = await self.db.execute(
            select(ChatConversation)
            .where(ChatConversation.user_id == user_id)
            .order_by(desc(ChatConversation.updated_at))
        )
        return result.scalars().all()

    async def get_conversation(self, conversation_id: UUID, user_id: UUID) -> ChatConversation:
        result = await self.db.execute(
            select(ChatConversation)
            .options(selectinload(ChatConversation.messages))
            .where(ChatConversation.id == conversation_id, ChatConversation.user_id == user_id)
        )
        conversation = result.scalars().first()
        if not conversation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        # Ensure messages are ordered by created_at
        conversation.messages = sorted(conversation.messages, key=lambda m: m.created_at)
        return conversation

    async def delete_conversation(self, conversation_id: UUID, user_id: UUID) -> None:
        conversation = await self.get_conversation(conversation_id, user_id)
        await self.db.delete(conversation)
        await self.db.commit()

    async def update_conversation(self, conversation_id: UUID, user_id: UUID, data: ChatConversationUpdate) -> ChatConversation:
        conversation = await self.get_conversation(conversation_id, user_id)
        if data.title:
            conversation.title = data.title
        await self.db.commit()
        await self.db.refresh(conversation)
        return conversation

    async def send_message(self, conversation_id: UUID, user_id: UUID, data: ChatMessageCreate) -> ChatMessage:
        conversation = await self.get_conversation(conversation_id, user_id)
        
        # Add user message
        user_message = ChatMessage(
            conversation_id=conversation.id,
            role="user",
            content=data.content
        )
        self.db.add(user_message)
        
        # Build context
        user_context = await build_user_context(self.db, str(user_id))
        system_prompt = MENTOR_SYSTEM_PROMPT.format(context=user_context)
        
        # Prepare message history for AI
        history = []
        for msg in conversation.messages:
            history.append({"role": msg.role, "content": msg.content})
        history.append({"role": "user", "content": data.content})
        
        # Generate response
        try:
            ai_response_text = await self.ai_provider.generate_mentor_response(
                messages=history[-10:], # Limit history to last 10 messages to prevent token bloat
                system_prompt=system_prompt
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to get AI response. Please try again later.")
            
        provider_name = "gemini" if hasattr(self.ai_provider, "model_name") else "local"
        
        # Add model message
        model_message = ChatMessage(
            conversation_id=conversation.id,
            role="model",
            content=ai_response_text,
            provider=provider_name
        )
        self.db.add(model_message)
        
        # Touch conversation to update updated_at
        conversation.updated_at = model_message.created_at
        
        await self.db.commit()
        await self.db.refresh(model_message)
        
        return model_message
