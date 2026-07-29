from fastapi import APIRouter, Depends, Query, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_session
from app.admin.services.notification import AdminNotificationService
from app.admin.schemas.notification.notification import (
    NotificationCreate, NotificationUpdate, NotificationFilterParams, NotificationOut, NotificationStatisticsOut
)
from app.admin.utils.response import success_response, error_response
from app.admin.dependencies.auth import require_admin_role, get_current_admin, AdminContext
from app.admin.constants.enums import AdminRole
from typing import Optional
from datetime import datetime
import uuid

router = APIRouter(prefix="/notifications", tags=["Admin Notifications"])

@router.get("", response_model=dict, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def get_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    type: Optional[str] = None,
    priority: Optional[str] = None,
    target_audience: Optional[str] = None,
    session: AsyncSession = Depends(get_async_session),
    bg_tasks: BackgroundTasks = BackgroundTasks()
):
    service = AdminNotificationService(session, bg_tasks)
    params = NotificationFilterParams(
        page=page, page_size=page_size, search=search, status=status, 
        type=type, priority=priority, target_audience=target_audience
    )
    result = await service.get_notifications(params)
    return success_response(data=result, message="Notifications retrieved successfully")

@router.get("/stats", response_model=dict, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def get_notification_stats(
    session: AsyncSession = Depends(get_async_session),
    bg_tasks: BackgroundTasks = BackgroundTasks()
):
    service = AdminNotificationService(session, bg_tasks)
    stats = await service.get_statistics()
    return success_response(data=stats, message="Notification statistics retrieved successfully")

@router.get("/{notif_id}", response_model=dict, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def get_notification(
    notif_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
    bg_tasks: BackgroundTasks = BackgroundTasks()
):
    service = AdminNotificationService(session, bg_tasks)
    n = await service.get_notification(notif_id)
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    return success_response(data=n, message="Notification retrieved successfully")

@router.post("", response_model=dict, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def create_notification(
    payload: NotificationCreate,
    session: AsyncSession = Depends(get_async_session),
    bg_tasks: BackgroundTasks = BackgroundTasks(),
    admin: AdminContext = Depends(get_current_admin)
):
    service = AdminNotificationService(session, bg_tasks)
    n = await service.create_notification(payload, admin.admin_id)
    return success_response(data=n, message="Notification created successfully", status_code=status.HTTP_201_CREATED)

@router.put("/{notif_id}", response_model=dict, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def update_notification(
    notif_id: uuid.UUID,
    payload: NotificationUpdate,
    session: AsyncSession = Depends(get_async_session),
    bg_tasks: BackgroundTasks = BackgroundTasks(),
    admin: AdminContext = Depends(get_current_admin)
):
    service = AdminNotificationService(session, bg_tasks)
    try:
        n = await service.update_notification(notif_id, payload, admin.admin_id)
        if not n:
            raise HTTPException(status_code=404, detail="Notification not found")
        return success_response(data=n, message="Notification updated successfully")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{notif_id}", response_model=dict, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def delete_notification(
    notif_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
    bg_tasks: BackgroundTasks = BackgroundTasks(),
    admin: AdminContext = Depends(get_current_admin)
):
    service = AdminNotificationService(session, bg_tasks)
    success = await service.delete_notification(notif_id, admin.admin_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return success_response(data=None, message="Notification deleted successfully")

@router.post("/{notif_id}/publish", response_model=dict, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def publish_notification(
    notif_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
    bg_tasks: BackgroundTasks = BackgroundTasks(),
    admin: AdminContext = Depends(get_current_admin)
):
    service = AdminNotificationService(session, bg_tasks)
    n = await service.publish_notification(notif_id, admin.admin_id)
    if not n:
        raise HTTPException(status_code=400, detail="Notification not found or already published")
    return success_response(data=n, message="Notification published successfully")

@router.post("/{notif_id}/schedule", response_model=dict, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def schedule_notification(
    notif_id: uuid.UUID,
    scheduled_at: datetime,
    session: AsyncSession = Depends(get_async_session),
    bg_tasks: BackgroundTasks = BackgroundTasks(),
    admin: AdminContext = Depends(get_current_admin)
):
    service = AdminNotificationService(session, bg_tasks)
    n = await service.schedule_notification(notif_id, scheduled_at, admin.admin_id)
    if not n:
        raise HTTPException(status_code=400, detail="Notification not found or already published")
    return success_response(data=n, message="Notification scheduled successfully")

@router.post("/{notif_id}/archive", response_model=dict, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def archive_notification(
    notif_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
    bg_tasks: BackgroundTasks = BackgroundTasks(),
    admin: AdminContext = Depends(get_current_admin)
):
    service = AdminNotificationService(session, bg_tasks)
    n = await service.archive_notification(notif_id, admin.admin_id)
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    return success_response(data=n, message="Notification archived successfully")
