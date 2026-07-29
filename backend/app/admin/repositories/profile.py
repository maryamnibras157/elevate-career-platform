from typing import List, Tuple, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc
import uuid

from app.models.auth import Session
from app.models.audit import AuditLog
from app.admin.schemas.profile.profile import SessionFilterParams, ActivityFilterParams

class AdminProfileRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_sessions(self, user_id: uuid.UUID, params: SessionFilterParams) -> Tuple[List[Session], int]:
        stmt = select(Session).where(Session.user_id == user_id)
        count_stmt = select(func.count(Session.id)).where(Session.user_id == user_id)
        
        total = (await self.session.execute(count_stmt)).scalar_one_or_none() or 0
        
        stmt = stmt.order_by(desc(Session.created_at))
        stmt = stmt.offset((params.page - 1) * params.page_size).limit(params.page_size)
        
        result = await self.session.execute(stmt)
        return result.scalars().all(), total
        
    async def get_session(self, session_id: uuid.UUID, user_id: uuid.UUID) -> Session | None:
        stmt = select(Session).where(Session.id == session_id, Session.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def delete_session(self, session_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        session = await self.get_session(session_id, user_id)
        if not session:
            return False
        await self.session.delete(session)
        await self.session.commit()
        return True

    async def delete_other_sessions(self, current_session_id: uuid.UUID, user_id: uuid.UUID) -> int:
        stmt = select(Session).where(Session.user_id == user_id, Session.id != current_session_id)
        result = await self.session.execute(stmt)
        sessions = result.scalars().all()
        count = len(sessions)
        for s in sessions:
            await self.session.delete(s)
        await self.session.commit()
        return count

    async def get_user_activity(self, user_id: uuid.UUID, params: ActivityFilterParams) -> Tuple[List[AuditLog], int]:
        stmt = select(AuditLog).where(AuditLog.user_id == user_id)
        count_stmt = select(func.count(AuditLog.id)).where(AuditLog.user_id == user_id)
        
        if params.action:
            stmt = stmt.where(AuditLog.action == params.action)
            count_stmt = count_stmt.where(AuditLog.action == params.action)

        total = (await self.session.execute(count_stmt)).scalar_one_or_none() or 0
        
        sort_col = getattr(AuditLog, params.sort_by, AuditLog.created_at)
        if params.sort_desc:
            stmt = stmt.order_by(desc(sort_col))
        else:
            stmt = stmt.order_by(asc(sort_col))
            
        stmt = stmt.offset((params.page - 1) * params.page_size).limit(params.page_size)
        
        result = await self.session.execute(stmt)
        return result.scalars().all(), total
