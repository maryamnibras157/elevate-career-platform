from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from app.models.career import Career, Skill, SavedCareer
from app.schemas.career import CareerCreate


class CareerService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all_careers(self, search_query: str = None) -> List[Career]:
        stmt = (
            select(Career)
            .options(selectinload(Career.skills))
        )

        if search_query:
            stmt = stmt.filter(Career.title.ilike(f"%{search_query}%"))

        result = await self.session.execute(stmt)

        return result.scalars().unique().all()

    async def get_career(self, career_id: UUID) -> Career:
        result = await self.session.execute(
            select(Career)
            .options(selectinload(Career.skills))
            .filter(Career.id == career_id)
        )

        return result.scalars().first()

    async def create_career(self, data: CareerCreate) -> Career:
        career = Career(**data.model_dump())

        self.session.add(career)

        await self.session.commit()

        await self.session.refresh(career)

        result = await self.session.execute(
            select(Career)
            .options(selectinload(Career.skills))
            .filter(Career.id == career.id)
        )

        return result.scalars().first()

    async def toggle_saved_career(self, user_id: UUID, career_id: UUID) -> bool:
        result = await self.session.execute(
            select(SavedCareer).filter(
                SavedCareer.user_id == user_id,
                SavedCareer.career_id == career_id,
            )
        )

        saved = result.scalars().first()

        if saved:
            await self.session.delete(saved)
            await self.session.commit()
            return False

        new_saved = SavedCareer(
            user_id=user_id,
            career_id=career_id,
        )

        self.session.add(new_saved)

        await self.session.commit()

        return True

    async def get_saved_careers(self, user_id: UUID) -> List[SavedCareer]:
        result = await self.session.execute(
            select(SavedCareer)
            .options(
                selectinload(SavedCareer.career),
                selectinload(SavedCareer.career).selectinload(Career.skills),
            )
            .filter(SavedCareer.user_id == user_id)
        )

        return result.scalars().unique().all()