from fastapi import APIRouter, Depends, Query, Path
from fastapi.responses import StreamingResponse
import io
import csv
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.database import get_async_session
from app.admin.services.resume_stats import AdminResumeStatsService
from app.admin.schemas.resume_stats.resume_stats import AdminResumeStatsFilterParams
from app.admin.utils.response import success_response
from app.admin.dependencies.auth import require_permission, get_current_admin, AdminContext
from app.admin.constants.enums import Permission

router = APIRouter(prefix="/resume-statistics", tags=["Admin Resume Stats"])

@router.get("", response_model=dict, dependencies=[Depends(require_permission([Permission.VIEW_RESUME_STATS]))])
async def get_resume_statistics(session: AsyncSession = Depends(get_async_session)):
    service = AdminResumeStatsService(session)
    result = await service.get_statistics()
    return success_response(data=result.model_dump(), message="Resume statistics retrieved")

@router.get("/analyses", response_model=dict, dependencies=[Depends(require_permission([Permission.VIEW_RESUME_STATS]))])
async def get_resume_analyses(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    min_resume_score: float = Query(None),
    min_ats_score: float = Query(None),
    session: AsyncSession = Depends(get_async_session)
):
    service = AdminResumeStatsService(session)
    filters = AdminResumeStatsFilterParams(
        search=search, min_resume_score=min_resume_score, min_ats_score=min_ats_score
    )
    result = await service.get_all_paginated(page, size, filters)
    return success_response(data=result.model_dump(), message="Resume analyses retrieved")

@router.get("/analyses/{id}", response_model=dict, dependencies=[Depends(require_permission([Permission.VIEW_RESUME_STATS]))])
async def get_resume_analysis(id: UUID = Path(...), session: AsyncSession = Depends(get_async_session)):
    service = AdminResumeStatsService(session)
    result = await service.get_by_id(id)
    return success_response(data=result.model_dump(), message="Resume analysis retrieved")

@router.delete("/analyses/{id}", response_model=dict, dependencies=[Depends(require_permission([Permission.VIEW_RESUME_STATS]))])
async def delete_resume_analysis(
    id: UUID = Path(...),
    session: AsyncSession = Depends(get_async_session),
    admin: AdminContext = Depends(get_current_admin)
):
    service = AdminResumeStatsService(session)
    await service.delete_analysis(id, admin.admin_id)
    return success_response(data=None, message="Resume analysis deleted")

@router.get("/export/csv", dependencies=[Depends(require_permission([Permission.VIEW_RESUME_STATS]))])
async def export_resume_statistics_csv(
    search: str = Query(None),
    min_resume_score: float = Query(None),
    min_ats_score: float = Query(None),
    session: AsyncSession = Depends(get_async_session),
    admin: AdminContext = Depends(get_current_admin)
):
    from app.admin.core.audit import log_admin_event
    service = AdminResumeStatsService(session)
    filters = AdminResumeStatsFilterParams(
        search=search, min_resume_score=min_resume_score, min_ats_score=min_ats_score
    )
    # Fetch all matching by using a large size limit
    result = await service.get_all_paginated(1, 10000, filters)
    
    await log_admin_event("resume_analysis_export", admin.admin_id, "SUCCESS", {"format": "csv"})
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "User Name", "User Email", "Resume Score", "ATS Score", "Created At"])
    
    for item in result.items:
        writer.writerow([
            str(item.id),
            item.user_name or "",
            item.user_email or "",
            item.resume_score or "",
            item.ats_score or "",
            item.created_at.isoformat()
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=resume_analyses.csv"}
    )
