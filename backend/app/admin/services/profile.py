import uuid
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.admin.repositories.profile import AdminProfileRepository
from app.admin.schemas.profile.profile import (
    AdminAccountUpdate, AdminPasswordChange, AdminPreferencesUpdate,
    SessionFilterParams, ActivityFilterParams
)
from app.models.user import User
from app.models.preferences import UserPreferences
from app.models.auth import Session
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
from app.admin.core.audit import log_admin_event

class AdminProfileService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = AdminProfileRepository(session)
        
    async def get_user_account(self, user_id: uuid.UUID) -> User | None:
        return await self.session.get(User, user_id)
        
    async def update_account(self, user_id: uuid.UUID, payload: AdminAccountUpdate) -> User:
        user = await self.get_user_account(user_id)
        if not user:
            raise ValueError("User not found")
            
        user.full_name = payload.full_name
        
        # We don't typically allow email changes without re-verification, but if requested here:
        if payload.email and payload.email != user.email:
            user.email = payload.email
            user.is_verified = False # force re-verification in a real flow
            
        await self.session.commit()
        await log_admin_event("profile_updated", str(user_id), "SUCCESS", {"full_name": payload.full_name})
        return user

    async def change_password(self, user_id: uuid.UUID, payload: AdminPasswordChange) -> bool:
        user = await self.get_user_account(user_id)
        if not user:
            raise ValueError("User not found")
            
        if not user.hashed_password:
            raise ValueError("Cannot change password for OAuth account without existing password")
            
        if not pwd_context.verify(payload.current_password, user.hashed_password):
            await log_admin_event("password_change_failed", str(user_id), "FAILED", {"reason": "invalid_current_password"})
            raise ValueError("Invalid current password")
            
        if pwd_context.verify(payload.new_password, user.hashed_password):
            raise ValueError("New password cannot be the same as current password")
            
        user.hashed_password = pwd_context.hash(payload.new_password)
        await self.session.commit()
        
        await log_admin_event("password_changed", str(user_id), "SUCCESS", {})
        return True

    async def get_preferences(self, user_id: uuid.UUID) -> UserPreferences:
        stmt = select(UserPreferences).where(UserPreferences.user_id == user_id)
        result = await self.session.execute(stmt)
        prefs = result.scalar_one_or_none()
        
        if not prefs:
            prefs = UserPreferences(user_id=user_id)
            self.session.add(prefs)
            await self.session.commit()
            await self.session.refresh(prefs)
            
        return prefs
        
    async def update_preferences(self, user_id: uuid.UUID, payload: AdminPreferencesUpdate) -> UserPreferences:
        prefs = await self.get_preferences(user_id)
        
        prefs.theme = payload.theme
        prefs.language = payload.language
        prefs.notifications_enabled = payload.notifications_enabled
        prefs.email_notifications = payload.email_notifications
        
        await self.session.commit()
        await log_admin_event("preferences_updated", str(user_id), "SUCCESS", {"theme": payload.theme, "lang": payload.language})
        
        return prefs

    async def get_sessions(self, user_id: uuid.UUID, params: SessionFilterParams, current_session_id: uuid.UUID | None = None) -> Dict[str, Any]:
        items, total = await self.repo.get_user_sessions(user_id, params)
        
        # Mark current session
        out_items = []
        for s in items:
            out_items.append({
                "id": s.id,
                "ip_address": s.ip_address,
                "user_agent": s.user_agent,
                "created_at": s.created_at,
                "expires_at": s.expires_at,
                "is_current": s.id == current_session_id
            })
            
        return {
            "items": out_items,
            "total": total,
            "page": params.page,
            "page_size": params.page_size,
            "pages": (total + params.page_size - 1) // params.page_size
        }

    async def delete_session(self, session_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        ok = await self.repo.delete_session(session_id, user_id)
        if ok:
            await log_admin_event("session_terminated", str(user_id), "SUCCESS", {"session_id": str(session_id)})
        return ok

    async def delete_all_other_sessions(self, current_session_id: uuid.UUID, user_id: uuid.UUID) -> int:
        count = await self.repo.delete_other_sessions(current_session_id, user_id)
        await log_admin_event("other_sessions_terminated", str(user_id), "SUCCESS", {"count": count})
        return count

    async def get_activity(self, user_id: uuid.UUID, params: ActivityFilterParams) -> Dict[str, Any]:
        items, total = await self.repo.get_user_activity(user_id, params)
        return {
            "items": items,
            "total": total,
            "page": params.page,
            "page_size": params.page_size,
            "pages": (total + params.page_size - 1) // params.page_size
        }
