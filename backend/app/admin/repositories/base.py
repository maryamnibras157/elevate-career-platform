from typing import Generic, TypeVar, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.admin.utils.pagination import PaginatedResponse, paginate

ModelType = TypeVar("ModelType")

class BaseAdminRepository(Generic[ModelType]):
    def __init__(self, model: type[ModelType]):
        self.model = model

    async def get_all_paginated(
        self, session: AsyncSession, page: int = 1, size: int = 20, filters: Any = None, sort: Any = None
    ) -> PaginatedResponse[ModelType]:
        """
        Base paginated fetch method to be implemented in subclasses.
        Placeholder implementation.
        """
        # Actual implementation will use select() and scalar() calls.
        return paginate(items=[], total=0, page=page, size=size)
