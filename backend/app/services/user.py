import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user import UserRepository
from app.models.user import User
from app.schemas.user import UserUpdate, UserPreferencesUpdate
from fastapi import HTTPException, status


class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)

    async def get_user(self, user_id: uuid.UUID) -> User:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    async def update_user(self, user_id: uuid.UUID, data: UserUpdate) -> User:
        update_data = data.model_dump(exclude_none=True)
        if not update_data:
            return await self.get_user(user_id)
        user = await self.user_repo.update(user_id, update_data)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    async def update_preferences(self, user_id: uuid.UUID, data: UserPreferencesUpdate):
        prefs = await self.user_repo.get_preferences(user_id)
        if not prefs:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Preferences not found")
        update_data = data.model_dump(exclude_none=True)
        for key, value in update_data.items():
            setattr(prefs, key, value)
        await self.session.flush()
        return prefs
