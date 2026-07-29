from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.career import Career
from app.admin.repositories.career import AdminCareerRepository
from app.admin.schemas.careers.careers import AdminCareerCreate, AdminCareerUpdate, AdminCareerFilterParams, AdminCareerOut
from app.admin.exceptions.admin_exceptions import AdminValidationException
from app.admin.utils.pagination import PaginatedResponse
from app.admin.core.audit import log_admin_event

class AdminCareerService:
    def __init__(self, session: AsyncSession):
        self.repo = AdminCareerRepository(session)

    async def get_careers(self, page: int, size: int, filters: AdminCareerFilterParams) -> PaginatedResponse[AdminCareerOut]:
        paginated = await self.repo.get_all_paginated(page, size, filters)
        items = [AdminCareerOut.model_validate(c) for c in paginated.items]
        return PaginatedResponse(
            items=items,
            total=paginated.total,
            page=paginated.page,
            size=paginated.size,
            pages=paginated.pages
        )

    async def get_career_by_id(self, career_id: UUID) -> AdminCareerOut:
        career = await self.repo.get_by_id(career_id)
        if not career:
            raise AdminValidationException("Career not found", status_code=404)
        return AdminCareerOut.model_validate(career)

    async def create_career(self, data: AdminCareerCreate, admin_id: str) -> AdminCareerOut:
        career = Career(**data.model_dump())
        career = await self.repo.create(career)
        await log_admin_event("career_creation", admin_id, "SUCCESS", {"career_id": str(career.id)})
        return AdminCareerOut.model_validate(career)

    async def update_career(self, career_id: UUID, data: AdminCareerUpdate, admin_id: str) -> AdminCareerOut:
        career = await self.repo.get_by_id(career_id)
        if not career:
            raise AdminValidationException("Career not found", status_code=404)
            
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(career, key, value)
            
        career = await self.repo.update(career)
        await log_admin_event("career_update", admin_id, "SUCCESS", {"career_id": str(career_id)})
        return AdminCareerOut.model_validate(career)

    async def delete_career(self, career_id: UUID, admin_id: str) -> None:
        career = await self.repo.get_by_id(career_id)
        if not career:
            raise AdminValidationException("Career not found", status_code=404)
            
        await self.repo.delete(career)
        await log_admin_event("career_deletion", admin_id, "SUCCESS", {"career_id": str(career_id)})
