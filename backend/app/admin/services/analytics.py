from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.admin.repositories.analytics import AdminAnalyticsRepository
from app.admin.schemas.analytics.analytics import (
    UserGrowthAnalyticsOut,
    CareerGrowthAnalyticsOut,
    ResumeTrendAnalyticsOut,
    InterviewAnalyticsOut,
    AIMentorUsageAnalyticsOut,
    AnalyticsFilterParams,
    TimeSeriesDataPoint
)
from app.admin.exceptions.admin_exceptions import AdminValidationException

class AdminAnalyticsService:
    def __init__(self, session: AsyncSession):
        self.repo = AdminAnalyticsRepository(session)

    def _validate_filters(self, filters: AnalyticsFilterParams):
        if filters.start_date and filters.end_date and filters.start_date > filters.end_date:
            raise AdminValidationException("start_date cannot be after end_date")
        if filters.period not in ["day", "week", "month"]:
            raise AdminValidationException("Invalid period. Must be day, week, or month.")
        if filters.limit > 1000 or filters.limit < 1:
            raise AdminValidationException("Limit must be between 1 and 1000.")

    async def get_user_growth(self, filters: AnalyticsFilterParams) -> UserGrowthAnalyticsOut:
        self._validate_filters(filters)
        data = await self.repo.get_user_growth(filters.start_date, filters.end_date, filters.period, filters.limit)
        
        # Calculate total
        total = sum(item["count"] for item in data)
        points = [TimeSeriesDataPoint(label=item["label"], count=item["count"]) for item in data]
        
        return UserGrowthAnalyticsOut(period=filters.period, data=points, total_new_users=total)

    async def get_career_growth(self, filters: AnalyticsFilterParams) -> CareerGrowthAnalyticsOut:
        self._validate_filters(filters)
        data = await self.repo.get_career_growth(filters.start_date, filters.end_date, filters.period, filters.limit)
        
        total = sum(item["count"] for item in data)
        points = [TimeSeriesDataPoint(label=item["label"], count=item["count"]) for item in data]
        
        return CareerGrowthAnalyticsOut(period=filters.period, data=points, total_new_careers=total)

    async def get_resume_trends(self, filters: AnalyticsFilterParams) -> ResumeTrendAnalyticsOut:
        self._validate_filters(filters)
        data = await self.repo.get_resume_trends(filters.start_date, filters.end_date, filters.period, filters.limit)
        
        uploads = data["uploads_data"]
        total = sum(item["count"] for item in uploads)
        points = [TimeSeriesDataPoint(label=item["label"], count=item["count"]) for item in uploads]
        
        return ResumeTrendAnalyticsOut(
            period=filters.period,
            uploads_data=points,
            total_uploads=total,
            average_resume_score=data["average_resume_score"],
            average_ats_score=data["average_ats_score"]
        )

    async def get_interview_analytics(self, filters: AnalyticsFilterParams) -> InterviewAnalyticsOut:
        self._validate_filters(filters)
        data = await self.repo.get_interview_analytics(filters.start_date, filters.end_date)
        return InterviewAnalyticsOut(**data)

    async def get_mentor_usage_analytics(self, filters: AnalyticsFilterParams) -> AIMentorUsageAnalyticsOut:
        self._validate_filters(filters)
        data = await self.repo.get_mentor_usage_analytics(filters.start_date, filters.end_date)
        return AIMentorUsageAnalyticsOut(**data)
