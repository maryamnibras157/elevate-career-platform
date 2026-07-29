from sqlalchemy.ext.asyncio import AsyncSession
from app.admin.repositories.dashboard import DashboardRepository
from app.admin.schemas.dashboard.dashboard import DashboardSummaryOut

class DashboardService:
    def __init__(self, session: AsyncSession):
        self.repo = DashboardRepository(session)

    async def get_summary(self) -> DashboardSummaryOut:
        return DashboardSummaryOut(
            total_users=await self.repo.get_total_users(),
            active_users=await self.repo.get_active_users(),
            total_careers=await self.repo.get_total_careers(),
            published_careers=await self.repo.get_total_careers(), # placeholder
            total_resume_uploads=await self.repo.get_total_resume_uploads(),
            total_interviews=await self.repo.get_total_interviews(),
            ai_mentor_sessions=await self.repo.get_total_mentor_sessions(),
            roadmaps_generated=await self.repo.get_total_roadmaps()
        )
