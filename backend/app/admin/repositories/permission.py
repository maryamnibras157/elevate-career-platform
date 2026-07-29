from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.admin import AdminPermission
from app.admin.repositories.base import BaseAdminRepository

class AdminPermissionRepository(BaseAdminRepository[AdminPermission]):
    def __init__(self, session: AsyncSession):
        super().__init__(model=AdminPermission)
        self.session = session

    async def get_all(self) -> List[AdminPermission]:
        stmt = select(AdminPermission)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_names(self, names: List[str]) -> List[AdminPermission]:
        if not names:
            return []
        stmt = select(AdminPermission).where(AdminPermission.name.in_(names))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
