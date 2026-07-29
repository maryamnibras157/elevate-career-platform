from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.database import get_async_session
from app.admin.services.user import AdminUserService
from app.admin.schemas.users.users import AdminUserFilterParams
from app.admin.utils.response import success_response
from app.admin.dependencies.auth import require_permission, get_current_admin, AdminContext
from app.admin.constants.enums import Permission

router = APIRouter(prefix="/users", tags=["Admin Users"])

@router.get("", response_model=dict, dependencies=[Depends(require_permission([Permission.VIEW_USERS]))])
async def get_users(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    is_active: bool = Query(None),
    role: str = Query(None),
    is_verified: bool = Query(None),
    sort_by: str = Query(None),
    sort_order: str = Query(None),
    session: AsyncSession = Depends(get_async_session)
):
    service = AdminUserService(session)
    filters = AdminUserFilterParams(
        search=search, is_active=is_active, role=role, 
        is_verified=is_verified, sort_by=sort_by, sort_order=sort_order
    )
    result = await service.get_users(page, size, filters)
    return success_response(data=result.model_dump(), message="Users retrieved")

@router.get("/{id}", response_model=dict, dependencies=[Depends(require_permission([Permission.VIEW_USERS]))])
async def get_user_by_id(id: UUID = Path(...), session: AsyncSession = Depends(get_async_session)):
    service = AdminUserService(session)
    result = await service.get_user_by_id(id)
    return success_response(data=result.model_dump(), message="User retrieved")

@router.get("/{id}/activity", response_model=dict, dependencies=[Depends(require_permission([Permission.VIEW_USERS]))])
async def get_user_activity(id: UUID = Path(...), session: AsyncSession = Depends(get_async_session)):
    service = AdminUserService(session)
    result = await service.get_user_activity(id)
    return success_response(data=result.model_dump(), message="User activity retrieved")

@router.patch("/{id}/activate", response_model=dict, dependencies=[Depends(require_permission([Permission.UPDATE_USERS]))])
async def activate_user(
    id: UUID = Path(...), 
    session: AsyncSession = Depends(get_async_session),
    admin: AdminContext = Depends(get_current_admin)
):
    service = AdminUserService(session)
    result = await service.update_status(id, True, admin.admin_id)
    return success_response(data=result.model_dump(), message="User activated")

@router.patch("/{id}/deactivate", response_model=dict, dependencies=[Depends(require_permission([Permission.UPDATE_USERS]))])
async def deactivate_user(
    id: UUID = Path(...), 
    session: AsyncSession = Depends(get_async_session),
    admin: AdminContext = Depends(get_current_admin)
):
    service = AdminUserService(session)
    result = await service.update_status(id, False, admin.admin_id)
    return success_response(data=result.model_dump(), message="User deactivated")

@router.delete("/{id}", response_model=dict, dependencies=[Depends(require_permission([Permission.DELETE_USERS]))])
async def delete_user(
    id: UUID = Path(...), 
    session: AsyncSession = Depends(get_async_session),
    admin: AdminContext = Depends(get_current_admin)
):
    service = AdminUserService(session)
    await service.delete_user(id, admin.admin_id)
    return success_response(data=None, message="User deleted")
