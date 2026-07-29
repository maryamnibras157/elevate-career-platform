from uuid import UUID
from typing import Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import sqlalchemy as sa
from sqlalchemy.orm import selectinload
from app.models.admin import AdminProfile
from app.admin.repositories.base import BaseAdminRepository
from app.admin.utils.pagination import PaginatedResponse, paginate

class AdminProfileRepository(BaseAdminRepository[AdminProfile]):
    def __init__(self, session: AsyncSession):
        super().__init__(model=AdminProfile)
        self.session = session

    async def get_by_user_id(self, user_id: UUID) -> Optional[AdminProfile]:
        stmt = select(AdminProfile).options(
            selectinload(AdminProfile.user),
            selectinload(AdminProfile.permissions)
        ).where(AdminProfile.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all_paginated(
        self, page: int = 1, size: int = 20, filters: Any = None, sort: Any = None
    ) -> PaginatedResponse[AdminProfile]:
        # Basic pagination implementation for AdminProfiles
        stmt = select(AdminProfile).options(
            selectinload(AdminProfile.user),
            selectinload(AdminProfile.permissions)
        )
        
        # Apply filters (placeholder)
        if filters:
            pass
            
        # Count total
        count_stmt = select(sa.func.count()).select_from(stmt.subquery()) # type: ignore
        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar_one() or 0

        # Apply pagination
        stmt = stmt.limit(size).offset((page - 1) * size)
        result = await self.session.execute(stmt)
        items = list(result.scalars().all())

        return paginate(items=items, total=total, page=page, size=size)
