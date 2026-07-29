from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_session
from app.admin.services.settings import AdminSettingsService
from app.admin.schemas.settings.settings import SystemSettingUpdateBatch, SystemInfoOut
from app.admin.utils.response import success_response
from app.admin.dependencies.auth import require_admin_role, get_current_admin, AdminContext
from app.admin.constants.enums import AdminRole
from app.admin.core.audit import log_admin_event

router = APIRouter(prefix="/settings", tags=["Admin Settings"])

# Note: We use require_admin_role instead of a granular VIEW_SETTINGS permission since it doesn't exist
# in the enums, ensuring we don't fabricate new permissions as per instructions.
@router.get("", response_model=dict, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def get_settings(session: AsyncSession = Depends(get_async_session)):
    service = AdminSettingsService(session)
    result = await service.get_all_settings()
    return success_response(data=result, message="Settings retrieved successfully")

@router.patch("", response_model=dict, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def update_settings(
    batch: SystemSettingUpdateBatch,
    session: AsyncSession = Depends(get_async_session),
    admin: AdminContext = Depends(get_current_admin)
):
    service = AdminSettingsService(session)
    await service.update_settings(batch, admin.admin_id)
    
    # Audit logging
    await log_admin_event("system_settings_updated", admin.admin_id, "SUCCESS", {"keys_updated": [s.key for s in batch.settings]})
    
    return success_response(data=None, message="Settings updated successfully")

@router.get("/system-info", response_model=dict, dependencies=[Depends(require_admin_role([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]))])
async def get_system_info(session: AsyncSession = Depends(get_async_session)):
    service = AdminSettingsService(session)
    result = await service.get_system_info()
    return success_response(data=result.model_dump(), message="System info retrieved")
