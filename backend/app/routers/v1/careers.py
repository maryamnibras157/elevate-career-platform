from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database import get_async_session
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.career import CareerResponse, SavedCareerResponse
from app.schemas.common import APIResponse
from app.services.career_service import CareerService

router = APIRouter(prefix="/careers", tags=["Careers"])

@router.get("", response_model=APIResponse[List[CareerResponse]], summary="Get all careers")
async def get_all_careers(
    q: str = None,
    session: AsyncSession = Depends(get_async_session)
):
    service = CareerService(session)
    careers = await service.get_all_careers(search_query=q)
    return APIResponse(success=True, message="Careers retrieved", data=[CareerResponse.model_validate(c) for c in careers])

@router.get("/saved", response_model=APIResponse[List[SavedCareerResponse]], summary="Get saved careers")
async def get_saved_careers(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    service = CareerService(session)
    saved = await service.get_saved_careers(current_user.id)
    return APIResponse(success=True, message="Saved careers retrieved", data=[SavedCareerResponse.model_validate(s) for s in saved])

@router.post("/{career_id}/save", response_model=APIResponse[bool], summary="Toggle saved career")
async def toggle_save_career(
    career_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    service = CareerService(session)
    status = await service.toggle_saved_career(current_user.id, career_id)
    return APIResponse(success=True, message=f"Career {'saved' if status else 'removed'}", data=status)
