from fastapi import APIRouter, Depends, Query, Path, Body
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.database import get_async_session
from app.admin.services.career import AdminCareerService
from app.admin.schemas.careers.careers import AdminCareerCreate, AdminCareerUpdate, AdminCareerFilterParams
from app.admin.utils.response import success_response
from app.admin.dependencies.auth import require_permission, get_current_admin, AdminContext
from app.admin.constants.enums import Permission

router = APIRouter(prefix="/careers", tags=["Admin Careers"])

@router.get("", response_model=dict, dependencies=[Depends(require_permission([Permission.VIEW_CAREERS]))])
async def get_careers(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    demand_level: str = Query(None),
    session: AsyncSession = Depends(get_async_session)
):
    service = AdminCareerService(session)
    filters = AdminCareerFilterParams(search=search, demand_level=demand_level)
    result = await service.get_careers(page, size, filters)
    return success_response(data=result.model_dump(), message="Careers retrieved")

@router.get("/{id}", response_model=dict, dependencies=[Depends(require_permission([Permission.VIEW_CAREERS]))])
async def get_career_by_id(id: UUID = Path(...), session: AsyncSession = Depends(get_async_session)):
    service = AdminCareerService(session)
    result = await service.get_career_by_id(id)
    return success_response(data=result.model_dump(), message="Career retrieved")

@router.post("", response_model=dict, dependencies=[Depends(require_permission([Permission.CREATE_CAREERS]))])
async def create_career(
    data: AdminCareerCreate = Body(...), 
    session: AsyncSession = Depends(get_async_session),
    admin: AdminContext = Depends(get_current_admin)
):
    service = AdminCareerService(session)
    result = await service.create_career(data, admin.admin_id)
    return success_response(data=result.model_dump(), message="Career created")

@router.put("/{id}", response_model=dict, dependencies=[Depends(require_permission([Permission.UPDATE_CAREERS]))])
async def update_career(
    id: UUID = Path(...), 
    data: AdminCareerUpdate = Body(...), 
    session: AsyncSession = Depends(get_async_session),
    admin: AdminContext = Depends(get_current_admin)
):
    service = AdminCareerService(session)
    result = await service.update_career(id, data, admin.admin_id)
    return success_response(data=result.model_dump(), message="Career updated")

@router.delete("/{id}", response_model=dict, dependencies=[Depends(require_permission([Permission.DELETE_CAREERS]))])
async def delete_career(
    id: UUID = Path(...), 
    session: AsyncSession = Depends(get_async_session),
    admin: AdminContext = Depends(get_current_admin)
):
    service = AdminCareerService(session)
    await service.delete_career(id, admin.admin_id)
    return success_response(data=None, message="Career deleted")
