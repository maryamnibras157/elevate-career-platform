from uuid import UUID
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from app.models.career import Career
from app.admin.utils.pagination import PaginatedResponse, paginate
from app.admin.schemas.careers.careers import AdminCareerFilterParams

class AdminCareerRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, career_id: UUID) -> Optional[Career]:
        stmt = select(Career).where(Career.id == career_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all_paginated(
        self, page: int, size: int, filters: AdminCareerFilterParams
    ) -> PaginatedResponse[Career]:
        stmt = select(Career)
        
        if filters.search:
            stmt = stmt.where(or_(
                Career.title.ilike(f"%{filters.search}%"),
                Career.description.ilike(f"%{filters.search}%")
            ))
        if filters.demand_level:
            stmt = stmt.where(Career.demand_level == filters.demand_level)
            
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await self.session.execute(count_stmt)).scalar() or 0
        
        stmt = stmt.limit(size).offset((page - 1) * size).order_by(Career.created_at.desc())
        items = list((await self.session.execute(stmt)).scalars().all())
        
        return paginate(items=items, total=total, page=page, size=size)

    async def create(self, career: Career) -> Career:
        self.session.add(career)
        await self.session.commit()
        await self.session.refresh(career)
        return career

    async def update(self, career: Career) -> Career:
        await self.session.commit()
        await self.session.refresh(career)
        return career

    async def delete(self, career: Career) -> None:
        await self.session.delete(career)
        await self.session.commit()
