from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.admin.repositories.resume_stats import AdminResumeStatsRepository
from app.admin.schemas.resume_stats.resume_stats import ResumeStatisticsOut, AdminResumeStatsFilterParams, AdminResumeAnalysisOut
from app.admin.exceptions.admin_exceptions import AdminValidationException
from app.admin.utils.pagination import PaginatedResponse
from app.admin.core.audit import log_admin_event

class AdminResumeStatsService:
    def __init__(self, session: AsyncSession):
        self.repo = AdminResumeStatsRepository(session)

    async def get_statistics(self) -> ResumeStatisticsOut:
        total = await self.repo.get_total_uploads()
        avg_res, avg_ats = await self.repo.get_average_scores()
        res_dist, ats_dist = await self.repo.get_score_distribution()
        skill_gap = await self.repo.get_skill_gap_frequency()
        categories = await self.repo.get_recommendation_categories()
        
        return ResumeStatisticsOut(
            total_uploads=total,
            successful_parses=total,
            failed_parses=0,
            average_resume_score=avg_res,
            average_ats_score=avg_ats,
            resume_score_distribution=res_dist,
            ats_score_distribution=ats_dist,
            skill_gap_frequency=skill_gap,
            recommendation_categories=categories
        )

    async def get_all_paginated(self, page: int, size: int, filters: AdminResumeStatsFilterParams) -> PaginatedResponse[AdminResumeAnalysisOut]:
        paginated = await self.repo.get_all_paginated(page, size, filters)
        items = [AdminResumeAnalysisOut.model_validate(c) for c in paginated.items]
        return PaginatedResponse(
            items=items,
            total=paginated.total,
            page=paginated.page,
            size=paginated.size,
            pages=paginated.pages
        )

    async def get_by_id(self, analysis_id: UUID) -> AdminResumeAnalysisOut:
        analysis = await self.repo.get_by_id(analysis_id)
        if not analysis:
            raise AdminValidationException("Resume Analysis not found", status_code=404)
        return AdminResumeAnalysisOut.model_validate(analysis)

    async def delete_analysis(self, analysis_id: UUID, admin_id: str) -> None:
        success = await self.repo.delete(analysis_id)
        if not success:
            raise AdminValidationException("Resume Analysis not found", status_code=404)
        await log_admin_event("resume_analysis_deletion", admin_id, "SUCCESS", {"analysis_id": str(analysis_id)})
