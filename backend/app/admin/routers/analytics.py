from fastapi import APIRouter, Depends, Query
from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_session
from app.admin.services.analytics import AdminAnalyticsService
from app.admin.schemas.analytics.analytics import AnalyticsFilterParams
from app.admin.utils.response import success_response
from app.admin.dependencies.auth import require_permission
from app.admin.constants.enums import Permission

router = APIRouter(prefix="/analytics", tags=["Admin Analytics"])

def _get_filter_params(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    period: str = Query("day"),
    limit: int = Query(100)
) -> AnalyticsFilterParams:
    return AnalyticsFilterParams(start_date=start_date, end_date=end_date, period=period, limit=limit)

@router.get("/user-growth", response_model=dict, dependencies=[Depends(require_permission([Permission.VIEW_ANALYTICS]))])
async def get_user_growth(
    filters: AnalyticsFilterParams = Depends(_get_filter_params),
    session: AsyncSession = Depends(get_async_session)
):
    service = AdminAnalyticsService(session)
    result = await service.get_user_growth(filters)
    return success_response(data=result.model_dump(), message="User growth analytics retrieved")

@router.get("/career-growth", response_model=dict, dependencies=[Depends(require_permission([Permission.VIEW_ANALYTICS]))])
async def get_career_growth(
    filters: AnalyticsFilterParams = Depends(_get_filter_params),
    session: AsyncSession = Depends(get_async_session)
):
    service = AdminAnalyticsService(session)
    result = await service.get_career_growth(filters)
    return success_response(data=result.model_dump(), message="Career growth analytics retrieved")

@router.get("/resume-trends", response_model=dict, dependencies=[Depends(require_permission([Permission.VIEW_ANALYTICS]))])
async def get_resume_trends(
    filters: AnalyticsFilterParams = Depends(_get_filter_params),
    session: AsyncSession = Depends(get_async_session)
):
    service = AdminAnalyticsService(session)
    result = await service.get_resume_trends(filters)
    return success_response(data=result.model_dump(), message="Resume trends analytics retrieved")

@router.get("/interviews", response_model=dict, dependencies=[Depends(require_permission([Permission.VIEW_ANALYTICS]))])
async def get_interview_analytics(
    filters: AnalyticsFilterParams = Depends(_get_filter_params),
    session: AsyncSession = Depends(get_async_session)
):
    service = AdminAnalyticsService(session)
    result = await service.get_interview_analytics(filters)
    return success_response(data=result.model_dump(), message="Interview analytics retrieved")

@router.get("/mentor-usage", response_model=dict, dependencies=[Depends(require_permission([Permission.VIEW_ANALYTICS]))])
async def get_mentor_usage(
    filters: AnalyticsFilterParams = Depends(_get_filter_params),
    session: AsyncSession = Depends(get_async_session)
):
    service = AdminAnalyticsService(session)
    result = await service.get_mentor_usage_analytics(filters)
    return success_response(data=result.model_dump(), message="Mentor usage analytics retrieved")
