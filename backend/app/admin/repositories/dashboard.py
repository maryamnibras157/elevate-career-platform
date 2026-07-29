from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.user import User
from app.models.career import Career
from app.models.resume import ResumeAnalysis
from app.models.interview import InterviewSession
from app.models.mentor import ChatConversation
from app.models.roadmap import Roadmap

class DashboardRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_total_users(self) -> int:
        result = await self.session.execute(select(func.count()).select_from(User))
        return result.scalar() or 0

    async def get_active_users(self) -> int:
        result = await self.session.execute(select(func.count()).select_from(User).where(User.is_active == True))
        return result.scalar() or 0

    async def get_total_careers(self) -> int:
        result = await self.session.execute(select(func.count()).select_from(Career))
        return result.scalar() or 0

    async def get_total_resume_uploads(self) -> int:
        result = await self.session.execute(select(func.count()).select_from(ResumeAnalysis))
        return result.scalar() or 0

    async def get_total_interviews(self) -> int:
        result = await self.session.execute(select(func.count()).select_from(InterviewSession))
        return result.scalar() or 0

    async def get_total_mentor_sessions(self) -> int:
        result = await self.session.execute(select(func.count()).select_from(ChatConversation))
        return result.scalar() or 0

    async def get_total_roadmaps(self) -> int:
        result = await self.session.execute(select(func.count()).select_from(Roadmap))
        return result.scalar() or 0
