import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.user import User
from app.models.preferences import UserPreferences


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        result = await self.session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(
            select(User).where(User.email == email.lower())
        )
        return result.scalar_one_or_none()

    async def get_by_oauth_id(self, provider: str, oauth_id: str) -> Optional[User]:
        result = await self.session.execute(
            select(User).where(
                User.oauth_provider == provider,
                User.oauth_id == oauth_id
            )
        )
        return result.scalar_one_or_none()

    async def create(self, user: User) -> User:
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def update(self, user_id: uuid.UUID, data: dict) -> Optional[User]:
        await self.session.execute(
            update(User).where(User.id == user_id).values(**data)
        )
        return await self.get_by_id(user_id)

    async def create_preferences(self, user_id: uuid.UUID) -> UserPreferences:
        prefs = UserPreferences(user_id=user_id)
        self.session.add(prefs)
        await self.session.flush()
        return prefs

    async def get_preferences(self, user_id: uuid.UUID) -> Optional[UserPreferences]:
        result = await self.session.execute(
            select(UserPreferences).where(UserPreferences.user_id == user_id)
        )
        return result.scalar_one_or_none()
