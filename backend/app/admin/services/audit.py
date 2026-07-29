from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.admin.repositories.audit import AdminAuditRepository
from app.admin.schemas.audit.audit import AuditFilterParams
import uuid

class AdminAuditService:
    def __init__(self, session: AsyncSession):
        self.repo = AdminAuditRepository(session)

    async def get_logs(self, params: AuditFilterParams) -> Dict[str, Any]:
        logs, total = await self.repo.get_logs(params)
        return {
            "items": logs,
            "total": total,
            "page": params.page,
            "page_size": params.page_size,
            "pages": (total + params.page_size - 1) // params.page_size
        }

    async def get_log_by_id(self, log_id: uuid.UUID) -> Dict[str, Any]:
        log = await self.repo.get_log_by_id(log_id)
        if not log:
            return None
        return log

    async def get_statistics(self) -> Dict[str, Any]:
        return await self.repo.get_statistics()
