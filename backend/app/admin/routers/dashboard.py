from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_session
from app.admin.schemas.dashboard.dashboard import DashboardSummaryOut
from app.admin.services.dashboard import DashboardService
from app.admin.utils.response import success_response, error_response
from app.admin.dependencies.auth import require_permission, AdminContext
from app.admin.constants.enums import Permission

router = APIRouter(prefix="/dashboard", tags=["Admin Dashboard"])

@router.get("", response_model=dict, dependencies=[Depends(require_permission([Permission.VIEW_ANALYTICS]))])
async def get_dashboard_summary(session: AsyncSession = Depends(get_async_session)):
    service = DashboardService(session)
    summary = await service.get_summary()
    return success_response(data=summary.model_dump(), message="Dashboard summary retrieved")
