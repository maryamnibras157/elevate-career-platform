from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database import get_async_session
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.recommendation import SkillGapResponse
from app.schemas.common import APIResponse
from app.services.skill_gap_service import SkillGapService

router = APIRouter(prefix="/skill-gap", tags=["Skill Gap"])

@router.get("", response_model=APIResponse[List[SkillGapResponse]], summary="Get skill gaps")
async def get_skill_gaps(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    service = SkillGapService(session)
    gaps = await service.get_skill_gaps(current_user.id)
    return APIResponse(success=True, message="Skill gaps retrieved", data=[SkillGapResponse.model_validate(g) for g in gaps])

@router.post("/generate/{career_id}", response_model=APIResponse[SkillGapResponse], summary="Generate skill gap analysis")
async def generate_skill_gap(
    career_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    service = SkillGapService(session)
    gap = await service.generate_skill_gap(current_user.id, career_id)
    return APIResponse(success=True, message="Skill gap generated", data=SkillGapResponse.model_validate(gap))
