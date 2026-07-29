from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from app.database import get_async_session as get_db
from app.admin.schemas.auth import AdminContext
from app.admin.dependencies.auth import get_current_admin as get_admin_context, require_admin_role
from app.models.admin import AdminRole
from app.admin.services.report import AdminReportService
from app.admin.schemas.report.report import (
    ReportConfigCreate, ReportConfigOut, ReportHistoryOut, 
    ReportFilterParams, ExecutiveMetricsOut
)
from app.models.report import ReportCategory

router = APIRouter(prefix="/reports", tags=["Admin Reports"])

@router.get("/dashboard-stats", response_model=ExecutiveMetricsOut, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def get_executive_metrics(db: AsyncSession = Depends(get_db)):
    service = AdminReportService(db)
    return await service.get_executive_metrics()

@router.get("/configs", dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def get_report_configs(params: ReportFilterParams = Depends(), db: AsyncSession = Depends(get_db)):
    service = AdminReportService(db)
    return await service.get_report_configs(params)

@router.get("/history", dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def get_report_history(params: ReportFilterParams = Depends(), db: AsyncSession = Depends(get_db)):
    service = AdminReportService(db)
    return await service.get_report_history(params)

@router.post("/configs", response_model=ReportConfigOut, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def create_report_config(payload: ReportConfigCreate, admin: AdminContext = Depends(get_admin_context), db: AsyncSession = Depends(get_db)):
    service = AdminReportService(db)
    return await service.create_report_config(payload, admin.admin_id)

@router.get("/configs/{config_id}", response_model=ReportConfigOut, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def get_report_config(config_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    service = AdminReportService(db)
    c = await service.get_report_config(config_id)
    if not c:
        raise HTTPException(status_code=404, detail="Config not found")
    return c

@router.delete("/configs/{config_id}", dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def delete_report_config(config_id: uuid.UUID, admin: AdminContext = Depends(get_admin_context), db: AsyncSession = Depends(get_db)):
    service = AdminReportService(db)
    ok = await service.delete_report_config(config_id, admin.admin_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Config not found")
    return {"message": "Deleted"}

@router.get("/export/dynamic", dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def export_dynamic_report(
    category: ReportCategory,
    admin: AdminContext = Depends(get_admin_context), 
    db: AsyncSession = Depends(get_db)
):
    """Ad-hoc CSV generation that streams directly without saving a config"""
    service = AdminReportService(db)
    # Pass empty filters for now as ad-hoc uses all records in category
    output, count = await service.generate_csv_report(category, {})
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=export_{category.value.lower()}.csv"}
    )

@router.get("/configs/{config_id}/download", dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def download_configured_report(
    config_id: uuid.UUID, 
    admin: AdminContext = Depends(get_admin_context), 
    db: AsyncSession = Depends(get_db)
):
    """Re-runs a saved report config and streams the CSV"""
    service = AdminReportService(db)
    try:
        output, filename = await service.run_and_log_report(config_id, admin.admin_id)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate report")
