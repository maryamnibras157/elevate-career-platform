from uuid import UUID
from typing import Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func, desc, asc
from app.models.user import User
from app.models.resume import ResumeAnalysis
from app.models.interview import InterviewSession
from app.models.mentor import ChatConversation
from app.models.career import SavedCareer
from app.admin.utils.pagination import PaginatedResponse, paginate
from app.admin.schemas.users.users import AdminUserFilterParams

class AdminUserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all_paginated(
        self, page: int, size: int, filters: AdminUserFilterParams
    ) -> PaginatedResponse[User]:
        stmt = select(User)
        
        if filters.search:
            stmt = stmt.where(or_(
                User.email.ilike(f"%{filters.search}%"),
                User.full_name.ilike(f"%{filters.search}%")
            ))
        if filters.is_active is not None:
            stmt = stmt.where(User.is_active == filters.is_active)
        if filters.is_verified is not None:
            stmt = stmt.where(User.is_verified == filters.is_verified)
        if filters.role:
            stmt = stmt.where(User.role == filters.role)
            
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await self.session.execute(count_stmt)).scalar() or 0
        
        # Sorting Whitelist
        sort_column_map = {
            "created_at": User.created_at,
            "full_name": User.full_name,
            "email": User.email,
            "role": User.role,
            "is_active": User.is_active
        }
        
        order_col = sort_column_map.get(filters.sort_by, User.created_at)
        if filters.sort_order == "asc":
            stmt = stmt.order_by(asc(order_col))
        else:
            stmt = stmt.order_by(desc(order_col))
            
        stmt = stmt.limit(size).offset((page - 1) * size)
        items = list((await self.session.execute(stmt)).scalars().all())
        
        return paginate(items=items, total=total, page=page, size=size)

    async def update_status(self, user: User, is_active: bool) -> User:
        user.is_active = is_active
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def delete(self, user: User) -> None:
        await self.session.delete(user)
        await self.session.commit()
        
    async def get_activity(self, user_id: UUID) -> dict:
        # Perform targeted aggregations using subqueries for efficiency
        resumes = select(func.count(ResumeAnalysis.id)).where(ResumeAnalysis.user_id == user_id).scalar_subquery()
        interviews = select(func.count(InterviewSession.id)).where(InterviewSession.user_id == user_id).scalar_subquery()
        mentors = select(func.count(ChatConversation.id)).where(ChatConversation.user_id == user_id).scalar_subquery()
        saved = select(func.count(SavedCareer.id)).where(SavedCareer.user_id == user_id).scalar_subquery()
        
        stmt = select(resumes.label('resumes'), interviews.label('interviews'), mentors.label('mentors'), saved.label('saved'))
        result = (await self.session.execute(stmt)).one_or_none()
        
        return {
            "total_resumes": result.resumes if result else 0,
            "total_interviews": result.interviews if result else 0,
            "total_mentor_sessions": result.mentors if result else 0,
            "total_saved_careers": result.saved if result else 0
        }
