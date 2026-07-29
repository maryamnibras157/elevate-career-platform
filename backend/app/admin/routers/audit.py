from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_session
from app.admin.services.audit import AdminAuditService
from app.admin.schemas.audit.audit import AuditFilterParams
from app.admin.utils.response import success_response, error_response
from app.admin.dependencies.auth import require_admin_role, get_current_admin, AdminContext
from app.admin.constants.enums import AdminRole
from typing import Optional
import uuid
import csv
import io

router = APIRouter(prefix="/audit-logs", tags=["Admin Audit Logs"])

# Note: We do NOT use log_admin_event in these GET routes to prevent recursive audit logging

@router.get("", response_model=dict, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    action: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[uuid.UUID] = None,
    session: AsyncSession = Depends(get_async_session)
):
    service = AdminAuditService(session)
    params = AuditFilterParams(
        page=page, page_size=page_size, search=search, action=action, status=status, user_id=user_id
    )
    result = await service.get_logs(params)
    return success_response(data=result, message="Audit logs retrieved successfully")

@router.get("/stats", response_model=dict, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def get_audit_statistics(session: AsyncSession = Depends(get_async_session)):
    service = AdminAuditService(session)
    stats = await service.get_statistics()
    return success_response(data=stats, message="Audit statistics retrieved successfully")

@router.get("/export/csv", dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def export_audit_logs_csv(
    search: Optional[str] = None,
    action: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[uuid.UUID] = None,
    session: AsyncSession = Depends(get_async_session),
    admin: AdminContext = Depends(get_current_admin)
):
    service = AdminAuditService(session)
    params = AuditFilterParams(
        page=1, page_size=10000, search=search, action=action, status=status, user_id=user_id
    )
    result, _ = await service.repo.get_logs(params)
    
    # Audit log the export itself!
    from app.admin.core.audit import log_admin_event
    await log_admin_event("audit_log_export", str(admin.admin_id), "SUCCESS", {"format": "csv", "filters": {"action": action, "status": status}})
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Timestamp", "Administrator", "Email", "Action", "Resource", "Status", "IP Address"])
    
    for row in result:
        writer.writerow([
            row["created_at"].isoformat() if row["created_at"] else "",
            row["user_name"] or "",
            row["user_email"] or "",
            row["action"],
            row["resource"] or "",
            row["status"] or "",
            row["ip_address"] or ""
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit_logs_export.csv"}
    )

@router.get("/{log_id}", response_model=dict, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def get_audit_log_detail(
    log_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session)
):
    service = AdminAuditService(session)
    log = await service.get_log_by_id(log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Audit log not found")
    return success_response(data=log, message="Audit log retrieved successfully")
